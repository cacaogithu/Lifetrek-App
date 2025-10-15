import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import exterior from "@/assets/facility/exterior.webp";
import { trackAnalyticsEvent } from "@/utils/trackAnalytics";
import { z } from "zod";
import { logError } from "@/utils/errorLogger";
import { SEO } from "@/components/SEO";
import { organizationSchema, generateBreadcrumbSchema } from "@/utils/structuredData";

// Zod validation schema
const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  company: z.string()
    .trim()
    .max(200, { message: "Company name must be less than 200 characters" })
    .optional(),
  message: z.string()
    .trim()
    .min(1, { message: "Message is required" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});

export default function Contact() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://lifetrek-global-site.lovable.app/' },
    { name: 'Contact', url: 'https://lifetrek-global-site.lovable.app/contact' }
  ]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data with Zod
      const validatedData = contactSchema.parse({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        message: formData.message,
      });

      // Track form submission with sanitized data
      await trackAnalyticsEvent({
        eventType: "form_submission",
        companyName: validatedData.company || "Not provided",
        companyEmail: validatedData.email,
        metadata: {
          formType: "contact",
          name: validatedData.name,
          message: validatedData.message.substring(0, 100),
        },
      });

      toast.success("Message sent successfully! We'll get back to you soon.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        message: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Show first validation error
        toast.error(error.errors[0].message);
      } else {
        logError(error, "Contact form submission");
        toast.error("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Contact Us"
        description="Contact Lifetrek Medical for precision medical device manufacturing. Get in touch for quotes, technical consultations, and partnership opportunities. ISO 13485 certified manufacturer."
        keywords="contact medical device manufacturer, medical device quote, precision manufacturing inquiry, medical implant supplier contact"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema, breadcrumbSchema]
        }}
      />
      
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : t("contact.form.submit")}
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
