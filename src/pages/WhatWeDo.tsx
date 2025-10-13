import { useLanguage } from "@/contexts/LanguageContext";
import { Cog, Sparkles, CheckCircle2 } from "lucide-react";
import productApplications from "@/assets/products/product-applications.png";

export default function WhatWeDo() {
  const { t } = useLanguage();

  const capabilities = [
    "Sliding-head CNC Lathes",
    "Single-head CNC Lathes",
    "Machining Centers",
    "Precision Grinders",
    "ISO Certified Cleanrooms",
    "Electropolishing",
    "Passivation",
    "Laser Marking",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 animate-fade-in">
            {t("whatWeDo.title")}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t("whatWeDo.text")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Cog className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium">{t("whatWeDo.precision")}</span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <span className="font-medium">{t("whatWeDo.cleanroom")}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={productApplications}
                alt="Medical, dental, and veterinary product applications across multiple healthcare sectors"
                className="rounded-lg shadow-2xl"
                loading="lazy"
                width="600"
                height="450"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Our Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {capabilities.map((capability, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-card rounded-lg hover:shadow-lg transition-shadow"
              >
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm font-medium">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
