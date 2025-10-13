import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Clients() {
  const { t } = useLanguage();

  const clientTypes = [
    {
      title: t("clients.types.medical.title"),
      description: t("clients.types.medical.description"),
    },
    {
      title: t("clients.types.dental.title"),
      description: t("clients.types.dental.description"),
    },
    {
      title: t("clients.types.veterinary.title"),
      description: t("clients.types.veterinary.description"),
    },
    {
      title: t("clients.types.healthcare.title"),
      description: t("clients.types.healthcare.description"),
    },
    {
      title: t("clients.types.contract.title"),
      description: t("clients.types.contract.description"),
    },
  ];

  const industries = [
    t("clients.industries.orthopedic"),
    t("clients.industries.spinal"),
    t("clients.industries.dental"),
    t("clients.industries.veterinary"),
    t("clients.industries.trauma"),
    t("clients.industries.instrumentation"),
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            {t("clients.title")}
          </h1>
          <p className="text-xl max-w-3xl leading-relaxed opacity-95">
            {t("clients.intro")}
          </p>
        </div>
      </section>

      {/* Client Types Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("clients.types.title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("clients.types.subtitle")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {clientTypes.map((client, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold mb-3">{client.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {client.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("clients.industries.title")}
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {t("clients.industries.subtitle")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg text-center border border-border hover:shadow-md transition-shadow"
              >
                <p className="font-semibold">{industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geographic Reach */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {t("clients.reach.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {t("clients.reach.text")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <h3 className="text-xl font-bold mb-2 text-primary">
                  {t("clients.reach.certifications.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("clients.reach.certifications.text")}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg border border-accent/20">
                <h3 className="text-xl font-bold mb-2 text-accent">
                  {t("clients.reach.global.title")}
                </h3>
                <p className="text-muted-foreground">
                  {t("clients.reach.global.text")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("clients.cta.title")}
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            {t("clients.cta.text")}
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary">
              {t("clients.cta.button")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
