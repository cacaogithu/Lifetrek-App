import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Download, Star, Trash2, History, Image as ImageIcon, Wand2, Layout, Save, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SlideCanvas } from "@/components/carousel/SlideCanvas";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";

interface CarouselSlide {
  headline: string;
  body: string;
  type: "hook" | "content" | "cta";
  imageUrl?: string;
  assetId?: string;
  backgroundType?: "asset" | "generate";
}

interface CarouselResult {
  id?: string;
  topic: string;
  targetAudience: string;
  slides: CarouselSlide[];
  caption: string;
  format?: string;
  imageUrls?: string[]; // Legacy support
}

export default function LinkedInCarousel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Generation State
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [proofPoints, setProofPoints] = useState("");
  const [ctaAction, setCtaAction] = useState("");
  const [format, setFormat] = useState<"carousel" | "single-image">("carousel");

  // Workflow State
  const [currentStep, setCurrentStep] = useState<"content" | "design">("content");
  const [isGenerating, setIsGenerating] = useState(false);
  const [carouselResult, setCarouselResult] = useState<CarouselResult | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselHistory, setCarouselHistory] = useState<any[]>([]);
  const [carouselToDelete, setCarouselToDelete] = useState<string | null>(null);
  const [currentCarouselId, setCurrentCarouselId] = useState<string | null>(null);

  // Design State
  const slideRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null); // Hidden ref for high-res export
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [designLoading, setDesignLoading] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCarouselHistory();
      fetchAssets();
    }
  }, [isAdmin]);

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCarouselHistory(data || []);
    } catch (error) {
      console.error("Error fetching carousel history:", error);
      toast.error("Failed to load carousel history");
    }
  };

  const fetchAssets = async () => {
    // content_assets table não existe ainda - desabilitado por enquanto
    // Para habilitar, criar a tabela content_assets no banco
    setAvailableAssets([]);
  };

  const saveCarousel = async (result: CarouselResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const payload = {
        admin_user_id: user.id,
        topic,
        target_audience: targetAudience,
        pain_point: painPoint,
        desired_outcome: desiredOutcome,
        proof_points: proofPoints,
        cta_action: ctaAction,
        slides: result.slides as any,
        caption: result.caption,
        format: result.format || format,
        image_urls: result.slides.map(s => s.imageUrl || ""),
        generation_settings: {
          model: "google/gemini-2.5-flash-image",
          timestamp: new Date().toISOString()
        }
      };

      if (currentCarouselId) {
        // Update
        const { error } = await supabase
          .from("linkedin_carousels")
          .update(payload)
          .eq("id", currentCarouselId);
        if (error) throw error;
        toast.success("Carousel updated");
      } else {
        // Insert
        const { data, error } = await supabase
          .from("linkedin_carousels")
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        setCurrentCarouselId(data.id);
        toast.success("Carousel saved");
      }

      await fetchCarouselHistory();
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
    // Normalize slides to ensure they have imageUrl
    const normalizedSlides = carousel.slides.map((s: any, idx: number) => ({
      ...s,
      imageUrl: s.imageUrl || (carousel.image_urls?.[idx] || "")
    }));

    setCarouselResult({
      id: carousel.id,
      topic: carousel.topic,
      targetAudience: carousel.target_audience,
      slides: normalizedSlides,
      caption: carousel.caption,
    });
    setCurrentSlide(0);
    setCurrentCarouselId(carousel.id);
    setCurrentStep("design");
    toast.success("Carousel loaded");
  };

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
          format,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCarouselResult(data.carousel);
      setCurrentSlide(0);
      setCurrentStep("design");
      setCurrentCarouselId(null); // New generation, new ID needed eventually
      toast.success("Content generated! Now moving to design.");
    } catch (error: any) {
      console.error("Error generating carousel:", error);
      toast.error(error.message || "Failed to generate carousel");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSlideImage = (url: string) => {
    if (!carouselResult) return;
    const newSlides = [...carouselResult.slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], imageUrl: url };
    setCarouselResult({ ...carouselResult, slides: newSlides });
  };

  const handleExportImages = async () => {
    if (!carouselResult || !exportRef.current) return;

    setDesignLoading(true);
    const zip = new JSZip();

    try {
      // We need to render each slide and capture it
      // Since we only render one slide at a time currently, this approach is tricky.
      // Better approach: Iterate state, render, wait, capture.
      // Or render ALL slides in a hidden container. 
      // Let's go with hidden container logic implicitly or just loop through current slide for quick prototype

      // Actually, to get high res, we should use the hidden exportRef which we will update cyclically
      // But React state updates are async. 
      // We will loop, waiting for a brief tick.

      // This is complex. Simplest MVP: Export CURRENT slide.
      // User asked for "Carousel Generator", implying bulk.
      // Let's rely on user exporting one by one OR implement a proper "download all" which renders a hidden list.

      // Let's modify the JSX to include a "Hidden Render Area" where we map ALL slides
      // and capture them.

      const slides = carouselResult.slides;
      const promises = slides.map(async (slide, index) => {
        // We need to target the SPECIFIC element for this slide.
        // We will render them all in a hidden div with IDs.
        const elementId = `export-slide-${index}`;
        const node = document.getElementById(elementId);
        if (!node) return null;

        const dataUrl = await htmlToImage.toPng(node as HTMLElement, { pixelRatio: 2 });
        return { name: `slide-${index + 1}.png`, data: dataUrl };
      });

      const results = await Promise.all(promises);

      results.forEach(res => {
        if (res) {
          // Remove data:image/png;base64,
          const data = res.data.split(',')[1];
          zip.file(res.name, data, { base64: true });
        }
      });

      // Also add caption
      zip.file("caption.txt", carouselResult.caption);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carousel-${carouselResult.topic.replace(/\s+/g, '-').toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded all slides!");

    } catch (error) {
      console.error("Export error", error);
      toast.error("Failed to export images");
    } finally {
      setDesignLoading(false);
    }
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
    }
  };

  const deleteCarousel = async () => {
    if (!carouselToDelete) return;
    try {
      const { error } = await supabase.from("linkedin_carousels").delete().eq("id", carouselToDelete);
      if (error) throw error;
      if (currentCarouselId === carouselToDelete) {
        setCarouselResult(null);
        setCurrentCarouselId(null);
        setCurrentStep("content");
      }
      await fetchCarouselHistory();
      toast.success("Carousel deleted");
    } catch (error) {
      toast.error("Failed to delete carousel");
    } finally {
      setCarouselToDelete(null);
    }
  };

  const assetsByCategory = availableAssets.reduce((acc: any, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {});

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              LinkedIn Carousel Studio
            </h1>
            <p className="text-muted-foreground">Strategic B2B content generation</p>
          </div>

          {carouselResult && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => saveCarousel(carouselResult)}>
                <Save className="mr-2 h-4 w-4" />
                Save Project
              </Button>
              <Button onClick={handleExportImages} disabled={designLoading}>
                {designLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                Export All
              </Button>
            </div>
          )}
        </div>

        {/* Workflow Tabs (Stepper) */}
        {!carouselResult && (
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
              <TabsTrigger value="generate">Create New</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Content Brief</CardTitle>
                  <CardDescription>Define the strategic goal of your carousel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Topic</Label>
                      <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Reducing manufacturing defects" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Target Audience</Label>
                        <Select value={targetAudience} onValueChange={setTargetAudience}>
                          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Orthopedic manufacturers">Orthopedic manufacturers</SelectItem>
                            <SelectItem value="Medical device R&D">Medical device R&D</SelectItem>
                            <SelectItem value="Quality managers">Quality managers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Format</Label>
                        <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="carousel">Carousel (PDF/Images)</SelectItem>
                            <SelectItem value="single-image">Single Post</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Pain Point</Label>
                      <Textarea value={painPoint} onChange={e => setPainPoint(e.target.value)} />
                    </div>
                    {/* Advanced optional fields could be collapsed */}
                    <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                      {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
                      Generate Content Strategy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carouselHistory.map(h => (
                  <Card key={h.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadCarousel(h)}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base truncate">{h.topic}</CardTitle>
                      <CardDescription className="text-xs">{new Date(h.created_at).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex justify-between">
                      <Badge variant="secondary">{h.format}</Badge>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setCarouselToDelete(h.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* WORKSPACE AREA */}
        {carouselResult && (
          <div className="grid lg:grid-cols-[300px_1fr_300px] gap-8 h-[calc(100vh-200px)]">

            {/* LEFT PANEL: Slides List */}
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="py-4">
                <CardTitle className="text-sm">Slides Content</CardTitle>
              </CardHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {carouselResult.slides.map((slide, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${currentSlide === idx ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-muted'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center p-0 rounded-full">{idx + 1}</Badge>
                      <span className="text-xs font-semibold uppercase">{slide.type}</span>
                    </div>
                    <p className="text-xs font-medium line-clamp-2 text-foreground/80">{slide.headline}</p>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <h4 className="text-xs font-bold mb-2">Caption</h4>
                  <p className="text-xs text-muted-foreground line-clamp-6">{carouselResult.caption}</p>
                </div>
              </div>
            </Card>

            {/* CENTER PANEL: Canvas */}
            <div className="h-full flex flex-col items-center justify-center bg-accent/20 rounded-xl p-8 relative">
              <div className="w-full max-w-[600px] shadow-2xl rounded-sm overflow-hidden ring-1 ring-slate-900/5">
                <SlideCanvas
                  mode="preview"
                  slide={carouselResult.slides[currentSlide]}
                  aspectRatio="square"
                />
              </div>

              {/* Hidden Export Area */}
              <div className="absolute top-0 left-0 overflow-hidden w-0 h-0 opacity-0 pointer-events-none">
                {carouselResult.slides.map((s, idx) => (
                  <div id={`export-slide-${idx}`} key={idx}>
                    <SlideCanvas mode="export" slide={s} aspectRatio="square" />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4 mt-8">
                <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">Slide {currentSlide + 1} of {carouselResult.slides.length}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.min(carouselResult.slides.length - 1, currentSlide + 1))} disabled={currentSlide === carouselResult.slides.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* RIGHT PANEL: Design Tools */}
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="py-4">
                <CardTitle className="text-sm">Design Assets</CardTitle>
              </CardHeader>
              <Tabs defaultValue="assets" className="flex-1 flex flex-col">
                <TabsList className="mx-4">
                  <TabsTrigger value="assets" className="flex-1">Library</TabsTrigger>
                  <TabsTrigger value="generate" className="flex-1">Generate</TabsTrigger>
                </TabsList>

                <TabsContent value="assets" className="flex-1 overflow-y-auto p-4">
                  {Object.entries(assetsByCategory).map(([cat, assets]: [string, any[]]) => (
                    <div key={cat} className="mb-6">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">{cat}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {assets.map(asset => (
                          <div
                            key={asset.id}
                            className="aspect-square bg-muted rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group"
                            onClick={() => handleUpdateSlideImage(asset.public_url)}
                          >
                            <img src={asset.public_url} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-xs text-white font-medium">Use</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="generate" className="flex-1 p-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Regenerate the image for this slide using AI.</p>
                    {/* We could add prompt override here */}
                    <Button className="w-full" variant="secondary">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate Image
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        )}

        <AlertDialog open={!!carouselToDelete} onOpenChange={() => setCarouselToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteCarousel}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
