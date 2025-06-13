from apps.usuario.models import Usuario, UsuarioRol
from apps.rol.models import Rol
from apps.rol.serializers import RolSerializer
from rest_framework import serializers


class UsuarioRolSerializer(serializers.ModelSerializer):
    rol = RolSerializer()

    class Meta:
        model = UsuarioRol
        fields = ['rol']

class UsuarioListSerializer(serializers.ModelSerializer):
  
  rol = serializers.ReadOnlyField(source='rol.nombre')

  class Meta:
    model = Usuario
    fields = [ 
      "id", "nombre_completo",
      "usuario", "activo", "activo_ldap", 'rol', "correo"
    ]

class UsuarioSerializer(UsuarioListSerializer):
  
  roles = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Rol.objects.all())

  class Meta(UsuarioListSerializer.Meta):
    fields = UsuarioListSerializer.Meta.fields + [
      "roles"
    ]

    extra_kwargs = {
        'nombre_completo' : {'read_only' : True},
        'correo' : {'read_only' : True},
        'activo_ldap' : {'read_only' : True},
    }


class UsuarioCreateSerializer(UsuarioListSerializer):
    roles = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        many=True,
        write_only=True
    )

    class Meta(UsuarioListSerializer.Meta):
        fields = UsuarioListSerializer.Meta.fields + [
            "roles"
        ]

    def create(self, validated_data):
        roles = validated_data.pop("roles", [])
        request = self.context.get("request")
        ip = self.context.get("ip_user", "0.0.0.0")
        user = request.user if request else None

        usuario = Usuario.objects.create(
            **validated_data,
            usuario_creo=user.usuario if user else "anon",
            ip_creo=ip,
            usuario_modifico=user.usuario if user else "anon",
            ip_modifico=ip
        )

        for rol in roles:
            UsuarioRol.objects.create(
                usuario=usuario,
                rol=rol,
                usuario_creo=user.usuario if user else "anon",
                ip_creo=ip,
                usuario_modifico=user.usuario if user else "anon",
                ip_modifico=ip
            )

        return usuario


class UsuarioUpdateSerializer(serializers.ModelSerializer):
    roles = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        many=True,
        write_only=True
    )

    class Meta:
        model = Usuario
        fields = [
            "activo",
            "roles"
        ]

        extra_kwargs = {
            "usuario": {"read_only": True},
        }

    def update(self, instance, validated_data):
        roles = validated_data.pop("roles", None)
        ip = self.context.get("ip_user", "0.0.0.0")
        request = self.context.get("request")
        user = request.user if request else None

        # Actualiza el campo 'activo'
        instance.activo = validated_data.get("activo", instance.activo)
        instance.usuario_modifico = user.usuario if user else "anon"
        instance.ip_modifico = ip
        instance.save()

        if roles is not None:
            # Elimina roles actuales
            instance.roles_usuario.all().delete()

            # Agrega los nuevos roles
            for rol in roles:
                UsuarioRol.objects.create(
                    usuario=instance,
                    rol=rol,
                    usuario_creo=user.usuario if user else "anon",
                    ip_creo=ip,
                    usuario_modifico=user.usuario if user else "anon",
                    ip_modifico=ip
                )

        return instance



class UsuarioDetailSerializer(UsuarioListSerializer):

    roles = UsuarioRolSerializer(many=True, source="roles_usuario")

    class Meta(UsuarioListSerializer.Meta):
        fields = UsuarioListSerializer.Meta.fields + [
            "roles",
            "usuario_creo",
            "ip_creo",
            "usuario_modifico",
            "ip_modifico"
        ]


class UsuarioBasicListSerializer(serializers.ModelSerializer):

  class Meta:
    model = Usuario
    fields = [ "id", "nombre_completo", "usuario", "correo", ]