from django.db import models
from apps.categoria.models import Categoria

class Formulario(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_FORMULARIO')
    nombre = models.CharField(max_length=100, unique=True, db_column='NOMBRE')
    descripcion = models.TextField(db_column='DESCRIPCION')

    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, db_column='ID_CATEGORIA', related_name='formularios')

    id_padre = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='ID_PADRE',
        related_name='subformularios'
    )

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')

    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'FORMULARIO'
        verbose_name = "FORMULARIO"
        verbose_name_plural = "FORMULARIOS"

    def __str__(self):
        return f'id: {self.id} - {self.nombre}'

class Seccion(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_SECCION')
    nombre = models.CharField(max_length=100, db_column='NOMBRE')
    descripcion = models.TextField(db_column='DESCRIPCION', blank=True, null=True)
    orden = models.PositiveIntegerField(default=0, db_column='ORDEN')

    formulario = models.ForeignKey(Formulario, on_delete=models.CASCADE, db_column='ID_FORMULARIO', related_name='secciones')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')

    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'SECCION'
        verbose_name = "SECCION"
        verbose_name_plural = "SECCIONES"
        ordering = ['orden']

    def __str__(self):
        return f'id: {self.id} - {self.nombre}'
