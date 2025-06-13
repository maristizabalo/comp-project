from django.urls import path

from . import views

urlpatterns = [
  path('', views.UsuarioList.as_view(), name='usuario-list'),
  path('<int:pk>/', views.UsuarioDetail.as_view(), name='usuario-detail'),
  path('ldap/', views.UsuarioLdapSearch.as_view(), name='ldap-search'),
  path('activos/', views.UsuarioActivosList.as_view(), name='usuario-activos-list'),
]
