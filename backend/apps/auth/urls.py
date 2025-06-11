from django.urls import path
from apps.auth import views


app_name = 'auth'

urlpatterns = [
  path('login/', views.LoginUser.as_view(), name='auth-login'),
  path('logout/', views.LogoutUser.as_view(), name='auth-logout'),
  path('check-status/', views.CheckUserStatus.as_view(), name='auth-check-user-status'),
]