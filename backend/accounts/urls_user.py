from django.urls import path
from . import views_user

urlpatterns = [
    # Dashboard utilisateur
    path('dashboard/', views_user.user_dashboard, name='user-dashboard'),
    
    # Notifications
    path('notifications/', views_user.user_notifications, name='user-notifications'),
    path('notifications/<int:notification_id>/read/', views_user.mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', views_user.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Abonnements
    path('subscriptions/', views_user.user_subscriptions, name='user-subscriptions'),
    
    # Paiements
    path('payments/', views_user.user_payments_history, name='user-payments'),
    
    # Profil
    path('profile/', views_user.update_user_profile, name='update-user-profile'),
    path('payment-eligibility/', views_user.check_payment_eligibility, name='check-payment-eligibility'),
]

