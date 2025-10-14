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
import opticalManual from "@/assets/metrology/optical-manual.jpg";
import olympusMicroscope from "@/assets/metrology/olympus-microscope.png";
import hardnessVickers from "@/assets/metrology/hardness-vickers.png";
import labOverview from "@/assets/metrology/lab-overview.png";
import polimento from "@/assets/metrology/polimento.png";
import cortadora from "@/assets/metrology/cortadora.png";
import embutidora from "@/assets/metrology/embutidora.png";
import { useState, useEffect } from "react";
import { DNA3D } from "@/components/3d/DNA3D";
import { MedicalGlobe } from "@/components/3d/MedicalGlobe";
import { EquipmentCarousel } from "@/components/EquipmentCarousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useParallax, useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useStaggerAnimation } from "@/hooks/useStaggerAnimation";
import { StatCard } from "@/components/StatCard";
import { ManufacturingTimeline } from "@/components/ManufacturingTimeline";
import { InteractiveCapabilities } from "@/components/InteractiveCapabilities";
import { MagneticButton } from "@/components/MagneticButton";
import { BlobBackground } from "@/components/BlobBackground";
import { ClientCarousel } from "@/components/ClientCarousel";
import vincula from "@/assets/clients/vincula.png";
import techimport from "@/assets/clients/techimport.png";
import traumec from "@/assets/clients/traumec.png";
import ultradent from "@/assets/clients/ultradent.png";
import toride from "@/assets/clients/toride.png";
import react from "@/assets/clients/react.png";
import razek from "@/assets/clients/razek.png";
import russer from "@/assets/clients/russer.png";
import ossea from "@/assets/clients/ossea.jpg";
import orthometric from "@/assets/clients/orthometric.png";
import cpmh from "@/assets/clients/cpmh.png";
import evolve from "@/assets/clients/evolve.png";
import fgm from "@/assets/clients/fgm.png";
import iol from "@/assets/clients/iol.png";
import implanfix from "@/assets/clients/implanfix.png";
import impol from "@/assets/clients/impol.png";
import hcs from "@/assets/clients/hcs.png";
import gmi from "@/assets/clients/gmi.png";
import plenum from "@/assets/clients/plenum.png";
import medens from "@/assets/clients/medens.png";
import neoortho from "@/assets/clients/neoortho.jpg";
import oblDental from "@/assets/clients/obl-dental.jpg";
import orthometric2 from "@/assets/clients/orthometric-2.png";
const heroImages = [reception, cleanroom, exterior, medicalScrew];
export default function Home() {
  const {
    t
  } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const parallaxOffset = useParallax(0.4);
  
  const benefitsAnimation = useScrollAnimation();
  const clientsAnimation = useScrollAnimation();
  const productsAnimation = useScrollAnimation();
  const capabilitiesAnimation = useScrollAnimation();
  const benefitsStagger = useStaggerAnimation(3, { staggerDelay: 150 });

  const clientLogos = [
    { src: vincula, alt: "Vincula - Medical device manufacturer client" },
    { src: techimport, alt: "TechImport - Medical technology client" },
    { src: traumec, alt: "Traumec Health Technology - Medical equipment client" },
    { src: ultradent, alt: "Ultradent Products - Dental device manufacturer" },
    { src: toride, alt: "Toride - Medical manufacturing client" },
    { src: react, alt: "React - Creation in health medical technology" },
    { src: razek, alt: "Razek - Medical device solutions client" },
    { src: russer, alt: "Russer - Medical equipment manufacturer" },
    { src: ossea, alt: "Óssea Medical Technology - Orthopedic implant manufacturer" },
    { src: orthometric, alt: "Orthometric - Orthopedic solutions provider" },
    { src: cpmh, alt: "CPMH - Medical device solutions" },
    { src: evolve, alt: "Evolve - Medical technology innovation" },
    { src: fgm, alt: "FGM Dental Group - Dental device manufacturer" },
    { src: iol, alt: "IOL Implantes Ortopédicos - Orthopedic implant manufacturer" },
    { src: implanfix, alt: "Implanfix - Surgical materials provider" },
    { src: impol, alt: "Impol - Medical instruments manufacturer" },
    { src: hcs, alt: "HCS - Healthcare solutions provider" },
    { src: gmi, alt: "GMI - Global medical innovation" },
    { src: plenum, alt: "Plenum - Medical device technology" },
    { src: medens, alt: "Medens - Medical device manufacturer" },
    { src: neoortho, alt: "Neoortho - Orthopedic solutions" },
    { src: oblDental, alt: "OBL Dental - Dental device manufacturer" },
    { src: orthometric2, alt: "Orthometric - Medical orthopedic systems" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return <div className="min-h-screen">
      {/* Hero Section with Slideshow and Parallax */}
      <section className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
        {heroImages.map((image, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}
          >
            <div className="w-full h-full" style={{ transform: `translate3d(0, ${parallaxOffset}px, 0)`, willChange: 'transform' }}>
              <img 
                src={image} 
                alt={`Lifetrek Medical - ${index === 0 ? 'ISO 7 cleanroom facility' : index === 1 ? 'Cleanroom manufacturing' : index === 2 ? 'Medical facility exterior' : 'Precision medical components'}`} 
                className="w-full h-full object-cover" 
                loading={index === 0 ? "eager" : "lazy"} 
                width="1920" 
                height="600"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
            {/* Beautiful Blue Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-blue-500/20 to-transparent mix-blend-overlay" />
          </div>
        ))}
        
        <div className="relative container mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="max-w-2xl text-primary-foreground z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in leading-tight">
              {t("home.hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 animate-fade-in" style={{
              animationDelay: "0.2s"
            }}>
              {t("home.hero.subtitle")}
            </p>
            <Link to="/about">
              <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <MagneticButton size="lg" variant="secondary" className="shadow-xl">
                  {t("home.hero.cta")}
                </MagneticButton>
              </div>
            </Link>
          </div>
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentImageIndex(index)} 
              className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex ? "bg-primary-foreground w-8" : "bg-primary-foreground/40 hover:bg-primary-foreground/60"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Statistics Section - Moved from hero */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass-card-strong p-8 rounded-xl text-center transform transition-all duration-700 hover:scale-105">
              <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-pulse-glow">
                30+
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">
                {t("home.stats.experience")}
              </div>
            </div>
            
            <div className="glass-card-strong p-8 rounded-xl text-center transform transition-all duration-700 hover:scale-105" style={{ animationDelay: "200ms" }}>
              <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-accent to-accent-orange bg-clip-text text-transparent animate-pulse-glow">
                30+
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">
                {t("home.stats.partners")}
              </div>
            </div>
            
            <div className="glass-card-strong p-8 rounded-xl text-center transform transition-all duration-700 hover:scale-105" style={{ animationDelay: "400ms" }}>
              <div className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-accent-orange to-primary bg-clip-text text-transparent animate-pulse-glow">
                100%
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">
                {t("home.stats.certified")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Clients Section with Carousel */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-600/5 via-blue-500/10 to-background relative overflow-hidden">
        {/* Blue accent decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div 
            ref={clientsAnimation.elementRef}
            className={`text-center mb-12 sm:mb-16 scroll-reveal ${clientsAnimation.isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("home.clients.title")}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-blue-500 to-accent-orange mx-auto mb-4 animate-float"></div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("home.clients.subtitle")}
            </p>
          </div>
          
          <ClientCarousel clients={clientLogos} />
          
          <div className="text-center mt-10">
            <Link to="/clients">
              <MagneticButton variant="outline" size="lg">
                {t("home.clients.cta")}
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-secondary/20 to-secondary/30 relative overflow-hidden">
        <BlobBackground />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div 
            ref={benefitsAnimation.elementRef}
            className={`text-center mb-12 sm:mb-16 scroll-reveal ${benefitsAnimation.isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("home.whyChoose.title")}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("home.whyChoose.subtitle")}
            </p>
          </div>
          <div ref={benefitsStagger.containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className={`glass-card text-center p-10 rounded-2xl hover:scale-105 transition-all duration-500 border-t-4 border-primary group stagger-item ${benefitsStagger.visibleItems[0] ? 'visible' : ''}`}>
              <div className="absolute top-0 left-10 w-12 h-1 bg-gradient-to-r from-primary to-transparent animate-pulse-glow"></div>
              <h3 className="text-xl font-semibold mb-3 mt-4 group-hover:text-primary transition-colors">{t("home.benefits.speed")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("home.benefits.speed.text")}</p>
            </div>

            <div className={`glass-card text-center p-10 rounded-2xl hover:scale-105 transition-all duration-500 border-t-4 border-accent group stagger-item ${benefitsStagger.visibleItems[1] ? 'visible' : ''}`}>
              <div className="absolute top-0 left-10 w-12 h-1 bg-gradient-to-r from-accent to-transparent animate-pulse-glow"></div>
              <h3 className="text-xl font-semibold mb-3 mt-4 group-hover:text-accent transition-colors">{t("home.benefits.compliance")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("home.benefits.compliance.text")}</p>
            </div>

            <div className={`glass-card text-center p-10 rounded-2xl hover:scale-105 transition-all duration-500 border-t-4 border-accent-orange group stagger-item ${benefitsStagger.visibleItems[2] ? 'visible' : ''}`}>
              <div className="absolute top-0 left-10 w-12 h-1 bg-gradient-to-r from-accent-orange to-transparent animate-pulse-glow"></div>
              <h3 className="text-xl font-semibold mb-3 mt-4 group-hover:text-accent-orange transition-colors">{t("home.benefits.precision")}</h3>
              <p className="text-muted-foreground leading-relaxed">{t("home.benefits.precision.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div 
            ref={productsAnimation.elementRef}
            className={`text-center mb-12 sm:mb-16 scroll-reveal ${productsAnimation.isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("products.title")}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent to-accent-orange mx-auto animate-float"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto mb-12 sm:mb-16">
            <div className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-primary/20 transition-all hover:-translate-y-2">
              <img src={medicalScrew} alt="Precision medical implant screws manufactured with Swiss CNC technology" className="w-full h-64 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" width="400" height="320" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent flex items-end p-8">
                <h3 className="text-xl font-bold text-primary-foreground group-hover:scale-105 transition-transform">{t("products.instruments.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-accent/20 transition-all hover:-translate-y-2">
              <img src={medicalImplantsDiagram} alt="Medical orthopedic implants and surgical instruments product range" className="w-full h-64 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" width="400" height="320" />
              <div className="absolute inset-0 bg-gradient-to-t from-accent via-accent/70 to-transparent flex items-end p-8">
                <h3 className="text-xl font-bold text-primary-foreground group-hover:scale-105 transition-transform">{t("products.medical.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-accent-orange/20 transition-all hover:-translate-y-2">
              <img src={dentalImplantsDiagram} alt="Dental implants and prosthetic components for dental applications" className="w-full h-64 sm:h-80 object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" width="400" height="320" />
              <div className="absolute inset-0 bg-gradient-to-t from-accent-orange via-accent-orange/70 to-transparent flex items-end p-8">
                <h3 className="text-xl font-bold text-primary-foreground group-hover:scale-105 transition-transform">{t("products.dental.title")}</h3>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/products">
              <Button size="lg" className="hover:scale-105 transition-transform shadow-xl">
                {t("nav.products")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Equipment Carousel Section */}
      <EquipmentCarousel />

      {/* Capabilities Preview Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-600/5 via-background to-blue-500/5 relative overflow-hidden">
        {/* Blue accent decorations */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div 
            ref={capabilitiesAnimation.elementRef}
            className={`text-center mb-12 sm:mb-16 scroll-reveal ${capabilitiesAnimation.isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("home.capabilities.title")}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-primary to-accent mx-auto mb-4 animate-float"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("home.capabilities.subtitle")}
            </p>
          </div>

          <div className="mb-12 max-w-5xl mx-auto">
            <DNA3D />
          </div>

          {/* Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="glass-card-strong p-8 rounded-2xl text-center border-l-4 border-blue-500 hover:scale-105 transition-all duration-500 group">
              <div className="mb-6 flex justify-center">
                <img src={isoLogo} alt="ISO 13485:2016 certification for medical device quality management" className="h-20 sm:h-24 object-contain group-hover:scale-110 transition-transform" loading="lazy" width="160" height="96" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t("home.capabilities.iso.title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.capabilities.iso.text")}
              </p>
            </div>

            <div className="glass-card-strong p-8 rounded-2xl text-center border-l-4 border-blue-600 hover:scale-105 transition-all duration-500 group">
              <div className="mb-6 flex justify-center">
                <img src={anvisaLogo} alt="ANVISA Brazilian Health Regulatory Agency certification" className="h-20 sm:h-24 object-contain group-hover:scale-110 transition-transform" loading="lazy" width="160" height="96" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t("home.capabilities.anvisa.title")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.capabilities.anvisa.text")}
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/capabilities">
              <MagneticButton size="lg" className="shadow-xl">
                {t("home.capabilities.cta")}
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Capabilities Section */}
      <InteractiveCapabilities />

      {/* Manufacturing Timeline */}
      <ManufacturingTimeline />

      {/* Final CTA Section with 3D Globe */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-primary via-primary-hover to-accent text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent-orange rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div className="text-center lg:text-left">
              <div className="w-24 h-1 bg-gradient-to-r from-accent-orange via-primary-foreground to-accent mb-6 mx-auto lg:mx-0"></div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                {t("home.finalCta.title")}
              </h2>
              <p className="text-lg sm:text-xl mb-8 opacity-95">
                {t("home.finalCta.subtitle")}
              </p>
              <Link to="/contact">
                <MagneticButton size="lg" variant="secondary" className="shadow-xl" strength={30}>
                  {t("home.finalCta.button")}
                </MagneticButton>
              </Link>
            </div>
            <div className="hidden lg:block">
              <MedicalGlobe />
            </div>
          </div>
        </div>
      </section>
    </div>;
}