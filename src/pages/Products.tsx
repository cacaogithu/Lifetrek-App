import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, ArrowRight, Target, Heart, Sparkles, PawPrint, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ImageGallery";
import { ImageEnhancer } from "@/components/ImageEnhancer";
import { useState } from "react";
import medicalScrewRaw from "@/assets/products/medical-screw-raw.png";
import medicalImplantsDiagram from "@/assets/products/medical-implants-diagram-enhanced.webp";
import dentalImplantsDiagram from "@/assets/products/dental-implants-diagram.webp";
import medicalScrew from "@/assets/products/medical-screw-hero.webp";
import veterinaryImplants from "@/assets/products/veterinary-implants.jpg";
import veterinaryImplant1 from "@/assets/products/veterinary-implant-1.jpg";
import veterinaryImplant2 from "@/assets/products/veterinary-implant-2.jpg";
import surgicalParts from "@/assets/products/surgical-parts-optimized.webp";
import precisionComponents from "@/assets/products/precision-components.png";
import surgicalDrills from "@/assets/products/surgical-drills-optimized.webp";
import surgicalPins from "@/assets/products/surgical-pins-optimized.webp";
import orthopedicScrews from "@/assets/products/orthopedic-screws-optimized.webp";
import microInstruments from "@/assets/products/micro-instruments-optimized.webp";
import surgicalHandles from "@/assets/products/surgical-handles-optimized.webp";
import spinalImplants from "@/assets/products/spinal-implants-optimized.webp";
import measuringTools from "@/assets/products/measuring-tools-optimized.webp";
import dentalComponents from "@/assets/products/dental-components.jpg";
import dentalAngulados from "@/assets/products/dental-angulados.png";
import dentalImplanteOptimized from "@/assets/products/dental-implante-optimized.png";
import dentalFresasOptimized from "@/assets/products/dental-fresas-optimized.png";
import dentalInstrumentosOptimized from "@/assets/products/dental-instrumentos-optimized.png";
import tulipImplants from "@/assets/products/tulip-implants.webp";
import trepanationDrills from "@/assets/products/trepanation-drills.webp";
import drillGuide from "@/assets/products/drill-guide.webp";
import dentalComponentsCorrect from "@/assets/products/dental-components-correct.webp";
export default function Products() {
  const {
    t
  } = useLanguage();
  const [openCatalog, setOpenCatalog] = useState<number | null>(null);
  const productCategories = [{
    icon: Target,
    image: medicalImplantsDiagram,
    title: t("products.medical.title"),
    benefit: t("products.medical.benefit"),
    description: t("products.medical.text"),
    features: [t("products.medical.feature1"), t("products.medical.feature2"), t("products.medical.feature3"), t("products.medical.feature4")],
    color: "from-blue-600 to-blue-400",
    iconBg: "bg-blue-600",
    catalogImages: [{
      src: spinalImplants,
      alt: "Spinal implant systems for fusion procedures"
    }, {
      src: orthopedicScrews,
      alt: "Orthopedic fixation screws"
    }, {
      src: surgicalPins,
      alt: "Surgical pins for bone fixation"
    }, {
      src: tulipImplants,
      alt: "Tulipa fixa e bipartida - Orthopedic spinal implants"
    }]
  }, {
    icon: Sparkles,
    image: surgicalParts,
    title: t("products.instruments.title"),
    benefit: t("products.instruments.benefit"),
    description: t("products.instruments.text"),
    features: [t("products.instruments.feature1"), t("products.instruments.feature2"), t("products.instruments.feature3"), t("products.instruments.feature4")],
    color: "from-blue-500 to-blue-300",
    iconBg: "bg-blue-500",
    catalogImages: [{
      src: trepanationDrills,
      alt: "Brocas de Trepanação - Cranial surgery drills"
    }, {
      src: dentalFresasOptimized,
      alt: "Dental surgical drills"
    }, {
      src: dentalInstrumentosOptimized,
      alt: "Dental surgical instruments"
    }, {
      src: drillGuide,
      alt: "Drill guide for surgical precision"
    }]
  }, {
    icon: Heart,
    image: dentalImplantsDiagram,
    title: t("products.dental.title"),
    benefit: t("products.dental.benefit"),
    description: t("products.dental.text"),
    features: [t("products.dental.feature1"), t("products.dental.feature2"), t("products.dental.feature3"), t("products.dental.feature4")],
    color: "from-green-600 to-green-400",
    iconBg: "bg-green-600",
    catalogImages: [{
      src: dentalImplanteOptimized,
      alt: "Implante Dentário em Titânio - Sistema completo de implante com conexão hexagonal"
    }, {
      src: dentalAngulados,
      alt: "Pilares Protéticos Angulados - Componentes protéticos multi-angulados para implantes dentários"
    }, {
      src: dentalComponentsCorrect,
      alt: "Dental orthodontic components - implant screws and abutments"
    }]
  }, {
    icon: PawPrint,
    image: veterinaryImplants,
    title: t("products.veterinary.title"),
    benefit: t("products.veterinary.benefit"),
    description: t("products.veterinary.text"),
    features: [t("products.veterinary.feature1"), t("products.veterinary.feature2"), t("products.veterinary.feature3"), t("products.veterinary.feature4")],
    color: "from-orange-600 to-orange-400",
    iconBg: "bg-orange-600",
    catalogImages: [{
      src: veterinaryImplant1,
      alt: "Implantes Ortopédicos Veterinários - Placas e parafusos para cirurgia veterinária"
    }, {
      src: veterinaryImplant2,
      alt: "Sistemas de Fixação Veterinária - Implantes de titânio para ortopedia animal"
    }]
  }];
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 animate-fade-in max-w-4xl mx-auto lg:text-4xl">
            {t("products.title")}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-95">
            {t("products.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Image Enhancement Demo */}
      

      {/* Product Categories */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {productCategories.map((category, index) => <div key={index}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>{category.title}</h2>
                    <p className={`text-lg sm:text-xl font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-4`}>
                      {category.benefit}
                    </p>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
                      {category.description}
                    </p>
                    <ul className="space-y-3">
                      {category.features.map((feature, idx) => <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 mt-0.5 ${category.iconBg.replace('bg-', 'text-')}`} />
                          <span className="text-sm sm:text-base">{feature}</span>
                        </li>)}
                    </ul>
                  </div>
                  
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="relative group">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${category.color} rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                      <img src={category.image} alt={`${category.title} - ${category.benefit}`} className="relative w-full rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-300" loading="lazy" width="800" height="600" decoding="async" />
                    </div>
                  </div>
                </div>
                
                {/* Minimalist Catalog */}
                {category.catalogImages && category.catalogImages.length > 0 && <div className="mt-8">
                    <Button variant="outline" onClick={() => setOpenCatalog(openCatalog === index ? null : index)} className="w-full sm:w-auto flex items-center gap-2 group">
                      {openCatalog === index ? t("products.catalog.hide") : t("products.catalog.view")}
                      <ChevronDown className={`h-4 w-4 transition-transform ${openCatalog === index ? "rotate-180" : ""}`} />
                    </Button>
                    {openCatalog === index && <div className="mt-6 animate-fade-in">
                        <ImageGallery images={category.catalogImages} columns={category.catalogImages.length > 4 ? 4 : 3} />
                      </div>}
                  </div>}
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-primary via-accent to-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white">
            {t("products.cta.title")}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-3xl mx-auto opacity-95">
            {t("products.cta.text")}
          </p>
        </div>
      </section>
    </div>;
}