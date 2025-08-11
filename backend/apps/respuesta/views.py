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
import json



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


def _as_geojson_obj(geom):
    if not geom:
        return None
    # Intenta dict primero (GEOSGeometry.json en versiones recientes puede devolver str o dict según driver)
    try:
        val = geom.json
        if isinstance(val, str):
            return json.loads(val)
        return val
    except Exception:
        try:
            s = geom.geojson  # string
            return json.loads(s)
        except Exception:
            return None

def _value_from_rc(rc):
    """ Extrae valor tipado de una fila (NO multiselect). """
    if rc.valor_fecha is not None:
        return rc.valor_fecha.isoformat()
    if rc.valor_numero is not None:
        return rc.valor_numero
    if rc.valor_booleano is not None:
        return rc.valor_booleano
    if rc.valor_opcion_id is not None:
        return rc.valor_opcion_id
    if rc.valor_geom:
        return _as_geojson_obj(rc.valor_geom)
    return rc.valor_texto

class RespuestaFormularioDetalleView(RetrieveUpdateAPIView):
    """
    Devuelve:
    {
      "id": <int>,
      "formulario": <int>,
      "valores": {
        "<campo_raiz>": <valor | [ids]>,
        "<grupo_padre>": [ { "nombre": <sub_nombre>, "tipo": <str>, "valor": <tipado|[ids]> }, ... ]
      }
    }
    """
    queryset = (
        RespuestaFormulario.objects
        .all()
        .select_related("formulario")
        .prefetch_related(
            Prefetch(
                "formulario__secciones__campos",
                # Cargamos subcampos y tipo para conocer jerarquía/orden
                queryset=None,
            ),
            Prefetch(
                "respuestas_campo",
                queryset=RespuestaCampo.objects.select_related(
                    "campo", "campo__tipo", "campo__campo_padre", "campo__seccion", "valor_opcion"
                ).order_by("id")
            ),
        )
    )

    def get(self, request, *args, **kwargs):
        resp = self.get_object()

        # ===== 1) Construir índices de estructura =====
        # campo_index: id -> { nombre, tipo, padre_id, orden }
        campo_index = {}
        # parent_ids: ids de campos que son PADRE (tienen subcampos)
        parent_ids = set()
        # group_defs: padre_id -> { nombre: <str>, subcampos: [(id, nombre, tipo, orden), ...] }
        group_defs = {}

        # Recorremos la estructura del formulario:
        for seccion in resp.formulario.secciones.all().prefetch_related("campos__subcampos", "campos__tipo"):
            for campo in seccion.campos.all().select_related("tipo", "campo_padre"):
                tipo_str = (campo.tipo.tipo or "").lower()
                padre_id = campo.campo_padre_id
                campo_index[campo.id] = {
                    "nombre": campo.nombre,
                    "tipo": tipo_str,
                    "padre_id": padre_id,
                    "orden": campo.orden,
                }
                # Si este campo tiene subcampos, es un PADRE
                if campo.subcampos.exists():
                    parent_ids.add(campo.id)
                    group_defs.setdefault(campo.id, {"nombre": campo.nombre, "subcampos": []})

        # Llenar subcampos en group_defs y ordenarlos
        for seccion in resp.formulario.secciones.all().prefetch_related("campos__tipo", "campos__campo_padre"):
            for sub in seccion.campos.all().select_related("tipo", "campo_padre"):
                if sub.campo_padre_id:
                    padre_id = sub.campo_padre_id
                    if padre_id in group_defs:
                        group_defs[padre_id]["subcampos"].append(
                            (sub.id, sub.nombre, (sub.tipo.tipo or "").lower(), sub.orden)
                        )
        for padre_id in group_defs:
            group_defs[padre_id]["subcampos"].sort(key=lambda x: x[3])  # orden

        # ===== 2) Recoger respuestas y agrupar =====
        simples = {}      # { campo_raiz_nombre: valor | [ids] }
        grupos = {}       # { grupo_nombre: { sub_nombre: valor | [ids] } }

        root_multi = {}   # { campo_raiz_nombre: [ids] }
        sub_multi = {}    # { grupo_nombre: { sub_nombre: [ids] } }

        for rc in resp.respuestas_campo.all():
            meta = campo_index.get(rc.campo_id)
            if not meta:
                continue

            c_nombre = meta["nombre"]
            c_tipo   = meta["tipo"]
            padre_id = meta["padre_id"]

            # Si este campo es un PADRE (grupo), IGNORAR cualquier valor directo (clave del bug que viste)
            if rc.campo_id in parent_ids:
                continue

            # Multiselect -> acumular ids
            if rc.valor_opcion_id:
                if padre_id is None:
                    root_multi.setdefault(c_nombre, []).append(rc.valor_opcion_id)
                else:
                    grupo_nombre = group_defs.get(padre_id, {}).get("nombre")
                    if not grupo_nombre:
                        continue
                    sub_multi.setdefault(grupo_nombre, {}).setdefault(c_nombre, []).append(rc.valor_opcion_id)
                continue

            # Valor simple tipado
            val = _value_from_rc(rc)

            if padre_id is None:
                # raíz simple: tomar el primero
                if c_nombre not in simples:
                    simples[c_nombre] = val
            else:
                grupo_nombre = group_defs.get(padre_id, {}).get("nombre")
                if not grupo_nombre:
                    continue
                grupos.setdefault(grupo_nombre, {})
                if c_nombre not in grupos[grupo_nombre]:
                    grupos[grupo_nombre][c_nombre] = val

        # Cerrar multiselect de raíces
        for nombre, ids in root_multi.items():
            simples[nombre] = ids

        # Cerrar multiselect de subcampos
        for gnombre, submap in sub_multi.items():
            grupos.setdefault(gnombre, {})
            for sub_nombre, ids in submap.items():
                grupos[gnombre][sub_nombre] = ids

        # ===== 3) Armar payload final (ordenado) =====
        valores = {**simples}
        for padre_id, info in group_defs.items():
            gnombre = info["nombre"]
            if gnombre not in grupos:
                continue
            submap = grupos[gnombre]
            arr = []
            for (sid, sname, stipo, sorden) in info["subcampos"]:
                if sname in submap:
                    arr.append({
                        "nombre": sname,
                        "tipo": stipo,
                        "valor": submap[sname],
                    })
            if arr:
                valores[gnombre] = arr

        data = {
            "id": resp.id,
            "formulario": resp.formulario_id,
            "valores": valores,
        }
        return Response(data)
  
