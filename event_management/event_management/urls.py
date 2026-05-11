"""
Main URL Configuration for Event Management System Project
Routes all application URLs
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.shortcuts import redirect

def api_info(request):
    """API information endpoint"""
    return JsonResponse({
        'message': 'Event Management System API',
        'version': '1.0.0',
        'documentation': '/api/',
        'endpoints': {
            'authentication': '/api/auth/',
            'events': '/api/events/',
            'user_events': '/api/my-events/',
            'user_registrations': '/api/my-registrations/',
        },
        'frontend': 'http://localhost:3000 (React App)',
    })

urlpatterns = [
    # Root API info
    path('', api_info, name='api_info'),
    
    # Django admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('events.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
