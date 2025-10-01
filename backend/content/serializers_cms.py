from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.core.validators import MinLengthValidator
from .models_cms import Page, ContentSection, ContentVersion, AdminPassword, ContentEditSession, ContentChange

User = get_user_model()

class PageSerializer(serializers.ModelSerializer):
    sections_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Page
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_sections_count(self, obj):
        return obj.sections.count()

class PageListSerializer(serializers.ModelSerializer):
    sections_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Page
        fields = ['id', 'name', 'slug', 'title', 'is_active', 'sections_count', 'created_at', 'updated_at']
    
    def get_sections_count(self, obj):
        return obj.sections.count()

class ContentSectionSerializer(serializers.ModelSerializer):
    page_title = serializers.CharField(source='page.title', read_only=True)
    versions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentSection
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_versions_count(self, obj):
        return obj.versions.count()

class ContentSectionListSerializer(serializers.ModelSerializer):
    page_title = serializers.CharField(source='page.title', read_only=True)
    
    class Meta:
        model = ContentSection
        fields = ['id', 'page', 'page_title', 'section_key', 'content_type', 'title', 'order', 'is_editable', 'is_visible', 'created_at', 'updated_at']

class ContentVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = ContentVersion
        fields = '__all__'
        read_only_fields = ['created_at', 'created_by']

class AdminPasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[MinLengthValidator(8)])
    updated_by_name = serializers.CharField(source='updated_by.full_name', read_only=True)
    
    class Meta:
        model = AdminPassword
        fields = ['id', 'is_active', 'created_at', 'updated_at', 'updated_by_name', 'password']
        read_only_fields = ['created_at', 'updated_at', 'updated_by']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['password_hash'] = make_password(password)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            validated_data['password_hash'] = make_password(password)
        return super().update(instance, validated_data)

class AdminPasswordVerifySerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    
    def validate_password(self, value):
        # Vérifier le mot de passe contre le hash stocké
        try:
            admin_password = AdminPassword.objects.filter(is_active=True).first()
            if not admin_password or not check_password(value, admin_password.password_hash):
                raise serializers.ValidationError("Mot de passe admin incorrect")
        except AdminPassword.DoesNotExist:
            raise serializers.ValidationError("Aucun mot de passe admin configuré")
        return value

class ContentEditSessionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    page_title = serializers.CharField(source='page.title', read_only=True)
    
    class Meta:
        model = ContentEditSession
        fields = '__all__'
        read_only_fields = ['started_at', 'last_activity']

class ContentChangeSerializer(serializers.ModelSerializer):
    section_key = serializers.CharField(source='section.section_key', read_only=True)
    
    class Meta:
        model = ContentChange
        fields = '__all__'
        read_only_fields = ['created_at']

class ContentChangeCreateSerializer(serializers.Serializer):
    section_id = serializers.IntegerField()
    field_name = serializers.CharField(max_length=50)
    new_value = serializers.CharField(allow_blank=True)
    change_type = serializers.ChoiceField(choices=['update', 'create', 'delete'])
    
    def validate_section_id(self, value):
        try:
            ContentSection.objects.get(id=value)
        except ContentSection.DoesNotExist:
            raise serializers.ValidationError("Section introuvable")
        return value

class ContentBulkUpdateSerializer(serializers.Serializer):
    changes = ContentChangeCreateSerializer(many=True)
    
    def validate_changes(self, value):
        if not value:
            raise serializers.ValidationError("Aucun changement fourni")
        return value

class ContentPreviewSerializer(serializers.Serializer):
    """Serializer pour la prévisualisation du contenu"""
    page_id = serializers.IntegerField()
    sections = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=True
    )
    
    def validate_page_id(self, value):
        try:
            Page.objects.get(id=value)
        except Page.DoesNotExist:
            raise serializers.ValidationError("Page introuvable")
        return value
