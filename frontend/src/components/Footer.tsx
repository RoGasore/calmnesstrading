import { TrendingUp, Mail, MessageCircle, Shield, Award, Phone, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { EditableText } from "@/components/cms/EditableText";
import { API_URLS } from "@/config/api";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useLanguage();
  const { fetchWithAuth } = useAuth();
  const { refreshTrigger } = useEditMode();
  const [sections, setSections] = useState<any[]>([]);
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(API_URLS.PAGE_PUBLIC('footer'));
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching footer sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch(API_URLS.GLOBAL_SETTINGS_PUBLIC);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchSections();
      fetchGlobalSettings();
    }
  }, [refreshTrigger, fetchWithAuth]);

  const getSectionContent = (key: string, defaultValue: string) => {
    const section = sections.find(s => s.section_key === key);
    return section ? section.content : defaultValue;
  };

  const getSectionId = (key: string, defaultId: number) => {
    const section = sections.find(s => s.section_key === key);
    return section ? section.id : defaultId;
  };
  
  return (
    <footer className="bg-gradient-to-br from-background via-muted/30 to-background border-t border-border" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
              <div className="flex flex-col">
                <EditableText
                  value={getSectionContent('footer_logo', globalSettings.site_name || 'CALMNESS FI')}
                  sectionId={getSectionId('footer_logo', 200)}
                  fieldName="content"
                  className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"
                />
                <span className="text-xs text-muted-foreground">Trading Professionnel</span>
              </div>
            </div>
            <EditableText
              value={getSectionContent('footer_tagline', t('footer.tagline'))}
              sectionId={getSectionId('footer_tagline', 201)}
              fieldName="content"
              className="text-sm text-muted-foreground mb-6 block"
            />
            <div className="flex space-x-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:border-primary/30">
                  <Facebook className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:border-primary/30">
                  <Twitter className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:border-primary/30">
                  <Instagram className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:border-primary/30">
                  <Linkedin className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contact@calmnesstrading.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <EditableText
              value={getSectionContent('footer_services_title', t('footer.services'))}
              sectionId={getSectionId('footer_services_title', 202)}
              fieldName="content"
              className="font-semibold mb-4 block"
            />
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/services-formations" className="hover:text-primary transition-colors">{t('footer.trading.courses')}</Link></li>
              <li><Link to="/services-signaux" className="hover:text-primary transition-colors">{t('footer.premium.signals')}</Link></li>
              <li><Link to="/services-gestion" className="hover:text-primary transition-colors">{t('footer.personal.coaching')}</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Tous nos services</Link></li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <EditableText
              value={getSectionContent('footer_support_title', t('footer.support'))}
              sectionId={getSectionId('footer_support_title', 203)}
              fieldName="content"
              className="font-semibold mb-4 block"
            />
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">{t('nav.faq')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/reviews" className="hover:text-primary transition-colors">Avis clients</Link></li>
              <li><a href="#support" className="hover:text-primary transition-colors">{t('footer.help.center')}</a></li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <EditableText
              value={getSectionContent('footer_legal_title', t('footer.legal'))}
              sectionId={getSectionId('footer_legal_title', 204)}
              fieldName="content"
              className="font-semibold mb-4 block"
            />
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#terms" className="hover:text-primary transition-colors">{t('footer.terms')}</a></li>
              <li><a href="#disclaimer" className="hover:text-primary transition-colors">{t('footer.risk.disclaimer')}</a></li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div 
          className="py-12 border-t border-border"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">Restez informé</h3>
            <p className="text-muted-foreground mb-6">Recevez nos dernières analyses et signaux de trading directement dans votre boîte mail</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 px-6">
                S'inscrire
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          className="py-8 border-t border-border"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              {[
                { icon: Shield, text: t('footer.ssl.secured'), color: "text-success" },
                { icon: Award, text: t('footer.certified.experts'), color: "text-primary" },
                { icon: MessageCircle, text: t('footer.support.24.7'), color: "text-primary" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1, ease: "easeOut" }}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
            <motion.div 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.3, ease: "easeOut" }}
            >
              <EditableText
                value={getSectionContent('footer_copyright', globalSettings.copyright_text || t('footer.copyright'))}
                sectionId={getSectionId('footer_copyright', 205)}
                fieldName="content"
                className="inline"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Risk Disclaimer */}
        <motion.div 
          className="py-6 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
        >
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <strong>{t('footer.risk.warning.title')}</strong> {t('footer.risk.warning.text')}
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;