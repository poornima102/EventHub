"""
URL Configuration for Events Application
Routes all API endpoints
"""
from django.urls import path
from . import views

app_name = 'events'

urlpatterns = [
    # ==================== AUTHENTICATION ENDPOINTS ====================
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    
    # ==================== EVENT ENDPOINTS ====================
    # List and create events
    path('events/', views.EventListCreateView.as_view(), name='event-list-create'),
    
    # Event detail, update, delete
    path('events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    
    # Event registrations (view all registrations for an event - creator only)
    path('events/<int:event_id>/registrations/', views.event_registrations, name='event-registrations'),
    
    # Register for an event
    path('events/<int:event_id>/register/', views.register_for_event, name='register-event'),
    
    # ==================== REGISTRATION ENDPOINTS ====================
    # User's registrations
    path('my-registrations/', views.my_registrations, name='my-registrations'),
    
    # User's events
    path('my-events/', views.my_events, name='my-events'),
    
    # Cancel registration
    path('registrations/<int:registration_id>/cancel/', views.cancel_registration, name='cancel-registration'),
]
