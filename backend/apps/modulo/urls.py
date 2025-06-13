from django.urls import path
from .views import ModuloListCreateView, ModuloRetrieveUpdateView

urlpatterns = [
    path('', ModuloListCreateView.as_view(), name='modulo-list-create'),
    path('<int:pk>/', ModuloRetrieveUpdateView.as_view(), name='modulo-detail-update'),
]
