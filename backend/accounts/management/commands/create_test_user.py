from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import UserProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Crée un utilisateur de test pour le développement'

    def handle(self, *args, **options):
        test_email = 'test@calmnessfi.com'
        test_password = 'Test123!'
        
        # Vérifier si l'utilisateur test existe déjà
        if User.objects.filter(email=test_email).exists():
            self.stdout.write(
                self.style.WARNING(f'L\'utilisateur avec l\'email {test_email} existe déjà.')
            )
            return
        
        # Créer l'utilisateur test
        test_user = User.objects.create_user(
            username='testuser',
            email=test_email,
            password=test_password,
            first_name='Jean',
            last_name='Dupont',
            phone='+33612345678',
            telegram_username='@jeandupont',
            discord_username='jeandupont#1234',
            whatsapp_number='+33612345678',
            is_staff=False,
            is_superuser=False,
            is_active=True,
            is_verified=True,
            can_make_payment=True  # Profil complet
        )
        
        # Créer le profil utilisateur avec des préférences
        UserProfile.objects.create(
            user=test_user,
            bio='Trader débutant passionné par les crypto-monnaies et le forex.',
            trading_experience='intermediate',
            preferred_language='fr',
            timezone='Europe/Paris',
            country='France',
            city='Paris',
            preferred_assets=['crypto', 'forex'],
            risk_tolerance='medium'
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Utilisateur de test créé avec succès!\n'
                f'📧 Email: {test_email}\n'
                f'🔑 Mot de passe: {test_password}\n'
                f'👤 Nom: {test_user.first_name} {test_user.last_name}\n'
                f'📱 Téléphone: {test_user.phone}\n'
                f'💬 Telegram: {test_user.telegram_username}\n'
                f'🎮 Discord: {test_user.discord_username}\n'
                f'📲 WhatsApp: {test_user.whatsapp_number}\n'
                f'✓ Profil complet - Peut effectuer des paiements'
            )
        )

