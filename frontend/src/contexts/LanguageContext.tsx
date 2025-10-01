import React, { createContext, useContext, useState } from 'react';

type Language = 'fr' | 'en';

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  'nav.formations': { fr: 'Formations', en: 'Training' },
  'nav.signaux': { fr: 'Signaux', en: 'Signals' },
  'nav.gestion': { fr: 'Gestion', en: 'Management' },
  // 'nav.analyses': { fr: 'Analyses', en: 'Analysis' },
  'nav.tarifs': { fr: 'Tarifs', en: 'Pricing' },
  'nav.connexion': { fr: 'Connexion', en: 'Login' },
  'nav.commencer': { fr: 'Commencer', en: 'Get Started' },
  
  // Hero
  'hero.title.part1': { fr: 'Maîtrisez les', en: 'Master the' },
  'hero.title.part2': { fr: 'Marchés Financiers', en: 'Financial Markets' },
  'hero.subtitle': { 
    fr: 'Formations d\'experts, signaux en temps réel et analyses techniques approfondies pour transformer votre approche du trading.',
    en: 'Expert training, real-time signals and in-depth technical analysis to transform your trading approach.'
  },
  'hero.feature1': { fr: 'Signaux Premium', en: 'Premium Signals' },
  'hero.feature2': { fr: 'Analyses Techniques', en: 'Technical Analysis' },
  'hero.feature3': { fr: 'Formation Complète', en: 'Complete Training' },
  'hero.cta1': { fr: 'Voir les Tarifs', en: 'View Pricing' },
  'hero.cta2': { fr: 'Essai Gratuit', en: 'Free Trial' },
  'hero.social.text': { fr: 'Rejoignez plus de 5,000+ traders qui nous font confiance', en: 'Join 5,000+ traders who trust us' },
  'hero.stats.traders': { fr: 'Traders Actifs', en: 'Active Traders' },
  'hero.stats.satisfaction': { fr: 'Satisfaction', en: 'Satisfaction' },
  'hero.stats.support': { fr: 'Support', en: 'Support' },
  
  // Services
  'services.title.part1': { fr: 'Nos Services de', en: 'Our' },
  'services.title.part2': { fr: 'Trading', en: 'Trading Services' },
  'services.subtitle': { 
    fr: 'Découvrez notre gamme complète de services conçus pour faire de vous un trader profitable',
    en: 'Discover our complete range of services designed to make you a profitable trader'
  },
  'services.formation.title': { fr: 'Formations Complètes', en: 'Complete Training' },
  'services.formation.desc': { fr: 'Apprenez les stratégies de trading avancées avec nos experts certifiés', en: 'Learn advanced trading strategies with our certified experts' },
  'services.signals.title': { fr: 'Signaux en Temps Réel', en: 'Real-Time Signals' },
  'services.signals.desc': { fr: 'Recevez des signaux de trading précis directement sur Telegram', en: 'Receive precise trading signals directly on Telegram' },
  'services.analysis.title': { fr: 'Analyses Techniques', en: 'Technical Analysis' },
  'services.analysis.desc': { fr: 'Analyses approfondies des marchés avec des prévisions précises', en: 'In-depth market analysis with precise forecasts' },
  'services.learn.more': { fr: 'En savoir plus', en: 'Learn more' },
  'services.stats.trained': { fr: 'Traders Formés', en: 'Trained Traders' },
  'services.stats.success': { fr: 'Taux de Réussite', en: 'Success Rate' },
  'services.stats.roi': { fr: 'ROI Moyen', en: 'Average ROI' },
  
  // Pricing
  'pricing.title.part1': { fr: 'Choisissez Votre', en: 'Choose Your' },
  'pricing.title.part2': { fr: 'Formule', en: 'Plan' },
  'pricing.subtitle': { 
    fr: 'Accédez aux formations et signaux adaptés à votre niveau de trading',
    en: 'Access training and signals adapted to your trading level'
  },
  'pricing.telegram.notice': { 
    fr: 'Intégration automatique aux groupes Telegram selon votre abonnement',
    en: 'Automatic integration to Telegram groups according to your subscription'
  },
  'pricing.popular': { fr: 'Plus Populaire', en: 'Most Popular' },
  'pricing.month': { fr: 'mois', en: 'month' },
  'pricing.automation.title': { fr: 'Intégration Telegram Automatique', en: 'Automatic Telegram Integration' },
  'pricing.automation.desc': { 
    fr: 'Dès votre souscription, vous serez automatiquement ajouté au groupe Telegram correspondant à votre plan. En fin d\'abonnement, l\'accès sera automatiquement révoqué.',
    en: 'Upon subscription, you will be automatically added to the Telegram group corresponding to your plan. At the end of subscription, access will be automatically revoked.'
  },
  'pricing.auto.add': { fr: 'Ajout automatique', en: 'Automatic addition' },
  'pricing.realtime': { fr: 'Signaux en temps réel', en: 'Real-time signals' },
  'pricing.auto.remove': { fr: 'Retrait automatique', en: 'Automatic removal' },
  
  // Header Navigation
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.services': { fr: 'Services', en: 'Services' },
  'nav.reviews': { fr: 'Avis', en: 'Reviews' },
  'nav.faq': { fr: 'FAQ', en: 'FAQ' },
  'nav.contact': { fr: 'Contact', en: 'Contact' },
  
  // Footer
  'footer.tagline': { 
    fr: 'Votre partenaire de confiance pour maîtriser les marchés financiers. Formations d\'experts, signaux précis et analyses approfondies.',
    en: 'Your trusted partner to master financial markets. Expert training, precise signals and in-depth analysis.'
  },
  'footer.services': { fr: 'Services', en: 'Services' },
  'footer.support': { fr: 'Support', en: 'Support' },
  'footer.legal': { fr: 'Légal', en: 'Legal' },
  'footer.trading.courses': { fr: 'Formations Trading', en: 'Trading Courses' },
  'footer.premium.signals': { fr: 'Signaux Premium', en: 'Premium Signals' },
  'footer.technical.analysis': { fr: 'Analyses Techniques', en: 'Technical Analysis' },
  'footer.personal.coaching': { fr: 'Coaching Personnel', en: 'Personal Coaching' },
  'footer.telegram.groups': { fr: 'Groupes Telegram', en: 'Telegram Groups' },
  'footer.help.center': { fr: 'Centre d\'aide', en: 'Help Center' },
  'footer.privacy': { fr: 'Confidentialité', en: 'Privacy' },
  'footer.terms': { fr: 'Conditions d\'utilisation', en: 'Terms of Use' },
  'footer.risk.disclaimer': { fr: 'Avertissement risques', en: 'Risk Disclaimer' },
  'footer.ssl.secured': { fr: 'Sécurisé SSL', en: 'SSL Secured' },
  'footer.certified.experts': { fr: 'Experts Certifiés', en: 'Certified Experts' },
  'footer.support.24.7': { fr: 'Support 24/7', en: '24/7 Support' },
    'footer.copyright': { fr: '© 2025 CALMNESS FI. Tous droits réservés.', en: '© 2025 CALMNESS FI. All rights reserved.' },
  'footer.risk.warning.title': { fr: 'Avertissement sur les risques :', en: 'Risk Warning:' },
  'footer.risk.warning.text': { 
    fr: 'Le trading de CFD et de devises comporte un niveau de risque élevé et peut ne pas convenir à tous les investisseurs. Vous pourriez perdre tout ou partie de votre capital investi. Les performances passées ne garantissent pas les résultats futurs. Assurez-vous de bien comprendre les risques avant de trader.',
    en: 'CFD and currency trading involves a high level of risk and may not be suitable for all investors. You could lose all or part of your invested capital. Past performance does not guarantee future results. Make sure you understand the risks before trading.'
  },
  
  // Services
  'services.solutions.title': { fr: 'Nos Solutions', en: 'Our Solutions' },
  'services.features.title': { fr: 'Ce que vous obtenez :', en: 'What you get:' },
  'services.why.title': { fr: 'Pourquoi Nous Choisir ?', en: 'Why Choose Us?' },
  'services.why.expertise.title': { fr: 'Expertise Reconnue', en: 'Recognized Expertise' },
  'services.why.expertise.desc': { fr: 'Plus de 10 ans d\'expérience dans le trading et la formation', en: 'Over 10 years of experience in trading and training' },
  'services.why.community.title': { fr: 'Communauté Active', en: 'Active Community' },
  'services.why.community.desc': { fr: 'Plus de 2000 traders qui nous font confiance', en: 'Over 2000 traders who trust us' },
  'services.why.results.title': { fr: 'Résultats Prouvés', en: 'Proven Results' },
  'services.why.results.desc': { fr: 'Taux de réussite élevé et retours positifs de nos clients', en: 'High success rate and positive feedback from our clients' },
  'services.cta.title': { fr: 'Prêt à Commencer ?', en: 'Ready to Get Started?' },
  'services.cta.subtitle': { fr: 'Rejoignez notre communauté de traders et découvrez nos solutions adaptées à votre niveau', en: 'Join our community of traders and discover our solutions adapted to your level' },
  'services.cta.formations': { fr: 'Commencer les Formations', en: 'Start Training' },
  'services.cta.signals': { fr: 'Voir les Signaux', en: 'View Signals' },
  'services.features.technical.analysis': { fr: 'Analyse technique approfondie', en: 'In-depth technical analysis' },
  'services.features.risk.management': { fr: 'Gestion des risques', en: 'Risk management' },
  'services.features.trading.psychology': { fr: 'Psychologie du trading', en: 'Trading psychology' },
  'services.features.profitable.strategies': { fr: 'Stratégies rentables', en: 'Profitable strategies' },
  'services.features.daily.signals': { fr: 'Signaux quotidiens', en: 'Daily signals' },
  'services.features.entry.exit.points': { fr: 'Points d\'entrée/sortie', en: 'Entry/exit points' },
  'services.features.risk.reward.ratios': { fr: 'Ratios risque/reward', en: 'Risk/reward ratios' },
  'services.features.tracked.performance': { fr: 'Performance trackée', en: 'Tracked performance' },
  'services.features.macro.analysis': { fr: 'Analyses macro', en: 'Macro analysis' },
  'services.features.technical.setups': { fr: 'Setups techniques', en: 'Technical setups' },
  'services.features.key.levels': { fr: 'Niveaux clés', en: 'Key levels' },
  'services.features.identified.opportunities': { fr: 'Opportunités identifiées', en: 'Identified opportunities' },
  'services.badges.popular': { fr: 'Populaire', en: 'Popular' },
  'services.badges.premium': { fr: 'Premium', en: 'Premium' },
  'services.badges.new': { fr: 'Nouveau', en: 'New' },
  
  // Services Hero
  'services.hero.title': { fr: 'Reprenez le Contrôle de Votre Trading', en: 'Take Control of Your Trading' },
  'services.hero.subtitle': { fr: 'Vous en avez assez de perdre vos trades et de voir votre capital fondre ?', en: 'Tired of losing trades and watching your capital melt away?' },
  'services.hero.description': { fr: 'Vous souhaitez enfin comprendre le marché et prendre des décisions éclairées sans stress ? Nous sommes là pour vous guider : profitez de nos signaux professionnels, analyses intégrées et formations pour reprendre le contrôle de votre trading. Et si vous n\'avez pas le temps d\'apprendre, nos services de gestion de comptes et signaux prêts à l\'emploi sont là pour vous.', en: 'Want to finally understand the market and make informed decisions without stress? We are here to guide you: benefit from our professional signals, integrated analysis and training to regain control of your trading. And if you don\'t have time to learn, our account management services and ready-to-use signals are here for you.' },
  
  // Signaux Hero
  'signaux.hero.title': { fr: 'Marre de Rater Vos Opportunités ?', en: 'Tired of Missing Your Opportunities?' },
  'signaux.hero.subtitle': { fr: 'Marre de rater vos opportunités et de subir vos trades perdants ?', en: 'Tired of missing your opportunities and suffering from losing trades?' },
  'signaux.hero.description': { fr: 'Nos signaux professionnels et analyses intégrées vous permettent de trader avec confiance et précision, sans perdre de temps à analyser chaque marché. Et si vous souhaitez progresser, explorez nos formations ou laissez notre équipe gérer votre capital grâce à nos services de gestion de comptes.', en: 'Our professional signals and integrated analysis allow you to trade with confidence and precision, without wasting time analyzing each market. And if you want to progress, explore our training or let our team manage your capital through our account management services.' },
  
  // Formations Hero
  'formations.hero.description': { fr: 'Vous voulez enfin maîtriser le trading et progresser rapidement ? Nos formations professionnelles sont conçues pour vous guider pas à pas et transformer vos connaissances en résultats concrets. Pendant que vous apprenez, vous pouvez aussi profiter de nos signaux pour trader en toute confiance ou confier votre capital à notre gestion de comptes pour des performances optimales.', en: 'Want to finally master trading and progress quickly? Our professional training is designed to guide you step by step and transform your knowledge into concrete results. While you learn, you can also benefit from our signals to trade with confidence or entrust your capital to our account management for optimal performance.' },
  
  // Gestion Hero
  'gestion.hero.title': { fr: 'Vous Manquez de Temps ?', en: 'Lack of Time?' },
  'gestion.hero.subtitle': { fr: 'Vous manquez de temps ou préférez confier votre trading à des experts ?', en: 'Lack of time or prefer to entrust your trading to experts?' },
  'gestion.hero.description': { fr: 'Notre service de gestion de comptes vous permet de profiter de nos stratégies, signaux et analyses sans lever le petit doigt. En parallèle, vous pouvez développer vos compétences grâce à nos formations ou suivre nos signaux pour mieux comprendre le marché.', en: 'Our account management service allows you to benefit from our strategies, signals and analysis without lifting a finger. In parallel, you can develop your skills through our training or follow our signals to better understand the market.' },
  'gestion.stats.performance': { fr: '+25% Performance', en: '+25% Performance' },
  'gestion.stats.security': { fr: 'Sécurisé', en: 'Secure' },
  'gestion.stats.experts': { fr: 'Experts Pro', en: 'Pro Experts' },
  'gestion.features.title': { fr: 'Pourquoi Choisir Notre Gestion ?', en: 'Why Choose Our Management?' },
  'gestion.features.strategies.title': { fr: 'Stratégies Éprouvées', en: 'Proven Strategies' },
  'gestion.features.strategies.desc': { fr: 'Nos stratégies sont testées et optimisées par nos experts', en: 'Our strategies are tested and optimized by our experts' },
  'gestion.features.risk.title': { fr: 'Gestion des Risques', en: 'Risk Management' },
  'gestion.features.risk.desc': { fr: 'Protection maximale de votre capital avec des stops adaptés', en: 'Maximum protection of your capital with adapted stops' },
  'gestion.features.performance.title': { fr: 'Performance Suivie', en: 'Tracked Performance' },
  'gestion.features.performance.desc': { fr: 'Transparence totale avec rapports détaillés', en: 'Total transparency with detailed reports' },
  'gestion.features.expert.title': { fr: 'Équipe d\'Experts', en: 'Expert Team' },
  'gestion.features.expert.desc': { fr: 'Traders professionnels avec plus de 10 ans d\'expérience', en: 'Professional traders with over 10 years of experience' },
  'gestion.cta.title': { fr: 'Prêt à Confier Votre Capital ?', en: 'Ready to Entrust Your Capital?' },
  'gestion.cta.subtitle': { fr: 'Contactez-nous pour une consultation personnalisée et découvrez comment nous pouvons optimiser vos performances', en: 'Contact us for a personalized consultation and discover how we can optimize your performance' },
  'gestion.cta.button': { fr: 'Demander une Consultation', en: 'Request a Consultation' },
  
  // Formations
  'formations.hero.title': { fr: 'Nos Formations de Trading', en: 'Our Trading Courses' },
  'formations.hero.subtitle': { fr: 'Développez vos compétences de trading avec nos formations professionnelles structurées en 4 niveaux progressifs', en: 'Develop your trading skills with our professional training structured in 4 progressive levels' },
  'formations.hero.stats.courses': { fr: '4 Formations', en: '4 Courses' },
  'formations.hero.stats.students': { fr: '+2000 Étudiants', en: '+2000 Students' },
  'formations.hero.stats.rating': { fr: '4.9/5 Note', en: '4.9/5 Rating' },
  'formations.courses.title': { fr: 'Parcours de Formation Progressif', en: 'Progressive Training Path' },
  'formations.features.title': { fr: 'Ce que vous obtenez', en: 'What you get' },
  'formations.learnings.title': { fr: 'Ce que vous apprendrez', en: 'What you will learn' },
  'formations.cta.title': { fr: 'Prêt à Commencer Votre Parcours ?', en: 'Ready to Start Your Journey?' },
  'formations.cta.subtitle': { fr: 'Rejoignez des milliers de traders qui ont transformé leur approche du trading grâce à nos formations', en: 'Join thousands of traders who have transformed their trading approach through our training' },
  'formations.cta.button': { fr: 'Voir les Formations', en: 'View Courses' },
  
  // Formation Initiation
  'formations.initiation.title': { fr: 'Initiation Gratuite', en: 'Free Introduction' },
  'formations.initiation.price': { fr: 'Gratuit', en: 'Free' },
  'formations.initiation.description': { fr: 'Vidéos explicatives (bases du trading) + Quiz interactifs pour valider vos acquis', en: 'Explanatory videos (trading basics) + Interactive quizzes to validate your knowledge' },
  'formations.initiation.badge': { fr: 'Obligatoire', en: 'Required' },
  'formations.initiation.features.videos': { fr: 'Vidéos explicatives (bases du trading)', en: 'Video lessons (trading basics)' },
  'formations.initiation.features.quizzes': { fr: 'Quiz interactifs pour valider vos acquis', en: 'Interactive quizzes to validate your knowledge' },
  'formations.initiation.features.prerequisite': { fr: 'Pré-requis obligatoire avant de passer aux niveaux supérieurs', en: 'Mandatory prerequisite before accessing higher levels' },
  'formations.initiation.learnings.markets': { fr: 'Comprendre les bases des marchés financiers', en: 'Understand the basics of financial markets' },
  'formations.initiation.learnings.technical': { fr: 'Découvrir les premières notions d\'analyse technique', en: 'Discover the first concepts of technical analysis' },
  'formations.initiation.learnings.psychology': { fr: 'Assimiler la gestion émotionnelle et psychologique du trader débutant', en: 'Learn emotional & psychological management for beginner traders' },
  'formations.initiation.button': { fr: 'Commencer Gratuitement', en: 'Start Free' },
  'formations.initiation.stats.duration': { fr: '2h', en: '2h' },
  'formations.initiation.stats.lessons': { fr: '8 leçons', en: '8 lessons' },
  'formations.initiation.stats.students': { fr: '5000+', en: '5000+' },
  
  // Formation Basic
  'formations.basic.title': { fr: 'Formation Basic', en: 'Basic Training' },
  'formations.basic.price': { fr: '150 $', en: '$150' },
  'formations.basic.description': { fr: 'Pour ceux qui veulent commencer à trader sérieusement', en: 'For those who want to start trading seriously' },
  'formations.basic.badge': { fr: 'Populaire', en: 'Popular' },
  'formations.basic.features.coaching': { fr: 'Coaching de groupe', en: 'Group coaching' },
  'formations.basic.features.signals': { fr: 'Accès aux signaux de trading quotidiens', en: 'Access to daily trading signals' },
  'formations.basic.features.exercises': { fr: 'Exercices pratiques guidés', en: 'Guided practical exercises' },
  'formations.basic.learnings.indicators': { fr: 'Analyser les marchés avec des indicateurs techniques simples', en: 'Market analysis using simple technical indicators' },
  'formations.basic.learnings.risk': { fr: 'Comprendre la gestion des risques appliquée', en: 'Applied risk management' },
  'formations.basic.learnings.strategies': { fr: 'Suivre des stratégies validées par des traders pros', en: 'Following validated strategies from professional traders' },
  'formations.basic.button': { fr: 'Acheter maintenant', en: 'Buy Now' },
  'formations.basic.stats.duration': { fr: '4h', en: '4h' },
  'formations.basic.stats.lessons': { fr: '15 leçons', en: '15 lessons' },
  'formations.basic.stats.students': { fr: '1200+', en: '1200+' },
  
  // Formation Avancée
  'formations.advanced.title': { fr: 'Formation Avancée', en: 'Advanced Training' },
  'formations.advanced.price': { fr: '300 $', en: '$300' },
  'formations.advanced.description': { fr: 'Pour les traders confirmés qui veulent franchir un cap', en: 'For experienced traders who want to level up' },
  'formations.advanced.badge': { fr: 'Recommandé', en: 'Recommended' },
  'formations.advanced.features.coaching': { fr: 'Coaching individuel mensuel', en: 'Monthly 1-on-1 coaching' },
  'formations.advanced.features.strategies': { fr: 'Stratégies avancées et setups exclusifs', en: 'Advanced strategies and exclusive setups' },
  'formations.advanced.features.community': { fr: 'Accès à une communauté privée de traders actifs', en: 'Access to a private community of active traders' },
  'formations.advanced.learnings.patterns': { fr: 'Identifier et trader des patterns complexes', en: 'Identify and trade complex patterns' },
  'formations.advanced.learnings.indicators': { fr: 'Utiliser des indicateurs personnalisés', en: 'Use custom indicators' },
  'formations.advanced.learnings.discipline': { fr: 'Développer une discipline stricte et un plan de trading solide', en: 'Develop strict discipline and a solid trading plan' },
  'formations.advanced.button': { fr: 'Acheter maintenant', en: 'Buy Now' },
  'formations.advanced.stats.duration': { fr: '6h', en: '6h' },
  'formations.advanced.stats.lessons': { fr: '25 leçons', en: '25 lessons' },
  'formations.advanced.stats.students': { fr: '800+', en: '800+' },
  
  // Formation Elite
  'formations.elite.title': { fr: 'Formation Elite', en: 'Elite Training' },
  'formations.elite.price': { fr: '1500 $', en: '$1500' },
  'formations.elite.description': { fr: 'Notre programme le plus complet pour devenir un trader professionnel', en: 'Our most complete program to become a professional trader' },
  'formations.elite.badge': { fr: 'Premium', en: 'Premium' },
  'formations.elite.features.mentorship': { fr: 'Mentorat personnalisé illimité', en: 'Unlimited personalized mentorship' },
  'formations.elite.features.vip': { fr: 'Accès VIP aux signaux premium et analyses en direct', en: 'VIP access to premium signals and live analysis' },
  'formations.elite.features.coaching': { fr: 'Accompagnement stratégique et psychologique', en: 'Strategic and psychological coaching' },
  'formations.elite.features.strategy': { fr: 'Développement de votre propre stratégie rentable', en: 'Development of your own profitable strategy' },
  'formations.elite.learnings.strategies': { fr: 'Créer et optimiser vos propres stratégies', en: 'Build and optimize your own strategies' },
  'formations.elite.learnings.capital': { fr: 'Trader avec une gestion de capital professionnelle', en: 'Trade with professional capital management' },
  'formations.elite.learnings.methodology': { fr: 'Accéder à une méthodologie de trading de niveau institutionnel', en: 'Access institutional-level trading methodology' },
  'formations.elite.button': { fr: 'Acheter maintenant', en: 'Buy Now' },
  'formations.elite.stats.duration': { fr: '12h', en: '12h' },
  'formations.elite.stats.lessons': { fr: '40 leçons', en: '40 lessons' },
  'formations.elite.stats.students': { fr: '200+', en: '200+' },
  
  // Pricing Plans
  'pricing.starter.name': { fr: 'Starter', en: 'Starter' },
  'pricing.starter.description': { fr: 'Parfait pour débuter', en: 'Perfect to get started' },
  'pricing.pro.name': { fr: 'Pro', en: 'Pro' },
  'pricing.pro.description': { fr: 'Le plus populaire', en: 'Most popular' },
  'pricing.elite.name': { fr: 'Elite', en: 'Elite' },
  'pricing.elite.description': { fr: 'Formation VIP complète', en: 'Complete VIP training' },
  
  // Pricing Features
  'pricing.features.basic.training': { fr: 'Accès formations de base', en: 'Access to basic training' },
  'pricing.features.weekly.signals': { fr: '5 signaux par semaine', en: '5 signals per week' },
  'pricing.features.weekly.analysis': { fr: 'Analyses hebdomadaires', en: 'Weekly analysis' },
  'pricing.features.email.support': { fr: 'Support par email', en: 'Email support' },
  'pricing.features.starter.group': { fr: 'Groupe Telegram Starter', en: 'Starter Telegram Group' },
  'pricing.features.all.training': { fr: 'Toutes les formations', en: 'All training courses' },
  'pricing.features.unlimited.signals': { fr: 'Signaux quotidiens illimités', en: 'Unlimited daily signals' },
  'pricing.features.advanced.analysis': { fr: 'Analyses techniques avancées', en: 'Advanced technical analysis' },
  'pricing.features.priority.support': { fr: 'Support prioritaire', en: 'Priority support' },
  'pricing.features.pro.group': { fr: 'Groupe Telegram Pro', en: 'Pro Telegram Group' },
  'pricing.features.monthly.coaching': { fr: 'Sessions de coaching mensuel', en: 'Monthly coaching sessions' },
  'pricing.features.exclusive.webinars': { fr: 'Accès aux webinaires exclusifs', en: 'Access to exclusive webinars' },
  'pricing.features.all.pro': { fr: 'Tout du plan Pro', en: 'Everything from Pro plan' },
  'pricing.features.high.frequency.signals': { fr: 'Signaux haute fréquence', en: 'High frequency signals' },
  'pricing.features.realtime.analysis': { fr: 'Analyses en temps réel', en: 'Real-time analysis' },
  'pricing.features.24.7.support': { fr: 'Support 24/7', en: '24/7 Support' },
  'pricing.features.elite.group': { fr: 'Groupe Telegram Elite', en: 'Elite Telegram Group' },
  'pricing.features.personal.coaching': { fr: 'Coaching personnalisé', en: 'Personal coaching' },
  'pricing.features.direct.expert.access': { fr: 'Accès direct aux experts', en: 'Direct access to experts' },
  'pricing.features.proprietary.strategies': { fr: 'Stratégies propriétaires', en: 'Proprietary strategies' },
  'pricing.features.sms.alerts': { fr: 'Alertes SMS', en: 'SMS alerts' },
  
  // Pricing Buttons
  'pricing.button.start': { fr: 'Commencer', en: 'Get Started' },
  'pricing.button.choose.pro': { fr: 'Choisir Pro', en: 'Choose Pro' },
  'pricing.button.become.elite': { fr: 'Devenir Elite', en: 'Become Elite' },
  
  // Pricing Telegram Groups
  'pricing.telegram.starter': { fr: '🔰 Starter Signals', en: '🔰 Starter Signals' },
  'pricing.telegram.pro': { fr: '⭐ Pro Traders', en: '⭐ Pro Traders' },
  'pricing.telegram.elite': { fr: '👑 Elite Traders', en: '👑 Elite Traders' },
  
  // Pricing Badges
  'pricing.badge.popular': { fr: 'Populaire', en: 'Popular' },
  'pricing.badge.vip': { fr: 'VIP', en: 'VIP' },
  
  // User Menu
  'user.profile': { fr: 'Profil', en: 'Profile' },
  'user.settings': { fr: 'Paramètres', en: 'Settings' },
  'user.admin': { fr: 'Administration', en: 'Administration' },
  'user.logout': { fr: 'Déconnexion', en: 'Logout' },
  
  // Add Review Dialog
  'add.review': { fr: 'Ajouter un avis', en: 'Add a review' },
  'add.review.desc': { fr: 'Partagez votre expérience avec nos services', en: 'Share your experience with our services' },
  'rating.label': { fr: 'Note', en: 'Rating' },
  'review.label': { fr: 'Votre avis', en: 'Your review' },
  'review.placeholder': { fr: 'Décrivez votre expérience...', en: 'Describe your experience...' },
  'submit': { fr: 'Publier l\'avis', en: 'Submit review' },
  'cancel': { fr: 'Annuler', en: 'Cancel' },
  'success': { fr: 'Avis publié avec succès !', en: 'Review published successfully!' },
  'login.required': { fr: 'Vous devez être connecté pour ajouter un avis', en: 'You must be logged in to add a review' },
  'error': { fr: 'Erreur', en: 'Error' },
  'login.connection.required': { fr: 'Connexion requise', en: 'Login required' },
  'success.title': { fr: 'Succès', en: 'Success' },
  
  // Reviews Page
  'reviews.title': { fr: 'Avis de nos Traders', en: 'Our Traders Reviews' },
  'reviews.subtitle': { fr: 'Découvrez ce que pensent nos clients de nos services', en: 'See what our clients think about our services' },
  'reviews.verified': { fr: 'Avis vérifié', en: 'Verified review' },
  'reviews.stats.total': { fr: 'Avis Clients', en: 'Client Reviews' },
  'reviews.stats.rating': { fr: 'Note Moyenne', en: 'Average Rating' },
  'reviews.stats.satisfaction': { fr: 'Satisfaction', en: 'Satisfaction' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};