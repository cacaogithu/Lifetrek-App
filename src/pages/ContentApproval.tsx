import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  Edit,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  ArrowLeft,
  Mail,
  Bot,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from 'react-router-dom';
import { ContentPreview, ContentPreviewMini, getContentType } from '@/components/content/ContentPreview';

interface ContentApprovalRecord {
  id: string;
  template_id: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_type: string;
  status: string;
  comments: string;
  approved_at: string;
  created_at: string;
}

interface ContentTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  language: string;
  niche: string;
  version: number;
  status: string;
  created_at: string;
  updated_at: string;
  approvals?: ContentApprovalRecord[];
  nelsonApproval?: ContentApprovalRecord;
  rafaelApproval?: ContentApprovalRecord;
}

const categoryLabels: Record<string, string> = {
  email_reply: 'Respostas de Email',
  linkedin_outreach: 'Outreach LinkedIn',
  cold_email: 'Cold Email',
  carousel_content: 'Conteúdo Carrossel',
  crm_agent: 'Agente CRM',
  personalized_outreach: 'Outreach Personalizado',
};

const nicheLabels: Record<string, string> = {
  orthopedic: 'Ortopedia',
  dental: 'Odontologia',
  veterinary: 'Veterinária',
  hospital: 'Hospital',
  oem: 'OEM',
  general: 'Geral',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { 
    label: 'Rascunho', 
    color: 'bg-muted text-muted-foreground',
    icon: <FileText className="h-3 w-3" />
  },
  pending_approval: { 
    label: 'Aguardando', 
    color: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
    icon: <Clock className="h-3 w-3" />
  },
  approved: { 
    label: 'Aprovado', 
    color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  rejected: { 
    label: 'Rejeitado', 
    color: 'bg-destructive/20 text-destructive border-destructive/30',
    icon: <XCircle className="h-3 w-3" />
  },
  changes_requested: { 
    label: 'Mudanças', 
    color: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
    icon: <Edit className="h-3 w-3" />
  },
};

const reviewers = [
  { id: 'nelson', name: 'Nelson', email: 'nelson@lifetrek.com.br' },
  { id: 'rafael', name: 'Rafael', email: 'rafael@lifetrek.com.br' },
];

const ContentApproval = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<string>('');
  const [reviewComments, setReviewComments] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch templates with their approvals
  const { data: templates, isLoading } = useQuery({
    queryKey: ['content-templates-with-approvals', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('content_templates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data: templatesData, error: templatesError } = await query;
      if (templatesError) throw templatesError;

      // Fetch all approvals
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('content_approvals')
        .select('*')
        .order('created_at', { ascending: false });

      if (approvalsError) throw approvalsError;

      // Map approvals to templates
      return (templatesData as ContentTemplate[]).map(template => ({
        ...template,
        approvals: (approvalsData as ContentApprovalRecord[]).filter(a => a.template_id === template.id),
        nelsonApproval: (approvalsData as ContentApprovalRecord[]).find(
          a => a.template_id === template.id && a.reviewer_name.toLowerCase() === 'nelson'
        ),
        rafaelApproval: (approvalsData as ContentApprovalRecord[]).find(
          a => a.template_id === template.id && a.reviewer_name.toLowerCase() === 'rafael'
        ),
      }));
    },
  });

  // Submit approval mutation
  const submitApprovalMutation = useMutation({
    mutationFn: async ({ templateId, status }: { templateId: string; status: string }) => {
      const reviewer = reviewers.find(r => r.id === selectedReviewer);
      if (!reviewer) throw new Error('Selecione um revisor');

      const { error } = await supabase
        .from('content_approvals')
        .insert({
          template_id: templateId,
          reviewer_name: reviewer.name,
          reviewer_email: reviewer.email,
          reviewer_type: 'internal',
          status,
          comments: reviewComments || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        });

      if (error) throw error;

      // Check if both reviewers approved
      const { data: allApprovals } = await supabase
        .from('content_approvals')
        .select('*')
        .eq('template_id', templateId);

      const approvedCount = allApprovals?.filter(a => a.status === 'approved').length || 0;
      
      // Update template status based on approvals
      let newStatus = 'pending_approval';
      if (approvedCount >= 2) {
        newStatus = 'approved';
      } else if (status === 'rejected') {
        newStatus = 'rejected';
      } else if (status === 'changes_requested') {
        newStatus = 'changes_requested';
      } else if (approvedCount >= 1) {
        newStatus = 'pending_approval';
      }

      await supabase
        .from('content_templates')
        .update({ status: newStatus })
        .eq('id', templateId);
    },
    onSuccess: () => {
      toast.success('Avaliação registrada!');
      queryClient.invalidateQueries({ queryKey: ['content-templates-with-approvals'] });
      setReviewComments('');
      setSelectedTemplate(null);
      setSelectedReviewer('');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getApprovalIcon = (approval?: ContentApprovalRecord) => {
    if (!approval) return <div className="w-6 h-6 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30" />;
    
    switch (approval.status) {
      case 'approved':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-destructive" />;
      case 'changes_requested':
        return <Edit className="w-6 h-6 text-orange-500" />;
      default:
        return <Clock className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Aprovação de Conteúdo</h1>
                <p className="text-sm text-muted-foreground">
                  Revise e aprove templates de outreach • Nelson & Rafael
                </p>
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="font-semibold">Título</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="font-semibold">Nicho</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                  <TableHead className="font-semibold text-center">
                    <div className="flex items-center justify-center gap-1">
                      <User className="h-4 w-4" />
                      Nelson
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    <div className="flex items-center justify-center gap-1">
                      <User className="h-4 w-4" />
                      Rafael
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates?.map((template) => (
                  <>
                    <TableRow 
                      key={template.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleRow(template.id)}
                        >
                          {expandedRows.has(template.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-[250px]">
                          <p className="truncate">{template.title}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const contentType = getContentType(template.content, template.category);
                          return (
                            <Badge className={`${contentType.color} border text-[10px]`}>
                              <span className="flex items-center gap-1">
                                {contentType.icon}
                                {contentType.label}
                              </span>
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {categoryLabels[template.category] || template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {nicheLabels[template.niche] || template.niche || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={`${statusConfig[template.status]?.color || 'bg-muted'} border`}
                        >
                          <span className="flex items-center gap-1">
                            {statusConfig[template.status]?.icon}
                            {statusConfig[template.status]?.label || template.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center" title={template.nelsonApproval?.comments || 'Pendente'}>
                          {getApprovalIcon(template.nelsonApproval)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center" title={template.rafaelApproval?.comments || 'Pendente'}>
                          {getApprovalIcon(template.rafaelApproval)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Revisar
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(template.id) && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={9} className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <ContentPreviewMini 
                                content={template.content} 
                                category={template.category} 
                              />
                            </div>
                            {template.approvals && template.approvals.length > 0 && (
                              <div className="w-72 space-y-2">
                                <p className="text-sm font-medium">Histórico de Aprovações</p>
                                <ScrollArea className="max-h-[280px]">
                                  {template.approvals.map((approval: ContentApprovalRecord) => (
                                    <div 
                                      key={approval.id} 
                                      className="text-xs bg-background/50 border rounded-md p-2 mb-2"
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">{approval.reviewer_name}</span>
                                        <Badge variant="outline" className="text-[10px] px-1">
                                          {approval.status}
                                        </Badge>
                                      </div>
                                      {approval.comments && (
                                        <p className="text-muted-foreground italic">
                                          "{approval.comments}"
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </ScrollArea>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedTemplate?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Content Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {categoryLabels[selectedTemplate?.category || ''] || selectedTemplate?.category}
                </Badge>
                {selectedTemplate?.niche && (
                  <Badge variant="secondary">
                    {nicheLabels[selectedTemplate.niche] || selectedTemplate.niche}
                  </Badge>
                )}
              </div>
              {selectedTemplate && (
                <ContentPreview 
                  content={selectedTemplate.content} 
                  category={selectedTemplate.category}
                  title={selectedTemplate.title}
                  maxHeight="500px"
                  showTabs={true}
                />
              )}
            </div>

            {/* Approval Panel */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quem está aprovando?</label>
                  <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {reviewers.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Comentários (opcional)</label>
                  <Textarea
                    placeholder="Adicione observações..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => selectedTemplate && submitApprovalMutation.mutate({ 
                      templateId: selectedTemplate.id, 
                      status: 'approved' 
                    })}
                    disabled={!selectedReviewer || submitApprovalMutation.isPending}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-orange-500/50 text-orange-600 hover:bg-orange-500/10"
                    onClick={() => selectedTemplate && submitApprovalMutation.mutate({ 
                      templateId: selectedTemplate.id, 
                      status: 'changes_requested' 
                    })}
                    disabled={!selectedReviewer || submitApprovalMutation.isPending}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Solicitar Mudanças
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => selectedTemplate && submitApprovalMutation.mutate({ 
                      templateId: selectedTemplate.id, 
                      status: 'rejected' 
                    })}
                    disabled={!selectedReviewer || submitApprovalMutation.isPending}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Rejeitar
                  </Button>
                </div>
              </div>

              {/* Current Approvals Status */}
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Status de Aprovação</p>
                {reviewers.map(reviewer => {
                  const approval = selectedTemplate?.approvals?.find(
                    (a: ContentApprovalRecord) => a.reviewer_name.toLowerCase() === reviewer.id
                  );
                  return (
                    <div key={reviewer.id} className="flex items-center gap-3">
                      {getApprovalIcon(approval)}
                      <div>
                        <p className="text-sm font-medium">{reviewer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {approval?.status === 'approved' ? 'Aprovado' :
                           approval?.status === 'rejected' ? 'Rejeitado' :
                           approval?.status === 'changes_requested' ? 'Pediu mudanças' :
                           'Aguardando revisão'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentApproval;
