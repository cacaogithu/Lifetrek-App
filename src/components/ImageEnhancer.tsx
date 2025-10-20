import { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, Sparkles } from "lucide-react";

interface ImageEnhancerProps {
  imageUrl: string;
  onEnhanced?: (enhancedUrl: string) => void;
}

export const ImageEnhancer = ({ imageUrl, onEnhanced }: ImageEnhancerProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  const enhanceImage = async () => {
    setIsEnhancing(true);
    try {
      // Convert image URL to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      const imageData = await base64Promise;

      // Call edge function to enhance
      const { data, error } = await supabase.functions.invoke('enhance-product-image', {
        body: { imageData }
      });

      if (error) throw error;

      setEnhancedImage(data.enhancedImage);
      if (onEnhanced) onEnhanced(data.enhancedImage);
      toast.success('Imagem melhorada com sucesso!');
    } catch (error) {
      console.error('Error enhancing image:', error);
      toast.error('Erro ao melhorar imagem');
    } finally {
      setIsEnhancing(false);
    }
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
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Imagem Original</p>
          <img 
            src={imageUrl} 
            alt="Original" 
            className="w-full rounded-lg border"
          />
        </div>
        
        {enhancedImage && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Imagem Melhorada</p>
            <img 
              src={enhancedImage} 
              alt="Enhanced" 
              className="w-full rounded-lg border"
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
              Melhorando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Melhorar com IA
            </>
          )}
        </Button>

        {enhancedImage && (
          <Button
            onClick={downloadImage}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
        )}
      </div>
    </div>
  );
};
