from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
import json

from .models_comprehensive_cms import (
    GlobalSettings, PageCategory, SitePage, ContentBlock, ComprehensiveContentVersion,
    Testimonial, FAQItem, Offer, ComprehensiveEditSession, ComprehensivePendingChange
)

@admin.register(GlobalSettings)
class GlobalSettingsAdmin(admin.ModelAdmin):
    """Administration des paramètres globaux"""
    
    list_display = ['site_name', 'email_contact', 'phone_contact', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['site_name', 'site_tagline', 'email_contact']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('site_name', 'site_tagline', 'site_description')
        }),
        ('Contact', {
            'fields': ('email_contact', 'phone_contact', 'address')
        }),
        ('Réseaux sociaux', {
            'fields': ('social_networks',),
            'description': 'Format JSON: {"facebook": "url", "twitter": "url", "instagram": "url"}'
        }),
        ('Copyright', {
            'fields': ('copyright_text',)
        })
    )
    
    def has_add_permission(self, request):
        # Ne permettre qu'un seul objet de paramètres globaux
        return not GlobalSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(PageCategory)
class PageCategoryAdmin(admin.ModelAdmin):
    """Administration des catégories de pages"""
    
    list_display = ['name', 'slug', 'icon', 'order', 'is_active', 'pages_count']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    
    def pages_count(self, obj):
        count = obj.sitepage_set.count()
        if count > 0:
            url = reverse('admin:content_sitepage_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} pages</a>', url, count)
        return '0 pages'
    pages_count.short_description = 'Pages'

@admin.register(SitePage)
class SitePageAdmin(admin.ModelAdmin):
    """Administration des pages du site"""
    
    list_display = ['title', 'name', 'category', 'is_active', 'is_public', 'content_blocks_count', 'updated_at']
    list_filter = ['category', 'is_active', 'is_public', 'created_at', 'updated_at']
    search_fields = ['title', 'name', 'description', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'slug', 'title', 'description', 'category')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('État', {
            'fields': ('is_active', 'is_public')
        })
    )
    
    def content_blocks_count(self, obj):
        count = obj.content_blocks.count()
        if count > 0:
            url = reverse('admin:content_contentblock_changelist') + f'?page__id__exact={obj.id}'
            return format_html('<a href="{}">{} blocs</a>', url, count)
        return '0 blocs'
    content_blocks_count.short_description = 'Blocs de contenu'

@admin.register(ContentBlock)
class ContentBlockAdmin(admin.ModelAdmin):
    """Administration des blocs de contenu"""
    
    list_display = ['block_key', 'page', 'content_type', 'title_preview', 'is_visible', 'order', 'updated_at']
    list_filter = ['page', 'content_type', 'is_visible', 'is_editable', 'created_at', 'updated_at']
    search_fields = ['block_key', 'title', 'content', 'page__title']
    ordering = ['page', 'order', 'block_key']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('page', 'block_key', 'content_type', 'title', 'content')
        }),
        ('Style et position', {
            'fields': ('css_classes', 'order'),
            'classes': ('collapse',)
        }),
        ('État', {
            'fields': ('is_visible', 'is_editable'),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('metadata',),
            'classes': ('collapse',),
            'description': 'Données additionnelles au format JSON'
        })
    )
    
    def title_preview(self, obj):
        if obj.title:
            return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
        return '-'
    title_preview.short_description = 'Titre'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('page')

class ComprehensiveContentVersionInline(admin.TabularInline):
    """Inline pour les versions de contenu"""
    model = ComprehensiveContentVersion
    extra = 0
    readonly_fields = ['version_number', 'created_at', 'created_by']
    fields = ['version_number', 'title', 'change_summary', 'created_at', 'created_by']
    
    def has_add_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

@admin.register(ComprehensiveContentVersion)
class ComprehensiveContentVersionAdmin(admin.ModelAdmin):
    """Administration des versions de contenu"""
    
    list_display = ['content_block', 'version_number', 'title_preview', 'change_summary', 'created_at', 'created_by']
    list_filter = ['created_at', 'created_by']
    search_fields = ['content_block__block_key', 'title', 'change_summary']
    ordering = ['-created_at']
    readonly_fields = ['version_number', 'created_at']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('content_block', 'version_number', 'change_summary')
        }),
        ('Contenu', {
            'fields': ('title', 'content', 'metadata')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'created_by'),
            'classes': ('collapse',)
        })
    )
    
    def title_preview(self, obj):
        if obj.title:
            return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
        return '-'
    title_preview.short_description = 'Titre'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('content_block', 'created_by')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    """Administration des témoignages"""
    
    list_display = ['client_name', 'client_role', 'rating_stars', 'status', 'is_featured', 'order', 'created_at']
    list_filter = ['status', 'is_featured', 'rating', 'created_at']
    search_fields = ['client_name', 'client_role', 'testimonial_text']
    ordering = ['order', '-created_at']
    
    fieldsets = (
        ('Informations client', {
            'fields': ('client_name', 'client_initials', 'client_role', 'client_avatar')
        }),
        ('Témoignage', {
            'fields': ('testimonial_text', 'rating')
        }),
        ('État', {
            'fields': ('status', 'is_featured', 'order')
        })
    )
    
    def rating_stars(self, obj):
        stars = '★' * obj.rating + '☆' * (5 - obj.rating)
        return format_html('<span style="color: gold;">{}</span>', stars)
    rating_stars.short_description = 'Note'

