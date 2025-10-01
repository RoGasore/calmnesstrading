from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Vérifier et créer un utilisateur admin'

    def add_arguments(self, parser):
        parser.add_argument(
            '--create',
            action='store_true',
            help='Créer un admin si aucun n\'existe'
        )

    def handle(self, *args, **options):
        # Vérifier les admins existants
        admins = User.objects.filter(is_staff=True)
        
        if admins.exists():
            self.stdout.write('Admins existants:')
            for admin in admins:
                self.stdout.write(f'  - {admin.email} (Staff: {admin.is_staff})')
        else:
            self.stdout.write(self.style.WARNING('Aucun admin trouvé'))
            
            if options['create']:
                # Créer un admin par défaut
                admin = User.objects.create_user(
                    username='admin',
                    email='admin@calmnessfi.com',
                    password='calmness',
                    first_name='Admin',
                    last_name='User',
                    is_staff=True,
                    is_superuser=True
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Admin créé: {admin.email}')
                )
                self.stdout.write(
                    self.style.WARNING('Mot de passe: calmness')
                )
            else:
                self.stdout.write('Utilisez --create pour créer un admin')
