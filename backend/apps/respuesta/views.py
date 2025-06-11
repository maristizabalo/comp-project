from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView
from .models import RespuestaFormulario
from apps.construccion_formulario.models import Campo
from .serializers import RespuestaFormularioSerializer, RespuestaFormularioTablaSerializer
from django.http import HttpResponse
import pandas as pd

class RespuestaFormularioView(ListCreateAPIView):
    queryset = RespuestaFormulario.objects.all()
    serializer_class = RespuestaFormularioSerializer

class RespuestaFormularioDetailView(RetrieveUpdateAPIView):
    queryset = RespuestaFormulario.objects.all()
    serializer_class = RespuestaFormularioSerializer

class RespuestasFormularioTablaView(ListCreateAPIView):
    serializer_class = RespuestaFormularioTablaSerializer

    def get_queryset(self):
        formulario_id = self.kwargs['formulario_id']
        return RespuestaFormulario.objects.filter(formulario_id=formulario_id).prefetch_related('respuestas_campo__campo')

def exportar_respuestas_excel(request, formulario_id):
    formularios = RespuestaFormulario.objects.filter(formulario_id=formulario_id).prefetch_related('respuestas_campo__campo')
    
    if not formularios.exists():
        return HttpResponse("No hay respuestas", status=404)

    campos = Campo.objects.filter(formulario_id=formulario_id)
    data = []

    for f in formularios:
        fila = {
            "ID": f.id,
            "Usuario": f.usuario,
            "IP": f.ip,
            "Fecha": f.fecha_creacion
        }
        for campo in campos:
            r = f.respuestas_campo.filter(campo=campo).first()
            valor = (
                r.valor_texto or
                r.valor_numero or
                r.valor_fecha or
                (r.valor_geom.wkt if r and r.valor_geom else None)
            ) if r else None
            fila[campo.nombre] = valor
        data.append(fila)

    df = pd.DataFrame(data)
    response = HttpResponse(content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = f'attachment; filename="respuestas_formulario_{formulario_id}.xlsx"'
    df.to_excel(response, index=False)
    return response
