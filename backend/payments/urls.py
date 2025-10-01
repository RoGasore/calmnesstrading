from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # ==================== OFFRES ====================
    path('offers/', views.OfferListView.as_view(), name='offer_list'),
    path('offers/<int:pk>/', views.OfferDetailView.as_view(), name='offer_detail'),
    
    # ==================== CANAUX DE CONTACT ====================
    path('contact-channels/', views.ContactChannelListView.as_view(), name='contact_channel_list'),
    
    # ==================== PAIEMENTS EN ATTENTE (UTILISATEUR) ====================
    path('pending-payments/', views.UserPendingPaymentListView.as_view(), name='user_pending_payments'),
    path('pending-payments/create/', views.CreatePendingPaymentView.as_view(), name='create_pending_payment'),
    
    # ==================== PAIEMENTS (UTILISATEUR) ====================
    path('payments/', views.UserPaymentListView.as_view(), name='user_payments'),
    
    # ==================== ABONNEMENTS (UTILISATEUR) ====================
    path('subscriptions/', views.UserSubscriptionListView.as_view(), name='user_subscriptions'),
    path('subscriptions/active/', views.user_active_subscriptions, name='user_active_subscriptions'),
    
    # ==================== DASHBOARD UTILISATEUR ====================
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    
    # ==================== ADMIN - PAIEMENTS EN ATTENTE ====================
    path('admin/pending-payments/', views.AdminPendingPaymentListView.as_view(), name='admin_pending_payments'),
    path('admin/pending-payments/<int:pk>/', views.AdminPendingPaymentDetailView.as_view(), name='admin_pending_payment_detail'),
    path('admin/pending-payments/validate/', views.validate_pending_payment, name='validate_pending_payment'),
    path('admin/pending-payments/<int:pk>/cancel/', views.cancel_pending_payment, name='cancel_pending_payment'),
    
    # ==================== ADMIN - PAIEMENTS ====================
    path('admin/payments/', views.PaymentListView.as_view(), name='admin_payments'),
    
    # ==================== ADMIN - ABONNEMENTS ====================
    path('admin/subscriptions/', views.SubscriptionListView.as_view(), name='admin_subscriptions'),
    
    # ==================== DASHBOARD ADMIN ====================
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    # ==================== GESTION DES OFFRES (ADMIN) ====================
    path('admin/offers/', views.AdminOfferListCreateView.as_view(), name='admin_offers'),
    path('admin/offers/<int:pk>/', views.AdminOfferDetailView.as_view(), name='admin_offer_detail'),
]

