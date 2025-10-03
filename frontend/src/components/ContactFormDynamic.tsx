import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URLS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface ContactField {
  id: number;
  field_name: string;
  field_label: string;
  field_type: string;
  field_placeholder: string;
  is_required: boolean;
  options?: string[] | string;
  validation_pattern?: string;
  validation_message?: string;
}

interface ContactFormDynamicProps {
  onSubmit?: (data: Record<string, any>) => void;
}

const ContactFormDynamic: React.FC<ContactFormDynamicProps> = ({ onSubmit }) => {
  const [fields, setFields] = useState<ContactField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContactFields();
  }, []);

  const loadContactFields = async () => {
    try {
      console.log('Chargement des champs de contact depuis:', API_URLS.CONTACT_FIELDS_PUBLIC);
      
      const response = await fetch(API_URLS.CONTACT_FIELDS_PUBLIC);
      
      console.log('Réponse HTTP:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur HTTP:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('Réponse brute:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Données parsées:', data);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        console.error('Contenu reçu:', responseText);
        throw new Error('Réponse serveur invalide - format JSON incorrect');
      }
      
      setFields(data);
      
      // Initialiser les données du formulaire
      const initialData: Record<string, any> = {};
      data.forEach((field: ContactField) => {
        if (field.field_type === 'checkbox') {
          initialData[field.field_name] = false;
        } else {
          initialData[field.field_name] = '';
        }
      });
      setFormData(initialData);
      
    } catch (error) {
      console.error('Erreur lors du chargement des champs de contact:', error);
      
      // Fallback: utiliser des champs par défaut
      const fallbackFields: ContactField[] = [
        {
          id: 1,
          field_name: 'name',
          field_label: 'Nom complet',
          field_type: 'text',
          field_placeholder: 'Votre nom complet',
          is_required: true,
          options: []
        },
        {
          id: 2,
          field_name: 'email',
          field_label: 'Adresse email',
          field_type: 'email',
          field_placeholder: 'votre@email.com',
          is_required: true,
          options: []
        },
        {
          id: 3,
          field_name: 'subject',
          field_label: 'Sujet',
          field_type: 'text',
          field_placeholder: 'Objet de votre message',
          is_required: true,
          options: []
        },
        {
          id: 4,
          field_name: 'message',
          field_label: 'Message',
          field_type: 'textarea',
          field_placeholder: 'Votre message...',
          is_required: true,
          options: []
        }
      ];
      
      setFields(fallbackFields);
      
      // Initialiser les données du formulaire avec les champs fallback
      const initialData: Record<string, any> = {};
      fallbackFields.forEach((field: ContactField) => {
        if (field.field_type === 'checkbox') {
          initialData[field.field_name] = false;
        } else {
          initialData[field.field_name] = '';
        }
      });
      setFormData(initialData);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateField = (field: ContactField, value: any): boolean => {
    // Validation de base pour les champs requis
    if (field.is_required && (!value || (typeof value === 'string' && !value.trim()))) {
      return false;
    }
    
    // Validation par type
    switch (field.field_type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || emailRegex.test(value);
      case 'phone':
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return !value || phoneRegex.test(value);
      case 'url':
        try {
          return !value || new URL(value).href;
        } catch {
          return false;
        }
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    const errors: string[] = [];
    fields.forEach(field => {
      if (!validateField(field, formData[field.field_name])) {
        errors.push(`Le champ "${field.field_label}" est invalide ou requis`);
      }
    });
    
    if (errors.length > 0) {
      toast({
        title: "Erreur de validation",
        description: errors.join(", "),
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Appeler la fonction onSubmit si fournie, sinon afficher un message de succès
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simulation d'envoi
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Message envoyé !",
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        
        // Réinitialiser le formulaire
        const resetData: Record<string, any> = {};
        fields.forEach(field => {
          if (field.field_type === 'checkbox') {
            resetData[field.field_name] = false;
          } else {
            resetData[field.field_name] = '';
          }
        });
        setFormData(resetData);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: ContactField) => {
    const value = formData[field.field_name] || '';
    const isInvalid = !validateField(field, value);

    switch (field.field_type) {
      case 'textarea':
        return (
          <Textarea
            id={field.field_name}
            name={field.field_name}
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={field.field_placeholder}
            required={field.is_required}
            className={isInvalid ? 'border-red-500' : ''}
            rows={4}
          />
        );
      
      case 'select':
        const options = Array.isArray(field.options) ? field.options : 
                       typeof field.options === 'string' ? field.options.split(',').map(o => o.trim()) : [];
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.field_name, val)}>
            <SelectTrigger className={isInvalid ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.field_placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.field_name}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.field_name, checked)}
              required={field.is_required}
            />
            <Label htmlFor={field.field_name} className="text-sm font-normal">
              {field.field_label}
            </Label>
          </div>
        );
      
      case 'radio':
        const radioOptions = Array.isArray(field.options) ? field.options : 
                           typeof field.options === 'string' ? field.options.split(',').map(o => o.trim()) : [];
        return (
          <div className="space-y-2">
            {radioOptions.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.field_name}_${index}`}
                  name={field.field_name}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.field_name, e.target.value)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`${field.field_name}_${index}`} className="text-sm font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      default: // text, email, phone, number, url, date
        return (
          <Input
            id={field.field_name}
            name={field.field_name}
            type={field.field_type === 'text' ? 'text' : field.field_type}
            value={value}
            onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            placeholder={field.field_placeholder}
            required={field.is_required}
            className={isInvalid ? 'border-red-500' : ''}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          {field.field_type !== 'checkbox' && (
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}
          {renderField(field)}
        </div>
      ))}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={submitting}
      >
        {submitting ? "Envoi en cours..." : "Envoyer le Message"}
      </Button>
    </form>
  );
};

export default ContactFormDynamic;
