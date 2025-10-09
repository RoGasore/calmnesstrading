from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views_support

urlpatterns = [
    # Messages Support
    path('messages/', views_support.SupportMessageListCreateView.as_view(), name='support_messages'),
    path('messages/<int:message_id>/', views_support.support_message_detail, name='support_message_detail'),
    
    # Clients Support
    path('clients/', views_support.support_clients_list, name='support_clients'),
    path('clients/<int:client_id>/', views_support.support_client_detail, name='support_client_detail'),
    
    # Revenus Support
    path('revenues/', views_support.support_revenues_stats, name='support_revenues'),
    
    # Commandes Support
    path('orders/', views_support.SupportOrderListCreateView.as_view(), name='support_orders'),
    path('orders/<int:order_id>/', views_support.support_order_detail, name='support_order_detail'),
    
    # Factures Support
    path('invoices/', views_support.SupportInvoiceListCreateView.as_view(), name='support_invoices'),
    path('invoices/<int:invoice_id>/', views_support.support_invoice_detail, name='support_invoice_detail'),
    path('invoices/<int:invoice_id>/generate-pdf/', views_support.support_invoice_generate_pdf, name='support_invoice_pdf'),
    
    # Dashboard Support
    path('dashboard/', views_support.support_dashboard_stats, name='support_dashboard'),
]
