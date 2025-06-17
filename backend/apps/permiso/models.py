from django.db import models
from apps.formulario.models import Formulario

class Permiso(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_PERMISO')
    nombre = models.CharField(max_length=100, db_column='NOMBRE')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')
    
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')


    class Meta:
        db_table = 'PERMISO'
        verbose_name = "PERMISO"
        verbose_name_plural = "PERMISOS"

    def __str__(self) -> str:
        return f'id: {self.id} - {self.nombre}'

class PermisoFormulario(models.Model):
    LECTURA = 'lectura'
    ESCRITURA = 'escritura'

    TIPO_CHOICES = [
        (LECTURA, 'Lectura'),
        (ESCRITURA, 'Escritura'),
    ]

    id = models.BigAutoField(primary_key=True, db_column='ID_PERMISO_FORMULARIO')
    nombre = models.CharField(max_length=255, db_column='NOMBRE')
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES, db_column='TIPO')
    formulario = models.ForeignKey(Formulario, on_delete=models.CASCADE, db_column='ID_FORMULARIO')

    class Meta:
        db_table = 'PERMISO_FORMULARIO'