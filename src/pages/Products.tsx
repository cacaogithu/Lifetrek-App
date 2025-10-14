import { useLanguage } from "@/contexts/LanguageContext";
import { Target, Heart, Sparkles, PawPrint, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/ImageGallery";
import { Card } from "@/components/ui/card";
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
      color: "from-blue-600 to-blue-400",
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
      color: "from-violet-600 to-violet-400",
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
      color: "from-teal-600 to-teal-400",
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
      color: "from-amber-600 to-amber-400",
      gallery: [],
      inProgress: true
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        
        <div className="relative container mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              {t("products.title")}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl opacity-95 leading-relaxed">
              {t("products.hero.subtitle")}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Product Categories - Cleaner Grid Layout */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-16 sm:gap-20 max-w-7xl mx-auto">
            {productCategories.map((category, index) => (
              <div key={index} className="group">
                {/* Category Card */}
                <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-500">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Side */}
                    <div className={`relative bg-gradient-to-br ${category.color} p-8 sm:p-12 flex items-center justify-center`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
                      <div className="relative w-full max-w-md">
                        <img 
                          src={category.image} 
                          alt={category.title}
                          className="w-full h-auto drop-shadow-2xl"
                        />
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="p-8 sm:p-12 flex flex-col justify-center bg-gradient-to-br from-background to-muted/20">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} text-white mb-6`}>
                        <category.icon className="h-7 w-7" />
                      </div>
                      
                      <h2 className="text-3xl sm:text-4xl font-bold mb-3">{category.title}</h2>
                      <p className="text-xl font-semibold text-primary mb-4">{category.benefit}</p>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                        {category.description}
                      </p>

                      {category.inProgress && (
                        <div className="inline-flex items-center gap-2 text-primary font-semibold">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          {t("products.veterinary.inProgress") || "Solutions in Development"}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Product Catalogue Section - Separate */}
                {category.gallery && category.gallery.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl sm:text-3xl font-bold">Product Catalogue</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-6" />
                    </div>
                    <ImageGallery 
                      images={category.gallery} 
                      columns={4}
                    />
                  </div>
                )}

                {category.inProgress && (
                  <div className="mt-8 text-center p-6 bg-muted/30 rounded-xl">
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
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary via-accent to-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t("products.cta.title")}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-95">
            {t("products.cta.text")}
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="group shadow-2xl">
              {t("products.cta.button")}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
