from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import ContactField
from accounts.models import User

class Command(BaseCommand):
    help = 'Populate contact fields with existing frontend fields'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting contact fields population...'))

        # Get an admin user for content creation
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('No admin user found. Please create an admin user first.'))
            return

        # Existing contact form fields from frontend
        contact_fields_data = [
            {
                'field_name': 'name',
                'field_label': 'Nom complet',
                'field_type': 'text',
                'field_placeholder': 'Votre nom complet',
                'is_required': True,
                'order': 1
            },
            {
                'field_name': 'email',
                'field_label': 'Adresse email',
                'field_type': 'email',
                'field_placeholder': 'votre@email.com',
                'is_required': True,
                'order': 2
            },
            {
                'field_name': 'subject',
                'field_label': 'Sujet',
                'field_type': 'text',
                'field_placeholder': 'Objet de votre message',
                'is_required': True,
                'order': 3
            },
            {
                'field_name': 'message',
                'field_label': 'Message',
                'field_type': 'textarea',
                'field_placeholder': 'Votre message...',
                'is_required': True,
                'order': 4
            },
            {
                'field_name': 'phone',
                'field_label': 'Téléphone',
                'field_type': 'phone',
                'field_placeholder': '+33 1 23 45 67 89',
                'is_required': False,
                'order': 5
            },
            {
                'field_name': 'company',
                'field_label': 'Entreprise',
                'field_type': 'text',
                'field_placeholder': 'Nom de votre entreprise',
                'is_required': False,
                'order': 6
            },
            {
                'field_name': 'service_interest',
                'field_label': 'Service d\'intérêt',
                'field_type': 'select',
                'field_placeholder': 'Sélectionnez un service',
                'is_required': False,
                'order': 7,
                'options': ['Formations', 'Signaux Premium', 'Gestion de comptes', 'Support', 'Autre']
            }
        ]

        created_count = 0
        updated_count = 0

        for field_data in contact_fields_data:
            field, created = ContactField.objects.update_or_create(
                field_name=field_data['field_name'],
                defaults={
                    'field_label': field_data['field_label'],
                    'field_type': field_data['field_type'],
                    'field_placeholder': field_data['field_placeholder'],
                    'is_required': field_data['is_required'],
                    'order': field_data['order'],
                    'is_visible': True,
                    'options': field_data.get('options', []),
                    'created_by': admin_user,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {field.field_label} ({field.field_type})')
            else:
                updated_count += 1
                self.stdout.write(f'  Updated: {field.field_label} ({field.field_type})')

        self.stdout.write(
            self.style.SUCCESS(
                f'Contact fields population completed! {created_count} fields created, {updated_count} fields updated.'
            )
        )



