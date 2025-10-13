import { useEffect, useRef } from "react";
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

const equipmentItems = [
  { image: zeissContura, title: "ZEISS Contura G2", subtitle: "3D Coordinate Measuring Machine" },
  { image: citizen, title: "Swiss CNC Technology", subtitle: "Citizen Precision Lathe" },
  { image: opticalCnc, title: "Optical Comparator CNC", subtitle: "Precision Measurement System" },
  { image: hardnessVickers, title: "Hardness Vickers", subtitle: "Material Hardness Testing" },
  { image: laserMarking, title: "Laser Marking", subtitle: "Precision Part Identification" },
  { image: olympusMicroscope, title: "Olympus Microscope", subtitle: "Metallographic Analysis" },
  { image: polimento, title: "Polimento", subtitle: "Sample Surface Preparation" },
  { image: cortadora, title: "Cortadora", subtitle: "Precision Sample Cutting" },
  { image: embutidora, title: "Embutidora", subtitle: "Sample Mounting System" },
  { image: citizenL32, title: "Citizen L32", subtitle: "Swiss-Type CNC Lathe" },
  { image: tornosGT26, title: "Tornos GT26", subtitle: "Multi-Axis Turning Center" },
  { image: walter, title: "Walter Helitronic", subtitle: "Tool Grinding System" },
  { image: robodrill, title: "FANUC Robodrill", subtitle: "High-Speed Machining Center" },
  { image: electropolishLine, title: "Electropolish Line", subtitle: "Surface Finishing System" },
  { image: labOverview, title: "Laboratory Overview", subtitle: "Complete Metrology Lab" },
];

export const EquipmentCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.665; // Increased by 33% from 0.5

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Double the items for seamless loop
  const doubledItems = [...equipmentItems, ...equipmentItems];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-secondary/20 via-background to-secondary/20 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          Our Advanced Equipment & Capabilities
        </h2>
        <p className="text-base sm:text-lg text-center text-muted-foreground max-w-2xl mx-auto">
          State-of-the-art manufacturing and metrology equipment ensuring precision and quality
        </p>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden whitespace-nowrap"
        style={{ scrollBehavior: 'auto' }}
      >
        {doubledItems.map((item, index) => (
          <div
            key={index}
            className="inline-flex flex-col items-center flex-shrink-0 w-64 sm:w-72 md:w-80 group"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white shadow-lg group-hover:shadow-2xl transition-shadow">
              <img
                src={item.image}
                alt={`${item.title} - ${item.subtitle}`}
                className="w-full h-full object-contain p-4"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
