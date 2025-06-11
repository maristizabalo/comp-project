from rest_framework import serializers
from .models import Formulario
from apps.modulo.models import Modulo
from apps.modulo.serializers import ModuloLiteSerializer

class FormularioLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formulario
        fields = ['id', 'nombre']
        
class FormularioSerializer(serializers.ModelSerializer):
    modulo = ModuloLiteSerializer(read_only=True)
    modulo_id = serializers.PrimaryKeyRelatedField(
        queryset=Modulo.objects.all(), source='modulo', write_only=True
    )

    id_padre = FormularioLiteSerializer(read_only=True)
    id_padre_id = serializers.PrimaryKeyRelatedField(
        queryset=Formulario.objects.all(), source='id_padre', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Formulario
        fields = [
            'id', 'nombre', 'descripcion',
            'modulo', 'modulo_id',
            'id_padre', 'id_padre_id',
            'usuario_creo', 'ip_creo',
            'usuario_modifico', 'ip_modifico',
            'fecha_creacion', 'fecha_modificacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_modificacion']