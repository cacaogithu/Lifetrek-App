import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselSlide {
  headline: string;
  body: string;
  type: "hook" | "content" | "cta";
}

interface CarouselResult {
  topic: string;
  targetAudience: string;
  slides: CarouselSlide[];
  caption: string;
}

const LinkedInCarousel = () => {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [proofPoints, setProofPoints] = useState("");
  const [ctaAction, setCtaAction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CarouselResult | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleGenerate = async () => {
    if (!topic || !targetAudience || !painPoint) {
      toast.error("Please fill in at least Topic, Target Audience, and Pain Point");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-linkedin-carousel", {
        body: {
          topic,
          targetAudience,
          painPoint,
          desiredOutcome,
          proofPoints,
          ctaAction,
        },
      });

      if (error) throw error;

      setResult(data.carousel);
      setCurrentSlide(0);
      toast.success("Carousel generated successfully!");
    } catch (error) {
      console.error("Error generating carousel:", error);
      toast.error("Failed to generate carousel. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!result) return;

    const content = `LinkedIn Carousel: ${result.topic}
Target Audience: ${result.targetAudience}

${result.slides.map((slide, idx) => `
=== Slide ${idx + 1} (${slide.type.toUpperCase()}) ===
Headline: ${slide.headline}
Body: ${slide.body}
`).join("\n")}

Caption:
${result.caption}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkedin-carousel-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Carousel exported!");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            LinkedIn Carousel Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered carousel creation following Hormozi principles and LinkedIn best practices
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Carousel Brief
              </CardTitle>
              <CardDescription>
                Provide details about your carousel. The AI will generate content following proven engagement principles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic / Core Message *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., 5 Ways to Reduce Medical Device Recalls"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience *</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orthopedic">Orthopedic Manufacturers</SelectItem>
                    <SelectItem value="dental">Dental Implant OEMs</SelectItem>
                    <SelectItem value="spinal">Spinal Implant Companies</SelectItem>
                    <SelectItem value="veterinary">Veterinary Device Manufacturers</SelectItem>
                    <SelectItem value="surgical">Surgical Instrument Makers</SelectItem>
                    <SelectItem value="quality">Quality & Regulatory Managers</SelectItem>
                    <SelectItem value="procurement">Procurement & Sourcing Teams</SelectItem>
                    <SelectItem value="rd">R&D Engineers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="painPoint">Core Pain Point / Problem *</Label>
                <Textarea
                  id="painPoint"
                  placeholder="e.g., Supplier quality issues causing product recalls and regulatory delays"
                  value={painPoint}
                  onChange={(e) => setPainPoint(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome">Desired Outcome / Promise</Label>
                <Textarea
                  id="outcome"
                  placeholder="e.g., Reduce non-conformities by 80% and speed up regulatory approvals"
                  value={desiredOutcome}
                  onChange={(e) => setDesiredOutcome(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proof">Proof Points / Credentials</Label>
                <Textarea
                  id="proof"
                  placeholder="e.g., 25+ years experience, ISO 13485 certified, ANVISA registered, 10,000+ parts/month"
                  value={proofPoints}
                  onChange={(e) => setProofPoints(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta">Call-to-Action</Label>
                <Input
                  id="cta"
                  placeholder="e.g., DM 'QUALITY' for supplier checklist"
                  value={ctaAction}
                  onChange={(e) => setCtaAction(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic || !targetAudience || !painPoint}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Carousel...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Carousel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="space-y-4">
            {result ? (
              <>
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle>Carousel Preview</CardTitle>
                    <CardDescription>
                      Slide {currentSlide + 1} of {result.slides.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square bg-white rounded-lg shadow-2xl p-8 flex flex-col justify-center items-center text-center border-4 border-primary/20">
                      <div className="space-y-4 w-full">
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                          {result.slides[currentSlide].type.toUpperCase()}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                          {result.slides[currentSlide].headline}
                        </h3>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                          {result.slides[currentSlide].body}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {result.slides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/30"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.min(result.slides.length - 1, currentSlide + 1))}
                        disabled={currentSlide === result.slides.length - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>LinkedIn Caption</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap text-sm">{result.caption}</p>
                    </div>
                    <Button onClick={handleExport} variant="outline" className="mt-4 w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Carousel
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[600px]">
                <CardContent className="text-center py-12">
                  <Sparkles className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Fill in the brief and generate your carousel
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInCarousel;
