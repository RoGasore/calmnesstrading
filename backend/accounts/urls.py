from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView, activate_email, resend_activation_email, login_with_email,
    AdminUserListView, AdminUserDetailView, admin_activate_user, admin_deactivate_user,
    admin_overview_stats, admin_recent_activity
)

urlpatterns = [
    # Authentification
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', login_with_email, name='login_with_email'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    
    # Activation d'email
    path('activate/', activate_email, name='activate_email'),
    path('resend-activation/', resend_activation_email, name='resend_activation_email'),
    
    # Gestion admin
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:user_id>/activate/', admin_activate_user, name='admin_activate_user'),
    path('admin/users/<int:user_id>/deactivate/', admin_deactivate_user, name='admin_deactivate_user'),
    
    # Vue d'ensemble admin
    path('admin/overview/stats/', admin_overview_stats, name='admin_overview_stats'),
    path('admin/overview/activity/', admin_recent_activity, name='admin_recent_activity'),
]
