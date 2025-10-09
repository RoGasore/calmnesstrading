from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta

from .models_support import SupportMessage, SupportReply, SupportTicket, SupportOrder, SupportInvoice, SupportInvoiceItem
from .serializers import UserSerializer
from payments.models import Payment, PendingPayment
from payments.serializers import PaymentSerializer

User = get_user_model()

# ==================== MESSAGES SUPPORT ====================

class SupportMessageListCreateView(generics.ListCreateAPIView):
    """Liste et création des messages support"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Si c'est un utilisateur normal, voir seulement ses messages
        if user.role == 'user':
            return SupportMessage.objects.filter(user=user)
        
        # Si c'est service client ou admin, voir tous les messages
        return SupportMessage.objects.all()
    
    def get_serializer_class(self):
        from .serializers_support import SupportMessageSerializer
        return SupportMessageSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def support_message_detail(request, message_id):
    """Détails et réponses d'un message support"""
    try:
        message = SupportMessage.objects.get(id=message_id)
        
        # Vérifier les permissions
        if request.user.role == 'user' and message.user != request.user:
            return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            from .serializers_support import SupportMessageDetailSerializer
            serializer = SupportMessageDetailSerializer(message)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Ajouter une réponse
            reply_text = request.data.get('reply_text')
            if not reply_text:
                return Response({'error': 'Le texte de la réponse est requis'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Vérifier que l'utilisateur peut répondre
            if not (request.user.is_staff or request.user.role in ['customer_service', 'admin']):
                return Response({'error': 'Seuls les membres du support peuvent répondre'}, status=status.HTTP_403_FORBIDDEN)
            
            reply = SupportReply.objects.create(
                message=message,
                reply_text=reply_text,
                is_from_support=True,
                created_by=request.user
            )
            
            # Mettre à jour le statut du message
            if message.status != 'replied':
                message.status = 'replied'
                message.save()
            
            from .serializers_support import SupportReplySerializer
            serializer = SupportReplySerializer(reply)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
    except SupportMessage.DoesNotExist:
        return Response({'error': 'Message non trouvé'}, status=status.HTTP_404_NOT_FOUND)

# ==================== CLIENTS SUPPORT ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_clients_list(request):
    """Liste des clients pour le support"""
    if not (request.user.is_staff or request.user.role in ['customer_service', 'admin']):
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    # Récupérer tous les utilisateurs avec leurs informations
    clients = User.objects.filter(role='user').select_related().prefetch_related('payments')
    
    # Filtrer par recherche si fournie
    search = request.GET.get('search')
    if search:
        clients = clients.filter(
            Q(username__icontains=search) |
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    # Filtrer par statut si fourni
    status_filter = request.GET.get('status')
    if status_filter:
        if status_filter == 'active':
            clients = clients.filter(is_active=True)
        elif status_filter == 'inactive':
            clients = clients.filter(is_active=False)
    
    clients_data = []
    for client in clients:
        # Calculer les statistiques du client
        payments = Payment.objects.filter(user=client)
        total_spent = sum(float(p.amount) for p in payments)
        
        # Compter les tickets de support
        support_tickets = SupportMessage.objects.filter(user=client).count()
        
        # Dernière connexion
        last_login = client.last_login if client.last_login else None
        
        clients_data.append({
            'id': client.id,
            'name': f"{client.first_name} {client.last_name}".strip() or client.username,
            'email': client.email,
            'phone': client.phone,
            'telegram_username': client.telegram_username,
            'discord_username': getattr(client, 'discord_username', None),
            'whatsapp_number': getattr(client, 'whatsapp_number', None),
            'is_active': client.is_active,
            'is_verified': client.is_verified,
            'role': client.role,
            'created_at': client.date_joined,
            'last_login': last_login,
            'total_spent': total_spent,
            'support_tickets': support_tickets,
            'payment_history': PaymentSerializer(payments, many=True).data
        })
    
    return Response(clients_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_client_detail(request, client_id):
    """Détails d'un client pour le support"""
    if not (request.user.is_staff or request.user.role in ['customer_service', 'admin']):
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        client = User.objects.get(id=client_id, role='user')
        
        # Récupérer les paiements
        payments = Payment.objects.filter(user=client)
        total_spent = sum(float(p.amount) for p in payments)
        
        # Récupérer les messages de support
        support_messages = SupportMessage.objects.filter(user=client)
        
        # Récupérer les commandes
        orders = SupportOrder.objects.filter(user=client)
        
        client_data = {
            'id': client.id,
            'name': f"{client.first_name} {client.last_name}".strip() or client.username,
            'email': client.email,
            'phone': client.phone,
            'telegram_username': client.telegram_username,
            'discord_username': getattr(client, 'discord_username', None),
            'whatsapp_number': getattr(client, 'whatsapp_number', None),
            'is_active': client.is_active,
            'is_verified': client.is_verified,
            'role': client.role,
            'created_at': client.date_joined,
            'last_login': client.last_login,
            'total_spent': total_spent,
            'support_tickets': support_messages.count(),
            'payment_history': PaymentSerializer(payments, many=True).data,
            'support_messages': [{
                'id': msg.id,
                'subject': msg.subject,
                'status': msg.status,
                'priority': msg.priority,
                'created_at': msg.created_at
            } for msg in support_messages],
            'orders': [{
                'id': order.id,
                'offer_name': order.offer_name,
                'status': order.status,
                'payment_status': order.payment_status,
                'price': float(order.price),
                'created_at': order.created_at
            } for order in orders]
        }
        
        return Response(client_data)
        
    except User.DoesNotExist:
        return Response({'error': 'Client non trouvé'}, status=status.HTTP_404_NOT_FOUND)

# ==================== REVENUS SUPPORT ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_revenues_stats(request):
    """Statistiques des revenus pour le support"""
    if not (request.user.is_staff or request.user.role in ['customer_service', 'admin']):
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    # Calculer les statistiques
    payments = Payment.objects.all()
    
    total_revenue = sum(float(p.amount) for p in payments)
    
    # Revenus ce mois
    current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month_payments = payments.filter(created_at__gte=current_month)
    this_month_revenue = sum(float(p.amount) for p in this_month_payments)
    
    # Revenus mois dernier
    last_month = (current_month - timedelta(days=1)).replace(day=1)
    last_month_payments = payments.filter(
        created_at__gte=last_month,
        created_at__lt=current_month
    )
    last_month_revenue = sum(float(p.amount) for p in last_month_payments)
    
    # Croissance
    growth = 0
    if last_month_revenue > 0:
        growth = ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100
    
    # Statistiques par offre
    offer_stats = {}
    for payment in payments:
        offer_name = getattr(payment, 'offer_name', 'Offre inconnue')
        if offer_name not in offer_stats:
            offer_stats[offer_name] = {'count': 0, 'revenue': 0}
        offer_stats[offer_name]['count'] += 1
        offer_stats[offer_name]['revenue'] += float(payment.amount)
    
    offer_stats_list = [
        {
            'name': name,
            'count': stats['count'],
            'revenue': stats['revenue'],
            'currency': 'EUR'
        }
        for name, stats in offer_stats.items()
    ]
    offer_stats_list.sort(key=lambda x: x['revenue'], reverse=True)
    
    return Response({
        'total_revenue': total_revenue,
        'this_month': this_month_revenue,
        'last_month': last_month_revenue,
        'growth': growth,
        'total_transactions': payments.count(),
        'offer_stats': offer_stats_list,
        'recent_payments': PaymentSerializer(payments[:10], many=True).data
    })

# ==================== COMMANDES SUPPORT ====================

class SupportOrderListCreateView(generics.ListCreateAPIView):
    """Liste et création des commandes support"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Si c'est un utilisateur normal, voir seulement ses commandes
        if user.role == 'user':
            return SupportOrder.objects.filter(user=user)
        
        # Si c'est service client ou admin, voir toutes les commandes
        return SupportOrder.objects.all()
    
    def get_serializer_class(self):
        from .serializers_support import SupportOrderSerializer
        return SupportOrderSerializer

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def support_order_detail(request, order_id):
    """Détails et mise à jour d'une commande support"""
    try:
        order = SupportOrder.objects.get(id=order_id)
        
        # Vérifier les permissions
        if request.user.role == 'user' and order.user != request.user:
            return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            from .serializers_support import SupportOrderSerializer
            serializer = SupportOrderSerializer(order)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            # Mettre à jour la commande
            if not (request.user.is_staff or request.user.role in ['customer_service', 'admin']):
                return Response({'error': 'Seuls les membres du support peuvent modifier les commandes'}, status=status.HTTP_403_FORBIDDEN)
            
            from .serializers_support import SupportOrderSerializer
            serializer = SupportOrderSerializer(order, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except SupportOrder.DoesNotExist:
        return Response({'error': 'Commande non trouvée'}, status=status.HTTP_404_NOT_FOUND)

# ==================== FACTURES SUPPORT ====================

class SupportInvoiceListCreateView(generics.ListCreateAPIView):
    """Liste et création des factures support"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Si c'est un utilisateur normal, voir seulement ses factures
        if user.role == 'user':
            return SupportInvoice.objects.filter(user=user)
        
        # Si c'est service client ou admin, voir toutes les factures
        return SupportInvoice.objects.all()
    
    def get_serializer_class(self):
        from .serializers_support import SupportInvoiceSerializer
        return SupportInvoiceSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_invoice_detail(request, invoice_id):
    """Détails d'une facture support"""
    try:
        invoice = SupportInvoice.objects.get(id=invoice_id)
        
        # Vérifier les permissions
        if request.user.role == 'user' and invoice.user != request.user:
            return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        
        from .serializers_support import SupportInvoiceDetailSerializer
        serializer = SupportInvoiceDetailSerializer(invoice)
        return Response(serializer.data)
        
    except SupportInvoice.DoesNotExist:
        return Response({'error': 'Facture non trouvée'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def support_invoice_generate_pdf(request, invoice_id):
    """Générer le PDF d'une facture"""
    if not (request.user.is_staff or request.user.role in ['customer_service', 'admin']):
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        invoice = SupportInvoice.objects.get(id=invoice_id)
        
        # Générer le PDF (utiliser la logique existante)
        from payments.pdf_generator import generate_invoice_pdf
        pdf_path = generate_invoice_pdf(invoice)
        
        return Response({
            'message': 'PDF généré avec succès',
            'pdf_url': f'/media/invoices/{invoice.invoice_number}.pdf'
        })
        
    except SupportInvoice.DoesNotExist:
        return Response({'error': 'Facture non trouvée'}, status=status.HTTP_404_NOT_FOUND)

# ==================== DASHBOARD SUPPORT ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_dashboard_stats(request):
    """Statistiques du dashboard support"""
    if not (request.user.is_staff or request.user.role in ['customer_service', 'admin']):
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)
    
    # Statistiques générales
    total_users = User.objects.filter(role='user').count()
    active_users = User.objects.filter(role='user', is_active=True).count()
    
    # Paiements
    pending_payments = PendingPayment.objects.filter(
        status__in=['pending', 'transaction_submitted']
    ).count()
    
    payments = Payment.objects.all()
    total_revenue = sum(float(p.amount) for p in payments)
    
    # Messages
    unread_messages = SupportMessage.objects.filter(status='unread').count()
    
    # Commandes
    pending_orders = SupportOrder.objects.filter(status='pending').count()
    
    # Factures
    overdue_invoices = SupportInvoice.objects.filter(
        status='sent',
        due_date__lt=timezone.now().date()
    ).count()
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'pending_payments': pending_payments,
        'total_revenue': total_revenue,
        'unread_messages': unread_messages,
        'pending_orders': pending_orders,
        'overdue_invoices': overdue_invoices
    })
