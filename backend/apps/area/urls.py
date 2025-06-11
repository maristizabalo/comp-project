from django.urls import path
from .views import AreaListCreateView, AreaRetrieveUpdateView

urlpatterns = [
    path('areas/', AreaListCreateView.as_view(), name='area-list-create'),
    path('areas/<int:pk>/', AreaRetrieveUpdateView.as_view(), name='area-detail-update'),
]
