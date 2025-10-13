import { Link } from "react-router-dom";
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
            <h3 className="font-bold mb-4 text-foreground">{t("nav.contact")}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <a href="mailto:contact@lifetrek-medical.com" className="hover:text-primary transition-colors block">
                  contact@lifetrek-medical.com
                </a>
              </div>
              <div>
                <a href="tel:+551939367193" className="hover:text-primary transition-colors block">
                  +55 19 3936-7193
                </a>
              </div>
              <div>
                <span className="block">{t("contact.location")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">{t("quality.certifications")}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="block">{t("quality.iso")}</div>
              <div className="block">{t("quality.anvisa")}</div>
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
