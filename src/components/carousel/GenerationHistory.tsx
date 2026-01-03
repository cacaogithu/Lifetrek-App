import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Eye, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HistoryEntry {
  id: string;
  role: "strategist" | "analyst";
  content: string;
  timestamp: Date;
}

interface GenerationHistoryProps {
  entries: HistoryEntry[];
}

export function GenerationHistory({ entries }: GenerationHistoryProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleEntry = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const roleConfig = {
    strategist: {
      label: "Estrategista",
      icon: Pencil,
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-500/30",
    },
    analyst: {
      label: "Copywriter",
      icon: Eye,
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-500/30",
    },
  };

  if (entries.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Histórico da Geração
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 p-4 pt-0">
            <AnimatePresence>
              {entries.map((entry, index) => {
                const config = roleConfig[entry.role];
                const Icon = config.icon;
                const isExpanded = expandedEntries.has(entry.id);
                const isLong = entry.content.length > 300;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-3`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${config.bgColor}`}>
                          <Icon className={`h-3.5 w-3.5 ${config.textColor}`} />
                        </div>
                        <Badge variant="outline" className={`text-xs ${config.textColor} border-current`}>
                          {config.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isLong && !isExpanded ? 'line-clamp-4' : ''}`}>
                      {entry.content}
                    </div>
                    {isLong && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-6 text-xs"
                        onClick={() => toggleEntry(entry.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Mostrar menos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Ver mais
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
