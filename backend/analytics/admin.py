from django.contrib import admin
from .models import PageView, UserSession, TradingPerformance, AnalyticsSummary, UserDemographics


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ['page_url', 'user', 'country', 'device_type', 'created_at']
    list_filter = ['device_type', 'country', 'created_at']
    search_fields = ['page_url', 'user__email', 'ip_address']
    date_hierarchy = 'created_at'
    
    readonly_fields = ['id', 'created_at']


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'start_time', 'duration', 'pages_viewed', 'status', 'converted']
    list_filter = ['status', 'converted', 'device_type', 'start_time']
    search_fields = ['session_id', 'user__email']
    date_hierarchy = 'start_time'
    
    readonly_fields = ['session_id', 'start_time']


@admin.register(TradingPerformance)
class TradingPerformanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'global_rank', 'total_trades', 'win_rate', 'profit_factor', 'net_profit', 'net_pips']
    list_filter = ['last_updated']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    ordering = ['global_rank']
    
    readonly_fields = ['last_updated', 'first_trade_date', 'last_trade_date']
    
    fieldsets = (
        ('Utilisateur', {
            'fields': ('user', 'global_rank', 'ranking_score')
        }),
        ('Statistiques de base', {
            'fields': ('total_trades', 'winning_trades', 'losing_trades', 'breakeven_trades')
        }),
        ('Profits/Pertes', {
            'fields': ('total_profit', 'total_loss', 'net_profit')
        }),
        ('Pips', {
            'fields': ('total_pips_won', 'total_pips_lost', 'net_pips')
        }),
        ('Ratios', {
            'fields': ('win_rate', 'profit_factor', 'average_win', 'average_loss', 'risk_reward_ratio')
        }),
        ('Take Profit / Stop Loss', {
            'fields': ('trades_with_tp', 'trades_with_sl', 'tp_hit_count', 'sl_hit_count', 'tp_hit_rate')
        }),
        ('Séries', {
            'fields': ('max_consecutive_wins', 'max_consecutive_losses', 'current_streak', 'current_streak_type')
        }),
        ('Dates', {
            'fields': ('first_trade_date', 'last_trade_date', 'last_updated')
        }),
    )


@admin.register(AnalyticsSummary)
class AnalyticsSummaryAdmin(admin.ModelAdmin):
    list_display = ['date', 'unique_visitors', 'total_page_views', 'bounce_rate', 'conversion_rate', 'total_revenue']
    list_filter = ['date']
    date_hierarchy = 'date'
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserDemographics)
class UserDemographicsAdmin(admin.ModelAdmin):
    list_display = ['user', 'gender', 'age_range', 'country', 'trading_experience']
    list_filter = ['gender', 'age_range', 'country', 'trading_experience']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    
    readonly_fields = ['created_at', 'updated_at']
