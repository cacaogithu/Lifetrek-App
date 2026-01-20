import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Download, Sparkles, ArrowLeft, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

// Sanitize filenames to remove special characters that Supabase Storage rejects
const sanitizeFilename = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')                    // Decompose accents
    .replace(/[\u0300-\u036f]/g, '')     // Remove accent marks
    .replace(/[/\\]/g, '-')              // Replace slashes with dashes
    .replace(/[^a-z0-9\-_.]/g, '-')      // Keep only safe chars
    .replace(/-+/g, '-')                 // Collapse multiple dashes
    .replace(/^-|-$/g, '');              // Trim leading/trailing dashes
};

interface ProcessedImage {
  id: string;
  originalUrl: string;
  originalFile: File;
  enhancedUrl?: string;
  analyzedName?: string;
  analyzedDescription?: string;
  analyzedCategory?: string;
  brand?: string;
  model?: string;
  isProcessing: boolean;
  error?: string;
}

export default function ProductImageProcessor() {
  const navigate = useNavigate();
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ProcessedImage[] = files.map((file) => ({
      id: Math.random().toString(36),
      originalUrl: URL.createObjectURL(file),
      originalFile: file,
      isProcessing: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
    toast.success(`${files.length} imagem(ns) carregada(s)`);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const saveToStorage = async (
    originalFile: File,
    enhancedImageUrl: string,
    analysis: {
      name: string;
      description: string;
      category: string;
      brand?: string;
      model?: string;
    },
    customPrompt?: string
  ) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Upload original image
      const originalPath = `originals/${Date.now()}-${sanitizeFilename(originalFile.name)}`;
      const { error: uploadOriginalError } = await supabase.storage
        .from('processed-products')
        .upload(originalPath, originalFile);

      if (uploadOriginalError) throw uploadOriginalError;

      // 2. Convert enhanced image (base64) to Blob and upload
      const enhancedBlob = await fetch(enhancedImageUrl).then(r => r.blob());
      const enhancedPath = `enhanced/${Date.now()}-${sanitizeFilename(analysis.name)}.png`;
      
      const { error: uploadEnhancedError } = await supabase.storage
        .from('processed-products')
        .upload(enhancedPath, enhancedBlob, {
          contentType: 'image/png',
          cacheControl: '3600'
        });

      if (uploadEnhancedError) throw uploadEnhancedError;

      // 3. Get public URLs
      const { data: { publicUrl: originalPublicUrl } } = supabase.storage
        .from('processed-products')
        .getPublicUrl(originalPath);

      const { data: { publicUrl: enhancedPublicUrl } } = supabase.storage
        .from('processed-products')
        .getPublicUrl(enhancedPath);

      // 4. Save metadata to database
      const { data: savedImage, error: dbError } = await supabase
        .from('processed_product_images')
        .insert({
          original_url: originalPublicUrl,
          enhanced_url: enhancedPublicUrl,
          name: analysis.name,
          description: analysis.description,
          category: analysis.category,
          brand: analysis.brand,
          model: analysis.model,
          original_filename: originalFile.name,
          file_size: originalFile.size,
          custom_prompt: customPrompt,
          processed_by: user?.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return savedImage;
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  };

  const processImageWithAnalysis = async (imageId: string) => {
    const imageIndex = images.findIndex((img) => img.id === imageId);
    if (imageIndex === -1) return;

    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, isProcessing: true, error: undefined } : img)),
    );

    try {
      const image = images[imageIndex];
      const imageData = await convertToBase64(image.originalFile);

      // Passo 1: Analisar produto (identificar nome/categoria)
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-product-image", {
        body: { imageUrl: imageData },
      });

      if (analysisError) throw analysisError;

      // Passo 2: Otimizar imagem
      const { data: enhancementData, error: enhancementError } = await supabase.functions.invoke(
        "enhance-product-image",
        { body: { imageData, prompt: customPrompt || undefined } },
      );

      if (enhancementError) throw enhancementError;

      // Passo 3: Salvar no Supabase Storage
      await saveToStorage(
        image.originalFile,
        enhancementData.enhancedImage,
        {
          name: analysisData.name,
          description: analysisData.description,
          category: analysisData.category,
          brand: analysisData.brand,
          model: analysisData.model
        },
        customPrompt || undefined
      );

      // Atualizar com todos os dados
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                enhancedUrl: enhancementData.enhancedImage,
                analyzedName: analysisData.name,
                analyzedDescription: analysisData.description,
                analyzedCategory: analysisData.category,
                brand: analysisData.brand,
                model: analysisData.model,
                isProcessing: false,
              }
            : img,
        ),
      );

      toast.success(`${analysisData.name} - Processado e salvo!`, {
        description: 'Imagem disponível na galeria'
      });
    } catch (error) {
      console.error("Error processing image:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar imagem";

      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, isProcessing: false, error: errorMessage } : img)),
      );

      toast.error(errorMessage);
    }
  };

  const processBatch = async () => {
    setIsProcessingBatch(true);
    setProgress(0);

    const unprocessedImages = images.filter((img) => !img.enhancedUrl && !img.error);
    const total = unprocessedImages.length;
    let completed = 0;

    // Processar até 10 imagens em paralelo
    const BATCH_SIZE = 10;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = unprocessedImages.slice(i, i + BATCH_SIZE);

      // Promise.all = processa todas do batch em paralelo
      await Promise.all(
        batch.map((img) =>
          processImageWithAnalysis(img.id)
            .then(() => {
              completed++;
              setProgress((completed / total) * 100);
            })
            .catch((err) => console.error("Batch error:", err)),
        ),
      );
    }

    setIsProcessingBatch(false);
    toast.success(`${completed} imagens processadas em paralelo!`);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const downloadAll = () => {
    images.forEach((img, index) => {
      if (img.enhancedUrl) {
        const filename = img.analyzedName
          ? `${img.analyzedName.toLowerCase().replace(/\s+/g, "-")}.png`
          : `product-enhanced-${index + 1}.png`;
        downloadImage(img.enhancedUrl, filename);
      }
    });
    toast.success("Download iniciado para todas as imagens processadas");
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const unprocessedCount = images.filter((img) => !img.enhancedUrl && !img.error).length;
  const processedCount = images.filter((img) => img.enhancedUrl).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Admin
        </Button>

        <h1 className="text-4xl font-bold mb-2">Otimização de Imagens de Produtos</h1>
        <p className="text-muted-foreground">Transforme suas fotos de produtos em imagens profissionais com IA</p>
      </div>

      <Alert className="mb-8 bg-amber-50/50 border-amber-200">
        <Info className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Best Practices for Studio Quality</AlertTitle>
        <AlertDescription className="text-amber-700 mt-1">
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>Ensure the product is <strong>in focus</strong> before uploading. The AI can improve lighting but cannot fix blur.</li>
            <li>Use simple backgrounds if possible to help the AI isolate the subject.</li>
            <li>The "Analyze" step will automatically detect the material (e.g., Titanium, Steel) to apply the correct lighting reflections.</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card className="p-6 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Carregar Imagens
                </span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-2">{images.length} imagem(ns) carregada(s)</p>
          </div>

          <div className="flex gap-2">
            {unprocessedCount > 0 && (
              <Button onClick={processBatch} disabled={isProcessingBatch} variant="default">
                {isProcessingBatch ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Processar Todas ({unprocessedCount})
                  </>
                )}
              </Button>
            )}

            {processedCount > 0 && (
              <Button onClick={downloadAll} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar Todas ({processedCount})
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="custom-prompt" className="text-sm font-medium">
            Prompt Customizado (Opcional)
          </label>
          <textarea
            id="custom-prompt"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Deixe em branco para usar o prompt padrão de photoshoot profissional. Ou customize para necessidades específicas..."
            className="w-full min-h-[100px] p-3 text-sm rounded-md border border-input bg-background resize-y"
          />
          <p className="text-xs text-muted-foreground">
            💡 Prompt padrão: Photoshoot profissional com iluminação de estúdio, fundo branco, detalhes em alta resolução
          </p>
        </div>

        {isProcessingBatch && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% concluído</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium mb-2">Original</p>
                <img
                  src={image.originalUrl}
                  alt="Original"
                  className="w-full h-48 object-contain bg-muted rounded-lg"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Otimizada</p>
                {image.enhancedUrl ? (
                  <img
                    src={image.enhancedUrl}
                    alt="Enhanced"
                    className="w-full h-48 object-contain bg-muted rounded-lg"
                  />
                ) : image.isProcessing ? (
                  <div className="w-full h-48 flex items-center justify-center bg-muted rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-muted rounded-lg text-muted-foreground">
                    Aguardando processamento
                  </div>
                )}
              </div>
            </div>

            {image.error && (
              <div className="text-sm text-destructive mb-2 p-2 bg-destructive/10 rounded">{image.error}</div>
            )}

            {image.analyzedName && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg mb-1">{image.analyzedName}</h3>
                {(image.brand || image.model) && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {[image.brand, image.model].filter(Boolean).join(" • ")}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-2">{image.analyzedDescription}</p>
                {image.analyzedCategory && (
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                    {image.analyzedCategory}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {!image.enhancedUrl && !image.isProcessing && (
                <Button onClick={() => processImageWithAnalysis(image.id)} size="sm" className="flex-1">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analisar & Processar
                </Button>
              )}

              {image.enhancedUrl && (
                <>
                  <Button
                    onClick={() => {
                      const filename = image.analyzedName
                        ? `${image.analyzedName.toLowerCase().replace(/\s+/g, "-")}.png`
                        : `product-enhanced-${image.id}.png`;
                      downloadImage(image.enhancedUrl!, filename);
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Check className="mr-2 h-4 w-4" />
                    Concluído
                  </Button>
                </>
              )}

              <Button onClick={() => removeImage(image.id)} size="sm" variant="ghost">
                Remover
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <Card className="p-12 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Nenhuma imagem carregada</p>
          <p className="text-muted-foreground mb-4">Faça upload de imagens de produtos para começar a otimização</p>
        </Card>
      )}
    </div>
  );
}
