"""
Vues API pour le système d'analytics avancé
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Avg, Count, Q, F, Max, Min
from django.utils import timezone
from django.contrib.auth import get_user_model
from datetime import timedelta, datetime
import json

from .models import PageView, UserSession, TradingPerformance, AnalyticsSummary, UserDemographics
from accounts.models import Trade, TradingAccount

User = get_user_model()


def get_date_range(period):
    """Calcule la plage de dates selon la période sélectionnée"""
    end_date = timezone.now()
    
    if period == 'today':
        start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == '7days':
        start_date = end_date - timedelta(days=7)
    elif period == '30days':
        start_date = end_date - timedelta(days=30)
    elif period == '90days':
        start_date = end_date - timedelta(days=90)
    elif period == 'year':
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=7)
    
    return start_date, end_date


@api_view(['GET'])
@permission_classes([IsAdminUser])
def analytics_overview(request):
    """Vue d'ensemble complète des analytics"""
    period = request.GET.get('period', '7days')
    start_date, end_date = get_date_range(period)
    
    # Page Views
    page_views = PageView.objects.filter(created_at__gte=start_date, created_at__lte=end_date)
    prev_start = start_date - (end_date - start_date)
    prev_page_views = PageView.objects.filter(created_at__gte=prev_start, created_at__lt=start_date)
    
    # Sessions
    sessions = UserSession.objects.filter(start_time__gte=start_date, start_time__lte=end_date)
    prev_sessions = UserSession.objects.filter(start_time__gte=prev_start, start_time__lt=start_date)
    
    # Métriques de base
    total_visitors = page_views.values('session_id').distinct().count()
    prev_visitors = prev_page_views.values('session_id').distinct().count()
    visitor_growth = ((total_visitors - prev_visitors) / max(1, prev_visitors)) * 100 if prev_visitors else 0
    
    total_page_views = page_views.count()
    prev_total_views = prev_page_views.count()
    views_growth = ((total_page_views - prev_total_views) / max(1, prev_total_views)) * 100 if prev_total_views else 0
    
    # Calcul taux de rebond
    bounced_sessions = sessions.filter(Q(duration__lt=10) | Q(pages_viewed__lte=1)).count()
    total_sessions = sessions.count()
    bounce_rate = (bounced_sessions / max(1, total_sessions)) * 100
    
    prev_bounced = prev_sessions.filter(Q(duration__lt=10) | Q(pages_viewed__lte=1)).count()
    prev_total = prev_sessions.count()
    prev_bounce_rate = (prev_bounced / max(1, prev_total)) * 100
    bounce_rate_change = bounce_rate - prev_bounce_rate
    
    # Durée moyenne
    avg_duration = sessions.aggregate(Avg('duration'))['duration__avg'] or 0
    prev_avg_duration = prev_sessions.aggregate(Avg('duration'))['duration__avg'] or 0
    duration_growth = ((avg_duration - prev_avg_duration) / max(1, prev_avg_duration)) * 100 if prev_avg_duration else 0
    
    # Nouveaux vs fidèles
    new_users = sessions.filter(user__isnull=True).values('session_id').distinct().count()
    returning_users = sessions.filter(user__isnull=False).values('session_id').distinct().count()
    
    # Conversions
    conversions = sessions.filter(converted=True)
    conversion_rate = (conversions.count() / max(1, total_sessions)) * 100
    total_revenue = conversions.aggregate(Sum('conversion_value'))['conversion_value__sum'] or 0
    
    prev_conversions = prev_sessions.filter(converted=True)
    prev_conversion_rate = (prev_conversions.count() / max(1, prev_total)) * 100
    conversion_growth = conversion_rate - prev_conversion_rate
    
    data = {
        'period': period,
        'start_date': start_date.isoformat(),
        'end_date': end_date.isoformat(),
        'metrics': {
            'visitors': {
                'value': total_visitors,
                'growth': round(visitor_growth, 1)
            },
            'page_views': {
                'value': total_page_views,
                'growth': round(views_growth, 1)
            },
            'bounce_rate': {
                'value': round(bounce_rate, 1),
                'growth': round(bounce_rate_change, 1)
            },
            'avg_duration': {
                'value': int(avg_duration),
                'growth': round(duration_growth, 1)
            },
            'new_users': {
                'value': new_users
            },
            'returning_users': {
                'value': returning_users
            },
            'conversion_rate': {
                'value': round(conversion_rate, 2),
                'growth': round(conversion_growth, 2)
            },
            'revenue': {
                'value': float(total_revenue)
            }
        }
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def traffic_sources(request):
    """Analyse des sources de trafic"""
    period = request.GET.get('period', '7days')
    start_date, end_date = get_date_range(period)
    
    sessions = UserSession.objects.filter(start_time__gte=start_date, start_time__lte=end_date)
    
    # Par source UTM
    sources = sessions.exclude(utm_source='').values('utm_source').annotate(
        visits=Count('id'),
        conversions=Count('id', filter=Q(converted=True))
    ).order_by('-visits')
    
    # Calculer le taux de conversion pour chaque source
    for source in sources:
        source['conversion_rate'] = (source['conversions'] / max(1, source['visits'])) * 100
    
    # Par appareil
    devices = PageView.objects.filter(created_at__gte=start_date, created_at__lte=end_date).values('device_type').annotate(
        count=Count('session_id', distinct=True)
    )
    
    total_device_visits = sum(d['count'] for d in devices)
    for device in devices:
        device['percentage'] = (device['count'] / max(1, total_device_visits)) * 100
    
    # Par pays
    countries = PageView.objects.filter(
        created_at__gte=start_date, created_at__lte=end_date
    ).exclude(country='').values('country').annotate(
        visitors=Count('session_id', distinct=True)
    ).order_by('-visitors')[:10]
    
    total_visitors = sum(c['visitors'] for c in countries)
    for country in countries:
        country['percentage'] = (country['visitors'] / max(1, total_visitors)) * 100
    
    data = {
        'utm_sources': list(sources),
        'devices': list(devices),
        'countries': list(countries)
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def page_performance(request):
    """Performance des pages populaires"""
    period = request.GET.get('period', '7days')
    start_date, end_date = get_date_range(period)
    
    page_views = PageView.objects.filter(created_at__gte=start_date, created_at__lte=end_date)
    
    # Pages populaires avec métriques
    pages = page_views.values('page_url').annotate(
        views=Count('id'),
        unique_visitors=Count('session_id', distinct=True),
        avg_time=Avg('time_on_page')
    ).order_by('-views')[:20]
    
    # Calcul du taux de rebond par page
    for page in pages:
        page_url = page['page_url']
        # Sessions qui ont commencé sur cette page
        first_views = page_views.filter(page_url=page_url).values_list('session_id', flat=True)
        sessions_started = UserSession.objects.filter(session_id__in=first_views)
        bounced = sessions_started.filter(Q(duration__lt=10) | Q(pages_viewed__lte=1)).count()
        total = sessions_started.count()
        page['bounce_rate'] = (bounced / max(1, total)) * 100
        page['avg_time'] = int(page['avg_time'] or 0)
    
    return Response(list(pages))


@api_view(['GET'])
@permission_classes([IsAdminUser])
def trading_performance_overview(request):
    """Vue d'ensemble des performances de trading de tous les élèves"""
    period = request.GET.get('period', '7days')
    start_date, end_date = get_date_range(period)
    
    # Tous les trades de la période
    trades = Trade.objects.filter(
        open_time__gte=start_date,
        open_time__lte=end_date
    )
    
    # Statistiques globales
    total_trades = trades.count()
    closed_trades = trades.filter(status='closed')
    winning_trades = closed_trades.filter(profit__gt=0).count()
    losing_trades = closed_trades.filter(profit__lt=0).count()
    
    total_profit = closed_trades.filter(profit__gt=0).aggregate(Sum('profit'))['profit__sum'] or 0
    total_loss = abs(closed_trades.filter(profit__lt=0).aggregate(Sum('profit'))['profit__sum'] or 0)
    net_profit = total_profit - total_loss
    
    total_pips_won = closed_trades.filter(profit__gt=0).aggregate(Sum('pips'))['pips__sum'] or 0
    total_pips_lost = abs(closed_trades.filter(profit__lt=0).aggregate(Sum('pips'))['pips__sum'] or 0)
    net_pips = total_pips_won - total_pips_lost
    
    win_rate = (winning_trades / max(1, closed_trades.count())) * 100 if closed_trades.count() > 0 else 0
    profit_factor = (total_profit / max(1, total_loss)) if total_loss > 0 else total_profit
    
    # Trades avec TP/SL
    trades_with_tp = trades.exclude(take_profit__isnull=True).count()
    trades_with_sl = trades.exclude(stop_loss__isnull=True).count()
    
    # Traders actifs
    active_traders = trades.values('account__user').distinct().count()
    
    data = {
        'period': period,
        'global_stats': {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': round(win_rate, 2),
            'total_profit': float(total_profit),
            'total_loss': float(total_loss),
            'net_profit': float(net_profit),
            'total_pips_won': float(total_pips_won),
            'total_pips_lost': float(total_pips_lost),
            'net_pips': float(net_pips),
            'profit_factor': round(float(profit_factor), 2),
            'trades_with_tp': trades_with_tp,
            'trades_with_sl': trades_with_sl,
            'active_traders': active_traders
        }
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def top_traders_ranking(request):
    """Classement des meilleurs traders/élèves"""
    limit = int(request.GET.get('limit', 10))
    
    # Mettre à jour toutes les performances
    for user in User.objects.filter(is_active=True):
        perf, created = TradingPerformance.objects.get_or_create(user=user)
        if created or perf.last_updated < timezone.now() - timedelta(hours=1):
            perf.calculate_all_metrics()
    
    # Mettre à jour le classement global
    TradingPerformance.update_global_rankings()
    
    # Top performers
    top_performers = TradingPerformance.objects.select_related('user').filter(
        total_trades__gte=5  # Au moins 5 trades pour être classé
    ).order_by('-ranking_score')[:limit]
    
    rankings = []
    for perf in top_performers:
        rankings.append({
            'rank': perf.global_rank,
            'user': {
                'id': perf.user.id,
                'name': perf.user.get_full_name(),
                'username': perf.user.username
            },
            'stats': {
                'total_trades': perf.total_trades,
                'win_rate': float(perf.win_rate),
                'profit_factor': float(perf.profit_factor),
                'net_profit': float(perf.net_profit),
                'net_pips': float(perf.net_pips),
                'max_consecutive_wins': perf.max_consecutive_wins,
                'ranking_score': float(perf.ranking_score)
            }
        })
    
    return Response(rankings)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def trading_details_analysis(request):
    """Analyse détaillée des patterns de trading"""
    period = request.GET.get('period', '7days')
    start_date, end_date = get_date_range(period)
    
    trades = Trade.objects.filter(
        open_time__gte=start_date,
        open_time__lte=end_date,
        status='closed'
    )
    
    # Analyse par paire de devises
    symbol_analysis = trades.values('symbol').annotate(
        count=Count('id'),
        winning=Count('id', filter=Q(profit__gt=0)),
        losing=Count('id', filter=Q(profit__lt=0)),
        total_profit=Sum('profit'),
        total_pips=Sum('pips')
    ).order_by('-count')[:10]
    
    for symbol in symbol_analysis:
        symbol['win_rate'] = (symbol['winning'] / max(1, symbol['count'])) * 100
    
    # Analyse par type (BUY vs SELL)
    type_analysis = trades.values('type').annotate(
        count=Count('id'),
        winning=Count('id', filter=Q(profit__gt=0)),
        total_profit=Sum('profit')
    )
    
    for t in type_analysis:
        t['win_rate'] = (t['winning'] / max(1, t['count'])) * 100
    
    # Distribution des gains/pertes
    profit_ranges = [
        {'range': '0-100', 'min': 0, 'max': 100},
        {'range': '100-500', 'min': 100, 'max': 500},
        {'range': '500-1000', 'min': 500, 'max': 1000},
        {'range': '1000+', 'min': 1000, 'max': float('inf')}
    ]
    
    for r in profit_ranges:
        r['count'] = trades.filter(profit__gte=r['min'], profit__lt=r['max']).count()
    
    # Analyse horaire (meilleurs moments pour trader)
    hourly_analysis = []
    for hour in range(24):
        hour_trades = trades.filter(open_time__hour=hour)
        if hour_trades.exists():
            winning = hour_trades.filter(profit__gt=0).count()
            hourly_analysis.append({
                'hour': hour,
                'trades': hour_trades.count(),
                'win_rate': (winning / hour_trades.count()) * 100,
                'avg_profit': hour_trades.aggregate(Avg('profit'))['profit__avg']
            })
    
    data = {
        'symbol_analysis': list(symbol_analysis),
        'type_analysis': list(type_analysis),
        'profit_distribution': profit_ranges,
        'hourly_analysis': hourly_analysis
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def demographic_analytics(request):
    """Analyse démographique des utilisateurs"""
    
    demographics = UserDemographics.objects.select_related('user')
    
    # Par genre
    gender_stats = demographics.exclude(gender='').values('gender').annotate(count=Count('id'))
    
    # Par tranche d'âge
    age_stats = demographics.exclude(age_range='').values('age_range').annotate(count=Count('id'))
    
    # Par pays
    country_stats = demographics.exclude(country='').values('country').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Par niveau d'expérience
    experience_stats = demographics.exclude(trading_experience='').values('trading_experience').annotate(
        count=Count('id')
    )
    
    # Corrélation performance / démographie
    # Top performers par genre
    top_by_gender = []
    for gender_choice in UserDemographics.GENDER_CHOICES:
        gender_code = gender_choice[0]
        users = User.objects.filter(demographics__gender=gender_code)
        if users.exists():
            avg_perf = TradingPerformance.objects.filter(user__in=users).aggregate(
                avg_win_rate=Avg('win_rate'),
                avg_profit=Avg('net_profit'),
                avg_pips=Avg('net_pips')
            )
            top_by_gender.append({
                'gender': gender_choice[1],
                'user_count': users.count(),
                'avg_win_rate': round(avg_perf['avg_win_rate'] or 0, 2),
                'avg_profit': float(avg_perf['avg_profit'] or 0),
                'avg_pips': float(avg_perf['avg_pips'] or 0)
            })
    
    # Top performers par âge
    top_by_age = []
    for age_choice in UserDemographics.AGE_RANGE_CHOICES:
        age_range = age_choice[0]
        users = User.objects.filter(demographics__age_range=age_range)
        if users.exists():
            avg_perf = TradingPerformance.objects.filter(user__in=users).aggregate(
                avg_win_rate=Avg('win_rate'),
                avg_profit=Avg('net_profit')
            )
            top_by_age.append({
                'age_range': age_choice[1],
                'user_count': users.count(),
                'avg_win_rate': round(avg_perf['avg_win_rate'] or 0, 2),
                'avg_profit': float(avg_perf['avg_profit'] or 0)
            })
    
    data = {
        'gender_distribution': list(gender_stats),
        'age_distribution': list(age_stats),
        'country_distribution': list(country_stats),
        'experience_distribution': list(experience_stats),
        'performance_by_gender': top_by_gender,
        'performance_by_age': top_by_age
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def conversion_funnel(request):
    """Analyse de l'entonnoir de conversion"""
    period = request.GET.get('period', '7days')
    start_date, end_date = get_date_range(period)
    
    # Étapes de l'entonnoir
    total_visitors = PageView.objects.filter(
        created_at__gte=start_date, created_at__lte=end_date
    ).values('session_id').distinct().count()
    
    services_views = PageView.objects.filter(
        created_at__gte=start_date,
        created_at__lte=end_date,
        page_url__icontains='/services'
    ).values('session_id').distinct().count()
    
    pricing_views = PageView.objects.filter(
        created_at__gte=start_date,
        created_at__lte=end_date,
        page_url__icontains='/tarifs'
    ).values('session_id').distinct().count()
    
    signups = User.objects.filter(date_joined__gte=start_date, date_joined__lte=end_date).count()
    
    conversions = UserSession.objects.filter(
        start_time__gte=start_date,
        start_time__lte=end_date,
        converted=True,
        conversion_type='purchase'
    ).count()
    
    funnel = [
        {
            'step': 'Visiteurs du site',
            'count': total_visitors,
            'percentage': 100,
            'color': 'bg-blue-500'
        },
        {
            'step': 'Pages de services consultées',
            'count': services_views,
            'percentage': (services_views / max(1, total_visitors)) * 100,
            'color': 'bg-blue-400'
        },
        {
            'step': 'Pages de tarifs consultées',
            'count': pricing_views,
            'percentage': (pricing_views / max(1, total_visitors)) * 100,
            'color': 'bg-blue-300'
        },
        {
            'step': 'Inscription créée',
            'count': signups,
            'percentage': (signups / max(1, total_visitors)) * 100,
            'color': 'bg-green-500'
        },
        {
            'step': 'Paiement effectué',
            'count': conversions,
            'percentage': (conversions / max(1, total_visitors)) * 100,
            'color': 'bg-green-600'
        }
    ]
    
    return Response(funnel)
