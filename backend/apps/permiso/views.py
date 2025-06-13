from .models import Permiso
from .serializers import PermisoSerializer
from utils import transactionals
from functools import partial
from utils.permissions import CheckPermissions
from rest_framework.response import Response
from rest_framework import status
from utils.constants import PermisoAdminEnum


class PermisoList(transactionals.ListCreateAPIView):
    queryset = Permiso.objects.all().order_by('id')
    serializer_class = PermisoSerializer

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

        serializer = PermisoSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PermisoDetail(transactionals.RetrieveUpdateDestroyAPIView):
    queryset = Permiso.objects.all().order_by('id')
    serializer_class = PermisoSerializer

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
