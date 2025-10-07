from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Formation, UserFormationEnrollment, FormationSession


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_formations_list(request):
    """
    Récupérer toutes les formations de l'utilisateur
    """
    user = request.user
    enrollments = UserFormationEnrollment.objects.filter(
        user=user
    ).select_related('formation').order_by('-enrolled_at')
    
    formations_data = []
    for enrollment in enrollments:
        formation = enrollment.formation
        
        # Calculer le temps restant
        days_until_end = enrollment.days_until_end()
        days_until_start = enrollment.days_until_start()
        
        formations_data.append({
            'id': enrollment.id,
            'name': formation.name,
            'description': formation.description,
            'level': formation.level,
            'platform': formation.platform,
            'meeting_link': formation.meeting_link if enrollment.status == 'active' else None,
            'meeting_id': formation.meeting_id if enrollment.status == 'active' else None,
            'meeting_password': formation.meeting_password if enrollment.status == 'active' else None,
            'instructor': formation.instructor_name,
            'schedule': formation.schedule_description,
            'start_date': enrollment.start_date,
            'end_date': enrollment.end_date,
            'status': enrollment.status,
            'next_session': enrollment.next_session_date,
            'total_sessions': enrollment.total_sessions,
            'attended_sessions': enrollment.attended_sessions,
            'attendance_rate': enrollment.attendance_rate(),
            'days_until_start': days_until_start,
            'days_until_end': days_until_end,
            'enrolled_at': enrollment.enrolled_at,
        })
    
    # Statistiques
    stats = {
        'total': enrollments.count(),
        'active': enrollments.filter(status='active').count(),
        'completed': enrollments.filter(status='completed').count(),
        'upcoming': enrollments.filter(status='upcoming').count(),
    }
    
    return Response({
        'formations': formations_data,
        'stats': stats
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def formation_sessions(request, enrollment_id):
    """
    Récupérer toutes les sessions d'une formation
    """
    try:
        enrollment = UserFormationEnrollment.objects.get(
            id=enrollment_id,
            user=request.user
        )
    except UserFormationEnrollment.DoesNotExist:
        return Response(
            {'error': 'Inscription non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    sessions = FormationSession.objects.filter(
        formation=enrollment.formation
    ).order_by('scheduled_date')
    
    sessions_data = []
    for session in sessions:
        sessions_data.append({
            'id': session.id,
            'session_number': session.session_number,
            'title': session.title,
            'description': session.description,
            'scheduled_date': session.scheduled_date,
            'duration_minutes': session.duration_minutes,
            'meeting_link': session.meeting_link or enrollment.formation.meeting_link,
            'recording_link': session.recording_link,
            'status': session.status,
            'user_attended': session.user_attended,
            'is_upcoming': session.is_upcoming(),
            'is_past': session.is_past(),
        })
    
    return Response({
        'sessions': sessions_data,
        'total': sessions.count(),
        'enrollment': {
            'id': enrollment.id,
            'status': enrollment.status,
            'attended': enrollment.attended_sessions,
            'total': enrollment.total_sessions,
            'attendance_rate': enrollment.attendance_rate()
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_session_attended(request, session_id):
    """
    Marquer une session comme suivie
    """
    try:
        session = FormationSession.objects.get(id=session_id)
        enrollment = UserFormationEnrollment.objects.get(
            user=request.user,
            formation=session.formation
        )
        
        # Marquer la session comme suivie
        if not session.user_attended:
            session.user_attended = True
            session.save(update_fields=['user_attended'])
            
            # Mettre à jour le compteur
            enrollment.attended_sessions += 1
            enrollment.save(update_fields=['attended_sessions'])
        
        return Response({'success': True})
        
    except (FormationSession.DoesNotExist, UserFormationEnrollment.DoesNotExist):
        return Response(
            {'error': 'Session non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def next_formations_sessions(request):
    """
    Récupérer les prochaines sessions de toutes les formations actives
    """
    user = request.user
    now = timezone.now()
    
    # Récupérer les formations actives
    active_enrollments = UserFormationEnrollment.objects.filter(
        user=user,
        status='active'
    ).select_related('formation')
    
    next_sessions = []
    for enrollment in active_enrollments:
        if enrollment.next_session_date and enrollment.next_session_date > now:
            next_sessions.append({
                'formation_name': enrollment.formation.name,
                'formation_id': enrollment.id,
                'next_session': enrollment.next_session_date,
                'meeting_link': enrollment.formation.meeting_link,
                'platform': enrollment.formation.platform,
                'instructor': enrollment.formation.instructor_name,
            })
    
    # Trier par date
    next_sessions.sort(key=lambda x: x['next_session'])
    
    return Response({
        'next_sessions': next_sessions,
        'total': len(next_sessions)
    })

