from django.urls import path
from . import views, views_cms

urlpatterns = [
    # Formations
    path('formations/', views.FormationListView.as_view(), name='formation_list'),
    path('formations/<int:pk>/', views.FormationDetailView.as_view(), name='formation_detail'),
    
    # Signaux
    path('signaux/', views.SignalListView.as_view(), name='signal_list'),
    path('signaux/<int:pk>/', views.SignalDetailView.as_view(), name='signal_detail'),
    
    # Gestion de comptes
    path('gestion/', views.GestionCompteListView.as_view(), name='gestion_list'),
    path('gestion/<int:pk>/', views.GestionCompteDetailView.as_view(), name='gestion_detail'),
    
    # Contenu des services
    path('service-content/', views.ServiceContentView.as_view(), name='service_content'),
    
    # CMS - Pages
    path('cms/pages/', views_cms.PageListView.as_view(), name='cms_page_list'),
    path('cms/pages/<int:pk>/', views_cms.PageDetailView.as_view(), name='cms_page_detail'),
    path('cms/pages/public/<str:page_slug>/', views_cms.get_page_content, name='cms_page_public'),
    
    # CMS - Sections
    path('cms/sections/', views_cms.ContentSectionListView.as_view(), name='cms_section_list'),
    path('cms/sections/<int:pk>/', views_cms.ContentSectionDetailView.as_view(), name='cms_section_detail'),
    
    # CMS - Versions
    path('cms/sections/<int:section_id>/versions/', views_cms.ContentVersionListView.as_view(), name='cms_version_list'),
    
    # CMS - Mot de passe admin
    path('cms/admin-password/', views_cms.AdminPasswordView.as_view(), name='cms_admin_password'),
    path('cms/verify-admin-password/', views_cms.verify_admin_password, name='cms_verify_admin_password'),
    
    # CMS - Sessions d'édition
    path('cms/edit-sessions/', views_cms.ContentEditSessionView.as_view(), name='cms_edit_session_list'),
    path('cms/edit-sessions/<int:session_id>/end/', views_cms.end_edit_session, name='cms_end_edit_session'),
    
    # CMS - Changements
    path('cms/changes/', views_cms.create_content_change, name='cms_create_change'),
    path('cms/changes/pending/', views_cms.get_pending_changes, name='cms_pending_changes'),
    path('cms/bulk-update/', views_cms.bulk_update_content, name='cms_bulk_update'),
    path('cms/preview/', views_cms.preview_content, name='cms_preview'),
    
    # CMS - Traductions
    path('cms/translations/', views_cms.TranslationListView.as_view(), name='cms_translation_list'),
    path('cms/translations/<int:pk>/', views_cms.TranslationDetailView.as_view(), name='cms_translation_detail'),
    path('cms/translations/generate/', views_cms.generate_translations, name='cms_generate_translations'),
    path('cms/translations/section/<int:section_id>/', views_cms.get_section_translations, name='cms_section_translations'),
    path('cms/translations/stats/', views_cms.get_translation_stats, name='cms_translation_stats'),
    path('cms/translations/<int:translation_id>/regenerate/', views_cms.regenerate_translation, name='cms_regenerate_translation'),
]
