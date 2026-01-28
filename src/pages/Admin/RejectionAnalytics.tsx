import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3, Clock, TrendingDown, AlertCircle } from "lucide-react";

interface RejectedCarousel {
    id: string;
    topic: string;
    rejection_reason: string | null;
    rejected_at: string | null;
    target_audience: string;
    created_at: string;
}

export default function RejectionAnalytics() {
    const { data: rejections, isLoading } = useQuery({
        queryKey: ["rejection_analytics"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("linkedin_carousels")
                .select("id, topic, rejection_reason, rejected_at, target_audience, created_at")
                .eq("status", "archived")
                .not("rejection_reason", "is", null)
                .order("rejected_at", { ascending: false });

            if (error) throw error;
            return data as RejectedCarousel[];
        },
    });

    // Group rejections by reason pattern
    const reasonPatterns = rejections?.reduce((acc, item) => {
        const reason = item.rejection_reason?.toLowerCase() || "não especificado";

        // Simple categorization
        let category = "Outros";
        if (reason.includes("imagem") || reason.includes("visual") || reason.includes("foto")) {
            category = "Qualidade Visual";
        } else if (reason.includes("texto") || reason.includes("copy") || reason.includes("escrita")) {
            category = "Qualidade do Texto";
        } else if (reason.includes("tom") || reason.includes("marca") || reason.includes("brand")) {
            category = "Tom/Marca";
        } else if (reason.includes("formato") || reason.includes("layout")) {
            category = "Formato/Layout";
        } else if (reason.includes("relevante") || reason.includes("tema") || reason.includes("assunto")) {
            category = "Relevância do Tema";
        }

        if (!acc[category]) {
            acc[category] = { count: 0, examples: [] };
        }
        acc[category].count++;
        if (acc[category].examples.length < 3) {
            acc[category].examples.push(item.rejection_reason || "");
        }
        return acc;
    }, {} as Record<string, { count: number; examples: string[] }>);

    const sortedCategories = Object.entries(reasonPatterns || {})
        .sort(([, a], [, b]) => b.count - a.count);

    const totalRejections = rejections?.length || 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Analytics de Rejeições</h1>
                <p className="text-muted-foreground">
                    Análise dos motivos de rejeição para melhoria do sistema de geração
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rejeitados</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRejections}</div>
                        <p className="text-xs text-muted-foreground">com motivo registrado</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sortedCategories.length}</div>
                        <p className="text-xs text-muted-foreground">tipos de problema</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Problema Principal</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate">
                            {sortedCategories[0]?.[0] || "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {sortedCategories[0]?.[1]?.count || 0} ocorrências
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Última Rejeição</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {rejections?.[0]?.rejected_at
                                ? format(new Date(rejections[0].rejected_at), "dd/MM", { locale: ptBR })
                                : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                            {rejections?.[0]?.topic || "Sem dados"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Categories Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Categorias de Rejeição</CardTitle>
                </CardHeader>
                <CardContent>
                    {sortedCategories.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Nenhuma rejeição com motivo registrado ainda
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {sortedCategories.map(([category, data]) => (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{category}</span>
                                        <Badge variant="secondary">{data.count}</Badge>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary rounded-full h-2 transition-all"
                                            style={{
                                                width: `${(data.count / totalRejections) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        {data.examples.slice(0, 2).map((ex, i) => (
                                            <p key={i} className="truncate">• {ex}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Rejections */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Rejeições</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        {rejections?.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                Nenhuma rejeição registrada
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {rejections?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium">{item.topic}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.target_audience}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {item.rejected_at
                                                    ? format(new Date(item.rejected_at), "dd/MM/yyyy HH:mm", {
                                                        locale: ptBR,
                                                    })
                                                    : "Data não registrada"}
                                            </span>
                                        </div>
                                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                                            <strong>Motivo:</strong> {item.rejection_reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
