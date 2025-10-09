from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_support import SupportMessage, SupportReply, SupportTicket, SupportOrder, SupportInvoice, SupportInvoiceItem

User = get_user_model()

class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer basique pour les utilisateurs"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'telegram_username']

class SupportMessageSerializer(serializers.ModelSerializer):
    """Serializer pour les messages support"""
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = SupportMessage
        fields = [
            'id', 'user', 'subject', 'message', 'priority', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class SupportReplySerializer(serializers.ModelSerializer):
    """Serializer pour les réponses support"""
    
    created_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = SupportReply
        fields = [
            'id', 'reply_text', 'is_from_support', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'is_from_support', 'created_by', 'created_at']

class SupportMessageDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour les messages support avec réponses"""
    
    user = UserBasicSerializer(read_only=True)
    replies = SupportReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = SupportMessage
        fields = [
            'id', 'user', 'subject', 'message', 'priority', 'status',
            'created_at', 'updated_at', 'replies'
        ]

class SupportTicketSerializer(serializers.ModelSerializer):
    """Serializer pour les tickets support"""
    
    user = UserBasicSerializer(read_only=True)
    assigned_to = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'user', 'subject', 'category', 'status', 'priority',
            'description', 'resolution', 'assigned_to',
            'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class SupportOrderSerializer(serializers.ModelSerializer):
    """Serializer pour les commandes support"""
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = SupportOrder
        fields = [
            'id', 'user', 'offer_name', 'offer_description', 'price', 'currency',
            'status', 'payment_status', 'notes', 'tracking_info',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class SupportInvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer pour les articles de facture"""
    
    class Meta:
        model = SupportInvoiceItem
        fields = [
            'id', 'description', 'quantity', 'unit_price', 'total_price'
        ]

class SupportInvoiceSerializer(serializers.ModelSerializer):
    """Serializer pour les factures support"""
    
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = SupportInvoice
        fields = [
            'id', 'user', 'invoice_number', 'total_amount', 'currency',
            'status', 'due_date', 'paid_at', 'payment_method', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'invoice_number', 'created_at', 'updated_at']

class SupportInvoiceDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour les factures support avec articles"""
    
    user = UserBasicSerializer(read_only=True)
    items = SupportInvoiceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = SupportInvoice
        fields = [
            'id', 'user', 'invoice_number', 'total_amount', 'currency',
            'status', 'due_date', 'paid_at', 'payment_method', 'notes',
            'created_at', 'updated_at', 'items'
        ]
