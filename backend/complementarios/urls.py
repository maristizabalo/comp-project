from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path('api/auth/', include('apps.auth.urls')),
]

urlpatterns = format_suffix_patterns(urlpatterns)
