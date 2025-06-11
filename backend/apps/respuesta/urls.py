from django.urls import path
from .views import RespuestaFormularioView, RespuestaFormularioDetailView

urlpatterns = [
    path('respuestas/', RespuestaFormularioView.as_view(), name='respuesta-formulario-list-create'),
    path('respuestas/<int:pk>/', RespuestaFormularioDetailView.as_view(), name='respuesta-formulario-detail'),
]
