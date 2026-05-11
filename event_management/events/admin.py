"""
Django Admin Configuration for Event Management System
Registers models and customizes admin interface
"""
from django.contrib import admin
from .models import Event, Registration


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """
    Admin interface for Event model
    
    Features:
    - List display with key information
    - Search by title, description, venue
    - Filter by event_date, created_by, available_seats
    - Read-only fields for timestamps
    - Fieldsets for organized display
    """
    
    list_display = [
        'title',
        'created_by',
        'event_date',
        'event_time',
        'venue',
        'total_seats',
        'available_seats',
        'ticket_price',
        'created_at'
    ]
    
    list_filter = [
        'event_date',
        'created_by',
        'created_at',
        'available_seats'
    ]
    
    search_fields = [
        'title',
        'description',
        'venue',
        'created_by__email'
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at'
    ]
    
    fieldsets = (
        ('Event Information', {
            'fields': ('created_by', 'title', 'description', 'venue')
        }),
        ('Date and Time', {
            'fields': ('event_date', 'event_time')
        }),
        ('Seats and Pricing', {
            'fields': ('total_seats', 'available_seats', 'ticket_price')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """
        Make certain fields read-only when editing existing events
        """
        if obj:
            return self.readonly_fields + ['created_by', 'total_seats']
        return self.readonly_fields


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    """
    Admin interface for Registration model
    
    Features:
    - List display with key information
    - Search by user, event, registration_status
    - Filter by registration_status, registered_at, event
    - Read-only fields for timestamps and user/event
    - Fieldsets for organized display
    """
    
    list_display = [
        'get_user_email',
        'get_event_title',
        'seats_reserved',
        'registration_status',
        'registered_at'
    ]
    
    list_filter = [
        'registration_status',
        'registered_at',
        'event__event_date'
    ]
    
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'event__title'
    ]
    
    readonly_fields = [
        'registered_at',
        'user',
        'event'
    ]
    
    fieldsets = (
        ('Registration Information', {
            'fields': ('user', 'event', 'seats_reserved', 'registration_status')
        }),
        ('Timestamps', {
            'fields': ('registered_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_user_email(self, obj):
        """
        Display user email in list view
        """
        return obj.user.email
    get_user_email.short_description = 'User Email'
    
    def get_event_title(self, obj):
        """
        Display event title in list view
        """
        return obj.event.title
    get_event_title.short_description = 'Event'
    
    def has_add_permission(self, request):
        """
        Disable adding registrations directly from admin
        """
        return False
