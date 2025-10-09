"""
Fonctions utilitaires pour le système de paiement
Envoi de factures par email et Telegram
"""
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
import os
import requests


def send_invoice_email(invoice, recipient_email):
    """
    Envoie la facture par email avec le PDF en pièce jointe
    """
    from .pdf_generator import generate_invoice_pdf
    from .models_invoice import InvoiceItem
    
    # Récupérer les articles de la facture
    items = invoice.items.all()
    
    # Informations de l'entreprise
    company_info = {
        'name': "Calmness Trading",
        'address': "123 Rue du Trading, 75001 Paris, France",
        'phone': "+33 1 23 45 67 89",
        'email': "contact@calmnesstrading.com",
        'siret': "123 456 789 00012",
        'tva_intra': "FRXX123456789",
        'logo_path': os.path.join(settings.STATIC_ROOT or settings.BASE_DIR / 'static', 'img', 'logo.png')
    }
    
    # Générer le PDF
    try:
        pdf_content = generate_invoice_pdf(invoice, items, company_info)
    except Exception as e:
        print(f"Erreur génération PDF: {e}")
        pdf_content = None
    
    # Sujet de l'email
    subject = f"Votre facture Calmness Trading - {invoice.invoice_number}"
    
    # Corps de l'email (HTML)
    html_message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #D4AF37;">Calmness Trading</h1>
                </div>
                
                <h2 style="color: #D4AF37;">Merci pour votre paiement !</h2>
                
                <p>Bonjour {invoice.user.first_name or invoice.user.username},</p>
                
                <p>Nous avons bien reçu votre paiement pour <strong>{items.first().description if items.exists() else 'votre commande'}</strong>.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Détails de la facture</h3>
                    <p><strong>Numéro de facture :</strong> {invoice.invoice_number}</p>
                    <p><strong>Date :</strong> {invoice.issue_date.strftime('%d/%m/%Y')}</p>
                    <p><strong>Montant :</strong> {invoice.total_amount} {invoice.currency}</p>
                    <p><strong>Transaction ID :</strong> {invoice.transaction_id}</p>
                </div>
                
                <p>Vous trouverez votre facture en pièce jointe de cet email.</p>
                
                <p>Votre accès au service sera activé dans les prochaines minutes.</p>
                
                <p style="margin-top: 30px;">
                    Si vous avez des questions, n'hésitez pas à nous contacter :<br>
                    📧 Email : <a href="mailto:support@calmnesstrading.com">support@calmnesstrading.com</a><br>
                    📱 Telegram : @calmnesstrading<br>
                    💬 WhatsApp : +33 1 23 45 67 89
                </p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
                
                <p style="font-size: 12px; color: #666; text-align: center;">
                    © 2024 Calmness Trading. Tous droits réservés.<br>
                    123 Rue du Trading, 75001 Paris, France
                </p>
            </div>
        </body>
    </html>
    """
    
    # Créer l'email
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient_email]
    )
    email.content_subtype = "html"
    
    # Ajouter le PDF en pièce jointe si généré
    if pdf_content:
        email.attach(
            f'facture_{invoice.invoice_number}.pdf',
            pdf_content,
            'application/pdf'
        )
    
    # Envoyer l'email
    try:
        email.send()
        print(f"Facture {invoice.invoice_number} envoyée à {recipient_email}")
        return True
    except Exception as e:
        print(f"Erreur envoi email: {e}")
        return False


def send_invoice_telegram(invoice, telegram_username):
    """
    Envoie la facture par Telegram
    Nécessite un bot Telegram configuré
    """
    telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    
    if not telegram_bot_token:
        print("TELEGRAM_BOT_TOKEN non configuré")
        return False
    
    # Message à envoyer
    message = f"""
🎉 *Paiement Confirmé - Calmness Trading*

Bonjour ! Nous avons bien reçu votre paiement.

📄 *Facture :* {invoice.invoice_number}
💰 *Montant :* {invoice.total_amount} {invoice.currency}
🔖 *Transaction ID :* {invoice.transaction_id}
📅 *Date :* {invoice.issue_date.strftime('%d/%m/%Y')}

Votre facture a également été envoyée par email.
Votre accès sera activé dans quelques instants.

Merci de votre confiance ! 🚀

_Pour toute question : @calmnesstrading_
    """
    
    try:
        # Note : Pour envoyer à un username, il faut d'abord que l'utilisateur
        # ait démarré une conversation avec le bot
        # Alternative : utiliser un canal/groupe Telegram
        
        # Cette implémentation est simplifiée
        # En production, utiliser une bibliothèque comme python-telegram-bot
        
        print(f"Message Telegram prêt pour {telegram_username}")
        print(message)
        
        # TODO: Implémenter l'envoi réel via l'API Telegram
        # url = f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage"
        # data = {
        #     'chat_id': telegram_chat_id,
        #     'text': message,
        #     'parse_mode': 'Markdown'
        # }
        # response = requests.post(url, json=data)
        
        return True
    except Exception as e:
        print(f"Erreur envoi Telegram: {e}")
        return False


def send_invoice_whatsapp(invoice, phone_number):
    """
    Envoie la facture par WhatsApp
    Nécessite WhatsApp Business API
    """
    # TODO: Implémenter avec WhatsApp Business API ou Twilio
    print(f"WhatsApp message préparé pour {phone_number}")
    return True


def send_invoice_discord(invoice, discord_username):
    """
    Envoie la facture par Discord
    Nécessite un bot Discord configuré
    """
    # TODO: Implémenter avec Discord Webhook ou Bot
    print(f"Discord message préparé pour {discord_username}")
    return True
