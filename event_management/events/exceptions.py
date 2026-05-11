"""
Custom Exception Handlers for Event Management System
Provides custom error handling for API responses
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    
    Returns consistent error response format
    """
    # Call DRF's default exception handler first to get the standard error response
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        if isinstance(response.data, dict):
            # Check if it's a validation error with field details
            if 'detail' in response.data:
                response.data = {
                    'success': False,
                    'message': str(response.data['detail']),
                    'errors': None
                }
            else:
                # Field-level validation errors
                response.data = {
                    'success': False,
                    'message': 'Validation error',
                    'errors': response.data
                }
        else:
            # Non-dict response
            response.data = {
                'success': False,
                'message': str(response.data),
                'errors': None
            }
    
    return response
