"""
Django REST Framework Views for Event Management System
Implements API endpoints for authentication, events, and registrations
"""
from rest_framework import status, viewsets, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.db.models import Q
from .models import Event, Registration
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserDetailSerializer,
    EventSerializer,
    EventDetailSerializer,
    RegistrationSerializer,
    RegistrationCreateSerializer
)
from .permissions import IsEventOwner, IsAuthenticatedUser, IsEventCreatorOrReadOnly, AllowAnyReadAuthenticatedWrite


class StandardResultsSetPagination(PageNumberPagination):
    """
    Custom pagination class for API responses
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


def api_response(success, message, data=None, status_code=None):
    """
    Helper function to create consistent API responses
    
    Args:
        success: Boolean indicating success or failure
        message: Response message
        data: Response data (optional)
        status_code: HTTP status code (optional)
    
    Returns:
        Response object with consistent format
    """
    response_data = {
        'success': success,
        'message': message,
    }
    
    if data is not None:
        response_data['data'] = data
    
    return Response(response_data, status=status_code)


# ==================== AUTHENTICATION VIEWS ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    User Registration Endpoint
    
    POST /api/auth/register/
    
    Request body:
    {
        "full_name": "John Doe",
        "email": "john@example.com",
        "password": "secure_password"
    }
    
    Returns:
    {
        "success": true,
        "message": "Registration successful",
        "data": {
            "user": {...},
            "token": "..."
        }
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            
            # Create auth token for the user
            token, created = Token.objects.get_or_create(user=user)
            
            user_serializer = UserDetailSerializer(user)
            
            return api_response(
                success=True,
                message='Registration successful',
                data={
                    'user': user_serializer.data,
                    'token': token.key
                },
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            return api_response(
                success=False,
                message=f'Registration failed: {str(e)}',
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    return api_response(
        success=False,
        message='Validation error',
        data=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    User Login Endpoint
    
    POST /api/auth/login/
    
    Request body:
    {
        "email": "john@example.com",
        "password": "secure_password"
    }
    
    Returns:
    {
        "success": true,
        "message": "Login successful",
        "data": {
            "user": {...},
            "token": "..."
        }
    }
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data.get('user')
        
        # Get or create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        user_serializer = UserDetailSerializer(user)
        
        return api_response(
            success=True,
            message='Login successful',
            data={
                'user': user_serializer.data,
                'token': token.key
            },
            status_code=status.HTTP_200_OK
        )
    
    return api_response(
        success=False,
        message='Validation error',
        data=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    User Logout Endpoint
    
    POST /api/auth/logout/
    
    Deletes the authentication token
    
    Returns:
    {
        "success": true,
        "message": "Logout successful"
    }
    """
    try:
        # Delete the user's auth token
        token = Token.objects.get(user=request.user)
        token.delete()
        
        return api_response(
            success=True,
            message='Logout successful',
            status_code=status.HTTP_200_OK
        )
    except Token.DoesNotExist:
        return api_response(
            success=False,
            message='Token not found',
            status_code=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return api_response(
            success=False,
            message=f'Logout failed: {str(e)}',
            status_code=status.HTTP_400_BAD_REQUEST
        )


# ==================== EVENT VIEWS ====================

class EventListCreateView(generics.ListCreateAPIView):
    """
    Event List and Create View
    
    GET /api/events/ - List all upcoming events (paginated)
    POST /api/events/ - Create new event (authenticated users only)
    
    Features:
    - Pagination
    - Search by title
    - Ordering by event_date, ticket_price
    - Filter only future events
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAnyReadAuthenticatedWrite]
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'venue']
    ordering_fields = ['event_date', 'ticket_price', 'created_at']
    ordering = ['event_date']
    
    def get_queryset(self):
        """
        Return only future events
        """
        current_date = timezone.now().date()
        queryset = Event.objects.filter(event_date__gte=current_date)
        
        # Filter by venue if provided
        venue = self.request.query_params.get('venue')
        if venue:
            queryset = queryset.filter(venue__icontains=venue)
        
        # Filter by date range if provided
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(event_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(event_date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Set the authenticated user as event creator
        """
        serializer.save(created_by=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Event Detail View
    
    GET /api/events/<id>/ - Get event details
    PUT /api/events/<id>/ - Update event (creator only)
    PATCH /api/events/<id>/ - Partial update event (creator only)
    DELETE /api/events/<id>/ - Delete event (creator only)
    """
    queryset = Event.objects.all()
    serializer_class = EventDetailSerializer
    permission_classes = [AllowAnyReadAuthenticatedWrite]
    
    def get_object(self):
        """
        Get event object
        """
        event_id = self.kwargs.get('pk')
        return get_object_or_404(Event, pk=event_id)


# ==================== REGISTRATION VIEWS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def register_for_event(request, event_id):
    """
    Register User for Event
    
    POST /api/events/<id>/register/
    
    Request body:
    {
        "seats_reserved": 2
    }
    
    Features:
    - Validates seat availability
    - Uses database transaction to prevent race conditions
    - Prevents duplicate registrations
    - Decrements available_seats automatically
    
    Returns:
    {
        "success": true,
        "message": "Registration successful",
        "data": {
            "registration": {...},
            "total_cost": 1000.00
        }
    }
    """
    try:
        # Get the event
        event = get_object_or_404(Event, pk=event_id)
        
        # Check if user already has an active registration
        existing_registration = Registration.objects.filter(
            user=request.user,
            event=event,
            registration_status='CONFIRMED'
        ).first()
        
        if existing_registration:
            return api_response(
                success=False,
                message='You already have an active registration for this event',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate seats requested
        serializer = RegistrationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                success=False,
                message='Validation error',
                data=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        seats_requested = serializer.validated_data.get('seats_reserved')
        
        # Check seat availability
        if seats_requested > event.available_seats:
            return api_response(
                success=False,
                message=f'Not enough seats available. Only {event.available_seats} seats left',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Create registration and reserve seats
        registration = Registration.objects.create(
            user=request.user,
            event=event,
            seats_reserved=seats_requested,
            registration_status='CONFIRMED'
        )
        
        # Reserve seats in the event
        event.reserve_seats(seats_requested)
        
        # Prepare response
        reg_serializer = RegistrationSerializer(registration)
        total_cost = float(seats_requested * event.ticket_price)
        
        return api_response(
            success=True,
            message='Registration successful',
            data={
                'registration': reg_serializer.data,
                'total_cost': total_cost
            },
            status_code=status.HTTP_201_CREATED
        )
    
    except Exception as e:
        return api_response(
            success=False,
            message=f'Registration failed: {str(e)}',
            status_code=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_registrations(request):
    """
    Get User's Registrations
    
    GET /api/my-registrations/
    
    Returns all registrations for the authenticated user
    Paginated response with filters
    
    Query parameters:
    - status: Filter by registration status (CONFIRMED, CANCELLED)
    - page: Page number for pagination
    """
    try:
        # Get user's registrations
        registrations = Registration.objects.filter(user=request.user)
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter in ['CONFIRMED', 'CANCELLED']:
            registrations = registrations.filter(registration_status=status_filter)
        
        # Pagination
        paginator = StandardResultsSetPagination()
        paginated_registrations = paginator.paginate_queryset(registrations, request)
        
        serializer = RegistrationSerializer(
            paginated_registrations,
            many=True,
            context={'request': request}
        )
        
        return paginator.get_paginated_response({
            'success': True,
            'message': 'User registrations retrieved successfully',
            'results': serializer.data
        })
    
    except Exception as e:
        return api_response(
            success=False,
            message=f'Failed to retrieve registrations: {str(e)}',
            status_code=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_events(request):
    """
    Get User's Created Events
    
    GET /api/my-events/
    
    Returns all events created by the authenticated user
    Paginated response
    
    Query parameters:
    - page: Page number for pagination
    """
    try:
        # Get user's events
        events = Event.objects.filter(created_by=request.user)
        
        # Pagination
        paginator = StandardResultsSetPagination()
        paginated_events = paginator.paginate_queryset(events, request)
        
        serializer = EventDetailSerializer(
            paginated_events,
            many=True,
            context={'request': request}
        )
        
        return paginator.get_paginated_response({
            'success': True,
            'message': 'User events retrieved successfully',
            'results': serializer.data
        })
    
    except Exception as e:
        return api_response(
            success=False,
            message=f'Failed to retrieve events: {str(e)}',
            status_code=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_registrations(request, event_id):
    """
    Get Registrations for Event (Creator Only)
    
    GET /api/events/<id>/registrations/
    
    Returns all registrations for a specific event
    Only accessible by the event creator
    
    Includes:
    - Total registrations
    - Breakdown by status
    - User details
    - Pagination
    """
    try:
        # Get the event
        event = get_object_or_404(Event, pk=event_id)
        
        # Check if user is the event creator
        if event.created_by != request.user:
            return api_response(
                success=False,
                message='You do not have permission to view registrations for this event',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Get registrations for the event
        registrations = event.registrations.all()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter in ['CONFIRMED', 'CANCELLED']:
            registrations = registrations.filter(registration_status=status_filter)
        
        # Pagination
        paginator = StandardResultsSetPagination()
        paginated_registrations = paginator.paginate_queryset(registrations, request)
        
        serializer = RegistrationSerializer(
            paginated_registrations,
            many=True,
            context={'request': request}
        )
        
        # Calculate statistics
        confirmed_count = event.registrations.filter(
            registration_status='CONFIRMED'
        ).count()
        cancelled_count = event.registrations.filter(
            registration_status='CANCELLED'
        ).count()
        total_seats_reserved = event.registrations.filter(
            registration_status='CONFIRMED'
        ).values('seats_reserved').count()
        
        response_data = paginator.get_paginated_response({
            'success': True,
            'message': 'Event registrations retrieved successfully',
            'results': serializer.data
        })
        
        # Add statistics to response
        if isinstance(response_data.data, dict):
            response_data.data['statistics'] = {
                'confirmed_registrations': confirmed_count,
                'cancelled_registrations': cancelled_count,
                'total_seats_reserved': total_seats_reserved
            }
        
        return response_data
    
    except Exception as e:
        return api_response(
            success=False,
            message=f'Failed to retrieve registrations: {str(e)}',
            status_code=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def cancel_registration(request, registration_id):
    """
    Cancel User Registration
    
    POST /api/registrations/<id>/cancel/
    
    Cancels a registration and frees up reserved seats
    Only accessible by the registration owner
    
    Returns:
    {
        "success": true,
        "message": "Registration cancelled successfully"
    }
    """
    try:
        # Get the registration
        registration = get_object_or_404(Registration, pk=registration_id)
        
        # Check if user is the registration owner
        if registration.user != request.user:
            return api_response(
                success=False,
                message='You do not have permission to cancel this registration',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already cancelled
        if registration.registration_status == 'CANCELLED':
            return api_response(
                success=False,
                message='This registration is already cancelled',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel the registration
        registration.registration_status = 'CANCELLED'
        registration.save()
        
        # Free up the seats
        registration.event.cancel_registration(registration.seats_reserved)
        
        return api_response(
            success=True,
            message='Registration cancelled successfully',
            status_code=status.HTTP_200_OK
        )
    
    except Exception as e:
        return api_response(
            success=False,
            message=f'Failed to cancel registration: {str(e)}',
            status_code=status.HTTP_400_BAD_REQUEST
        )
