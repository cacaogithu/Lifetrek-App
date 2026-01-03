import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Pencil, Eye, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
  content?: string;
  icon: "strategist" | "analyst" | "images";
}

interface GenerationProgressProps {
  steps: GenerationStep[];
  currentOutput?: string;
}

const iconMap = {
  strategist: Pencil,
  analyst: Eye,
  images: Image,
};

export function GenerationProgress({ steps, currentOutput }: GenerationProgressProps) {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardContent className="pt-6 space-y-4">
        {/* Steps Progress */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon];
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    step.status === "active"
                      ? "bg-primary text-primary-foreground"
                      : step.status === "done"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.status === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step.status === "done" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="font-medium">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      step.status === "done" ? "bg-green-500/50" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Live Output Display */}
        <AnimatePresence mode="wait">
          {currentOutput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Pencil className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    Escrevendo...
                  </p>
                  <motion.p
                    key={currentOutput.slice(-50)}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-foreground leading-relaxed line-clamp-4"
                  >
                    {currentOutput}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
