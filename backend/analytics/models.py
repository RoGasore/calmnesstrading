"""
Modèles pour le système d'analytics avancé de Calmness Trading
Tracking des visites, sessions, et performances de trading des utilisateurs
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q, F
from datetime import timedelta
import uuid

User = get_user_model()


class PageView(models.Model):
    """Enregistre chaque vue de page pour analytics détaillés"""
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='page_views')
    session_id = models.CharField(max_length=255, db_index=True)
    
    # Page info
    page_url = models.CharField(max_length=500)
    page_title = models.CharField(max_length=255, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    
    # User info
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Geolocation
    country = models.CharField(max_length=100, blank=True, db_index=True)
    country_code = models.CharField(max_length=2, blank=True)
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    timezone_name = models.CharField(max_length=100, blank=True)
    
    # Device info
    device_type = models.CharField(max_length=50, db_index=True)  # desktop, mobile, tablet
    browser = models.CharField(max_length=100)
    browser_version = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=100)
    os_version = models.CharField(max_length=50, blank=True)
    screen_resolution = models.CharField(max_length=20, blank=True)
    
    # Timing
    time_on_page = models.IntegerField(default=0)  # secondes
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        app_label = 'analytics'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_id', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['country', 'created_at']),
        ]
        verbose_name = "Page View"
        verbose_name_plural = "Page Views"
    
    def __str__(self):
        return f"{self.page_url} - {self.created_at}"


class UserSession(models.Model):
    """Suivi des sessions utilisateur"""
    
    SESSION_STATUS = [
        ('active', 'Active'),
        ('ended', 'Terminée'),
        ('bounced', 'Rebond'),
    ]
    
    # Identification
    session_id = models.CharField(max_length=255, unique=True, db_index=True)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='sessions')
    
    # Timing
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(default=0)  # en secondes
    
    # Métriques
    pages_viewed = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=SESSION_STATUS, default='active')
    
    # Conversion
    converted = models.BooleanField(default=False)
    conversion_type = models.CharField(max_length=50, blank=True)  # purchase, signup, contact, etc.
    conversion_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Geolocation (from first page view)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Device (from first page view)
    device_type = models.CharField(max_length=50, blank=True)
    
    # Source tracking
    utm_source = models.CharField(max_length=255, blank=True)
    utm_medium = models.CharField(max_length=255, blank=True)
    utm_campaign = models.CharField(max_length=255, blank=True)
    
    class Meta:
        app_label = 'analytics'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', 'start_time']),
            models.Index(fields=['status', 'start_time']),
        ]
        verbose_name = "User Session"
        verbose_name_plural = "User Sessions"
    
    def __str__(self):
        return f"Session {self.session_id[:8]} - {self.start_time}"
    
    @property
    def is_bounced(self):
        """Une session est un rebond si elle dure moins de 10 secondes ou a 1 seule page"""
        return self.duration < 10 or self.pages_viewed <= 1
    
    def end_session(self):
        """Termine la session et calcule les métriques"""
        if not self.end_time:
            self.end_time = timezone.now()
            self.duration = int((self.end_time - self.start_time).total_seconds())
            self.status = 'bounced' if self.is_bounced else 'ended'
            self.save()


class TradingPerformance(models.Model):
    """Agrégation des performances de trading par utilisateur"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trading_performance')
    
    # Métriques globales
    total_trades = models.IntegerField(default=0)
    winning_trades = models.IntegerField(default=0)
    losing_trades = models.IntegerField(default=0)
    breakeven_trades = models.IntegerField(default=0)
    
    # Profits/Pertes
    total_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_loss = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_profit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Pips
    total_pips_won = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_pips_lost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pips = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Ratios
    win_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # pourcentage
    profit_factor = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    average_win = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    average_loss = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    risk_reward_ratio = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Take Profit / Stop Loss
    trades_with_tp = models.IntegerField(default=0)
    trades_with_sl = models.IntegerField(default=0)
    tp_hit_count = models.IntegerField(default=0)
    sl_hit_count = models.IntegerField(default=0)
    tp_hit_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Drawdown
    max_drawdown = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_drawdown_pips = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Séries
    max_consecutive_wins = models.IntegerField(default=0)
    max_consecutive_losses = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    current_streak_type = models.CharField(max_length=10, blank=True)  # 'win' or 'loss'
    
    # Ranking
    ranking_score = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    global_rank = models.IntegerField(null=True, blank=True)
    
    # Timestamps
    first_trade_date = models.DateTimeField(null=True, blank=True)
    last_trade_date = models.DateTimeField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'analytics'
        ordering = ['-ranking_score']
        verbose_name = "Trading Performance"
        verbose_name_plural = "Trading Performances"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - WR: {self.win_rate}% | PF: {self.profit_factor}"
    
    def calculate_all_metrics(self):
        """Recalcule toutes les métriques depuis les trades"""
        from accounts.models import Trade  # Import local pour éviter circular
        
        trades = Trade.objects.filter(account__user=self.user, status='closed')
        
        if not trades.exists():
            return
        
        # Comptage
        self.total_trades = trades.count()
        self.winning_trades = trades.filter(profit__gt=0).count()
        self.losing_trades = trades.filter(profit__lt=0).count()
        self.breakeven_trades = trades.filter(profit=0).count()
        
        # Profits/Pertes
        profits = trades.filter(profit__gt=0).aggregate(total=Sum('profit'))['total'] or 0
        losses = abs(trades.filter(profit__lt=0).aggregate(total=Sum('profit'))['total'] or 0)
        self.total_profit = profits
        self.total_loss = losses
        self.net_profit = profits - losses
        
        # Pips
        pips_won = trades.filter(profit__gt=0).aggregate(total=Sum('pips'))['total'] or 0
        pips_lost = abs(trades.filter(profit__lt=0).aggregate(total=Sum('pips'))['total'] or 0)
        self.total_pips_won = pips_won
        self.total_pips_lost = pips_lost
        self.net_pips = pips_won - pips_lost
        
        # Ratios
        if self.total_trades > 0:
            self.win_rate = (self.winning_trades / self.total_trades) * 100
        
        if losses > 0:
            self.profit_factor = profits / losses
        else:
            self.profit_factor = profits if profits > 0 else 0
        
        if self.winning_trades > 0:
            self.average_win = profits / self.winning_trades
        
        if self.losing_trades > 0:
            self.average_loss = losses / self.losing_trades
        
        if self.average_loss > 0:
            self.risk_reward_ratio = self.average_win / self.average_loss
        
        # TP/SL
        self.trades_with_tp = trades.exclude(take_profit__isnull=True).count()
        self.trades_with_sl = trades.exclude(stop_loss__isnull=True).count()
        
        # Calcul hits TP/SL (basé sur profit proche du TP ou SL)
        for trade in trades:
            if trade.take_profit and trade.profit > 0:
                # Considérer que TP est hit si profit > 80% du TP calculé
                self.tp_hit_count += 1
            elif trade.stop_loss and trade.profit < 0:
                # Considérer que SL est hit si perte > 80% du SL calculé
                self.sl_hit_count += 1
        
        if self.trades_with_tp > 0:
            self.tp_hit_rate = (self.tp_hit_count / self.trades_with_tp) * 100
        
        # Séries de victoires/défaites
        current_streak = 0
        max_win_streak = 0
        max_loss_streak = 0
        last_type = None
        
        for trade in trades.order_by('open_time'):
            if trade.profit > 0:
                if last_type == 'win':
                    current_streak += 1
                else:
                    current_streak = 1
                    last_type = 'win'
                max_win_streak = max(max_win_streak, current_streak)
            elif trade.profit < 0:
                if last_type == 'loss':
                    current_streak += 1
                else:
                    current_streak = 1
                    last_type = 'loss'
                max_loss_streak = max(max_loss_streak, current_streak)
        
        self.max_consecutive_wins = max_win_streak
        self.max_consecutive_losses = max_loss_streak
        self.current_streak = current_streak
        self.current_streak_type = last_type or ''
        
        # Calcul du ranking score (formule pondérée)
        self.ranking_score = (
            (self.net_profit * 0.4) +
            (self.net_pips * 0.3) +
            (self.win_rate * 10) +
            (self.profit_factor * 50)
        )
        
        # Dates
        first_trade = trades.order_by('open_time').first()
        last_trade = trades.order_by('-open_time').first()
        if first_trade:
            self.first_trade_date = first_trade.open_time
        if last_trade:
            self.last_trade_date = last_trade.close_time or timezone.now()
        
        self.save()
    
    @classmethod
    def update_global_rankings(cls):
        """Met à jour le classement global de tous les traders"""
        performances = cls.objects.all().order_by('-ranking_score')
        for rank, perf in enumerate(performances, start=1):
            perf.global_rank = rank
            perf.save(update_fields=['global_rank'])


