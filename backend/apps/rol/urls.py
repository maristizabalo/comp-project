from django.urls import path

from . import views


app_name = 'rol'

urlpatterns = [
  path('', views.RolList.as_view(), name='rol-list'),
  path('<int:pk>/', views.RolDetail.as_view(), name='rol-detail'),
]
