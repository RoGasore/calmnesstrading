from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
import json
import uuid
from datetime import datetime, timedelta

from .models_invoice import Invoice, InvoiceItem, InvoiceTemplate
from .models import Payment
from accounts.models import User

def is_admin(user):
    """Vérifie si l'utilisateur est admin"""
    return user.is_staff and user.is_active

@login_required
@user_passes_test(is_admin)
def admin_invoices_list(request):
    """Liste des factures pour l'admin"""
    invoices = Invoice.objects.select_related('customer').all()
    
    # Filtres
    status_filter = request.GET.get('status')
    if status_filter:
        invoices = invoices.filter(status=status_filter)
    
    search = request.GET.get('search')
    if search:
        invoices = invoices.filter(
            models.Q(invoice_number__icontains=search) |
            models.Q(customer__first_name__icontains=search) |
            models.Q(customer__last_name__icontains=search) |
            models.Q(customer__email__icontains=search)
        )
    
    context = {
        'invoices': invoices,
        'status_choices': Invoice.INVOICE_STATUS_CHOICES,
        'current_status': status_filter,
        'search': search,
    }
    return render(request, 'admin/invoices_list.html', context)

@login_required
@user_passes_test(is_admin)
def admin_invoice_detail(request, invoice_id):
    """Détail d'une facture pour l'admin"""
    invoice = get_object_or_404(Invoice, id=invoice_id)
    items = invoice.items.all()
    
    context = {
        'invoice': invoice,
        'items': items,
    }
    return render(request, 'admin/invoice_detail.html', context)

