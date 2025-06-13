from apps.usuario.models import Usuario, UsuarioRol
from apps.rol.models import Rol
from rest_framework import serializers



class UsuarioRolSerializer(serializers.ModelSerializer):

  class Meta:
    model = Rol
    fields = [ "id", "nombre", "descripcion", "activo", "permisos", ]


class UsuarioListSerializer(serializers.ModelSerializer):
  
  rol = serializers.ReadOnlyField(source='rol.nombre')

  class Meta:
    model = Usuario
    fields = [ 
      "id", "nombre_completo",
      "usuario", "activo", "activo_ldap", 'rol', "correo"
    ]

class UsuarioSerializer(UsuarioListSerializer):
  
  rol = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Rol.objects.all())

  class Meta(UsuarioListSerializer.Meta):
    fields = UsuarioListSerializer.Meta.fields + [
      "rol"
    ]

    extra_kwargs = {
        'nombre_completo' : {'read_only' : True},
        'correo' : {'read_only' : True},
        'activo_ldap' : {'read_only' : True},
    }


class UsuarioCreateSerializer(UsuarioListSerializer):

    rol = serializers.PrimaryKeyRelatedField(queryset=Rol.objects.all(), write_only=True)

    class Meta(UsuarioListSerializer.Meta):
        fields = UsuarioListSerializer.Meta.fields + [
            "rol"
        ]

    def create(self, validated_data):
      rol = validated_data.pop("rol")
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

  rol = serializers.PrimaryKeyRelatedField(read_only=False, queryset=Rol.objects.all())

  class Meta:
    model = Usuario
    fields = [ 
      "activo",
      "rol"
    ]

    extra_kwargs = {
      'usuario' : {'read_only' : True},
    }


class UsuarioDetailSerializer(UsuarioListSerializer):

  rol = UsuarioRolSerializer(many=False)

  class Meta(UsuarioListSerializer.Meta):
    fields = UsuarioListSerializer.Meta.fields + [
      "rol",
      "usuario_creo",
      "ip_creo",
      "usuario_modifico",
      "ip_modifico"
    ]


class UsuarioBasicListSerializer(serializers.ModelSerializer):

  class Meta:
    model = Usuario
    fields = [ "id", "nombre_completo", "usuario", "correo", ]