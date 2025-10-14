import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CalculatorInputs, CalculationResults } from "@/pages/Calculator";

interface LeadCaptureFormProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  onBack: () => void;
}

export function LeadCaptureForm({ inputs, results, onBack }: LeadCaptureFormProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call edge function to send email with results
      const { error } = await supabase.functions.invoke('send-calculator-report', {
        body: {
          contact: formData,
          inputs,
          results
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Report Sent!",
        description: "Check your email for the detailed analysis.",
      });
    } catch (error) {
      console.error('Error sending report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send report. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-[var(--shadow-elevated)] text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Report Sent Successfully!</h2>
          <p className="text-muted-foreground">
            We've sent a detailed PDF report to <strong>{formData.email}</strong>
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
          <p className="font-semibold text-sm">What's Next?</p>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Review your detailed PDF report with cost breakdowns and material specifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Our engineering team will contact you within 24 hours to discuss your project</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Schedule a free consultation to refine requirements and get a formal quote</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 space-y-3">
          <Button onClick={onBack} variant="outline" className="w-full">
            View Results Again
          </Button>
          <p className="text-xs text-muted-foreground">
            Questions? Call us at <a href="tel:+551939367193" className="text-primary hover:underline">+55 19 3936-7193</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-[var(--shadow-elevated)] space-y-6">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onBack}
        className="mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Results
      </Button>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Get Your Detailed Report</h2>
        <p className="text-muted-foreground">
          Enter your details to receive a comprehensive PDF analysis including material specifications, 
          production timeline, and expert recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            placeholder="John Smith"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            placeholder="john@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            required
            placeholder="Medical Devices Inc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Additional Details (Optional)</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            placeholder="Tell us more about your project timeline, specific requirements, or questions..."
            rows={3}
          />
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">📧 You'll Receive:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Detailed PDF cost analysis</li>
            <li>• Material specifications & recommendations</li>
            <li>• Production timeline breakdown</li>
            <li>• Quality control procedures</li>
            <li>• Free 30-minute consultation</li>
          </ul>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send My Detailed Report
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          We respect your privacy. Your information is secure and will never be shared.
        </p>
      </form>
    </div>
  );
}
