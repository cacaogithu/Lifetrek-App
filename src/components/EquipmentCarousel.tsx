import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import zeissContura from "@/assets/metrology/zeiss-contura.webp";
import opticalCnc from "@/assets/metrology/optical-cnc.webp";
import opticalManual from "@/assets/metrology/optical-manual.jpg";
import hardnessVickers from "@/assets/metrology/hardness-vickers.webp";
import olympusMicroscope from "@/assets/metrology/olympus-microscope.webp";
import labOverview from "@/assets/metrology/lab-overview.webp";
import polimento from "@/assets/metrology/polimento.webp";
import cortadora from "@/assets/metrology/cortadora.webp";
import embutidora from "@/assets/metrology/embutidora.webp";
import citizen from "@/assets/equipment/citizen.webp";
import citizenL32 from "@/assets/equipment/citizen-l32.webp";
import tornosGT26 from "@/assets/equipment/tornos-gt26.webp";
import walter from "@/assets/equipment/walter.webp";
import robodrill from "@/assets/equipment/robodrill.webp";
import electropolishLine from "@/assets/equipment/electropolish-line.jpg";
import laserMarking from "@/assets/equipment/laser-marking.webp";

type EquipmentCategory = "All" | "Metrology" | "CNC" | "Sample Prep" | "Finishing";

interface EquipmentItem {
  image: string;
  title: string;
  subtitle: string;
  category: EquipmentCategory;
  specs?: string[];
}

const equipmentItems: EquipmentItem[] = [
  { 
    image: zeissContura, 
    title: "ZEISS Contura G2", 
    subtitle: "3D Coordinate Measuring Machine",
    category: "Metrology",
    specs: ["Accuracy: ±0.001mm", "Measuring range: 700x1000x600mm", "Temperature controlled"]
  },
  { 
    image: citizen, 
    title: "Swiss CNC Technology", 
    subtitle: "Citizen Precision Lathe",
    category: "CNC",
    specs: ["Max diameter: 20mm", "Length: 150mm", "Live tooling capability"]
  },
  { 
    image: opticalCnc, 
    title: "Optical Comparator CNC", 
    subtitle: "Precision Measurement System",
    category: "Metrology",
    specs: ["Digital readout", "10x-50x magnification", "Profile measurement"]
  },
  { 
    image: hardnessVickers, 
    title: "Hardness Vickers", 
    subtitle: "Material Hardness Testing",
    category: "Metrology",
    specs: ["HV 0.3 to HV 30", "Digital display", "Automated measurements"]
  },
  { 
    image: laserMarking, 
    title: "Laser Marking", 
    subtitle: "Precision Part Identification",
    category: "Finishing",
    specs: ["Fiber laser", "Permanent marking", "High contrast"]
  },
  { 
    image: olympusMicroscope, 
    title: "Olympus Microscope", 
    subtitle: "Metallographic Analysis",
    category: "Metrology",
    specs: ["100x-1000x magnification", "Digital imaging", "Grain analysis"]
  },
  { 
    image: polimento, 
    title: "Polishing Machine", 
    subtitle: "Sample Surface Preparation",
    category: "Sample Prep",
    specs: ["Variable speed", "Multiple wheels", "Fine surface finish"]
  },
  { 
    image: cortadora, 
    title: "Cutting Machine", 
    subtitle: "Precision Sample Cutting",
    category: "Sample Prep",
    specs: ["Diamond blade", "Coolant system", "Precision cuts"]
  },
  { 
    image: embutidora, 
    title: "Mounting Press", 
    subtitle: "Sample Mounting System",
    category: "Sample Prep",
    specs: ["Hot mounting", "Quick cycle", "Consistent results"]
  },
  { 
    image: citizenL32, 
    title: "Citizen L32", 
    subtitle: "Swiss-Type CNC Lathe",
    category: "CNC",
    specs: ["32mm bar capacity", "12-axis control", "High-speed machining"]
  },
  { 
    image: tornosGT26, 
    title: "Tornos GT26", 
    subtitle: "Multi-Axis Turning Center",
    category: "CNC",
    specs: ["26mm capacity", "Multi-spindle", "Complex geometries"]
  },
  { 
    image: walter, 
    title: "Walter Helitronic", 
    subtitle: "Tool Grinding System",
    category: "CNC",
    specs: ["5-axis grinding", "Tool precision", "Automated cycles"]
  },
  { 
    image: robodrill, 
    title: "FANUC Robodrill", 
    subtitle: "High-Speed Machining Center",
    category: "CNC",
    specs: ["30,000 RPM spindle", "High precision", "Fast tool change"]
  },
  { 
    image: electropolishLine, 
    title: "Electropolish Line", 
    subtitle: "Surface Finishing System",
    category: "Finishing",
    specs: ["Mirror finish", "Biocompatible", "Corrosion resistant"]
  },
  { 
    image: labOverview, 
    title: "Laboratory Overview", 
    subtitle: "Complete Metrology Lab",
    category: "Metrology",
    specs: ["Climate controlled", "ISO 17025", "Comprehensive testing"]
  },
];

export const EquipmentCarousel = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("All");

  const categories: EquipmentCategory[] = ["All", "Metrology", "CNC", "Sample Prep", "Finishing"];

  const filteredItems = selectedCategory === "All" 
    ? equipmentItems 
    : equipmentItems.filter(item => item.category === selectedCategory);

  const getCategoryLabel = (category: EquipmentCategory) => {
    const labels: Record<EquipmentCategory, string> = {
      "All": t("equipment.category.all"),
      "Metrology": t("equipment.category.metrology"),
      "CNC": t("equipment.category.cnc"),
      "Sample Prep": t("equipment.category.sampleprep"),
      "Finishing": t("equipment.category.finishing"),
    };
    return labels[category];
  };

  return (
    <div className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-blue-800 via-teal-700 to-teal-800">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          {t("equipment.title")}
        </h2>
        <p className="text-lg sm:text-xl text-center text-white/90 max-w-3xl mx-auto mb-12">
          {t("equipment.subtitle")}
        </p>
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* Equipment Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {filteredItems.map((item, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="group h-full">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                    <img
                      src={item.image}
                      alt={`${item.title} - ${item.subtitle}`}
                      className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      width="400"
                      height="400"
                    />
                    
                    {/* Specifications Overlay */}
                    {item.specs && (
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/98 to-blue-900/95 text-white p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h4 className="font-bold text-xl mb-4">{item.title}</h4>
                        <ul className="space-y-2">
                          {item.specs.map((spec, i) => (
                            <li key={i} className="text-sm flex items-start">
                              <span className="mr-2 text-teal-400">•</span>
                              <span>{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 bg-white/90 hover:bg-white" />
          <CarouselNext className="hidden md:flex -right-12 bg-white/90 hover:bg-white" />
        </Carousel>
      </div>
    </div>
  );
};