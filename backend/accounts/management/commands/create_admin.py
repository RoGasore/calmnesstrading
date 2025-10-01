from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import UserProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Crée un compte administrateur par défaut'

    def handle(self, *args, **options):
        admin_email = 'admin@calmnessfi.com'
        admin_password = 'calmness'
        
        # Vérifier si l'admin existe déjà
        if User.objects.filter(email=admin_email).exists():
            self.stdout.write(
                self.style.WARNING(f'L\'administrateur avec l\'email {admin_email} existe déjà.')
            )
            return
        
        # Créer l'utilisateur admin
        admin_user = User.objects.create_user(
            username='admin',
            email=admin_email,
            password=admin_password,
            first_name='Admin',
            last_name='Calmness',
            is_staff=True,
            is_superuser=True,
            is_active=True,
            is_verified=True
        )
        
        # Créer le profil admin
        UserProfile.objects.create(
            user=admin_user,
            trading_experience='expert',
            preferred_language='fr'
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Administrateur créé avec succès!\n'
                f'Email: {admin_email}\n'
                f'Mot de passe: {admin_password}'
            )
        )
