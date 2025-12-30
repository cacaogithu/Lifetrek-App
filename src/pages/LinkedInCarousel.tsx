import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, Download, Star, Trash2, History, Image as ImageIcon, Wand2, Layout, Save, RefreshCw, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SlideCanvas, SlideLayout } from "@/components/carousel/SlideCanvas";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import jsPDF from "jspdf";
import { Skeleton } from "@/components/ui/skeleton";

interface CarouselSlide {
  headline: string;
  body: string;
  type: "hook" | "content" | "cta";
  imageUrl?: string;
  assetId?: string;
  backgroundType?: "asset" | "generate";
  layout?: SlideLayout;
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
  const [carouselResults, setCarouselResults] = useState<CarouselResult[]>([]);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselHistory, setCarouselHistory] = useState<any[]>([]);
  const [carouselToDelete, setCarouselToDelete] = useState<string | null>(null);
  const [currentCarouselId, setCurrentCarouselId] = useState<string | null>(null);
  
  // Batch State
  const [numberOfCarousels, setNumberOfCarousels] = useState(1);
  const [currentTheme, setCurrentTheme] = useState<"corporate" | "modern" | "bold">("corporate");

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
    try {
      const { data, error } = await supabase
        .from("content_assets" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Graceful fallback if table doesn't exist or other error
        console.warn("Could not fetch assets:", error.message);
        setAvailableAssets([]);
        return;
      }
      setAvailableAssets(data || []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAvailableAssets([]);
    }
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

    setCarouselResults([{
      id: carousel.id,
      topic: carousel.topic,
      targetAudience: carousel.target_audience,
      slides: normalizedSlides,
      caption: carousel.caption,
    }]);
    setCurrentCarouselIndex(0);
    setCurrentSlide(0);
    setCurrentCarouselId(carousel.id);
    setCurrentStep("design");
    toast.success("Carousel loaded");
  };

  // Plan Mode State
  const [plans, setPlans] = useState<CarouselResult[]>([]);
  const [viewMode, setViewMode] = useState<"input" | "plan_selection" | "editor">("input");

  const handleCreatePlan = async () => {
    if (!topic || !targetAudience) {
      toast.error("Please fill in Topic and Target Audience");
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
            numberOfCarousels: 3, // Force 3 options for planning
            mode: "plan"
        },
      });
      if (error) throw error;
      setPlans(data.carousels || []);
      setViewMode("plan_selection");
      toast.success("Strategy options generated! Choose one to produce.");
    } catch (error: any) {
        toast.error("Failed to generate plan");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleProduceFromPlan = async (selectedPlan: CarouselResult) => {
     setIsGenerating(true);
     try {
       // Use the plan's specific topic/angle
       const { data, error } = await supabase.functions.invoke("generate-linkedin-carousel", {
        body: {
            topic: selectedPlan.topic, // The specific angle from strategist
            targetAudience: selectedPlan.targetAudience,
            painPoint, // Keep original context
            desiredOutcome,
            proofPoints,
            ctaAction,
            format,
            numberOfCarousels: 1,
            mode: "generate"
        },
      });
      if (error) throw error;
      setCarouselResults(data.carousels || [data.carousel]);
      setViewMode("editor");
      setCurrentStep("design");
      toast.success("Carousel produced!");
     } catch (error) {
         toast.error("Production failed");
     } finally {
         setIsGenerating(false);
     }
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
          numberOfCarousels,
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCarouselResults(data.carousels || (data.carousel ? [data.carousel] : []));
      setCurrentCarouselIndex(0);
      setCurrentSlide(0);
      setCurrentStep("design");
      setViewMode("editor");
      setCurrentCarouselId(null); 
      toast.success(`Generated ${data.carousels?.length || 1} carousel(s)!`);
    } catch (error: any) {
      console.error("Error generating carousel:", error);
      toast.error(error.message || "Failed to generate carousel");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSlideImage = (url: string) => {
    if (!carouselResults[currentCarouselIndex]) return;
    const newResults = [...carouselResults];
    const newSlides = [...newResults[currentCarouselIndex].slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], imageUrl: url };
    newResults[currentCarouselIndex] = { ...newResults[currentCarouselIndex], slides: newSlides };
    setCarouselResults(newResults);
  };

  const handleExportImages = async () => {
    const activeCarousel = carouselResults[currentCarouselIndex];
    if (!activeCarousel) return;

    setDesignLoading(true);
    const zip = new JSZip();

    try {
      // Use hidden container method
      const promises = activeCarousel.slides.map(async (slide, index) => {
        const elementId = `export-slide-${index}`;
        const node = document.getElementById(elementId);
        if (!node) {
            console.error(`Node not found: ${elementId}`);
            return null;
        }

        // Wait a bit for images to load if needed, or retry
        // toPng can be flaky if images aren't fully loaded
        const dataUrl = await htmlToImage.toPng(node as HTMLElement, { 
            pixelRatio: 2,
            cacheBust: true,
        });
        return { name: `slide-${index + 1}.png`, data: dataUrl };
      });

      const results = await Promise.all(promises);

      results.forEach(res => {
        if (res) {
          const data = res.data.split(',')[1];
          zip.file(res.name, data, { base64: true });
        }
      });

      zip.file("caption.txt", activeCarousel.caption);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carousel-${activeCarousel.topic.replace(/\s+/g, '-').toLowerCase()}.zip`;
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

  const handleExportPDF = async () => {
    const activeCarousel = carouselResults[currentCarouselIndex];
    if (!activeCarousel) return;

    setDesignLoading(true);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [1080, 1350] // Standard LinkedIn Portrait
    });

    try {
      const slides = activeCarousel.slides;
      
      for (let i = 0; i < slides.length; i++) {
        const elementId = `export-slide-${i}`;
        const node = document.getElementById(elementId);
        if (!node) continue;

        // Capture slide
        const dataUrl = await htmlToImage.toPng(node as HTMLElement, { 
            pixelRatio: 2,
            cacheBust: true,
        });

        if (i > 0) pdf.addPage([1080, 1350]);
        pdf.addImage(dataUrl, "PNG", 0, 0, 1080, 1350);
      }

      pdf.save(`carousel-${activeCarousel.topic.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success("PDF Downloaded!");

    } catch (error) {
      console.error("PDF Export error", error);
      toast.error("Failed to export PDF");
    } finally {
      setDesignLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    const activeCarousel = carouselResults[currentCarouselIndex];
    if (!activeCarousel) return;
    
    setDesignLoading(true);
    try {
        const slide = activeCarousel.slides[currentSlide];
        
        const { data, error } = await supabase.functions.invoke("generate-linkedin-carousel", {
            body: {
                mode: "image_only",
                headline: slide.headline,
                body: slide.body,
                imagePrompt: slide.imageUrl ? "Variation of existing visual" : "Professional medical visual"
            }
        });

        if (error) throw error;
        if (data.imageUrl) {
            handleUpdateSlideImage(data.imageUrl);
            toast.success("Image regenerated!");
        } else {
             throw new Error("No image returned");
        }

    } catch (error) {
        console.error("Regen error:", error);
        toast.error("Failed to regenerate image");
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
        setCarouselResults([]);
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
              Estúdio de Carrossel LinkedIn
            </h1>
            <p className="text-muted-foreground">Geração estratégica de conteúdo B2B</p>
          </div>

          <Alert className="mb-6 bg-blue-50/50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Dica Pro</AlertTitle>
            <AlertDescription className="text-blue-700">
              Crie slides educativos que abordem dores específicas dos clientes. Use a aba "Gerar" para deixar a IA construir a estrutura, depois personalize os visuais.
            </AlertDescription>
          </Alert>

          {carouselResults.length > 0 && (
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Layout className="h-4 w-4" />
                        Visualizar Experiência
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vh] w-auto p-0 bg-transparent border-0 shadow-none flex items-center justify-center">
                    <div className="relative w-[50vh] h-[62.5vh] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <SlideCanvas 
                            mode="preview" 
                            slide={carouselResults[currentCarouselIndex].slides[currentSlide]} 
                            aspectRatio="portrait"
                            theme={currentTheme}
                            layout={carouselResults[currentCarouselIndex].slides[currentSlide].layout}
                            className="w-full h-full"
                        />
                        {/* Overlay Controls for Preview */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button 
                                variant="secondary" size="icon" className="rounded-full h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentSlide(Math.max(0, currentSlide - 1));
                                }}
                                disabled={currentSlide === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-white text-xs font-medium drop-shadow-md">
                                {currentSlide + 1} / {carouselResults[currentCarouselIndex].slides.length}
                            </span>
                             <Button 
                                variant="secondary" size="icon" className="rounded-full h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentSlide(Math.min(carouselResults[currentCarouselIndex].slides.length - 1, currentSlide + 1));
                                }}
                                disabled={currentSlide === carouselResults[currentCarouselIndex].slides.length - 1}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => saveCarousel(carouselResults[currentCarouselIndex])}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Projeto
              </Button>
              <Button onClick={handleExportPDF} disabled={designLoading} variant="secondary">
                {designLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                Exportar PDF
              </Button>
              <Button onClick={handleExportImages} disabled={designLoading}>
                {designLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                Exportar Imagens
              </Button>
            </div>
          )}
        </div>

        {/* Workflow Tabs (Stepper) */}
        {carouselResults.length === 0 && (
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
              <TabsTrigger value="generate">Criar Novo</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Briefing de Conteúdo</CardTitle>
                  <CardDescription>Defina o objetivo estratégico do seu carrossel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Label>Tópico</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Tente: "5 Mitos sobre Usinagem Suíça" ou "Como Reduzir Falhas em Implantes"</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="ex: Reduzindo defeitos de fabricação" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Público Alvo</Label>
                        <Select value={targetAudience} onValueChange={setTargetAudience}>
                          <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fabricantes ortopédicos">Fabricantes ortopédicos</SelectItem>
                            <SelectItem value="P&D de dispositivos médicos">P&D de dispositivos médicos</SelectItem>
                            <SelectItem value="Gestores de qualidade">Gestores de qualidade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Formato</Label>
                        <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="carousel">Carrossel (PDF/Imagens)</SelectItem>
                            <SelectItem value="single-image">Post Único</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Dor do Cliente</Label>
                      <Textarea value={painPoint} onChange={e => setPainPoint(e.target.value)} />
                    </div>
                    {/* Advanced optional fields could be collapsed */}
                    
                    <div className="space-y-2">
                        <Label>Número de Opções (Lote)</Label>
                        <div className="flex items-center gap-4">
                            <Input 
                                type="number" 
                                min={1} 
                                max={5} 
                                value={numberOfCarousels} 
                                onChange={e => setNumberOfCarousels(parseInt(e.target.value))} 
                                className="max-w-[100px]"
                            />
                            <span className="text-sm text-muted-foreground">Gere múltiplas variações para escolher.</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={handleCreatePlan} disabled={isGenerating} variant="outline" size="lg" className="h-auto py-4 flex flex-col gap-1 items-center">
                            {isGenerating ? <Loader2 className="animate-spin mb-1" /> : <Layout className="mb-1 h-5 w-5" />}
                            <span className="font-semibold">Generate Strategy Plan</span>
                            <span className="text-xs font-normal opacity-70">Review 3 options first</span>
                        </Button>

                        <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="h-auto py-4 flex flex-col gap-1 items-center bg-gradient-to-r from-primary to-blue-600 hover:to-blue-700">
                             {isGenerating ? <Loader2 className="animate-spin mb-1" /> : <Wand2 className="mb-1 h-5 w-5" />}
                             <span className="font-semibold">Quick Generate</span>
                             <span className="text-xs font-normal opacity-70">Autopilot Mode</span>
                        </Button>
                    </div>
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
                      <CardDescription className="text-xs">{new Date(h.created_at).toLocaleDateString('pt-BR')}</CardDescription>
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
        {isGenerating ? (
           <div className="grid lg:grid-cols-[300px_1fr_300px] gap-8 h-[calc(100vh-200px)]">
             <Card className="h-full">
               <CardHeader><Skeleton className="h-4 w-[150px]" /></CardHeader>
               <CardContent className="space-y-4">
                 {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
               </CardContent>
             </Card>
             <div className="h-full flex items-center justify-center bg-accent/20 rounded-xl p-8">
               <div className="space-y-4 w-full max-w-[600px]">
                 <Skeleton className="aspect-square w-full rounded-sm" />
                 <div className="flex justify-between">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <Skeleton className="h-4 w-[200px]" />
                   <Skeleton className="h-10 w-10 rounded-full" />
                 </div>
               </div>
             </div>
             <Card className="h-full">
               <CardHeader><Skeleton className="h-4 w-[150px]" /></CardHeader>
               <CardContent className="grid grid-cols-2 gap-2">
                 {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square w-full" />)}
               </CardContent>
             </Card>
           </div>
        ) : viewMode === "plan_selection" && plans.length > 0 ? (
           <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold">Select Strategy</h2>
                    <p className="text-muted-foreground">The Strategist Agent has proposed 3 distinct angles.</p>
                  </div>
                  <Button variant="ghost" onClick={() => setViewMode("input")}>Cancel</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {plans.map((plan, idx) => (
                    <Card key={idx} className="hover:border-primary cursor-pointer transition-all hover:shadow-lg flex flex-col">
                       <CardHeader className="bg-muted/30 pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-background">Option {idx + 1}</Badge>
                             {idx === 0 && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Recommended</Badge>}
                          </div>
                          <CardTitle className="text-xl leading-tight">{plan.topic}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-2">{plan.targetAudience}</CardDescription>
                       </CardHeader>
                       <CardContent className="space-y-6 flex-1 pt-6">
                          <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                             <span className="text-xs font-bold uppercase text-muted-foreground block mb-1">The Hook</span>
                             <p className="font-medium text-sm leading-relaxed">"{plan.slides[0]?.headline}"</p>
                          </div>
                          
                          <div className="space-y-2">
                             <span className="text-xs font-bold uppercase text-muted-foreground">Flow</span>
                             <div className="space-y-2">
                                {plan.slides.slice(0, 3).map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        <span className="truncate opacity-80">{s.headline}</span>
                                    </div>
                                ))}
                                {plan.slides.length > 3 && <div className="text-xs text-muted-foreground pl-3.5 italic">...and {plan.slides.length - 3} more</div>}
                             </div>
                          </div>
                       </CardContent>
                       <div className="p-6 pt-0 mt-auto">
                        <Button className="w-full gap-2" onClick={() => handleProduceFromPlan(plan)}>
                             <Wand2 className="h-4 w-4" />
                             Select & Produce Assets
                          </Button>
                       </div>
                    </Card>
                 ))}
              </div>
           </div>
        ) : carouselResults.length > 0 && (
          <div className="grid lg:grid-cols-[300px_1fr_300px] gap-8 h-[calc(100vh-200px)]">

            {/* LEFT PANEL: Slides List */}
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="py-4">
                <CardTitle className="text-sm">Conteúdo dos Slides</CardTitle>
              </CardHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Batch Selector & Theme Control */}
                {carouselResults.length > 0 && (
                  <div className="mb-6 space-y-4">
                     <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Variações</Label>
                        <Select value={currentTheme} onValueChange={(v: any) => setCurrentTheme(v)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="Tema" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="corporate">Corporativo</SelectItem>
                                <SelectItem value="modern">Moderno</SelectItem>
                                <SelectItem value="bold">Ousado</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>

                     {carouselResults.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {carouselResults.map((result, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => { setCurrentCarouselIndex(idx); setCurrentSlide(0); }}
                                    className={`relative flex-shrink-0 w-24 aspect-[4/5] rounded-md overflow-hidden cursor-pointer border-2 transition-all group ${currentCarouselIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                                >
                                    <div className="absolute inset-0 pointer-events-none transform scale-[0.25] origin-top-left w-[400%] h-[400%]">
                                         <SlideCanvas 
                                            mode="preview" 
                                            slide={result.slides[0]} 
                                            aspectRatio="portrait"
                                            theme={currentTheme}
                                            layout={result.slides[0].layout}
                                         />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    {currentCarouselIndex === idx && (
                                        <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-white">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                     )}
                  </div>
                )}

                {carouselResults[currentCarouselIndex].slides.map((slide, idx) => (
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
                  <h4 className="text-xs font-bold mb-2">Legenda</h4>
                  <p className="text-xs text-muted-foreground line-clamp-6">{carouselResults[currentCarouselIndex].caption}</p>
                </div>
              </div>
            </Card>

            {/* CENTER PANEL: Canvas */}
            <div className="h-full flex flex-col items-center justify-center bg-accent/20 rounded-xl p-8 relative">
              <div className="w-full max-w-[600px] shadow-2xl rounded-sm overflow-hidden ring-1 ring-slate-900/5">
                <SlideCanvas
                  mode="preview"
                  slide={carouselResults[currentCarouselIndex].slides[currentSlide]}
                  aspectRatio="square"
                  theme={currentTheme}
                  layout={carouselResults[currentCarouselIndex].slides[currentSlide].layout}
                />
              </div>

              {/* Hidden Export Area */}
              <div className="absolute top-0 left-0 overflow-hidden w-0 h-0 opacity-0 pointer-events-none">
                {carouselResults[currentCarouselIndex].slides.map((s, idx) => (
                  <div id={`export-slide-${idx}`} key={idx}>
                    <SlideCanvas mode="export" slide={s} aspectRatio="square" theme={currentTheme} layout={s.layout} />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4 mt-8">
                <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">Slide {currentSlide + 1} de {carouselResults[currentCarouselIndex].slides.length}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.min(carouselResults[currentCarouselIndex].slides.length - 1, currentSlide + 1))} disabled={currentSlide === carouselResults[currentCarouselIndex].slides.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* RIGHT PANEL: Design Tools */}
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="py-4">
                <CardTitle className="text-sm">Recursos de Design</CardTitle>
              </CardHeader>
              <Tabs defaultValue="assets" className="flex-1 flex flex-col">
                <TabsList className="mx-4">
                  <TabsTrigger value="assets" className="flex-1">Biblioteca</TabsTrigger>
                  <TabsTrigger value="generate" className="flex-1">Gerar</TabsTrigger>
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
                              <span className="text-xs text-white font-medium">Usar</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="generate" className="flex-1 p-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Regenere a imagem deste slide usando IA.</p>
                    {/* We could add prompt override here */}
                    <Button className="w-full" variant="secondary" onClick={handleRegenerateImage} disabled={designLoading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerar Imagem
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
              <AlertDialogTitle>Excluir Projeto?</AlertDialogTitle>
              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={deleteCarousel}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
