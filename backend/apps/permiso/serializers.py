from .models import Permiso, PermisoFormulario
from rest_framework import serializers


class PermisoSerializer(serializers.ModelSerializer):

  class Meta:
    model = Permiso
    fields = ["id", "nombre"]

class PermisoFormularioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermisoFormulario
        fields = '__all__'

