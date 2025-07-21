from rest_framework import serializers
from .models import Area

class AreaLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = ['id', 'nombre']

class AreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Area
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion', 'fecha_modificacion']
