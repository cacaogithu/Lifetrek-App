import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, ArrowRight, Target, Heart, Sparkles, PawPrint, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ImageGallery";
import medicalImplantsDiagram from "@/assets/products/medical-implants-diagram.png";
import dentalImplantsDiagram from "@/assets/products/dental-implants-diagram.png";
import medicalScrew from "@/assets/products/medical-screw.png";
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
import dentalBrocas from "@/assets/products/dental-brocas.png";
import dentalImplante from "@/assets/products/dental-implante.png";
import dentalFresas from "@/assets/products/dental-fresas.png";
import dentalInstrumentos from "@/assets/products/dental-instrumentos.png";

export default function Products() {
  const { t } = useLanguage();

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
      gallery: [
        { src: spinalImplants, alt: "Spinal Implants" },
        { src: orthopedicScrews, alt: "Orthopedic Screws" },
        { src: surgicalPins, alt: "Surgical Pins" },
        { src: medicalScrew, alt: "Medical Screw" },
      ],
      inProgress: false
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
      gallery: [
        { src: surgicalDrills, alt: "Surgical Drills" },
        { src: surgicalHandles, alt: "Surgical Handles" },
        { src: microInstruments, alt: "Micro Instruments" },
        { src: measuringTools, alt: "Measuring Tools" },
        { src: surgicalParts, alt: "Surgical Parts" },
      ],
      inProgress: false
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
      gallery: [
        { src: dentalImplante, alt: "Dental Implants" },
        { src: dentalAngulados, alt: "Angled Abutments" },
        { src: dentalBrocas, alt: "Dental Drills" },
        { src: dentalFresas, alt: "Dental Burs" },
        { src: dentalInstrumentos, alt: "Dental Instruments" },
        { src: dentalComponents, alt: "Dental Components" },
        { src: precisionComponents, alt: "Precision Components" },
      ],
      inProgress: false
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
      gallery: [],
      inProgress: true
    },
  ];

  return (
    <div className="min-h-screen">
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
          <div className="space-y-24 sm:space-y-32 md:space-y-40">
            {productCategories.map((category, index) => (
              <div key={index} className="space-y-12">
                {/* Category Header */}
                <div className="text-center max-w-3xl mx-auto">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${category.color} text-white mb-6`}>
                    <category.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{category.title}</h2>
                  <p className="text-xl sm:text-2xl font-semibold text-primary mb-4">{category.benefit}</p>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {category.description}
                  </p>
                  
                  {category.inProgress && (
                    <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-primary">
                        {t("products.veterinary.inProgress") || "Solutions in Development"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {category.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Product Catalog */}
                {category.gallery && category.gallery.length > 0 && (
                  <div className="max-w-7xl mx-auto">
                    <h3 className="text-2xl font-bold mb-6 text-center">Product Catalog</h3>
                    <ImageGallery 
                      images={category.gallery} 
                      columns={4}
                    />
                  </div>
                )}

                {category.inProgress && (
                  <div className="text-center">
                    <p className="text-muted-foreground italic">
                      {t("products.veterinary.comingSoon") || "Comprehensive veterinary solutions coming soon. Contact us for custom requirements."}
                    </p>
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
