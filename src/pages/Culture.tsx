import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, TrendingUp, Award, Users } from "lucide-react";
import reception from "@/assets/facility/reception.jpg";

export default function Culture() {
  const { t } = useLanguage();

  const cultureValues = [
    {
      icon: Sparkles,
      title: "Cleanliness & Organization",
      description: t("culture.cleanliness"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Award,
      title: "Quality Excellence",
      description: t("culture.quality"),
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: TrendingUp,
      title: "Professional Development",
      description: t("culture.training"),
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            {t("culture.title")}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t("culture.cleanliness")}
              </p>
              <div className="flex items-center gap-4 p-6 bg-card rounded-lg shadow-lg">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Team Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    Highly qualified professionals committed to innovation
                  </p>
                </div>
              </div>
            </div>
            <div>
              <img
                src={reception}
                alt="Lifetrek Medical Culture"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Culture Values */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cultureValues.map((value, index) => (
              <div
                key={index}
                className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${value.bg} mb-6`}>
                  <value.icon className={`h-8 w-8 ${value.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
