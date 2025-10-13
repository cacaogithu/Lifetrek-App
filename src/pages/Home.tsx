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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
      <section className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image}
              alt={`Lifetrek Medical - ${index === 0 ? 'ISO 7 cleanroom facility' : index === 1 ? 'Cleanroom manufacturing' : index === 2 ? 'Medical facility exterior' : 'Precision medical components'}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
              width="1920"
              height="600"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
          </div>
        ))}
        
        <div className="relative container mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in leading-tight">
              {t("home.hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
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

      {/* Reception Image Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <img
              src={receptionHero}
              alt="Lifetrek Medical modern reception area with professional facilities"
              className="w-full rounded-lg shadow-2xl"
              loading="lazy"
              width="1200"
              height="675"
            />
          </div>
        </div>
      </section>

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

      {/* Products Preview Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("products.title")}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-accent to-accent-orange mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img
                src={medicalScrew}
                alt="Precision medical implant screws manufactured with Swiss CNC technology"
                className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                width="400"
                height="320"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{t("products.instruments.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img
                src={medicalImplantsDiagram}
                alt="Medical orthopedic implants and surgical instruments product range"
                className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                width="400"
                height="320"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex items-end p-6">
                <h3 className="text-xl font-bold text-primary-foreground">{t("products.medical.title")}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all">
              <img
                src={dentalImplantsDiagram}
                alt="Dental implants and prosthetic components for dental applications"
                className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                width="400"
                height="320"
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
                <img
                  src={isoLogo}
                  alt="ISO 13485:2016 certification for medical device quality management"
                  className="h-20 sm:h-24 object-contain"
                  loading="lazy"
                  width="160"
                  height="96"
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
                  alt="ANVISA Brazilian Health Regulatory Agency certification"
                  className="h-20 sm:h-24 object-contain"
                  loading="lazy"
                  width="160"
                  height="96"
                />
              </div>
              <h3 className="text-lg font-bold">{t("quality.anvisa")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Brazilian Health Regulatory Agency
              </p>
            </div>
          </div>

          {/* Equipment Carousels */}
          <div className="mb-12 max-w-5xl mx-auto px-4">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Advanced Metrology Equipment</h3>
            <Carousel className="w-full max-w-full overflow-hidden">
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={zeissContura}
                      alt="ZEISS Contura G2 3D Coordinate Measuring Machine for precision metrology"
                      className="w-full h-40 sm:h-48 object-cover"
                      loading="lazy"
                      width="300"
                      height="192"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">ZEISS Contura G2</h4>
                      <p className="text-sm text-muted-foreground">3D Coordinate Measuring Machine</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={opticalCnc}
                      alt="Optical CNC comparator for precision measurement"
                      className="w-full h-40 sm:h-48 object-cover"
                      loading="lazy"
                      width="300"
                      height="192"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">Optical Comparator CNC</h4>
                      <p className="text-sm text-muted-foreground">Precision Measurement System</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={opticalManual}
                      alt="Optical Manual"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">Optical Manual</h4>
                      <p className="text-sm text-muted-foreground">Manual Measurement System</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={hardnessVickers}
                      alt="Hardness Vickers"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">Hardness Vickers</h4>
                      <p className="text-sm text-muted-foreground">Material Hardness Testing</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
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
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={labOverview}
                      alt="Lab Overview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">Laboratory Overview</h4>
                      <p className="text-sm text-muted-foreground">Complete Metrology Lab</p>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          <div className="mb-12 max-w-5xl mx-auto px-4">
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Sample Preparation Equipment</h3>
            <Carousel className="w-full max-w-full overflow-hidden">
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={polimento}
                      alt="Polimento"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">Polishing Machine</h4>
                      <p className="text-sm text-muted-foreground">Sample Surface Preparation</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={cortadora}
                      alt="Cortadora"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">Cutting Machine</h4>
                      <p className="text-sm text-muted-foreground">Precision Sample Cutting</p>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow h-full">
                    <img
                      src={embutidora}
                      alt="Embutidora"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold mb-2">Mounting Press</h4>
                      <p className="text-sm text-muted-foreground">Sample Mounting System</p>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
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
    </div>
  );
}
