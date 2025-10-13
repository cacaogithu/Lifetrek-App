import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import reception from "@/assets/facility/reception.jpg";
import cleanroom from "@/assets/facility/cleanroom.jpg";
import exterior from "@/assets/facility/exterior.jpg";
import surgicalInstruments from "@/assets/products/surgical-instruments.jpg";
import productDisplay from "@/assets/products/product-display.png";
import isoLogo from "@/assets/certifications/iso.jpg";
import anvisaLogo from "@/assets/certifications/anvisa.png";
import { useState, useEffect } from "react";

const heroImages = [reception, cleanroom, exterior, surgicalInstruments];

export default function Home() {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slideshow */}
      <section className="relative h-[600px] overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt="Lifetrek Medical Facility"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
          </div>
        ))}
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              {t("home.hero.title")}
            </h1>
            <p className="text-xl mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {t("home.hero.subtitle")}
            </p>
            <Link to="/about">
              <Button size="lg" variant="secondary" className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                {t("home.hero.cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex
                  ? "bg-primary-foreground w-8"
                  : "bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("about.values.excellence")}</h3>
              <p className="text-muted-foreground">{t("about.values.excellence.text")}</p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("whatWeDo.precision")}</h3>
              <p className="text-muted-foreground">{t("whatWeDo.cleanroom")}</p>
            </div>

            <div className="text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-orange/10 mb-4">
                <Users className="h-8 w-8 text-accent-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("about.values.respect")}</h3>
              <p className="text-muted-foreground">{t("about.values.respect.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Preview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("about.intro")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4">{t("about.mission.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.mission.text")}
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4">{t("about.vision.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vision.text")}
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/about">
              <Button variant="outline">
                {t("nav.about")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("products.title")}</h2>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <img
              src={productDisplay}
              alt="Medical Products Overview"
              className="w-full rounded-lg shadow-2xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-3">{t("products.medical.title")}</h3>
              <p className="text-muted-foreground">{t("products.medical.text")}</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-3">{t("products.instruments.title")}</h3>
              <p className="text-muted-foreground">{t("products.instruments.text")}</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-3">{t("products.dental.title")}</h3>
              <p className="text-muted-foreground">{t("products.dental.text")}</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold mb-3">{t("products.veterinary.title")}</h3>
              <p className="text-muted-foreground">{t("products.veterinary.text")}</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/products">
              <Button variant="outline">
                {t("nav.products")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quality Preview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("quality.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("quality.intro")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-8">
            <div className="bg-card p-6 rounded-lg shadow-lg text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src={isoLogo}
                  alt="ISO 13485:2016"
                  className="h-24 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold">{t("quality.iso")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Medical Device Quality Management
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src={anvisaLogo}
                  alt="ANVISA"
                  className="h-24 object-contain"
                />
              </div>
              <h3 className="text-lg font-bold">{t("quality.anvisa")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Brazilian Health Regulatory Agency
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/quality">
              <Button variant="outline">
                {t("nav.quality")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("about.mission.text")}
          </h2>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              {t("nav.contact")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
