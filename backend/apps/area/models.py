from django.db import models

class Area(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_AREA')
    nombre = models.CharField(max_length=100, db_column='NOMBRE')
    siglas = models.CharField(max_length=20, db_column='SIGLAS')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')

    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'AREA'
        verbose_name = "AREA"
        verbose_name_plural = "AREAS"

    def __str__(self) -> str:
        return f'id: {self.id} - {self.nombre}'
