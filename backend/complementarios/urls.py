from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    #Autentication URLs
    path('api/auth/', include('apps.auth.urls')),
    
    #Gestion apps de administradores URLs
    path('api/', include('apps.area.urls')),
    path('api/', include('apps.categoria.urls')),
    path('api/', include('apps.modulo.urls')),
    path('api/', include('apps.formulario.urls')),
]

urlpatterns = format_suffix_patterns(urlpatterns)