class AnalyticsSummary(models.Model):
    """Résumé quotidien des analytics pour optimisation des requêtes"""
    
    date = models.DateField(unique=True, db_index=True)
    
    # Visiteurs
    unique_visitors = models.IntegerField(default=0)
    total_page_views = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    returning_users = models.IntegerField(default=0)
    
    # Sessions
    total_sessions = models.IntegerField(default=0)
    avg_session_duration = models.IntegerField(default=0)
    bounce_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Conversions
    total_conversions = models.IntegerField(default=0)
    conversion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Devices
    desktop_visitors = models.IntegerField(default=0)
    mobile_visitors = models.IntegerField(default=0)
    tablet_visitors = models.IntegerField(default=0)
    
    # Top pages
    top_pages = models.JSONField(default=list)  # [{page, views, unique_visitors}]
    
    # Top countries
    top_countries = models.JSONField(default=list)  # [{country, visitors}]
    
    # Trading stats (pour les élèves)
    active_traders = models.IntegerField(default=0)
    total_trades_executed = models.IntegerField(default=0)
    total_profit_generated = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    avg_win_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'analytics'
        ordering = ['-date']
        verbose_name = "Analytics Summary"
        verbose_name_plural = "Analytics Summaries"
    
    def __str__(self):
        return f"Analytics {self.date}"
    
    @classmethod
    def generate_for_date(cls, target_date=None):
        """Génère le résumé pour une date donnée"""
        if target_date is None:
            target_date = timezone.now().date()
        
        start_datetime = timezone.make_aware(
            timezone.datetime.combine(target_date, timezone.datetime.min.time())
        )
        end_datetime = start_datetime + timedelta(days=1)
        
        # Page views du jour
        page_views = PageView.objects.filter(
            created_at__gte=start_datetime,
            created_at__lt=end_datetime
        )
        
        # Sessions du jour
        sessions = UserSession.objects.filter(
            start_time__gte=start_datetime,
            start_time__lt=end_datetime
        )
        
        # Calcul des métriques
        summary, created = cls.objects.get_or_create(date=target_date)
        
        summary.unique_visitors = page_views.values('session_id').distinct().count()
        summary.total_page_views = page_views.count()
        summary.total_sessions = sessions.count()
        
        # Durée moyenne de session
        avg_duration = sessions.aggregate(Avg('duration'))['duration__avg'] or 0
        summary.avg_session_duration = int(avg_duration)
        
        # Taux de rebond
        bounced = sessions.filter(Q(duration__lt=10) | Q(pages_viewed__lte=1)).count()
        summary.bounce_rate = (bounced / max(1, summary.total_sessions)) * 100
        
        # Conversions
        conversions = sessions.filter(converted=True)
        summary.total_conversions = conversions.count()
        summary.conversion_rate = (summary.total_conversions / max(1, summary.total_sessions)) * 100
        summary.total_revenue = conversions.aggregate(Sum('conversion_value'))['conversion_value__sum'] or 0
        
        # Devices
        summary.desktop_visitors = page_views.filter(device_type='desktop').values('session_id').distinct().count()
        summary.mobile_visitors = page_views.filter(device_type='mobile').values('session_id').distinct().count()
        summary.tablet_visitors = page_views.filter(device_type='tablet').values('session_id').distinct().count()
        
        # Top pages
        top_pages = page_views.values('page_url').annotate(
            views=Count('id'),
            unique_visitors=Count('session_id', distinct=True)
        ).order_by('-views')[:10]
        summary.top_pages = list(top_pages)
        
        # Top countries
        top_countries = page_views.exclude(country='').values('country').annotate(
            visitors=Count('session_id', distinct=True)
        ).order_by('-visitors')[:10]
        summary.top_countries = list(top_countries)
        
        # Trading stats
        from accounts.models import Trade
        trades_today = Trade.objects.filter(
            open_time__gte=start_datetime,
            open_time__lt=end_datetime
        )
        summary.total_trades_executed = trades_today.count()
        summary.active_traders = trades_today.values('account__user').distinct().count()
        
        closed_trades = trades_today.filter(status='closed')
        summary.total_profit_generated = closed_trades.aggregate(Sum('profit'))['profit__sum'] or 0
        
        if closed_trades.exists():
            winning = closed_trades.filter(profit__gt=0).count()
            summary.avg_win_rate = (winning / closed_trades.count()) * 100
        
        summary.save()
        return summary


class UserDemographics(models.Model):
    """Données démographiques optionnelles de l'utilisateur"""
    
    GENDER_CHOICES = [
        ('M', 'Homme'),
        ('F', 'Femme'),
        ('O', 'Autre'),
        ('N', 'Préfère ne pas dire'),
    ]
    
    AGE_RANGE_CHOICES = [
        ('18-24', '18-24 ans'),
        ('25-34', '25-34 ans'),
        ('35-44', '35-44 ans'),
        ('45-54', '45-54 ans'),
        ('55-64', '55-64 ans'),
        ('65+', '65 ans et plus'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='demographics')
    
    # Démographie
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    age_range = models.CharField(max_length=10, choices=AGE_RANGE_CHOICES, blank=True)
    birth_year = models.IntegerField(null=True, blank=True)
    
    # Localisation (rempli automatiquement)
    country = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    
    # Trading experience
    trading_experience = models.CharField(max_length=50, blank=True)  # beginner, intermediate, advanced, expert
    years_trading = models.IntegerField(null=True, blank=True)
    
    # Préférences
    preferred_language = models.CharField(max_length=10, default='fr')
    timezone = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        app_label = 'analytics'
        verbose_name = "User Demographics"
        verbose_name_plural = "User Demographics"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - Demographics"
