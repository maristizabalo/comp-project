import re
from functools import partial
from django.db.models import Q
from utils.utils.constants import PermisoEnum, RolEnum
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from utils import transactionals
from apps.rol.models import Rol
from apps.usuario.models import Usuario
from apps.usuario.serializers import UsuarioBasicListSerializer, UsuarioDetailSerializer, UsuarioListSerializer, UsuarioSerializer, UsuarioCreateSerializer, UsuarioUpdateSerializer
from utils.utils.ldap import Ldap
from utils.permissions import CheckPermissions


class UsuarioActivosList(transactionals.ListAPIView):
  serializer_class = UsuarioBasicListSerializer
  queryset = Usuario.objects.filter(activo=True, activo_ldap=True)
  permission_classes = (partial(CheckPermissions, [PermisoEnum.ADMIN_USUARIOS.value]),)


class UsuarioList(transactionals.ListCreateAPIView):

  serializer_class = UsuarioSerializer
  permission_classes = (partial(CheckPermissions, [PermisoEnum.ADMIN_USUARIOS.value]),)

  def get_serializer_class(self, *args, **kwargs):
    if self.request.method == 'GET':
      return UsuarioListSerializer
    return UsuarioSerializer
  
  def get_queryset(self):
    queryset = Usuario.objects.all()
    query = self.request.query_params.get('usuario')
    if query is not None:
        queryset = queryset.filter(Q(usuario__icontains=query) | Q(nombre_completo__icontains=query))
    return queryset

  @transactionals.transactional()
  def post(self, request, *args, **kwargs):
    data = request.data.copy()
    ldap = Ldap()
    result = ldap.search_exact_user(data.get('usuario'))
    if result == None:
      raise Exception("Usuario no encontrado en el directorio activo")

    data['usuario'] = result.get('usuario')
    data['correo'] = result.get('correo')
    data['nombre_completo'] = result.get('nombre_completo')
    data['activo_ldap'] = result.get('activo')

    
    serializer = UsuarioCreateSerializer(data=data)
    if serializer.is_valid():
      serializer.save()
      
      return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
class UsuarioDetail(transactionals.RetrieveUpdateDestroyAPIView):
  queryset = Usuario.objects.all()
  serializer_class = UsuarioSerializer
  
  def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoEnum.ADMIN_USUARIOS.value]),)]
        return [permission() for permission in (partial(CheckPermissions, [PermisoEnum.ADMIN_USUARIOS.value]),)]

  def get_serializer_class(self, *args, **kwargs):
    if self.request.method in ['PUT', 'PATCH']:
      return UsuarioUpdateSerializer
    elif self.request.method == 'GET':
      return UsuarioDetailSerializer
    return UsuarioSerializer

  def put(self, request, *args, **kwargs):
    return self.update(request, *args, **kwargs)

  def patch(self, request, *args, **kwargs):
    return self.partial_update(request, *args, **kwargs)

class UsuarioLdapSearch(APIView):

  permission_classes = (partial(CheckPermissions, [PermisoEnum.ADMIN_USUARIOS.value]),)

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
