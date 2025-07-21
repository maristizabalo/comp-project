import datetime
from django.core.cache import cache
from rest_framework import exceptions, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.settings import api_settings
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from apps.auth.serializers import LoginUserSerializer
from utils import transactionals
from apps.usuario.models import Usuario
from utils.ldap import Ldap
from .authentication import create_or_update_custom_token
from apps.rol.models import Rol
from apps.rol.serializers import RolLiteSerializer


def user_credentials(token, token_date, user, roles):
  # Obtener roles
  roles = Rol.objects.filter(usuarios=user)

  # Array de ids de roles
  roles_ids = list(roles.values_list('id', flat=True))

  # Permisos y permisos_formulario de todos los roles del usuario
  permisos_ids = set()
  permisos_formulario_ids = set()

  for rol in roles.prefetch_related('permisos', 'permisos_formulario'):
      permisos_ids.update(rol.permisos.values_list('id', flat=True))
      permisos_formulario_ids.update(rol.permisos_formulario.values_list('id', flat=True))
  
  # Ordenar los arrays antes de devolverlos
  roles_ids = sorted(roles_ids)
  permisos_ids = sorted(permisos_ids)
  permisos_formulario_ids = sorted(permisos_formulario_ids)

  return Response({
      'token': token,
      'token_created': token_date,
      'user': {
          'id': user.id,
          'usuario': user.usuario,
          'roles': roles_ids,
          'permisos': permisos_ids,
          'permisos_formulario': permisos_formulario_ids,
          'nombre_completo': user.nombre_completo,
          'activo': user.activo,
          'activo_ldap': user.activo_ldap,
      }
  })

class LoginUser(transactionals.CreateAPIView):
  authentication_classes = []
  serializer_class = LoginUserSerializer
  permission_classes = [permissions.AllowAny]

  def post(self, request):
    
    # print(request.data)
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data.get('username')
    password = serializer.validated_data.get('password')

    if not username or not password:
      raise exceptions.AuthenticationFailed('Datos de autenticación incorrectos')

    # autenticar usuario usando ldap
    ldap = Ldap()
    login_res, message = ldap.login_user(username, password)
    if not login_res:
      return Response({"message": message}, status=status.HTTP_403_FORBIDDEN)

    # crear token y guardarlo para el usuario
    try:
      user = Usuario.objects.get(usuario=username)
    except Usuario.DoesNotExist:
      return Response({"message": "No se encontró el usuario en el sistema COMPLEMENTARIOS, comuniquese a mesadeayuda@dadep.gov.co"}, status=status.HTTP_403_FORBIDDEN)

    if not user.activo:
      return Response({"message": "El usuario no esta activo en el sistema"}, status=status.HTTP_403_FORBIDDEN)

    # borrar antiguo token si el usuario ya esta logueado
    prev_token = request.headers.get('Authorization')
    if prev_token:
      token_value = prev_token.split(" ")[-1] # bearer token has to be "Bearer 12312"
      prev_user_token = cache.get(token_value)
      if prev_user_token:
        cache.delete(token_value)

    # crear token y guardarlo en cache
    token, token_created, rol = create_or_update_custom_token(user, is_user_model=True)

    # retornar token y usuario
    return user_credentials(token, token_created, user, rol)


class LogoutUser(APIView):

  def get(self, request):
    if request.user:
      cache.delete(request.user.token)

      return Response({"message": "Ha cerrado sesión con exito"}, status=status.HTTP_200_OK)

    return Response({"message": "El usuario no existe"}, status=status.HTTP_400_BAD_REQUEST)


class CheckUserStatus(APIView):

  def get(self, request):
    return Response({"message": "Estado validado"})


