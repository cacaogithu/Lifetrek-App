import { useEffect, useRef, useState } from "react";
import zeissContura from "@/assets/metrology/zeiss-contura.png";
import opticalCnc from "@/assets/metrology/optical-cnc.png";
import opticalManual from "@/assets/metrology/optical-manual.jpg";
import hardnessVickers from "@/assets/metrology/hardness-vickers.png";
import olympusMicroscope from "@/assets/metrology/olympus-microscope.png";
import labOverview from "@/assets/metrology/lab-overview.png";
import polimento from "@/assets/metrology/polimento.png";
import cortadora from "@/assets/metrology/cortadora.png";
import embutidora from "@/assets/metrology/embutidora.png";
import citizen from "@/assets/equipment/citizen.png";
import citizenL32 from "@/assets/equipment/citizen-l32.png";
import tornosGT26 from "@/assets/equipment/tornos-gt26.png";
import walter from "@/assets/equipment/walter.png";
import robodrill from "@/assets/equipment/robodrill.png";
import electropolishLine from "@/assets/equipment/electropolish-line.jpg";
import laserMarking from "@/assets/equipment/laser-marking.png";

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
    title: "Polimento", 
    subtitle: "Sample Surface Preparation",
    category: "Sample Prep",
    specs: ["Variable speed", "Multiple wheels", "Fine surface finish"]
  },
  { 
    image: cortadora, 
    title: "Cortadora", 
    subtitle: "Precision Sample Cutting",
    category: "Sample Prep",
    specs: ["Diamond blade", "Coolant system", "Precision cuts"]
  },
  { 
    image: embutidora, 
    title: "Embutidora", 
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("All");
  const animationRef = useRef<number>();

  const categories: EquipmentCategory[] = ["All", "Metrology", "CNC", "Sample Prep", "Finishing"];

  const filteredItems = selectedCategory === "All" 
    ? equipmentItems 
    : equipmentItems.filter(item => item.category === selectedCategory);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.665;

    const animate = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, filteredItems]);

  const doubledItems = [...filteredItems, ...filteredItems];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-secondary/20 via-background to-secondary/20 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          Our Advanced Equipment & Capabilities
        </h2>
        <p className="text-base sm:text-lg text-center text-muted-foreground max-w-2xl mx-auto mb-8">
          State-of-the-art manufacturing and metrology equipment ensuring precision and quality
        </p>
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]"
                  : "bg-card text-card-foreground hover:bg-secondary border border-border"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden whitespace-nowrap cursor-pointer"
        style={{ scrollBehavior: 'auto' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {doubledItems.map((item, index) => (
          <div
            key={index}
            className="inline-flex flex-col items-center flex-shrink-0 w-64 sm:w-72 md:w-80 group"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-all duration-500">
              <img
                src={item.image}
                alt={`${item.title} - ${item.subtitle}`}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Specifications Overlay */}
              {item.specs && (
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/95 to-primary/80 text-primary-foreground p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h4 className="font-bold text-lg mb-3">{item.title}</h4>
                  <ul className="space-y-1.5">
                    {item.specs.map((spec, i) => (
                      <li key={i} className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-4 text-center px-2">
              <h3 className="text-base sm:text-lg font-semibold mb-1 whitespace-normal">{item.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-normal">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
