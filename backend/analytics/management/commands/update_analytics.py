"""
Commande Django pour mettre à jour toutes les analytics
Usage: python manage.py update_analytics
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from analytics.models import TradingPerformance, AnalyticsSummary
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Met à jour toutes les métriques analytics (trading performances, rankings, résumés quotidiens)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Date spécifique pour générer le résumé (YYYY-MM-DD)',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Nombre de jours en arrière pour générer les résumés (défaut: 7)',
        )
        parser.add_argument(
            '--performances-only',
            action='store_true',
            help='Mettre à jour uniquement les performances trading',
        )
        parser.add_argument(
            '--summaries-only',
            action='store_true',
            help='Générer uniquement les résumés quotidiens',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Démarrage mise à jour Analytics...'))
        
        if not options['summaries_only']:
            self.update_trading_performances()
        
        if not options['performances_only']:
            self.generate_summaries(options)
        
        self.stdout.write(self.style.SUCCESS('✅ Mise à jour Analytics terminée !'))

    def update_trading_performances(self):
        """Met à jour les performances de trading de tous les utilisateurs"""
        self.stdout.write('📊 Mise à jour des performances trading...')
        
        users = User.objects.filter(is_active=True)
        updated_count = 0
        
        for user in users:
            try:
                perf, created = TradingPerformance.objects.get_or_create(user=user)
                
                # Recalculer les métriques
                perf.calculate_all_metrics()
                updated_count += 1
                
                if created:
                    self.stdout.write(f'  ✓ Créé performance pour {user.email}')
                else:
                    self.stdout.write(f'  ↻ Mis à jour {user.email}')
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Erreur {user.email}: {e}')
                )
        
        # Mettre à jour le classement global
        self.stdout.write('🏆 Mise à jour du classement global...')
        TradingPerformance.update_global_rankings()
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ {updated_count} performances mises à jour')
        )

    def generate_summaries(self, options):
        """Génère les résumés quotidiens"""
        self.stdout.write('📅 Génération des résumés quotidiens...')
        
        if options['date']:
            # Date spécifique
            target_date = date.fromisoformat(options['date'])
            dates = [target_date]
        else:
            # Plusieurs jours en arrière
            days = options['days']
            today = date.today()
            dates = [today - timedelta(days=i) for i in range(days)]
        
        generated_count = 0
        
        for target_date in dates:
            try:
                summary = AnalyticsSummary.generate_for_date(target_date)
                generated_count += 1
                self.stdout.write(f'  ✓ Résumé généré pour {target_date}')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Erreur {target_date}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ {generated_count} résumés générés')
        )
