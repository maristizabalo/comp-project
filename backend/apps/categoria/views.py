from .models import Categoria
from .serializers import CategoriaSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView  # O cambia el import si tu base está en otro lado

class CategoriaListCreateView(ListCreateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class CategoriaRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    lookup_field = 'pk'
