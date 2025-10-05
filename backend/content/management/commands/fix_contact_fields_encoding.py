from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import ContactField

class Command(BaseCommand):
    help = 'Fix encoding issues in contact fields'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting contact fields encoding fix...'))

        # Fix encoding issues in contact fields
        encoding_fixes = {
            'TÃ©lÃ©phone': 'Téléphone',
            'Service d\'intÃ©rÃªt': 'Service d\'intérêt',
            'Liste dÃ©roulante': 'Liste déroulante',
            'Zone de texte': 'Zone de texte'
        }

        updated_count = 0

        for field in ContactField.objects.all():
            updated = False
            
            # Fix field label
            if field.field_label in encoding_fixes:
                field.field_label = encoding_fixes[field.field_label]
                updated = True
            
            # Fix field type display (if it exists)
            if hasattr(field, 'field_type_display') and field.field_type_display in encoding_fixes:
                field.field_type_display = encoding_fixes[field.field_type_display]
                updated = True
            
            if updated:
                field.save()
                updated_count += 1
                self.stdout.write(f'  Updated: {field.field_name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Contact fields encoding fix completed! {updated_count} fields updated.'
            )
        )


