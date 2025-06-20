from .models import Rol, RolPermiso, RolPermisoFormulario
from rest_framework import serializers
from apps.permiso.models import Permiso, PermisoFormulario


class RolLiteSerializer(serializers.ModelSerializer):
    permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())
    permisos_formulario = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=PermisoFormulario.objects.all())

    class Meta:
        model = Rol
        fields = ["id", "nombre", "permisos", "permisos_formulario"]

class RolSerializer(serializers.ModelSerializer):
    permisos = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permiso.objects.all()
    )
    permisos_formulario = serializers.PrimaryKeyRelatedField(
        many=True, queryset=PermisoFormulario.objects.all()
    )

    class Meta:
        model = Rol
        fields = [
            "id",
            "nombre",
            "descripcion",
            "permisos",
            "permisos_formulario",
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
        permisos_formulario = validated_data.pop("permisos_formulario", [])

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

        # Agregar permisos normales
        for permiso in permisos:
            RolPermiso.objects.create(
                rol=rol,
                permiso=permiso,
                usuario_creo=user.usuario if user else "anon",
                ip_creo=ip,
                usuario_modifico=user.usuario if user else "anon",
                ip_modifico=ip
            )

        # Agregar permisos de formulario
        for permiso_formulario in permisos_formulario:
            RolPermisoFormulario.objects.create(
                rol=rol,
                permiso_formulario=permiso_formulario
            )

        return rol

    def update(self, instance, validated_data):
        permisos = validated_data.pop("permisos", None)
        permisos_formulario = validated_data.pop("permisos_formulario", None)

        request = self.context.get("request")
        ip = self.context.get("ip_user", "0.0.0.0")
        user = request.user if request else None

        # Actualizar campos normales
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.usuario_modifico = user.usuario if user else "anon"
        instance.ip_modifico = ip
        instance.save()

        # Actualizar permisos
        if permisos is not None:
            instance.permisos.clear()
            for permiso in permisos:
                RolPermiso.objects.create(
                    rol=instance,
                    permiso=permiso,
                    usuario_creo=user.usuario if user else "anon",
                    ip_creo=ip,
                    usuario_modifico=user.usuario if user else "anon",
                    ip_modifico=ip
                )

        # Actualizar permisos de formulario
        if permisos_formulario is not None:
            instance.permisos_formulario.clear()
            for permiso_formulario in permisos_formulario:
                RolPermisoFormulario.objects.create(
                    rol=instance,
                    permiso_formulario=permiso_formulario
                )

        return instance
    
    
class RolListSerializer(serializers.ModelSerializer):
  permisos = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permiso.objects.all())
  permisos_formulario = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=PermisoFormulario.objects.all())

  class Meta:
    model = Rol
    fields = [ "id", "nombre", "descripcion", "activo", "permisos", "permisos_formulario", "usuario_creo", 
              "usuario_modifico", "ip_creo", "ip_modifico" ]