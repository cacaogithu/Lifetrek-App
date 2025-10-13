import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Cpu, Users, Sparkles } from "lucide-react";
import cleanroom from "@/assets/facility/cleanroom.jpg";
import reception from "@/assets/facility/reception.jpg";
import citizenL20 from "@/assets/equipment/citizen.png";
import citizenL32 from "@/assets/equipment/citizen-l32.png";
import citizenL20X from "@/assets/equipment/citizen-l20x.png";
import walter from "@/assets/equipment/walter.png";
import tornosGT26 from "@/assets/equipment/tornos-gt26.png";
import tornosGT13 from "@/assets/equipment/tornos-gt13.png";
import doosan from "@/assets/equipment/doosan.png";
import espritCam from "@/assets/equipment/esprit-cam.png";
import robodrill from "@/assets/equipment/robodrill.png";
import laserMarking from "@/assets/equipment/laser-marking.png";
import electropolishLine from "@/assets/equipment/electropolish-line.jpg";

export default function Infrastructure() {
  const { t } = useLanguage();

  const cncMachines = [
    {
      image: citizenL20,
      name: "Citizen L20-VIII LFV",
      category: "Swiss-Type CNC Lathe",
    },
    {
      image: citizenL32,
      name: "Citizen L32",
      category: "Swiss-Type CNC Lathe",
    },
    {
      image: citizenL20X,
      name: "Citizen L20-X",
      category: "Swiss-Type CNC Lathe",
    },
    {
      image: tornosGT26,
      name: "Tornos GT-26",
      category: "Swiss-Type CNC Lathe",
    },
    {
      image: tornosGT13,
      name: "Tornos GT-13",
      category: "Swiss-Type CNC Lathe",
    },
    {
      image: doosan,
      name: "Doosan Lynx",
      category: "CNC Turning Center",
    },
    {
      image: walter,
      name: "Walter Helitronic",
      category: "Tool Grinding Machine",
    },
    {
      image: robodrill,
      name: "FANUC Robodrill",
      category: "CNC Machining Center",
    },
  ];

  const software = [
    {
      image: espritCam,
      name: "ESPRIT CAM System",
      category: "CAD/CAM Software",
    },
  ];

  const finishingEquipment = [
    {
      image: electropolishLine,
      name: "Electropolish Line",
      category: "Surface Treatment System",
    },
    {
      image: laserMarking,
      name: "Laser Marking",
      category: "Product Identification System",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            {t("infrastructure.title")}
          </h1>
        </div>
      </section>

      {/* Cleanrooms */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {t("infrastructure.cleanrooms.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("infrastructure.cleanrooms.text")}
              </p>
            </div>
            <div>
              <img
                src={cleanroom}
                alt="ISO 7 Cleanroom"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Equipment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={reception}
                alt="Facility Reception"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {t("infrastructure.equipment.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("infrastructure.equipment.text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("infrastructure.technology")}
              </h3>
              <p className="text-muted-foreground">
                Latest generation CNC equipment and advanced manufacturing systems
              </p>
            </div>

            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("infrastructure.team")}
              </h3>
              <p className="text-muted-foreground">
                Expert professionals dedicated to excellence and precision
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CNC Machines */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            CNC Manufacturing Equipment
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            State-of-the-art precision machining equipment for high-quality medical device manufacturing
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {cncMachines.map((machine, index) => (
              <div
                key={index}
                className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-square bg-secondary/30 flex items-center justify-center p-4">
                  <img
                    src={machine.image}
                    alt={machine.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base mb-1">{machine.name}</h3>
                  <p className="text-xs text-muted-foreground">{machine.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Software */}
          <h3 className="text-2xl font-bold text-center mb-8">
            CAD/CAM Software
          </h3>
          
          <div className="grid grid-cols-1 max-w-md mx-auto mb-12">
            {software.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-video bg-secondary/30 flex items-center justify-center p-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Finishing Equipment */}
          <h3 className="text-2xl font-bold text-center mb-8">
            Surface Finishing & Marking
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {finishingEquipment.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-video bg-secondary/30 flex items-center justify-center p-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
