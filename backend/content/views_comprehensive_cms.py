from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q, Count
from django.core.paginator import Paginator
from django.utils import timezone
import logging

from .models_comprehensive_cms import (
    GlobalSettings, PageCategory, SitePage, ContentBlock, ComprehensiveContentVersion,
    Testimonial, FAQItem, Offer, ComprehensiveEditSession, ComprehensivePendingChange, Review, ContactField
)

from .serializers_comprehensive_cms import (
    # GlobalSettings
    GlobalSettingsSerializer, GlobalSettingsUpdateSerializer,
    
    # PageCategory
    PageCategorySerializer, PageCategoryListSerializer,
    
    # SitePage
    SitePageSerializer, SitePageListSerializer, SitePageCreateUpdateSerializer,
    
    # ContentBlock
    ContentBlockSerializer, ContentBlockListSerializer, ContentBlockCreateUpdateSerializer,
    
    # ComprehensiveContentVersion
    ComprehensiveContentVersionSerializer, ComprehensiveContentVersionCreateSerializer,
    
    # Testimonial
    TestimonialSerializer, TestimonialListSerializer, TestimonialCreateUpdateSerializer,
    
    # FAQ
    FAQItemSerializer, FAQItemListSerializer, FAQItemCreateUpdateSerializer,
    
    # Offer
    OfferSerializer, OfferListSerializer, OfferCreateUpdateSerializer,
    
    # Review
    ReviewSerializer, ReviewCreateSerializer, ReviewListSerializer,
    
    # ContactField
    ContactFieldSerializer, ContactFieldListSerializer,
    
    # EditSession
    ComprehensiveEditSessionSerializer, ComprehensiveEditSessionCreateSerializer,
    
    # PendingChanges
    ComprehensivePendingChangeSerializer, ComprehensivePendingChangeCreateSerializer,
    
    # Public
    PublicSitePageSerializer, PublicTestimonialSerializer, 
    PublicFAQItemSerializer, PublicOfferSerializer,
    
    # Stats
    ContentStatsSerializer, FAQSearchSerializer, ContentSearchSerializer
)

logger = logging.getLogger(__name__)

# ==================== PARAMÈTRES GLOBAUX ====================

class GlobalSettingsView(generics.RetrieveUpdateAPIView):
    """Gestion des paramètres globaux"""
    serializer_class = GlobalSettingsSerializer
    permission_classes = [IsAdminUser]
    
    def get_object(self):
        return GlobalSettings.get_settings()

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_global_settings_public(request):
    """Récupérer les paramètres globaux pour l'affichage public"""
    settings = GlobalSettings.get_settings()
    serializer = GlobalSettingsSerializer(settings)
    return Response(serializer.data)

# ==================== CATÉGORIES DE PAGES ====================

class PageCategoryListView(generics.ListCreateAPIView):
    """Liste et création des catégories de pages"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PageCategoryListSerializer
        return PageCategorySerializer

class PageCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'une catégorie"""
    queryset = PageCategory.objects.all()
    serializer_class = PageCategorySerializer
    permission_classes = [IsAdminUser]

# ==================== PAGES DU SITE ====================

class SitePageListView(generics.ListCreateAPIView):
    """Liste et création des pages du site"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SitePageListSerializer
        return SitePageCreateUpdateSerializer
    
    def get_queryset(self):
        queryset = SitePage.objects.select_related('category', 'updated_by').all()
        
        # Filtres
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset

class SitePageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'une page"""
    queryset = SitePage.objects.select_related('category', 'updated_by')
    serializer_class = SitePageSerializer
    permission_classes = [IsAdminUser]

# ==================== BLOCS DE CONTENU ====================

