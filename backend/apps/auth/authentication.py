import datetime
from uuid import uuid4
from django.core.cache import cache
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.conf import settings
from apps.usuario.models import Usuario, UsuarioRol
from apps.rol.models import Rol
from complementarios.settings.base import AUTH_TOKEN_EXPIRACY_MINUTES


AUTH_TOKEN_EXPIRACY_MINUTES = settings.AUTH_TOKEN_EXPIRACY_MINUTES

def create_or_update_custom_token(user, is_user_model=False, token=None, token_created=None):
    if not token:
        token = str(uuid4().hex)

    if not token_created:
        token_created = timezone.now().isoformat()

    if is_user_model:
        user_roles = UsuarioRol.objects.filter(usuario_id=user.id).select_related("rol")
    else:
        user_roles = user.roles_usuario.select_related("rol")

    roles_data = []
    for ur in user_roles:
        roles_data.append({
            "id": ur.rol.id,
            "nombre": ur.rol.nombre,
            "descripcion": ur.rol.descripcion,
            "activo": ur.rol.activo,
        })

    data = {
        "token_created": token_created,
        'user': {
            'id': user.pk,
            'token': token,
            'nombre_completo': user.nombre_completo,
            'usuario': user.usuario,
            'activo': user.activo,
            'activo_ldap': user.activo_ldap,
            'roles': roles_data,
        }
    }

    cache.set(token, data)

    return token, token_created, roles_data


def create_auth_user(user_token):
    user = Usuario(
        id=user_token['user']['id'],
        nombre_completo=user_token['user']['nombre_completo'],
        usuario=user_token['user']['usuario'],
        activo=user_token['user']['activo'],
        activo_ldap=user_token['user']['activo_ldap'],
    )
    user.token = user_token['user']['token']

    # En lugar de asignar a user.roles, lo guardamos como atributo temporal
    roles = Rol.objects.filter(id__in=[r['id'] for r in user_token['user']['roles']])
    user._roles_cache = roles  # propiedad temporal personalizada

    return user



class CustomAuthentication(BaseAuthentication):

  def authenticate(self, request):
    bearer_token = request.headers.get('Authorization')
    if not bearer_token or not bearer_token.startswith("Bearer "):
        return None # authentication did not succeed
    
    token = bearer_token.split(" ")[-1] # bearer token has to be "Bearer 12312"

    user_token = cache.get(token)
    if not user_token:
      raise exceptions.NotAuthenticated('Auth: El usuario no existe')
    
    user = create_auth_user(user_token)

    token_created = datetime.datetime.fromisoformat(user_token['token_created'])
    utc_now = timezone.now()

    if token_created < utc_now - datetime.timedelta(minutes=AUTH_TOKEN_EXPIRACY_MINUTES):
      raise exceptions.AuthenticationFailed('Auth: El token ha expirado')
        
    # renovar tiempo de token
    token, token_created, user_rol = create_or_update_custom_token(user, token=token)

    return (user, None) # authentication successful
