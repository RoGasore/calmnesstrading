from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import SitePage, ContentBlock, GlobalSettings, FAQItem, Testimonial, ContactField
from accounts.models import User
import json

class Command(BaseCommand):
    help = 'Exporte tout le contenu local vers la production'

    def handle(self, *args, **options):
        self.stdout.write("📤 Exportation du contenu local...")
        
        try:
            # Export des pages
            pages_data = []
            for page in SitePage.objects.all():
                pages_data.append({
                    'name': page.name,
                    'slug': page.slug,
                    'title': page.title,
                    'description': page.description,
                    'is_active': page.is_active,
                    'is_public': page.is_public,
                    'order': page.order
                })
            
            # Export des blocs de contenu
            blocks_data = []
            for block in ContentBlock.objects.all():
                blocks_data.append({
                    'page_slug': block.page.slug,
                    'block_key': block.block_key,
                    'content': block.content,
                    'order': block.order,
                    'is_visible': block.is_visible
                })
            
            # Export des paramètres globaux
            global_settings_data = []
            for setting in GlobalSettings.objects.all():
                global_settings_data.append({
                    'site_name': setting.site_name,
                    'site_tagline': setting.site_tagline,
                    'site_description': setting.site_description,
                    'email_contact': setting.email_contact,
                    'phone_contact': setting.phone_contact,
                    'contact_email': setting.contact_email,
                    'contact_phone': setting.contact_phone,
                    'address': setting.address,
                    'contact_title': setting.contact_title,
                    'business_hours': setting.business_hours,
                    'telegram_support': setting.telegram_support,
                    'support_description': setting.support_description,
                    'copyright_text': setting.copyright_text,
                    'social_networks': setting.social_networks
                })
            
            # Export des FAQ
            faq_data = []
            for faq in FAQItem.objects.all():
                faq_data.append({
                    'question': faq.question,
                    'answer': faq.answer,
                    'category': faq.category,
                    'order': faq.order,
                    'status': faq.status,
                    'is_featured': faq.is_featured
                })
            
            # Export des témoignages
            testimonials_data = []
            for testimonial in Testimonial.objects.all():
                testimonials_data.append({
                    'client_name': testimonial.client_name,
                    'client_email': testimonial.client_email,
                    'client_role': testimonial.client_role,
                    'testimonial_text': testimonial.testimonial_text,
                    'rating': testimonial.rating,
                    'status': testimonial.status,
                    'is_featured': testimonial.is_featured,
                    'order': testimonial.order
                })
            
            # Export des champs de contact
            contact_fields_data = []
            for field in ContactField.objects.all():
                contact_fields_data.append({
                    'field_type': field.field_type,
                    'field_name': field.field_name,
                    'field_label': field.field_label,
                    'field_placeholder': field.field_placeholder,
                    'is_required': field.is_required,
                    'is_visible': field.is_visible,
                    'order': field.order,
                    'validation_rules': field.validation_rules
                })
            
            # Créer le fichier d'export
            export_data = {
                'pages': pages_data,
                'content_blocks': blocks_data,
                'global_settings': global_settings_data,
                'faq_items': faq_data,
                'testimonials': testimonials_data,
                'contact_fields': contact_fields_data
            }
            
            # Afficher les statistiques
            self.stdout.write(f"\n📊 Contenu exporté:")
            self.stdout.write(f"- Pages: {len(pages_data)}")
            self.stdout.write(f"- Blocs de contenu: {len(blocks_data)}")
            self.stdout.write(f"- Paramètres globaux: {len(global_settings_data)}")
            self.stdout.write(f"- FAQ: {len(faq_data)}")
            self.stdout.write(f"- Témoignages: {len(testimonials_data)}")
            self.stdout.write(f"- Champs de contact: {len(contact_fields_data)}")
            
            self.stdout.write(self.style.SUCCESS("\n✅ Export terminé avec succès!"))
            
            # Afficher quelques exemples de contenu
            if blocks_data:
                self.stdout.write(f"\n📝 Exemples de blocs exportés:")
                for block in blocks_data[:5]:
                    self.stdout.write(f"- {block['page_slug']}.{block['block_key']}: {block['content'][:50]}...")
            
            return export_data
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Erreur lors de l'export: {str(e)}"))
            return None
