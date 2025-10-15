import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, ArrowRight, Target, Heart, Sparkles, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ImageGallery";
import { SEO } from "@/components/SEO";
import { medicalImplantsSchema, dentalImplantsSchema, surgicalInstrumentsSchema, generateBreadcrumbSchema } from "@/utils/structuredData";
import medicalImplantsDiagram from "@/assets/products/medical-implants-diagram.webp";
import dentalImplantsDiagram from "@/assets/products/dental-implants-diagram.webp";
import medicalScrew from "@/assets/products/medical-screw.webp";
import veterinaryImplants from "@/assets/products/veterinary-implants.jpg";
import surgicalParts from "@/assets/products/surgical-parts-1.jpg";
import precisionComponents from "@/assets/products/precision-components.png";
import surgicalDrills from "@/assets/products/surgical-drills.png";
import surgicalPins from "@/assets/products/surgical-pins.jpg";
import orthopedicScrews from "@/assets/products/orthopedic-screws.png";
import microInstruments from "@/assets/products/micro-instruments.png";
import surgicalHandles from "@/assets/products/surgical-handles.png";
import spinalImplants from "@/assets/products/spinal-implants.png";
import measuringTools from "@/assets/products/measuring-tools.jpg";
import dentalComponents from "@/assets/products/dental-components.jpg";
import dentalAngulados from "@/assets/products/dental-angulados.png";
import dentalImplanteOptimized from "@/assets/products/dental-implante-optimized.png";
import dentalFresasOptimized from "@/assets/products/dental-fresas-optimized.png";
import dentalInstrumentosOptimized from "@/assets/products/dental-instrumentos-optimized.png";

export default function Products() {
  const { t } = useLanguage();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://lifetrek-global-site.lovable.app/' },
    { name: 'Products', url: 'https://lifetrek-global-site.lovable.app/products' }
  ]);

  const productCategories = [
    {
      icon: Target,
      image: medicalImplantsDiagram,
      title: t("products.medical.title"),
      benefit: t("products.medical.benefit"),
      description: t("products.medical.text"),
      features: [
        "Trauma fixation plates & screws",
        "Spinal fusion systems",
        "Upper & lower extremity implants",
        "Cranial fixation devices"
      ],
      color: "from-primary to-primary/80",
      catalogImages: [
        { src: spinalImplants, alt: "Spinal implant systems for fusion procedures" },
        { src: orthopedicScrews, alt: "Orthopedic fixation screws" },
        { src: surgicalPins, alt: "Surgical pins for bone fixation" }
      ]
    },
    {
      icon: Sparkles,
      image: medicalScrew,
      title: t("products.instruments.title"),
      benefit: t("products.instruments.benefit"),
      description: t("products.instruments.text"),
      features: [
        "Powered surgical drills",
        "Precision reamers & taps",
        "Custom cutting instruments",
        "Surgical guide systems"
      ],
      color: "from-accent to-accent/80",
      catalogImages: [
        { src: surgicalDrills, alt: "Powered surgical drills" },
        { src: surgicalHandles, alt: "Surgical instrument handles" },
        { src: microInstruments, alt: "Micro surgical instruments" },
        { src: measuringTools, alt: "Precision measuring tools" },
        { src: surgicalParts, alt: "Surgical instrument components" }
      ]
    },
    {
      icon: Heart,
      image: dentalImplantsDiagram,
      title: t("products.dental.title"),
      benefit: t("products.dental.benefit"),
      description: t("products.dental.text"),
      features: [
        "Titanium dental implants",
        "Angled abutments",
        "Bone preparation drills",
        "Custom surgical instruments"
      ],
      color: "from-accent-orange to-accent-orange/80",
      catalogImages: [
        { src: dentalImplanteOptimized, alt: "Implante Dentário em Titânio - Sistema completo de implante com conexão hexagonal" },
        { src: dentalAngulados, alt: "Pilares Protéticos Angulados - Componentes protéticos multi-angulados para implantes dentários" },
        { src: dentalFresasOptimized, alt: "Fresas Cirúrgicas para Implantodontia - Kit completo de brocas para preparação óssea" },
        { src: dentalInstrumentosOptimized, alt: "Instrumentos Cirúrgicos Dentários - Ferramentas de precisão para cirurgia de implantes" },
        { src: dentalComponents, alt: "Componentes Protéticos Dentários - Conectores e parafusos protéticos em titânio" },
        { src: precisionComponents, alt: "Componentes de Precisão em Titânio - Peças usinadas de alta precisão para aplicações médicas" }
      ]
    },
    {
      icon: PawPrint,
      image: veterinaryImplants,
      title: t("products.veterinary.title"),
      benefit: t("products.veterinary.benefit"),
      description: t("products.veterinary.text"),
      features: [
        "Small animal orthopedic plates",
        "Veterinary fixation screws",
        "Adapted surgical instruments",
        "Custom veterinary implants"
      ],
      color: "from-primary to-accent",
      catalogImages: []
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title="Medical Device Products"
        description="Comprehensive range of precision-manufactured medical devices: orthopedic implants, dental implants, surgical instruments, and veterinary implants. ISO 13485 certified manufacturing."
        keywords="medical implants, orthopedic screws, dental implants, surgical instruments, trauma plates, spinal implants, veterinary implants, medical device manufacturing"
        ogType="product"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [medicalImplantsSchema, dentalImplantsSchema, surgicalInstrumentsSchema, breadcrumbSchema]
        }}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in max-w-4xl">
            {t("products.title")}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl leading-relaxed opacity-95">
            {t("products.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {productCategories.map((category, index) => (
              <div key={index}>
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${category.color} text-white mb-4`}>
                      <category.icon className="h-7 w-7" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{category.title}</h2>
                    <p className="text-lg sm:text-xl font-semibold text-primary mb-4">{category.benefit}</p>
                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
                      {category.description}
                    </p>
                    <ul className="space-y-3">
                      {category.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="relative group">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${category.color} rounded-3xl blur-3xl opacity-10 group-hover:opacity-15 transition-opacity`} />
                      <img
                        src={category.image}
                        alt={`${category.title} - ${category.benefit}`}
                        className="relative w-full rounded-2xl shadow-2xl"
                        loading="lazy"
                        width="800"
                        height="600"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Product Catalog */}
                {category.catalogImages && category.catalogImages.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
                      {category.title} Catalog
                    </h3>
                    <ImageGallery images={category.catalogImages} columns={category.catalogImages.length > 4 ? 4 : 3} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-primary via-accent to-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {t("products.cta.title")}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-3xl mx-auto opacity-95">
            {t("products.cta.text")}
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="group">
              {t("products.cta.button")}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
