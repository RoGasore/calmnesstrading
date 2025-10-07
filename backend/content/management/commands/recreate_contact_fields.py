from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import ContactField
from accounts.models import User

class Command(BaseCommand):
    help = 'Recreate contact fields with correct encoding'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting contact fields recreation...'))

        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('No admin user found.'))
            return

        # Create phone field
        phone_field = ContactField.objects.create(
            field_name='phone',
            field_label='Téléphone',
            field_type='phone',
            field_placeholder='+33 1 23 45 67 89',
            is_required=False,
            order=5,
            is_visible=True,
            created_by=admin_user
        )
        self.stdout.write(f'Created: {phone_field.field_label}')

        # Create service interest field
        service_field = ContactField.objects.create(
            field_name='service_interest',
            field_label='Service d\'intérêt',
            field_type='select',
            field_placeholder='Sélectionnez un service',
            is_required=False,
            order=7,
            is_visible=True,
            options=['Formations', 'Signaux Premium', 'Gestion de comptes', 'Support', 'Autre'],
            created_by=admin_user
        )
        self.stdout.write(f'Created: {service_field.field_label}')

        self.stdout.write(self.style.SUCCESS('Contact fields recreation completed!'))