@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    """Administration des FAQ"""
    
    list_display = ['question_preview', 'category', 'status', 'is_featured', 'views_count', 'created_at']
    list_filter = ['category', 'status', 'is_featured', 'created_at']
    search_fields = ['question', 'answer', 'keywords']
    ordering = ['category', 'order', '-is_featured']
    
    fieldsets = (
        ('Question', {
            'fields': ('question', 'answer')
        }),
        ('Catégorie et recherche', {
            'fields': ('category', 'keywords', 'search_tags')
        }),
        ('État', {
            'fields': ('status', 'is_featured', 'order')
        }),
        ('Statistiques', {
            'fields': ('views_count',),
            'classes': ('collapse',)
        })
    )
    
    def question_preview(self, obj):
        return obj.question[:100] + '...' if len(obj.question) > 100 else obj.question
    question_preview.short_description = 'Question'

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    """Administration des offres"""
    
    list_display = ['name', 'offer_type', 'price_display', 'status', 'is_featured', 'is_popular', 'order', 'created_at']
    list_filter = ['offer_type', 'status', 'is_featured', 'is_popular', 'is_free', 'created_at']
    search_fields = ['name', 'description', 'short_description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', '-is_featured']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'slug', 'description', 'short_description', 'offer_type')
        }),
        ('Prix et conditions', {
            'fields': ('price', 'currency', 'is_free', 'discount_percentage')
        }),
        ('Contenu détaillé', {
            'fields': ('features', 'benefits', 'requirements'),
            'classes': ('collapse',)
        }),
        ('État', {
            'fields': ('status', 'is_featured', 'is_popular', 'order')
        }),
        ('Visuel', {
            'fields': ('image_url', 'icon', 'color_theme'),
            'classes': ('collapse',)
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        })
    )
    
    def price_display(self, obj):
        if obj.is_free:
            return format_html('<span style="color: green; font-weight: bold;">GRATUIT</span>')
        elif obj.discount_percentage > 0:
            original_price = obj.price
            final_price = obj.final_price
            return format_html(
                '<span style="text-decoration: line-through;">{:.2f} {}</span> '
                '<span style="color: red; font-weight: bold;">{:.2f} {}</span> '
                '<span style="color: red;">(-{}%)</span>',
                original_price, obj.currency, final_price, obj.currency, obj.discount_percentage
            )
        else:
            return f"{obj.price:.2f} {obj.currency}"
    price_display.short_description = 'Prix'

@admin.register(ComprehensiveEditSession)
class ComprehensiveEditSessionAdmin(admin.ModelAdmin):
    """Administration des sessions d'édition"""
    
    list_display = ['user', 'page', 'is_active', 'started_at', 'last_activity', 'pending_changes_count']
    list_filter = ['is_active', 'started_at', 'last_activity']
    search_fields = ['user__username', 'user__email', 'page__title']
    ordering = ['-last_activity']
    readonly_fields = ['started_at', 'last_activity']
    
    def pending_changes_count(self, obj):
        count = obj.pending_changes.count()
        if count > 0:
            url = reverse('admin:content_pendingcontentchange_changelist') + f'?session__id__exact={obj.id}'
            return format_html('<a href="{}">{} changements</a>', url, count)
        return '0 changements'
    pending_changes_count.short_description = 'Changements en attente'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'page')

@admin.register(ComprehensivePendingChange)
class ComprehensivePendingChangeAdmin(admin.ModelAdmin):
    """Administration des changements en attente"""
    
    list_display = ['content_block', 'field_name', 'change_type', 'new_value_preview', 'created_at']
    list_filter = ['change_type', 'created_at']
    search_fields = ['content_block__block_key', 'field_name', 'new_value']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Changement', {
            'fields': ('session', 'content_block', 'field_name', 'change_type')
        }),
        ('Valeurs', {
            'fields': ('old_value', 'new_value')
        }),
        ('Métadonnées', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
    
    def new_value_preview(self, obj):
        if obj.new_value:
            return obj.new_value[:100] + '...' if len(obj.new_value) > 100 else obj.new_value
        return '-'
    new_value_preview.short_description = 'Nouvelle valeur'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('session', 'content_block')

# Configuration de l'admin
admin.site.site_header = "CALMNESS FI - Administration"
admin.site.site_title = "CALMNESS FI Admin"
admin.site.index_title = "Gestion de contenu"
