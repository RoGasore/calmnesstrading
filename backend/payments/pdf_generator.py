from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.lib.colors import Color, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from io import BytesIO
import os
from django.conf import settings
from django.http import HttpResponse
from .models_invoice import Invoice

# Couleurs Calmness Trading
GOLD_PRIMARY = Color(0.85, 0.65, 0.13)  # #D9A520 - Gold principal
GOLD_LIGHT = Color(0.95, 0.85, 0.35)    # #F2D85A - Gold clair
GOLD_DARK = Color(0.65, 0.45, 0.05)     # #A6730D - Gold foncé
BLUE_ACCENT = Color(0.2, 0.4, 0.8)      # #3366CC - Bleu accent
GRAY_LIGHT = Color(0.95, 0.95, 0.95)    # #F2F2F2 - Gris clair
GRAY_DARK = Color(0.3, 0.3, 0.3)        # #4D4D4D - Gris foncé

class InvoicePDFGenerator:
    """Générateur de factures PDF avec design Calmness Trading"""
    
    def __init__(self, invoice):
        self.invoice = invoice
        self.buffer = BytesIO()
        self.doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=20*mm,
            bottomMargin=20*mm
        )
        self.styles = getSampleStyleSheet()
        self._setup_styles()
    
    def _setup_styles(self):
        """Configure les styles personnalisés"""
        # Style pour le titre principal
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=GOLD_PRIMARY,
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Style pour les sous-titres
        self.styles.add(ParagraphStyle(
            name='SectionTitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=GOLD_DARK,
            spaceAfter=6,
            fontName='Helvetica-Bold'
        ))
        
        # Style pour les informations de l'entreprise
        self.styles.add(ParagraphStyle(
            name='CompanyInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=GRAY_DARK,
            spaceAfter=3,
            fontName='Helvetica'
        ))
        
        # Style pour les informations du client
        self.styles.add(ParagraphStyle(
            name='CustomerInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=black,
            spaceAfter=3,
            fontName='Helvetica'
        ))
        
        # Style pour les détails de facture
        self.styles.add(ParagraphStyle(
            name='InvoiceDetails',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=GRAY_DARK,
            spaceAfter=2,
            fontName='Helvetica'
        ))
    
    def _add_header(self, story):
        """Ajoute l'en-tête avec logo et informations de l'entreprise"""
        # Logo (si disponible)
        logo_path = os.path.join(settings.STATIC_ROOT, 'logo.png')
        if os.path.exists(logo_path):
            logo = Image(logo_path, width=60*mm, height=20*mm)
            logo.hAlign = 'LEFT'
            story.append(logo)
            story.append(Spacer(1, 10*mm))
        
        # Titre de la facture
        title = Paragraph("FACTURE", self.styles['InvoiceTitle'])
        story.append(title)
        
        # Numéro de facture
        invoice_number = Paragraph(
            f"<b>N° {self.invoice.invoice_number}</b>",
            self.styles['SectionTitle']
        )
        story.append(invoice_number)
        story.append(Spacer(1, 15*mm))
        
        # Informations de l'entreprise et du client
        company_info = f"""
        <b>Émis par :</b><br/>
        {self.invoice.company_name}<br/>
        {self.invoice.company_address.replace(chr(10), '<br/>')}<br/>
        SIRET : {self.invoice.company_siret}<br/>
        TVA : {self.invoice.company_vat_number}
        """
        
        customer_info = f"""
        <b>À l'attention de :</b><br/>
        {self.invoice.customer.get_full_name()}<br/>
        {self.invoice.customer.email}<br/>
        {self.invoice.customer.phone or ''}
        """
        
        # Tableau pour organiser les informations
        info_data = [
            [Paragraph(company_info, self.styles['CompanyInfo']), 
             Paragraph(customer_info, self.styles['CustomerInfo'])]
        ]
        
        info_table = Table(info_data, colWidths=[90*mm, 90*mm])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        story.append(info_table)
        story.append(Spacer(1, 15*mm))
    
    def _add_invoice_details(self, story):
        """Ajoute les détails de la facture"""
        details_data = [
            ['Date d\'émission', self.invoice.issue_date.strftime('%d/%m/%Y')],
            ['Date d\'échéance', self.invoice.due_date.strftime('%d/%m/%Y')],
            ['Méthode de paiement', self.invoice.get_payment_method_display() or 'Non spécifiée'],
        ]
        
        if self.invoice.payment_date:
            details_data.append(['Date de paiement', self.invoice.payment_date.strftime('%d/%m/%Y')])
        
        if self.invoice.transaction_reference:
            details_data.append(['Référence transaction', self.invoice.transaction_reference])
        
        details_table = Table(details_data, colWidths=[60*mm, 60*mm])
        details_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('TEXTCOLOR', (0, 0), (0, -1), GRAY_DARK),
            ('TEXTCOLOR', (1, 0), (1, -1), black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        story.append(details_table)
        story.append(Spacer(1, 15*mm))
    
    def _add_items_table(self, story):
        """Ajoute le tableau des articles"""
        # En-tête du tableau
        header_data = [
            ['Descriptif', 'Nb. jours', 'Tarif jour', 'Total HT']
        ]
        
        # Données des articles
        items_data = []
        for item in self.invoice.items.all():
            items_data.append([
                Paragraph(f"<b>{item.description}</b><br/>{item.detailed_description}", 
                         self.styles['Normal']),
                f"{item.quantity}",
                f"{item.unit_price_ht:.2f}€",
                f"{item.total_ht:.2f}€"
            ])
        
        # Tableau complet
        table_data = header_data + items_data
        
        # Style du tableau
        table = Table(table_data, colWidths=[80*mm, 25*mm, 30*mm, 30*mm])
        table.setStyle(TableStyle([
            # En-tête
            ('BACKGROUND', (0, 0), (-1, 0), GOLD_PRIMARY),
            ('TEXTCOLOR', (0, 0), (-1, 0), white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            
            # Corps du tableau
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Description
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),  # Quantité
            ('ALIGN', (2, 1), (3, -1), 'RIGHT'),  # Prix
            ('VALIGN', (0, 1), (-1, -1), 'TOP'),
            
            # Bordures
            ('GRID', (0, 0), (-1, -1), 0.5, black),
            ('LINEBELOW', (0, 0), (-1, 0), 2, GOLD_DARK),
            
            # Alternance des couleurs
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, GRAY_LIGHT]),
            
            # Padding
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 10*mm))
    
    def _add_totals(self, story):
        """Ajoute les totaux"""
        totals_data = [
            ['Sous-total HT', f"{self.invoice.subtotal_ht:.2f}€"],
            [f'TVA ({self.invoice.tax_rate}%)', f"{self.invoice.tax_amount:.2f}€"],
            ['', ''],
            ['TOTAL TTC', f"{self.invoice.total_ttc:.2f}€"]
        ]
        
        totals_table = Table(totals_data, colWidths=[120*mm, 60*mm])
        totals_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -2), 10),
            ('FONTSIZE', (0, -1), (-1, -1), 14),  # Total TTC plus grand
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),  # Total TTC en gras
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('TEXTCOLOR', (0, -1), (-1, -1), GOLD_PRIMARY),  # Total TTC en gold
            ('BACKGROUND', (0, -1), (-1, -1), GOLD_LIGHT),  # Fond gold pour le total
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        story.append(totals_table)
        story.append(Spacer(1, 15*mm))
    
    def _add_footer(self, story):
        """Ajoute le pied de page avec les conditions"""
        if self.invoice.notes:
            notes = Paragraph(
                f"<b>Notes :</b><br/>{self.invoice.notes}",
                self.styles['Normal']
            )
            story.append(notes)
            story.append(Spacer(1, 10*mm))
        
        # Informations de paiement
        payment_info = f"""
        <b>Informations de paiement :</b><br/>
        Paiement par virement bancaire<br/>
        Compte : 0123 4567 8901
        """
        story.append(Paragraph(payment_info, self.styles['Normal']))
        story.append(Spacer(1, 10*mm))
        
        # Conditions générales
        terms = Paragraph(
            f"<b>Termes & conditions :</b><br/>{self.invoice.terms_conditions}",
            self.styles['Normal']
        )
        story.append(terms)
        story.append(Spacer(1, 15*mm))
        
        # Signature
        signature_text = "Signature suivie de la mention \"bon pour accord\""
        story.append(Paragraph(signature_text, self.styles['Normal']))
        story.append(Spacer(1, 20*mm))
        
        # Ligne de signature
        signature_line = Table([['']], colWidths=[180*mm])
        signature_line.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (0, 0), 1, black),
        ]))
        story.append(signature_line)
    
    def generate_pdf(self):
        """Génère le PDF complet"""
        story = []
        
        # Ajouter tous les éléments
        self._add_header(story)
        self._add_invoice_details(story)
        self._add_items_table(story)
        self._add_totals(story)
        self._add_footer(story)
        
        # Construire le PDF
        self.doc.build(story)
        
        # Retourner le buffer
        self.buffer.seek(0)
        return self.buffer

def generate_invoice_pdf(invoice_id):
    """Fonction utilitaire pour générer un PDF de facture"""
    try:
        invoice = Invoice.objects.get(id=invoice_id)
        generator = InvoicePDFGenerator(invoice)
        pdf_buffer = generator.generate_pdf()
        
        return pdf_buffer
    except Invoice.DoesNotExist:
        return None

def create_invoice_pdf_response(invoice_id, filename=None):
    """Crée une réponse HTTP avec le PDF de la facture"""
    pdf_buffer = generate_invoice_pdf(invoice_id)
    
    if not pdf_buffer:
        return None
    
    if not filename:
        invoice = Invoice.objects.get(id=invoice_id)
        filename = f"facture_{invoice.invoice_number}.pdf"
    
    response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response
