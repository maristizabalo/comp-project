from rest_framework import serializers
from .models import RespuestaFormulario, RespuestaCampo
from rest_framework_gis.serializers import GeometryField
from apps.construccion_formulario.models import Campo
import pandas as pd


class RespuestaCampoSerializer(serializers.ModelSerializer):
    valor_geom = GeometryField(required=False)

    class Meta:
        model = RespuestaCampo
        fields = ['campo', 'valor_texto', 'valor_numero', 'valor_fecha', 'valor_geom', 'valor_opcion', 'valor_booleano']

class RespuestaFormularioSerializer(serializers.ModelSerializer):
    respuestas_campo = RespuestaCampoSerializer(many=True)

    class Meta:
        model = RespuestaFormulario
        fields = ['id', 'formulario', 'usuario', 'ip', 'fecha_creacion', 'respuestas_campo']
        read_only_fields = ['id', 'fecha_creacion']

    def create(self, validated_data):
        respuestas_data = validated_data.pop('respuestas_campo')
        respuesta_formulario = RespuestaFormulario.objects.create(**validated_data)
        for r_data in respuestas_data:
            RespuestaCampo.objects.create(respuesta_formulario=respuesta_formulario, **r_data)
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


