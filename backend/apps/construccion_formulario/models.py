from django.db import models
from apps.formulario.models import Formulario
from apps.formulario.models import Seccion

class Tipo(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_TIPO')
    tipo = models.CharField(max_length=50, db_column='TIPO')  # ej: 'text', 'number', 'select'
    nombre = models.CharField(max_length=100, db_column='NOMBRE')
    descripcion = models.TextField(db_column='DESCRIPCION')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'TIPO'
        verbose_name = "TIPO"
        verbose_name_plural = "TIPOS"

    def __str__(self):
        return f'{self.nombre} ({self.tipo})'


class Campo(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_CAMPO')
    nombre = models.CharField(max_length=100, db_column='NOMBRE')
    etiqueta = models.CharField(max_length=100, db_column='ETIQUETA')  # lo que ve el usuario
    obligatorio = models.BooleanField(default=False, db_column='OBLIGATORIO')
    orden = models.PositiveIntegerField(default=0, db_column='ORDEN')
    principal = models.BooleanField(default=False, db_column='PRINCIPAL')  # si es principal se mostrara en la tabla principal de respuestas del formulario

    tipo = models.ForeignKey(Tipo, on_delete=models.PROTECT, db_column='ID_TIPO', related_name='campos')
    seccion = models.ForeignKey(Seccion, on_delete=models.CASCADE, db_column='ID_SECCION', related_name='campos')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'CAMPO'
        verbose_name = "CAMPO"
        verbose_name_plural = "CAMPOS"

    def __str__(self):
        return f'{self.etiqueta}'


class Opcion(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_OPCION')
    campo = models.ForeignKey(Campo, on_delete=models.CASCADE, db_column='ID_CAMPO', related_name='opciones')
    valor = models.CharField(max_length=255, db_column='VALOR')
    etiqueta = models.CharField(max_length=255, db_column='ETIQUETA')  # lo que ve el usuario

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'OPCION'
        verbose_name = "OPCION"
        verbose_name_plural = "OPCIONES"

    def __str__(self):
        return f'{self.etiqueta}'
