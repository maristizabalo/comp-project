from django.db import models
from apps.permiso.models import Permiso

class Rol(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_ROL')
    nombre = models.CharField(unique=True, max_length=100, db_column='NOMBRE')
    descripcion = models.TextField(max_length=2000, db_column='DESCRIPCION')
    activo = models.BooleanField(default=True, db_column='ACTIVO')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')

    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')
    
    permisos = models.ManyToManyField(Permiso, through='RolPermiso')    


    class Meta:
        db_table = 'ROL'
        verbose_name = "ROL"
        verbose_name_plural = "ROLES"

    def __str__(self) -> str:
        return f'id: {self.id} - {self.nombre}'

class RolPermiso(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_ROL_PERMISO')
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, db_column='ID_ROL')
    permiso = models.ForeignKey(Permiso, on_delete=models.CASCADE, db_column='ID_PERMISO')
    
    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')

    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'ROL_PERMISO'
        verbose_name = "ROL_PERMISO"
        verbose_name_plural = "ROL_PERMISOS"

    def __str__(self) -> str:
        return f'Rol {self.rol.nombre} - Permiso {self.permiso.nombre}'