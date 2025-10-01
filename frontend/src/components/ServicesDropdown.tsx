import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, BookOpen, TrendingUp, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServicesDropdownProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

const ServicesDropdown = ({ isMobile = false, onItemClick }: ServicesDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const location = useLocation();
  
  // Vérifier si on est sur une page Services
  const isServicesActive = location.pathname.startsWith('/services');

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Ouvrir automatiquement le dropdown sur mobile si on est sur une page Services
  useEffect(() => {
    if (isMobile && isServicesActive) {
      setIsOpen(true);
    }
  }, [isMobile, isServicesActive]);

  // Gérer la navigation clavier
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isMobile) {
        setIsOpen(!isOpen);
      } else {
        // Sur desktop, ouvrir le dropdown au focus
        setIsOpen(true);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
    setIsFocused(false);
    onItemClick?.();
  };

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsOpen(true);
      // Annuler tout timeout en cours
      if (dropdownRef.current) {
        clearTimeout((dropdownRef.current as any).closeTimeout);
      }
    }
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (!isMobile) {
      // Attendre un peu avant de fermer pour permettre la navigation
      const timeoutId = setTimeout(() => {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect();
          const { clientX, clientY } = event;
          const { left, right, top, bottom } = rect;
          
          // Si la souris est vraiment en dehors du composant, fermer le dropdown
          if (clientX < left || clientX > right || clientY < top || clientY > bottom) {
            setIsOpen(false);
          }
        }
      }, 150);
      
      // Stocker le timeout pour pouvoir l'annuler
      if (dropdownRef.current) {
        (dropdownRef.current as any).closeTimeout = timeoutId;
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!isMobile) {
      setIsOpen(true);
    }
  };

  const handleBlur = (event: React.FocusEvent) => {
    // Ne pas fermer si le focus va vers un élément du dropdown
    if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
      setIsFocused(false);
      if (!isMobile) {
        setIsOpen(false);
      }
    }
  };

  const servicesItems = [
    {
      to: "/services/formations",
      label: t('nav.formations'),
      icon: BookOpen,
      description: "Apprenez le trading"
    },
    {
      to: "/services/signaux",
      label: t('nav.signaux'),
      icon: TrendingUp,
      description: "Signaux en temps réel"
    },
    {
      to: "/services/gestion",
      label: t('nav.gestion'),
      icon: Target,
      description: "Gestion de comptes"
    }
  ];

  if (isMobile) {
    return (
      <div className="w-full">
        {/* Bouton principal pour mobile */}
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-2">
            <Link
              to="/services"
              className={`relative text-foreground hover:text-primary transition-colors pb-1 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-[2px] after:w-full after:bg-[#D4AF37] after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                isServicesActive ? 'after:scale-x-100' : ''
              }`}
              onClick={handleItemClick}
            >
              {t('nav.services')}
            </Link>
            <button
              className="p-1 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              onKeyDown={handleKeyDown}
              aria-expanded={isOpen}
              aria-haspopup="true"
              aria-label="Développer le menu Services"
            >
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Sous-menu mobile */}
        {isOpen && (
          <div className="flex flex-col items-center mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {servicesItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block text-foreground hover:text-primary transition-colors pb-1"
                onClick={handleItemClick}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Bouton principal pour desktop */}
      <div className="relative">
        <Link
          to="/services"
          className={`relative inline-block text-foreground hover:text-primary transition-colors pb-1 after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-[2px] after:w-full after:bg-[#D4AF37] after:origin-center after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
            isServicesActive ? 'after:scale-x-100' : ''
          }`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {t('nav.services')}
        </Link>
        <ChevronDown 
          className={`absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {/* Dropdown desktop */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-3 w-64 bg-background border border-border rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200"
          onMouseEnter={() => {
            setIsOpen(true);
          }}
          onMouseLeave={(e) => {
            // Ne pas fermer immédiatement, laisser le timeout gérer
            e.stopPropagation();
          }}
        >
          <div className="p-2">
            {/* Sous-services seulement */}
            {servicesItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors group"
                onClick={handleItemClick}
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesDropdown;
