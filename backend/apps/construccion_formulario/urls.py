from django.urls import path
from .views import FormularioListCreateView, FormularioRetrieveUpdateView, TipoListView

urlpatterns = [
    path('', FormularioListCreateView.as_view(), name='formulario-list-create'),
    path('<int:pk>/', FormularioRetrieveUpdateView.as_view(), name='formulario-retrieve-update'),
    path('tipos/', TipoListView.as_view(), name='tipo-list'),
]
