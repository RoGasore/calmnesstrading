from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Formation, Signal, GestionCompte, ServiceContent
from .serializers import (
    FormationSerializer, FormationListSerializer,
    SignalSerializer, SignalListSerializer,
    GestionCompteSerializer, GestionCompteListSerializer,
    ServiceContentSerializer
)

User = get_user_model()

# Formations
class FormationListView(generics.ListCreateAPIView):
    queryset = Formation.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return FormationListSerializer
        return FormationSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class FormationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsAuthenticated]

# Signaux
class SignalListView(generics.ListCreateAPIView):
    queryset = Signal.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SignalListSerializer
        return SignalSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SignalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Signal.objects.all()
    serializer_class = SignalSerializer
    permission_classes = [IsAuthenticated]

# Gestion de comptes
class GestionCompteListView(generics.ListCreateAPIView):
    queryset = GestionCompte.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return GestionCompteListSerializer
        return GestionCompteSerializer
    
    def perform_create(self, serializer):
        serializer.save(managed_by=self.request.user)

class GestionCompteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GestionCompte.objects.all()
    serializer_class = GestionCompteSerializer
    permission_classes = [IsAuthenticated]

# Contenu des services
class ServiceContentView(generics.ListCreateAPIView):
    queryset = ServiceContent.objects.all()
    serializer_class = ServiceContentSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)