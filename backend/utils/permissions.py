from rest_framework.permissions import BasePermission

from apps.permiso.models import PermisoFormulario
from apps.rol.models import RolPermisoFormulario


def check_user_formulario_permiso(user, formulario_id, tipo_permiso):
    """
    Verifica si el usuario tiene permiso de tipo (lectura/escritura) sobre un formulario específico.

    :param user: Usuario
    :param formulario_id: ID del formulario
    :param tipo_permiso: 'lectura' o 'escritura'
    :return: True o False
    """
    roles_activos = user.roles.filter(activo=True).values_list('id', flat=True)

    return RolPermisoFormulario.objects.filter(
        rol_id__in=roles_activos,
        permiso_formulario__formulario_id=formulario_id,
        permiso_formulario__tipo=tipo_permiso
    ).exists()

def build_check_formulario_permiso(tipo_permiso):
    class _CheckFormularioPermission(BasePermission):
        def has_permission(self, request, view):
            formulario_id = view.kwargs.get('formulario_id') or view.kwargs.get('pk')

            if not formulario_id and request.method in ['POST', 'PUT', 'PATCH']:
                formulario_id = request.data.get('formulario')

            print(f"Validando permiso '{tipo_permiso}' para el formulario ID: {formulario_id}")
            
            if not formulario_id:
                return False

            return check_user_formulario_permiso(request.user, formulario_id, tipo_permiso)
    
    return _CheckFormularioPermission
  
  
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

