import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { EditableText } from "@/components/cms/EditableText";

const Pricing = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const plans = [
    {
      name: "pricing.starter.name",
      description: "pricing.starter.description",
      price: "49",
      period: "mois",
      icon: Zap,
      badge: null,
      features: [
        "pricing.features.basic.training",
        "pricing.features.weekly.signals",
        "pricing.features.weekly.analysis",
        "pricing.features.email.support",
        "pricing.features.starter.group"
      ],
      telegramGroup: "pricing.telegram.starter",
      buttonText: "pricing.button.start",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "pricing.pro.name",
      description: "pricing.pro.description",
      price: "99",
      period: "mois",
      icon: Star,
      badge: "pricing.badge.popular",
      features: [
        "pricing.features.all.training",
        "pricing.features.unlimited.signals",
        "pricing.features.advanced.analysis",
        "pricing.features.priority.support",
        "pricing.features.pro.group",
        "pricing.features.monthly.coaching",
        "pricing.features.exclusive.webinars"
      ],
      telegramGroup: "pricing.telegram.pro",
      buttonText: "pricing.button.choose.pro",
      buttonVariant: "hero" as const,
      popular: true
    },
    {
      name: "pricing.elite.name",
      description: "pricing.elite.description",
      price: "199",
      period: "mois",
      icon: Crown,
      badge: "pricing.badge.vip",
      features: [
        "pricing.features.all.pro",
        "pricing.features.high.frequency.signals",
        "pricing.features.realtime.analysis",
        "pricing.features.24.7.support",
        "pricing.features.elite.group",
        "pricing.features.personal.coaching",
        "pricing.features.direct.expert.access",
        "pricing.features.proprietary.strategies",
        "pricing.features.sms.alerts"
      ],
      telegramGroup: "pricing.telegram.elite",
      buttonText: "pricing.button.become.elite",
      buttonVariant: "premium" as const,
      popular: false
    }
  ];

  return (
    <section id="tarifs" className="py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <EditableText
            value={t('pricing.title.part1') + " " + t('pricing.title.part2')}
            sectionId={6}
            fieldName="content"
            className="text-3xl md:text-4xl font-bold mb-4"
          />
          <EditableText
            value={t('pricing.subtitle')}
            sectionId={7}
            fieldName="content"
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          />
          
          {/* Telegram Integration Notice */}
          <motion.div 
            className="inline-flex items-center space-x-2 bg-accent/50 border border-primary/20 rounded-lg px-4 py-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Send className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">
              {t('pricing.telegram.notice')}
            </span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
            >
              <Card 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card)] hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-primary/20 scale-105' : ''
                }`}
              >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-center py-2 text-sm font-medium">
                  ⭐ {t('pricing.popular')}
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  {plan.badge && (
                    <Badge variant={plan.popular ? "default" : "secondary"}>
                      {t(plan.badge)}
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-2xl font-bold">{t(plan.name)}</CardTitle>
                <CardDescription className="text-base">{t(plan.description)}</CardDescription>

                {/* Price */}
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{t('pricing.month')}</span>
                  </div>
                </div>

                {/* Telegram Group */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{t(plan.telegramGroup)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{t(feature)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  variant={plan.buttonVariant} 
                  size="lg" 
                  className="w-full"
                >
                  {t(plan.buttonText)}
                </Button>
              </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4">{t('pricing.automation.title')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('pricing.automation.desc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { color: "bg-success", text: t('pricing.auto.add') },
                { color: "bg-primary", text: t('pricing.realtime') },
                { color: "bg-warning", text: t('pricing.auto.remove') }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-center space-x-2 p-3 bg-background rounded-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1, ease: "easeOut" }}
                >
                  <div className={`w-2 h-2 ${item.color} rounded-full`} />
                  <span className="text-sm">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;