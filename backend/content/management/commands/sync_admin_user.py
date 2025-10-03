from django.core.management.base import BaseCommand
from accounts.models import User

class Command(BaseCommand):
    help = 'Synchronise l\'utilisateur admin en production'

    def handle(self, *args, **options):
        self.stdout.write("🔄 Synchronisation de l'utilisateur admin...")
        
        try:
            # Créer ou mettre à jour l'utilisateur admin
            admin_user, created = User.objects.get_or_create(
                username='admin',
                defaults={
                    'email': 'admin@calmness.com',
                    'first_name': 'Admin',
                    'last_name': 'Calmness',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write("✅ Utilisateur admin créé")
            else:
                self.stdout.write("ℹ️  Utilisateur admin existant")
                
            # Mettre à jour les informations
            admin_user.email = 'admin@calmness.com'
            admin_user.first_name = 'Admin'
            admin_user.last_name = 'Calmness'
            admin_user.is_staff = True
            admin_user.is_superuser = True
            admin_user.is_active = True
            
            # Définir le mot de passe
            admin_user.set_password('calmness')
            admin_user.save()
            
            self.stdout.write("✅ Mot de passe admin synchronisé: calmness")
            
            # Vérification
            self.stdout.write(f"\n📋 Informations de l'admin:")
            self.stdout.write(f"- Username: {admin_user.username}")
            self.stdout.write(f"- Email: {admin_user.email}")
            self.stdout.write(f"- Nom: {admin_user.first_name} {admin_user.last_name}")
            self.stdout.write(f"- Staff: {admin_user.is_staff}")
            self.stdout.write(f"- Superuser: {admin_user.is_superuser}")
            self.stdout.write(f"- Actif: {admin_user.is_active}")
            
            self.stdout.write(self.style.SUCCESS("\n✅ Synchronisation de l'admin terminée avec succès!"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Erreur lors de la synchronisation: {str(e)}"))
