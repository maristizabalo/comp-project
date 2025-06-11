from rest_framework.permissions import BasePermission


def check_user_permissions(permissions, user, obj=None):
    # Recuperar todos los permisos del rol del usuario
    user_permissions = user.rol.permisos.all()
    
    # Iterar sobre los permisos del usuario
    for user_perm in user_permissions:
        # Comparar el id del permiso con los valores en permissions
        if user_perm.id in permissions:
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
