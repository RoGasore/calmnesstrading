import requests
import json
import logging
from typing import Dict, Optional, List
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

class DeepLTranslationService:
    """Service de traduction automatique avec DeepL API"""
    
    def __init__(self):
        self.api_key = settings.DEEPL_API_KEY
        self.api_url = settings.DEEPL_API_URL
        self.supported_languages = settings.SUPPORTED_LANGUAGES
        
    def translate_text(self, text: str, target_language: str = 'en', source_language: str = 'fr') -> Optional[str]:
        """
        Traduire un texte en utilisant l'API DeepL
        
        Args:
            text: Texte à traduire
            target_language: Langue cible (en, fr, es)
            source_language: Langue source (fr, en, es)
            
        Returns:
            Texte traduit ou None en cas d'erreur
        """
        if not self.api_key:
            logger.warning("Clé API DeepL non configurée")
            return None
            
        if not text or not text.strip():
            return text
            
        try:
            # Convertir les codes de langue pour DeepL
            source_lang = self.supported_languages.get(source_language, 'FR')
            target_lang = self.supported_languages.get(target_language, 'EN-US')
            
            # Préparer la requête
            url = self.api_url
            
            data = {
                'auth_key': self.api_key,
                'text': text,
                'target_lang': target_lang,
                'source_lang': source_lang,
                'preserve_formatting': '1'
            }
            
            response = requests.post(url, data=data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            if 'translations' in result and len(result['translations']) > 0:
                translated_text = result['translations'][0]['text']
                logger.info(f"Traduction DeepL réussie: '{text[:50]}...' -> '{translated_text[:50]}...'")
                return translated_text
            else:
                logger.error(f"Format de réponse DeepL inattendu: {result}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur de requête DeepL: {e}")
            return None
        except Exception as e:
            logger.error(f"Erreur inattendue lors de la traduction DeepL: {e}")
            return None
    
    def translate_content_section(self, content: str, section_key: str, target_language: str = 'en', source_language: str = 'fr') -> Optional[str]:
        """
        Traduire le contenu d'une section avec gestion spéciale selon le type
        
        Args:
            content: Contenu à traduire
            section_key: Clé de la section (pour adapter la traduction)
            target_language: Langue cible
            source_language: Langue source
            
        Returns:
            Contenu traduit
        """
        if not content:
            return content
            
        # Traductions spéciales pour certaines sections
        special_translations = {
            'hero_title': {
                'fr': 'Maîtrisez le Trading avec Calmness Trading',
                'en': 'Master Trading with Calmness Trading',
                'es': 'Domina el Trading con Calmness Trading'
            },
            'hero_subtitle': {
                'fr': 'Développez vos compétences en trading avec nos formations expertes, signaux professionnels et services de gestion de comptes. Rejoignez des milliers de traders qui font confiance à notre expertise.',
                'en': 'Develop your trading skills with our expert training, professional signals and account management services. Join thousands of traders who trust our expertise.',
                'es': 'Desarrolla tus habilidades de trading con nuestra formación experta, señales profesionales y servicios de gestión de cuentas. Únete a miles de traders que confían en nuestra experiencia.'
            },
            'services_title': {
                'fr': 'Nos Services d\'Excellence',
                'en': 'Our Excellence Services',
                'es': 'Nuestros Servicios de Excelencia'
            },
            'services_subtitle': {
                'fr': 'Découvrez notre gamme complète de services conçus pour votre réussite en trading, du débutant à l\'expert.',
                'en': 'Discover our complete range of services designed for your trading success, from beginner to expert.',
                'es': 'Descubre nuestra gama completa de servicios diseñados para tu éxito en trading, desde principiante hasta experto.'
            }
        }
        
        # Vérifier s'il y a une traduction spéciale
        if section_key in special_translations and target_language in special_translations[section_key]:
            return special_translations[section_key][target_language]
        
        # Sinon, utiliser la traduction automatique DeepL
        return self.translate_text(content, target_language, source_language)
    
    def translate_all_languages(self, content: str, source_language: str = 'fr') -> Dict[str, str]:
        """
        Traduire un contenu dans toutes les langues supportées
        
        Args:
            content: Contenu à traduire
            source_language: Langue source
            
        Returns:
            Dictionnaire avec les traductions {langue: traduction}
        """
        translations = {}
        
        for lang_code in self.supported_languages.keys():
            if lang_code != source_language:
                translated = self.translate_text(content, lang_code, source_language)
                if translated:
                    translations[lang_code] = translated
                    
        return translations
    
    def get_available_languages(self) -> Dict[str, str]:
        """Retourner les langues disponibles"""
        return {
            'fr': 'Français',
            'en': 'English',
            'es': 'Español'
        }
    
    def is_api_configured(self) -> bool:
        """Vérifier si l'API DeepL est configurée"""
        return bool(self.api_key and self.api_key.strip())

# Instance globale du service
deepl_service = DeepLTranslationService()
