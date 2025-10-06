// Configuration centralisée pour les URLs de l'API

// Détermine l'environnement (local ou production)
const isLocal = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Configuration des URLs selon l'environnement
export const API_CONFIG = {
  // URL de base de l'API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (isLocal ? 'http://127.0.0.1:8000' : 'https://calmnesstrading.onrender.com'),
  
  // Configuration pour le développement
  IS_LOCAL: isLocal,
  IS_PRODUCTION: !isLocal,
  
  // URLs spécifiques
  ENDPOINTS: {
    // Authentification
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    TOKEN_REFRESH: '/api/auth/token/refresh/',
    ACTIVATE: '/api/auth/activate/',
    RESEND_ACTIVATION: '/api/auth/resend-activation/',
    
    // Admin
    ADMIN_STATS: '/api/auth/admin/overview/stats/',
    ADMIN_ACTIVITY: '/api/auth/admin/overview/activity/',
    
    // Payments
    PAYMENTS_DASHBOARD: '/api/payments/admin/dashboard/',
    
    // CMS Ancien
    CMS_PAGES_PUBLIC: '/api/content/cms/pages/public/',
    
    // CMS Complet
    COMPREHENSIVE_CMS: {
      // Admin endpoints
      GLOBAL_SETTINGS: '/api/content/comprehensive-cms/global-settings/',
      PAGES: '/api/content/comprehensive-cms/pages/',
      CONTENT_BLOCKS: '/api/content/comprehensive-cms/content-blocks/',
      CONTENT_BLOCKS_UPDATE_CONTENT: '/api/content/comprehensive-cms/content-blocks/',
      TESTIMONIALS: '/api/content/comprehensive-cms/testimonials/',
      FAQ: '/api/content/comprehensive-cms/faq/',
      OFFERS: '/api/content/comprehensive-cms/offers/',
      STATS: '/api/content/comprehensive-cms/stats/',
      PENDING_CHANGES_APPLY: '/api/content/comprehensive-cms/pending-changes/apply/',
      
      // Public endpoints
      GLOBAL_SETTINGS_PUBLIC: '/api/content/comprehensive-cms/public/global-settings/',
      PAGES_PUBLIC: '/api/content/comprehensive-cms/public/pages/',
      PAGES_PUBLIC_CONTENT_BLOCKS: '/api/content/comprehensive-cms/public/pages/',
      TESTIMONIALS_PUBLIC: '/api/content/comprehensive-cms/public/testimonials/',
      FAQ_PUBLIC: '/api/content/comprehensive-cms/public/faq/',
      OFFERS_PUBLIC: '/api/content/comprehensive-cms/public/offers/',
      CONTACT_FIELDS: '/api/content/comprehensive-cms/pages/contact/fields/',
      CONTACT_FIELDS_PUBLIC: '/api/content/comprehensive-cms/public/contact/fields/',
      CONTACT_FIELDS_ADMIN_PUBLIC: '/api/content/comprehensive-cms/admin/contact/fields/',
      CLEAR_CONTACT_CACHE: '/api/content/comprehensive-cms/admin/clear-contact-cache/',
      
      // Reviews
      REVIEWS: '/api/content/comprehensive-cms/reviews/create/',
      REVIEWS_PUBLIC: '/api/content/comprehensive-cms/reviews/public/',
      SERVICES_FOR_REVIEWS: '/api/content/comprehensive-cms/services-for-reviews/',
    },
    
    // Traductions
    TRANSLATIONS: {
      GENERATE: '/api/content/cms/translations/generate/',
      SECTION: (id: number) => `/api/content/cms/translations/section/${id}/`,
      UPDATE: (id: number) => `/api/content/cms/translations/${id}/`,
      REGENERATE: (id: number) => `/api/content/cms/translations/${id}/regenerate/`,
      STATS: '/api/content/cms/translations/stats/',
    }
  }
};

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export des URLs complètes pour faciliter l'utilisation
export const API_URLS = {
  // Authentification
  LOGIN: buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  REGISTER: buildApiUrl(API_CONFIG.ENDPOINTS.REGISTER),
  TOKEN_REFRESH: buildApiUrl(API_CONFIG.ENDPOINTS.TOKEN_REFRESH),
  ACTIVATE: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVATE),
  RESEND_ACTIVATION: buildApiUrl(API_CONFIG.ENDPOINTS.RESEND_ACTIVATION),
  
  // Admin
  ADMIN_STATS: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_STATS),
  ADMIN_ACTIVITY: buildApiUrl(API_CONFIG.ENDPOINTS.ADMIN_ACTIVITY),
  
  // Payments
  PAYMENTS_DASHBOARD: buildApiUrl(API_CONFIG.ENDPOINTS.PAYMENTS_DASHBOARD),
  
  // CMS Complet - Admin
  CMS_GLOBAL_SETTINGS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.GLOBAL_SETTINGS),
  CMS_PAGES: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.PAGES),
  CMS_CONTENT_BLOCKS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.CONTENT_BLOCKS),
  CMS_CONTENT_BLOCKS_UPDATE_CONTENT: (blockId: number) => buildApiUrl(`${API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.CONTENT_BLOCKS_UPDATE_CONTENT}${blockId}/update-content/`),
  CMS_TESTIMONIALS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.TESTIMONIALS),
  CMS_FAQ: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.FAQ),
  CMS_OFFERS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.OFFERS),
  CMS_STATS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.STATS),
  CMS_PENDING_CHANGES_APPLY: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.PENDING_CHANGES_APPLY),
  
  // CMS Complet - Public
  GLOBAL_SETTINGS_PUBLIC: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.GLOBAL_SETTINGS_PUBLIC),
  PAGE_PUBLIC: (slug: string) => buildApiUrl(`${API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.PAGES_PUBLIC}${slug}/`),
  PAGE_PUBLIC_CONTENT_BLOCKS: (slug: string) => buildApiUrl(`${API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.PAGES_PUBLIC}${slug}/content-blocks/`),
  TESTIMONIALS_PUBLIC: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.TESTIMONIALS_PUBLIC),
  FAQ_PUBLIC: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.FAQ_PUBLIC),
  OFFERS_PUBLIC: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.OFFERS_PUBLIC),
  CONTACT_FIELDS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.CONTACT_FIELDS),
  CONTACT_FIELDS_PUBLIC: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.CONTACT_FIELDS_PUBLIC),
  CONTACT_FIELDS_ADMIN_PUBLIC: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.CONTACT_FIELDS_ADMIN_PUBLIC),
  CLEAR_CONTACT_CACHE: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.CLEAR_CONTACT_CACHE),
  
  // Reviews
  REVIEWS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.REVIEWS),
  REVIEWS_PUBLIC: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.REVIEWS_PUBLIC),
  SERVICES_FOR_REVIEWS: buildApiUrl(API_CONFIG.ENDPOINTS.COMPREHENSIVE_CMS.SERVICES_FOR_REVIEWS),
  
  // Traductions
  TRANSLATIONS_GENERATE: buildApiUrl(API_CONFIG.ENDPOINTS.TRANSLATIONS.GENERATE),
  TRANSLATIONS_SECTION: (id: number) => buildApiUrl(API_CONFIG.ENDPOINTS.TRANSLATIONS.SECTION(id)),
  TRANSLATIONS_UPDATE: (id: number) => buildApiUrl(API_CONFIG.ENDPOINTS.TRANSLATIONS.UPDATE(id)),
  TRANSLATIONS_REGENERATE: (id: number) => buildApiUrl(API_CONFIG.ENDPOINTS.TRANSLATIONS.REGENERATE(id)),
  TRANSLATIONS_STATS: buildApiUrl(API_CONFIG.ENDPOINTS.TRANSLATIONS.STATS),
};

// Export de la configuration pour debug
export const getApiConfig = () => ({
  baseUrl: API_CONFIG.BASE_URL,
  isLocal,
  environment: import.meta.env.MODE,
});
