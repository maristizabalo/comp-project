from rest_framework import generics
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView
from .models import RespuestaFormulario
from .serializers import RespuestaFormularioSerializer

class RespuestaFormularioView(ListCreateAPIView):
    queryset = RespuestaFormulario.objects.all()
    serializer_class = RespuestaFormularioSerializer

class RespuestaFormularioDetailView(RetrieveUpdateAPIView):
    queryset = RespuestaFormulario.objects.all()
    serializer_class = RespuestaFormularioSerializer
