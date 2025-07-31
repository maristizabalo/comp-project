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

class SubCampoSerializer(serializers.Serializer):
    tipo = serializers.CharField()
    etiqueta = serializers.CharField()

# class FormularioCrearSerializer(serializers.Serializer):
#     titulo = serializers.CharField()
#     descripcion = serializers.CharField(required=False, allow_blank=True)
#     secciones = SeccionCrearSerializer(many=True)
#     modulo_id = serializers.IntegerField()

#     def create(self, validated_data):
#         user = self.context.get('user')
#         ip = self.context.get('ip')
#         modulo_id = validated_data['modulo_id']
#         modulo_instance = Modulo.objects.get(pk=modulo_id)

#         with transaction.atomic():
#             formulario = Formulario.objects.create(
#                 nombre=validated_data['titulo'],
#                 descripcion=validated_data.get('descripcion', ''),
#                 usuario_creo=user.usuario,
#                 modulo=modulo_instance,
#                 ip_creo=ip,
#                 usuario_modifico=user.usuario,
#                 ip_modifico=ip
#             )

#             for seccion_data in validated_data['secciones']:
#                 campos_data = seccion_data.pop('campos', [])

#                 seccion = Seccion.objects.create(
#                     nombre=seccion_data['nombre'],
#                     descripcion=seccion_data.get('descripcion', ''),
#                     orden=seccion_data.get('orden', 0),
#                     formulario=formulario,
#                     usuario_creo=user.usuario,
#                     ip_creo=ip,
#                     usuario_modifico=user.usuario,
#                     ip_modifico=ip
#                 )

#                 for campo_data in campos_data:
#                     opciones_data = campo_data.pop('opciones', [])
#                     subcampos_data = campo_data.pop('subcampos', [])

#                     campo = Campo.objects.create(
#                         seccion=seccion,
#                         usuario_creo=user.usuario,
#                         ip_creo=ip,
#                         usuario_modifico=user.usuario,
#                         ip_modifico=ip,
#                         **campo_data
#                     )

#                     # Crear opciones si las hay
#                     for opcion_data in opciones_data:
#                         Opcion.objects.create(campo=campo, **opcion_data)
                    

#                     # Crear subcampos si los hay
#                     for subcampo_data in subcampos_data:
#                         tipo_nombre = subcampo_data.get("tipo")  # texto, numero, booleano, etc.
#                         tipo_obj = Tipo.objects.filter(tipo=tipo_nombre).first()

#                         if tipo_obj:
#                             Campo.objects.create(
#                                 nombre=subcampo_data.get('etiqueta'),  # Puedes usar 'etiqueta' como nombre también
#                                 etiqueta=subcampo_data.get('etiqueta'),
#                                 tipo=tipo_obj,
#                                 obligatorio=False,
#                                 principal=False,
#                                 orden=0,
#                                 seccion=seccion,
#                                 campo_padre=campo,
#                                 usuario_creo=user.usuario,
#                                 ip_creo=ip,
#                                 usuario_modifico=user.usuario,
#                                 ip_modifico=ip
#                             )

#             # Crear permisos del formulario
#             for tipo_permiso in ['LECTURA', 'ESCRITURA', 'REPORTE']:
#                 PermisoFormulario.objects.create(
#                     nombre=f"{formulario.nombre}-{tipo_permiso}",
#                     tipo=tipo_permiso,
#                     formulario=formulario
#                 )

#         return formulario

# --- SERIALIZERS PARA CREACIÓN --- #
class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = ['valor']

class CampoSerializer(serializers.ModelSerializer):
    opciones = OpcionSerializer(many=True, required=False)
    subcampos = serializers.ListField(child=serializers.DictField(), required=False)

    class Meta:
        model = Campo
        fields = ['nombre', 'etiqueta', 'tipo', 'obligatorio', 'principal', 'opciones', 'subcampos']

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
        modulo_id = validated_data.pop('modulo_id')
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

                campo_orden = 1  # contador para los campos

                for campo_data in campos_data:
                    opciones_data = campo_data.pop('opciones', [])
                    subcampos_data = campo_data.pop('subcampos', [])

                    campo = Campo.objects.create(
                        seccion=seccion,
                        orden=campo_orden,
                        usuario_creo=user.usuario,
                        ip_creo=ip,
                        usuario_modifico=user.usuario,
                        ip_modifico=ip,
                        **campo_data
                    )
                    campo_orden += 1

                    for opcion_data in opciones_data:
                        Opcion.objects.create(campo=campo, **opcion_data)

                    subcampo_orden = 1  # contador para los subcampos

                    for subcampo_data in subcampos_data:
                        tipo_nombre = subcampo_data.get("tipo")
                        tipo_obj = Tipo.objects.filter(tipo=tipo_nombre).first()

                        if tipo_obj:
                            Campo.objects.create(
                                nombre=subcampo_data.get('etiqueta'),
                                etiqueta=subcampo_data.get('etiqueta'),
                                tipo=tipo_obj,
                                obligatorio=False,
                                principal=False,
                                orden=subcampo_orden,
                                seccion=seccion,
                                campo_padre=campo,
                                usuario_creo=user.usuario,
                                ip_creo=ip,
                                usuario_modifico=user.usuario,
                                ip_modifico=ip
                            )
                            subcampo_orden += 1

            for tipo_permiso in ['LECTURA', 'ESCRITURA', 'REPORTE']:
                PermisoFormulario.objects.create(
                    nombre=f"{formulario.nombre}-{tipo_permiso}",
                    tipo=tipo_permiso,
                    formulario=formulario
                )

        return formulario

# --- SERIALIZERS PARA CONSULTA (GET) --- #


class SubCampoRetrieveSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='tipo.tipo')

    class Meta:
        model = Campo
        fields = ['id', 'etiqueta', 'tipo']

class OpcionRetrieveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = ['id', 'valor']

class CampoRetrieveSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='tipo.tipo')
    opciones = OpcionRetrieveSerializer(many=True, read_only=True)
    subcampos = serializers.SerializerMethodField()

    class Meta:
        model = Campo
        fields = ['id', 'nombre', 'etiqueta', 'tipo', 'obligatorio', 'principal', 'opciones', 'subcampos', 'orden']

    def get_subcampos(self, obj):
        subcampos = obj.subcampos.all()
        if not subcampos:
            return None
        return {
            "campo_padre": obj.id,
            "campos": CampoRetrieveSerializer(subcampos, many=True).data
        }

class SubcampoGroupSerializer(serializers.Serializer):
    campo_padre = serializers.IntegerField()
    campos = CampoRetrieveSerializer(many=True)

class SeccionRetrieveSerializer(serializers.ModelSerializer):
    campos = CampoRetrieveSerializer(many=True, read_only=True)

    class Meta:
        model = Seccion
        fields = ['id', 'nombre', 'orden', 'descripcion', 'campos']

class FormularioRetrieveSerializer(serializers.ModelSerializer):
    secciones = SeccionRetrieveSerializer(many=True, read_only=True)
    modulo = serializers.CharField(source='modulo.nombre')

    class Meta:
        model = Formulario
        fields = ['id', 'nombre', 'descripcion', 'modulo', 'secciones']