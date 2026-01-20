import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Slide {
  headline: string;
  body: string;
  type: "hook" | "content" | "cta";
}

interface SlideCopyPanelProps {
  slides: Slide[];
  caption: string;
  currentSlide?: number;
}

export function SlideCopyPanel({ slides, caption, currentSlide }: SlideCopyPanelProps) {
  const copyAllText = () => {
    const allText = slides
      .map((s, i) => `Slide ${i + 1} (${s.type.toUpperCase()}):\n${s.headline}\n${s.body}`)
      .join('\n\n---\n\n');
    const fullText = `${allText}\n\n===\n\nLegenda:\n${caption}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Copy completa copiada!");
  };

  const copySlide = (slide: Slide, index: number) => {
    const text = `${slide.headline}\n\n${slide.body}`;
    navigator.clipboard.writeText(text);
    toast.success(`Slide ${index + 1} copiado!`);
  };

  const typeColors = {
    hook: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    content: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    cta: "bg-green-500/10 text-green-600 border-green-500/30",
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Copy Completa
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={copyAllText} className="h-7 text-xs">
          <Copy className="h-3 w-3 mr-1" />
          Copiar Tudo
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 transition-all ${
                  currentSlide === idx 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full"
                    >
                      {idx + 1}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${typeColors[slide.type]}`}
                    >
                      {slide.type === 'hook' ? 'Gancho' : slide.type === 'cta' ? 'CTA' : 'Conteúdo'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copySlide(slide, idx)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <h4 className="font-semibold text-sm mb-1.5 text-foreground">
                  {slide.headline}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {slide.body}
                </p>
              </div>
            ))}

            {/* Caption */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                  Legenda do Post
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(caption);
                    toast.success("Legenda copiada!");
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {caption}
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
