from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
import os
import secrets
from .serializers import RegisterSerializer, UserSerializer, AdminUserSerializer
from .models import UserProfile, EmailVerificationToken

User = get_user_model()


# Create your views here.


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        
        # Retourner une réponse JSON
        return Response({
            'detail': 'Utilisateur créé avec succès. Vérifiez votre email pour activer votre compte.',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        user = serializer.save()
        print(f"Utilisateur créé: {user.email}")
        
        # Récupérer le token de vérification créé dans le serializer
        verification_token = EmailVerificationToken.objects.filter(user=user, is_used=False).first()
        print(f"Token de vérification trouvé: {verification_token is not None}")
        
        if verification_token:
            # Build activation link
            frontend_base = settings.FRONTEND_BASE_URL.rstrip('/')
            confirm_url_from_client = self.request.data.get('confirm_url')
            if confirm_url_from_client:
                activation_link = f"{confirm_url_from_client}?token={verification_token.token}"
            else:
                activation_link = f"{frontend_base}/verify-email?token={verification_token.token}"

            site_name = os.getenv('SITE_NAME', 'CALMNESS FI')
            brand_color = os.getenv('BRAND_COLOR', '#F5B301')
            logo_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/logo.png"

            subject = f"{site_name} • Confirmez votre e-mail"

            text_message = (
                f"Bonjour {user.first_name or user.username},\n\n"
                "Merci pour votre inscription. Veuillez confirmer votre adresse e-mail avec le lien ci-dessous :\n"
                f"{activation_link}\n\n"
                f"— L'équipe {site_name}"
            )

            html_message = f"""
<!doctype html>
<html lang=\"fr\">
  <head>
    <meta charset=\"utf-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
    <title>{site_name} - Confirmation d'email</title>
  </head>
  <body style=\"margin:0;padding:0;background:#0b0e14;color:#111;font-family:Inter,Arial,sans-serif;\">
    <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background:#0b0e14;padding:32px 0;\">
      <tr>
        <td align=\"center\">
          <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"600\" style=\"background:#ffffff;border-radius:12px;overflow:hidden;\">
            <tr>
              <td style=\"padding:24px 24px 0 24px; text-align:center; background:#111;\">
                <img src=\"{logo_url}\" alt=\"{site_name}\" height=\"48\" style=\"display:inline-block;\" />
              </td>
            </tr>
            <tr>
              <td style=\"padding:24px 24px 8px 24px; text-align:center; background:#111;\">
                <h1 style=\"margin:0;color:#fff;font-size:22px;font-weight:700;\">Confirmez votre adresse e-mail</h1>
              </td>
            </tr>
            <tr>
              <td style=\"padding:24px;\">
                <p style=\"margin:0 0 12px 0;color:#111;\">Bonjour {user.first_name or user.username},</p>
                <p style=\"margin:0 0 16px 0;color:#4b5563;\">Merci pour votre inscription à <strong>{site_name}</strong>. Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
                <p style=\"text-align:center;margin:28px 0;\">
                  <a href=\"{activation_link}\" style=\"display:inline-block;background:{brand_color};color:#111;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;\">Activer mon compte</a>
                </p>
                <p style=\"margin:0 0 8px 0;color:#6b7280;font-size:12px;\">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
                <p style=\"word-break:break-all;color:#2563eb;font-size:12px;\">{activation_link}</p>
                <hr style=\"border:none;border-top:1px solid #e5e7eb;margin:24px 0;\" />
                <p style=\"margin:0;color:#9ca3af;font-size:12px;\">Cet e-mail vous a été envoyé par {site_name}. Si vous n'êtes pas à l'origine de cette action, ignorez ce message.</p>
              </td>
            </tr>
            <tr>
              <td style=\"padding:16px 24px;background:#f9fafb;text-align:center;color:#6b7280;font-size:12px;\">© {site_name}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
            """

            try:
                print(f"Tentative d'envoi d'email à {user.email}")
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                )
                email.attach_alternative(html_message, "text/html")
                email.send(fail_silently=False)
                print(f"SUCCESS: Email d'activation envoyé à {user.email}")
            except Exception as e:
                print(f"ERREUR lors de l'envoi de l'email d'activation: {e}")
                print(f"Type d'erreur: {type(e).__name__}")
                # En cas d'erreur d'email, on peut soit lever une exception soit continuer
                # Pour l'instant, on continue pour ne pas bloquer l'inscription
                pass
        else:
            print("ERREUR: Aucun token de vérification trouvé")

        return user


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# Vue pour l'activation d'email
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def activate_email(request):
    token = request.query_params.get('token')
    if not token:
        return Response({'detail': 'Token manquant'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        verification_token = EmailVerificationToken.objects.get(token=token, is_used=False)
        
        if verification_token.is_expired():
            return Response({'detail': 'Lien expiré'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Activer l'utilisateur
        user = verification_token.user
        user.is_active = True
        user.is_verified = True
        user.save()
        
        # Marquer le token comme utilisé
        verification_token.is_used = True
        verification_token.save()
        
        return Response({
            'detail': 'Compte activé avec succès',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        })
        
    except EmailVerificationToken.DoesNotExist:
        return Response({'detail': 'Lien invalide'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_activation_email(request):
    """Renvoyer l'email d'activation pour un utilisateur"""
    email = request.data.get('email')
    if not email:
        return Response({'detail': 'Email manquant'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validation de l'email
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    try:
        validate_email(email)
    except ValidationError:
        return Response({'detail': 'Format d\'email invalide'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Vérifier si l'utilisateur est déjà activé
        if user.is_active and user.is_verified:
            return Response({'detail': 'Compte déjà activé'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Limitation de taux : maximum 3 tentatives par heure
        from django.core.cache import cache
        cache_key = f"resend_activation_{email}"
        attempts = cache.get(cache_key, 0)
        
        if attempts >= 3:
            return Response({'detail': 'Trop de tentatives. Veuillez attendre avant de réessayer.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Incrémenter le compteur
        cache.set(cache_key, attempts + 1, 3600)  # 1 heure
        
        # Supprimer les anciens tokens non utilisés
        EmailVerificationToken.objects.filter(user=user, is_used=False).delete()
        
        # Créer un nouveau token
        verification_token = EmailVerificationToken.objects.create(user=user)
        
        # Construire le lien d'activation
        frontend_base = settings.FRONTEND_BASE_URL.rstrip('/')
        activation_link = f"{frontend_base}/verify-email?token={verification_token.token}"
        
        # Envoyer l'email
        site_name = os.getenv('SITE_NAME', 'CALMNESS FI')
        brand_color = os.getenv('BRAND_COLOR', '#F5B301')
        logo_url = f"{settings.FRONTEND_BASE_URL.rstrip('/')}/logo.png"
        
        subject = f"{site_name} • Confirmez votre e-mail"
        
        text_message = (
            f"Bonjour {user.first_name or user.username},\n\n"
            f"Merci pour votre inscription à {site_name}. Cliquez sur le lien ci-dessous pour activer votre compte.\n\n"
            f"Lien d'activation: {activation_link}\n\n"
            f"Cet e-mail vous a été envoyé par {site_name}. Si vous n'êtes pas à l'origine de cette action, ignorez ce message.\n"
        )
        
        html_message = f"""
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{site_name} • Confirmation d'e-mail</title>
            <style>
                body {{ margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                .header {{ background-color: #f9fafb; padding: 40px 0; text-align: center; border-bottom: 1px solid #e5e7eb; }}
                .content {{ padding: 24px; }}
                .button {{ display: inline-block; background-color: {brand_color}; color: #111; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; }}
                .footer {{ background-color: #f9fafb; padding: 16px 24px; text-align: center; color: #6b7280; font-size: 12px; }}
            </style>
        </head>
        <body>
            <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
                <tr>
                    <td align="center" style="padding:0;">
                        <table role="presentation" style="width:600px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
                            <tr>
                                <td align="center" style="padding:40px 0 30px 0;background:#f9fafb;">
                                    <img src="{logo_url}" alt="" width="120" style="height:auto;display:block;" />
                                    <h1 style="margin:0;font-size:24px;line-height:32px;font-family:Arial,sans-serif;color:#111;">{site_name}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:24px;">
                                    <p style="margin:0 0 12px 0;color:#111;">Bonjour {user.first_name or user.username},</p>
                                    <p style="margin:0 0 16px 0;color:#4b5563;">Merci pour votre inscription à <strong>{site_name}</strong>. Cliquez sur le bouton ci-dessous pour activer votre compte.</p>
                                    <p style="text-align:center;margin:28px 0;">
                                        <a href="{activation_link}" style="display:inline-block;background:{brand_color};color:#111;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;">Activer mon compte</a>
                                    </p>
                                    <p style="margin:0 0 8px 0;color:#6b7280;font-size:12px;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
                                    <p style="word-break:break-all;color:#2563eb;font-size:12px;">{activation_link}</p>
                                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
                                    <p style="margin:0;color:#9ca3af;font-size:12px;">Cet e-mail vous a été envoyé par {site_name}. Si vous n'êtes pas à l'origine de cette action, ignorez ce message.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:16px 24px;background:#f9fafb;text-align:center;color:#6b7280;font-size:12px;">© {site_name}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        try:
            email_obj = EmailMultiAlternatives(
                subject=subject,
                body=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            email_obj.attach_alternative(html_message, "text/html")
            email_obj.send(fail_silently=False)
            print(f"Email d'activation renvoyé à {user.email}")
            
            return Response({
                'detail': 'Email d\'activation renvoyé avec succès',
                'email': user.email
            })
            
        except Exception as e:
            print(f"Erreur lors du renvoi de l'email d'activation: {e}")
            return Response({'detail': 'Erreur lors de l\'envoi de l\'email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except User.DoesNotExist:
        return Response({'detail': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)


# Vue pour la connexion par email
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_with_email(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'detail': 'Email et mot de passe requis'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authentifier l'utilisateur par email
    user = authenticate(request, username=email, password=password)
    
    if user is None:
        return Response(
            {'detail': 'Email ou mot de passe incorrect'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {'detail': 'Compte non activé. Vérifiez votre email.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_verified:
        return Response(
            {'detail': 'Email non vérifié. Vérifiez votre email.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Générer les tokens JWT
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data
    })


# Vues pour la gestion admin
class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        
        # Filtres
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(username__icontains=search)
            )
        
        status_filter = self.request.query_params.get('status')
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'inactive':
            queryset = queryset.filter(is_active=False)
        elif status_filter == 'verified':
            queryset = queryset.filter(is_verified=True)
        elif status_filter == 'unverified':
            queryset = queryset.filter(is_verified=False)
        
        return queryset


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()
    
    def perform_update(self, serializer):
        user = serializer.save()
        
        # Si l'utilisateur est désactivé, invalider ses tokens
        if not user.is_active:
            from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
            OutstandingToken.objects.filter(user=user).delete()
    
    def perform_destroy(self, instance):
        # Supprimer l'utilisateur directement
        instance.delete()


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_activate_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = True
        user.is_verified = True
        user.save()
        
        return Response({
            'detail': f'Utilisateur {user.email} activé avec succès'
        })
    except User.DoesNotExist:
        return Response(
            {'detail': 'Utilisateur introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def admin_deactivate_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        
        # Invalider les tokens de l'utilisateur
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
        OutstandingToken.objects.filter(user=user).delete()
        
        return Response({
            'detail': f'Utilisateur {user.email} désactivé avec succès'
        })
    except User.DoesNotExist:
        return Response(
            {'detail': 'Utilisateur introuvable'}, 
            status=status.HTTP_404_NOT_FOUND
        )


# Vue d'ensemble - Statistiques
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_overview_stats(request):
    """
    Retourne les statistiques générales pour la vue d'ensemble admin
    """
    if not request.user.is_staff:
        return Response(
            {'detail': 'Accès refusé'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.db.models import Count, Q
    from django.utils import timezone
    from datetime import timedelta
    
    # Statistiques des utilisateurs
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    verified_users = User.objects.filter(is_verified=True).count()
    new_users_today = User.objects.filter(
        date_joined__date=timezone.now().date()
    ).count()
    new_users_this_week = User.objects.filter(
        date_joined__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Statistiques de connexion
    users_with_login = User.objects.filter(last_login__isnull=False).count()
    recent_logins = User.objects.filter(
        last_login__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    # Statistiques par statut
    inactive_users = User.objects.filter(is_active=False).count()
    unverified_users = User.objects.filter(is_verified=False).count()
    
    return Response({
        'users': {
            'total': total_users,
            'active': active_users,
            'verified': verified_users,
            'inactive': inactive_users,
            'unverified': unverified_users,
            'new_today': new_users_today,
            'new_this_week': new_users_this_week,
            'with_login': users_with_login,
            'recent_logins': recent_logins
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recent_activity(request):
    """
    Retourne les activités récentes pour la vue d'ensemble admin
    """
    if not request.user.is_staff:
        return Response(
            {'detail': 'Accès refusé'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from django.utils import timezone
    from datetime import timedelta
    
    # Utilisateurs récemment inscrits
    recent_users = User.objects.filter(
        date_joined__gte=timezone.now() - timedelta(days=7)
    ).order_by('-date_joined')[:5]
    
    # Utilisateurs avec connexions récentes
    recent_logins = User.objects.filter(
        last_login__gte=timezone.now() - timedelta(days=7)
    ).order_by('-last_login')[:5]
    
    # Activités récentes
    activities = []
    
    # Ajouter les inscriptions récentes
    for user in recent_users:
        activities.append({
            'type': 'user_registered',
            'message': f'Nouvel utilisateur inscrit: {user.full_name}',
            'user': user.full_name,
            'email': user.email,
            'timestamp': user.date_joined,
            'icon': 'user-plus'
        })
    
    # Ajouter les connexions récentes
    for user in recent_logins:
        if user.last_login:
            activities.append({
                'type': 'user_login',
                'message': f'Connexion de {user.full_name}',
                'user': user.full_name,
                'email': user.email,
                'timestamp': user.last_login,
                'icon': 'log-in'
            })
    
    # Ajouter les activités de paiements
    try:
        from payments.models import PendingPayment, Payment
        
        # Paiements en attente récents
        recent_pending = PendingPayment.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).order_by('-created_at')[:5]
        
        for payment in recent_pending:
            activities.append({
                'type': 'payment_pending',
                'message': f'Nouveau paiement en attente: {payment.offer.name}',
                'user': payment.user.full_name,
                'email': payment.user.email,
                'timestamp': payment.created_at,
                'icon': 'credit-card'
            })
        
        # Paiements validés récents
        recent_completed = Payment.objects.filter(
            paid_at__gte=timezone.now() - timedelta(days=7)
        ).order_by('-paid_at')[:5]
        
        for payment in recent_completed:
            activities.append({
                'type': 'payment_received',
                'message': f'Paiement validé: {payment.offer.name}',
                'user': payment.user.full_name,
                'email': payment.user.email,
                'timestamp': payment.paid_at,
                'icon': 'check-circle'
            })
            
    except ImportError:
        # Si l'app payments n'est pas disponible
        pass
    
    # Trier par timestamp décroissant
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return Response({
        'activities': activities[:10],  # Limiter à 10 activités
        'recent_users': [
            {
                'id': user.id,
                'name': user.full_name,
                'email': user.email,
                'date_joined': user.date_joined,
                'is_verified': user.is_verified,
                'is_active': user.is_active
            }
            for user in recent_users
        ]
    })
