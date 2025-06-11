from django.urls import path
from .views import ModuloListCreateView, ModuloRetrieveUpdateView

urlpatterns = [
    path('modulos/', ModuloListCreateView.as_view(), name='modulo-list-create'),
    path('modulos/<int:pk>/', ModuloRetrieveUpdateView.as_view(), name='modulo-detail-update'),
]
