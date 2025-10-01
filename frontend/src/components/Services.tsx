import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Zap, TrendingUp, Users, Clock, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { EditableText } from "@/components/cms/EditableText";

const Services = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const services = [
    {
      icon: GraduationCap,
      titleKey: "services.formation.title",
      descriptionKey: "services.formation.desc",
      features: ["services.features.technical.analysis", "services.features.risk.management", "services.features.trading.psychology", "services.features.profitable.strategies"],
      badge: "services.badges.popular",
      badgeVariant: "default" as const
    },
    {
      icon: Zap,
      titleKey: "services.signals.title",
      descriptionKey: "services.signals.desc",
      features: ["services.features.daily.signals", "services.features.entry.exit.points", "services.features.risk.reward.ratios", "services.features.tracked.performance"],
      badge: "services.badges.premium",
      badgeVariant: "secondary" as const
    },
    {
      icon: TrendingUp,
      titleKey: "services.analysis.title",
      descriptionKey: "services.analysis.desc",
      features: ["services.features.macro.analysis", "services.features.technical.setups", "services.features.key.levels", "services.features.identified.opportunities"],
      badge: "services.badges.new",
      badgeVariant: "outline" as const
    }
  ];

  return (
    <section id="services" className="py-20 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <EditableText
            value={t('services.title.part1') + " " + t('services.title.part2')}
            sectionId={4}
            fieldName="content"
            className="text-3xl md:text-4xl font-bold mb-4"
          />
          <EditableText
            value={t('services.subtitle')}
            sectionId={5}
            fieldName="content"
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
            >
              <Card className="relative overflow-hidden group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant={service.badgeVariant}>
                    {t(service.badge)}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {t(service.titleKey)}
                </CardTitle>
                <CardDescription className="text-base">
                  {t(service.descriptionKey)}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm text-muted-foreground">{t(feature)}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full group-hover:border-primary/50 transition-colors">
                  {t('services.learn.more')}
                </Button>
              </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div 
          className="mt-20 bg-gradient-to-r from-card to-accent/20 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "5000+", label: t('services.stats.trained') },
              { icon: Award, value: "95%", label: t('services.stats.success') },
              { icon: Clock, value: "24/7", label: t('hero.stats.support') },
              { icon: TrendingUp, value: "200%", label: t('services.stats.roi') }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;