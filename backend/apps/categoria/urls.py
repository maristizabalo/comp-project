from django.urls import path
from .views import CategoriaListCreateView, CategoriaRetrieveUpdateView

urlpatterns = [
    path('', CategoriaListCreateView.as_view(), name='categoria-list-create'),
    path('<int:pk>/', CategoriaRetrieveUpdateView.as_view(), name='categoria-detail-update'),
]
