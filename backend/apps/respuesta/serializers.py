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
        ]


class RespuestaFormularioSerializer(serializers.ModelSerializer):
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

        # >>>> Cambio clave: si NO hay respuesta_id => SIEMPRE crear una nueva
        if respuesta_id:
            rid = coerce_pk(respuesta_id)
            respuesta_formulario = (
                RespuestaFormulario.objects
                .select_for_update()
                .filter(pk=rid, formulario=formulario)
                .first()
            )
            if respuesta_formulario:
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
        else:
            respuesta_formulario = RespuestaFormulario.objects.create(
                formulario=formulario, usuario=usuario, ip=ip
            )

        # Upsert de respuestas de campo (igual que ya lo tenías)
        for r in respuestas_data:
            campo_id = coerce_pk(r.get("campo"))
            valor_texto = r.get("valor_texto")
            valor_numero = r.get("valor_numero")
            valor_fecha = r.get("valor_fecha")
            valor_geom = coerce_geom(r.get("valor_geom")) if r.get("valor_geom") is not None else None
            valor_booleano = r.get("valor_booleano")
            valor_opcion_id = coerce_pk(r.get("valor_opcion")) if r.get("valor_opcion") is not None else None
            valor_opciones = r.get("valor_opciones", None)

            if valor_opciones is not None:
                RespuestaCampo.objects.filter(
                    respuesta_formulario=respuesta_formulario, campo_id=campo_id
                ).delete()
                bulk = []
                for opcion in (valor_opciones or []):
                    opcion_id = coerce_pk(opcion)
                    bulk.append(
                        RespuestaCampo(
                            respuesta_formulario=respuesta_formulario,
                            campo_id=campo_id,
                            valor_opcion_id=opcion_id,
                        )
                    )
                if bulk:
                    RespuestaCampo.objects.bulk_create(bulk)
            else:
                defaults = {
                    "valor_texto": valor_texto,
                    "valor_numero": valor_numero,
                    "valor_fecha": valor_fecha,
                    "valor_geom": valor_geom,
                    "valor_booleano": valor_booleano,
                    "valor_opcion_id": valor_opcion_id,
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


