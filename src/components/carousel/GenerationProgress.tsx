import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Pencil, Eye, Image, Sparkles, Clock, Database, Lightbulb, Target, Search, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
  content?: string;
  icon: "strategist" | "analyst" | "images";
  durationMs?: number;
}

export interface RAGContext {
  documentCount: number;
  assetsCount: number;
  productsCount: number;
  sources?: string[];
}

export interface AgentOutput {
  agent: string;
  type: "rag_loaded" | "industry_data" | "angle_selected" | "hook_refined" | "proof_added" | "image_progress" | "critique";
  message: string;
  details?: Record<string, any>;
}

interface GenerationProgressProps {
  steps: GenerationStep[];
  currentOutput?: string;
  strategistFullOutput?: string;
  analystFullOutput?: string;
  designerFullOutput?: string;
  agentStatus?: { agent: string; status: string; message: string };
  ragContext?: RAGContext;
  agentOutputs?: AgentOutput[];
  startTime?: number;
  imageProgress?: { current: number; total: number };
}

const iconMap = {
  strategist: Pencil,
  analyst: Eye,
  images: Image,
};

const agentOutputIcons: Record<string, any> = {
  rag_loaded: Database,
  industry_data: Search,
  angle_selected: Target,
  hook_refined: Lightbulb,
  proof_added: CheckCircle2,
  image_progress: Palette,
  critique: Eye,
};

const agentOutputColors: Record<string, string> = {
  rag_loaded: "text-cyan-500",
  industry_data: "text-amber-500",
  angle_selected: "text-blue-500",
  hook_refined: "text-purple-500",
  proof_added: "text-green-500",
  image_progress: "text-pink-500",
  critique: "text-orange-500",
};

export function GenerationProgress({ 
  steps, 
  currentOutput,
  strategistFullOutput,
  analystFullOutput,
  designerFullOutput,
  agentStatus,
  ragContext,
  agentOutputs = [],
  startTime,
  imageProgress
}: GenerationProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Live timer
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  // Calculate total duration from completed steps
  const totalDuration = steps.reduce((acc, s) => acc + (s.durationMs || 0), 0);

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Geração em Andamento
          </CardTitle>
          {startTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Steps Progress with Duration */}
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
                  {step.durationMs && step.status === "done" && (
                    <span className="text-xs opacity-70">({formatTime(step.durationMs)})</span>
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

        {/* RAG Context Info */}
        {ragContext && (ragContext.documentCount > 0 || ragContext.assetsCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                Contexto RAG Carregado
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ragContext.documentCount > 0 && (
                <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                  📚 {ragContext.documentCount} docs Knowledge Base
                </Badge>
              )}
              {ragContext.assetsCount > 0 && (
                <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                  🖼️ {ragContext.assetsCount} assets disponíveis
                </Badge>
              )}
              {ragContext.productsCount > 0 && (
                <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                  📦 {ragContext.productsCount} produtos referenciados
                </Badge>
              )}
            </div>
          </motion.div>
        )}

        {/* Image Generation Progress */}
        {imageProgress && imageProgress.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-pink-500/10 rounded-lg p-3 border border-pink-500/20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-pink-600 dark:text-pink-400 animate-pulse" />
                <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                  Designer Gerando Imagens
                </span>
              </div>
              <span className="text-xs text-pink-600 dark:text-pink-400">
                Slide {imageProgress.current}/{imageProgress.total}
              </span>
            </div>
            <Progress 
              value={(imageProgress.current / imageProgress.total) * 100} 
              className="h-2 bg-pink-200 dark:bg-pink-900"
            />
          </motion.div>
        )}

        {/* Live Agent Outputs Stream */}
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-3">
            {/* Agent Outputs Timeline */}
            {agentOutputs.length > 0 && (
              <div className="space-y-2">
                {agentOutputs.map((output, idx) => {
                  const Icon = agentOutputIcons[output.type] || Sparkles;
                  const colorClass = agentOutputColors[output.type] || "text-primary";
                  
                  return (
                    <motion.div
                      key={`${output.type}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Icon className={`h-4 w-4 mt-0.5 ${colorClass}`} />
                      <div className="flex-1">
                        <span className="font-medium capitalize">{output.agent}:</span>{" "}
                        <span className="text-muted-foreground">{output.message}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

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

        {/* Duration Breakdown (when complete) */}
        {totalDuration > 0 && steps.every(s => s.status === "done") && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 rounded-lg p-3 border border-green-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                ✅ Geração Completa
              </span>
              <span className="text-sm font-mono text-green-600 dark:text-green-400">
                Total: {formatTime(totalDuration)}
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              {steps.map(s => s.durationMs && (
                <span key={s.id}>
                  {s.label}: {formatTime(s.durationMs)}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
