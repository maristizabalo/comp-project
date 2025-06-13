from .models import Rol
from rest_framework import serializers
from apps.permiso.models import Permiso


class RolLiteSerializer(serializers.ModelSerializer):
    permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())

    class Meta:
        model = Rol
        fields = ["id", "nombre", "permisos"]

class RolSerializer(serializers.ModelSerializer):

  permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())

  class Meta:
    model = Rol
    fields = [ "id", "nombre", "descripcion", "permisos", "usuario_creo", 
              "usuario_modifico", "ip_creo", "ip_modifico" ]

class RolListSerializer(serializers.ModelSerializer):
  permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())

  class Meta:
    model = Rol
    fields = [ "id", "nombre", "descripcion", "permisos", "usuario_creo", 
              "usuario_modifico", "ip_creo", "ip_modifico" ]