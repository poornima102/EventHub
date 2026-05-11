"""
App configuration for Events application
"""
from django.apps import AppConfig


class EventsConfig(AppConfig):
    """
    Configuration class for the events app
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'events'
    verbose_name = 'Event Management'
    
    def ready(self):
        """
        Import signals when app is ready
        """
        import events.signals  # noqa
