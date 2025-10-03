from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import FAQItem
from accounts.models import User

class Command(BaseCommand):
    help = 'Populate FAQ with sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting FAQ population...'))

        # Get an admin user for content creation
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('No admin user found. Please create an admin user first.'))
            return

        # Sample FAQ data
        faq_data = [
            {
                'question': 'Qu\'est-ce que Calmness Trading ?',
                'answer': 'Calmness Trading est une plateforme professionnelle de trading qui propose des formations, signaux et services de gestion de comptes pour vous aider à maîtriser les marchés financiers.',
                'category': 'general',
                'status': 'published',
                'order': 1
            },
            {
                'question': 'Comment puis-je commencer ?',
                'answer': 'Vous pouvez commencer en choisissant l\'une de nos trois solutions : Formation Trading, Signaux Premium ou Gestion de Comptes. Chaque service est adapté à votre niveau et vos objectifs.',
                'category': 'general',
                'status': 'published',
                'order': 2
            },
            {
                'question': 'Vos signaux sont-ils fiables ?',
                'answer': 'Oui, nos signaux sont basés sur une analyse technique approfondie et ont un taux de réussite de 87%. Nous publions également nos performances pour plus de transparence.',
                'category': 'signaux',
                'status': 'published',
                'order': 3
            },
            {
                'question': 'Combien coûtent vos formations ?',
                'answer': 'Nos formations varient de 150€ à 1500€ selon le niveau et le contenu. Nous proposons également des packages complets avec un excellent rapport qualité-prix.',
                'category': 'formations',
                'status': 'published',
                'order': 4
            },
            {
                'question': 'Comment fonctionne la gestion de comptes ?',
                'answer': 'Nous gérons votre compte trading de manière professionnelle avec une gestion des risques stricte et une performance transparente. Vous gardez le contrôle total de votre compte.',
                'category': 'comptes',
                'status': 'published',
                'order': 5
            },
            {
                'question': 'Quels sont vos moyens de paiement ?',
                'answer': 'Nous acceptons les cartes bancaires, virements et paiements via PayPal. Tous nos paiements sont sécurisés et cryptés.',
                'category': 'paiements',
                'status': 'published',
                'order': 6
            },
            {
                'question': 'Proposez-vous un support client ?',
                'answer': 'Oui, notre équipe de support est disponible 24/7 via notre communauté Telegram et Discord, ainsi que par email pour toute question urgente.',
                'category': 'general',
                'status': 'published',
                'order': 7
            },
            {
                'question': 'Puis-je annuler mon abonnement ?',
                'answer': 'Oui, vous pouvez annuler votre abonnement à tout moment. Nous appliquons une politique de remboursement de 30 jours pour les nouveaux clients.',
                'category': 'paiements',
                'status': 'published',
                'order': 8
            }
        ]

        created_count = 0
        updated_count = 0

        for faq_item in faq_data:
            item, created = FAQItem.objects.update_or_create(
                question=faq_item['question'],
                defaults={
                    'answer': faq_item['answer'],
                    'category': faq_item['category'],
                    'status': faq_item['status'],
                    'order': faq_item['order'],
                    'created_by': admin_user,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {item.question}')
            else:
                updated_count += 1
                self.stdout.write(f'  Updated: {item.question}')

        self.stdout.write(
            self.style.SUCCESS(
                f'FAQ population completed! {created_count} items created, {updated_count} items updated.'
            )
        )

