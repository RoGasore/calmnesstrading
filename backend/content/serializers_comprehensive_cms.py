from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_comprehensive_cms import (
    GlobalSettings, PageCategory, SitePage, ContentBlock, ComprehensiveContentVersion,
    Testimonial, FAQItem, Offer, ComprehensiveEditSession, ComprehensivePendingChange,
    ContactField, Review
)

User = get_user_model()

# ==================== PARAMÈTRES GLOBAUX ====================

class GlobalSettingsSerializer(serializers.ModelSerializer):
    """Serializer pour les paramètres globaux"""
    
    class Meta:
        model = GlobalSettings
        fields = [
            'id', 'site_name', 'site_tagline', 'site_description',
            'email_contact', 'phone_contact', 'contact_email', 'contact_phone', 'address',
            'contact_title', 'business_hours', 'telegram_support', 'support_description',
            'telegram_url', 'discord_url', 'facebook_url', 'twitter_url', 'linkedin_url',
            'social_networks', 'copyright_text',
            'created_at', 'updated_at', 'updated_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class GlobalSettingsUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour des paramètres globaux"""
    
    class Meta:
        model = GlobalSettings
        fields = [
            'site_name', 'site_tagline', 'site_description',
            'email_contact', 'phone_contact', 'contact_email', 'contact_phone', 'address',
            'contact_title', 'business_hours', 'telegram_support', 'support_description',
            'telegram_url', 'discord_url', 'facebook_url', 'twitter_url', 'linkedin_url',
            'social_networks', 'copyright_text'
        ]

# ==================== CATÉGORIES DE PAGES ====================

class PageCategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de pages"""
    
    class Meta:
        model = PageCategory
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'order', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PageCategoryListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de catégories"""
    
    pages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PageCategory
        fields = ['id', 'name', 'slug', 'icon', 'order', 'is_active', 'pages_count']
    
    def get_pages_count(self, obj):
        return obj.sitepage_set.filter(is_active=True).count()

# ==================== PAGES DU SITE ====================

class SitePageSerializer(serializers.ModelSerializer):
    """Serializer pour les pages du site"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    content_blocks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SitePage
        fields = [
            'id', 'name', 'slug', 'title', 'description', 'category', 'category_name',
            'meta_title', 'meta_description', 'meta_keywords',
            'is_active', 'is_public', 'content_blocks_count',
            'created_at', 'updated_at', 'updated_by', 'updated_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_content_blocks_count(self, obj):
        return obj.content_blocks.filter(is_visible=True).count()

class SitePageListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de pages"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = SitePage
        fields = [
            'id', 'name', 'slug', 'title', 'category_name',
            'is_active', 'is_public', 'updated_at'
        ]

class SitePageCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/mettre à jour les pages"""
    
    class Meta:
        model = SitePage
        fields = [
            'name', 'slug', 'title', 'description', 'category',
            'meta_title', 'meta_description', 'meta_keywords',
            'is_active', 'is_public'
        ]

# ==================== BLOCS DE CONTENU ====================

class ContentBlockSerializer(serializers.ModelSerializer):
    """Serializer pour les blocs de contenu"""
    
    page_name = serializers.CharField(source='page.name', read_only=True)
    page_title = serializers.CharField(source='page.title', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    versions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentBlock
        fields = [
            'id', 'page', 'page_name', 'page_title', 'block_key', 'content_type',
            'title', 'content', 'metadata', 'css_classes', 'order',
            'is_visible', 'is_editable', 'versions_count',
            'created_at', 'updated_at', 'updated_by', 'updated_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_versions_count(self, obj):
        return obj.comprehensive_versions.count()

class ContentBlockListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de blocs"""
    
    page_name = serializers.CharField(source='page.name', read_only=True)
    content_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentBlock
        fields = [
            'id', 'page_name', 'block_key', 'content_type', 'title',
            'content_preview', 'order', 'is_visible', 'updated_at'
        ]
    
    def get_content_preview(self, obj):
        """Afficher un aperçu du contenu (100 caractères max)"""
        if obj.content:
            return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
        return ""

class ContentBlockCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/mettre à jour les blocs"""
    
    class Meta:
        model = ContentBlock
        fields = [
            'page', 'block_key', 'content_type', 'title', 'content',
            'metadata', 'css_classes', 'order', 'is_visible', 'is_editable'
        ]

# ==================== VERSIONS DE CONTENU ====================

class ComprehensiveContentVersionSerializer(serializers.ModelSerializer):
    """Serializer pour les versions de contenu"""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    block_key = serializers.CharField(source='content_block.block_key', read_only=True)
    
    class Meta:
        model = ComprehensiveContentVersion
        fields = [
            'id', 'content_block', 'block_key', 'title', 'content', 'metadata',
            'version_number', 'change_summary', 'created_at', 'created_by', 'created_by_username'
        ]
        read_only_fields = ['id', 'created_at']

class ComprehensiveContentVersionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une version de contenu"""
    
    class Meta:
        model = ComprehensiveContentVersion
        fields = ['content_block', 'title', 'content', 'metadata', 'change_summary']

# ==================== TÉMOIGNAGES ====================

class TestimonialSerializer(serializers.ModelSerializer):
    """Serializer pour les témoignages"""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client_name', 'client_initials', 'client_role', 'client_avatar',
            'testimonial_text', 'rating', 'status', 'is_featured', 'order',
            'created_at', 'updated_at', 'created_by', 'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class TestimonialListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de témoignages"""
    
    testimonial_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client_name', 'client_role', 'rating', 'testimonial_preview',
            'status', 'is_featured', 'order', 'created_at'
        ]
    
    def get_testimonial_preview(self, obj):
        """Afficher un aperçu du témoignage (150 caractères max)"""
        if obj.testimonial_text:
            return obj.testimonial_text[:150] + "..." if len(obj.testimonial_text) > 150 else obj.testimonial_text
        return ""

class TestimonialCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/mettre à jour les témoignages"""
    
    class Meta:
        model = Testimonial
        fields = [
            'client_name', 'client_initials', 'client_role', 'client_avatar',
            'testimonial_text', 'rating', 'status', 'is_featured', 'order'
        ]

# ==================== FAQ ====================

class FAQItemSerializer(serializers.ModelSerializer):
    """Serializer pour les éléments FAQ"""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = FAQItem
        fields = [
            'id', 'question', 'answer', 'category', 'category_display',
            'keywords', 'search_tags', 'status', 'is_featured', 'order',
            'views_count', 'created_at', 'updated_at', 'created_by', 'created_by_username'
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']

class FAQItemListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes FAQ"""
    
    answer_preview = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = FAQItem
        fields = [
            'id', 'question', 'answer_preview', 'category', 'category_display',
            'status', 'is_featured', 'order', 'views_count', 'created_at'
        ]
    
    def get_answer_preview(self, obj):
        """Afficher un aperçu de la réponse (200 caractères max)"""
        if obj.answer:
            return obj.answer[:200] + "..." if len(obj.answer) > 200 else obj.answer
        return ""

class FAQItemCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/mettre à jour les FAQ"""
    
    class Meta:
        model = FAQItem
        fields = [
            'question', 'answer', 'category', 'keywords', 'search_tags',
            'status', 'is_featured', 'order'
        ]

# ==================== OFFRES ====================

class OfferSerializer(serializers.ModelSerializer):
    """Serializer pour les offres"""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    type_display = serializers.CharField(source='get_offer_type_display', read_only=True)
    final_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'offer_type', 'type_display',
            'price', 'currency', 'is_free', 'discount_percentage', 'final_price',
            'features', 'benefits', 'requirements', 'status', 'is_featured', 'is_popular', 'order',
            'image_url', 'icon', 'color_theme', 'meta_title', 'meta_description',
            'created_at', 'updated_at', 'created_by', 'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class OfferListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes d'offres"""
    
    description_preview = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_offer_type_display', read_only=True)
    final_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'slug', 'description_preview', 'offer_type', 'type_display',
            'price', 'currency', 'is_free', 'final_price', 'status', 'is_featured',
            'is_popular', 'order', 'image_url', 'icon', 'color_theme', 'created_at'
        ]
    
    def get_description_preview(self, obj):
        """Afficher un aperçu de la description (150 caractères max)"""
        if obj.description:
            return obj.description[:150] + "..." if len(obj.description) > 150 else obj.description
        return ""

class OfferCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour créer/mettre à jour les offres"""
    
    class Meta:
        model = Offer
        fields = [
            'name', 'slug', 'description', 'short_description', 'offer_type',
            'price', 'currency', 'is_free', 'discount_percentage',
            'features', 'benefits', 'requirements', 'status', 'is_featured', 'is_popular', 'order',
            'image_url', 'icon', 'color_theme', 'meta_title', 'meta_description'
        ]

# ==================== SESSIONS D'ÉDITION ====================

class ComprehensiveEditSessionSerializer(serializers.ModelSerializer):
    """Serializer pour les sessions d'édition"""
    
    user_username = serializers.CharField(source='user.username', read_only=True)
    page_name = serializers.CharField(source='page.name', read_only=True)
    page_title = serializers.CharField(source='page.title', read_only=True)
    pending_changes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ComprehensiveEditSession
        fields = [
            'id', 'user', 'user_username', 'page', 'page_name', 'page_title',
            'is_active', 'started_at', 'last_activity', 'pending_changes_count'
        ]
        read_only_fields = ['id', 'started_at', 'last_activity']
    
    def get_pending_changes_count(self, obj):
        return obj.pending_changes.count()

class ComprehensiveEditSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une session d'édition"""
    
    class Meta:
        model = ComprehensiveEditSession
        fields = ['page']

# ==================== CHANGEMENTS EN ATTENTE ====================

class ComprehensivePendingChangeSerializer(serializers.ModelSerializer):
    """Serializer pour les changements en attente"""
    
    session_id = serializers.IntegerField(source='session.id', read_only=True)
    block_key = serializers.CharField(source='content_block.block_key', read_only=True)
    page_name = serializers.CharField(source='content_block.page.name', read_only=True)
    
    class Meta:
        model = ComprehensivePendingChange
        fields = [
            'id', 'session', 'session_id', 'content_block', 'block_key', 'page_name',
            'field_name', 'old_value', 'new_value', 'change_type', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class ComprehensivePendingChangeCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un changement en attente"""
    
    class Meta:
        model = ComprehensivePendingChange
        fields = ['content_block', 'field_name', 'old_value', 'new_value', 'change_type']

# ==================== SERIALIZERS POUR L'API PUBLIQUE ====================

class PublicContentBlockSerializer(serializers.ModelSerializer):
    """Serializer public pour les blocs de contenu (sans informations sensibles)"""
    
    class Meta:
        model = ContentBlock
        fields = [
            'id', 'block_key', 'content_type', 'title', 'content', 'metadata', 'css_classes', 'order'
        ]

class PublicSitePageSerializer(serializers.ModelSerializer):
    """Serializer public pour les pages du site"""
    
    content_blocks = PublicContentBlockSerializer(many=True, read_only=True)
    
    class Meta:
        model = SitePage
        fields = [
            'id', 'name', 'slug', 'title', 'description',
            'meta_title', 'meta_description', 'content_blocks'
        ]

class PublicTestimonialSerializer(serializers.ModelSerializer):
    """Serializer public pour les témoignages"""
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'client_name', 'client_initials', 'client_role', 'client_avatar',
            'testimonial_text', 'rating', 'order'
        ]

class PublicFAQItemSerializer(serializers.ModelSerializer):
    """Serializer public pour les FAQ"""
    
    class Meta:
        model = FAQItem
        fields = [
            'id', 'question', 'answer', 'category', 'keywords', 'order'
        ]

class PublicOfferSerializer(serializers.ModelSerializer):
    """Serializer public pour les offres"""
    
    final_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Offer
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'offer_type',
            'price', 'currency', 'is_free', 'final_price', 'features', 'benefits',
            'image_url', 'icon', 'color_theme', 'order'
        ]

# ==================== SERIALIZERS POUR LES STATISTIQUES ====================

class ContentStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de contenu"""
    
    total_pages = serializers.IntegerField()
    total_content_blocks = serializers.IntegerField()
    total_testimonials = serializers.IntegerField()
    total_faq_items = serializers.IntegerField()
    total_offers = serializers.IntegerField()
    
    published_pages = serializers.IntegerField()
    published_testimonials = serializers.IntegerField()
    published_faq_items = serializers.IntegerField()
    published_offers = serializers.IntegerField()
    
    draft_pages = serializers.IntegerField()
    draft_testimonials = serializers.IntegerField()
    draft_faq_items = serializers.IntegerField()
    draft_offers = serializers.IntegerField()

# ==================== SERIALIZERS POUR LES RECHERCHES ====================

class FAQSearchSerializer(serializers.ModelSerializer):
    """Serializer pour les résultats de recherche FAQ"""
    
    class Meta:
        model = FAQItem
        fields = ['id', 'question', 'answer', 'category', 'keywords']

class ContentSearchSerializer(serializers.Serializer):
    """Serializer pour les résultats de recherche de contenu"""
    
    content_type = serializers.CharField()  # 'page', 'block', 'faq', 'testimonial', 'offer'
    id = serializers.IntegerField()
    title = serializers.CharField()
    content = serializers.CharField()
    url = serializers.CharField()
    relevance_score = serializers.FloatField()

# ==================== CHAMPS DE CONTACT ====================

class ContactFieldSerializer(serializers.ModelSerializer):
    """Serializer pour les champs de contact"""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    field_type_display = serializers.CharField(source='get_field_type_display', read_only=True)
    options_list = serializers.SerializerMethodField()
    
    class Meta:
        model = ContactField
        fields = [
            'id', 'field_name', 'field_label', 'field_type', 'field_type_display',
            'field_placeholder', 'is_required', 'is_visible', 'options', 'options_list',
            'validation_pattern', 'validation_message', 'order', 'css_classes',
            'help_text', 'created_at', 'updated_at', 'created_by', 'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_options_list(self, obj):
        """Retourne la liste des options du champ"""
        return obj.get_options_list()
    
    def validate_field_name(self, value):
        """Valider que le nom du champ est unique et conforme"""
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom du champ ne peut pas être vide")
        
        # Vérifier que le nom du champ ne contient que des caractères valides
        import re
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9_]*$', value):
            raise serializers.ValidationError(
                "Le nom du champ doit commencer par une lettre et ne contenir que des lettres, chiffres et underscores"
            )
        
        return value.strip()

class ContactFieldListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de champs de contact"""
    
    field_type_display = serializers.CharField(source='get_field_type_display', read_only=True)
    
    class Meta:
        model = ContactField
        fields = [
            'id', 'field_name', 'field_label', 'field_type', 'field_type_display',
            'is_required', 'is_visible', 'order'
        ]

# ==================== AVIS CLIENTS ====================

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer pour les avis clients"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'author_name', 'author_email', 'author_phone',
            'service_name', 'service_type', 'title', 'content', 'rating',
            'status', 'status_display', 'is_featured', 'is_public', 'order',
            'created_at', 'updated_at', 'approved_at', 'approved_by', 'approved_by_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'approved_at', 'approved_by']

class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un avis (public)"""
    
    class Meta:
        model = Review
        fields = [
            'author_name', 'author_email', 'author_phone',
            'service_name', 'service_type', 'title', 'content', 'rating'
        ]

class ReviewListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes d'avis"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'author_name', 'service_name', 'service_type', 'title',
            'rating', 'status', 'status_display', 'is_featured', 'is_public',
            'created_at'
        ]
