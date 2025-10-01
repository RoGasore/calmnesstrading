"""Vues pour la gestion des offres (Admin)"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model

from .models import Offer
from .serializers import OfferSerializer

User = get_user_model()


# ==================== GESTION DES OFFRES (ADMIN) ====================

class AdminOfferListCreateView(generics.ListCreateAPIView):
    """Liste et création d'offres (admin uniquement)"""
    serializer_class = OfferSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        offer_type = self.request.query_params.get('type', None)
        queryset = Offer.objects.all()
        
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)
        
        return queryset.order_by('offer_type', 'price')


class AdminOfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une offre (admin)"""
    serializer_class = OfferSerializer
    permission_classes = [IsAdminUser]
    queryset = Offer.objects.all()

