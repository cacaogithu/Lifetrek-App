import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      title: t("about.values.excellence"),
      description: t("about.values.excellence.text"),
      gradient: "from-primary/10 to-primary/5",
    },
    {
      title: t("about.values.innovation"),
      description: t("about.values.innovation.text"),
      gradient: "from-accent-orange/10 to-accent-orange/5",
    },
    {
      title: t("about.values.ethics"),
      description: t("about.values.ethics.text"),
      gradient: "from-accent/10 to-accent/5",
    },
    {
      title: t("about.values.respect"),
      description: t("about.values.respect.text"),
      gradient: "from-primary/10 to-primary/5",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground py-32">
        <div className="absolute inset-0 bg-[image:var(--gradient-subtle)] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="font-bold mb-6 animate-fade-in">
            {t("about.title")}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed animate-fade-in opacity-95" style={{ animationDelay: "0.2s" }}>
            {t("about.intro")}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="group bg-card p-10 lg:p-12 rounded-2xl shadow-[var(--shadow-elevated)] hover:shadow-[var(--shadow-premium)] transition-all duration-500 hover:-translate-y-1 border border-border/50">
              <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 mb-8 rounded-full" />
              <h2 className="text-3xl font-bold mb-6">{t("about.mission.title")}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t("about.mission.text")}
              </p>
            </div>

            <div className="group bg-card p-10 lg:p-12 rounded-2xl shadow-[var(--shadow-elevated)] hover:shadow-[var(--shadow-premium)] transition-all duration-500 hover:-translate-y-1 border border-border/50">
              <div className="h-1 w-16 bg-gradient-to-r from-accent to-accent/50 mb-8 rounded-full" />
              <h2 className="text-3xl font-bold mb-6">{t("about.vision.title")}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t("about.vision.text")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 bg-[image:var(--gradient-premium)]">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-center mb-20">
            {t("about.values.title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className={`group text-center p-8 rounded-2xl bg-gradient-to-br ${value.gradient} backdrop-blur-sm border border-border/30 hover:shadow-[var(--shadow-elevated)] transition-all duration-500 hover:-translate-y-2`}
              >
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
