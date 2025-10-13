import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <img src={logo} alt="Lifetrek Medical" className="h-12 mb-4" />
            <p className="text-sm text-muted-foreground">
              {t("home.hero.subtitle")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("nav.contact")}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@lifetrek-medical.com" className="hover:text-primary transition-colors">
                  contact@lifetrek-medical.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+551939367193" className="hover:text-primary transition-colors">
                  +55 19 3936-7193
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{t("contact.location")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t("quality.certifications")}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>{t("quality.iso")}</div>
              <div>{t("quality.anvisa")}</div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lifetrek Medical. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