class ContentBlockListView(generics.ListCreateAPIView):
    """Liste et création des blocs de contenu"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ContentBlockListSerializer
        return ContentBlockCreateUpdateSerializer
    
    def get_queryset(self):
        queryset = ContentBlock.objects.select_related('page', 'updated_by').all()
        
        # Filtre par page
        page_id = self.request.query_params.get('page_id')
        if page_id:
            queryset = queryset.filter(page_id=page_id)
        
        # Filtre par type de contenu
        content_type = self.request.query_params.get('content_type')
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        
        # Filtre par visibilité
        is_visible = self.request.query_params.get('is_visible')
        if is_visible is not None:
            queryset = queryset.filter(is_visible=is_visible.lower() == 'true')
        
        return queryset.order_by('page', 'order', 'block_key')

class ContentBlockDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'un bloc de contenu"""
    queryset = ContentBlock.objects.select_related('page', 'updated_by')
    serializer_class = ContentBlockSerializer
    permission_classes = [IsAdminUser]

# ==================== VERSIONS DE CONTENU ====================

class ComprehensiveContentVersionListView(generics.ListAPIView):
    """Liste des comprehensive_versions de contenu pour un bloc"""
    serializer_class = ComprehensiveContentVersionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        block_id = self.kwargs.get('block_id')
        return ComprehensiveContentVersion.objects.filter(content_block_id=block_id).select_related('created_by')

