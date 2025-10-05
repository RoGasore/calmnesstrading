from django.core.management.base import BaseCommand
from content.models_comprehensive_cms import Review

class Command(BaseCommand):
    help = 'Populate reviews with sample data'

    def handle(self, *args, **options):
        # Avis d'exemple
        sample_reviews = [
            {
                'author_name': 'Marie Dubois',
                'author_email': 'marie.dubois@email.com',
                'service_name': 'Formation Trading Complète',
                'service_type': 'formation',
                'title': 'Excellente formation !',
                'content': 'Cette formation m\'a permis d\'apprendre les bases du trading de manière claire et structurée. Les vidéos sont de qualité et les exercices pratiques très utiles. Je recommande vivement !',
                'rating': 5,
                'status': 'approved',
                'is_featured': True,
                'is_public': True,
                'order': 1
            },
            {
                'author_name': 'Jean Martin',
                'author_email': 'jean.martin@email.com',
                'service_name': 'Signaux Trading Premium',
                'service_type': 'signal',
                'title': 'Signaux très précis',
                'content': 'Les signaux sont vraiment de qualité. J\'ai pu améliorer mes résultats grâce aux analyses détaillées fournies. Le support est également très réactif.',
                'rating': 5,
                'status': 'approved',
                'is_featured': True,
                'is_public': True,
                'order': 2
            },
            {
                'author_name': 'Sophie Leroy',
                'author_email': 'sophie.leroy@email.com',
                'service_name': 'Gestion de Compte Pro',
                'service_type': 'account',
                'title': 'Service professionnel',
                'content': 'L\'équipe gère mon compte avec beaucoup de professionnalisme. Les résultats sont au rendez-vous et je peux suivre l\'évolution en temps réel.',
                'rating': 4,
                'status': 'approved',
                'is_featured': False,
                'is_public': True,
                'order': 3
            },
            {
                'author_name': 'Pierre Durand',
                'author_email': 'pierre.durand@email.com',
                'service_name': 'Coaching Personnel',
                'service_type': 'coaching',
                'title': 'Coaching personnalisé efficace',
                'content': 'Les sessions de coaching m\'ont aidé à mieux comprendre mes erreurs et à améliorer ma stratégie. Le coach est très à l\'écoute et donne de bons conseils.',
                'rating': 5,
                'status': 'approved',
                'is_featured': False,
                'is_public': True,
                'order': 4
            },
            {
                'author_name': 'Amélie Rousseau',
                'author_email': 'amelie.rousseau@email.com',
                'service_name': 'Analyse de Marché',
                'service_type': 'service',
                'title': 'Analyses détaillées',
                'content': 'Les analyses sont très complètes et me permettent de mieux anticiper les mouvements du marché. Un service de qualité !',
                'rating': 4,
                'status': 'approved',
                'is_featured': False,
                'is_public': True,
                'order': 5
            }
        ]

        created_count = 0
        for review_data in sample_reviews:
            review, created = Review.objects.get_or_create(
                author_email=review_data['author_email'],
                service_name=review_data['service_name'],
                defaults=review_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Avis créé: {review_data["author_name"]} - {review_data["service_name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Avis existe déjà: {review_data["author_name"]} - {review_data["service_name"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'{created_count} nouveaux avis créés sur {len(sample_reviews)}')
        )


