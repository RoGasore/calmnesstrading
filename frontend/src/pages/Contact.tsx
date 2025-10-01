import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditableLayout } from "@/components/cms/EditableLayout";

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the form data to your backend
    toast({
      title: t2('contact.form.success.title'),
      description: t2('contact.form.success.message'),
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const translations = {
    'contact.title': { fr: 'Contactez-Nous', en: 'Contact Us' },
    'contact.subtitle': { fr: 'Notre équipe est là pour répondre à toutes vos questions', en: 'Our team is here to answer all your questions' },
    'contact.info.title': { fr: 'Informations de Contact', en: 'Contact Information' },
    'contact.info.subtitle': { fr: 'Plusieurs façons de nous joindre', en: 'Multiple ways to reach us' },
    'contact.form.title': { fr: 'Envoyez-nous un Message', en: 'Send us a Message' },
    'contact.form.name': { fr: 'Nom complet', en: 'Full name' },
    'contact.form.email': { fr: 'Email', en: 'Email' },
    'contact.form.subject': { fr: 'Sujet', en: 'Subject' },
    'contact.form.message': { fr: 'Message', en: 'Message' },
    'contact.form.send': { fr: 'Envoyer le Message', en: 'Send Message' },
    'contact.form.success.title': { fr: 'Message envoyé !', en: 'Message sent!' },
    'contact.form.success.message': { fr: 'Nous vous répondrons dans les plus brefs délais.', en: 'We will respond to you as soon as possible.' },
    'contact.address': { fr: 'Adresse', en: 'Address' },
    'contact.phone': { fr: 'Téléphone', en: 'Phone' },
    'contact.email': { fr: 'Email', en: 'Email' },
    'contact.hours': { fr: 'Horaires', en: 'Hours' },
    'contact.telegram': { fr: 'Support Telegram', en: 'Telegram Support' },
    'contact.hours.value': { fr: 'Lun-Ven: 9h-18h', en: 'Mon-Fri: 9am-6pm' },
    'contact.address.value': { fr: '123 Avenue des Champs-Élysées, 75008 Paris, France', en: '123 Champs-Élysées Avenue, 75008 Paris, France' }
  };

  const t2 = (key: string): string => {
    return translations[key]?.[useLanguage().language] || key;
  };

  return (
    <EditableLayout pageSlug="contact">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t2('contact.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t2('contact.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-6">{t2('contact.info.title')}</h2>
                <p className="text-muted-foreground mb-8">{t2('contact.info.subtitle')}</p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t2('contact.address')}</h3>
                      <p className="text-muted-foreground">{t2('contact.address.value')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t2('contact.phone')}</h3>
                      <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t2('contact.email')}</h3>
                      <p className="text-muted-foreground">contact@calmnessfi.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t2('contact.hours')}</h3>
                      <p className="text-muted-foreground">{t2('contact.hours.value')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t2('contact.telegram')}</h3>
                      <p className="text-muted-foreground">@CalmnessFi_Support</p>
                      <p className="text-sm text-primary">24/7 Support</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{t2('contact.form.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t2('contact.form.name')}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">{t2('contact.form.email')}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t2('contact.form.subject')}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">{t2('contact.form.message')}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      {t2('contact.form.send')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </EditableLayout>
  );
};

export default Contact;