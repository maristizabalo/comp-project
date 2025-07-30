from rest_framework import status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Formulario, Tipo
from .serializers import TipoLiteSerializer, FormularioCrearSerializer, FormularioRetrieveSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView

class TipoListView(ListCreateAPIView):
    queryset = Tipo.objects.all().order_by('id')
    serializer_class = TipoLiteSerializer

class FormularioCrearView(ListCreateAPIView):
    def post(self, request, *args, **kwargs):
        serializer = FormularioCrearSerializer(data=request.data, context={
            'user': request.user,
            'ip': request.META.get('REMOTE_ADDR')
        })
        serializer.is_valid(raise_exception=True)
        formulario = serializer.save()
        return Response({"id": formulario.id}, status=status.HTTP_201_CREATED)

class FormularioRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Formulario.objects.all()
    serializer_class = FormularioRetrieveSerializer