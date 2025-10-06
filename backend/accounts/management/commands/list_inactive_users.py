from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import EmailVerificationToken

User = get_user_model()

class Command(BaseCommand):
    help = 'Liste les utilisateurs non activés'

    def handle(self, *args, **options):
        inactive_users = User.objects.filter(is_active=False)
        
        if not inactive_users.exists():
            self.stdout.write("Aucun utilisateur inactif trouvé.")
            return
        
        self.stdout.write(f"Utilisateurs inactifs ({inactive_users.count()}):")
        self.stdout.write("-" * 80)
        
        for user in inactive_users:
            token = EmailVerificationToken.objects.filter(user=user, is_used=False).first()
            token_info = f"Token: {token.token[:10]}..." if token else "Aucun token"
            
            self.stdout.write(f"📧 {user.email}")
            self.stdout.write(f"   Username: {user.username}")
            self.stdout.write(f"   Nom: {user.first_name} {user.last_name}")
            self.stdout.write(f"   Créé: {user.date_joined}")
            self.stdout.write(f"   {token_info}")
            self.stdout.write("")
        
        self.stdout.write("Pour activer un utilisateur, utilisez:")
        self.stdout.write("python manage.py activate_user <email>")
