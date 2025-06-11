from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Formulario
from .serializers import FormularioCompletoSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView


class FormularioListCreateView(ListCreateAPIView):
    queryset = Formulario.objects.all()
    serializer_class = FormularioCompletoSerializer


class FormularioRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Formulario.objects.all()
    serializer_class = FormularioCompletoSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        campos_data = request.data.pop('campos', [])

        # Actualizar datos del formulario principal
        for attr, value in request.data.items():
            setattr(instance, attr, value)
        instance.save()

        # Borramos los campos actuales y sus opciones (puedes cambiar lógica si prefieres "merge" en vez de borrar)
        instance.campos.all().delete()

        for campo_data in campos_data:
            opciones_data = campo_data.pop('opciones', [])
            campo = instance.campos.create(**campo_data)
            for opcion_data in opciones_data:
                campo.opciones.create(**opcion_data)

        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
