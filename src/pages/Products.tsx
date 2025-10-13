import { useLanguage } from "@/contexts/LanguageContext";
import { Stethoscope, Wrench, Smile, PawPrint } from "lucide-react";
import productDisplay from "@/assets/products/product-display.png";

export default function Products() {
  const { t } = useLanguage();

  const productCategories = [
    {
      icon: Stethoscope,
      title: t("products.medical.title"),
      description: t("products.medical.text"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Wrench,
      title: t("products.instruments.title"),
      description: t("products.instruments.text"),
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Smile,
      title: t("products.dental.title"),
      description: t("products.dental.text"),
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
    },
    {
      icon: PawPrint,
      title: t("products.veterinary.title"),
      description: t("products.veterinary.text"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 animate-fade-in">
            {t("products.title")}
          </h1>
        </div>
      </section>

      {/* Product Display Image */}
      <section className="py-12 sm:py-16 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <img
              src={productDisplay}
              alt="Comprehensive range of medical implants, dental products, and surgical instruments"
              className="w-full rounded-lg shadow-2xl"
              loading="lazy"
              width="800"
              height="600"
            />
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {productCategories.map((category, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${category.bg} mb-6`}>
                  <category.icon className={`h-8 w-8 ${category.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{category.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
