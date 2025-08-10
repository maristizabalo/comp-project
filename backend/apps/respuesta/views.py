from utils.transactionals import ListCreateAPIView, RetrieveUpdateAPIView
from .models import RespuestaFormulario, RespuestaCampo
from apps.construccion_formulario.models import Campo
from .serializers import RespuestaFormularioSerializer, RespuestaFormularioTablaSerializer, RespuestaFormularioRowSerializer
from django.http import HttpResponse, HttpResponseForbidden
import pandas as pd
from rest_framework.permissions import IsAuthenticated
from utils.permissions import build_check_formulario_permiso, check_user_formulario_permiso
from utils.pagination import TablePagination
from io import BytesIO
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.db.models import Prefetch



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

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # Identidad de quien responde
        user = request.user.usuario if hasattr(request.user, "usuario") else str(request.user)
        ip_user = self.get_user_ip()

        # Enriquecer payload
        data["usuario"] = user
        data["ip"] = ip_user

        # Pasamos request al serializer (lo usamos para leer respuesta_id)
        serializer = self.get_serializer(data=data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        # El create del serializer hace upsert
        instancia = serializer.save()

        # Devolvemos el id de la respuesta para que frontend lo reuse
        response_data = self.get_serializer(instancia).data
        return Response(response_data, status=status.HTTP_201_CREATED)

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

class RespuestasFormularioPrincipalTablaView(ListCreateAPIView):
    """
    Devuelve:
    {
      "columns": [
        {"key": "id", "title": "ID"},
        {"key": "usuario", "title": "Usuario"},
        {"key": "ip", "title": "IP"},
        {"key": "fecha_creacion", "title": "Fecha creación"},
        {"key": "<nombreCampoPrincipal1>", "title": "<etiqueta campo 1>"},
        ...
      ],
      "results": [ { fila }, { fila }, ... ],
      "count": N,
      "next": url | null,
      "previous": url | null
    }
    """
    serializer_class = RespuestaFormularioRowSerializer
    permission_classes = [build_check_formulario_permiso('LECTURA')]
    pagination_class = TablePagination  # PageNumber-based

    def get_principal_campos(self, formulario_id):
        # Toma los campos principales del formulario (máx 5, ordenados)
        return list(
            Campo.objects.filter(
                seccion__formulario_id=formulario_id,
                principal=True
            )
            .select_related("tipo", "seccion")
            .order_by("orden", "id")[:5]
        )

    def get_queryset(self):
        formulario_id = self.kwargs["formulario_id"]
        principal_campos = self.get_principal_campos(formulario_id)
        principal_campo_ids = [c.id for c in principal_campos]

        # Prefetch SOLO las respuestas_campo de los campos principales,
        # junto con el campo y valor_opcion (para etiquetas)
        rc_qs = (RespuestaCampo.objects
                 .filter(campo_id__in=principal_campo_ids)
                 .select_related("campo", "valor_opcion"))

        return (RespuestaFormulario.objects
                .filter(formulario_id=formulario_id)
                .prefetch_related(Prefetch("respuestas_campo", queryset=rc_qs))
                .order_by("-fecha_creacion"))

    def list(self, request, *args, **kwargs):
        formulario_id = self.kwargs["formulario_id"]
        principal_campos = self.get_principal_campos(formulario_id)

        # columnas base
        columns = [
            {"key": "id", "title": "ID"},
            {"key": "usuario", "title": "Usuario"},
            {"key": "ip", "title": "IP"},
            {"key": "fecha_creacion", "title": "Fecha creación"},
        ]
        # columnas dinámicas por campos principales
        columns += [{"key": c.nombre, "title": c.etiqueta} for c in principal_campos]

        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={"principal_campos": principal_campos})
        paginated = self.get_paginated_response(serializer.data)

        # Inyecta columns en el payload paginado
        data = paginated.data
        data["columns"] = columns
        return Response(data)