@api_view(['POST'])
@permission_classes([IsAdminUser])
def restore_content_version(request, version_id):
    """Restaurer une version de contenu"""
    try:
        version = get_object_or_404(ComprehensiveContentVersion, id=version_id)
        content_block = version.content_block
        
        # Créer une nouvelle version avant restauration
        current_version = ComprehensiveContentVersion.objects.filter(
            content_block=content_block
        ).order_by('-version_number').first()
        
        new_version_number = (current_version.version_number + 1) if current_version else 1
        
        # Sauvegarder l'état actuel
        ComprehensiveContentVersion.objects.create(
            content_block=content_block,
            title=content_block.title,
            content=content_block.content,
            metadata=content_block.metadata,
            version_number=new_version_number,
            change_summary=f"Sauvegarde avant restauration de la version {version.version_number}",
            created_by=request.user
        )
        
        # Restaurer la version
        content_block.title = version.title
        content_block.content = version.content
        content_block.metadata = version.metadata
        content_block.updated_by = request.user
        content_block.save()
        
        return Response({
            'message': f'Version {version.version_number} restaurée avec succès',
            'content_block': ContentBlockSerializer(content_block).data
        })
        
    except Exception as e:
        logger.error(f"Erreur lors de la restauration de version: {str(e)}")
        return Response(
            {'error': f'Erreur lors de la restauration: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ==================== TÉMOIGNAGES ====================

class TestimonialListView(generics.ListCreateAPIView):
    """Liste et création des témoignages"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return TestimonialListSerializer
        return TestimonialCreateUpdateSerializer
    
    def get_queryset(self):
        queryset = Testimonial.objects.all()
        
        # Filtres
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        is_featured = self.request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        return queryset.order_by('order', '-created_at')

class TestimonialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'un témoignage"""
    queryset = Testimonial.objects.select_related('created_by')
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminUser]

# ==================== FAQ ====================

class FAQItemListView(generics.ListCreateAPIView):
    """Liste et création des éléments FAQ"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return FAQItemListSerializer
        return FAQItemCreateUpdateSerializer
    
    def get_queryset(self):
        queryset = FAQItem.objects.all()
        
        # Filtres
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        is_featured = self.request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        # Recherche
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(question__icontains=search) |
                Q(answer__icontains=search) |
                Q(keywords__icontains=search)
            )
        
        return queryset.order_by('category', 'order', '-is_featured', '-created_at')

class FAQItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'un élément FAQ"""
    queryset = FAQItem.objects.select_related('created_by')
    serializer_class = FAQItemSerializer
    permission_classes = [IsAdminUser]

# ==================== OFFRES ====================

class OfferListView(generics.ListCreateAPIView):
    """Liste et création des offres"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return OfferListSerializer
        return OfferCreateUpdateSerializer
    
    def get_queryset(self):
        queryset = Offer.objects.select_related('created_by').all()
        
        # Filtres
        offer_type = self.request.query_params.get('offer_type')
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        is_featured = self.request.query_params.get('is_featured')
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        return queryset.order_by('order', '-is_featured', '-created_at')

class OfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'une offre"""
    queryset = Offer.objects.select_related('created_by')
    serializer_class = OfferSerializer
    permission_classes = [IsAdminUser]

# ==================== SESSIONS D'ÉDITION ====================

class ComprehensiveEditSessionListView(generics.ListCreateAPIView):
    """Liste et création des sessions d'édition"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ComprehensiveEditSessionSerializer
        return ComprehensiveEditSessionCreateSerializer
    
    def get_queryset(self):
        return ComprehensiveEditSession.objects.filter(user=self.request.user).select_related('page', 'user')

@api_view(['POST'])
@permission_classes([IsAdminUser])
def end_edit_session(request, session_id):
    """Terminer une session d'édition"""
    session = get_object_or_404(ComprehensiveEditSession, id=session_id, user=request.user)
    session.is_active = False
    session.save()
    
    # Supprimer tous les changements en attente
    ComprehensivePendingChange.objects.filter(session=session).delete()
    
    return Response({'message': 'Session terminée et changements supprimés'})

# ==================== CHANGEMENTS EN ATTENTE ====================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_pending_change(request):
    """Créer un changement en attente"""
    serializer = ComprehensivePendingChangeCreateSerializer(data=request.data)
    if serializer.is_valid():
        # Vérifier que l'utilisateur a une session d'édition active
        session = ComprehensiveEditSession.objects.filter(
            user=request.user,
            is_active=True
        ).first()
        
        if not session:
            return Response(
                {'error': 'Aucune session d\'édition active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer le changement
        change = ComprehensivePendingChange.objects.create(
            session=session,
            **serializer.validated_data
        )
        
        return Response(ComprehensivePendingChangeSerializer(change).data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def apply_comprehensive_pending_changes(request):
    """Appliquer tous les changements en attente"""
    # Vérifier que l'utilisateur a une session d'édition active
    session = ComprehensiveEditSession.objects.filter(
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
            changes = ComprehensivePendingChange.objects.filter(session=session)
            applied_changes = []
            
            for change in changes:
                content_block = change.content_block
                
                # Créer une version avant modification
                current_version = ComprehensiveContentVersion.objects.filter(
                    content_block=content_block
                ).order_by('-version_number').first()
                
                new_version_number = (current_version.version_number + 1) if current_version else 1
                
                # Sauvegarder l'ancienne version
                ComprehensiveContentVersion.objects.create(
                    content_block=content_block,
                    title=content_block.title,
                    content=content_block.content,
                    metadata=content_block.metadata,
                    version_number=new_version_number,
                    change_summary=f"Modification de {change.field_name}",
                    created_by=request.user
                )
                
                # Appliquer le changement
                if change.change_type == 'update':
                    setattr(content_block, change.field_name, change.new_value)
                    content_block.updated_by = request.user
                    content_block.save()
                
                applied_changes.append({
                    'content_block_id': change.content_block_id,
                    'field_name': change.field_name,
                    'change_type': change.change_type
                })
            
            # Supprimer tous les changements en attente
            changes.delete()
            
            return Response({
                'message': 'Changements appliqués avec succès',
                'applied_changes': applied_changes
            })
    
    except Exception as e:
        logger.error(f"Erreur lors de l'application des changements: {str(e)}")
        return Response(
            {'error': f'Erreur lors de l\'application: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_comprehensive_pending_changes(request):
    """Récupérer les changements en attente"""
    session = ComprehensiveEditSession.objects.filter(
        user=request.user,
        is_active=True
    ).first()
    
    if not session:
        return Response({'changes': []})
    
    changes = ComprehensivePendingChange.objects.filter(session=session).select_related('content_block')
    return Response(ComprehensivePendingChangeSerializer(changes, many=True).data)

# ==================== APERÇU ====================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def preview_content(request):
    """Prévisualiser le contenu avec les changements en attente"""
    page_id = request.data.get('page_id')
    if not page_id:
        return Response(
            {'error': 'ID de page requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    page = get_object_or_404(SitePage, id=page_id)
    content_blocks = ContentBlock.objects.filter(page=page, is_visible=True).order_by('order')
    
    # Appliquer les changements en attente
    session = ComprehensiveEditSession.objects.filter(
        user=request.user,
        is_active=True,
        page=page
    ).first()
    
    preview_blocks = []
    for block in content_blocks:
        block_data = {
            'id': block.id,
            'block_key': block.block_key,
            'content_type': block.content_type,
            'title': block.title,
            'content': block.content,
            'metadata': block.metadata,
            'css_classes': block.css_classes,
            'order': block.order
        }
        
        # Appliquer les changements en attente
        if session:
            comprehensive_pending_changes = ComprehensivePendingChange.objects.filter(
                session=session,
                content_block=block
            )
            for change in comprehensive_pending_changes:
                if change.change_type == 'update':
                    block_data[change.field_name] = change.new_value
        
        preview_blocks.append(block_data)
    
    return Response({
        'page': SitePageSerializer(page).data,
        'content_blocks': preview_blocks
    })

# ==================== API PUBLIQUE ====================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_page_content_public(request, page_slug):
    """Récupérer le contenu d'une page pour l'affichage public"""
    page = get_object_or_404(SitePage, slug=page_slug, is_active=True, is_public=True)
    content_blocks = ContentBlock.objects.filter(
        page=page, 
        is_visible=True
    ).order_by('order')
    
    return Response({
        'page': PublicSitePageSerializer(page).data,
        'content_blocks': [
            {
                'id': block.id,
                'block_key': block.block_key,
                'content_type': block.content_type,
                'title': block.title,
                'content': block.content,
                'metadata': block.metadata,
                'css_classes': block.css_classes,
                'order': block.order
            }
            for block in content_blocks
        ]
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_testimonials_public(request):
    """Récupérer les témoignages pour l'affichage public"""
    testimonials = Testimonial.objects.filter(
        status='published'
    ).order_by('order', '-created_at')
    
    return Response(PublicTestimonialSerializer(testimonials, many=True).data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_faq_public(request):
    """Récupérer les FAQ pour l'affichage public"""
    faq_items = FAQItem.objects.filter(
        status='published'
    ).order_by('category', 'order', '-is_featured')
    
    return Response(PublicFAQItemSerializer(faq_items, many=True).data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_offers_public(request):
    """Récupérer les offres pour l'affichage public"""
    offers = Offer.objects.filter(
        status='published'
    ).order_by('order', '-is_featured')
    
    return Response(PublicOfferSerializer(offers, many=True).data)

# ==================== RECHERCHE ====================

@api_view(['GET'])
def search_faq(request):
    """Rechercher dans les FAQ"""
    query = request.query_params.get('q', '').strip()
    
    if not query:
        return Response({'results': []})
    
    faq_items = FAQItem.objects.filter(
        Q(question__icontains=query) |
        Q(answer__icontains=query) |
        Q(keywords__icontains=query),
        status='published'
    ).order_by('-is_featured', '-views_count')
    
    # Augmenter le compteur de vues pour les résultats
    faq_items.update(views_count=models.F('views_count') + 1)
    
    return Response(FAQSearchSerializer(faq_items, many=True).data)

@api_view(['GET'])
def search_content(request):
    """Recherche globale dans tout le contenu"""
    query = request.query_params.get('q', '').strip()
    
    if not query:
        return Response({'results': []})
    
    results = []
    
    # Recherche dans les pages
    pages = SitePage.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query),
        is_active=True, is_public=True
    )
    for page in pages:
        results.append({
            'content_type': 'page',
            'id': page.id,
            'title': page.title,
            'content': page.description,
            'url': f'/pages/{page.slug}',
            'relevance_score': 1.0
        })
    
    # Recherche dans les blocs de contenu
    content_blocks = ContentBlock.objects.filter(
        Q(title__icontains=query) |
        Q(content__icontains=query),
        is_visible=True,
        page__is_active=True,
        page__is_public=True
    ).select_related('page')
    
    for block in content_blocks:
        results.append({
            'content_type': 'block',
            'id': block.id,
            'title': block.title or block.block_key,
            'content': block.content,
            'url': f'/pages/{block.page.slug}#{block.block_key}',
            'relevance_score': 0.8
        })
    
    # Recherche dans les FAQ
    faq_items = FAQItem.objects.filter(
        Q(question__icontains=query) |
        Q(answer__icontains=query),
        status='published'
    )
    
    for faq in faq_items:
        results.append({
            'content_type': 'faq',
            'id': faq.id,
            'title': faq.question,
            'content': faq.answer,
            'url': f'/faq#{faq.id}',
            'relevance_score': 0.9
        })
    
    # Recherche dans les offres
    offers = Offer.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query),
        status='published'
    )
    
    for offer in offers:
        results.append({
            'content_type': 'offer',
            'id': offer.id,
            'title': offer.name,
            'content': offer.description,
            'url': f'/offers/{offer.slug}',
            'relevance_score': 0.7
        })
    
    # Trier par score de pertinence
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return Response({
        'query': query,
        'results': results[:20]  # Limiter à 20 résultats
    })

# ==================== STATISTIQUES ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_content_stats(request):
    """Récupérer les statistiques de contenu"""
    
    stats = {
        'total_pages': SitePage.objects.count(),
        'total_content_blocks': ContentBlock.objects.count(),
        'total_testimonials': Testimonial.objects.count(),
        'total_faq_items': FAQItem.objects.count(),
        'total_offers': Offer.objects.count(),
        
        'published_pages': SitePage.objects.filter(is_active=True).count(),
        'published_testimonials': Testimonial.objects.filter(status='published').count(),
        'published_faq_items': FAQItem.objects.filter(status='published').count(),
        'published_offers': Offer.objects.filter(status='published').count(),
        
        'draft_pages': SitePage.objects.filter(is_active=False).count(),
        'draft_testimonials': Testimonial.objects.filter(status='draft').count(),
        'draft_faq_items': FAQItem.objects.filter(status='draft').count(),
        'draft_offers': Offer.objects.filter(status='draft').count(),
    }
    
    return Response(ContentStatsSerializer(stats).data)

# ==================== BULK OPERATIONS ====================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_content_blocks(request):
    """Mise à jour en masse des blocs de contenu"""
    updates = request.data.get('updates', [])
    
    if not updates:
        return Response(
            {'error': 'Aucune mise à jour fournie'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            updated_blocks = []
            
            for update in updates:
                block_id = update.get('id')
                field_updates = update.get('fields', {})
                
                if not block_id or not field_updates:
                    continue
                
                try:
                    block = ContentBlock.objects.get(id=block_id)
                    
                    # Créer une version avant modification
                    current_version = ComprehensiveContentVersion.objects.filter(
                        content_block=block
                    ).order_by('-version_number').first()
                    
                    new_version_number = (current_version.version_number + 1) if current_version else 1
                    
                    # Sauvegarder l'ancienne version
                    ComprehensiveContentVersion.objects.create(
                        content_block=block,
                        title=block.title,
                        content=block.content,
                        metadata=block.metadata,
                        version_number=new_version_number,
                        change_summary="Mise à jour en masse",
                        created_by=request.user
                    )
                    
                    # Appliquer les mises à jour
                    for field, value in field_updates.items():
                        if hasattr(block, field):
                            setattr(block, field, value)
                    
                    block.updated_by = request.user
                    block.save()
                    
                    updated_blocks.append(block_id)
                    
                except ContentBlock.DoesNotExist:
                    continue
            
            return Response({
                'message': f'{len(updated_blocks)} blocs mis à jour avec succès',
                'updated_blocks': updated_blocks
            })
    
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour en masse: {str(e)}")
        return Response(
            {'error': f'Erreur lors de la mise à jour: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_page_content_blocks(request, slug):
    """Récupérer les blocs de contenu d'une page (admin)"""
    try:
        page = SitePage.objects.get(slug=slug)
        content_blocks = page.content_blocks.filter(is_visible=True).order_by('order')
        serializer = ContentBlockSerializer(content_blocks, many=True)
        return Response(serializer.data)
    except SitePage.DoesNotExist:
        return Response({'error': 'Page not found'}, status=404)
    except Exception as e:
        logger.error(f"Erreur dans get_page_content_blocks: {str(e)}")
        return Response({'error': f'Erreur serveur: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_page_content_blocks_public(request, page_slug):
    """Récupérer les blocs de contenu d'une page pour l'affichage public"""
    try:
        page = SitePage.objects.get(slug=page_slug, is_active=True)
        content_blocks = page.content_blocks.filter(is_visible=True).order_by('order')
        serializer = ContentBlockSerializer(content_blocks, many=True)
        return Response({
            'content_blocks': serializer.data,
            'page': {
                'id': page.id,
                'name': page.name,
                'slug': page.slug,
                'title': page.title
            }
        })
    except SitePage.DoesNotExist:
        return Response({'error': 'Page not found'}, status=404)
    except Exception as e:
        logger.error(f"Erreur dans get_page_content_blocks_public: {str(e)}")
        return Response({'error': f'Erreur serveur: {str(e)}'}, status=500)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_content_block_content(request, block_id):
    """Mettre à jour uniquement le contenu d'un bloc (optimisé pour l'admin)"""
    try:
        content_block = ContentBlock.objects.get(id=block_id)
        
        # Vérifier que l'utilisateur est admin
        if not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=403)
        
        # Mettre à jour uniquement le contenu
        content = request.data.get('content')
        if content is not None:
            content_block.content = content
            content_block.updated_by = request.user
            content_block.save()
            
            # Retourner le bloc mis à jour
            serializer = ContentBlockSerializer(content_block)
            return Response(serializer.data)
        else:
            return Response({'error': 'Content field is required'}, status=400)
            
    except ContentBlock.DoesNotExist:
        return Response({'error': 'Content block not found'}, status=404)
    except Exception as e:
        logger.error(f"Erreur dans update_content_block_content: {str(e)}")
        return Response({'error': f'Erreur serveur: {str(e)}'}, status=500)

# ==================== AVIS CLIENTS ====================

class ReviewListView(generics.ListCreateAPIView):
    """Liste et création des avis clients (admin)"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ReviewListSerializer
        return ReviewCreateSerializer
    
    def get_queryset(self):
        return Review.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save()

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'un avis (admin)"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminUser]
    
    def perform_update(self, serializer):
        if 'status' in serializer.validated_data and serializer.validated_data['status'] == 'approved':
            serializer.save(approved_at=timezone.now(), approved_by=self.request.user)
        else:
            serializer.save()

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_reviews_public(request):
    """Récupérer les avis publics pour l'affichage"""
    reviews = Review.objects.filter(
        status='approved',
        is_public=True
    ).order_by('-order', '-created_at')
    
    serializer = ReviewListSerializer(reviews, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def create_review_public(request):
    """Créer un avis (public) avec envoi d'email automatique"""
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings
    import os
    
    serializer = ReviewCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            review = serializer.save()
            
            # Envoyer un email de confirmation automatique
            site_name = os.getenv('SITE_NAME', 'CALMNESS FI')
            brand_color = os.getenv('BRAND_COLOR', '#F5B301')
            logo_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/logo.png"
            
            subject = f"{site_name} • Merci pour votre avis"
            
            # Message texte
            text_message = (
                f"Bonjour {review.author_name},\n\n"
                "Merci pour votre avis sur nos services ! Nous avons bien reçu votre témoignage.\n\n"
                f"Service concerné : {review.service_name}\n"
                f"Votre note : {review.rating}/5 étoiles\n"
                f"Titre : {review.title}\n\n"
                "Votre avis sera publié après validation de notre équipe.\n\n"
                "Nous vous remercions pour votre confiance et votre fidélité.\n\n"
                f"— L'équipe {site_name}"
            )
            
            # Message HTML
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Merci pour votre avis</title>
            </head>
            <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f9fafb;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;">
                    <tr>
                        <td align="center" style="padding:40px 20px;">
                            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
                                <tr>
                                    <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg,{brand_color}15,{brand_color}05);">
                                        <img src="{logo_url}" alt="{site_name}" style="height:48px;margin-bottom:20px;">
                                        <h1 style="margin:0 0 8px 0;color:#111827;font-size:28px;font-weight:700;">Merci pour votre avis !</h1>
                                        <p style="margin:0;color:#6b7280;font-size:16px;">Votre témoignage nous est précieux</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:32px 40px;">
                                        <p style="margin:0 0 16px 0;color:#374151;font-size:16px;line-height:1.6;">
                                            Bonjour <strong>{review.author_name}</strong>,
                                        </p>
                                        <p style="margin:0 0 24px 0;color:#374151;font-size:16px;line-height:1.6;">
                                            Merci pour votre avis sur nos services ! Nous avons bien reçu votre témoignage et nous en sommes ravis.
                                        </p>
                                        
                                        <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:24px 0;">
                                            <h3 style="margin:0 0 12px 0;color:#111827;font-size:18px;">Détails de votre avis</h3>
                                            <table width="100%" cellpadding="8" cellspacing="0">
                                                <tr>
                                                    <td style="color:#6b7280;font-size:14px;width:120px;">Service :</td>
                                                    <td style="color:#374151;font-size:14px;font-weight:500;">{review.service_name}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#6b7280;font-size:14px;">Votre note :</td>
                                                    <td style="color:#374151;font-size:14px;font-weight:500;">
                                                        {'★' * review.rating}{'☆' * (5 - review.rating)} ({review.rating}/5)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="color:#6b7280;font-size:14px;">Titre :</td>
                                                    <td style="color:#374151;font-size:14px;font-weight:500;">{review.title}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <p style="margin:24px 0 0 0;color:#374151;font-size:16px;line-height:1.6;">
                                            Votre avis sera publié sur notre site après validation de notre équipe. 
                                            Nous vous remercions pour votre confiance et votre fidélité.
                                        </p>
                                        
                                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
                                        
                                        <div style="text-align:center;">
                                            <a href="{settings.FRONTEND_BASE_URL.rstrip('/')}/" style="display:inline-block;background:{brand_color};color:#111827;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">
                                                Visiter notre site
                                            </a>
                                        </div>
                                        
                                        <p style="margin:24px 0 0 0;color:#9ca3af;font-size:12px;">
                                            Cet e-mail vous a été envoyé par {site_name}. Si vous n'êtes pas à l'origine de cette action, ignorez ce message.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px 40px;background:#f9fafb;text-align:center;color:#6b7280;font-size:12px;">
                                        © {site_name}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            
            try:
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[review.author_email],
                )
                email.attach_alternative(html_message, "text/html")
                email.send(fail_silently=True)
            except Exception as e:
                logger.error(f"Erreur envoi email confirmation avis: {str(e)}")
            
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Erreur création avis: {str(e)}")
            return Response(
                {'error': 'Erreur lors de la création de l\'avis'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_services_for_reviews(request):
    """Récupérer la liste des services disponibles pour les avis"""
    services = [
        {'id': 1, 'name': 'Formation Trading', 'type': 'Formation'},
        {'id': 2, 'name': 'Signaux Trading', 'type': 'Signal'},
        {'id': 3, 'name': 'Gestion de Compte', 'type': 'Gestion'},
        {'id': 4, 'name': 'Analyse Technique', 'type': 'Analyse'},
        {'id': 5, 'name': 'Support Client', 'type': 'Support'},
    ]
    return Response(services)

# ==================== CHAMPS DE CONTACT ====================

class ContactFieldListView(generics.ListCreateAPIView):
    """Liste et création des champs de contact"""
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ContactFieldListSerializer
        return ContactFieldSerializer
    
    def get_queryset(self):
        return ContactField.objects.all().order_by('order', 'field_label')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ContactFieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, mise à jour et suppression d'un champ de contact"""
    queryset = ContactField.objects.all()
    serializer_class = ContactFieldSerializer
    permission_classes = [IsAdminUser]

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_contact_fields_public(request):
    """Récupérer les champs de contact pour l'affichage public"""
    fields = ContactField.objects.filter(is_visible=True).order_by('order', 'field_label')
    serializer = ContactFieldListSerializer(fields, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def clear_contact_cache(request):
    """Vider le cache des champs de contact"""
    from django.core.cache import cache
    cache.delete('contact_fields_public')
    return Response({'message': 'Cache des champs de contact vidé'})
