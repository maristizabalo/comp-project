from rest_framework import serializers
from .models import RespuestaFormulario, RespuestaCampo
from rest_framework_gis.serializers import GeometryField
from apps.construccion_formulario.models import Campo, Opcion
import pandas as pd
from django.db import transaction
from django.contrib.gis.geos import GEOSGeometry
import json


def coerce_pk(value, model_cls=None):
    """
    Convierte value en un PK (int). Acepta:
    - int ya válido
    - str de dígitos
    - instancia del modelo (usa .pk)
    """
    if value is None:
        return None
    if hasattr(value, "pk"):
        return value.pk
    try:
        return int(value)
    except (TypeError, ValueError):
        # como fallback, si pasaron un dict con 'id'
        if isinstance(value, dict) and "id" in value:
            try:
                return int(value["id"])
            except (TypeError, ValueError):
                pass
        raise serializers.ValidationError(f"Valor de PK inválido: {value!r}")


def coerce_geom(value, srid=4326):
    """
    Soporta:
    - dict con schema ESRI-like o GeoJSON:
        { "type": "point"|"Point", "coordinates": [lon,lat] }
        { "type": "polyline"|"LineString", "coordinates": [[lon,lat], ...] }
        { "type": "polygon"|"Polygon", "coordinates": [[[lon,lat], ...], ...] }
    - string WKT/GeoJSON
    - GEOSGeometry
    Devuelve GEOSGeometry con SRID.
    """
    if value in (None, "", {}):
        return None
    if isinstance(value, GEOSGeometry):
        if value.srid is None:
            value.srid = srid
        return value

    # Dict → normaliza tipo
    if isinstance(value, dict):
        data = dict(value)
        t_raw = (data.get("type") or "").strip()
        t_lower = t_raw.lower()

        # Normalización ESRI → GeoJSON
        if t_lower == "point":
            # Espera [lon, lat]
            coords = data.get("coordinates")
            if not (isinstance(coords, (list, tuple)) and len(coords) == 2):
                raise serializers.ValidationError("Point: 'coordinates' debe ser [lon, lat].")
            lon, lat = coords
            geom = GEOSPoint(float(lon), float(lat), srid=srid)
            return geom

        if t_lower in ("polyline", "linestring"):
            coords = data.get("coordinates")
            if not (isinstance(coords, (list, tuple)) and len(coords) >= 2):
                raise serializers.ValidationError("LineString: 'coordinates' debe ser [[lon,lat], ...].")
            try:
                # GEOSGeometry desde GeoJSON ya se encarga, pero validamos shape
                gj = {"type": "LineString", "coordinates": coords}
                geom = GEOSGeometry(json.dumps(gj), srid=srid)
                return geom
            except Exception as e:
                raise serializers.ValidationError(f"LineString inválido: {e}")

        if t_lower == "polygon":
            coords = data.get("coordinates")
            # Polygon en GeoJSON: array de anillos => [[[lon,lat],...], [hole...], ...]
            if not (isinstance(coords, (list, tuple)) and len(coords) >= 1 and isinstance(coords[0], (list, tuple))):
                # si recibes un solo anillo como [[lon,lat], ...] lo envolvemos
                if isinstance(coords, (list, tuple)) and coords and isinstance(coords[0], (list, tuple)) and isinstance(coords[0][0], (int, float)):
                    coords = [coords]  # wrap a un anillo
                else:
                    raise serializers.ValidationError("Polygon: 'coordinates' debe ser [[[lon,lat],...], ...].")
            try:
                gj = {"type": "Polygon", "coordinates": coords}
                geom = GEOSGeometry(json.dumps(gj), srid=srid)
                return geom
            except Exception as e:
                raise serializers.ValidationError(f"Polygon inválido: {e}")

        # Si ya viene en GeoJSON estándar, lo intentamos directo
        if t_lower in ("multipolygon", "multilinestring", "geometrycollection"):
            try:
                geom = GEOSGeometry(json.dumps({
                    "type": t_raw[0].upper() + t_raw[1:],  # respeta mayúsculas
                    "coordinates": data.get("coordinates")
                }), srid=srid)
                return geom
            except Exception as e:
                raise serializers.ValidationError(f"GeoJSON inválido: {e}")

        # Fallback genérico: intentar como GeoJSON
        try:
            # Ajusta capitalización por si mandaron "point", "polygon", etc.
            data["type"] = t_raw[:1].upper() + t_raw[1:].lower()
            geom = GEOSGeometry(json.dumps(data), srid=srid)
            return geom
        except Exception as e:
            raise serializers.ValidationError(f"Geometría inválida: {e}")

    # String → intentar WKT o GeoJSON
    if isinstance(value, str):
        try:
            geom = GEOSGeometry(value, srid=srid)
            return geom
        except Exception:
            try:
                geom = GEOSGeometry(json.dumps(json.loads(value)), srid=srid)
                return geom
            except Exception as e:
                raise serializers.ValidationError(f"Geometría inválida: {e}")

    raise serializers.ValidationError("Tipo de geometría no soportado")

