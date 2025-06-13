from django.urls import path

from . import views

urlpatterns = [
  path('', views.RolList.as_view(), name='rol-list'),
  path('<int:pk>/', views.RolDetail.as_view(), name='rol-detail'),
]
