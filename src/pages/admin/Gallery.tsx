import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ProductGallery } from "@/components/admin/ProductGallery";

export default function Gallery() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Galeria de Produtos</h1>
          <p className="text-muted-foreground">
            Todas as imagens processadas por IA
          </p>
        </div>
        <Button onClick={() => navigate('/admin/image-processor')}>
          <Sparkles className="mr-2 h-4 w-4" />
          Processar Novas Imagens
        </Button>
      </div>
      
      <ProductGallery />
    </div>
  );
}
