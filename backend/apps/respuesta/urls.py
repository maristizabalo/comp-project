from django.urls import path
from .views import RespuestaFormularioView, RespuestaFormularioDetailView, RespuestasFormularioTablaView, exportar_respuestas_excel

urlpatterns = [
    path('', RespuestaFormularioView.as_view(), name='respuesta-formulario-list-create'),
    path('<int:pk>/', RespuestaFormularioDetailView.as_view(), name='respuesta-formulario-detail'),
    path('<int:formulario_id>/tabla/', RespuestasFormularioTablaView.as_view(), name='respuestas-horizontal-json'),
    path('<int:formulario_id>/excel/', exportar_respuestas_excel, name='exportar-respuestas-excel'),
]
