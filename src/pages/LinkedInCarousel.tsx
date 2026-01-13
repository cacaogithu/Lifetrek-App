import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Download, Star, Trash2, History, Image as ImageIcon, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Briefcase, User } from "lucide-react";
import { CarouselGenerationModal } from "@/components/carousel/CarouselGenerationModal";

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
  format?: string;
  imageUrls?: string[];
}

export default function LinkedInCarousel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [proofPoints, setProofPoints] = useState("");
  const [ctaAction, setCtaAction] = useState("");
  const [format, setFormat] = useState<"carousel" | "single-image">("carousel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [carouselResult, setCarouselResult] = useState<CarouselResult | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselHistory, setCarouselHistory] = useState<any[]>([]);
  const [carouselToDelete, setCarouselToDelete] = useState<string | null>(null);
  const [currentCarouselId, setCurrentCarouselId] = useState<string | null>(null);
  const [selectedProfileType, setSelectedProfileType] = useState<'company' | 'salesperson'>('company');
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [profileType, setProfileType] = useState<"company" | "salesperson">("company");

  const handleCarouselGenerated = () => {
    // TODO: Refresh carousel list
    console.log('Carousel generated, refreshing list...');
    setIsGenerationModalOpen(false); // Close modal after generation
    fetchCarouselHistory(); // Refresh the history list
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCarouselHistory();
    }
  }, [isAdmin, profileType]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/admin/login");
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (adminError || !adminData) {
        toast.error("Unauthorized access");
        navigate("/admin/login");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Access check error:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchCarouselHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("linkedin_carousels")
        .select("*")
        .eq("profile_type", profileType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCarouselHistory(data || []);
    } catch (error) {
      console.error("Error fetching carousel history:", error);
      toast.error("Failed to load carousel history");
    }
  };

  const saveCarousel = async (result: CarouselResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("linkedin_carousels")
        .insert([{
          admin_user_id: user.id,
          profile_type: profileType,
          topic,
          target_audience: targetAudience,
          pain_point: painPoint,
          desired_outcome: desiredOutcome,
          proof_points: proofPoints,
          cta_action: ctaAction,
          slides: result.slides as any,
          caption: result.caption,
          format: result.format || format,
          image_urls: result.imageUrls || [],
          generation_settings: {
            model: "google/gemini-2.5-flash-image",
            timestamp: new Date().toISOString()
          }
        }])
        .select()
        .single();

      if (error) throw error;

      setCurrentCarouselId(data.id);
      await fetchCarouselHistory();
      toast.success("Carousel saved successfully");
    } catch (error) {
      console.error("Error saving carousel:", error);
      toast.error("Failed to save carousel");
    }
  };

  const loadCarousel = (carousel: any) => {
    if (!carousel.slides || !Array.isArray(carousel.slides)) {
      toast.error("Invalid carousel data");
      return;
    }

    setTopic(carousel.topic);
    setTargetAudience(carousel.target_audience);
    setPainPoint(carousel.pain_point || "");
    setDesiredOutcome(carousel.desired_outcome || "");
    setProofPoints(carousel.proof_points || "");
    setCtaAction(carousel.cta_action || "");
    setCarouselResult({
      topic: carousel.topic,
      targetAudience: carousel.target_audience,
      slides: carousel.slides,
      caption: carousel.caption,
    });
    setCurrentSlide(0);
    setCurrentCarouselId(carousel.id);
    toast.success("Carousel loaded");
  };

  const toggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("linkedin_carousels")
        .update({ is_favorite: !currentFavorite })
        .eq("id", id);

      if (error) throw error;
      await fetchCarouselHistory();
      toast.success(currentFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const deleteCarousel = async () => {
    if (!carouselToDelete) return;

    try {
      const { error } = await supabase
        .from("linkedin_carousels")
        .delete()
        .eq("id", carouselToDelete);

      if (error) throw error;

      if (currentCarouselId === carouselToDelete) {
        setCarouselResult(null);
        setCurrentCarouselId(null);
      }

      await fetchCarouselHistory();
      toast.success("Carousel deleted");
    } catch (error) {
      console.error("Error deleting carousel:", error);
      toast.error("Failed to delete carousel");
    } finally {
      setCarouselToDelete(null);
    }
  };

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentJobId) return;

    console.log("Subscribing to job updates:", currentJobId);

    const channel = supabase
      .channel(`job - ${currentJobId} `)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id = eq.${currentJobId} `,
        },
        async (payload) => {
          const newStatus = payload.new.status;
          console.log("Job Update:", newStatus);

          if (newStatus === 'processing') {
            toast.info("AI is working on it...");
          } else if (newStatus === 'completed') {
            const result = payload.new.result;

            if (result && result.carousel) {
              setCarouselResult(result.carousel);
              await saveCarousel(result.carousel);
              toast.success("Carousel generated successfully!");
            } else {
              toast.error("Job completed but returned no data.");
            }

            setIsGenerating(false);
            setCurrentJobId(null);
            supabase.removeChannel(channel);
          } else if (newStatus === 'failed') {
            toast.error(`Generation Failed: ${payload.new.error || 'Unknown error'} `);
            setIsGenerating(false);
            setCurrentJobId(null);
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentJobId]);

  const handleGenerate = async () => {
    if (!topic || !targetAudience || !painPoint) {
      toast.error("Please fill in at least Topic, Target Audience, and Pain Point");
      return;
    }

    setIsGenerating(true);
    setCarouselResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in.");
        setIsGenerating(false);
        return;
      }

      // 1. Create Job in DB
      const { data: job, error } = await supabase
        .from('jobs')
        .insert({
          type: 'carousel_generation',
          status: 'pending',
          user_id: user.id,
          payload: {
            topic,
            targetAudience,
            painPoint,
            desiredOutcome,
            proofPoints,
            ctaAction,
            format,
            profileType,
          }
        })
        .select()
        .single();

      if (error) throw error;

      console.log("Job Queued:", job.id);
      setCurrentJobId(job.id);
      toast.success("Job Queued! You can wait here or check back later.");

      // 2. Dispatcher Trigger (Webhook handled by DB, but we can also ping if needed)
      // The DB Webhook should trigger the Dispatcher automatically.

    } catch (error: any) {
      console.error("Error queueing job:", error);
      toast.error(error.message || "Failed to start generation");
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!carouselResult) return;

    const content = `LinkedIn Carousel: ${carouselResult.topic}
