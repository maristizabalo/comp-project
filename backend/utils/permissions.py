from rest_framework.permissions import BasePermission


def check_user_permissions(permissions, user, obj=None):
  """
  Verifica si el usuario tiene al menos uno de los permisos dados.
  :param permissions: lista de IDs de permisos requeridos
  :param user: instancia de Usuario
  :param obj: (opcional) objeto sobre el cual aplicar permisos
  :return: True si el usuario tiene al menos uno de los permisos, False si no
  """
  # Obtenemos todos los roles activos del usuario con sus permisos relacionados
  roles = user.roles.filter(activo=True).prefetch_related('permisos')
  for rol in roles:
      for permiso in rol.permisos.all():
          if permiso.id in permissions:
              return True
  return False

class CheckPermissions(BasePermission):

  def __init__(self, permissions):
    super().__init__()
    self.permissions = permissions

  def has_permission(self, request, view):
    return check_user_permissions(self.permissions, request.user)

  def has_object_permission(self, request, view, obj):
    return check_user_permissions(self.permissions, request.user, obj)
