from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Offer, PendingPayment, Payment, Subscription, PaymentHistory, ContactChannel

User = get_user_model()


class OfferSerializer(serializers.ModelSerializer):
    """Serializer pour les offres"""
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'description', 'offer_type', 'price', 'currency',
            'duration_days', 'color_theme', 'metadata', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContactChannelSerializer(serializers.ModelSerializer):
    """Serializer pour les canaux de contact"""
    
    class Meta:
        model = ContactChannel
        fields = [
            'id', 'channel_type', 'contact_info', 'contact_link',
            'is_active', 'display_order', 'instructions'
        ]
        read_only_fields = ['id']


class PendingPaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un paiement en attente"""
    
    class Meta:
        model = PendingPayment
        fields = [
            'offer', 'contact_method', 'contact_info', 'amount', 'currency'
        ]
    
    def create(self, validated_data):
        # Ajouter l'utilisateur depuis le context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PendingPaymentSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les paiements en attente"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    offer_name = serializers.CharField(source='offer.name', read_only=True)
    offer_type = serializers.CharField(source='offer.offer_type', read_only=True)
    
    validated_by_email = serializers.CharField(source='validated_by.email', read_only=True)
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    contact_method_display = serializers.CharField(source='get_contact_method_display', read_only=True)
    
    class Meta:
        model = PendingPayment
        fields = [
            'id', 'user', 'user_id', 'user_email', 'user_username', 'user_first_name', 'user_last_name',
            'offer', 'offer_name', 'offer_type', 'contact_method', 'contact_method_display',
            'contact_info', 'amount', 'currency', 'status', 'status_display',
            'created_at', 'updated_at', 'admin_notes', 'validated_by', 'validated_by_email', 'validated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'validated_by', 'validated_at']


class PendingPaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un paiement en attente (admin)"""
    
    class Meta:
        model = PendingPayment
        fields = ['status', 'admin_notes']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements validés"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    offer_name = serializers.CharField(source='offer.name', read_only=True)
    offer_type = serializers.CharField(source='offer.offer_type', read_only=True)
    
    validated_by_email = serializers.CharField(source='validated_by.email', read_only=True)
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_id', 'user_email', 'user_username',
            'offer', 'offer_name', 'offer_type', 'pending_payment',
            'amount', 'currency', 'payment_method', 'payment_method_display',
            'status', 'status_display', 'paid_at', 'transaction_id',
            'validated_by', 'validated_by_email', 'admin_notes'
        ]
        read_only_fields = ['id', 'user', 'paid_at', 'validated_by']


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer pour les abonnements"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    offer_name = serializers.CharField(source='offer.name', read_only=True)
    offer_type = serializers.CharField(source='offer.offer_type', read_only=True)
    
    payment_amount = serializers.DecimalField(source='payment.amount', max_digits=10, decimal_places=2, read_only=True)
    payment_date = serializers.DateTimeField(source='payment.paid_at', read_only=True)
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Champs calculés
    is_active_now = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    hours_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'user_id', 'user_email',
            'offer', 'offer_name', 'offer_type', 'payment', 'payment_amount', 'payment_date',
            'start_date', 'end_date', 'status', 'status_display',
            'telegram_added', 'discord_added',
            'is_active_now', 'days_remaining', 'hours_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_is_active_now(self, obj):
        return obj.is_active()
    
    def get_days_remaining(self, obj):
        return obj.days_remaining()
    
    def get_hours_remaining(self, obj):
        return obj.hours_remaining()


class PaymentHistorySerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des paiements"""
    
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = [
            'id', 'payment', 'pending_payment', 'action', 'action_display',
            'description', 'created_by', 'created_by_email', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class ValidatePaymentSerializer(serializers.Serializer):
    """Serializer pour valider un paiement en attente"""
    
    pending_payment_id = serializers.IntegerField()
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_pending_payment_id(self, value):
        if not PendingPayment.objects.filter(id=value, status='pending').exists():
            raise serializers.ValidationError("Paiement en attente non trouvé ou déjà traité.")
        return value


class UserDashboardSerializer(serializers.Serializer):
    """Serializer pour le dashboard utilisateur"""
    
    active_subscriptions = SubscriptionSerializer(many=True, read_only=True)
    payment_history = PaymentSerializer(many=True, read_only=True)
    pending_payments = PendingPaymentSerializer(many=True, read_only=True)
    total_spent = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

