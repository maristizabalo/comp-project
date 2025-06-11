from rest_framework import serializers
from .models import Modulo
from apps.categoria.models import Categoria

class CategoriaLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']


class ModuloSerializer(serializers.ModelSerializer):
    categoria = CategoriaLiteSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True
    )

    class Meta:
        model = Modulo
        fields = [
            'id', 'nombre', 'descripcion', 
            'categoria', 'categoria_id',
            'usuario_creo', 'ip_creo', 
            'usuario_modifico', 'ip_modifico',
            'fecha_creacion', 'fecha_modificacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_modificacion']
