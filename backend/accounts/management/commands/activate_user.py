from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import EmailVerificationToken

User = get_user_model()

class Command(BaseCommand):
    help = 'Active un utilisateur par email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email de l\'utilisateur à activer')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_active and user.is_verified:
                self.stdout.write(f"L'utilisateur {email} est déjà actif et vérifié.")
                return
            
            # Activer l'utilisateur
            user.is_active = True
            user.is_verified = True
            user.save()
            
            # Marquer le token comme utilisé
            EmailVerificationToken.objects.filter(user=user, is_used=False).update(is_used=True)
            
            self.stdout.write(
                self.style.SUCCESS(f"✅ Utilisateur {email} activé avec succès!")
            )
            self.stdout.write(f"   - Username: {user.username}")
            self.stdout.write(f"   - Nom: {user.first_name} {user.last_name}")
            self.stdout.write(f"   - Actif: {user.is_active}")
            self.stdout.write(f"   - Vérifié: {user.is_verified}")
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"❌ Utilisateur avec l'email {email} non trouvé.")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Erreur lors de l'activation: {e}")
            )
