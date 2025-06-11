from django.urls import path
from .views import CategoriaListCreateView, CategoriaRetrieveUpdateView

urlpatterns = [
    path('categorias/', CategoriaListCreateView.as_view(), name='categoria-list-create'),
    path('categorias/<int:pk>/', CategoriaRetrieveUpdateView.as_view(), name='categoria-detail-update'),
]
