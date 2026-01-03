import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { 
  Database, 
  RefreshCw, 
  Trash2, 
  Search, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Target, 
  Swords,
  Loader2,
  CheckCircle2
} from "lucide-react";

interface KnowledgeDocument {
  id: string;
  source_type: string;
  source_id: string;
  content: string;
  metadata: {
    category?: string;
    priority?: string;
    keywords?: string[];
  };
  created_at: string;
}

const SOURCE_TYPE_ICONS: Record<string, typeof FileText> = {
  brand_book: BookOpen,
  hormozi_framework: Target,
  industry_research: TrendingUp,
  market_pain_points: Target,
  competitive_intelligence: Swords,
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  brand_book: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  hormozi_framework: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  industry_research: "bg-green-500/10 text-green-500 border-green-500/20",
  market_pain_points: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  competitive_intelligence: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ["knowledge-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_embeddings")
        .select("*")
        .order("source_type");
      
      if (error) throw error;
      return data as KnowledgeDocument[];
    },
  });

  // Populate mutation
  const populateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("populate-knowledge-base", {
        body: { mode: "populate", skipEmbeddings: true },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Knowledge Base atualizada: ${data.message}`);
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao popular: ${error.message}`);
    },
  });

  // Clear mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("populate-knowledge-base", {
        body: { mode: "clear" },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Knowledge Base limpa");
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao limpar: ${error.message}`);
    },
  });

  // Filter documents
  const filteredDocs = documents?.filter((doc) => {
    const matchesSearch = !searchQuery || 
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.source_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || doc.source_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Group by source_type
  const groupedDocs = filteredDocs?.reduce((acc, doc) => {
    if (!acc[doc.source_type]) acc[doc.source_type] = [];
    acc[doc.source_type].push(doc);
    return acc;
  }, {} as Record<string, KnowledgeDocument[]>);

  // Get unique source types
  const sourceTypes = documents 
    ? [...new Set(documents.map(d => d.source_type))]
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground">
            Documentos de RAG para os agentes de LinkedIn
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar
          </Button>
          <Button
            onClick={() => populateMutation.mutate()}
            disabled={populateMutation.isPending}
          >
            {populateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Popular KB
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(SOURCE_TYPE_COLORS).map(([type, color]) => {
          const count = documents?.filter(d => d.source_type === type).length || 0;
          const Icon = SOURCE_TYPE_ICONS[type] || FileText;
          
          return (
            <Card 
              key={type}
              className={`cursor-pointer transition-all ${selectedType === type ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 capitalize">
                  {type.replace(/_/g, " ")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar documentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos ({filteredDocs?.length || 0})</CardTitle>
          <CardDescription>
            Clique em um documento para expandir o conteúdo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !filteredDocs?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum documento encontrado</p>
              <p className="text-sm">Clique em "Popular KB" para adicionar documentos</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <Accordion type="multiple" className="space-y-2">
                {Object.entries(groupedDocs || {}).map(([sourceType, docs]) => (
                  <div key={sourceType} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      {(() => {
                        const Icon = SOURCE_TYPE_ICONS[sourceType] || FileText;
                        return <Icon className="h-4 w-4" />;
                      })()}
                      {sourceType.replace(/_/g, " ")}
                    </h3>
                    
                    {docs.map((doc) => (
                      <AccordionItem key={doc.id} value={doc.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <Badge 
                              variant="outline" 
                              className={SOURCE_TYPE_COLORS[doc.source_type]}
                            >
                              {doc.source_id}
                            </Badge>
                            {doc.metadata?.priority === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                High Priority
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {doc.content.length} chars
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            {/* Keywords */}
                            {doc.metadata?.keywords && (
                              <div className="flex flex-wrap gap-1">
                                {doc.metadata.keywords.map((kw) => (
                                  <Badge key={kw} variant="secondary" className="text-xs">
                                    {kw}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Content preview */}
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">
                              {doc.content}
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                ))}
              </Accordion>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
