import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/about", label: t("nav.about") },
    { path: "/what-we-do", label: t("nav.whatWeDo") },
    { path: "/products", label: t("nav.products") },
    { path: "/capabilities", label: t("nav.infrastructure") },
    { path: "/clients", label: t("nav.clients") },
    { path: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center flex-shrink-0">
          <img 
            src={logo} 
            alt="Lifetrek Medical - ISO 13485 Certified Medical Device Manufacturer" 
            className="h-10 sm:h-12"
            width="120"
            height="48"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === item.path
                  ? "text-primary"
                  : "text-foreground/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                language === "pt"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              🇧🇷 PT
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
