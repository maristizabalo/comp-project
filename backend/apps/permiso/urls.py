from django.urls import path
from apps.permiso import views

app_name = 'permiso'

urlpatterns = [
  path('', views.PermisoList.as_view(), name='permiso-list'),
  path('<int:pk>/', views.PermisoDetail.as_view(), name='permiso-detail'),
]
