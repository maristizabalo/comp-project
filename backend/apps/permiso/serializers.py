from .models import Permiso
from rest_framework import serializers


class PermisoSerializer(serializers.ModelSerializer):

  class Meta:
    model = Permiso
    fields = ["id", "nombre"]

