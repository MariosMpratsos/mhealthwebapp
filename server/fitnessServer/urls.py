"""
fitnessServer URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Prometheus metrics
    path('', include('django_prometheus.urls')),

    # API
    path('api/', include('base.api.urls')),

    # React frontend
    path('', TemplateView.as_view(template_name='index.html')),
]
