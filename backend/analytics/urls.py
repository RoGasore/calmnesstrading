from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Analytics overview
    path('api/analytics/overview/', views.analytics_overview, name='analytics_overview'),
    
    # Traffic
    path('api/analytics/traffic/', views.traffic_sources, name='traffic_sources'),
    
    # Pages
    path('api/analytics/pages/', views.page_performance, name='page_performance'),
    
    # Trading analytics
    path('api/analytics/trading/overview/', views.trading_performance_overview, name='trading_overview'),
    path('api/analytics/trading/rankings/', views.top_traders_ranking, name='top_traders'),
    path('api/analytics/trading/details/', views.trading_details_analysis, name='trading_details'),
    
    # Demographics
    path('api/analytics/demographics/', views.demographic_analytics, name='demographics'),
    
    # Conversions
    path('api/analytics/conversions/funnel/', views.conversion_funnel, name='conversion_funnel'),
]
