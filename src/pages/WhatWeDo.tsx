import { useLanguage } from "@/contexts/LanguageContext";
import { Cog, Sparkles, CheckCircle2, Microscope, Shield } from "lucide-react";
import productApplications from "@/assets/products/product-applications.png";
import cleanroom from "@/assets/facility/cleanroom.jpg";
import zeissContura from "@/assets/metrology/zeiss-contura.png";
import electropolishLine from "@/assets/equipment/electropolish-line.jpg";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { BlobBackground } from "@/components/BlobBackground";
import { MagneticButton } from "@/components/MagneticButton";
import { Link } from "react-router-dom";

export default function WhatWeDo() {
  const { t } = useLanguage();
  const servicesAnimation = useScrollAnimation();
  const capabilitiesAnimation = useScrollAnimation();

  const capabilities = [
    "Swiss-Type CNC Lathes",
    "Multi-Axis Machining",
    "Precision Tool Grinding",
    "CAD/CAM Programming",
    "ISO 7 Cleanrooms",
    "Electropolishing",
    "Laser Marking",
    "3D CMM Inspection",
  ];

  const services = [
    {
      icon: Cog,
      title: "Precision Swiss CNC Machining",
      description: "Multi-axis Swiss-type manufacturing with ±0.001mm tolerance for complex medical components, implants, and surgical instruments",
      image: productApplications,
      stats: ["±0.001mm", "12-Axis", "Ø0.5-32mm"],
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Microscope,
      title: "Advanced Quality Control",
      description: "ZEISS CMM 3D measurement, optical inspection, and metallographic analysis with ISO 17025 certified metrology lab",
      image: zeissContura,
      stats: ["ISO 17025", "3D CMM", "Ra < 0.05μm"],
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Sparkles,
      title: "Surface Treatment Excellence",
      description: "State-of-the-art electropolishing producing mirror finishes with enhanced biocompatibility and corrosion resistance",
      image: electropolishLine,
      stats: ["Ra < 0.1μm", "Mirror Finish", "Biocompatible"],
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
    },
    {
      icon: Shield,
      title: "Cleanroom Manufacturing",
      description: "ISO 7 certified cleanroom environments for sterile assembly, packaging with complete batch traceability",
      image: cleanroom,
      stats: ["ISO 7", "Class 10,000", "Validated"],
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground py-20 sm:py-32 md:py-40">
        <BlobBackground />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl">
            <h1 className="font-bold mb-6 animate-fade-in">
              {t("whatWeDo.title")}
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed animate-fade-in opacity-95 mb-8" style={{ animationDelay: "0.2s" }}>
              {t("whatWeDo.text")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Link to="/assessment">
                <MagneticButton size="lg" variant="secondary" className="shadow-xl">
                  Schedule Assessment
                </MagneticButton>
              </Link>
              <Link to="/capabilities">
                <MagneticButton size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white text-white shadow-xl">
                  View All Capabilities
                </MagneticButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section ref={servicesAnimation.elementRef} className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent dark:to-transparent pointer-events-none" style={{ top: '25%', height: '50%' }} />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-16 scroll-reveal ${servicesAnimation.isVisible ? 'visible' : ''}`}>
            <h2 className="font-bold mb-6">
              Core Manufacturing Services
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              End-to-end manufacturing solutions for medical device OEMs
            </p>
          </div>

          <div className="space-y-24">
            {services.map((service, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-accent-orange bg-clip-text text-transparent">
                    {service.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <div className="flex gap-4">
                    {service.stats.map((stat, i) => (
                      <div key={i} className="glass-card px-6 py-3 rounded-lg text-center">
                        <div className={`text-xl font-bold ${service.color}`}>{stat}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="rounded-2xl shadow-[var(--shadow-premium)] hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Capabilities Grid */}
      <section ref={capabilitiesAnimation.elementRef} className="py-20 sm:py-32 bg-background relative overflow-hidden">
        <BlobBackground />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-16 scroll-reveal ${capabilitiesAnimation.isVisible ? 'visible' : ''}`}>
            <h2 className="font-bold mb-6">
              Manufacturing Capabilities
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              State-of-the-art equipment and expertise
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className={`glass-card p-6 rounded-xl hover:shadow-[var(--shadow-elevated)] transition-all duration-500 hover:-translate-y-2 scroll-reveal ${capabilitiesAnimation.isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
                  <span className="font-semibold">{capability}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-primary via-primary-hover to-accent text-primary-foreground relative overflow-hidden">
        <BlobBackground />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Let's Discuss Your Manufacturing Needs
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Get expert guidance on feasibility, timelines, and cost estimates for your medical device project
            </p>
            <Link to="/assessment">
              <MagneticButton size="lg" variant="secondary" className="shadow-xl" strength={30}>
                Schedule Free Assessment
              </MagneticButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}