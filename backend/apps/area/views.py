from .models import Area
from .serializers import AreaSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView 
from utils.permissions import CheckPermissions 
from utils.constants import PermisoAdminEnum
from rest_framework import permissions, status
from rest_framework.response import Response
from functools import partial


class AreaListCreateView(ListCreateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.ADMIN_AREA.value]),)]
        return [permissions.AllowAny()]

    def get_user_ip(self):
        ip_user = (
            self.request.META.get("X_REAL_IP")
            or self.request.META.get("HTTP_X_REAL_IP")
            or self.request.META.get("X_FORWARDED_FOR")
            or self.request.META.get("HTTP_X_FORWARDED_FOR")
            or self.request.META.get("REMOTE_ADDR")
        )
        if ip_user in ["127.0.0.1", "localhost"]:
            ip_user = self.request.META.get("REMOTE_ADDR")
        return ip_user

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        user = request.user.usuario if hasattr(request.user, 'usuario') else str(request.user)
        ip_user = self.get_user_ip()

        data["usuario_creo"] = user
        data["ip_creo"] = ip_user
        data["usuario_modifico"] = user
        data["ip_modifico"] = ip_user

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AreaRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    lookup_field = 'pk'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [permission() for permission in (partial(CheckPermissions, [PermisoAdminEnum.ADMIN_AREA.value]),)]
        return [permissions.AllowAny()]

    def get_user_ip(self):
        ip_user = (
            self.request.META.get("X_REAL_IP")
            or self.request.META.get("HTTP_X_REAL_IP")
            or self.request.META.get("X_FORWARDED_FOR")
            or self.request.META.get("HTTP_X_FORWARDED_FOR")
            or self.request.META.get("REMOTE_ADDR")
        )
        if ip_user in ["127.0.0.1", "localhost"]:
            ip_user = self.request.META.get("REMOTE_ADDR")
        return ip_user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        user = request.user.usuario if hasattr(request.user, 'usuario') else str(request.user)
        ip_user = self.get_user_ip()

        data["usuario_modifico"] = user
        data["ip_modifico"] = ip_user

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
