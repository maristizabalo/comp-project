from django.db import models
from apps.rol.models import Rol

# anonymous user model not stored on db
class AnonymousUser:
    id = None
    pk = None
    username = ''
    permisos = tuple()
    activo = False

    def __str__(self):
        return 'AnonymousUser'

    def __eq__(self, other):
        return isinstance(other, self.__class__)

    def __hash__(self):
        return 1  # instances always return the same hash value

    def __int__(self):
        raise TypeError('Cannot cast AnonymousUser to int. Are you trying to use it in place of User?')

    def save(self):
        raise NotImplementedError("Django doesn't provide a DB representation for AnonymousUser.")

    def delete(self):
        raise NotImplementedError("Django doesn't provide a DB representation for AnonymousUser.")

    def set_password(self, raw_password):
        raise NotImplementedError("Django doesn't provide a DB representation for AnonymousUser.")

    def check_password(self, raw_password):
        raise NotImplementedError("Django doesn't provide a DB representation for AnonymousUser.")

    def get_user_permissions(self, obj=None):
        return self.permisos

    def get_all_permissions(self, obj=None):
        return self.permisos
        # return _user_get_permissions(self, obj, 'all')

    def has_perm(self, perm, obj=None):
        return False
        # return _user_has_perm(self, perm, obj=obj)

    def has_perms(self, perm_list, obj=None):
        return all(self.has_perm(perm, obj) for perm in perm_list)

    def has_module_perms(self, module):
        return False
        # return _user_has_module_perms(self, module)

    @property
    def is_anonymous(self):
        return True

    @property
    def is_authenticated(self):
        return False

    def get_username(self):
        return self.username

# class Usuario(AbstractBaseUser, PermissionsMixin):
class Usuario(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_USUARIO')
    nombre_completo = models.CharField(max_length=2000, db_column='NOMBRE_COMPLETO')
    usuario = models.CharField(unique=True, max_length=100, db_column='USUARIO')
    activo = models.BooleanField(default=True, db_column='ACTIVO')
    activo_ldap = models.BooleanField(default=True, db_column='ACTIVO_LDAP')
    correo = models.CharField(max_length=200, unique=True, db_column='CORREO')
    
    roles = models.ManyToManyField(
        Rol,
        through='UsuarioRol',
        related_name='usuarios'  # Esto permite hacer rol.usuarios.all()
    )
    
    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')
    
    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')


    def __init__(self, *args, **kwargs):
      super(Usuario, self).__init__(*args, **kwargs)
      self.token = None
      self.permisos = []

    @property
    def is_anonymous(self):
      return False

    @property
    def is_authenticated(self):
      return True
    
    def get_full_name(self):
      return self.nombre_completo
    
    def get_short_name(self):
      return self.usuario

    class Meta:
        db_table = 'USUARIO'
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        ordering = ['usuario']

    def __str__(self) -> str:
        return f'{self.id} - {self.nombre_completo}'

class UsuarioRol(models.Model):
    id = models.BigAutoField(primary_key=True, db_column='ID_USUARIO_ROL')
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='ID_USUARIO')
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, db_column='ID_ROL')

    usuario_creo = models.CharField(max_length=100, db_column='USUARIO_CREO')
    ip_creo = models.CharField(max_length=100, db_column='IP_CREO')
    usuario_modifico = models.CharField(max_length=100, db_column='USUARIO_MODIFICO')
    ip_modifico = models.CharField(max_length=100, db_column='IP_MODIFICO')

    fecha_creacion = models.DateTimeField(auto_now_add=True, db_column='FECHA_CREACION')
    fecha_modificacion = models.DateTimeField(auto_now=True, db_column='FECHA_MODIFICACION')

    class Meta:
        db_table = 'USUARIO_ROL'
        unique_together = ('usuario', 'rol')  # Evitar duplicados

