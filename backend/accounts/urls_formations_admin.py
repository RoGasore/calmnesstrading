from django.urls import path
from . import views_formations_admin

urlpatterns = [
    # Dashboard formations
    path('admin/formations/dashboard/', views_formations_admin.admin_formations_dashboard, name='admin_formations_dashboard'),
    
    # Gestion des formations
    path('admin/formations/', views_formations_admin.admin_formations_list, name='admin_formations_list'),
    path('admin/formations/<int:formation_id>/', views_formations_admin.admin_formation_detail, name='admin_formation_detail'),
    
    # Gestion des sessions
    path('admin/sessions/', views_formations_admin.admin_sessions_list, name='admin_sessions_list'),
    path('admin/sessions/<int:session_id>/', views_formations_admin.admin_session_detail, name='admin_session_detail'),
    path('admin/sessions/create/', views_formations_admin.admin_create_session, name='admin_create_session'),
    
    # Gestion des programmations
    path('admin/schedules/create/', views_formations_admin.admin_create_schedule, name='admin_create_schedule'),
    
    # API pour les sessions
    path('api/sessions/<int:session_id>/start/', views_formations_admin.start_session, name='start_session'),
    path('api/sessions/<int:session_id>/end/', views_formations_admin.end_session, name='end_session'),
    path('api/sessions/<int:session_id>/attendance/', views_formations_admin.mark_attendance, name='mark_attendance'),
]
