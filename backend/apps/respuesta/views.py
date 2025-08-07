from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView
from .models import RespuestaFormulario, RespuestaCampo
from apps.construccion_formulario.models import Campo
from .serializers import RespuestaFormularioSerializer, RespuestaFormularioTablaSerializer
from django.http import HttpResponse, HttpResponseForbidden
import pandas as pd
from rest_framework.permissions import IsAuthenticated
from utils.permissions import build_check_formulario_permiso, check_user_formulario_permiso
from io import BytesIO
from rest_framework.response import Response
from rest_framework import status



class RespuestaFormularioView(ListCreateAPIView):
    queryset = RespuestaFormulario.objects.all()
    serializer_class = RespuestaFormularioSerializer
    # permission_classes = [IsAuthenticated, build_check_formulario_permiso('ESCRITURA')]

    def get_user_ip(self):
        ip_user = (
            self.request.META.get("X_REAL_IP")
            or self.request.META.get("HTTP_X_REAL_IP")
            or self.request.META.get("X_FORWARDED_FOR")
            or self.request.META.get("HTTP_X_FORWARDED_FOR")
            or self.request.META.get("REMOTE_ADDR")
        )
        if ip_user in ["127.0.0.1", "localhost"]:
            ip_user = self.request.META.get("REMOTE_ADDR")
        return ip_user

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        user = request.user.usuario if hasattr(request.user, 'usuario') else str(request.user)
        ip_user = self.get_user_ip()

        data["usuario"] = user
        data["ip"] = ip_user

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RespuestaFormularioDetailView(RetrieveUpdateAPIView):
    queryset = RespuestaFormulario.objects.all()
    serializer_class = RespuestaFormularioSerializer

class RespuestasFormularioTablaView(ListCreateAPIView):
    serializer_class = RespuestaFormularioTablaSerializer
    permission_classes = [build_check_formulario_permiso('LECTURA')]

    def get_queryset(self):
        formulario_id = self.kwargs['formulario_id']
        return RespuestaFormulario.objects.filter(formulario_id=formulario_id).prefetch_related('respuestas_campo__campo')



def exportar_respuestas_excel(request, formulario_id):
    if not check_user_formulario_permiso(request.user, formulario_id, 'LECTURA'):
        return HttpResponseForbidden("No tienes permiso para exportar este formulario.")

    # Obtener los datos en bruto directamente desde el modelo
    respuestas_qs = RespuestaCampo.objects.filter(
        respuesta_formulario__formulario_id=formulario_id
    ).select_related('campo', 'valor_opcion', 'respuesta_formulario')

    if not respuestas_qs.exists():
        return HttpResponse("No hay respuestas", status=404)

    # Convertir queryset en DataFrame
    data = respuestas_qs.values(
        'respuesta_formulario_id',
        'respuesta_formulario__usuario',
        'respuesta_formulario__fecha_creacion',
        'campo__nombre',
        'valor_opcion__etiqueta',
        'valor_geom',
        'valor_texto',
        'valor_numero',
        'valor_fecha',
        'valor_booleano',
    )
    df = pd.DataFrame(data)

    if df.empty:
        return HttpResponse("No hay respuestas válidas", status=404)

    # Convertir geometrías a texto (si aplica)
    if 'valor_geom' in df.columns:
        df['valor_geom'] = df['valor_geom'].apply(lambda x: x.wkt if x else None)

    # Fusionar todos los posibles valores en una columna 'valor'
    df['valor'] = df['valor_opcion__etiqueta'].fillna(df['valor_geom']) \
        .fillna(df['valor_texto']) \
        .fillna(df['valor_numero']) \
        .fillna(df['valor_fecha']) \
        .fillna(df['valor_booleano'])

    # Pivotear para tener columnas por cada campo
    tabla = df.pivot_table(
        index=['respuesta_formulario_id', 'respuesta_formulario__usuario', 'respuesta_formulario__fecha_creacion'],
        columns='campo__nombre',
        values='valor',
        aggfunc='first'
    ).reset_index()

    # Renombrar columnas si se desea
    tabla = tabla.rename(columns={
        'respuesta_formulario_id': 'ID',
        'respuesta_formulario__usuario': 'Usuario',
        'respuesta_formulario__fecha_creacion': 'Fecha'
    })

    # Eliminar zona horaria si la columna 'Fecha' tiene datetime
    if 'Fecha' in tabla.columns:
        tabla['Fecha'] = pd.to_datetime(tabla['Fecha']).dt.tz_localize(None)

    # Generar Excel en memoria
    output = BytesIO()
    tabla.to_excel(output, index=False)
    output.seek(0)

    response = HttpResponse(output, content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = f'attachment; filename="respuestas_formulario_{formulario_id}.xlsx"'
    return response
