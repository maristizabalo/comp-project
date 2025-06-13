from .models import Rol
from rest_framework import serializers
from apps.permiso.models import Permiso


class RolLiteSerializer(serializers.ModelSerializer):
    permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())

    class Meta:
        model = Rol
        fields = ["id", "nombre", "permisos"]

class RolSerializer(serializers.ModelSerializer):
    permisos = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Permiso.objects.all()
    )

    class Meta:
        model = Rol
        fields = [
            "id",
            "nombre",
            "descripcion",
            "permisos",
            "activo",
            "usuario_creo",
            "usuario_modifico",
            "ip_creo",
            "ip_modifico"
        ]
        read_only_fields = [
            "usuario_creo",
            "usuario_modifico",
            "ip_creo",
            "ip_modifico"
        ]

    def create(self, validated_data):
        permisos = validated_data.pop("permisos", [])
        request = self.context.get("request")
        ip = self.context.get("ip_user", "0.0.0.0")
        user = request.user if request else None

        rol = Rol.objects.create(
            **validated_data,
            usuario_creo=user.usuario if user else "anon",
            ip_creo=ip,
            usuario_modifico=user.usuario if user else "anon",
            ip_modifico=ip
        )

        rol.permisos.set(permisos)

        return rol

class RolListSerializer(serializers.ModelSerializer):
  permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())

  class Meta:
    model = Rol
    fields = [ "id", "nombre", "descripcion", "activo", "permisos", "usuario_creo", 
              "usuario_modifico", "ip_creo", "ip_modifico" ]