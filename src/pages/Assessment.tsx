import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BlobBackground } from "@/components/BlobBackground";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function Assessment() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    projectType: "",
    volume: "",
    timeline: "",
    requirements: "",
    timeSlot: ""
  });

  const { elementRef, isVisible } = useScrollAnimation();

  const timeSlots = [
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Handle final submission
      console.log("Assessment submitted:", { ...formData, date });
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground py-20 sm:py-32">
        <BlobBackground />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-bold mb-6 animate-fade-in">
              Free Manufacturing Assessment
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              Get expert guidance on your medical device manufacturing project
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Form */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <BlobBackground />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {step === 3 ? (
            <div className="max-w-2xl mx-auto text-center glass-card-strong p-12 rounded-2xl">
              <CheckCircle2 className="h-20 w-20 text-accent mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Assessment Scheduled!</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We've received your request and will send you a confirmation email shortly.
              </p>
              {date && formData.timeSlot && (
                <div className="glass-card p-6 rounded-xl mb-8">
                  <p className="font-semibold mb-2">Your scheduled consultation:</p>
                  <p className="text-lg">
                    {format(date, "MMMM dd, yyyy")} at {formData.timeSlot}
                  </p>
                </div>
              )}
              <p className="text-muted-foreground">
                Our team will reach out to you at <strong>{formData.email}</strong> to confirm the details.
              </p>
            </div>
          ) : (
            <div 
              ref={elementRef}
              className={`max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {/* Progress Steps */}
              <div className="flex justify-center items-center mb-12 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    1
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Project Details</span>
                </div>
                <div className="h-0.5 w-12 bg-border" />
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Schedule Call</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="glass-card-strong p-8 sm:p-12 rounded-2xl space-y-6">
                {step === 1 ? (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Tell us about your project</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="glass-card"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="glass-card"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input
                          id="company"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="glass-card"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="glass-card"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="projectType">Project Type *</Label>
                        <Select 
                          required
                          value={formData.projectType}
                          onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                        >
                          <SelectTrigger className="glass-card">
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

                      <div className="space-y-2">
                        <Label htmlFor="volume">Expected Volume</Label>
                        <Input
                          id="volume"
                          placeholder="e.g., 10,000 units/year"
                          value={formData.volume}
                          onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                          className="glass-card"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeline">Project Timeline</Label>
                      <Input
                        id="timeline"
                        placeholder="When do you need to start production?"
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="glass-card"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requirements">Project Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="Tell us about your specific requirements, tolerances, materials, certifications needed, etc."
                        rows={4}
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        className="glass-card"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Continue to Schedule
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Schedule your consultation</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Select Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal glass-card",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) => 
                                date < new Date() || date.getDay() === 0 || date.getDay() === 6
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeSlot">Select Time Slot *</Label>
                        <Select 
                          required
                          value={formData.timeSlot}
                          onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                        >
                          <SelectTrigger className="glass-card">
                            <SelectValue placeholder="Choose a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot} value={slot}>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {slot}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="glass-card p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm text-muted-foreground">
                          <strong>What to expect:</strong> Our manufacturing expert will review your project requirements, 
                          discuss feasibility, provide preliminary timeline and cost estimates, and answer your technical questions.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="flex-1"
                        disabled={!date || !formData.timeSlot}
                      >
                        Schedule Assessment
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}