@login_required
@user_passes_test(is_admin)
def admin_create_invoice(request):
    """Créer une nouvelle facture"""
    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Récupérer les données du formulaire
                customer_id = request.POST.get('customer_id')
                payment_id = request.POST.get('payment_id')  # ID du paiement à facturer
                transaction_reference = request.POST.get('transaction_reference')
                
                if not customer_id or not payment_id or not transaction_reference:
                    messages.error(request, "Tous les champs sont obligatoires.")
                    return redirect('admin_invoices_list')
                
                # Vérifier que le paiement existe et n'est pas déjà facturé
                try:
                    payment = Payment.objects.get(id=payment_id, user_id=customer_id)
                    if payment.invoice:
                        messages.error(request, "Ce paiement a déjà été facturé.")
                        return redirect('admin_invoices_list')
                except Payment.DoesNotExist:
                    messages.error(request, "Paiement introuvable.")
                    return redirect('admin_invoices_list')
                
                # Générer le numéro de facture séquentiel
                last_invoice = Invoice.objects.order_by('-id').first()
                if last_invoice:
                    last_number = int(last_invoice.invoice_number.split('-')[1])
                    new_number = last_number + 1
                else:
                    new_number = 1
                
                invoice_number = f"CT-{new_number:05d}"
                
                # Créer la facture
                invoice = Invoice.objects.create(
                    invoice_number=invoice_number,
                    customer_id=customer_id,
                    issue_date=timezone.now().date(),
                    due_date=timezone.now().date() + timedelta(days=30),
                    subtotal_ht=payment.amount,
                    tax_rate=Decimal('20.00'),
                    transaction_reference=transaction_reference,
                    created_by=request.user,
                    notes=f"Facture pour le paiement #{payment.id} - {payment.service_name}",
                )
                
                # Créer l'article de facture
                InvoiceItem.objects.create(
                    invoice=invoice,
                    description=payment.service_name,
                    detailed_description=f"Paiement effectué le {payment.paid_at.strftime('%d/%m/%Y')}",
                    quantity=Decimal('1.00'),
                    unit_price_ht=payment.amount,
                )
                
                # Lier le paiement à la facture
                payment.invoice = invoice
                payment.save(update_fields=['invoice'])
                
                # Marquer la facture comme payée
                invoice.mark_as_paid(
                    payment_method='bank_transfer',
                    transaction_reference=transaction_reference
                )
                
                messages.success(request, f"Facture {invoice_number} créée avec succès.")
                return redirect('admin_invoice_detail', invoice_id=invoice.id)
                
        except Exception as e:
            messages.error(request, f"Erreur lors de la création de la facture: {str(e)}")
            return redirect('admin_invoices_list')
    
    # GET - Afficher le formulaire
    # Récupérer les paiements non facturés
    unpaid_payments = Payment.objects.filter(
        invoice__isnull=True,
        status='completed'
    ).select_related('user').order_by('-paid_at')
    
    context = {
        'unpaid_payments': unpaid_payments,
    }
    return render(request, 'admin/create_invoice.html', context)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_transaction_reference(request):
    """Valider un numéro de transaction (API)"""
    transaction_ref = request.data.get('transaction_reference')
    
    if not transaction_ref:
        return Response(
            {'error': 'Numéro de transaction requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que le numéro n'est pas déjà utilisé
    existing_invoice = Invoice.objects.filter(
        transaction_reference=transaction_ref
    ).exists()
    
    if existing_invoice:
        return Response(
            {'error': 'Ce numéro de transaction a déjà été utilisé'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'valid': True})

@login_required
@user_passes_test(is_admin)
def admin_invoice_pdf(request, invoice_id):
    """Générer le PDF d'une facture"""
    invoice = get_object_or_404(Invoice, id=invoice_id)
    
    # TODO: Implémenter la génération PDF
    # Pour l'instant, retourner les données JSON
    data = {
        'invoice': {
            'number': invoice.invoice_number,
            'customer': {
                'name': invoice.customer.get_full_name(),
                'email': invoice.customer.email,
            },
            'amount': float(invoice.total_ttc),
            'date': invoice.issue_date.isoformat(),
        }
    }
    
    return JsonResponse(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_invoices_list_api(request):
    """Liste des factures pour l'admin/service client (API JSON)"""
    # Vérifier que c'est admin ou service client
    if not (request.user.is_staff or request.user.role in ['admin', 'customer_service']):
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    invoices = Invoice.objects.select_related('customer').all().order_by('-created_at')
    
    # Filtres
    status_filter = request.GET.get('status')
    if status_filter:
        invoices = invoices.filter(status=status_filter)
    
    search = request.GET.get('search')
    if search:
        from django.db import models as db_models
        invoices = invoices.filter(
            db_models.Q(invoice_number__icontains=search) |
            db_models.Q(customer__first_name__icontains=search) |
            db_models.Q(customer__last_name__icontains=search) |
            db_models.Q(customer__email__icontains=search)
        )
    
    data = []
    for invoice in invoices:
        data.append({
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'user': {
                'id': invoice.customer.id,
                'name': f"{invoice.customer.first_name} {invoice.customer.last_name}".strip() or invoice.customer.username,
                'email': invoice.customer.email
            },
            'total_amount': float(invoice.total_ttc),
            'currency': 'EUR',
            'status': invoice.status,
            'created_at': invoice.created_at.isoformat() if hasattr(invoice, 'created_at') else invoice.issue_date.isoformat(),
            'due_date': invoice.due_date.isoformat() if invoice.due_date else None,
            'paid_at': invoice.payment_date.isoformat() if invoice.payment_date else None,
            'payment_method': getattr(invoice, 'payment_method', None),
            'notes': getattr(invoice, 'notes', ''),
            'items': []  # À implémenter si nécessaire
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_invoices_list(request):
    """Liste des factures de l'utilisateur connecté"""
    invoices = Invoice.objects.filter(customer=request.user).order_by('-issue_date')
    
    data = []
    for invoice in invoices:
        data.append({
            'id': invoice.id,
            'invoice_number': invoice.invoice_number,
            'status': invoice.status,
            'issue_date': invoice.issue_date.isoformat(),
            'due_date': invoice.due_date.isoformat(),
            'total_ttc': float(invoice.total_ttc),
            'payment_date': invoice.payment_date.isoformat() if invoice.payment_date else None,
            'is_overdue': invoice.is_overdue,
            'days_overdue': invoice.days_overdue,
        })
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_invoice_detail(request, invoice_id):
    """Détail d'une facture pour l'utilisateur"""
    try:
        invoice = Invoice.objects.get(id=invoice_id, customer=request.user)
        items = invoice.items.all()
        
        data = {
            'invoice': {
                'id': invoice.id,
                'invoice_number': invoice.invoice_number,
                'status': invoice.status,
                'issue_date': invoice.issue_date.isoformat(),
                'due_date': invoice.due_date.isoformat(),
                'payment_date': invoice.payment_date.isoformat() if invoice.payment_date else None,
                'subtotal_ht': float(invoice.subtotal_ht),
                'tax_rate': float(invoice.tax_rate),
                'tax_amount': float(invoice.tax_amount),
                'total_ttc': float(invoice.total_ttc),
                'payment_method': invoice.payment_method,
                'transaction_reference': invoice.transaction_reference,
                'notes': invoice.notes,
                'terms_conditions': invoice.terms_conditions,
                'is_overdue': invoice.is_overdue,
                'days_overdue': invoice.days_overdue,
            },
            'items': [
                {
                    'description': item.description,
                    'detailed_description': item.detailed_description,
                    'quantity': float(item.quantity),
                    'unit_price_ht': float(item.unit_price_ht),
                    'total_ht': float(item.total_ht),
                }
                for item in items
            ],
            'company': {
                'name': invoice.company_name,
                'address': invoice.company_address,
                'siret': invoice.company_siret,
                'vat_number': invoice.company_vat_number,
            }
        }
        
        return Response(data)
        
    except Invoice.DoesNotExist:
        return Response(
            {'error': 'Facture introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_invoice_pdf(request, invoice_id):
    """Télécharger le PDF d'une facture"""
    try:
        invoice = Invoice.objects.get(id=invoice_id, customer=request.user)
        
        # TODO: Implémenter la génération PDF
        # Pour l'instant, retourner un message
        return Response({
            'message': f'PDF de la facture {invoice.invoice_number}',
            'invoice_number': invoice.invoice_number,
        })
        
    except Invoice.DoesNotExist:
        return Response(
            {'error': 'Facture introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )
