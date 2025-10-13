import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import reception from "@/assets/facility/reception.jpg";
import receptionHero from "@/assets/facility/reception-hero.png";
import cleanroom from "@/assets/facility/cleanroom.jpg";
import exterior from "@/assets/facility/exterior.jpg";
import medicalScrew from "@/assets/products/medical-screw.png";
import medicalImplantsDiagram from "@/assets/products/medical-implants-diagram.png";
import dentalImplantsDiagram from "@/assets/products/dental-implants-diagram.png";
import isoLogo from "@/assets/certifications/iso.jpg";
import anvisaLogo from "@/assets/certifications/anvisa.png";
import zeissContura from "@/assets/metrology/zeiss-contura.png";
import opticalCnc from "@/assets/metrology/optical-cnc.png";
import olympusMicroscope from "@/assets/metrology/olympus-microscope.png";
import { useState, useEffect } from "react";
import { RotatingImplant } from "@/components/3d/RotatingImplant";
import { FloatingParts } from "@/components/3d/FloatingParts";
import { DNA3D } from "@/components/3d/DNA3D";
import { MedicalGlobe } from "@/components/3d/MedicalGlobe";
import { ScrollScrews } from "@/components/3d/ScrollScrews";

const heroImages = [reception, cleanroom, exterior, medicalScrew];

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

      {/* Reception & 3D Animation Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div>
              <img
                src={receptionHero}
                alt="Lifetrek Medical Reception"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Precision Medical Manufacturing
              </h2>
              <RotatingImplant />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow border-t-4 border-primary">
              <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-primary to-transparent"></div>
              <h3 className="text-xl font-semibold mb-2 mt-4">{t("about.values.excellence")}</h3>
              <p className="text-muted-foreground">{t("about.values.excellence.text")}</p>
            </div>

            <div className="relative text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow border-t-4 border-accent">
              <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-accent to-transparent"></div>
              <h3 className="text-xl font-semibold mb-2 mt-4">{t("whatWeDo.precision")}</h3>
              <p className="text-muted-foreground">{t("whatWeDo.cleanroom")}</p>
            </div>

            <div className="relative text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow border-t-4 border-accent-orange">
              <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-accent-orange to-transparent"></div>
              <h3 className="text-xl font-semibold mb-2 mt-4">{t("about.values.respect")}</h3>
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
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Preview Section with 3D Animation */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("products.title")}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent to-accent-orange mx-auto"></div>
          </div>

          <div className="mb-12 max-w-6xl mx-auto relative">
            <ScrollScrews />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img
                src={medicalScrew}
                alt="Medical Implants"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{t("products.instruments.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img
                src={medicalImplantsDiagram}
                alt="Medical Implants"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{t("products.medical.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img
                src={dentalImplantsDiagram}
                alt="Dental Products"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{t("products.dental.title")}</h3>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/products">
              <Button size="lg">
                {t("nav.products")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quality Preview Section with 3D Animation */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("quality.title")}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-accent to-primary mx-auto mb-4"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("quality.intro")}
            </p>
          </div>

          <div className="mb-12 max-w-5xl mx-auto">
            <DNA3D />
          </div>

          {/* Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-16">
            <div className="relative bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-primary">
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

            <div className="relative bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-accent">
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

          {/* Equipment Preview */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">Advanced Metrology Equipment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={zeissContura}
                  alt="ZEISS Contura"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold mb-2">ZEISS Contura G2</h4>
                  <p className="text-sm text-muted-foreground">3D Coordinate Measuring Machine</p>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={opticalCnc}
                  alt="Optical CNC"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold mb-2">Optical Comparator CNC</h4>
                  <p className="text-sm text-muted-foreground">Precision Measurement System</p>
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={olympusMicroscope}
                  alt="Olympus Microscope"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-bold mb-2">Olympus Microscope</h4>
                  <p className="text-sm text-muted-foreground">Metallographic Analysis</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/quality">
              <Button size="lg">
                {t("nav.quality")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section with 3D Globe */}
      <section className="relative py-20 bg-gradient-to-br from-primary via-primary-hover to-accent text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="text-center lg:text-left">
              <div className="w-24 h-1 bg-gradient-to-r from-accent-orange via-primary-foreground to-accent mb-6 mx-auto lg:mx-0"></div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t("about.mission.text")}
              </h2>
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="shadow-xl">
                  {t("nav.contact")}
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block">
              <MedicalGlobe />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
