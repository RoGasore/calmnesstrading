from django.urls import path
from . import views_invoice

urlpatterns = [
    # URLs Admin
    path('admin/invoices/', views_invoice.admin_invoices_list, name='admin_invoices_list'),
    path('admin/invoices/create/', views_invoice.admin_create_invoice, name='admin_create_invoice'),
    path('admin/invoices/<int:invoice_id>/', views_invoice.admin_invoice_detail, name='admin_invoice_detail'),
    path('admin/invoices/<int:invoice_id>/pdf/', views_invoice.admin_invoice_pdf, name='admin_invoice_pdf'),
    
    # URLs API
    path('api/validate-transaction/', views_invoice.validate_transaction_reference, name='validate_transaction_reference'),
    path('api/user/invoices/', views_invoice.user_invoices_list, name='user_invoices_list'),
    path('api/user/invoices/<int:invoice_id>/', views_invoice.user_invoice_detail, name='user_invoice_detail'),
    path('api/user/invoices/<int:invoice_id>/pdf/', views_invoice.user_invoice_pdf, name='user_invoice_pdf'),
]
