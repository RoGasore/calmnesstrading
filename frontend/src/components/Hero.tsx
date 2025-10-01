import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-trading.jpg";
import { motion } from "framer-motion";
import { EditableText } from "@/components/cms/EditableText";
import { EditableImage } from "@/components/cms/EditableImage";

const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <EditableImage
          src={heroImage}
          alt="Trading platform dashboard"
          sectionId={3}
          fieldName="content"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/90" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <EditableText
              value={t('hero.title.part1') + " " + t('hero.title.part2')}
              sectionId={1}
              fieldName="content"
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <EditableText
              value={t('hero.subtitle')}
              sectionId={2}
              fieldName="content"
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            />
          </motion.div>

          {/* Features */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <motion.div 
              className="flex items-center space-x-2 text-foreground"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{t('hero.feature1')}</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 text-foreground"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{t('hero.feature2')}</span>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-2 text-foreground"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{t('hero.feature3')}</span>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                {t('hero.cta1')}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                {t('hero.cta2')}
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              {t('hero.social.text')}
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold text-primary">5K+</div>
              <div className="text-sm">{t('hero.stats.traders')}</div>
              <div className="w-px h-8 bg-border" />
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm">{t('hero.stats.satisfaction')}</div>
              <div className="w-px h-8 bg-border" />
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm">{t('hero.stats.support')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-glow/10 rounded-full blur-3xl" />
    </section>
  );
};

export default Hero;