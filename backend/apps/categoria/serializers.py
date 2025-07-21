from rest_framework import serializers
from .models import Categoria
from apps.area.serializers import AreaLiteSerializer

class CategoriaLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']
        
class CategoriaSerializer(serializers.ModelSerializer):
    # Solo para lectura (GET)
    area = AreaLiteSerializer(read_only=True)
    # Solo para escritura (POST/PUT)
    area_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria._meta.get_field('area').related_model.objects.all(),
        source='area',
        write_only=True
    )

    class Meta:
        model = Categoria
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion', 'fecha_modificacion']
        
