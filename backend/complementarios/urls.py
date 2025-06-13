from django.urls import path, include
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    #Autentication URLs
    path('api/auth/', include('apps.auth.urls')),
    
    #Gestion apps de administradores URLs
    path('api/usuario/', include('apps.usuario.urls')),
    path('api/rol/', include('apps.rol.urls')),
    path('api/area/', include('apps.area.urls')),
    path('api/categoria/', include('apps.categoria.urls')),
    path('api/modulo/', include('apps.modulo.urls')),
    path('api/formulario/', include('apps.formulario.urls')),
    
    #Gestion de creacion de formularios y respuestas URLs
    path('api/construccion-formulario/', include('apps.construccion_formulario.urls')),
    path('api/respuesta/', include('apps.respuesta.urls')),
]

urlpatterns = format_suffix_patterns(urlpatterns)
