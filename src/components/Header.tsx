import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo-optimized.webp";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: "/#top", label: t("nav.home") },
    { path: "/about#top", label: t("nav.about") },
    { path: "/what-we-do#top", label: t("nav.whatWeDo") },
    { path: "/products#top", label: t("nav.products") },
    { path: "/resources#top", label: t("nav.resources") },
    { path: "/capabilities#top", label: t("nav.infrastructure") },
    { path: "/clients#top", label: t("nav.clients") },
    { path: "/contact#top", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-white">
      <nav className="container mx-auto flex h-[80px] items-center justify-between px-8">
        <Link to="/#top" className="flex items-center flex-shrink-0">
          <img 
            src={logo} 
            alt="Lifetrek Medical - ISO 13485 Certified Medical Device Manufacturer" 
            className="h-[64px]"
            style={{ width: '193px', height: '64px' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors hover:text-[#003366] ${
                location.pathname === item.path
                  ? "text-[#003366]"
                  : "text-[#003366]/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-2 bg-[#f5f7fa] rounded-full p-1">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                language === "en"
                  ? "bg-[#003366] text-white"
                  : "text-[#003366]/60 hover:text-[#003366]"
              }`}
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => setLanguage("pt")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                language === "pt"
                  ? "bg-[#003366] text-white"
                  : "text-[#003366]/60 hover:text-[#003366]"
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
        <div className="lg:hidden border-t border-[#e5e7eb] bg-white">
          <div className="container mx-auto px-8 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-[#003366] text-white"
                    : "text-[#003366] hover:bg-[#f5f7fa]"
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