class RespuestaCampoSerializer(serializers.ModelSerializer):
    # DECLARAR valor_opciones para que NO se pierda al validar
    valor_opciones = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_null=True,
        write_only=True,
    )

    class Meta:
        model = RespuestaCampo
        fields = [
            "campo",
            "valor_texto",
            "valor_numero",
            "valor_fecha",
            "valor_geom",
            "valor_booleano",
            "valor_opcion",
            "valor_opciones",
        ]


class RespuestaFormularioSerializer(serializers.ModelSerializer):
    respuestas_campo = RespuestaCampoSerializer(many=True, write_only=True)

    class Meta:
        model = RespuestaFormulario
        fields = ["id", "formulario", "usuario", "ip", "fecha_creacion", "respuestas_campo"]
        read_only_fields = ["id", "fecha_creacion"]

    # ----------------- Helpers -----------------
    def _expand_item_to_rows(self, item):
        """
        Convierte un item del payload en una o varias filas RespuestaCampo (diccionarios).
        Soporta:
          - {"campo": <id>, "valor_texto"/"valor_numero"/"valor_fecha"/"valor_booleano": ...}
          - {"campo": <id>, "valor_opcion": <id>}               # select única
          - {"campo": <id>, "valor_opciones": [<id>, ...]}       # select múltiple
          - {"campo": <id>, "valor_geom": GeoJSON|WKT|GEOS}      # geometrías
        Retorna: [ { "campo_id": ..., "valor_texto": ..., "valor_numero": ..., "valor_fecha": ..., "valor_booleano": ..., "valor_opcion_id": ..., valor_geom": GEOSGeometry|None } ]
        Solo define la columna que corresponda; el resto va en None.
        """
        campo_id = coerce_pk(item.get("campo"))
        if not campo_id:
            raise serializers.ValidationError("Cada respuesta debe incluir 'campo'.")

        rows = []
        # Múltiple selección
        if "valor_opciones" in item and item["valor_opciones"] is not None:
            for oid in item["valor_opciones"]:
                rows.append({"campo_id": campo_id, "valor_opcion_id": coerce_pk(oid, Opcion)})
            return rows

        # Selección única
        if "valor_opcion" in item and item["valor_opcion"] is not None:
            rows.append({"campo_id": campo_id, "valor_opcion_id": coerce_pk(item["valor_opcion"], Opcion)})
            return rows

        # Geometría
        if "valor_geom" in item and item["valor_geom"] is not None:
            rows.append({"campo_id": campo_id, "valor_geom": coerce_geom(item["valor_geom"])})
            return rows

        # Valor tipado
        r = {"campo_id": campo_id}
        if item.get("valor_booleano", None) is not None:
            r["valor_booleano"] = item["valor_booleano"]
        elif item.get("valor_numero", None) is not None:
            r["valor_numero"] = item["valor_numero"]
        elif item.get("valor_fecha", None) is not None:
            r["valor_fecha"] = item["valor_fecha"]
        else:
            # default a texto (incluye None)
            r["valor_texto"] = item.get("valor_texto")
        rows.append(r)
        return rows

    def _replace_all_campos(self, instance, items):
        # Construir filas
        rows = []
        for it in (items or []):
            rows.extend(self._expand_item_to_rows(it))

        # Reemplazo atómico
        with transaction.atomic():
            RespuestaCampo.objects.filter(respuesta_formulario=instance).delete()
            objs = [RespuestaCampo(respuesta_formulario=instance, **row) for row in rows]
            if objs:
                RespuestaCampo.objects.bulk_create(objs, batch_size=500)
        return instance

    # ----------------- Create / Update -----------------
    @transaction.atomic
    def create(self, validated_data):
        """
        POST:
        - Si viene respuesta_id en request.data → actualiza (replace-all) esa respuesta (compatibilidad hacia atrás).
        - Si no viene → crea una nueva RespuestaFormulario y sus RespuestaCampo.
        """
        request = self.context.get("request")
        respuesta_id = request.data.get("respuesta_id") if request and hasattr(request, "data") else None

        respuestas_data = validated_data.pop("respuestas_campo", [])
        if respuesta_id:
            # Modo actualización vía POST (legacy): reemplazar todo
            try:
                instance = RespuestaFormulario.objects.get(pk=coerce_pk(respuesta_id, RespuestaFormulario))
            except RespuestaFormulario.DoesNotExist:
                raise serializers.ValidationError("respuesta_id no existe")
            # Actualizar encabezado si viene 'formulario', 'usuario', 'ip'
            for k, v in validated_data.items():
                setattr(instance, k, v)
            instance.save()
            return self._replace_all_campos(instance, respuestas_data)

        # Modo creación normal
        instance = RespuestaFormulario.objects.create(**validated_data)
        return self._replace_all_campos(instance, respuestas_data)

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        PUT/PATCH:
        - Reemplaza todos los RespuestaCampo con lo enviado.
        - Si 'respuestas_campo' no viene en PATCH, solo actualiza encabezado.
        """
        respuestas_data = validated_data.pop("respuestas_campo", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()

        if respuestas_data is not None:
            self._replace_all_campos(instance, respuestas_data)
        return instance
    respuestas_campo = RespuestaCampoSerializer(many=True, write_only=True)

    class Meta:
        model = RespuestaFormulario
        fields = ["id", "formulario", "usuario", "ip", "fecha_creacion", "respuestas_campo"]
        read_only_fields = ["id", "fecha_creacion"]

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get("request")
        respuesta_id = request.data.get("respuesta_id") if request else None

        respuestas_data = validated_data.pop("respuestas_campo", [])
        formulario = validated_data.get("formulario")
        usuario = validated_data.get("usuario")
        ip = validated_data.get("ip")

        # Upsert de RespuestaFormulario
        if respuesta_id:
            rid = coerce_pk(respuesta_id)
            respuesta_formulario = (
                RespuestaFormulario.objects
                .select_for_update()
                .filter(pk=rid, formulario=formulario)
                .first()
            ) or RespuestaFormulario.objects.create(
                formulario=formulario, usuario=usuario, ip=ip
            )
            cambios = []
            if respuesta_formulario.usuario != usuario:
                respuesta_formulario.usuario = usuario; cambios.append("usuario")
            if respuesta_formulario.ip != ip:
                respuesta_formulario.ip = ip; cambios.append("ip")
            if cambios:
                respuesta_formulario.save(update_fields=cambios)
        else:
            respuesta_formulario = RespuestaFormulario.objects.create(
                formulario=formulario, usuario=usuario, ip=ip
            )

        # AGRUPA por campo_id (por si repites el mismo campo varias veces)
        groups = {}
        for r in respuestas_data:
            campo_id = coerce_pk(r.get("campo"))
            groups.setdefault(campo_id, []).append(r)

        # Procesa cada grupo/campo
        for campo_id, items in groups.items():
            # ¿Alguna entrada trae valor_opciones? → selección múltiple
            has_multi = any("valor_opciones" in i and i["valor_opciones"] is not None for i in items)
            if has_multi:
                # reemplaza completamente las filas de ese campo
                RespuestaCampo.objects.filter(
                    respuesta_formulario=respuesta_formulario, campo_id=campo_id
                ).delete()

                bulk = []
                for i in items:
                    for opcion in (i.get("valor_opciones") or []):
                        bulk.append(
                            RespuestaCampo(
                                respuesta_formulario=respuesta_formulario,
                                campo_id=campo_id,
                                valor_opcion_id=coerce_pk(opcion),
                            )
                        )
                if bulk:
                    RespuestaCampo.objects.bulk_create(bulk)
                continue

            # Si hay múltiples entradas simples para el mismo campo → bulk (reemplazo total)
            if len(items) > 1:
                RespuestaCampo.objects.filter(
                    respuesta_formulario=respuesta_formulario, campo_id=campo_id
                ).delete()
                bulk = []
                for i in items:
                    bulk.append(
                        RespuestaCampo(
                            respuesta_formulario=respuesta_formulario,
                            campo_id=campo_id,
                            valor_texto=i.get("valor_texto"),
                            valor_numero=i.get("valor_numero"),
                            valor_fecha=i.get("valor_fecha"),
                            valor_geom=coerce_geom(i.get("valor_geom")) if i.get("valor_geom") is not None else None,
                            valor_booleano=i.get("valor_booleano"),
                            valor_opcion_id=coerce_pk(i.get("valor_opcion")) if i.get("valor_opcion") is not None else None,
                        )
                    )
                if bulk:
                    RespuestaCampo.objects.bulk_create(bulk)
                continue

            # Solo una entrada para el campo → update_or_create
            i = items[0]
            defaults = {
                "valor_texto": i.get("valor_texto"),
                "valor_numero": i.get("valor_numero"),
                "valor_fecha": i.get("valor_fecha"),
                "valor_geom": coerce_geom(i.get("valor_geom")) if i.get("valor_geom") is not None else None,
                "valor_booleano": i.get("valor_booleano"),
                "valor_opcion_id": coerce_pk(i.get("valor_opcion")) if i.get("valor_opcion") is not None else None,
            }
            RespuestaCampo.objects.update_or_create(
                respuesta_formulario=respuesta_formulario,
                campo_id=campo_id,
                defaults=defaults,
            )

        return respuesta_formulario



class RespuestaFormularioTablaSerializer(serializers.ModelSerializer):
    datos = serializers.SerializerMethodField()

    class Meta:
        model = RespuestaFormulario
        fields = ['id', 'usuario', 'ip', 'fecha_creacion', 'datos']

    

    def get_datos(self, obj):
        # 1. Obtener todos los datos planos de respuestas relacionadas al formulario
        qs = obj.respuestas_campo.select_related(
            'campo', 'valor_opcion'
        ).values(
            'respuesta_formulario_id',
            'campo__nombre',
            'valor_opcion__etiqueta',
            'valor_texto',
            'valor_numero',
            'valor_fecha',
            'valor_booleano',
            'valor_geom',
        )

        df = pd.DataFrame(list(qs))

        if df.empty:
            return {}

        # 2. Convertir geometrías a texto (si aplica)
        if 'valor_geom' in df.columns:
            df['valor_geom'] = df['valor_geom'].apply(lambda x: x.wkt if x else None)

        # 3. Combinar los posibles valores en una única columna "valor"
        df['valor'] = df['valor_opcion__etiqueta'].fillna(df['valor_geom']) \
            .fillna(df['valor_texto']) \
            .fillna(df['valor_numero']) \
            .fillna(df['valor_fecha']) \
            .fillna(df['valor_booleano'])

        # 4. Hacer un pivot para que las columnas sean los nombres de campos
        pivot_df = df.pivot_table(
            index='respuesta_formulario_id',  # agrupamos por ID de la respuesta
            columns='campo__nombre',
            values='valor',
            aggfunc='first'  # asumimos un valor por campo
        )

        # 5. Convertir la fila a diccionario
        resultado = pivot_df.to_dict(orient='index')

        # 6. Como es una sola respuesta, devolvemos la primera (por ID)
        return list(resultado.values())[0] if resultado else {}


def format_val(rc: RespuestaCampo):
    """
    Devuelve una representación legible del valor de un RespuestaCampo.
    - opción -> etiqueta
    - geom -> WKT corto
    - texto/numero/fecha/booleano -> su valor
    """
    if rc.valor_opcion_id:
        return getattr(rc.valor_opcion, "etiqueta", None) or getattr(rc.valor_opcion, "valor", None)

    if rc.valor_geom:
        try:
            # WKT compacto: 'POINT(...)', 'LINESTRING(...)', 'POLYGON(...)'
            return rc.valor_geom.wkt
        except Exception:
            return None

    if rc.valor_texto not in (None, ""):
        return rc.valor_texto
    if rc.valor_numero is not None:
        return rc.valor_numero
    if rc.valor_fecha is not None:
        # ISO (yyyy-mm-dd)
        return rc.valor_fecha.isoformat()
    if rc.valor_booleano is not None:
        return "Sí" if rc.valor_booleano else "No"
    return None


class RespuestaFormularioRowSerializer(serializers.ModelSerializer):
    """
    Serializa UNA respuesta como una fila de tabla con solo los campos principales.
    Las columnas dinámicas (campos principales) vienen en context['principal_campos'].
    """
    class Meta:
        model = RespuestaFormulario
        fields = ["id", "usuario", "ip", "fecha_creacion"]  # los “fijos” de la fila

    def to_representation(self, obj):
        rep = super().to_representation(obj)
        principal_campos = self.context.get("principal_campos", [])
        # Mapa: nombre_campo -> [valores...]
        per_field_values = {c.nombre: [] for c in principal_campos}

        # Solo se prefetch-aron los principales (ver la vista)
        for rc in obj.respuestas_campo.all():
            nombre = getattr(rc.campo, "nombre", None)
            if not nombre or nombre not in per_field_values:
                continue
            val = format_val(rc)
            if val is not None:
                per_field_values[nombre].append(val)

        # Aplana valores (si hay múltiples, únelos con ' • ')
        for c in principal_campos:
            nombre = c.nombre
            vals = per_field_values.get(nombre, [])
            if not vals:
                rep[nombre] = None
            else:
                # Si todos son números, puedes dejar lista/número; aquí lo unimos como string amigable
                rep[nombre] = " • ".join(map(str, vals))

        return rep