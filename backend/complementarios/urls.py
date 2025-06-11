from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    #Autentication URLs
    path('api/auth/', include('apps.auth.urls')),
    
    #Area URLs
    path('api/', include('apps.area.urls')),
]

urlpatterns = format_suffix_patterns(urlpatterns)
