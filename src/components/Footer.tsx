import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo-optimized.webp";
import isoLogo from "@/assets/certifications/iso.webp";
import anvisaLogo from "@/assets/certifications/anvisa.webp";
export const Footer = () => {
  const {
    t
  } = useLanguage();
  return <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <img src={logo} alt="Lifetrek Medical logo" className="h-10 sm:h-12 mb-4" width="120" height="48" loading="lazy" />
            <p className="text-sm text-muted-foreground">
              {t("home.hero.subtitle")}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-foreground">{t("nav.contact")}</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <a href="mailto:contato@lifetrek-medical.com" className="hover:text-primary transition-colors block">
                  contato@lifetrek-medical.com
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
            <h3 className="font-bold mb-4 text-foreground">{t("footer.certifications")}</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-card/50 p-3 rounded-lg border border-border/50">
                <img src={isoLogo} alt="ISO 13485:2016 Medical Device Quality Management certification" className="h-12 w-auto object-contain" loading="lazy" width="80" height="48" />
                <span className="text-sm font-medium text-foreground">ISO 13485:2016</span>
              </div>
              
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lifetrek Medical. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>;
};