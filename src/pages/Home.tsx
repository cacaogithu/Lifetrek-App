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
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return <div className="min-h-screen">
      {/* Hero Section with Slideshow */}
      <section className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
        {heroImages.map((image, index) => <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}>
            <img src={image} alt={`Lifetrek Medical - ${index === 0 ? 'ISO 7 cleanroom facility' : index === 1 ? 'Cleanroom manufacturing' : index === 2 ? 'Medical facility exterior' : 'Precision medical components'}`} className="w-full h-full object-cover" loading={index === 0 ? "eager" : "lazy"} width="1920" height="600" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
          </div>)}
        
        <div className="relative container mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in leading-tight">
              {t("home.hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              {t("home.hero.subtitle")}
            </p>
            <Link to="/about">
              <Button size="lg" variant="secondary" className="animate-fade-in" style={{
              animationDelay: "0.4s"
            }}>
                {t("home.hero.cta")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex ? "bg-primary-foreground w-8" : "bg-primary-foreground/40"}`} />)}
        </div>
      </section>

      {/* Reception Image Section */}
      

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Why Leading Medical Device Companies Choose Lifetrek</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Eliminate supplier risks and accelerate your product development timeline
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow border-t-4 border-primary">
              <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-primary to-transparent"></div>
              <h3 className="text-xl font-semibold mb-2 mt-4">{t("home.benefits.speed")}</h3>
              <p className="text-muted-foreground">{t("home.benefits.speed.text")}</p>
            </div>

            <div className="relative text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow border-t-4 border-accent">
              <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-accent to-transparent"></div>
              <h3 className="text-xl font-semibold mb-2 mt-4">{t("home.benefits.compliance")}</h3>
              <p className="text-muted-foreground">{t("home.benefits.compliance.text")}</p>
            </div>

            <div className="relative text-center p-8 rounded-lg bg-card hover:shadow-lg transition-shadow border-t-4 border-accent-orange">
              <div className="absolute top-0 left-8 w-12 h-1 bg-gradient-to-r from-accent-orange to-transparent"></div>
              <h3 className="text-xl font-semibold mb-2 mt-4">{t("home.benefits.precision")}</h3>
              <p className="text-muted-foreground">{t("home.benefits.precision.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Who We Serve</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Trusted by leading medical device manufacturers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-primary">
              <h3 className="text-xl font-bold mb-4">{t("clients.types.medical.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("clients.types.medical.description")}
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-accent">
              <h3 className="text-xl font-bold mb-4">{t("clients.types.dental.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("clients.types.dental.description")}
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-accent-orange">
              <h3 className="text-xl font-bold mb-4">{t("clients.types.contract.title")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t("clients.types.contract.description")}
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/clients">
              <Button variant="outline">
                See All Industries We Serve
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Clients Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Trusted by Leading Medical Device Companies</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent to-accent-orange mx-auto mb-4"></div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Partnering with innovative companies to deliver precision medical components worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 max-w-6xl mx-auto items-center">
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={vincula} alt="Vincula - Medical device manufacturer client" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={techimport} alt="TechImport - Medical technology client" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={traumec} alt="Traumec Health Technology - Medical equipment client" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={ultradent} alt="Ultradent Products - Dental device manufacturer" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={toride} alt="Toride - Medical manufacturing client" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={react} alt="React - Creation in health medical technology" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={razek} alt="Razek - Medical device solutions client" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={russer} alt="Russer - Medical equipment manufacturer" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={ossea} alt="Óssea Medical Technology - Orthopedic implant manufacturer" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={orthometric} alt="Orthometric - Orthopedic solutions provider" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={cpmh} alt="CPMH - Medical device solutions" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={evolve} alt="Evolve - Medical technology innovation" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={fgm} alt="FGM Dental Group - Dental device manufacturer" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={iol} alt="IOL Implantes Ortopédicos - Orthopedic implant manufacturer" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={implanfix} alt="Implanfix - Surgical materials provider" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={impol} alt="Impol Ortopedia e Traumatologia - Orthopedic solutions" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={hcs} alt="HCS Health Care Solutions - Medical equipment provider" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={gmi} alt="Gabisa Medical International - Global medical solutions" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={plenum} alt="Plenum Bioengenharia - Bioengineering solutions" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={medens} alt="Medens - Medical device manufacturer" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={neoortho} alt="Neoortho - Orthopedic device solutions" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={oblDental} alt="OBL Dental - Dental equipment provider" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
            <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <img src={orthometric2} alt="Orthometric - Medical solutions partner" className="max-h-16 w-auto object-contain" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Carousel Section */}
      <EquipmentCarousel />

      {/* Products Preview Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("products.title")}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent to-accent-orange mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img src={medicalScrew} alt="Precision medical implant screws manufactured with Swiss CNC technology" className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width="400" height="320" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{t("products.instruments.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img src={medicalImplantsDiagram} alt="Medical orthopedic implants and surgical instruments product range" className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width="400" height="320" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{t("products.medical.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img src={dentalImplantsDiagram} alt="Dental implants and prosthetic components for dental applications" className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" width="400" height="320" />
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

      {/* Capabilities Preview Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Manufacturing Capabilities</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-accent to-primary mx-auto mb-4"></div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced equipment and certified processes that de-risk your supply chain
            </p>
          </div>

          <div className="mb-12 max-w-5xl mx-auto">
            <DNA3D />
          </div>

          {/* Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="relative bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-primary">
              <div className="mb-4 flex justify-center">
                <img src={isoLogo} alt="ISO 13485:2016 certification for medical device quality management" className="h-20 sm:h-24 object-contain" loading="lazy" width="160" height="96" />
              </div>
              <h3 className="text-lg font-bold">{t("quality.iso")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Medical Device Quality Management
              </p>
            </div>

            <div className="relative bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-accent">
              <div className="mb-4 flex justify-center">
                <img src={anvisaLogo} alt="ANVISA Brazilian Health Regulatory Agency certification" className="h-20 sm:h-24 object-contain" loading="lazy" width="160" height="96" />
              </div>
              <h3 className="text-lg font-bold">{t("quality.anvisa")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Brazilian Health Regulatory Agency
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/capabilities">
              <Button size="lg">
                See All Capabilities
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
                Ready to Accelerate Your Product Development?
              </h2>
              <p className="text-lg sm:text-xl mb-8 opacity-95">
                Partner with a manufacturer that understands the regulatory demands and quality standards of the medical device industry.
              </p>
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="shadow-xl">
                  Get Started Today
                </Button>
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