from django.contrib import admin
from .models import Offer, PendingPayment, Payment, Subscription, PaymentHistory, ContactChannel


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['name', 'offer_type', 'price', 'currency', 'duration_days', 'is_active', 'created_at']
    list_filter = ['offer_type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['offer_type', 'price']


@admin.register(PendingPayment)
class PendingPaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'offer', 'amount', 'currency', 'status', 'contact_method', 'created_at']
    list_filter = ['status', 'contact_method', 'created_at']
    search_fields = ['user__email', 'user__username', 'offer__name', 'contact_info']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'offer', 'amount', 'currency', 'payment_method', 'status', 'paid_at']
    list_filter = ['status', 'payment_method', 'paid_at']
    search_fields = ['user__email', 'user__username', 'offer__name', 'transaction_id']
    ordering = ['-paid_at']
    readonly_fields = ['paid_at']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'offer', 'status', 'start_date', 'end_date', 'telegram_added', 'discord_added']
    list_filter = ['status', 'telegram_added', 'discord_added', 'start_date']
    search_fields = ['user__email', 'user__username', 'offer__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PaymentHistory)
class PaymentHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'action', 'created_by', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['description']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


@admin.register(ContactChannel)
class ContactChannelAdmin(admin.ModelAdmin):
    list_display = ['channel_type', 'contact_info', 'is_active', 'display_order']
    list_filter = ['channel_type', 'is_active']
    ordering = ['display_order', 'channel_type']
