from .models import Modulo
from .serializers import ModuloSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView
from utils.permissions import CheckPermissions 
from utils.constants import PermisoAdminEnum
from rest_framework import permissions
from functools import partial

class ModuloListCreateView(ListCreateAPIView):
    queryset = Modulo.objects.select_related('categoria').all()
    serializer_class = ModuloSerializer
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.ADMIN_MODULO.value]),)]
        return [permissions.AllowAny()]


class ModuloRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Modulo.objects.select_related('categoria').all()
    serializer_class = ModuloSerializer
    lookup_field = 'pk'
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.ADMIN_MODULO.value]),)]
        return [permissions.AllowAny()]
