from django.urls import path
from . import views_telegram

urlpatterns = [
    # Génération token et notifications
    path('generate-token/', views_telegram.generate_telegram_token, name='generate_telegram_token'),
    path('notifications/', views_telegram.get_telegram_notifications, name='telegram_notifications'),
    path('status/', views_telegram.get_telegram_status, name='telegram_status'),
    
    # Administration
    path('revoke-access/', views_telegram.revoke_telegram_access, name='revoke_telegram_access'),
    path('admin/stats/', views_telegram.get_admin_telegram_stats, name='admin_telegram_stats'),
]

