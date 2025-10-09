from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Crée un compte service client par défaut'

    def handle(self, *args, **kwargs):
        email = 'service@calmnessfi.com'
        password = 'ServiceClient2024!'
        username = 'service_client'
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'✓ Le compte service client existe déjà: {email}')
            )
            user = User.objects.get(email=email)
            # Mettre à jour le rôle si nécessaire
            if user.role != 'customer_service':
                user.role = 'customer_service'
                user.is_staff = True
                user.is_active = True
                user.is_verified = True
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Rôle mis à jour en service client')
                )
            return
        
        # Créer le compte service client
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name='Service',
            last_name='Client',
            role='customer_service',
            is_staff=True,
            is_active=True,
            is_verified=True,
        )
        
        self.stdout.write(
            self.style.SUCCESS('\n' + '='*60)
        )
        self.stdout.write(
            self.style.SUCCESS('✓ Compte Service Client créé avec succès!')
        )
        self.stdout.write(
            self.style.SUCCESS('='*60)
        )
        self.stdout.write(
            self.style.SUCCESS(f'\n📧 Email    : {email}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'🔑 Mot de passe : {password}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'👤 Rôle    : Service Client')
        )
        self.stdout.write(
            self.style.SUCCESS(f'🔗 URL     : https://calmnesstrading.vercel.app/support')
        )
        self.stdout.write(
            self.style.SUCCESS('\n' + '='*60 + '\n')
        )
        
        self.stdout.write(
            self.style.WARNING('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!')
        )

