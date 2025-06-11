from rest_framework import serializers
from .models import Categoria

class CategoriaLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']
        
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion', 'fecha_modificacion']
        
