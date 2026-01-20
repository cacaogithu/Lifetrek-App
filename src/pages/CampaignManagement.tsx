import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  BarChart3, 
  Clock, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Eye,
  RefreshCw,
  Calendar,
  TrendingUp,
  FileText
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GenerationLog {
  id: string;
  admin_user_id: string;
  carousel_id: string | null;
  input_params: unknown;
  strategist_output: unknown;
  analyst_output: unknown;
  final_output: unknown;
  generation_time_ms: number | null;
  image_count: number | null;
  model_used: string | null;
  created_at: string;
}

const getInputParam = (log: GenerationLog, key: string): string => {
  const params = log.input_params;
  if (params && typeof params === 'object' && !Array.isArray(params)) {
    const value = (params as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : '-';
  }
  return '-';
};

interface CampaignStats {
  totalGenerations: number;
  totalImages: number;
  avgGenerationTime: number;
  successRate: number;
  todayCount: number;
  weekCount: number;
}

export default function CampaignManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalGenerations: 0,
    totalImages: 0,
    avgGenerationTime: 0,
    successRate: 0,
    todayCount: 0,
    weekCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: adminData } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!adminData) {
        toast.error("Acesso não autorizado");
        navigate("/admin/login");
        return;
      }

      await fetchData();
    } catch (error) {
      console.error("Error:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch generation logs
      const { data: logsData, error: logsError } = await supabase
        .from("linkedin_generation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const allLogs = logsData || [];
      const totalGenerations = allLogs.length;
      const totalImages = allLogs.reduce((sum, log) => sum + (log.image_count || 0), 0);
      const successfulLogs = allLogs.filter(log => log.carousel_id !== null);
      const successRate = totalGenerations > 0 ? (successfulLogs.length / totalGenerations) * 100 : 0;
      
      const logsWithTime = allLogs.filter(log => log.generation_time_ms !== null);
      const avgGenerationTime = logsWithTime.length > 0
        ? logsWithTime.reduce((sum, log) => sum + (log.generation_time_ms || 0), 0) / logsWithTime.length
        : 0;

      const todayCount = allLogs.filter(log => new Date(log.created_at) >= today).length;
      const weekCount = allLogs.filter(log => new Date(log.created_at) >= weekAgo).length;

      setStats({
        totalGenerations,
        totalImages,
        avgGenerationTime,
        successRate,
        todayCount,
        weekCount,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewCarousel = (carouselId: string | null) => {
    if (carouselId) {
      navigate(`/admin/linkedin-carousel?id=${carouselId}`);
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusBadge = (log: GenerationLog) => {
    if (log.carousel_id) {
      return <Badge variant="default" className="bg-green-600">Sucesso</Badge>;
    }
    return <Badge variant="destructive">Falhou</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-8 px-4">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Campanhas</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe o progresso e status de cada geração de conteúdo
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchData}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total de Gerações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalGenerations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.todayCount} hoje · {stats.weekCount} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Imagens Geradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalImages}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Média: {stats.totalGenerations > 0 ? (stats.totalImages / stats.totalGenerations).toFixed(1) : 0} por geração
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Tempo Médio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatDuration(stats.avgGenerationTime)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Por geração completa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Taxa de Sucesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.successRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Gerações salvas com sucesso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Generation Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico de Gerações
            </CardTitle>
            <CardDescription>
              Últimas 100 gerações de carrossel LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma geração registrada ainda</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/admin/linkedin-carousel")}
                >
                  Criar Primeiro Carrossel
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Tópico</TableHead>
                    <TableHead>Audiência</TableHead>
                    <TableHead className="text-center">Imagens</TableHead>
                    <TableHead className="text-center">Tempo</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getStatusBadge(log)}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {getInputParam(log, 'topic')}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground">
                        {getInputParam(log, 'targetAudience')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{log.image_count || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {formatDuration(log.generation_time_ms)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.model_used?.split("/").pop() || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(log.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.carousel_id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCarousel(log.carousel_id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
