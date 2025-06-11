from django.db import models
from apps.categoria.models import Categoria  

class Modulo(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_MODULO')
    nombre = models.CharField(max_length=100, db_column='NOMBRE')
    descripcion = models.TextField(db_column='DESCRIPCION')

    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, db_column='ID_CATEGORIA', related_name='modulos')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')

    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'MODULO'
        verbose_name = "MODULO"
        verbose_name_plural = "MODULOS"

    def __str__(self):
        return f'id: {self.id} - {self.nombre}'
