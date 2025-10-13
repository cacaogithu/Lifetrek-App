import { useLanguage } from "@/contexts/LanguageContext";
import { Award, Shield, TrendingUp, Target, Zap, Sparkles } from "lucide-react";
import isoLogo from "@/assets/certifications/iso.jpg";
import anvisaLogo from "@/assets/certifications/anvisa.png";
import cleanroom from "@/assets/facility/cleanroom.jpg";
import zeissContura from "@/assets/metrology/zeiss-contura.png";
import opticalCnc from "@/assets/metrology/optical-cnc.png";
import hardnessVickers from "@/assets/metrology/hardness-vickers.png";
import labOverview from "@/assets/metrology/lab-overview.png";
import olympusMicroscope from "@/assets/metrology/olympus-microscope.png";
import polimento from "@/assets/metrology/polimento.png";
import cortadora from "@/assets/metrology/cortadora.png";
import embutidora from "@/assets/metrology/embutidora.png";
import citizenL20 from "@/assets/equipment/citizen.png";
import citizenL32 from "@/assets/equipment/citizen-l32.png";
import tornosGT26 from "@/assets/equipment/tornos-gt26.png";
import walter from "@/assets/equipment/walter.png";
import robodrill from "@/assets/equipment/robodrill.png";
import electropolishLine from "@/assets/equipment/electropolish-line.jpg";
import laserMarking from "@/assets/equipment/laser-marking.png";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ImageGallery } from "@/components/ImageGallery";

export default function Capabilities() {
  const { t } = useLanguage();

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.reload();
  };

  const capabilities = [
    {
      icon: Shield,
      title: t("capabilities.cleanrooms.title"),
      benefit: t("capabilities.cleanrooms.benefit"),
      description: t("capabilities.cleanrooms.text"),
      image: cleanroom,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Target,
      title: t("capabilities.metrology.title"),
      benefit: t("capabilities.metrology.benefit"),
      description: t("capabilities.metrology.text"),
      image: labOverview,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Zap,
      title: t("capabilities.equipment.title"),
      benefit: t("capabilities.equipment.benefit"),
      description: t("capabilities.equipment.text"),
      image: citizenL32,
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
    },
    {
      icon: Sparkles,
      title: t("capabilities.finishing.title"),
      benefit: t("capabilities.finishing.benefit"),
      description: t("capabilities.finishing.text"),
      image: electropolishLine,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  const cncMachines = [
    { image: citizenL20, name: "Citizen L20-VIII LFV", category: "Swiss-Type CNC" },
    { image: citizenL32, name: "Citizen L32", category: "Swiss-Type CNC" },
    { image: tornosGT26, name: "Tornos GT-26", category: "Swiss-Type CNC" },
    { image: walter, name: "Walter Helitronic", category: "Tool Grinder" },
    { image: robodrill, name: "FANUC Robodrill", category: "Machining Center" },
  ];

  const metrologyEquipment = [
    { image: zeissContura, name: "ZEISS Contura G2", category: "CMM" },
    { image: opticalCnc, name: "Optical CNC", category: "Measurement" },
    { image: hardnessVickers, name: "Hardness Vickers", category: "Material Testing" },
    { image: olympusMicroscope, name: "Olympus Microscope", category: "Analysis" },
  ];

  const labEquipment = [
    { image: polimento, name: "Polishing Machine", category: "Sample Prep" },
    { image: cortadora, name: "Cutting Machine", category: "Sample Prep" },
    { image: embutidora, name: "Mounting Press", category: "Sample Prep" },
  ];

  const finishingEquipment = [
    { image: electropolishLine, name: "Electropolish Line", category: "Surface Treatment" },
    { image: laserMarking, name: "Laser Marking", category: "Identification" },
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in max-w-4xl">
            {t("capabilities.title")}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            {t("capabilities.subtitle")}
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Award className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t("capabilities.certifications")}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("capabilities.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            <div className="bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-primary">
              <img
                src={isoLogo}
                alt="ISO 13485:2016 medical device quality management"
                className="h-20 object-contain mx-auto mb-4"
                loading="lazy"
              />
              <h3 className="font-bold text-sm">{t("capabilities.iso")}</h3>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-accent">
              <img
                src={anvisaLogo}
                alt="ANVISA certification"
                className="h-20 object-contain mx-auto mb-4"
                loading="lazy"
              />
              <h3 className="font-bold text-sm">{t("capabilities.anvisa")}</h3>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-accent-orange">
              <TrendingUp className="h-12 w-12 text-accent-orange mx-auto mb-4" />
              <h3 className="font-bold text-sm">{t("capabilities.continuous")}</h3>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg text-center border-l-4 border-primary">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-sm">{t("capabilities.traceability")}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${capability.bg} mb-4`}>
                    <capability.icon className={`h-7 w-7 ${capability.color}`} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{capability.title}</h2>
                  <p className="text-lg sm:text-xl font-semibold text-primary mb-4">{capability.benefit}</p>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                    {capability.description}
                  </p>
                </div>
                
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <img
                    src={capability.image}
                    alt={`${capability.title} facility`}
                    className="w-full rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width="600"
                    height="400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Showcase */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* CNC Machines */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
              Swiss CNC Manufacturing Equipment
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {cncMachines.map((machine, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4">
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1">{machine.name}</h3>
                    <p className="text-xs text-muted-foreground">{machine.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrology Equipment */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
              Advanced Metrology Laboratory
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrologyEquipment.map((equipment, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4">
                    <img
                      src={equipment.image}
                      alt={equipment.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1">{equipment.name}</h3>
                    <p className="text-xs text-muted-foreground">{equipment.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Prep Equipment */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              Sample Preparation Equipment
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {labEquipment.map((equipment, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4">
                    <img
                      src={equipment.image}
                      alt={equipment.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1">{equipment.name}</h3>
                    <p className="text-xs text-muted-foreground">{equipment.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finishing Equipment */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              Surface Finishing & Marking
            </h2>
            <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
              {finishingEquipment.map((equipment, index) => (
                <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="aspect-video bg-secondary/30 flex items-center justify-center p-4">
                    <img
                      src={equipment.image}
                      alt={equipment.name}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm mb-1">{equipment.name}</h3>
                    <p className="text-xs text-muted-foreground">{equipment.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
    </PullToRefresh>
  );
}
