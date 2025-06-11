from rest_framework import exceptions, status
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
  response = exception_handler(exc, context)

  # add the HTTP status code to the response.
  if isinstance(exc, (exceptions.AuthenticationFailed, exceptions.NotAuthenticated)):
    response.status_code = status.HTTP_401_UNAUTHORIZED

  return response
