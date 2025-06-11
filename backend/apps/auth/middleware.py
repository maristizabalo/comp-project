from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
# from django.utils.functional import SimpleLazyObject
from apps.auth.authentication import create_auth_user
from apps.usuario.models import AnonymousUser



def get_user(request):
    """
    Return the user model instance associated with the given request session.
    If no user is retrieved, return an instance of AnonymousUser
    """
    user = None

    bearer_token = request.headers.get('Authorization')
    if not bearer_token or not bearer_token.startswith("Bearer "):
      return AnonymousUser()
    
    token = bearer_token.split(" ")[-1] # bearer token has to be "Bearer 12312"

    user_token = cache.get(token)
    if not user_token:
      return AnonymousUser()
    
    user = create_auth_user(user_token)
    return user


class AuthenticationMiddleware(MiddlewareMixin):
  def process_request(self, request):
    assert hasattr(request, 'session'), (
        "The Django authentication middleware requires session middleware "
        "to be installed. Edit your MIDDLEWARE setting to insert "
        "'django.contrib.sessions.middleware.SessionMiddleware' before "
        "'apps.auth.middleware.AuthenticationMiddleware'."
    )
    # request.user = SimpleLazyObject(lambda: get_user(request))
    request.user = get_user(request)

