import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SlideCanvasProps {
    mode: "edit" | "preview" | "export";
    slide: {
        type: "hook" | "content" | "cta";
        headline: string;
        body: string;
        imageUrl?: string;
    };
    className?: string;
    aspectRatio?: "square" | "portrait";
}

export const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(
    ({ mode, slide, className, aspectRatio = "square" }, ref) => {
        const containerClasses = cn(
            "relative overflow-hidden flex flex-col",
            aspectRatio === "square" ? "aspect-square" : "aspect-[4/5]",
            className
        );

        const isExport = mode === "export";

        // Brand type labels in Portuguese
        const typeLabels: Record<string, string> = {
            hook: "GANCHO",
            content: "CONTEÚDO",
            cta: "CTA",
        };

        return (
            <div
                ref={ref}
                className={containerClasses}
                style={{
                    width: isExport ? "1080px" : "100%",
                    height: isExport ? "1080px" : "auto",
                    backgroundColor: "hsl(210 100% 18%)", // primary dark
                }}
            >
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    {slide.imageUrl ? (
                        <>
                            <img
                                src={slide.imageUrl}
                                alt="Background"
                                className="w-full h-full object-cover"
                            />
                            {/* Brand-colored overlay gradient */}
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: "linear-gradient(to top, hsl(210 100% 18% / 0.95) 0%, hsl(210 100% 18% / 0.6) 40%, hsl(210 100% 18% / 0.3) 100%)"
                                }}
                            />
                        </>
                    ) : (
                        <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, hsl(210 100% 18%) 0%, hsl(210 100% 28%) 100%)"
                            }}
                        >
                            <span className="text-sm text-white/40">Sem imagem de fundo</span>
                        </div>
                    )}
                </div>

                {/* Content Layer */}
                <div className="relative z-10 flex-1 flex flex-col p-10 text-white h-full justify-between">
                    {/* Header / Brand Area */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div 
                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "hsl(0 0% 100% / 0.15)",
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <span className="font-bold text-sm text-white">LM</span>
                            </div>
                        </div>
                        <Badge 
                            variant="secondary" 
                            className="border-0 uppercase tracking-wider text-[10px] font-semibold"
                            style={{
                                backgroundColor: slide.type === "cta" 
                                    ? "hsl(25 90% 52% / 0.9)" // accent orange
                                    : slide.type === "hook"
                                    ? "hsl(142 70% 35% / 0.9)" // accent green
                                    : "hsl(0 0% 100% / 0.15)",
                                color: "white",
                            }}
                        >
                            {typeLabels[slide.type] || slide.type.toUpperCase()}
                        </Badge>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-col gap-5 mt-auto mb-auto">
                        <h2
                            className={cn(
                                "font-bold leading-tight tracking-tight text-white",
                                slide.type === "hook" ? "text-5xl" : "text-4xl"
                            )}
                            style={{ textShadow: "0 2px 12px hsl(210 100% 10% / 0.5)" }}
                        >
                            {slide.headline}
                        </h2>
                        {/* Accent bar using brand colors */}
                        <div 
                            className="w-16 h-1.5 rounded-full"
                            style={{
                                backgroundColor: slide.type === "cta" 
                                    ? "hsl(25 90% 52%)" // accent orange
                                    : "hsl(142 70% 35%)" // accent green
                            }}
                        />
                        <p
                            className={cn(
                                "font-medium whitespace-pre-line leading-relaxed",
                                slide.type === "hook" ? "text-xl" : "text-lg"
                            )}
                            style={{ 
                                color: "hsl(0 0% 100% / 0.9)",
                                textShadow: "0 1px 4px hsl(210 100% 10% / 0.4)" 
                            }}
                        >
                            {slide.body}
                        </p>
                    </div>

                    {/* Footer Area */}
                    <div 
                        className="pt-6 flex justify-between items-center text-sm font-medium"
                        style={{
                            borderTop: "1px solid hsl(0 0% 100% / 0.15)",
                            color: "hsl(0 0% 100% / 0.7)",
                        }}
                    >
                        <span>Lifetrek Medical</span>
                        <span>lifetrek-medical.com</span>
                    </div>
                </div>
            </div>
        );
    }
);

SlideCanvas.displayName = "SlideCanvas";
