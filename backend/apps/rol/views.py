from .models import Rol
from .serializers import RolSerializer, RolListSerializer
from utils import transactionals
from utils.constants import PermisoAdminEnum
from functools import partial
from utils.permissions import CheckPermissions
from rest_framework.response import Response
from rest_framework import status



class RolList(transactionals.ListCreateAPIView):
  serializer_class = RolListSerializer

  def get_queryset(self):
    queryset = Rol.objects.all().order_by('id')
    
    return queryset
  
  def get_permissions(self):
    """
    Instantiates and returns the list of permissions that this view requires.
    """
    if self.request.method == 'POST':
        return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.CREAR_ROL.value]),)]
    return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.OBTENER_ROL.value]),)]
  
  @transactionals.transactional()
  def post(self, request, *args, **kwargs):
    data = request.data.copy()
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
    
    serializer = RolSerializer(
      data=data,
      context={"request": request, "ip_user": ip_user}
    )
    
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RolDetail(transactionals.RetrieveUpdateDestroyAPIView):
  queryset = Rol.objects.all().order_by('id')
  serializer_class = RolSerializer

  def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method in ['PUT', 'PATCH']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.EDITAR_ROL.value]),)]
        return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.OBTENER_ROL.value]),)]

  def put(self, request, *args, **kwargs):
    return self.update(request, *args, **kwargs)

  def patch(self, request, *args, **kwargs):
    return self.partial_update(request, *args, **kwargs)

