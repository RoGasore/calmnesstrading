from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from django.db import transaction
from django.core.paginator import Paginator
from django.db.models import Q, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import json

from .models import Formation, UserFormationEnrollment
from .models_formations_admin import (
    FormationSchedule, AdminFormationSession, AdminSessionNotification, AdminSessionAttendance
)
from accounts.models import User

def is_admin(user):
    """Vérifie si l'utilisateur est admin"""
    return user.is_staff and user.is_active

@login_required
@user_passes_test(is_admin)
def admin_formations_dashboard(request):
    """Dashboard admin pour les formations"""
    # Statistiques générales
    total_formations = Formation.objects.count()
    active_formations = Formation.objects.filter(is_active=True).count()
    total_sessions = AdminFormationSession.objects.count()
    upcoming_sessions = AdminFormationSession.objects.filter(
        scheduled_date__gt=timezone.now(),
        status='scheduled'
    ).count()
    
    # Sessions à venir (prochaines 7 jours)
    next_week = timezone.now() + timedelta(days=7)
    upcoming_sessions_list = AdminFormationSession.objects.filter(
        scheduled_date__range=[timezone.now(), next_week],
        status='scheduled'
    ).select_related('formation', 'instructor').order_by('scheduled_date')[:10]
    
    # Sessions en cours
    ongoing_sessions = AdminFormationSession.objects.filter(
        status='ongoing'
    ).select_related('formation', 'instructor')
    
    # Notifications à envoyer
    pending_notifications = AdminSessionNotification.objects.filter(
        is_active=True,
        is_sent=False,
        session__scheduled_date__gt=timezone.now()
    ).select_related('session', 'session__formation')
    
    context = {
        'total_formations': total_formations,
        'active_formations': active_formations,
        'total_sessions': total_sessions,
        'upcoming_sessions': upcoming_sessions,
        'upcoming_sessions_list': upcoming_sessions_list,
        'ongoing_sessions': ongoing_sessions,
        'pending_notifications': pending_notifications,
    }
    return render(request, 'admin/formations_dashboard.html', context)

@login_required
@user_passes_test(is_admin)
def admin_formations_list(request):
    """Liste des formations pour l'admin"""
    formations = Formation.objects.all().annotate(
        sessions_count=Count('sessions'),
        enrollments_count=Count('enrollments')
    )
    
    # Filtres
    search = request.GET.get('search')
    if search:
        formations = formations.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search)
        )
    
    status_filter = request.GET.get('status')
    if status_filter == 'active':
        formations = formations.filter(is_active=True)
    elif status_filter == 'inactive':
        formations = formations.filter(is_active=False)
    
    # Pagination
    paginator = Paginator(formations, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search': search,
        'status_filter': status_filter,
    }
    return render(request, 'admin/formations_list.html', context)

@login_required
@user_passes_test(is_admin)
def admin_formation_detail(request, formation_id):
    """Détail d'une formation pour l'admin"""
    formation = get_object_or_404(Formation, id=formation_id)
    
    # Sessions de la formation
    sessions = formation.admin_sessions.all().order_by('scheduled_date')
    
    # Programmations
    schedules = formation.schedules.filter(is_active=True)
    
    # Inscriptions
    enrollments = formation.enrollments.all().select_related('user')
    
    # Statistiques
    total_enrollments = enrollments.count()
    active_enrollments = enrollments.filter(status='active').count()
    completed_sessions = sessions.filter(status='completed').count()
    upcoming_sessions = sessions.filter(
        scheduled_date__gt=timezone.now(),
        status='scheduled'
    ).count()
    
    context = {
        'formation': formation,
        'sessions': sessions,
        'schedules': schedules,
        'enrollments': enrollments,
        'total_enrollments': total_enrollments,
        'active_enrollments': active_enrollments,
        'completed_sessions': completed_sessions,
        'upcoming_sessions': upcoming_sessions,
    }
    return render(request, 'admin/formation_detail.html', context)

