from django.urls import path
from .views import FormularioListCreateView, FormularioRetrieveUpdateView

urlpatterns = [
    path('formularios/', FormularioListCreateView.as_view(), name='formulario-list-create'),
    path('formularios/<int:pk>/', FormularioRetrieveUpdateView.as_view(), name='formulario-detail-update'),
]
