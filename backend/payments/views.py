"""Vues principales pour l'application payments"""
from rest_framework import generics, permissions

from .models import Offer, ContactChannel
from .serializers import OfferSerializer, ContactChannelSerializer

# Importer les vues des autres modules
from .views_user import *
from .views_admin import *
from .views_offers import *


# ==================== OFFRES ====================

class OfferListView(generics.ListAPIView):
    """Liste toutes les offres actives"""
    serializer_class = OfferSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Offer.objects.filter(is_active=True)


class OfferDetailView(generics.RetrieveAPIView):
    """Détail d'une offre"""
    serializer_class = OfferSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Offer.objects.filter(is_active=True)


# ==================== CANAUX DE CONTACT ====================

class ContactChannelListView(generics.ListAPIView):
    """Liste tous les canaux de contact actifs"""
    serializer_class = ContactChannelSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return ContactChannel.objects.filter(is_active=True)

