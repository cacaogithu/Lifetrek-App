import { useLanguage } from "@/contexts/LanguageContext";
import { Building2, Cpu, Users, Sparkles } from "lucide-react";
import cleanroom from "@/assets/facility/cleanroom.jpg";
import reception from "@/assets/facility/reception.jpg";

export default function Infrastructure() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            {t("infrastructure.title")}
          </h1>
        </div>
      </section>

      {/* Cleanrooms */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {t("infrastructure.cleanrooms.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("infrastructure.cleanrooms.text")}
              </p>
            </div>
            <div>
              <img
                src={cleanroom}
                alt="ISO 7 Cleanroom"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Equipment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={reception}
                alt="Facility Reception"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {t("infrastructure.equipment.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("infrastructure.equipment.text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("infrastructure.technology")}
              </h3>
              <p className="text-muted-foreground">
                Latest generation CNC equipment and advanced manufacturing systems
              </p>
            </div>

            <div className="text-center p-8 bg-card rounded-lg shadow-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t("infrastructure.team")}
              </h3>
              <p className="text-muted-foreground">
                Expert professionals dedicated to excellence and precision
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
