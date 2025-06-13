from django.urls import path
from .views import AreaListCreateView, AreaRetrieveUpdateView

urlpatterns = [
    path('', AreaListCreateView.as_view(), name='area-list-create'),
    path('<int:pk>/', AreaRetrieveUpdateView.as_view(), name='area-detail-update'),
]
