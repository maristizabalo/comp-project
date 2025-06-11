from rest_framework import serializers
from .models import RespuestaFormulario, RespuestaCampo
from rest_framework_gis.serializers import GeometryField
from apps.construccion_formulario.models import Campo

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
        campos = Campo.objects.filter(formulario=obj.formulario)
        respuestas = obj.respuestas_campo.all()

        datos = {}
        for campo in campos:
            r = respuestas.filter(campo=campo).first()
            if r:
                valor = (
                    r.valor_texto or
                    r.valor_numero or
                    r.valor_fecha or
                    r.valor_opcion or
                    r.valor_booleano or
                    (r.valor_geom.wkt if r.valor_geom else None)
                )
                datos[campo.nombre] = valor
            else:
                datos[campo.nombre] = None
        return datos

