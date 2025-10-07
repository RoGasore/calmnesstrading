from django.urls import path
from . import views_user, views_formations

urlpatterns = [
    # Dashboard utilisateur
    path('dashboard/', views_user.user_dashboard, name='user-dashboard'),
    
    # Notifications
    path('notifications/', views_user.user_notifications, name='user-notifications'),
    path('notifications/<int:notification_id>/read/', views_user.mark_notification_read, name='mark-notification-read'),
    path('notifications/read-all/', views_user.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Formations
    path('formations/', views_formations.user_formations_list, name='user-formations'),
    path('formations/<int:enrollment_id>/sessions/', views_formations.formation_sessions, name='formation-sessions'),
    path('formations/next-sessions/', views_formations.next_formations_sessions, name='next-formations-sessions'),
    path('sessions/<int:session_id>/attend/', views_formations.mark_session_attended, name='mark-session-attended'),
    
    # Abonnements
    path('subscriptions/', views_user.user_subscriptions, name='user-subscriptions'),
    
    # Paiements
    path('payments/', views_user.user_payments_history, name='user-payments'),
    
    # Profil
    path('profile/', views_user.update_user_profile, name='update-user-profile'),
    path('payment-eligibility/', views_user.check_payment_eligibility, name='check-payment-eligibility'),
]

