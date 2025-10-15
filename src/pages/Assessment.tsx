import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trackAnalyticsEvent } from "@/utils/trackAnalytics";
import { z } from "zod";
import { logError } from "@/utils/errorLogger";

// Zod validation schema
const assessmentSchema = z.object({
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
  phone: z.string()
    .trim()
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional(),
  projectType: z.string()
    .trim()
    .max(200, { message: "Project type must be less than 200 characters" }),
  volume: z.string()
    .trim()
    .max(200, { message: "Volume must be less than 200 characters" }),
  timeline: z.string()
    .trim()
    .max(200, { message: "Timeline must be less than 200 characters" }),
  requirements: z.string()
    .trim()
    .min(1, { message: "Requirements are required" })
    .max(2000, { message: "Requirements must be less than 2000 characters" }),
});

export default function Assessment() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    volume: "",
    timeline: "",
    requirements: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data with Zod
      const validatedData = assessmentSchema.parse({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        phone: formData.phone || undefined,
        projectType: formData.projectType,
        volume: formData.volume,
        timeline: formData.timeline,
        requirements: formData.requirements,
      });

      // Track lead magnet usage with sanitized data (NO SENSITIVE LOGGING)
      await trackAnalyticsEvent({
        eventType: "lead_magnet_usage",
        companyName: validatedData.company || "Not provided",
        companyEmail: validatedData.email,
        metadata: {
          leadMagnetType: "feasibility_assessment",
          projectType: validatedData.projectType,
          volume: validatedData.volume,
          timeline: validatedData.timeline,
        },
      });

      toast.success("Thank you! Your assessment request has been submitted. We'll contact you within 24 hours.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        projectType: "",
        volume: "",
        timeline: "",
        requirements: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        logError(error, "Assessment form submission");
        toast.error("Failed to submit assessment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Manufacturing Feasibility Assessment</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="projectType">Project Type *</Label>
              <Select 
                required
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical Implants</SelectItem>
                  <SelectItem value="dental">Dental Components</SelectItem>
                  <SelectItem value="surgical">Surgical Instruments</SelectItem>
                  <SelectItem value="veterinary">Veterinary Devices</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="volume">Expected Volume</Label>
                <Input
                  id="volume"
                  placeholder="e.g., 10,000 units/year"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="When do you need to start?"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="requirements">Project Requirements *</Label>
              <Textarea
                id="requirements"
                placeholder="Tell us about your specific requirements..."
                rows={4}
                required
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Assessment Request"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
