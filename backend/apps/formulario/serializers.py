from rest_framework import serializers
from .models import Formulario, Seccion
from apps.categoria.models import Categoria
from apps.categoria.serializers import CategoriaLiteSerializer
from apps.permiso.models import PermisoFormulario

class FormularioLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formulario
        fields = ['id', 'nombre']
        
class FormularioSerializer(serializers.ModelSerializer):
    categoria = CategoriaLiteSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True
    )

    id_padre = FormularioLiteSerializer(read_only=True)
    id_padre_id = serializers.PrimaryKeyRelatedField(
        queryset=Formulario.objects.all(), source='id_padre', write_only=True, required=False, allow_null=True
    )
    
    def create(self, validated_data):
        # 1. Crear el formulario
        formulario = Formulario.objects.create(**validated_data)

        # 2. Crear permisos relacionados
        PermisoFormulario.objects.create(
            nombre=f"lectura_{formulario.nombre}",
            tipo=PermisoFormulario.LECTURA,
            formulario=formulario
        )
        PermisoFormulario.objects.create(
            nombre=f"escritura_{formulario.nombre}",
            tipo=PermisoFormulario.ESCRITURA,
            formulario=formulario
        )

        return formulario

    class Meta:
        model = Formulario
        fields = [
            'id', 'nombre', 'descripcion',
            'categoria', 'categoria_id',
            'id_padre', 'id_padre_id',
            'usuario_creo', 'ip_creo',
            'usuario_modifico', 'ip_modifico',
            'fecha_creacion', 'fecha_modificacion'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_modificacion']


class SeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seccion
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion', 'fecha_modificacion']
