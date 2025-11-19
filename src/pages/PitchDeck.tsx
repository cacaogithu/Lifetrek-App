import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2,
  Check,
  CheckCircle,
  Bone,
  Scissors,
  Smile,
  Pawprint,
  ArrowRight,
  AlertTriangle,
  Shield,
  FileX,
  Clock,
  Target,
  Microscope
} from "lucide-react";

// Assets
import logo from "@/assets/logo-optimized.webp";
import isoLogo from "@/assets/certifications/iso.webp";
import cleanroomHero from "@/assets/facility/cleanroom-hero.webp";
import factoryExterior from "@/assets/facility/exterior-hero.webp";
import factoryHeroFull from "@/assets/facility/factory-hero-full.svg";

// Equipment
import citizenL20 from "@/assets/equipment/citizen-l20.webp";
import citizenM32 from "@/assets/equipment/citizen-m32-new.png";
import doosanNew from "@/assets/equipment/doosan-new.png";
import robodrill from "@/assets/equipment/robodrill.webp";
import zeissContura from "@/assets/metrology/zeiss-contura.webp";
import opticalCNC from "@/assets/metrology/optical-cnc.webp";
import laserMarking from "@/assets/equipment/laser-marking.webp";
import electropolishLine from "@/assets/equipment/electropolish-line.webp";

// Products
import medicalScrew from "@/assets/products/medical-screw-hero.webp";
import dentalInstruments from "@/assets/products/dental-instruments-hero.webp";
import surgicalDrills from "@/assets/products/surgical-drills-optimized.webp";
import veterinaryImplant1 from "@/assets/products/veterinary-implant-1.jpg";
import labOverview from "@/assets/metrology/lab-overview.webp";

// Clients - ALL -new versions
import cpmhNew from "@/assets/clients/cpmh-new.png";
import evolveNew from "@/assets/clients/evolve-new.png";
import fgmNew from "@/assets/clients/fgm-new.png";
import gmiNew from "@/assets/clients/gmi-new.png";
import hcsNew from "@/assets/clients/hcs-new.png";
import impolNew from "@/assets/clients/impol-new.png";
import implanfixNew from "@/assets/clients/implanfix-new.png";
import iolNew from "@/assets/clients/iol-new.png";
import plenumNew from "@/assets/clients/plenum-new.png";
import medensNew from "@/assets/clients/medens-new.png";
import neoorthoNew from "@/assets/clients/neoortho-new.jpg";
import oblDentalNew from "@/assets/clients/obl-dental-new.jpg";
import orthometricNew from "@/assets/clients/orthometric-new.png";
import osseaNew from "@/assets/clients/ossea-new.jpg";
import traumecNew2 from "@/assets/clients/traumec-new-2.png";
import razekNew from "@/assets/clients/razek-new.png";
import reactNew from "@/assets/clients/react-new.png";
import russerNew from "@/assets/clients/russer-new.png";
import techimportNew from "@/assets/clients/techimport-new.png";
import torideNew from "@/assets/clients/toride-new.png";
import ultradentNew from "@/assets/clients/ultradent-new.png";
import vinculaNew from "@/assets/clients/vincula-new.png";

// Glass Card Component
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-background/60 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 ${className}`}>
    {children}
  </div>
);

const PitchDeck = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const clientLogos = [
    { src: cpmhNew, name: "CPMH" }, { src: evolveNew, name: "Evolve" }, { src: fgmNew, name: "FGM" },
    { src: gmiNew, name: "GMI" }, { src: hcsNew, name: "HCS" }, { src: impolNew, name: "Impol" },
    { src: implanfixNew, name: "Implanfix" }, { src: iolNew, name: "IOL" }, { src: plenumNew, name: "Plenum" },
    { src: medensNew, name: "Medens" }, { src: neoorthoNew, name: "Neoortho" }, { src: oblDentalNew, name: "OBL Dental" },
    { src: orthometricNew, name: "Orthometric" }, { src: osseaNew, name: "Óssea" }, { src: traumecNew2, name: "Traumec" },
    { src: razekNew, name: "Razek" }, { src: reactNew, name: "React" }, { src: russerNew, name: "Russer" },
    { src: techimportNew, name: "TechImport" }, { src: torideNew, name: "Toride" }, { src: ultradentNew, name: "Ultradent" },
    { src: vinculaNew, name: "Vincula" },
  ];

  const slides = [
    // ... keep existing code (slides array with all 10 slides)
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Lifetrek" className="h-8" />
            <span className="text-sm text-muted-foreground">Sales Pitch Deck</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm"><Share2 className="w-4 h-4 mr-2" />Share</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Download PDF</Button>
          </div>
        </div>
      </div>
      <div className="pt-20 h-screen"><div className="h-[calc(100vh-8rem)] relative">{slides[currentSlide].content}</div></div>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="outline" size="lg" onClick={prevSlide} disabled={currentSlide === 0}><ChevronLeft className="w-5 h-5 mr-2" />Previous</Button>
          <div className="flex items-center gap-2">{slides.map((_, index) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50"}`} />))}</div>
          <Button variant="outline" size="lg" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>Next<ChevronRight className="w-5 h-5 ml-2" /></Button>
        </div>
      </div>
      <div className="fixed bottom-24 right-8 z-40"><img src={logo} alt="Lifetrek" className="h-8 opacity-30" /></div>
    </div>
  );
};

export default PitchDeck;
