"""
Event Management System Models
Defines Event and Registration models with proper validation
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


class Event(models.Model):
    """
    Event model for managing events in the system
    
    Attributes:
        created_by: User who created the event (ForeignKey to User)
        title: Event title
        description: Event description
        venue: Event venue/location
        event_date: Date of the event
        event_time: Time of the event
        total_seats: Total seats available for the event
        available_seats: Currently available seats
        ticket_price: Price per ticket
        created_at: Timestamp when event was created
        updated_at: Timestamp when event was last updated
    """
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    description = models.TextField()
    venue = models.CharField(max_length=255)
    event_date = models.DateField()
    event_time = models.TimeField()
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Events'
        indexes = [
            models.Index(fields=['event_date', 'available_seats']),
            models.Index(fields=['created_by']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.event_date}"
    
    def clean(self):
        """
        Validate Event model fields
        """
        # Validate total_seats
        if self.total_seats <= 0:
            raise ValidationError({'total_seats': 'Total seats must be greater than 0'})
        
        # Validate available_seats
        if self.available_seats < 0:
            raise ValidationError({'available_seats': 'Available seats cannot be negative'})
        
        if self.available_seats > self.total_seats:
            raise ValidationError(
                {'available_seats': 'Available seats cannot be greater than total seats'}
            )
        
        # Validate ticket_price
        if self.ticket_price < 0:
            raise ValidationError({'ticket_price': 'Ticket price cannot be negative'})
        
        # Validate event_date is not in the past
        if self.event_date < timezone.now().date():
            raise ValidationError({'event_date': 'Event date cannot be in the past'})
    
    def save(self, *args, **kwargs):
        """
        Save method with validation
        """
        self.full_clean()
        super().save(*args, **kwargs)
    
    def reserve_seats(self, num_seats):
        """
        Reserve seats for an event
        
        Args:
            num_seats: Number of seats to reserve
            
        Returns:
            bool: True if reservation successful, False otherwise
        """
        if num_seats <= 0:
            raise ValueError("Number of seats must be greater than 0")
        
        if num_seats > self.available_seats:
            return False
        
        self.available_seats -= num_seats
        self.save()
        return True
    
    def cancel_registration(self, num_seats):
        """
        Cancel registration and free up seats
        
        Args:
            num_seats: Number of seats to cancel
        """
        if num_seats <= 0:
            raise ValueError("Number of seats must be greater than 0")
        
        if self.available_seats + num_seats > self.total_seats:
            raise ValueError("Cannot add more seats than total_seats")
        
        self.available_seats += num_seats
        self.save()


class Registration(models.Model):
    """
    Registration model for managing event registrations
    
    Attributes:
        user: User who registered for the event (ForeignKey to User)
        event: Event for which user registered (ForeignKey to Event)
        seats_reserved: Number of seats reserved
        registration_status: Status of registration (CONFIRMED or CANCELLED)
        registered_at: Timestamp when registration was made
    """
    
    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    seats_reserved = models.PositiveIntegerField()
    registration_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='CONFIRMED'
    )
    registered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'event')
        ordering = ['-registered_at']
        verbose_name_plural = 'Registrations'
        indexes = [
            models.Index(fields=['user', 'registration_status']),
            models.Index(fields=['event', 'registration_status']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event.title}"
    
    def clean(self):
        """
        Validate Registration model fields
        """
        if self.seats_reserved <= 0:
            raise ValidationError({'seats_reserved': 'Seats reserved must be greater than 0'})
        
        # Check if user already has an active registration for this event
        existing = Registration.objects.filter(
            user=self.user,
            event=self.event,
            registration_status='CONFIRMED'
        ).exclude(pk=self.pk)
        
        if existing.exists():
            raise ValidationError('User already has an active registration for this event')
    
    def save(self, *args, **kwargs):
        """
        Save method with validation
        """
        self.full_clean()
        super().save(*args, **kwargs)
