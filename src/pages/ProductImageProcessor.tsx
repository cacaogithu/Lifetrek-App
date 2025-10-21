import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, Download, Sparkles, ArrowLeft, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface ProcessedImage {
  id: string;
  originalUrl: string;
  originalFile: File;
  enhancedUrl?: string;
  isProcessing: boolean;
  error?: string;
}

export default function ProductImageProcessor() {
  const navigate = useNavigate();
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ProcessedImage[] = files.map(file => ({
      id: Math.random().toString(36),
      originalUrl: URL.createObjectURL(file),
      originalFile: file,
      isProcessing: false
    }));
    
    setImages(prev => [...prev, ...newImages]);
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

  const processImage = async (imageId: string) => {
    const imageIndex = images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;

    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, isProcessing: true, error: undefined } : img
    ));

    try {
      const image = images[imageIndex];
      const imageData = await convertToBase64(image.originalFile);

      const { data, error } = await supabase.functions.invoke('enhance-product-image', {
        body: { imageData }
      });

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, enhancedUrl: data.enhancedImage, isProcessing: false }
          : img
      ));
      
      toast.success('Imagem otimizada com sucesso!');
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar imagem';
      
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, isProcessing: false, error: errorMessage }
          : img
      ));
      
      toast.error(errorMessage);
    }
  };

  const processBatch = async () => {
    setIsProcessingBatch(true);
    setProgress(0);
    
    const unprocessedImages = images.filter(img => !img.enhancedUrl && !img.error);
    const total = unprocessedImages.length;
    
    for (let i = 0; i < total; i++) {
      await processImage(unprocessedImages[i].id);
      setProgress(((i + 1) / total) * 100);
    }
    
    setIsProcessingBatch(false);
    toast.success('Processamento em lote concluído!');
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const downloadAll = () => {
    images.forEach((img, index) => {
      if (img.enhancedUrl) {
        downloadImage(img.enhancedUrl, `product-enhanced-${index + 1}.png`);
      }
    });
    toast.success('Download iniciado para todas as imagens processadas');
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const unprocessedCount = images.filter(img => !img.enhancedUrl && !img.error).length;
  const processedCount = images.filter(img => img.enhancedUrl).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Admin
        </Button>
        
        <h1 className="text-4xl font-bold mb-2">Otimização de Imagens de Produtos</h1>
        <p className="text-muted-foreground">
          Transforme suas fotos de produtos em imagens profissionais com IA
        </p>
      </div>

      <Card className="p-6 mb-6">
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
            <p className="text-sm text-muted-foreground mt-2">
              {images.length} imagem(ns) carregada(s)
            </p>
          </div>

          <div className="flex gap-2">
            {unprocessedCount > 0 && (
              <Button
                onClick={processBatch}
                disabled={isProcessingBatch}
                variant="default"
              >
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

        {isProcessingBatch && (
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% concluído
            </p>
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
              <div className="text-sm text-destructive mb-2 p-2 bg-destructive/10 rounded">
                {image.error}
              </div>
            )}

            <div className="flex gap-2">
              {!image.enhancedUrl && !image.isProcessing && (
                <Button
                  onClick={() => processImage(image.id)}
                  size="sm"
                  className="flex-1"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Processar
                </Button>
              )}
              
              {image.enhancedUrl && (
                <>
                  <Button
                    onClick={() => downloadImage(image.enhancedUrl!, `product-enhanced-${image.id}.png`)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Concluído
                  </Button>
                </>
              )}
              
              <Button
                onClick={() => removeImage(image.id)}
                size="sm"
                variant="ghost"
              >
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
          <p className="text-muted-foreground mb-4">
            Faça upload de imagens de produtos para começar a otimização
          </p>
        </Card>
      )}
    </div>
  );
}
