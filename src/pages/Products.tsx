import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, ArrowRight, Target, Heart, Sparkles, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import medicalImplantsDiagram from "@/assets/products/medical-implants-diagram.png";
import dentalImplantsDiagram from "@/assets/products/dental-implants-diagram.png";
import medicalScrew from "@/assets/products/medical-screw.png";
import productDisplay from "@/assets/products/product-display.png";

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
    },
    {
      icon: PawPrint,
      image: productDisplay,
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
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {productCategories.map((category, index) => (
              <div
                key={index}
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
                    <div className={`absolute -inset-4 bg-gradient-to-br ${category.color} rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                    <img
                      src={category.image}
                      alt={`${category.title} - ${category.benefit}`}
                      className="relative w-full rounded-2xl shadow-2xl"
                      loading="lazy"
                      width="600"
                      height="450"
                    />
                  </div>
                </div>
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
