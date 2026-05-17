"""
Django REST Framework Serializers for Event Management System
Handles serialization/deserialization and validation for API endpoints
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Event, Registration


class UserRegistrationSerializer(serializers.Serializer):
    """
    Serializer for user registration
    
    Validates and creates a new user account
    """
    full_name = serializers.CharField(max_length=255, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6, required=True)
    
    def validate_email(self, value):
        """
        Validate that email is unique
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def validate_full_name(self, value):
        """
        Validate full name is not empty
        """
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be empty")
        return value
    
    def create(self, validated_data):
        """
        Create a new user
        """
        full_name = validated_data.get('full_name')
        email = validated_data.get('email')
        password = validated_data.get('password')
        
        # Split full name into first and last name
        name_parts = full_name.strip().split(maxsplit=1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        # Create user with unique username from email
        username = email.split('@')[0]
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    
    Validates email and password for login
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        """
        Validate email and password combination
        """
        email = attrs.get('email')
        password = attrs.get('password')
        
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid email or password")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")
        
        attrs['user'] = user
        return attrs


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for user details
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'username']
    
    def get_full_name(self, obj):
        """
        Get full name from first and last name
        """
        return f"{obj.first_name} {obj.last_name}".strip()


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for Event model
    
    Handles serialization/deserialization of events with validation
    """
    created_by = UserDetailSerializer(read_only=True)
    event_datetime = serializers.SerializerMethodField()
    is_event_owner = serializers.SerializerMethodField()
    seats_available = serializers.IntegerField(source='available_seats', read_only=True)
    event_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'created_by', 'title', 'description', 'venue', 'category', 'banner_image',
            'event_date', 'event_time', 'event_datetime', 'event_status', 'total_seats', 
            'available_seats', 'seats_available', 'ticket_price', 
            'created_at', 'updated_at', 'is_event_owner'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'available_seats']
    
    def validate_event_date(self, value):
        """
        Validate that event_date is not in the past
        """
        if value < timezone.now().date():
            raise serializers.ValidationError("Event date cannot be in the past")
        return value
    
    def validate(self, attrs):
        """
        Validate event-level constraints
        """
        # Validate total_seats
        if attrs.get('total_seats') and attrs.get('total_seats') <= 0:
            raise serializers.ValidationError(
                {'total_seats': 'Total seats must be greater than 0'}
            )
        
        # Validate available_seats
        available_seats = attrs.get('available_seats')
        total_seats = attrs.get('total_seats')
        
        if available_seats is not None and available_seats < 0:
            raise serializers.ValidationError(
                {'available_seats': 'Available seats cannot be negative'}
            )
        
        if available_seats is not None and total_seats and available_seats > total_seats:
            raise serializers.ValidationError(
                {'available_seats': 'Available seats cannot exceed total seats'}
            )
        
        # Validate ticket_price
        if attrs.get('ticket_price') is not None and attrs.get('ticket_price') < 0:
            raise serializers.ValidationError(
                {'ticket_price': 'Ticket price cannot be negative'}
            )
        
        return attrs
    
    def create(self, validated_data):
        """
        Create event with authenticated user as creator
        """
        validated_data['created_by'] = self.context['request'].user
        # Set available_seats to total_seats when creating a new event
        if 'total_seats' in validated_data and 'available_seats' not in validated_data:
            validated_data['available_seats'] = validated_data['total_seats']
        return super().create(validated_data)
    
    def get_event_datetime(self, obj):
        """
        Combine event_date and event_time
        """
        return f"{obj.event_date} {obj.event_time}"

    def get_event_status(self, obj):
        """
        Get a human-readable event status
        """
        if obj.event_date < timezone.now().date():
            return 'Completed'
        if obj.available_seats <= 0:
            return 'Fully Booked'
        return 'Upcoming'
    
    def get_is_event_owner(self, obj):
        """
        Check if current user is event owner
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.created_by == request.user
        return False


class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for Registration model
    
    Handles registration creation and updates with seat validation
    """
    user = UserDetailSerializer(read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.event_date', read_only=True)
    event_time = serializers.TimeField(source='event.event_time', read_only=True)
    event_venue = serializers.CharField(source='event.venue', read_only=True)
    # Use ImageField so DRF returns a URL (requires request in serializer context)
    event_banner = serializers.ImageField(source='event.banner_image', read_only=True, use_url=True)
    event_category = serializers.CharField(source='event.category', read_only=True)
    event_status = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = Registration
        fields = [
            'id', 'user', 'event', 'event_title', 'event_date', 'event_time',
            'event_venue', 'event_banner', 'event_category', 'event_status',
            'seats_reserved', 'registration_status', 'payment_status', 'registered_at', 'total_cost'
        ]
        read_only_fields = ['id', 'user', 'event', 'registration_status', 'registered_at']
    
    def validate_seats_reserved(self, value):
        """
        Validate seats_reserved is positive
        """
        if value <= 0:
            raise serializers.ValidationError("Seats reserved must be greater than 0")
        return value
    
    def validate(self, attrs):
        """
        Validate seat availability and user constraints
        """
        event = self.instance.event if self.instance else self.context.get('event')
        seats_requested = attrs.get('seats_reserved')
        
        if not event:
            raise serializers.ValidationError("Event is required")
        
        if seats_requested and seats_requested > event.available_seats:
            raise serializers.ValidationError(
                f"Not enough seats available. Only {event.available_seats} seats left"
            )
        
        return attrs
    
    def get_event_status(self, obj):
        """
        Get a human-readable status for the registered event
        """
        if obj.event.event_date < timezone.now().date():
            return 'Completed'
        if obj.event.available_seats <= 0:
            return 'Fully Booked'
        return 'Upcoming'

    def get_payment_status(self, obj):
        """
        Determine the payment status for the registration
        """
        if obj.registration_status == 'CONFIRMED':
            return 'Paid'
        if obj.registration_status == 'CANCELLED':
            return 'Cancelled'
        return 'Pending'

    def get_total_cost(self, obj):
        """
        Calculate total cost (seats reserved * ticket price)
        """
        return float(obj.seats_reserved * obj.event.ticket_price)


class RegistrationCreateSerializer(serializers.Serializer):
    """
    Serializer specifically for creating registrations
    
    Used when registering for an event
    """
    seats_reserved = serializers.IntegerField(min_value=1)
    
    def validate_seats_reserved(self, value):
        """
        Validate seats_reserved is positive
        """
        if value <= 0:
            raise serializers.ValidationError("Seats reserved must be greater than 0")
        return value


class EventDetailSerializer(EventSerializer):
    """
    Extended Event serializer with registration details
    
    Used for detailed event view
    """
    total_registrations = serializers.SerializerMethodField()
    confirmed_registrations = serializers.SerializerMethodField()
    
    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + [
            'total_registrations', 'confirmed_registrations'
        ]
    
    def get_total_registrations(self, obj):
        """
        Get total registrations for the event
        """
        return obj.registrations.filter(registration_status='CONFIRMED').count()
    
    def get_confirmed_registrations(self, obj):
        """
        Get count of confirmed registrations
        """
        return obj.registrations.filter(
            registration_status='CONFIRMED'
        ).aggregate(
            total=models.Sum('seats_reserved')
        )['total'] or 0


# Import models at the end to avoid circular imports
from django.db import models
