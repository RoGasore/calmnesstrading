"""
Middleware pour tracker automatiquement toutes les visites et générer les analytics
"""
import uuid
from django.utils.deprecation import MiddlewareMixin
from django.contrib.gis.geoip2 import GeoIP2
from user_agents import parse
import requests
from .models import PageView, UserSession


class AnalyticsTrackingMiddleware(MiddlewareMixin):
    """
    Middleware qui enregistre automatiquement chaque page vue
    et gère les sessions utilisateur pour les analytics
    """
    
    def process_request(self, request):
        # Ne pas tracker les requêtes admin et API
        if request.path.startswith('/admin') or request.path.startswith('/static'):
            return None
        
        # Générer ou récupérer session ID
        if 'analytics_session_id' not in request.session:
            request.session['analytics_session_id'] = str(uuid.uuid4())
            request.session.modified = True
        
        session_id = request.session['analytics_session_id']
        
        # Récupérer l'IP du client
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0].strip()
        else:
            ip_address = request.META.get('REMOTE_ADDR', '')
        
        # Parser le user agent
        user_agent_string = request.META.get('HTTP_USER_AGENT', '')
        user_agent = parse(user_agent_string)
        
        # Déterminer le type d'appareil
        if user_agent.is_mobile:
            device_type = 'mobile'
        elif user_agent.is_tablet:
            device_type = 'tablet'
        else:
            device_type = 'desktop'
        
        # Créer la page view
        try:
            page_view = PageView.objects.create(
                user=request.user if request.user.is_authenticated else None,
                session_id=session_id,
                ip_address=ip_address,
                page_url=request.path,
                referrer=request.META.get('HTTP_REFERER', ''),
                user_agent=user_agent_string,
                device_type=device_type,
                browser=user_agent.browser.family,
                browser_version=user_agent.browser.version_string,
                os=user_agent.os.family,
                os_version=user_agent.os.version_string
            )
            
            # Géolocalisation asynchrone (pour ne pas ralentir la requête)
            # Dans un vrai projet, utiliser Celery pour ceci
            try:
                self.get_geolocation(page_view, ip_address)
            except:
                pass
            
            # Gérer la session
            self.update_session(session_id, request.user, device_type)
            
        except Exception as e:
            # Ne pas bloquer la requête si le tracking échoue
            print(f"Analytics tracking error: {e}")
        
        return None
    
    def get_geolocation(self, page_view, ip_address):
        """
        Récupère la géolocalisation via l'API ipapi.co
        Gratuit jusqu'à 30,000 requêtes/mois
        """
        if ip_address in ['127.0.0.1', 'localhost', '::1']:
            # IP locale, ignorer
            return
        
        try:
            response = requests.get(
                f'https://ipapi.co/{ip_address}/json/',
                timeout=2
            )
            if response.status_code == 200:
                data = response.json()
                page_view.country = data.get('country_name', '')
                page_view.country_code = data.get('country_code', '')
                page_view.region = data.get('region', '')
                page_view.city = data.get('city', '')
                page_view.latitude = data.get('latitude')
                page_view.longitude = data.get('longitude')
                page_view.timezone_name = data.get('timezone', '')
                page_view.save(update_fields=[
                    'country', 'country_code', 'region', 'city',
                    'latitude', 'longitude', 'timezone_name'
                ])
        except Exception as e:
            print(f"Geolocation error: {e}")
    
    def update_session(self, session_id, user, device_type):
        """Met à jour ou crée la session utilisateur"""
        from django.utils import timezone
        
        session, created = UserSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                'user': user if user.is_authenticated else None,
                'device_type': device_type,
                'pages_viewed': 1,
                'status': 'active'
            }
        )
        
        if not created:
            # Mettre à jour une session existante
            session.pages_viewed += 1
            if session.pages_viewed > 1:
                session.status = 'active'  # Plus un rebond
            session.save(update_fields=['pages_viewed', 'status'])
