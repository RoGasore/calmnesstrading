import { Button } from "@/components/ui/button";
import { TrendingUp, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { Link, NavLink } from "react-router-dom";
import UserMenu from "./UserMenu";
import ServicesDropdown from "./ServicesDropdown";
import { EditableText } from "@/components/cms/EditableText";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, fetchWithAuth } = useAuth();
  const { refreshTrigger } = useEditMode();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('https://calmnesstrading.onrender.com/api/content/cms/pages/public/header/');
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching header sections:', error);
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

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  return (
    <>
      {/* Overlay pour rendre le fond invisible quand le menu mobile est ouvert */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-90 transition-opacity duration-300"
          style={{ pointerEvents: 'auto' }}
        />
      )}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <EditableText
              value={getSectionContent('header_logo', 'CALMNESS FI')}
              sectionId={getSectionId('header_logo', 100)}
              fieldName="content"
              className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                after:content-[\"\"] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 
                after:h-[2px] after:w-full after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  isActive ? "after:scale-x-100" : ""
                }`
              }
              end
            >
              <EditableText
                value={getSectionContent('nav_home', t('nav.home'))}
                sectionId={getSectionId('nav_home', 101)}
                fieldName="content"
                className="inline"
              />
            </NavLink>
            
            {/* Services Dropdown avec espacement */}
            <div className="mx-4">
              <ServicesDropdown />
            </div>
            
            <NavLink
              to="/reviews"
              className={({ isActive }) =>
                `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                after:content-[\"\"] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 
                after:h-[2px] after:w-full after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  isActive ? "after:scale-x-100" : ""
                }`
              }
            >
              <EditableText
                value={getSectionContent('nav_reviews', t('nav.reviews'))}
                sectionId={getSectionId('nav_reviews', 102)}
                fieldName="content"
                className="inline"
              />
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                after:content-[\"\"] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 
                after:h-[2px] after:w-full after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  isActive ? "after:scale-x-100" : ""
                }`
              }
            >
              <EditableText
                value={getSectionContent('nav_faq', t('nav.faq'))}
                sectionId={getSectionId('nav_faq', 103)}
                fieldName="content"
                className="inline"
              />
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                after:content-[\"\"] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 
                after:h-[2px] after:w-full after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                  isActive ? "after:scale-x-100" : ""
                }`
              }
            >
              <EditableText
                value={getSectionContent('nav_contact', t('nav.contact'))}
                sectionId={getSectionId('nav_contact', 104)}
                fieldName="content"
                className="inline"
              />
            </NavLink>
          </nav>

          {/* Desktop Controls & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="relative"
            >
              <Globe className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 text-xs font-bold text-primary">
                {language.toUpperCase()}
              </span>
            </Button>

            {!isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">
                    <EditableText
                      value={getSectionContent('nav_connexion', t('nav.connexion'))}
                      sectionId={getSectionId('nav_connexion', 105)}
                      fieldName="content"
                      className="inline"
                    />
                  </Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/register">
                    <EditableText
                      value={getSectionContent('nav_commencer', t('nav.commencer'))}
                      sectionId={getSectionId('nav_commencer', 106)}
                      fieldName="content"
                      className="inline"
                    />
                  </Link>
                </Button>
              </>
            ) : (
              <UserMenu />
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 z-50 bg-background border-b border-border shadow-lg">
            <nav className="flex flex-col items-center space-y-4 p-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                  after:content-[\"\"] after:absolute after:left-0 after:right-0 after:bottom-0 
                  after:h-[2px] after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                  after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    isActive ? "after:scale-x-100" : ""
                  }`
                }
                end
                onClick={() => setIsMenuOpen(false)}
              >
                <EditableText
                  value={getSectionContent('nav_home', t('nav.home'))}
                  sectionId={getSectionId('nav_home', 101)}
                  fieldName="content"
                  className="inline"
                />
              </NavLink>
              
              {/* Services Dropdown Mobile */}
              <ServicesDropdown 
                isMobile={true} 
                onItemClick={() => setIsMenuOpen(false)}
              />
              
              <NavLink
                to="/reviews"
                className={({ isActive }) =>
                  `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                  after:content-[\"\"] after:absolute after:left-0 after:right-0 after:bottom-0 
                  after:h-[2px] after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                  after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    isActive ? "after:scale-x-100" : ""
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <EditableText
                  value={getSectionContent('nav_reviews', t('nav.reviews'))}
                  sectionId={getSectionId('nav_reviews', 102)}
                  fieldName="content"
                  className="inline"
                />
              </NavLink>
              <NavLink
                to="/faq"
                className={({ isActive }) =>
                  `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                  after:content-[\"\"] after:absolute after:left-0 after:right-0 after:bottom-0 
                  after:h-[2px] after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                  after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    isActive ? "after:scale-x-100" : ""
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <EditableText
                  value={getSectionContent('nav_faq', t('nav.faq'))}
                  sectionId={getSectionId('nav_faq', 103)}
                  fieldName="content"
                  className="inline"
                />
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `relative inline-block text-foreground hover:text-primary transition-colors pb-1 
                  after:content-[\"\"] after:absolute after:left-0 after:right-0 after:bottom-0 
                  after:h-[2px] after:bg-[#D4AF37] after:origin-center after:scale-x-0 
                  after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    isActive ? "after:scale-x-100" : ""
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <EditableText
                  value={getSectionContent('nav_contact', t('nav.contact'))}
                  sectionId={getSectionId('nav_contact', 104)}
                  fieldName="content"
                  className="inline"
                />
              </NavLink>
              
              {/* Mobile Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                  >
                    {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLanguage}
                    aria-label="Toggle language"
                    className="relative"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 text-xs font-bold text-primary">
                      {language.toUpperCase()}
                    </span>
                  </Button>
                </div>
              </div>
              
              {!isAuthenticated ? (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/login">
                      <EditableText
                        value={getSectionContent('nav_connexion', t('nav.connexion'))}
                        sectionId={getSectionId('nav_connexion', 105)}
                        fieldName="content"
                        className="inline"
                      />
                    </Link>
                  </Button>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/register">
                      <EditableText
                        value={getSectionContent('nav_commencer', t('nav.commencer'))}
                        sectionId={getSectionId('nav_commencer', 106)}
                        fieldName="content"
                        className="inline"
                      />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="pt-2">
                  <UserMenu />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
      </header>
    </>
  );
};

export default Header;