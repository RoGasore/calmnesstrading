from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Formation, Signal, GestionCompte, ServiceContent

User = get_user_model()

class FormationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Formation
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class FormationListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Formation
        fields = ['id', 'title', 'slug', 'price', 'badge', 'level', 'status', 'duration', 'lessons_count', 'students_count', 'rating', 'created_at', 'created_by_name']

class SignalSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Signal
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']

class SignalListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Signal
        fields = ['id', 'pair', 'signal_type', 'status', 'entry_price', 'target_price', 'stop_loss', 'risk_level', 'timeframe', 'pips_result', 'created_at', 'created_by_name']

class GestionCompteSerializer(serializers.ModelSerializer):
    managed_by_name = serializers.CharField(source='managed_by.full_name', read_only=True)
    
    class Meta:
        model = GestionCompte
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'managed_by']

class GestionCompteListSerializer(serializers.ModelSerializer):
    managed_by_name = serializers.CharField(source='managed_by.full_name', read_only=True)
    
    class Meta:
        model = GestionCompte
        fields = ['id', 'client_name', 'client_email', 'account_balance', 'risk_profile', 'status', 'total_profit', 'profit_percentage', 'start_date', 'managed_by_name']

class ServiceContentSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True)
    
    class Meta:
        model = ServiceContent
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'updated_by']