def extract_val(rc):
    """
    Devuelve el valor *tipado* para un RespuestaCampo.
    - multi-select lo manejamos fuera (porque son varias filas)
    - geom -> GeoJSON (objeto)
    """
    if rc.valor_fecha is not None:
        return rc.valor_fecha.isoformat()
    if rc.valor_numero is not None:
        return rc.valor_numero
    if rc.valor_booleano is not None:
        return rc.valor_booleano
    if rc.valor_opcion_id is not None:
        return rc.valor_opcion_id  # simple (single select)
    if rc.valor_geom:
        try:
            return rc.valor_geom.json  # <- objeto dict (no string)
        except Exception:
            try:
                return rc.valor_geom.geojson  # fallback string (front hará JSON.parse)
            except Exception:
                return None
    return rc.valor_texto

class RespuestaFormularioDetalleView(RetrieveUpdateAPIView):
    queryset = (RespuestaFormulario.objects
        .all()
        .prefetch_related(
            Prefetch(
                'respuestas_campo',
                queryset=RespuestaCampo.objects.select_related('campo', 'campo__tipo', 'campo__campo_padre', 'valor_opcion')
            )
        ))

    def get(self, request, *args, **kwargs):
        obj = self.get_object()

        # Agrupar por campo.nombre (simples) y por padre.nombre (grupo-campos)
        simples = {}      # { campo_nombre: valor | [ids] }
        grupos = {}       # { padre_nombre: [ {nombre, tipo, valor}, ... ] }

        # Estructuras auxiliares para multi-select
        acumulador_opciones = {}  # { campo_nombre: [ids ...] }
        acumulador_sub_opciones = {}  # { padre_nombre: { sub_nombre: [ids ...] } }

        for rc in obj.respuestas_campo.all():
            campo = rc.campo
            nombre = campo.nombre
            tipo_str = (campo.tipo.tipo or "").lower()
            padre = campo.campo_padre  # None si es campo raíz

            # ¿esta fila es una opción (select)? Si hay múltiples filas para el mismo campo con valor_opcion, es multi-select
            if rc.valor_opcion_id:
                if padre is None:
                    # raíz multi-select
                    acumulador_opciones.setdefault(nombre, []).append(rc.valor_opcion_id)
                else:
                    # subcampo multi-select
                    padre_nombre = padre.nombre
                    sub_nombre = nombre
                    acumulador_sub_opciones.setdefault(padre_nombre, {}).setdefault(sub_nombre, []).append(rc.valor_opcion_id)
                continue

            # no opción: valor simple
            val = extract_val(rc)

            if padre is None:
                # campo raíz
                # si ya había algo y no es lista, respétalo (solo tomamos el primero para simples)
                simples.setdefault(nombre, val)
            else:
                # subcampo
                padre_nombre = padre.nombre
                grupos.setdefault(padre_nombre, []).append({
                    "nombre": nombre,
                    "tipo": tipo_str,
                    "valor": val,
                })

        # cierra los multi-select raíz como arrays
        for nombre, ids in acumulador_opciones.items():
            simples[nombre] = ids

        # cierra los multi-select de subcampos: crea un item por subcampo con 'valor' = array
        for padre_nombre, submap in acumulador_sub_opciones.items():
            grupos.setdefault(padre_nombre, [])
            for sub_nombre, ids in submap.items():
                # Si ya existía un item de ese subcampo (por valor simple), lo pisamos con array (preferimos arrays en multi)
                # (o podrías fusionar)
                # buscar si existe y reemplazar
                replaced = False
                for item in grupos[padre_nombre]:
                    if item["nombre"] == sub_nombre:
                        item["valor"] = ids
                        replaced = True
                        break
                if not replaced:
                    grupos[padre_nombre].append({
                        "nombre": sub_nombre,
                        "tipo": "seleccion-multiple",  # o el tipo real si lo necesitas
                        "valor": ids,
                    })

        # Combina: para el front es más simple si TODO está bajo una sola clave `valores`
        # - claves raíz -> simples[nombre]
        # - claves de grupo -> array de objetos [{nombre, tipo, valor}, ...]
        valores = {**simples, **grupos}

        data = {
            "id": obj.id,
            "formulario": obj.formulario_id,
            "valores": valores,
        }
        return Response(data)