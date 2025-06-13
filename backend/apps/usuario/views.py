import re
from functools import partial
from django.db.models import Q
from utils.constants import PermisoAdminEnum, RolEnum
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from utils import transactionals
from apps.rol.models import Rol
from apps.usuario.models import Usuario
from apps.usuario.serializers import UsuarioBasicListSerializer, UsuarioDetailSerializer, UsuarioListSerializer, UsuarioSerializer, UsuarioCreateSerializer, UsuarioUpdateSerializer
from utils.ldap import Ldap
from utils.permissions import CheckPermissions
from rest_framework import permissions



class UsuarioActivosList(transactionals.ListAPIView):
  serializer_class = UsuarioBasicListSerializer
  queryset = Usuario.objects.filter(activo=True, activo_ldap=True).order_by('id')
  permission_classes = [permissions.AllowAny]


class UsuarioList(transactionals.ListCreateAPIView):

  serializer_class = UsuarioSerializer
  def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [partial(CheckPermissions, [PermisoAdminEnum.EDITAR_USUARIO.value])()]

  def get_serializer_class(self, *args, **kwargs):
    if self.request.method == 'GET':
      return UsuarioListSerializer
    return UsuarioSerializer
  
  def get_queryset(self):
    queryset = Usuario.objects.all().order_by('id')
    query = self.request.query_params.get('usuario')
    if query is not None:
        queryset = queryset.filter(Q(usuario__icontains=query) | Q(nombre_completo__icontains=query))
    return queryset

  @transactionals.transactional()
  def post(self, request, *args, **kwargs):
      data = request.data.copy()

      ldap = Ldap()
      result = ldap.search_exact_user(data.get('usuario'))
      if result is None:
          raise Exception("Usuario no encontrado en el directorio activo")

      data['usuario'] = result.get('usuario')
      data['correo'] = result.get('correo')
      data['nombre_completo'] = result.get('nombre_completo')
      data['activo_ldap'] = result.get('activo')

      # Capturar IP real del usuario
      ip_user = (
          request.META.get("X_REAL_IP")
          or request.META.get("HTTP_X_REAL_IP")
          or request.META.get("X_FORWARDED_FOR")
          or request.META.get("HTTP_X_FORWARDED_FOR")
          or request.META.get("REMOTE_ADDR")
      )

      if ip_user in ["127.0.0.1", "localhost"]:
          ip_user = request.META.get("REMOTE_ADDR")

      serializer = UsuarioCreateSerializer(
          data=data,
          context={"request": request, "ip_user": ip_user}
      )

      if serializer.is_valid():
          serializer.save()
          return Response(serializer.data, status=status.HTTP_201_CREATED)

      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

  
class UsuarioDetail(transactionals.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all().order_by('id')
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.EDITAR_USUARIO.value]),)]
        return [permissions.AllowAny()]

    def get_serializer_class(self, *args, **kwargs):
        if self.request.method in ['PUT', 'PATCH']:
            return UsuarioUpdateSerializer
        elif self.request.method == 'GET':
            return UsuarioDetailSerializer
        return UsuarioSerializer

    def get_serializer(self, *args, **kwargs):
        # Captura IP del usuario como en UsuarioList
        request = self.request
        ip_user = (
            request.META.get("X_REAL_IP")
            or request.META.get("HTTP_X_REAL_IP")
            or request.META.get("X_FORWARDED_FOR")
            or request.META.get("HTTP_X_FORWARDED_FOR")
            or request.META.get("REMOTE_ADDR")
        )

        if ip_user in ["127.0.0.1", "localhost"]:
            ip_user = request.META.get("REMOTE_ADDR")

        kwargs.setdefault('context', self.get_serializer_context())
        kwargs['context'].update({
            "request": request,
            "ip_user": ip_user
        })

        return super().get_serializer(*args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
      
      
class UsuarioLdapSearch(APIView):

  permission_classes = [permissions.AllowAny]
  
  def get(self, request, format=None):
    ldap = Ldap()
    busqueda_raw = self.request.query_params.get('busqueda')
    busqueda = re.sub('\W+','', busqueda_raw)

    # TODO: no traer usuarios bloqueados
    if busqueda is None:
      result = {"message": "Es necesario ingresar un término a la búsqueda"}
    elif len(busqueda) < 3:
      result = {"message": "El término de búsqueda debe tener 3 o más caracteres"}
    else:
      result = ldap.search_user(busqueda)

    return Response(result)
