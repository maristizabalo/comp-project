from .models import Area
from .serializers import AreaSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView 
from utils.permissions import CheckPermissions 
from utils.constants import PermisoAdminEnum
from rest_framework import permissions
from functools import partial


class AreaListCreateView(ListCreateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer

    def get_permissions(self):
        if self.request.method in ['POST']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.ADMIN_AREA.value]),)]
        return [permissions.AllowAny()]


class AreaRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.ADMIN_AREA.value]),)]
        return [permissions.AllowAny()]
