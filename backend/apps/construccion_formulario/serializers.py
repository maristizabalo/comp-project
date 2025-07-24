from rest_framework import serializers
from django.db import transaction
from apps.construccion_formulario.models import Formulario, Seccion, Campo, Opcion, Tipo
from apps.permiso.models import PermisoFormulario
from apps.modulo.models import Modulo

#tipo
class TipoLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo
        fields = ['id', 'tipo', 'nombre', 'descripcion']

class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = ['valor']


class SubCampoSerializer(serializers.Serializer):
    tipo = serializers.CharField()
    etiqueta = serializers.CharField()

class CampoSerializer(serializers.ModelSerializer):
    opciones = OpcionSerializer(many=True, required=False)
    subcampos = SubCampoSerializer(many=True, required=False)  

    class Meta:
        model = Campo
        fields = [
            'nombre', 'tipo', 'obligatorio', 'principal',
            'opciones', 'subcampos'                    
        ]


class SeccionCrearSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    descripcion = serializers.CharField(required=False, allow_blank=True)
    orden = serializers.IntegerField()
    campos = CampoSerializer(many=True)


class FormularioCrearSerializer(serializers.Serializer):
    titulo = serializers.CharField()
    descripcion = serializers.CharField(required=False, allow_blank=True)
    secciones = SeccionCrearSerializer(many=True)
    modulo_id = serializers.IntegerField()

    def create(self, validated_data):
        user = self.context.get('user')
        ip = self.context.get('ip')
        modulo_id = validated_data['modulo_id']
        modulo_instance = Modulo.objects.get(pk=modulo_id)

        with transaction.atomic():
            formulario = Formulario.objects.create(
                nombre=validated_data['titulo'],
                descripcion=validated_data.get('descripcion', ''),
                usuario_creo=user.usuario,
                modulo=modulo_instance,
                ip_creo=ip,
                usuario_modifico=user.usuario,
                ip_modifico=ip
            )

            for seccion_data in validated_data['secciones']:
                campos_data = seccion_data.pop('campos', [])

                seccion = Seccion.objects.create(
                    nombre=seccion_data['nombre'],
                    descripcion=seccion_data.get('descripcion', ''),
                    orden=seccion_data.get('orden', 0),
                    formulario=formulario,
                    usuario_creo=user.usuario,
                    ip_creo=ip,
                    usuario_modifico=user.usuario,
                    ip_modifico=ip
                )

                for campo_data in campos_data:
                    opciones_data = campo_data.pop('opciones', [])
                    subcampos_data = campo_data.pop('subcampos', [])

                    campo = Campo.objects.create(
                        seccion=seccion,
                        usuario_creo=user.usuario,
                        ip_creo=ip,
                        usuario_modifico=user.usuario,
                        ip_modifico=ip,
                        **campo_data
                    )

                    # Crear opciones si las hay
                    for opcion_data in opciones_data:
                        Opcion.objects.create(campo=campo, **opcion_data)
                    

                    # Crear subcampos si los hay
                    for subcampo_data in subcampos_data:
                        tipo_nombre = subcampo_data.get("tipo")  # texto, numero, booleano, etc.
                        tipo_obj = Tipo.objects.filter(tipo=tipo_nombre).first()

                        if tipo_obj:
                            Campo.objects.create(
                                nombre=subcampo_data.get('etiqueta'),  # Puedes usar 'etiqueta' como nombre también
                                etiqueta=subcampo_data.get('etiqueta'),
                                tipo=tipo_obj,
                                obligatorio=False,
                                principal=False,
                                orden=0,
                                seccion=seccion,
                                campo_padre=campo,
                                usuario_creo=user.usuario,
                                ip_creo=ip,
                                usuario_modifico=user.usuario,
                                ip_modifico=ip
                            )

            # Crear permisos del formulario
            for tipo_permiso in ['LECTURA', 'ESCRITURA', 'REPORTE']:
                PermisoFormulario.objects.create(
                    nombre=f"{formulario.nombre}-{tipo_permiso}",
                    tipo=tipo_permiso,
                    formulario=formulario
                )

        return formulario
