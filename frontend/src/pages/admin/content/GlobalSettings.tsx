import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/config/api';
import { Save, Loader2 } from 'lucide-react';

interface GlobalSettings {
  id?: number;
  site_name: string;
  site_tagline: string;
  site_description: string;
  email_contact: string;
  phone_contact: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  contact_title: string;
  business_hours: string;
  telegram_support: string;
  support_description: string;
  telegram_url: string;
  discord_url: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_url: string;
  social_networks: Record<string, string>;
  copyright_text: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: number;
}

const GlobalSettings: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    site_name: 'CALMNESS FI',
    site_tagline: '',
    site_description: '',
    email_contact: '',
    phone_contact: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    contact_title: 'Plusieurs façons de nous joindre',
    business_hours: '',
    telegram_support: '',
    support_description: '24/7 Support',
    telegram_url: '',
    discord_url: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    social_networks: {},
    copyright_text: '© 2024 CALMNESS FI. Tous droits réservés.'
  });
  
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(globalSettings);
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());
  const [originalContent, setOriginalContent] = useState<Record<string, string>>({});

  // Charger les paramètres globaux
  useEffect(() => {
    loadGlobalSettings();
  }, []);

  const loadGlobalSettings = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(API_URLS.CMS_GLOBAL_SETTINGS);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
        setLocalSettings(data);
        
        // Initialiser le contenu original pour détecter les modifications
        const original: Record<string, string> = {};
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'string') {
            original[key] = data[key];
          }
        });
        setOriginalContent(original);
        setModifiedFields(new Set()); // Réinitialiser les modifications
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres globaux:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveField = async (fieldKey: string) => {
    if (!localSettings[fieldKey as keyof GlobalSettings] || localSettings[fieldKey as keyof GlobalSettings] === originalContent[fieldKey]) {
      return;
    }

    try {
      setSavingFields(prev => new Set(prev).add(fieldKey));
      
      const response = await fetchWithAuth(API_URLS.CMS_GLOBAL_SETTINGS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...globalSettings,
          [fieldKey]: localSettings[fieldKey as keyof GlobalSettings]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur lors de la sauvegarde du champ ${fieldKey}:`, errorText);
        throw new Error(`Erreur lors de la sauvegarde: ${errorText}`);
      }

      const data = await response.json();
      setGlobalSettings(data);
      setLocalSettings(data);

      // Mettre à jour le contenu original pour ce champ
      setOriginalContent(prev => ({
        ...prev,
        [fieldKey]: localSettings[fieldKey as keyof GlobalSettings] as string
      }));

      // Retirer ce champ de la liste des modifications
      setModifiedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldKey);
        return newSet;
      });

      // Trouver le nom du champ pour le message
      const fieldName = getFieldName(fieldKey);
      toast({
        title: "Succès",
        description: `${fieldName} sauvegardé avec succès`,
      });
      
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du champ ${fieldKey}:`, error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : `Impossible de sauvegarder ${fieldKey}`,
        variant: "destructive"
      });
    } finally {
      setSavingFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(fieldKey);
        return newSet;
      });
    }
  };

  // Fonction pour obtenir le nom du champ à partir de la clé
  const getFieldName = (fieldKey: string): string => {
    const fieldNames: Record<string, string> = {
      site_name: 'Nom du site',
      site_tagline: 'Slogan',
      site_description: 'Description du site',
      email_contact: 'Email de contact',
      phone_contact: 'Téléphone de contact',
      contact_email: 'Email de contact',
      contact_phone: 'Téléphone de contact',
      address: 'Adresse',
      contact_title: 'Titre de la section contact',
      business_hours: 'Horaires d\'ouverture',
      telegram_support: 'Support Telegram',
      support_description: 'Description du support',
      telegram_url: 'URL Telegram',
      discord_url: 'URL Discord',
      facebook_url: 'URL Facebook',
      twitter_url: 'URL Twitter',
      linkedin_url: 'URL LinkedIn',
      copyright_text: 'Texte de copyright'
    };
    return fieldNames[fieldKey] || fieldKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleInputChange = (field: keyof GlobalSettings, value: string) => {
    setLocalSettings({...localSettings, [field]: value});
    
    // Marquer le champ comme modifié si la valeur a changé
    if (value !== originalContent[field]) {
      setModifiedFields(prev => new Set(prev).add(field));
    } else {
      setModifiedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header avec navigation */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <SidebarTrigger className="lg:hidden" />
            <div className="h-6 w-px bg-border hidden lg:block" />
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Paramètres Globaux
            </h1>
          </div>
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-muted-foreground text-sm sm:text-base">
                Configurez tous les paramètres généraux du site - Sauvegardez chaque champ individuellement
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">

          {/* Informations Générales */}
          <Card className="bg-gradient-to-br from-card to-accent/5 border-primary/10 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Informations Générales
                  </CardTitle>
                </div>
                <Button 
                  onClick={() => {
                    // Sauvegarder tous les champs modifiés de cette section
                    const generalFields = ['site_name', 'site_tagline', 'site_description', 'copyright_text'];
                    generalFields.forEach(field => {
                      if (modifiedFields.has(field)) {
                        saveField(field);
                      }
                    });
                  }}
                  disabled={savingFields.size > 0}
                  size="sm"
                  className={`min-w-[100px] text-xs sm:text-sm ${
                    ['site_name', 'site_tagline', 'site_description', 'copyright_text'].some(field => modifiedFields.has(field))
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-400 hover:bg-gray-500 text-white'
                  }`}
                >
                  {savingFields.size > 0 ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="site_name" className="text-foreground font-medium text-sm sm:text-base">Nom du site</Label>
                    {modifiedFields.has('site_name') && (
                      <Button
                        onClick={() => saveField('site_name')}
                        disabled={savingFields.has('site_name')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('site_name') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="site_name"
                    value={localSettings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="site_tagline" className="text-foreground font-medium text-sm sm:text-base">Slogan</Label>
                    {modifiedFields.has('site_tagline') && (
                      <Button
                        onClick={() => saveField('site_tagline')}
                        disabled={savingFields.has('site_tagline')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('site_tagline') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="site_tagline"
                    value={localSettings.site_tagline}
                    onChange={(e) => handleInputChange('site_tagline', e.target.value)}
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="site_description" className="text-foreground font-medium text-sm sm:text-base">Description du site</Label>
                  {modifiedFields.has('site_description') && (
                    <Button
                      onClick={() => saveField('site_description')}
                      disabled={savingFields.has('site_description')}
                      size="sm"
                      className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      {savingFields.has('site_description') ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          <span className="text-xs">...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          <span className="text-xs">✓</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <Textarea
                  id="site_description"
                  value={localSettings.site_description}
                  onChange={(e) => handleInputChange('site_description', e.target.value)}
                  rows={3}
                  className="border-primary/20 focus:border-primary/40"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="copyright_text" className="text-foreground font-medium text-sm sm:text-base">Texte de copyright</Label>
                  {modifiedFields.has('copyright_text') && (
                    <Button
                      onClick={() => saveField('copyright_text')}
                      disabled={savingFields.has('copyright_text')}
                      size="sm"
                      className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      {savingFields.has('copyright_text') ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          <span className="text-xs">...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          <span className="text-xs">✓</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <Input
                  id="copyright_text"
                  value={localSettings.copyright_text}
                  onChange={(e) => handleInputChange('copyright_text', e.target.value)}
                  className="border-primary/20 focus:border-primary/40"
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations de Contact */}
          <Card className="bg-gradient-to-br from-card to-accent/5 border-primary/10 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Informations de Contact
                  </CardTitle>
                </div>
                <Button 
                  onClick={() => {
                    // Sauvegarder tous les champs modifiés de cette section
                    const contactFields = ['email_contact', 'phone_contact', 'address', 'contact_title', 'business_hours', 'telegram_support', 'support_description'];
                    contactFields.forEach(field => {
                      if (modifiedFields.has(field)) {
                        saveField(field);
                      }
                    });
                  }}
                  disabled={savingFields.size > 0}
                  size="sm"
                  className={`min-w-[100px] text-xs sm:text-sm ${
                    ['email_contact', 'phone_contact', 'address', 'contact_title', 'business_hours', 'telegram_support', 'support_description'].some(field => modifiedFields.has(field))
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-400 hover:bg-gray-500 text-white'
                  }`}
                >
                  {savingFields.size > 0 ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email_contact" className="text-foreground font-medium text-sm sm:text-base">Email de contact</Label>
                    {modifiedFields.has('email_contact') && (
                      <Button
                        onClick={() => saveField('email_contact')}
                        disabled={savingFields.has('email_contact')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('email_contact') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="email_contact"
                    type="email"
                    value={localSettings.email_contact}
                    onChange={(e) => handleInputChange('email_contact', e.target.value)}
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="phone_contact" className="text-foreground font-medium text-sm sm:text-base">Téléphone de contact</Label>
                    {modifiedFields.has('phone_contact') && (
                      <Button
                        onClick={() => saveField('phone_contact')}
                        disabled={savingFields.has('phone_contact')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('phone_contact') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="phone_contact"
                    value={localSettings.phone_contact}
                    onChange={(e) => handleInputChange('phone_contact', e.target.value)}
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address" className="text-foreground font-medium text-sm sm:text-base">Adresse</Label>
                  {modifiedFields.has('address') && (
                    <Button
                      onClick={() => saveField('address')}
                      disabled={savingFields.has('address')}
                      size="sm"
                      className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      {savingFields.has('address') ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          <span className="text-xs">...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          <span className="text-xs">✓</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <Textarea
                  id="address"
                  value={localSettings.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="border-primary/20 focus:border-primary/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contact_title" className="text-foreground font-medium text-sm sm:text-base">Titre de la section contact</Label>
                    {modifiedFields.has('contact_title') && (
                      <Button
                        onClick={() => saveField('contact_title')}
                        disabled={savingFields.has('contact_title')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('contact_title') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="contact_title"
                    value={localSettings.contact_title}
                    onChange={(e) => handleInputChange('contact_title', e.target.value)}
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="business_hours" className="text-foreground font-medium text-sm sm:text-base">Horaires d'ouverture</Label>
                    {modifiedFields.has('business_hours') && (
                      <Button
                        onClick={() => saveField('business_hours')}
                        disabled={savingFields.has('business_hours')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('business_hours') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="business_hours"
                    value={localSettings.business_hours}
                    onChange={(e) => handleInputChange('business_hours', e.target.value)}
                    placeholder="Lun-Ven: 9h-18h"
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telegram_support" className="text-foreground font-medium text-sm sm:text-base">Support Telegram</Label>
                    {modifiedFields.has('telegram_support') && (
                      <Button
                        onClick={() => saveField('telegram_support')}
                        disabled={savingFields.has('telegram_support')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('telegram_support') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="telegram_support"
                    value={localSettings.telegram_support}
                    onChange={(e) => handleInputChange('telegram_support', e.target.value)}
                    placeholder="@CalmnessFi_Support"
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="support_description" className="text-foreground font-medium text-sm sm:text-base">Description du support</Label>
                    {modifiedFields.has('support_description') && (
                      <Button
                        onClick={() => saveField('support_description')}
                        disabled={savingFields.has('support_description')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('support_description') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="support_description"
                    value={localSettings.support_description}
                    onChange={(e) => handleInputChange('support_description', e.target.value)}
                    placeholder="24/7 Support"
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Réseaux Sociaux */}
          <Card className="bg-gradient-to-br from-card to-accent/5 border-primary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Réseaux Sociaux
                  </CardTitle>
                </div>
                <Button 
                  onClick={() => {
                    // Sauvegarder tous les champs modifiés de cette section
                    const socialFields = ['telegram_url', 'discord_url', 'facebook_url', 'twitter_url', 'linkedin_url'];
                    socialFields.forEach(field => {
                      if (modifiedFields.has(field)) {
                        saveField(field);
                      }
                    });
                  }}
                  disabled={savingFields.size > 0}
                  size="sm"
                  className={`min-w-[100px] text-xs sm:text-sm ${
                    ['telegram_url', 'discord_url', 'facebook_url', 'twitter_url', 'linkedin_url'].some(field => modifiedFields.has(field))
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                      : 'bg-gray-400 hover:bg-gray-500 text-white'
                  }`}
                >
                  {savingFields.size > 0 ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telegram_url" className="text-foreground font-medium text-sm sm:text-base">URL Telegram</Label>
                    {modifiedFields.has('telegram_url') && (
                      <Button
                        onClick={() => saveField('telegram_url')}
                        disabled={savingFields.has('telegram_url')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('telegram_url') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="telegram_url"
                    type="url"
                    value={localSettings.telegram_url}
                    onChange={(e) => handleInputChange('telegram_url', e.target.value)}
                    placeholder="https://t.me/..."
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discord_url" className="text-foreground font-medium text-sm sm:text-base">URL Discord</Label>
                    {modifiedFields.has('discord_url') && (
                      <Button
                        onClick={() => saveField('discord_url')}
                        disabled={savingFields.has('discord_url')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('discord_url') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="discord_url"
                    type="url"
                    value={localSettings.discord_url}
                    onChange={(e) => handleInputChange('discord_url', e.target.value)}
                    placeholder="https://discord.gg/..."
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="facebook_url" className="text-foreground font-medium text-sm sm:text-base">URL Facebook</Label>
                    {modifiedFields.has('facebook_url') && (
                      <Button
                        onClick={() => saveField('facebook_url')}
                        disabled={savingFields.has('facebook_url')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('facebook_url') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={localSettings.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twitter_url" className="text-foreground font-medium text-sm sm:text-base">URL Twitter</Label>
                    {modifiedFields.has('twitter_url') && (
                      <Button
                        onClick={() => saveField('twitter_url')}
                        disabled={savingFields.has('twitter_url')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('twitter_url') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="twitter_url"
                    type="url"
                    value={localSettings.twitter_url}
                    onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="linkedin_url" className="text-foreground font-medium text-sm sm:text-base">URL LinkedIn</Label>
                    {modifiedFields.has('linkedin_url') && (
                      <Button
                        onClick={() => saveField('linkedin_url')}
                        disabled={savingFields.has('linkedin_url')}
                        size="sm"
                        className="h-8 px-3 bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        {savingFields.has('linkedin_url') ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            <span className="text-xs">...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            <span className="text-xs">✓</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="linkedin_url"
                    type="url"
                    value={localSettings.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/..."
                    className="border-primary/20 focus:border-primary/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
