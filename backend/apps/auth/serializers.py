from rest_framework import serializers


class LoginUserSerializer(serializers.Serializer):

  username = serializers.CharField()
  password = serializers.CharField()

  class Meta:
    extra_kwargs = {
      'password': {'write_only': True}
    }
