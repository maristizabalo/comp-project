from rest_framework import serializers
from apps.formulario.models import Formulario
from .models import Campo, Opcion


# Opcion
class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = ['valor', 'etiqueta']

# Campo
class CampoSerializer(serializers.ModelSerializer):
    opciones = OpcionSerializer(many=True, required=False)

    class Meta:
        model = Campo
        fields = ['nombre', 'tipo', 'requerido', 'opciones']

    def create(self, validated_data):
        opciones_data = validated_data.pop('opciones', [])
        campo = Campo.objects.create(**validated_data)

        for opcion_data in opciones_data:
            Opcion.objects.create(campo=campo, **opcion_data)

        return campo

# Formulario
class FormularioCompletoSerializer(serializers.ModelSerializer):
    campos = CampoSerializer(many=True)

    class Meta:
        model = Formulario
        fields = [
            'id', 'nombre', 'descripcion', 'modulo',
            'id_padre', 'usuario_creo', 'ip_creo', 'usuario_modifico', 'ip_modifico',
            'campos'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        campos_data = validated_data.pop('campos')
        formulario = Formulario.objects.create(**validated_data)

        for campo_data in campos_data:
            opciones = campo_data.pop('opciones', [])
            campo = Campo.objects.create(formulario=formulario, **campo_data)
            for opcion in opciones:
                Opcion.objects.create(campo=campo, **opcion)

        return formulario
