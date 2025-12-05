import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileText, Image, FileEdit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generatePitchDeckPDF } from "@/utils/generatePitchDeckPDF";
import { generatePitchDeckPPTXImages } from "@/utils/generatePitchDeckPPTXImages";
import { generatePitchDeckPPTX } from "@/utils/generatePitchDeckPPTX";

interface ExportDropdownProps {
  totalSlides: number;
  setCurrentSlide: (index: number) => void;
  currentSlide: number;
  disableAnimations?: () => void;
  enableAnimations?: () => void;
}

type ExportType = 'pdf' | 'pptx-images' | 'pptx-editable' | null;

export const ExportDropdown = ({ 
  totalSlides, 
  setCurrentSlide,
  currentSlide,
  disableAnimations,
  enableAnimations
}: ExportDropdownProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<ExportType>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleExportPDF = async () => {
    setIsExporting(true);
    setExportType('pdf');
    const originalSlide = currentSlide;
    
    toast.info('Gerando PDF de alta qualidade...', { 
      description: 'Aguarde enquanto capturamos cada slide.' 
    });

    try {
      await generatePitchDeckPDF({
        totalSlides,
        setCurrentSlide,
        onProgress: (current, total) => setProgress({ current, total }),
        disableAnimations,
        enableAnimations
      });
      
      toast.success('PDF gerado com sucesso!', {
        description: 'O arquivo foi baixado automaticamente.'
      });
    } catch (error) {
      toast.error('Erro ao gerar PDF', {
        description: 'Tente novamente ou use outro formato.'
      });
    } finally {
      setCurrentSlide(originalSlide);
      setIsExporting(false);
      setExportType(null);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleExportPPTXImages = async () => {
    setIsExporting(true);
    setExportType('pptx-images');
    const originalSlide = currentSlide;
    
    toast.info('Gerando PPTX com imagens HD...', { 
      description: 'Aguarde enquanto capturamos cada slide.' 
    });

    try {
      await generatePitchDeckPPTXImages({
        totalSlides,
        setCurrentSlide,
        onProgress: (current, total) => setProgress({ current, total }),
        disableAnimations,
        enableAnimations
      });
      
      toast.success('PPTX gerado com sucesso!', {
        description: 'Design preservado em alta resolução.'
      });
    } catch (error) {
      toast.error('Erro ao gerar PPTX', {
        description: 'Tente novamente ou use outro formato.'
      });
    } finally {
      setCurrentSlide(originalSlide);
      setIsExporting(false);
      setExportType(null);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleExportPPTXEditable = async () => {
    setIsExporting(true);
    setExportType('pptx-editable');
    
    toast.info('Gerando PPTX editável...', { 
      description: 'Design simplificado para edição.' 
    });

    try {
      await generatePitchDeckPPTX();
      
      toast.success('PPTX editável gerado!', {
        description: 'Você pode editar textos e cores no PowerPoint.'
      });
    } catch (error) {
      toast.error('Erro ao gerar PPTX', {
        description: 'Tente novamente ou use outro formato.'
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-foreground"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {progress.total > 0 ? `${progress.current}/${progress.total}` : 'Exportando...'}
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Download
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Formato de Export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">PDF (Apresentação)</span>
            <span className="text-xs text-muted-foreground">Design perfeito, não editável</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleExportPPTXImages}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Image className="w-4 h-4 mr-2 text-accent" />
          <div className="flex flex-col">
            <span className="font-medium">PPTX (Imagens HD)</span>
            <span className="text-xs text-muted-foreground">PowerPoint com design preservado</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleExportPPTXEditable}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileEdit className="w-4 h-4 mr-2 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium">PPTX (Editável)</span>
            <span className="text-xs text-muted-foreground">Design simplificado, textos editáveis</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
