from .models import Rol, RolPermiso
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

        for permiso in permisos:
            RolPermiso.objects.create(
                rol=rol,
                permiso=permiso,
                usuario_creo=user.usuario if user else "anon",
                ip_creo=ip,
                usuario_modifico=user.usuario if user else "anon",
                ip_modifico=ip
            )

        return rol

    def update(self, instance, validated_data):
        permisos = validated_data.pop("permisos", None)
        request = self.context.get("request")
        ip = self.context.get("ip_user", "0.0.0.0")
        user = request.user if request else None

        # Actualizar los campos del rol
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.usuario_modifico = user.usuario if user else "anon"
        instance.ip_modifico = ip
        instance.save()

        if permisos is not None:
            # Limpiar los permisos actuales
            instance.permisos.clear()

            # Agregar los nuevos permisos con datos de auditoría
            for permiso in permisos:
                RolPermiso.objects.create(
                    rol=instance,
                    permiso=permiso,
                    usuario_creo=user.usuario if user else "anon",
                    ip_creo=ip,
                    usuario_modifico=user.usuario if user else "anon",
                    ip_modifico=ip
                )

        return instance

class RolListSerializer(serializers.ModelSerializer):
  permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())

  class Meta:
    model = Rol
    fields = [ "id", "nombre", "descripcion", "activo", "permisos", "usuario_creo", 
              "usuario_modifico", "ip_creo", "ip_modifico" ]