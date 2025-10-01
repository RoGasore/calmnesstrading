from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from .models_cms import (
    Page, ContentSection, ContentVersion, AdminPassword, 
    ContentEditSession, ContentChange, Translation
)
from .serializers_cms import (
    PageSerializer, PageListSerializer,
    ContentSectionSerializer, ContentSectionListSerializer,
    ContentVersionSerializer, AdminPasswordSerializer,
    AdminPasswordVerifySerializer, ContentEditSessionSerializer,
    ContentChangeSerializer, ContentChangeCreateSerializer,
    ContentBulkUpdateSerializer, ContentPreviewSerializer
)
from .serializers_translation import (
    TranslationSerializer, TranslationCreateSerializer, TranslationUpdateSerializer,
    TranslationBulkCreateSerializer, TranslationListSerializer, TranslationStatsSerializer
)
from .deepl_service import deepl_service

User = get_user_model()

# Pages
class PageListView(generics.ListCreateAPIView):
    queryset = Page.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PageListSerializer
        return PageSerializer

class PageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    permission_classes = [IsAuthenticated]

# Sections de contenu
class ContentSectionListView(generics.ListCreateAPIView):
    queryset = ContentSection.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ContentSectionListSerializer
        return ContentSectionSerializer
    
    def get_queryset(self):
        page_id = self.request.query_params.get('page_id')
        if page_id:
            return ContentSection.objects.filter(page_id=page_id)
        return ContentSection.objects.all()

class ContentSectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ContentSection.objects.all()
    serializer_class = ContentSectionSerializer
    permission_classes = [IsAuthenticated]

# Versions de contenu
class ContentVersionListView(generics.ListAPIView):
    serializer_class = ContentVersionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        section_id = self.kwargs.get('section_id')
        return ContentVersion.objects.filter(section_id=section_id)

