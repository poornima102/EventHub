"""
Custom Permission Classes for Event Management System
Defines permission classes for checking user authorization
"""
from rest_framework.permissions import BasePermission


class IsEventOwner(BasePermission):
    """
    Custom permission to check if user is the event creator
    
    Allows:
    - Any authenticated user to create events
    - Only event creator can edit/update/delete events
    - Any user can view all events
    """
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user is the event creator
        
        GET requests are allowed for all authenticated users
        POST, PUT, PATCH, DELETE only for event creator
        """
        # Allow GET requests for all authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Check if user is the event creator for write operations
        return obj.created_by == request.user


class IsRegistrationOwner(BasePermission):
    """
    Custom permission to check if user owns the registration
    """
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user is the registration owner
        """
        return obj.user == request.user


class IsEventCreatorOrReadOnly(BasePermission):
    """
    Custom permission to check if user is event creator
    
    Allows:
    - Any authenticated user to view events
    - Only event creator can edit/update/delete
    """
    
    def has_permission(self, request, view):
        """
        Allow authenticated users
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Allow read for all authenticated users, write only for event creator
        """
        # Allow GET, HEAD, OPTIONS for all authenticated users
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for event creator
        return obj.created_by == request.user


class IsAuthenticatedUser(BasePermission):
    """
    Custom permission to check if user is authenticated
    
    Allows only authenticated users to perform actions
    """
    
    def has_permission(self, request, view):
        """
        Check if user is authenticated
        """
        return request.user and request.user.is_authenticated


class AllowAnyReadAuthenticatedWrite(BasePermission):
    """
    Custom permission that allows anyone to read (GET) but requires authentication for write operations
    
    Allows:
    - Anyone can view/list events (GET)
    - Only authenticated users can create/modify events (POST, PUT, PATCH, DELETE)
    """
    
    def has_permission(self, request, view):
        """
        Check permissions based on HTTP method
        """
        # Allow GET requests for anyone (even unauthenticated users)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Require authentication for write operations
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions for write operations
        """
        # Allow GET for anyone
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # For write operations, user must be authenticated and be the event creator
        return request.user and request.user.is_authenticated and obj.created_by == request.user
