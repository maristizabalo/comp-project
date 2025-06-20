from .models import Formulario
from .serializers import FormularioSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView


class FormularioListCreateView(ListCreateAPIView):
    queryset = Formulario.objects.select_related('modulo', 'id_padre').all()
    serializer_class = FormularioSerializer


class FormularioRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Formulario.objects.select_related('modulo', 'id_padre').all()
    serializer_class = FormularioSerializer
    lookup_field = 'pk'
