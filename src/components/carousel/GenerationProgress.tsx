import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Pencil, Eye, Image, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
  strategistFullOutput?: string;
  analystFullOutput?: string;
  designerFullOutput?: string;
  agentStatus?: { agent: string; status: string; message: string };
}

const iconMap = {
  strategist: Pencil,
  analyst: Eye,
  images: Image,
};

const roleLabels = {
  strategist: "Estrategista",
  analyst: "Copywriter",
};

export function GenerationProgress({ 
  steps, 
  currentOutput,
  strategistFullOutput,
  analystFullOutput,
  designerFullOutput,
  agentStatus
}: GenerationProgressProps) {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          Geração em Andamento
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Steps Progress */}
        <div className="flex items-center gap-2 flex-wrap">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon];
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    step.status === "active"
                      ? "bg-primary text-primary-foreground"
                      : step.status === "done"
                      ? "bg-green-500/20 text-green-600 dark:text-green-400"
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
                  {step.content && (
                    <span className="text-xs opacity-70">({step.content})</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-6 h-0.5 ${
                      step.status === "done" ? "bg-green-500/50" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Live Output Display */}
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-3">
            {/* Strategist Full Output */}
            {strategistFullOutput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-500/20 p-1.5 rounded-md">
                    <Pencil className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400 border-blue-500/30">
                    Estrategista
                  </Badge>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {strategistFullOutput}
                </p>
              </motion.div>
            )}

            {/* Analyst/Copywriter Full Output */}
            {analystFullOutput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-purple-500/20 p-1.5 rounded-md">
                    <Eye className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge variant="outline" className="text-xs text-purple-600 dark:text-purple-400 border-purple-500/30">
                    Copywriter
                  </Badge>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {analystFullOutput}
                </p>
              </motion.div>
            )}

            {/* Designer Full Output */}
            {designerFullOutput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 rounded-lg p-4 border border-green-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-500/20 p-1.5 rounded-md">
                    <Image className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-500/30">
                    Designer
                  </Badge>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {designerFullOutput}
                </p>
              </motion.div>
            )}

            {/* Agent Status (real-time updates) */}
            {agentStatus && (
              <motion.div
                key={`${agentStatus.agent}-${agentStatus.status}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 rounded-lg p-3 border border-primary/20"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm font-medium capitalize">{agentStatus.agent}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-sm text-muted-foreground">{agentStatus.message}</span>
                </div>
              </motion.div>
            )}

            {/* Current Active Output */}
            <AnimatePresence mode="wait">
              {currentOutput && !strategistFullOutput && !analystFullOutput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-muted/50 rounded-lg p-4 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Pencil className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                        Escrevendo...
                      </p>
                      <motion.p
                        key={currentOutput.slice(-50)}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-foreground leading-relaxed"
                      >
                        {currentOutput}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview while typing (when we have outputs already) */}
            {currentOutput && (strategistFullOutput || analystFullOutput) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-muted/30 rounded-lg p-3 border border-border/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Processando...</span>
                </div>
                <p className="text-sm text-foreground/70 line-clamp-2">
                  {currentOutput}
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