@login_required
@user_passes_test(is_admin)
def admin_sessions_list(request):
    """Liste des sessions pour l'admin"""
    sessions = AdminFormationSession.objects.select_related(
        'formation', 'instructor'
    ).order_by('scheduled_date')
    
    # Filtres
    search = request.GET.get('search')
    if search:
        sessions = sessions.filter(
            Q(title__icontains=search) |
            Q(formation__name__icontains=search) |
            Q(instructor__first_name__icontains=search) |
            Q(instructor__last_name__icontains=search)
        )
    
    status_filter = request.GET.get('status')
    if status_filter:
        sessions = sessions.filter(status=status_filter)
    
    formation_filter = request.GET.get('formation')
    if formation_filter:
        sessions = sessions.filter(formation_id=formation_filter)
    
    # Pagination
    paginator = Paginator(sessions, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    # Options pour les filtres
    formations = Formation.objects.filter(is_active=True)
    
    context = {
        'page_obj': page_obj,
        'search': search,
        'status_filter': status_filter,
        'formation_filter': formation_filter,
        'formations': formations,
        'status_choices': AdminFormationSession.SESSION_STATUS_CHOICES,
    }
    return render(request, 'admin/sessions_list.html', context)

@login_required
@user_passes_test(is_admin)
def admin_session_detail(request, session_id):
    """Détail d'une session pour l'admin"""
    session = get_object_or_404(AdminFormationSession, id=session_id)
    
    # Présences
    attendances = session.attendances.all().select_related('user')
    
    # Notifications
    notifications = session.notifications.all()
    
    # Statistiques de présence
    total_enrolled = session.formation.enrollments.filter(status='active').count()
    present_count = attendances.filter(status='present').count()
    absent_count = attendances.filter(status='absent').count()
    late_count = attendances.filter(status='late').count()
    
    context = {
        'session': session,
        'attendances': attendances,
        'notifications': notifications,
        'total_enrolled': total_enrolled,
        'present_count': present_count,
        'absent_count': absent_count,
        'late_count': late_count,
    }
    return render(request, 'admin/session_detail.html', context)

@login_required
@user_passes_test(is_admin)
def admin_create_session(request):
    """Créer une nouvelle session"""
    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Récupérer les données du formulaire
                formation_id = request.POST.get('formation_id')
                title = request.POST.get('title')
                description = request.POST.get('description')
                scheduled_date = request.POST.get('scheduled_date')
                platform = request.POST.get('platform')
                meeting_link = request.POST.get('meeting_link')
                instructor_id = request.POST.get('instructor_id')
                
                # Validation
                if not all([formation_id, title, scheduled_date]):
                    messages.error(request, "Tous les champs obligatoires doivent être remplis.")
                    return redirect('admin_sessions_list')
                
                # Créer la session
                session = AdminFormationSession.objects.create(
                    formation_id=formation_id,
                    title=title,
                    description=description,
                    scheduled_date=datetime.fromisoformat(scheduled_date),
                    platform=platform,
                    meeting_link=meeting_link,
                    instructor_id=instructor_id if instructor_id else None,
                    created_by=request.user
                )
                
                # Créer les notifications par défaut
                create_default_notifications(session)
                
                messages.success(request, f"Session '{title}' créée avec succès.")
                return redirect('admin_session_detail', session_id=session.id)
                
        except Exception as e:
            messages.error(request, f"Erreur lors de la création de la session: {str(e)}")
            return redirect('admin_sessions_list')
    
    # GET - Afficher le formulaire
    formations = Formation.objects.filter(is_active=True)
    instructors = User.objects.filter(is_staff=True, is_active=True)
    
    context = {
        'formations': formations,
        'instructors': instructors,
        'platform_choices': FormationSchedule.PLATFORM_CHOICES,
    }
    return render(request, 'admin/create_session.html', context)

@login_required
@user_passes_test(is_admin)
def admin_create_schedule(request):
    """Créer une programmation récurrente"""
    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Récupérer les données du formulaire
                formation_id = request.POST.get('formation_id')
                day_of_week = request.POST.get('day_of_week')
                start_time = request.POST.get('start_time')
                end_time = request.POST.get('end_time')
                platform = request.POST.get('platform')
                meeting_link = request.POST.get('meeting_link')
                instructor_id = request.POST.get('instructor_id')
                
                # Validation
                if not all([formation_id, day_of_week, start_time, end_time]):
                    messages.error(request, "Tous les champs obligatoires doivent être remplis.")
                    return redirect('admin_formations_list')
                
                # Créer la programmation
                schedule = FormationSchedule.objects.create(
                    formation_id=formation_id,
                    day_of_week=int(day_of_week),
                    start_time=start_time,
                    end_time=end_time,
                    platform=platform,
                    meeting_link=meeting_link,
                    instructor_id=instructor_id if instructor_id else None,
                    created_by=request.user
                )
                
                # Générer les sessions pour les prochaines semaines
                generate_sessions_from_schedule(schedule, weeks=8)
                
                messages.success(request, "Programmation créée avec succès.")
                return redirect('admin_formation_detail', formation_id=formation_id)
                
        except Exception as e:
            messages.error(request, f"Erreur lors de la création de la programmation: {str(e)}")
            return redirect('admin_formations_list')
    
    # GET - Afficher le formulaire
    formations = Formation.objects.filter(is_active=True)
    instructors = User.objects.filter(is_staff=True, is_active=True)
    
    context = {
        'formations': formations,
        'instructors': instructors,
        'platform_choices': FormationSchedule.PLATFORM_CHOICES,
        'days_choices': FormationSchedule.DAYS_OF_WEEK,
    }
    return render(request, 'admin/create_schedule.html', context)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_session(request, session_id):
    """Démarrer une session (API)"""
    if not request.user.is_staff:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        session = FormationSession.objects.get(id=session_id)
        session.start_session()
        
        return Response({
            'success': True,
            'message': 'Session démarrée avec succès',
            'session': {
                'id': session.id,
                'status': session.status,
                'start_time': session.actual_start_time.isoformat() if session.actual_start_time else None
            }
        })
    except FormationSession.DoesNotExist:
        return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_session(request, session_id):
    """Terminer une session (API)"""
    if not request.user.is_staff:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        session = FormationSession.objects.get(id=session_id)
        session.end_session()
        
        return Response({
            'success': True,
            'message': 'Session terminée avec succès',
            'session': {
                'id': session.id,
                'status': session.status,
                'end_time': session.actual_end_time.isoformat() if session.actual_end_time else None
            }
        })
    except FormationSession.DoesNotExist:
        return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request, session_id):
    """Marquer la présence d'un utilisateur (API)"""
    if not request.user.is_staff:
        return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        session = FormationSession.objects.get(id=session_id)
        user_id = request.data.get('user_id')
        status = request.data.get('status', 'present')
        notes = request.data.get('notes', '')
        
        if not user_id:
            return Response({'error': 'ID utilisateur requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        attendance, created = AdminSessionAttendance.objects.get_or_create(
            session=session,
            user_id=user_id,
            defaults={
                'status': status,
                'notes': notes,
                'joined_at': timezone.now() if status == 'present' else None
            }
        )
        
        if not created:
            attendance.status = status
            attendance.notes = notes
            if status == 'present' and not attendance.joined_at:
                attendance.joined_at = timezone.now()
            attendance.save()
        
        return Response({
            'success': True,
            'message': 'Présence mise à jour avec succès',
            'attendance': {
                'id': attendance.id,
                'user': attendance.user.get_full_name(),
                'status': attendance.status,
                'joined_at': attendance.joined_at.isoformat() if attendance.joined_at else None
            }
        })
    except FormationSession.DoesNotExist:
        return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

def create_default_notifications(session):
    """Crée les notifications par défaut pour une session"""
    default_notifications = [
        {
            'type': 'session_reminder',
            'before_minutes': 60,  # 1 heure avant
            'subject': 'Rappel: Session de formation dans 1 heure',
            'message': 'Bonjour {user_name},\n\nLa session "{session_title}" commence dans 1 heure.\n\nDate: {session_date}\nLien: {meeting_link}\n\nÀ bientôt !',
            'channels': ['email', 'telegram']
        },
        {
            'type': 'session_reminder',
            'before_minutes': 15,  # 15 minutes avant
            'subject': 'Session de formation dans 15 minutes',
            'message': 'Bonjour {user_name},\n\nLa session "{session_title}" commence dans 15 minutes.\n\nLien: {meeting_link}',
            'channels': ['telegram', 'discord']
        },
        {
            'type': 'session_starting',
            'before_minutes': 0,  # Au moment de commencer
            'subject': 'Session de formation en cours',
            'message': 'Bonjour {user_name},\n\nLa session "{session_title}" a commencé.\n\nRejoignez-nous: {meeting_link}',
            'channels': ['telegram', 'discord']
        }
    ]
    
    for notif_data in default_notifications:
        AdminSessionNotification.objects.create(
            session=session,
            notification_type=notif_data['type'],
            send_before_minutes=notif_data['before_minutes'],
            subject=notif_data['subject'],
            message_template=notif_data['message'],
            channels=notif_data['channels'],
            created_by=session.created_by
        )

def generate_sessions_from_schedule(schedule, weeks=8):
    """Génère les sessions à partir d'une programmation"""
    from datetime import datetime, timedelta
    
    # Calculer la date de début (prochaine occurrence du jour)
    today = timezone.now().date()
    days_ahead = schedule.day_of_week - today.weekday()
    if days_ahead <= 0:  # Si c'est déjà passé cette semaine
        days_ahead += 7
    
    start_date = today + timedelta(days=days_ahead)
    
    # Générer les sessions pour les prochaines semaines
    for week in range(weeks):
        session_date = start_date + timedelta(weeks=week)
        session_datetime = timezone.make_aware(
            datetime.combine(session_date, schedule.start_time)
        )
        
        # Vérifier si la session n'existe pas déjà
        if not AdminFormationSession.objects.filter(
            formation=schedule.formation,
            scheduled_date=session_datetime
        ).exists():
            
            session = AdminFormationSession.objects.create(
                formation=schedule.formation,
                schedule=schedule,
                scheduled_date=session_datetime,
                title=f"{schedule.formation.name} - Session {week + 1}",
                description=f"Session programmée selon la programmation {schedule.get_day_of_week_display()}",
                platform=schedule.platform,
                meeting_link=schedule.meeting_link,
                meeting_id=schedule.meeting_id,
                meeting_password=schedule.meeting_password,
                instructor=schedule.instructor,
                created_by=schedule.created_by
            )
            
            # Créer les notifications par défaut
            create_default_notifications(session)
