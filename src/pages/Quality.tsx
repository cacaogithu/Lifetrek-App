import { useLanguage } from "@/contexts/LanguageContext";
import { Award, TrendingUp, FileCheck, Zap } from "lucide-react";
import isoLogo from "@/assets/certifications/iso.jpg";
import anvisaLogo from "@/assets/certifications/anvisa.png";
import zeissContura from "@/assets/metrology/zeiss-contura.png";
import opticalCnc from "@/assets/metrology/optical-cnc.png";
import opticalManual from "@/assets/metrology/optical-manual.jpg";
import polimento from "@/assets/metrology/polimento.png";
import cortadora from "@/assets/metrology/cortadora.png";
import embutidora from "@/assets/metrology/embutidora.png";
import hardnessVickers from "@/assets/metrology/hardness-vickers.png";
import labOverview from "@/assets/metrology/lab-overview.png";
import olympusMicroscope from "@/assets/metrology/olympus-microscope.png";

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
      image: zeissContura,
      name: "ZEISS Contura",
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
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            {t("quality.title")}
          </h1>
          <p className="text-xl max-w-3xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {t("quality.intro")}
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Award className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">{t("quality.certifications")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-lg shadow-lg text-center">
              <div className="mb-6 flex justify-center">
                <img
                  src={isoLogo}
                  alt="ISO 13485:2016"
                  className="h-32 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold">{t("quality.iso")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Medical Device Quality Management
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg text-center">
              <div className="mb-6 flex justify-center">
                <img
                  src={anvisaLogo}
                  alt="ANVISA"
                  className="h-32 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold">{t("quality.anvisa")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Brazilian Health Regulatory Agency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Features */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Lab Overview Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={labOverview}
                alt="Metrology Laboratory Overview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={olympusMicroscope}
                alt="Olympus Microscope System"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-4">
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
