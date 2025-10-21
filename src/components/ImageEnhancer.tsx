import { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, Sparkles, RefreshCw } from "lucide-react";
import { Progress } from "./ui/progress";

interface ImageEnhancerProps {
  imageUrl: string;
  onEnhanced?: (enhancedUrl: string) => void;
  customPrompt?: string;
}

export const ImageEnhancer = ({ imageUrl, onEnhanced, customPrompt }: ImageEnhancerProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const enhanceImage = async () => {
    setIsEnhancing(true);
    setProgress(10);
    
    try {
      // Convert image URL to base64
      const response = await fetch(imageUrl);
      setProgress(30);
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      const imageData = await base64Promise;
      setProgress(50);

      // Call edge function to enhance with Lovable AI
      const { data, error } = await supabase.functions.invoke('enhance-product-image', {
        body: { 
          imageData,
          prompt: customPrompt 
        }
      });

      if (error) throw error;

      setProgress(90);
      setEnhancedImage(data.enhancedImage);
      if (onEnhanced) onEnhanced(data.enhancedImage);
      setProgress(100);
      
      toast.success('Imagem otimizada com IA profissional!');
    } catch (error) {
      console.error('Error enhancing image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao melhorar imagem';
      toast.error(errorMessage);
    } finally {
      setIsEnhancing(false);
      setProgress(0);
    }
  };

  const resetEnhancement = () => {
    setEnhancedImage(null);
    toast.info('Resetado para imagem original');
  };

  const downloadImage = () => {
    if (!enhancedImage) return;
    
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'product-enhanced.png';
    link.click();
  };

  return (
    <div className="space-y-4">
      {isEnhancing && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Processando com IA... {progress}%
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Imagem Original</p>
          <img 
            src={imageUrl} 
            alt="Original" 
            className="w-full rounded-lg border bg-muted object-contain"
            style={{ minHeight: '300px' }}
          />
        </div>
        
        {enhancedImage && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              Imagem Otimizada
              <Sparkles className="h-4 w-4 text-primary" />
            </p>
            <img 
              src={enhancedImage} 
              alt="Enhanced" 
              className="w-full rounded-lg border bg-muted object-contain"
              style={{ minHeight: '300px' }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={enhanceImage}
          disabled={isEnhancing}
          className="flex-1"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Otimizando com IA...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Otimizar com IA
            </>
          )}
        </Button>

        {enhancedImage && (
          <>
            <Button
              onClick={downloadImage}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </Button>
            
            <Button
              onClick={resetEnhancement}
              variant="ghost"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resetar
            </Button>
          </>
        )}
      </div>

      {customPrompt && (
        <p className="text-xs text-muted-foreground">
          Usando prompt personalizado para otimização
        </p>
      )}
    </div>
  );
};
