from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid

User = get_user_model()

class Invoice(models.Model):
    """
    Modèle pour les factures conformes aux normes françaises
    """
    INVOICE_STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('sent', 'Envoyée'),
        ('paid', 'Payée'),
        ('cancelled', 'Annulée'),
        ('overdue', 'En retard'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Virement bancaire'),
        ('card', 'Carte bancaire'),
        ('paypal', 'PayPal'),
        ('crypto', 'Cryptomonnaie'),
        ('other', 'Autre'),
    ]

    # Numérotation séquentielle obligatoire (CT-XXXXX)
    invoice_number = models.CharField(
        max_length=20, 
        unique=True, 
        help_text="Numéro de facture séquentiel (CT-XXXXX)"
    )
    
    # Référence unique interne
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Statut de la facture
    status = models.CharField(
        max_length=20, 
        choices=INVOICE_STATUS_CHOICES, 
        default='draft',
        help_text="Statut de la facture"
    )
    
    # Client (utilisateur)
    customer = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='invoices',
        help_text="Client facturé"
    )
    
    # Dates obligatoires
    issue_date = models.DateField(
        help_text="Date d'émission de la facture"
    )
    due_date = models.DateField(
        help_text="Date d'échéance de paiement"
    )
    payment_date = models.DateField(
        null=True, 
        blank=True,
        help_text="Date de paiement effectif"
    )
    
    # Montants
    subtotal_ht = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Montant HT"
    )
    tax_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=Decimal('20.00'),
        help_text="Taux de TVA (%)"
    )
    tax_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Montant de la TVA"
    )
    total_ttc = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Montant TTC"
    )
    
    # Informations de paiement
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES,
        null=True, 
        blank=True,
        help_text="Méthode de paiement utilisée"
    )
    transaction_reference = models.CharField(
        max_length=100,
        null=True, 
        blank=True,
        help_text="Référence de transaction (obligatoire pour validation)"
    )
    
    # Mentions légales obligatoires
    company_name = models.CharField(
        max_length=200,
        default="Calmness Trading",
        help_text="Nom de l'entreprise"
    )
    company_address = models.TextField(
        default="123 Rue du Trading\n75001 Paris\nFrance",
        help_text="Adresse de l'entreprise"
    )
    company_siret = models.CharField(
        max_length=14,
        default="12345678901234",
        help_text="Numéro SIRET"
    )
    company_vat_number = models.CharField(
        max_length=20,
        default="FR12345678901",
        help_text="Numéro de TVA intracommunautaire"
    )
    
    # Notes et conditions
    notes = models.TextField(
        blank=True,
        help_text="Notes additionnelles sur la facture"
    )
    terms_conditions = models.TextField(
        default="Paiement à 30 jours. En cas de retard, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.",
        help_text="Conditions générales de vente"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_invoices',
        help_text="Utilisateur ayant créé la facture"
    )

    class Meta:
        ordering = ['-issue_date', '-created_at']
        verbose_name = "Facture"
        verbose_name_plural = "Factures"

    def __str__(self):
        return f"Facture {self.invoice_number} - {self.customer.get_full_name()}"

    def save(self, *args, **kwargs):
        # Calculer automatiquement la TVA et le total TTC
        if self.subtotal_ht:
            self.tax_amount = self.subtotal_ht * (self.tax_rate / 100)
            self.total_ttc = self.subtotal_ht + self.tax_amount
        
        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Vérifie si la facture est en retard"""
        from django.utils import timezone
        return self.due_date < timezone.now().date() and self.status not in ['paid', 'cancelled']

    @property
    def days_overdue(self):
        """Nombre de jours de retard"""
        if self.is_overdue:
            from django.utils import timezone
            return (timezone.now().date() - self.due_date).days
        return 0

    def mark_as_paid(self, payment_method=None, transaction_reference=None):
        """Marquer la facture comme payée"""
        from django.utils import timezone
        
        self.status = 'paid'
        self.payment_date = timezone.now().date()
        
        if payment_method:
            self.payment_method = payment_method
        if transaction_reference:
            self.transaction_reference = transaction_reference
            
        self.save(update_fields=['status', 'payment_date', 'payment_method', 'transaction_reference'])


class InvoiceItem(models.Model):
    """
    Articles d'une facture
    """
    invoice = models.ForeignKey(
        Invoice, 
        on_delete=models.CASCADE, 
        related_name='items',
        help_text="Facture parente"
    )
    
    # Description de l'article
    description = models.CharField(
        max_length=200,
        help_text="Description de l'article ou service"
    )
    detailed_description = models.TextField(
        blank=True,
        help_text="Description détaillée"
    )
    
    # Quantité et prix
    quantity = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('1.00'),
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Quantité"
    )
    unit_price_ht = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Prix unitaire HT"
    )
    
    # Calculs automatiques
    total_ht = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Total HT de la ligne"
    )
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = "Article de facture"
        verbose_name_plural = "Articles de facture"

    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        # Calculer automatiquement le total HT
        self.total_ht = self.quantity * self.unit_price_ht
        super().save(*args, **kwargs)
        
        # Recalculer le total de la facture
        self.invoice.save()


class InvoiceTemplate(models.Model):
    """
    Modèles de facture pour standardiser la création
    """
    name = models.CharField(
        max_length=100,
        help_text="Nom du modèle"
    )
    description = models.TextField(
        blank=True,
        help_text="Description du modèle"
    )
    
    # Paramètres par défaut
    default_tax_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=Decimal('20.00'),
        help_text="Taux de TVA par défaut"
    )
    default_payment_terms = models.IntegerField(
        default=30,
        help_text="Délai de paiement par défaut (jours)"
    )
    
    # Template items
    template_items = models.JSONField(
        default=list,
        help_text="Articles par défaut du modèle"
    )
    
    # Métadonnées
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Modèle de facture"
        verbose_name_plural = "Modèles de facture"

    def __str__(self):
        return self.name