Target Audience: ${carouselResult.targetAudience}

${carouselResult.slides.map((slide, idx) => `
=== Slide ${idx + 1} (${slide.type.toUpperCase()}) ===
Headline: ${slide.headline}
Body: ${slide.body}
`).join("\n")
      }

Caption:
${carouselResult.caption}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkedin - carousel - ${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Carousel exported!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              LinkedIn Carousel Generator
            </h1>
            <p className="text-muted-foreground">
              Generate high-converting LinkedIn carousels using Hormozi's proven frameworks
            </p>
          </div>
          <Button onClick={() => setIsGenerationModalOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Generate Carousel
          </Button>
        </div>

        <Tabs defaultValue="company" className="mb-8" onValueChange={(v) => setProfileType(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Company Page
            </TabsTrigger>
            <TabsTrigger value="salesperson" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Salesperson Profile
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            {profileType === 'company' ? <Briefcase className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {profileType === 'company' ? 'Company Content Studio' : 'Salesperson Content Studio'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {profileType === 'company'
              ? 'Creating authoritative content for the official Lifetrek page.'
              : 'Creating personal, expert-led content for your personal brand.'}
          </p>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History ({carouselHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Carousel Brief</CardTitle>
                  <CardDescription>
                    Provide details about your carousel. The AI will generate content following proven engagement principles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., How to avoid supplier quality issues"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience *</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger id="audience">
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Orthopedic manufacturers">Orthopedic manufacturers</SelectItem>
                        <SelectItem value="Dental implant OEMs">Dental implant OEMs</SelectItem>
                        <SelectItem value="Medical device R&D teams">Medical device R&D teams</SelectItem>
                        <SelectItem value="Quality managers">Quality managers</SelectItem>
                        <SelectItem value="Procurement specialists">Procurement specialists</SelectItem>
                        <SelectItem value="Regulatory affairs">Regulatory affairs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painPoint">Pain Point *</Label>
                    <Textarea
                      id="painPoint"
                      placeholder="e.g., Non-conformities delaying FDA submissions"
                      value={painPoint}
                      onChange={(e) => setPainPoint(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outcome">Desired Outcome</Label>
                    <Input
                      id="outcome"
                      placeholder="e.g., Fewer supplier audits, faster validation"
                      value={desiredOutcome}
                      onChange={(e) => setDesiredOutcome(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proof">Proof Points</Label>
                    <Textarea
                      id="proof"
                      placeholder="e.g., ISO 13485, ANVISA, 30+ years experience"
                      value={proofPoints}
                      onChange={(e) => setProofPoints(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta">Call-to-Action</Label>
                    <Input
                      id="cta"
                      placeholder="e.g., DM 'ORTHO' for machining capacity guide"
                      value={ctaAction}
                      onChange={(e) => setCtaAction(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Content Format</Label>
                    <Select value={format} onValueChange={(value: "carousel" | "single-image") => setFormat(value)}>
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carousel">Carousel (5-7 slides with images)</SelectItem>
                        <SelectItem value="single-image">Single Image Post</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {format === "carousel"
                        ? "Generate multiple slides with professional images for each"
                        : "Generate one comprehensive image with all key points"}
                    </p>
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
                        Generating...
                      </>
                    ) : (
                      "Generate Carousel"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription>
                        {carouselResult
                          ? `Slide ${currentSlide + 1} of ${carouselResult.slides.length} `
                          : "Generate a carousel to see the preview"}
                      </CardDescription>
                    </div>
                    {carouselResult && (
                      <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {carouselResult ? (
                    <>
                      {/* Slide Display */}
                      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-8 min-h-[400px] flex flex-col justify-center">
                        {carouselResult.imageUrls && carouselResult.imageUrls[currentSlide] && (
                          <div className="mb-6 rounded-lg overflow-hidden border-2 border-primary/20">
                            <img
                              src={carouselResult.imageUrls[currentSlide]}
                              alt={`Slide ${currentSlide + 1} `}
                              className="w-full h-auto"
                            />
                          </div>
                        )}
                        <div className="space-y-4">
                          <Badge variant="outline" className="w-fit">
                            {carouselResult.slides[currentSlide].type.toUpperCase()}
                          </Badge>
                          <h3 className="text-2xl font-bold">
                            {carouselResult.slides[currentSlide].headline}
                          </h3>
                          <p className="text-muted-foreground whitespace-pre-line">
                            {carouselResult.slides[currentSlide].body}
                          </p>
                          {carouselResult.imageUrls && carouselResult.imageUrls[currentSlide] && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = carouselResult.imageUrls![currentSlide];
                                link.download = `slide - ${currentSlide + 1}.png`;
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Image
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                          disabled={currentSlide === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex gap-2">
                          {carouselResult.slides.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentSlide(idx)}
                              className={`w - 2 h - 2 rounded - full transition - colors ${idx === currentSlide ? "bg-primary" : "bg-muted"
                                } `}
                            />
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentSlide(Math.min(carouselResult.slides.length - 1, currentSlide + 1))
                          }
                          disabled={currentSlide === carouselResult.slides.length - 1}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>

                      {/* Caption */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">LinkedIn Caption</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {carouselResult.caption}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                      <p>Fill in the form and click Generate to create your carousel</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Carousel History</CardTitle>
                <CardDescription>View and manage your generated carousels</CardDescription>
              </CardHeader>
              <CardContent>
                {carouselHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No carousels generated yet. Create your first one!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {carouselHistory.map((carousel) => (
                      <Card key={carousel.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold truncate">{carousel.topic}</h3>
                              {carousel.is_favorite && (
                                <Star className="h-4 w-4 fill-primary text-primary flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{carousel.target_audience}</Badge>
                              <Badge variant="secondary">
                                {carousel.format === "single-image" ? "Single Image" : `${carousel.slides?.length || 0} slides`}
                              </Badge>
                              {carousel.image_urls && carousel.image_urls.length > 0 && (
                                <Badge variant="outline" className="gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  {carousel.image_urls.length} images
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(carousel.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFavorite(carousel.id, carousel.is_favorite)}
                            >
                              <Star className={carousel.is_favorite ? "h-4 w-4 fill-primary" : "h-4 w-4"} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadCarousel(carousel)}
                            >
                              Load
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCarouselToDelete(carousel.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!carouselToDelete} onOpenChange={() => setCarouselToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Carousel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this carousel? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCarousel}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CarouselGenerationModal
        open={isGenerationModalOpen}
        onOpenChange={setIsGenerationModalOpen}
        onGenerated={handleCarouselGenerated}
      />
    </div>
  );
}
