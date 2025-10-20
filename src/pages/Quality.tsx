import { useLanguage } from "@/contexts/LanguageContext";
import { Award, TrendingUp, FileCheck, Zap } from "lucide-react";
import isoLogo from "@/assets/certifications/iso.webp";
import surgicalInstruments from "@/assets/products/surgical-instruments.jpg";
import opticalCnc from "@/assets/metrology/optical-cnc.webp";
import opticalManual from "@/assets/metrology/optical-manual.webp";
import polimento from "@/assets/metrology/polimento.webp";
import cortadora from "@/assets/metrology/cortadora.webp";
import embutidora from "@/assets/metrology/embutidora.webp";
import hardnessVickers from "@/assets/metrology/hardness-vickers.webp";
import labOverview from "@/assets/metrology/lab-overview.webp";
import olympusMicroscope from "@/assets/metrology/olympus-microscope.webp";

export default function Quality() {
  const { t } = useLanguage();

  const qualityFeatures = [
    {
      icon: TrendingUp,
      title: t("quality.continuous"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: FileCheck,
      title: t("quality.traceability"),
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  const metrologyEquipment = [
    {
      image: surgicalInstruments,
      name: "Surgical Instruments",
      description: "Coordinate Measuring Machine",
    },
    {
      image: opticalCnc,
      name: "Optical CNC",
      description: "CNC Optical Measurement System",
    },
    {
      image: opticalManual,
      name: "Optical Manual",
      description: "Manual Optical Measurement System",
    },
    {
      image: hardnessVickers,
      name: "Hardness Vickers",
      description: "Vickers Hardness Tester",
    },
  ];

  const labEquipment = [
    {
      image: polimento,
      name: "Polimento",
      description: "Polishing Equipment",
    },
    {
      image: cortadora,
      name: "Cortadora",
      description: "Precision Cutting Machine",
    },
    {
      image: embutidora,
      name: "Embutidora",
      description: "Embedding Press",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 animate-fade-in">
            {t("quality.title")}
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl animate-fade-in animate-delay-200">
            {t("quality.intro")}
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <Award className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-primary">{t("quality.certifications")}</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 max-w-2xl mx-auto">
            <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg text-center">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <img
                  src={isoLogo}
                  alt="ISO 13485:2016 medical device quality management certification"
                  className="h-24 sm:h-32 object-contain"
                  loading="lazy"
                  width="160"
                  height="128"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold">ISO 13485:2016</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Medical Device Quality Management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Features */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16">
            {qualityFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-6 bg-card rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-full ${feature.bg} flex items-center justify-center`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
            ))}
          </div>

          {/* Advanced Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("quality.metrology.title")}</h3>
              <p className="text-muted-foreground">{t("quality.metrology.text")}</p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t("quality.electropolishing.title")}</h3>
              <p className="text-muted-foreground">{t("quality.electropolishing.text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrology Equipment */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Lab Overview Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 max-w-6xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={labOverview}
                alt="Advanced metrology laboratory with precision measurement equipment"
                className="w-full h-full object-cover"
                loading="lazy"
                width="600"
                height="400"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={olympusMicroscope}
                alt="Olympus microscope system for metallographic analysis"
                className="w-full h-full object-cover"
                loading="lazy"
                width="600"
                height="400"
              />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-primary">
            Metrology Laboratory Equipment
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            State-of-the-art measurement and testing equipment ensuring the highest precision standards
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {metrologyEquipment.map((equipment, index) => (
              <div
                key={index}
                className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-secondary/30 flex items-center justify-center p-6">
                  <img
                    src={equipment.image}
                    alt={equipment.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{equipment.name}</h3>
                  <p className="text-sm text-muted-foreground">{equipment.description}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold text-center mb-8">
            Sample Preparation Equipment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {labEquipment.map((equipment, index) => (
              <div
                key={index}
                className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-secondary/30 flex items-center justify-center p-6">
                  <img
                    src={equipment.image}
                    alt={equipment.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{equipment.name}</h3>
                  <p className="text-sm text-muted-foreground">{equipment.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
