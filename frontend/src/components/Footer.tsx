import { TrendingUp, Mail, MessageCircle, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { EditableText } from "@/components/cms/EditableText";

const Footer = () => {
  const { t } = useLanguage();
  const { fetchWithAuth } = useAuth();
  const { refreshTrigger } = useEditMode();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('https://calmnesstrading.onrender.com/api/content/cms/pages/public/footer/');
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

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchSections();
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
    <footer className="bg-muted/50 border-t border-border" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <EditableText
                value={getSectionContent('footer_logo', 'CALMNESS FI')}
                sectionId={getSectionId('footer_logo', 200)}
                fieldName="content"
                className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"
              />
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
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button variant="outline" size="icon">
                  <Mail className="w-4 h-4" />
                </Button>
              </motion.div>
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
              <li><a href="#formations" className="hover:text-primary transition-colors">{t('footer.trading.courses')}</a></li>
              <li><a href="#signaux" className="hover:text-primary transition-colors">{t('footer.premium.signals')}</a></li>
              {/* Lien Analyses supprimé, fusionné avec Signaux */}
              <li><a href="#coaching" className="hover:text-primary transition-colors">{t('footer.personal.coaching')}</a></li>
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
              <li><a href="#faq" className="hover:text-primary transition-colors">{t('nav.faq')}</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">{t('nav.contact')}</a></li>
              <li><a href="#telegram" className="hover:text-primary transition-colors">{t('footer.telegram.groups')}</a></li>
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

        {/* Trust Indicators */}
        <motion.div 
          className="py-8 border-t border-border"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
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
                value={getSectionContent('footer_copyright', t('footer.copyright'))}
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