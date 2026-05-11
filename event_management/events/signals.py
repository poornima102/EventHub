"""
Django Signals for Event Management System
Handles automatic actions when models are created or updated
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


@receiver(post_save, sender=User)
def create_auth_token(sender, instance, created, **kwargs):
    """
    Create authentication token for newly created users
    
    This signal automatically creates an auth token whenever a new user
    is created, making it easier to work with token authentication
    """
    if created:
        Token.objects.get_or_create(user=instance)
