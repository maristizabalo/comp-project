from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Formulario, Tipo
from .serializers import TipoLiteSerializer, FormularioCrearSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView

class TipoListView(ListCreateAPIView):
    queryset = Tipo.objects.all().order_by('id')
    serializer_class = TipoLiteSerializer

# class FormularioListCreateView(ListCreateAPIView):
#     queryset = Formulario.objects.all()
#     serializer_class = FormularioCompletoSerializer  # Este se usará para GET

#     def get_serializer_class(self):
#         if self.request.method == 'POST':
#             return FormularioCrearSerializer
#         return FormularioCompletoSerializer

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data, context={
#             'user': request.user,
#             'ip': request.META.get('REMOTE_ADDR')
#         })
#         serializer.is_valid(raise_exception=True)
#         formulario = serializer.save()
#         return Response({"id": formulario.id}, status=status.HTTP_201_CREATED)

# class FormularioRetrieveUpdateView(RetrieveUpdateAPIView):
#     queryset = Formulario.objects.all()
#     serializer_class = FormularioCompletoSerializer

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         campos_data = request.data.pop('campos', [])

#         # Actualizar datos del formulario principal
#         for attr, value in request.data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         # Borramos los campos actuales y sus opciones (puedes cambiar lógica si prefieres "merge" en vez de borrar)
#         instance.campos.all().delete()

#         for campo_data in campos_data:
#             opciones_data = campo_data.pop('opciones', [])
#             campo = instance.campos.create(**campo_data)
#             for opcion_data in opciones_data:
#                 campo.opciones.create(**opcion_data)

#         serializer = self.get_serializer(instance)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    
    

class FormularioCrearView(ListCreateAPIView):
    def post(self, request, *args, **kwargs):
        print("FormularioCrearView POST request data:", request.data)
        serializer = FormularioCrearSerializer(data=request.data, context={
            'user': request.user,
            'ip': request.META.get('REMOTE_ADDR')
        })
        serializer.is_valid(raise_exception=True)
        formulario = serializer.save()
        return Response({"id": formulario.id}, status=status.HTTP_201_CREATED)
