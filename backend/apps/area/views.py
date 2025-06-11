from .models import Area
from .serializers import AreaSerializer
from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView 

class AreaListCreateView(ListCreateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer


class AreaRetrieveUpdateView(RetrieveUpdateAPIView):
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    lookup_field = 'pk'
