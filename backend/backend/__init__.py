# Charger Celery au démarrage de Django (si disponible)
try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    # Celery n'est pas installé, continuer sans
    __all__ = ()


