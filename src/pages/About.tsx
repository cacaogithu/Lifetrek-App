import { useLanguage } from "@/contexts/LanguageContext";
import { Target, Eye, Heart, Lightbulb, Shield, Users } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: t("about.values.excellence"),
      description: t("about.values.excellence.text"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Lightbulb,
      title: t("about.values.innovation"),
      description: t("about.values.innovation.text"),
      color: "text-accent-orange",
      bg: "bg-accent-orange/10",
    },
    {
      icon: Shield,
      title: t("about.values.ethics"),
      description: t("about.values.ethics.text"),
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Users,
      title: t("about.values.respect"),
      description: t("about.values.respect.text"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            {t("about.title")}
          </h1>
          <p className="text-xl max-w-3xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {t("about.intro")}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("about.mission.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.mission.text")}
              </p>
            </div>

            <div className="bg-card p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Eye className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("about.vision.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("about.vision.text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t("about.values.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg bg-card hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${value.bg} mb-4`}>
                  <value.icon className={`h-8 w-8 ${value.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
