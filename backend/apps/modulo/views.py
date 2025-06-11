from .models import Modulo
from .serializers import ModuloSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView  # O tu base view donde tengas las transactionals

class ModuloListCreateView(ListCreateAPIView):
    queryset = Modulo.objects.select_related('categoria').all()
    serializer_class = ModuloSerializer


class ModuloRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Modulo.objects.select_related('categoria').all()
    serializer_class = ModuloSerializer
    lookup_field = 'pk'
