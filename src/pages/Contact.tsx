import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import exterior from "@/assets/facility/exterior.jpg";

export default function Contact() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address.",
      });
      return;
    }

    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });

    setFormData({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground py-16 sm:py-20 md:py-32">
        <div className="absolute inset-0 bg-[image:var(--gradient-subtle)] opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="font-bold animate-fade-in">
            {t("contact.title")}
          </h1>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">
            {/* Contact Form */}
            <div className="bg-card p-10 lg:p-12 rounded-2xl shadow-[var(--shadow-elevated)] border border-border/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    {t("contact.form.name")} *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    {t("contact.form.email")} *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-2">
                    {t("contact.form.company")}
                  </label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    {t("contact.form.message")} *
                  </label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  {t("contact.form.submit")}
                </Button>
              </form>
            </div>

            {/* Contact Info & Image */}
            <div className="space-y-6 sm:space-y-10">
              <div>
                <img
                  src={exterior}
                  alt="Lifetrek Medical facility exterior building"
                  className="rounded-2xl shadow-[var(--shadow-premium)] hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width="600"
                  height="400"
                />
              </div>

              <div className="space-y-8 bg-card p-10 rounded-2xl shadow-[var(--shadow-soft)] border border-border/50">
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="font-bold text-lg mb-2">{t("contact.info.email")}</h3>
                  <a
                    href="mailto:contact@lifetrek-medical.com"
                    className="text-muted-foreground text-lg hover:text-primary transition-colors"
                  >
                    contact@lifetrek-medical.com
                  </a>
                </div>

                <div className="border-l-4 border-accent pl-6">
                  <h3 className="font-bold text-lg mb-2">{t("contact.info.phone")}</h3>
                  <a
                    href="tel:+551939367193"
                    className="text-muted-foreground text-lg hover:text-primary transition-colors"
                  >
                    +55 19 3936-7193
                  </a>
                </div>

                <div className="border-l-4 border-accent-orange pl-6">
                  <h3 className="font-bold text-lg mb-2">{t("contact.info.address")}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{t("contact.location")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
