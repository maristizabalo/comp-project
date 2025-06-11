from django.db import IntegrityError, transaction
from rest_framework.response import Response
from rest_framework import status, mixins
from rest_framework.generics import GenericAPIView


ERROR_TRANSACTION_MESSAGE = "¡La transacción ha fallado!"
ERROR_GENERAL_MESSAGE = "¡Ha ocurrido un error en la operación!"
ERROR_STATUS_CODE = status.HTTP_500_INTERNAL_SERVER_ERROR
LOG_ERROR = True


def transactional(error_log=LOG_ERROR):
  def create_transaction(function):
    def wrapper(*args, **kwargs):

      try:
        with transaction.atomic():
          return function(*args, **kwargs)

      except IntegrityError as err:
        print(err)

        if error_log:
          return Response({'message': ERROR_TRANSACTION_MESSAGE, 'error': str(err)}, status=ERROR_STATUS_CODE)
        else:
          return Response({'message': ERROR_TRANSACTION_MESSAGE}, status=ERROR_STATUS_CODE)
        
      except Exception as err:
        print(err)
        if error_log:
          return Response({'message': ERROR_GENERAL_MESSAGE, 'error': str(err)}, status=ERROR_STATUS_CODE)
        else:
          return Response({'message': ERROR_GENERAL_MESSAGE}, status=ERROR_STATUS_CODE)

    return wrapper
  
  return create_transaction


class CreateAPIView(mixins.CreateModelMixin,
                    GenericAPIView):
    """
    Concrete view for creating a model instance.
    """
    @transactional()
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class ListAPIView(mixins.ListModelMixin,
                  GenericAPIView):
    """
    Concrete view for listing a queryset.
    """
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class RetrieveAPIView(mixins.RetrieveModelMixin,
                      GenericAPIView):
    """
    Concrete view for retrieving a model instance.
    """
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class DestroyAPIView(mixins.DestroyModelMixin,
                     GenericAPIView):
    """
    Concrete view for deleting a model instance.
    """
    @transactional()
    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class UpdateAPIView(mixins.UpdateModelMixin,
                    GenericAPIView):
    """
    Concrete view for updating a model instance.
    """
    @transactional()
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    @transactional()
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class ListCreateAPIView(mixins.ListModelMixin,
                        mixins.CreateModelMixin,
                        GenericAPIView):
    """
    Concrete view for listing a queryset or creating a model instance.
    """
    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    @transactional()
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class RetrieveUpdateAPIView(mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            GenericAPIView):
    """
    Concrete view for retrieving, updating a model instance.
    """
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    @transactional()
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    @transactional()
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class RetrieveDestroyAPIView(mixins.RetrieveModelMixin,
                             mixins.DestroyModelMixin,
                             GenericAPIView):
    """
    Concrete view for retrieving or deleting a model instance.
    """
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    @transactional()
    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class RetrieveUpdateDestroyAPIView(mixins.RetrieveModelMixin,
                                   mixins.UpdateModelMixin,
                                   mixins.DestroyModelMixin,
                                   GenericAPIView):
    """
    Concrete view for retrieving, updating or deleting a model instance.
    """
    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    @transactional()
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    @transactional()
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    @transactional()
    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)
