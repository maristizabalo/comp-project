from django.urls import path
from .views import TipoListView, FormularioCrearView, FormularioRetrieveUpdateView

urlpatterns = [
    path('', FormularioCrearView.as_view(), name='formulario-create'),
    path('<int:pk>/', FormularioRetrieveUpdateView.as_view(), name='formulario-retrieve-update'),
    path('tipos/', TipoListView.as_view(), name='tipo-list'),
]

