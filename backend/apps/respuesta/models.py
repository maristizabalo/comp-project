from django.contrib.gis.db import models
from apps.formulario.models import Formulario
from apps.construccion_formulario.models import Campo, Opcion

class RespuestaFormulario(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_RESPUESTA')
    formulario = models.ForeignKey(Formulario, on_delete=models.CASCADE, related_name='respuestas', db_column='ID_FORMULARIO')
    usuario = models.CharField(max_length=100, db_column='USUARIO')
    ip = models.CharField(max_length=100, db_column='IP')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')

    class Meta:
        db_table = 'RESPUESTA_FORMULARIO'

class RespuestaCampo(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_RESPUESTA_CAMPO')
    respuesta_formulario = models.ForeignKey(RespuestaFormulario, on_delete=models.CASCADE, related_name='respuestas_campo', db_column='ID_RESPUESTA_FORMULARIO')
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE, db_column='ID_CAMPO')
    valor_texto = models.TextField(null=True, blank=True, db_column='VALOR_TEXTO')
    valor_numero = models.FloatField(null=True, blank=True, db_column='VALOR_NUMERO')
    valor_fecha = models.DateField(null=True, blank=True, db_column='VALOR_FECHA')
    valor_geom = models.GeometryField(null=True, blank=True)  # Punto, línea o polígono
    valor_booleano = models.BooleanField(null=True, blank=True, db_column='VALOR_BOOLEANO')
    valor_opcion = models.ForeignKey(
        Opcion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='VALOR_OPCION'
    )

    class Meta:
        db_table = 'RESPUESTA_CAMPO'
