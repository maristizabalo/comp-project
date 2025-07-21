from django.urls import path
from .views import FormularioListCreateView, FormularioRetrieveUpdateView, SeccionListCreateView, SeccionRetrieveUpdateView

urlpatterns = [
    path('', FormularioListCreateView.as_view(), name='formulario-list-create'),
    path('<int:pk>/', FormularioRetrieveUpdateView.as_view(), name='formulario-detail-update'),

    path('seccion', SeccionListCreateView.as_view(), name='seccion-list-create'),
    path('seccion/<int:pk>/', SeccionRetrieveUpdateView.as_view(), name='seccion-detail-update'),
]
