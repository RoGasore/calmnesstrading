from django.urls import path, include
from . import views_comprehensive_cms

app_name = 'comprehensive_cms'

urlpatterns = [
    # ==================== PARAMÈTRES GLOBAUX ====================
    path('global-settings/', views_comprehensive_cms.GlobalSettingsView.as_view(), name='global-settings'),
    path('global-settings/public/', views_comprehensive_cms.get_global_settings_public, name='global-settings-public'),
    
    # ==================== CATÉGORIES DE PAGES ====================
    path('categories/', views_comprehensive_cms.PageCategoryListView.as_view(), name='categories'),
    path('categories/<int:pk>/', views_comprehensive_cms.PageCategoryDetailView.as_view(), name='category-detail'),
    
    # ==================== PAGES DU SITE ====================
    path('pages/', views_comprehensive_cms.SitePageListView.as_view(), name='pages'),
    path('pages/<int:pk>/', views_comprehensive_cms.SitePageDetailView.as_view(), name='page-detail'),
    
    # ==================== BLOCS DE CONTENU ====================
    path('content-blocks/', views_comprehensive_cms.ContentBlockListView.as_view(), name='content-blocks'),
    path('content-blocks/<int:pk>/', views_comprehensive_cms.ContentBlockDetailView.as_view(), name='content-block-detail'),
    path('content-blocks/<int:block_id>/update-content/', views_comprehensive_cms.update_content_block_content, name='update-content-block-content'),
    path('pages/<str:slug>/content-blocks/', views_comprehensive_cms.get_page_content_blocks, name='page-content-blocks'),
    
    # ==================== VERSIONS DE CONTENU ====================
    path('content-blocks/<int:block_id>/versions/', views_comprehensive_cms.ComprehensiveContentVersionListView.as_view(), name='content-versions'),
    path('content-versions/<int:version_id>/restore/', views_comprehensive_cms.restore_content_version, name='restore-version'),
    
    # ==================== TÉMOIGNAGES ====================
    path('testimonials/', views_comprehensive_cms.TestimonialListView.as_view(), name='testimonials'),
    path('testimonials/<int:pk>/', views_comprehensive_cms.TestimonialDetailView.as_view(), name='testimonial-detail'),
    
    # ==================== FAQ ====================
    path('faq/', views_comprehensive_cms.FAQItemListView.as_view(), name='faq'),
    path('faq/<int:pk>/', views_comprehensive_cms.FAQItemDetailView.as_view(), name='faq-detail'),
    
    # ==================== CONTACT FIELDS ====================
    path('pages/contact/fields/', views_comprehensive_cms.ContactFieldListView.as_view(), name='contact-fields'),
    path('pages/contact/fields/<int:pk>/', views_comprehensive_cms.ContactFieldDetailView.as_view(), name='contact-field-detail'),
    
    # Public endpoints
    path('public/contact/fields/', views_comprehensive_cms.get_contact_fields_public, name='contact-fields-public'),
    
    # Cache management
    path('admin/clear-contact-cache/', views_comprehensive_cms.clear_contact_cache, name='clear-contact-cache'),
    
    # ==================== OFFRES ====================
    path('offers/', views_comprehensive_cms.OfferListView.as_view(), name='offers'),
    path('offers/<int:pk>/', views_comprehensive_cms.OfferDetailView.as_view(), name='offer-detail'),
    
    # ==================== SESSIONS D'ÉDITION ====================
    path('edit-sessions/', views_comprehensive_cms.ComprehensiveEditSessionListView.as_view(), name='edit-sessions'),
    path('edit-sessions/<int:session_id>/end/', views_comprehensive_cms.end_edit_session, name='end-edit-session'),
    
    # ==================== CHANGEMENTS EN ATTENTE ====================
    path('pending-changes/', views_comprehensive_cms.create_pending_change, name='create-pending-change'),
    path('pending-changes/apply/', views_comprehensive_cms.apply_comprehensive_pending_changes, name='apply-pending-changes'),
    path('pending-changes/list/', views_comprehensive_cms.get_comprehensive_pending_changes, name='list-pending-changes'),
    
    # ==================== APERÇU ====================
    path('preview/', views_comprehensive_cms.preview_content, name='preview-content'),
    
    # ==================== API PUBLIQUE ====================
    path('public/pages/<str:page_slug>/', views_comprehensive_cms.get_page_content_public, name='public-page-content'),
    path('public/pages/<str:page_slug>/content-blocks/', views_comprehensive_cms.get_page_content_blocks_public, name='public-page-content-blocks'),
    path('public/global-settings/', views_comprehensive_cms.get_global_settings_public, name='public-global-settings'),
    path('public/testimonials/', views_comprehensive_cms.get_testimonials_public, name='public-testimonials'),
    path('public/faq/', views_comprehensive_cms.get_faq_public, name='public-faq'),
    path('public/offers/', views_comprehensive_cms.get_offers_public, name='public-offers'),
    
    # ==================== RECHERCHE ====================
    path('search/faq/', views_comprehensive_cms.search_faq, name='search-faq'),
    path('search/content/', views_comprehensive_cms.search_content, name='search-content'),
    
    # ==================== STATISTIQUES ====================
    path('stats/', views_comprehensive_cms.get_content_stats, name='content-stats'),
    
    # ==================== AVIS CLIENTS ====================
    path('reviews/', views_comprehensive_cms.ReviewListView.as_view(), name='reviews'),
    path('reviews/<int:pk>/', views_comprehensive_cms.ReviewDetailView.as_view(), name='review-detail'),
    path('reviews/public/', views_comprehensive_cms.get_reviews_public, name='reviews-public'),
    path('reviews/create/', views_comprehensive_cms.create_review_public, name='create-review-public'),
    path('services-for-reviews/', views_comprehensive_cms.get_services_for_reviews, name='services-for-reviews'),
    
    # ==================== OPÉRATIONS EN MASSE ====================
    path('bulk/content-blocks/', views_comprehensive_cms.bulk_update_content_blocks, name='bulk-update-content-blocks'),
]
