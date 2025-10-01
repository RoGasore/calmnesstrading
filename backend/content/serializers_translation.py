from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_cms import Translation, ContentSection
from .deepl_service import deepl_service

User = get_user_model()

class TranslationSerializer(serializers.ModelSerializer):
    """Serializer pour les traductions"""
    
    language_display = serializers.CharField(source='get_language_display', read_only=True)
    section_key = serializers.CharField(source='section.section_key', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = Translation
        fields = [
            'id', 'section', 'section_key', 'field_name', 'language', 
            'language_display', 'translated_content', 'is_auto_generated',
            'is_manual_override', 'created_at', 'updated_at', 'created_by',
            'created_by_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

class TranslationCreateSerializer(serializers.Serializer):
    """Serializer pour créer des traductions"""
    
    section_id = serializers.IntegerField()
    field_name = serializers.CharField(max_length=50)
    source_language = serializers.CharField(default='fr')
    target_languages = serializers.ListField(
        child=serializers.CharField(max_length=5),
        default=['en', 'es']
    )
    
    def validate_section_id(self, value):
        try:
            ContentSection.objects.get(id=value)
        except ContentSection.DoesNotExist:
            raise serializers.ValidationError("Section non trouvée")
        return value
    
    def validate_target_languages(self, value):
        available_languages = list(deepl_service.get_available_languages().keys())
        for lang in value:
            if lang not in available_languages:
                raise serializers.ValidationError(f"Langue non supportée: {lang}")
        return value

class TranslationUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour une traduction"""
    
    class Meta:
        model = Translation
        fields = ['translated_content', 'is_manual_override']
    
    def update(self, instance, validated_data):
        # Marquer comme modification manuelle si le contenu est modifié
        if 'translated_content' in validated_data:
            validated_data['is_manual_override'] = True
            validated_data['is_auto_generated'] = False
        
        return super().update(instance, validated_data)

class TranslationBulkCreateSerializer(serializers.Serializer):
    """Serializer pour créer plusieurs traductions en une fois"""
    
    section_id = serializers.IntegerField()
    field_name = serializers.CharField(max_length=50)
    source_content = serializers.CharField()
    source_language = serializers.CharField(default='fr')
    
    def validate_section_id(self, value):
        try:
            ContentSection.objects.get(id=value)
        except ContentSection.DoesNotExist:
            raise serializers.ValidationError("Section non trouvée")
        return value

class TranslationListSerializer(serializers.ModelSerializer):
    """Serializer pour lister les traductions"""
    
    language_display = serializers.CharField(source='get_language_display', read_only=True)
    section_key = serializers.CharField(source='section.section_key', read_only=True)
    section_title = serializers.CharField(source='section.title', read_only=True)
    
    class Meta:
        model = Translation
        fields = [
            'id', 'section_key', 'section_title', 'field_name', 
            'language', 'language_display', 'translated_content',
            'is_auto_generated', 'is_manual_override', 'updated_at'
        ]

class TranslationStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de traduction"""
    
    total_translations = serializers.IntegerField()
    auto_generated = serializers.IntegerField()
    manual_overrides = serializers.IntegerField()
    by_language = serializers.DictField()
    missing_translations = serializers.ListField()