# Gestion du mot de passe admin
class AdminPasswordView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminPasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        password_obj, created = AdminPassword.objects.get_or_create(
            is_active=True,
            defaults={
                'password_hash': '',  # Sera mis à jour lors de la première création
                'updated_by': self.request.user
            }
        )
        return password_obj
    
    def get(self, request, *args, **kwargs):
        # Ne pas exposer le hash du mot de passe
        return Response({'has_password': bool(self.get_object().password_hash)})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_admin_password(request):
    """Vérifier le mot de passe de l'utilisateur admin connecté"""
    import logging
    logger = logging.getLogger(__name__)
    
    password = request.data.get('password')
    
    logger.info(f"verify_admin_password called by user: {request.user.email}, is_staff: {request.user.is_staff}")
    
    if not password:
        logger.warning("No password provided")
        return Response(
            {'error': 'Mot de passe requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier que l'utilisateur est admin
    if not request.user.is_staff:
        logger.warning(f"User {request.user.email} is not staff")
        return Response(
            {'error': 'Accès refusé - Utilisateur non admin'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Vérifier le mot de passe de l'utilisateur connecté
    from django.contrib.auth import authenticate
    user = authenticate(
        username=request.user.email,  # Utiliser email au lieu de username
        password=password
    )
    
    logger.info(f"Authentication result: user={user}, is_staff={user.is_staff if user else None}")
    
    if user and user.is_staff:
        logger.info("Password verification successful")
        return Response({
            'valid': True, 
            'message': 'Mot de passe correct',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_staff': user.is_staff
            }
        })
    else:
        logger.warning("Password verification failed")
        return Response(
            {'error': 'Mot de passe incorrect'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

# Sessions d'édition
class ContentEditSessionView(generics.ListCreateAPIView):
    serializer_class = ContentEditSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ContentEditSession.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Créer une session d'édition avec gestion du slug de page"""
        page_slug = request.data.get('page')
        
        if not page_slug:
            return Response(
                {'error': 'Le slug de la page est requis'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Trouver la page par son slug
        try:
            page = Page.objects.get(slug=page_slug)
        except Page.DoesNotExist:
            return Response(
                {'error': f'Page avec le slug "{page_slug}" non trouvée'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Terminer les autres sessions actives de l'utilisateur
        ContentEditSession.objects.filter(
            user=request.user,
            is_active=True
        ).update(is_active=False)
        
        # Créer la nouvelle session
        session = ContentEditSession.objects.create(
            user=request.user,
            page=page,
            is_active=True
        )
        
        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_edit_session(request, session_id):
    """Terminer une session d'édition"""
    session = get_object_or_404(ContentEditSession, id=session_id, user=request.user)
    session.is_active = False
    session.save()
    return Response({'message': 'Session terminée'})

# Changements de contenu
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_content_change(request):
    """Créer un changement de contenu en attente"""
    serializer = ContentChangeCreateSerializer(data=request.data)
    if serializer.is_valid():
        # Vérifier que l'utilisateur a une session d'édition active
        session = ContentEditSession.objects.filter(
            user=request.user,
            is_active=True
        ).first()
        
        if not session:
            return Response(
                {'error': 'Aucune session d\'édition active'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        section = get_object_or_404(ContentSection, id=serializer.validated_data['section_id'])
        
        # Créer le changement
        change = ContentChange.objects.create(
            session=session,
            section=section,
            field_name=serializer.validated_data['field_name'],
            new_value=serializer.validated_data['new_value'],
            change_type=serializer.validated_data['change_type']
        )
        
        return Response(ContentChangeSerializer(change).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_content(request):
    """Sauvegarder tous les changements en attente"""
    serializer = ContentBulkUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Vérifier que l'utilisateur a une session d'édition active
    session = ContentEditSession.objects.filter(
        user=request.user,
        is_active=True
    ).first()
    
    if not session:
        return Response(
            {'error': 'Aucune session d\'édition active'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            changes_data = serializer.validated_data['changes']
            applied_changes = []
            
            for change_data in changes_data:
                section = get_object_or_404(ContentSection, id=change_data['section_id'])
                
                # Créer une version avant modification
                current_version = ContentVersion.objects.filter(
                    section=section
                ).order_by('-version_number').first()
                
                new_version_number = (current_version.version_number + 1) if current_version else 1
                
                # Sauvegarder l'ancienne version
                if current_version:
                    ContentVersion.objects.create(
                        section=section,
                        title=section.title,
                        content=section.content,
                        metadata=section.metadata,
                        version_number=new_version_number,
                        change_summary=f"Modification de {change_data['field_name']}",
                        created_by=request.user
                    )
                
                # Appliquer le changement
                if change_data['change_type'] == 'update':
                    setattr(section, change_data['field_name'], change_data['new_value'])
                    section.save()
                elif change_data['change_type'] == 'create':
                    # Créer une nouvelle section
                    new_section = ContentSection.objects.create(
                        page=section.page,
                        section_key=change_data['new_value'],
                        content_type='text',
                        title='Nouvelle section',
                        content='',
                        created_by=request.user
                    )
                elif change_data['change_type'] == 'delete':
                    section.delete()
                
                applied_changes.append({
                    'section_id': change_data['section_id'],
                    'field_name': change_data['field_name'],
                    'change_type': change_data['change_type']
                })
            
            # Mettre à jour la dernière activité de la session
            from django.utils import timezone
            session.last_activity = timezone.now()
            session.save()
            
            return Response({
                'message': 'Changements sauvegardés avec succès',
                'applied_changes': applied_changes
            })
    
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la sauvegarde: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_changes(request):
    """Récupérer les changements en attente pour une session"""
    session = ContentEditSession.objects.filter(
        user=request.user,
        is_active=True
    ).first()
    
    if not session:
        return Response({'changes': []})
    
    changes = ContentChange.objects.filter(session=session)
    return Response(ContentChangeSerializer(changes, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def preview_content(request):
    """Prévisualiser le contenu avec les changements en attente"""
    serializer = ContentPreviewSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    page = get_object_or_404(Page, id=serializer.validated_data['page_id'])
    sections = ContentSection.objects.filter(page=page, is_visible=True).order_by('order')
    
    # Appliquer les changements en attente
    session = ContentEditSession.objects.filter(
        user=request.user,
        is_active=True
    ).first()
    
    preview_sections = []
    for section in sections:
        section_data = {
            'id': section.id,
            'section_key': section.section_key,
            'content_type': section.content_type,
            'title': section.title,
            'content': section.content,
            'metadata': section.metadata,
            'order': section.order
        }
        
        # Appliquer les changements en attente
        if session:
            pending_changes = ContentChange.objects.filter(
                session=session,
                section=section
            )
            for change in pending_changes:
                if change.change_type == 'update':
                    section_data[change.field_name] = change.new_value
        
        preview_sections.append(section_data)
    
    return Response({
        'page': PageSerializer(page).data,
        'sections': preview_sections
    })

@api_view(['GET'])
def get_page_content(request, page_slug):
    """Récupérer le contenu d'une page pour l'affichage public"""
    page = get_object_or_404(Page, slug=page_slug, is_active=True)
    sections = ContentSection.objects.filter(
        page=page, 
        is_visible=True
    ).order_by('order')
    
    return Response({
        'page': PageSerializer(page).data,
        'sections': ContentSectionSerializer(sections, many=True).data
    })


# ==================== TRADUCTIONS ====================

class TranslationListView(generics.ListAPIView):
    """Lister toutes les traductions"""
    serializer_class = TranslationListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Translation.objects.select_related('section', 'created_by').all()

class TranslationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'une traduction"""
    serializer_class = TranslationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Translation.objects.select_related('section', 'created_by')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_translations(request):
    """Générer des traductions automatiquement avec DeepL"""
    
    # Vérifier que l'utilisateur est admin
    if not request.user.is_staff:
        return Response(
            {'error': 'Accès refusé - Utilisateur non admin'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Vérifier que l'API DeepL est configurée
    if not deepl_service.is_api_configured():
        return Response(
            {'error': 'API DeepL non configurée'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    serializer = TranslationBulkCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    section_id = serializer.validated_data['section_id']
    field_name = serializer.validated_data['field_name']
    source_content = serializer.validated_data['source_content']
    source_language = serializer.validated_data['source_language']
    
    try:
        section = ContentSection.objects.get(id=section_id)
        
        # Générer les traductions pour toutes les langues supportées
        translations_created = []
        available_languages = deepl_service.get_available_languages()
        
        for lang_code in available_languages.keys():
            if lang_code != source_language:
                # Traduire le contenu
                translated_content = deepl_service.translate_text(
                    source_content, 
                    lang_code, 
                    source_language
                )
                
                if translated_content:
                    # Créer ou mettre à jour la traduction
                    translation, created = Translation.objects.update_or_create(
                        section=section,
                        field_name=field_name,
                        language=lang_code,
                        defaults={
                            'translated_content': translated_content,
                            'is_auto_generated': True,
                            'is_manual_override': False,
                            'created_by': request.user
                        }
                    )
                    
                    translations_created.append({
                        'id': translation.id,
                        'language': lang_code,
                        'language_display': available_languages[lang_code],
                        'translated_content': translated_content,
                        'created': created
                    })
        
        return Response({
            'message': f'{len(translations_created)} traductions générées avec succès',
            'translations': translations_created
        })
        
    except ContentSection.DoesNotExist:
        return Response(
            {'error': 'Section non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Erreur lors de la génération des traductions: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_section_translations(request, section_id):
    """Récupérer toutes les traductions d'une section"""
    
    try:
        section = ContentSection.objects.get(id=section_id)
        translations = Translation.objects.filter(section=section)
        
        serializer = TranslationSerializer(translations, many=True)
        return Response({
            'section': {
                'id': section.id,
                'section_key': section.section_key,
                'title': section.title
            },
            'translations': serializer.data
        })
        
    except ContentSection.DoesNotExist:
        return Response(
            {'error': 'Section non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_translation_stats(request):
    """Récupérer les statistiques des traductions"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Accès refusé - Utilisateur non admin'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    total_translations = Translation.objects.count()
    auto_generated = Translation.objects.filter(is_auto_generated=True).count()
    manual_overrides = Translation.objects.filter(is_manual_override=True).count()
    
    # Statistiques par langue
    by_language = {}
    for lang_code, lang_name in deepl_service.get_available_languages().items():
        by_language[lang_code] = {
            'name': lang_name,
            'count': Translation.objects.filter(language=lang_code).count()
        }
    
    # Traductions manquantes
    missing_translations = []
    sections = ContentSection.objects.filter(is_visible=True)
    available_languages = list(deepl_service.get_available_languages().keys())
    
    for section in sections:
        for lang in available_languages:
            if lang != 'fr':  # Français est la langue par défaut
                has_translation = Translation.objects.filter(
                    section=section,
                    field_name='content',
                    language=lang
                ).exists()
                
                if not has_translation:
                    missing_translations.append({
                        'section_id': section.id,
                        'section_key': section.section_key,
                        'language': lang
                    })
    
    return Response({
        'total_translations': total_translations,
        'auto_generated': auto_generated,
        'manual_overrides': manual_overrides,
        'by_language': by_language,
        'missing_translations': missing_translations
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def regenerate_translation(request, translation_id):
    """Régénérer une traduction spécifique"""
    
    if not request.user.is_staff:
        return Response(
            {'error': 'Accès refusé - Utilisateur non admin'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not deepl_service.is_api_configured():
        return Response(
            {'error': 'API DeepL non configurée'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    try:
        translation = Translation.objects.get(id=translation_id)
        
        # Récupérer le contenu source (en français par défaut)
        source_content = getattr(translation.section, translation.field_name, '')
        
        if not source_content:
            return Response(
                {'error': 'Contenu source non trouvé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Régénérer la traduction
        new_translation = deepl_service.translate_text(
            source_content,
            translation.language,
            'fr'  # Source en français
        )
        
        if new_translation:
            translation.translated_content = new_translation
            translation.is_auto_generated = True
            translation.is_manual_override = False
            translation.save()
            
            return Response({
                'message': 'Traduction régénérée avec succès',
                'translation': TranslationSerializer(translation).data
            })
        else:
            return Response(
                {'error': 'Erreur lors de la régénération de la traduction'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Translation.DoesNotExist:
        return Response(
            {'error': 'Traduction non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
