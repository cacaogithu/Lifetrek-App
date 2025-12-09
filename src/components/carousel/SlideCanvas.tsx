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
        // Styles for rendering
        const containerClasses = cn(
            "relative overflow-hidden bg-white text-slate-900 flex flex-col",
            aspectRatio === "square" ? "aspect-square" : "aspect-[4/5]",
            className
        );

        const isExport = mode === "export";

        return (
            <div
                ref={ref}
                className={containerClasses}
                style={{
                    // Force dimensions for export accuracy if needed, otherwise relying on container
                    width: isExport ? "1080px" : "100%",
                    height: isExport ? "1080px" : "auto",
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
                            {/* Overlay gradient for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <span className="text-sm">No Background Image</span>
                        </div>
                    )}
                </div>

                {/* Content Layer */}
                <div className="relative z-10 flex-1 flex flex-col p-12 text-white h-full justify-between">
                    {/* Header / Brand Area */}
                    <div className="flex justify-between items-start">
                        {/* Placeholder for Logo if we add it later */}
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <span className="font-bold text-xs">LM</span>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-0 uppercase tracking-wider text-[10px]">
                            {slide.type}
                        </Badge>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-col gap-6 mt-auto mb-auto">
                        <h2
                            className={cn(
                                "font-bold leading-tight tracking-tight",
                                slide.type === "hook" ? "text-6xl" : "text-4xl"
                            )}
                            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                        >
                            {slide.headline}
                        </h2>
                        <div className={cn(
                            "w-20 h-2 rounded-full",
                            slide.type === "cta" ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        <p
                            className={cn(
                                "text-slate-100 font-medium whitespace-pre-line leading-relaxed",
                                slide.type === "hook" ? "text-2xl" : "text-xl"
                            )}
                            style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                        >
                            {slide.body}
                        </p>
                    </div>

                    {/* Footer Area */}
                    <div className="pt-8 border-t border-white/20 flex justify-between items-center text-sm font-light text-slate-300">
                        <span>Lifetrek Medical</span>
                        <span>www.lifetrek-medical.com</span>
                    </div>
                </div>
            </div>
        );
    }
);

SlideCanvas.displayName = "SlideCanvas";
