import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, MessageSquare, Eye, ThumbsUp, ThumbsDown, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
}

interface ContentApproval {
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

interface ContentComment {
  id: string;
  template_id: string;
  commenter_name: string;
  commenter_email: string;
  comment: string;
  created_at: string;
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

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  pending_approval: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  archived: 'bg-gray-400',
};

const ContentApproval = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['content-templates', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('content_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContentTemplate[];
    },
  });

  // Fetch approvals for selected template
  const { data: approvals } = useQuery({
    queryKey: ['content-approvals', selectedTemplate?.id],
    queryFn: async () => {
      if (!selectedTemplate) return [];
      const { data, error } = await supabase
        .from('content_approvals')
        .select('*')
        .eq('template_id', selectedTemplate.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContentApproval[];
    },
    enabled: !!selectedTemplate,
  });

  // Fetch comments for selected template
  const { data: comments } = useQuery({
    queryKey: ['content-comments', selectedTemplate?.id],
    queryFn: async () => {
      if (!selectedTemplate) return [];
      const { data, error } = await supabase
        .from('content_comments')
        .select('*')
        .eq('template_id', selectedTemplate.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContentComment[];
    },
    enabled: !!selectedTemplate,
  });

  // Submit approval mutation
  const submitApprovalMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      if (!selectedTemplate) throw new Error('No template selected');
      if (!reviewerName) throw new Error('Nome do revisor é obrigatório');

      const { data, error } = await supabase
        .from('content_approvals')
        .insert({
          template_id: selectedTemplate.id,
          reviewer_name: reviewerName,
          reviewer_email: reviewerEmail || null,
          reviewer_type: 'client',
          status,
          comments: reviewComments || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update template status
      const newStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending_approval';
      await supabase
        .from('content_templates')
        .update({ status: newStatus })
        .eq('id', selectedTemplate.id);

      return data;
    },
    onSuccess: () => {
      toast.success('Avaliação enviada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
      queryClient.invalidateQueries({ queryKey: ['content-approvals'] });
      setReviewComments('');
      setSelectedTemplate(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao enviar avaliação: ${error.message}`);
    },
  });

  // Submit comment mutation
  const submitCommentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate) throw new Error('No template selected');
      if (!reviewerName) throw new Error('Nome é obrigatório');
      if (!commentText) throw new Error('Comentário é obrigatório');

      const { data, error } = await supabase
        .from('content_comments')
        .insert({
          template_id: selectedTemplate.id,
          commenter_name: reviewerName,
          commenter_email: reviewerEmail || null,
          comment: commentText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Comentário adicionado!');
      queryClient.invalidateQueries({ queryKey: ['content-comments'] });
      setCommentText('');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    },
  });

  const handleApprove = () => {
    submitApprovalMutation.mutate({ status: 'approved' });
  };

  const handleReject = () => {
    submitApprovalMutation.mutate({ status: 'rejected' });
  };

  const handleRequestChanges = () => {
    submitApprovalMutation.mutate({ status: 'changes_requested' });
  };

  const handleAddComment = () => {
    submitCommentMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">
            Aprovação de Conteúdo
          </h1>
          <p className="text-muted-foreground text-lg">
            Revise e aprove prompts e templates de outreach
          </p>
        </div>

        {/* Reviewer Info */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle>Informações do Revisor</CardTitle>
            <CardDescription>Identifique-se para deixar comentários e aprovações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reviewer-name">Nome *</Label>
                <Input
                  id="reviewer-name"
                  placeholder="Seu nome"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reviewer-email">Email (opcional)</Label>
                <Input
                  id="reviewer-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando templates...</p>
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-primary/10 hover:border-primary/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={statusColors[template.status]}>
                      {template.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{categoryLabels[template.category]}</Badge>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description || 'Sem descrição'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {template.niche && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Nicho:</strong> {nicheLabels[template.niche] || template.niche}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      <strong>Idioma:</strong> {template.language === 'pt-BR' ? 'Português' : 'Inglês'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Versão:</strong> {template.version}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Revisar Conteúdo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>{template.title}</DialogTitle>
                        <DialogDescription>
                          {categoryLabels[template.category]} • {template.niche ? nicheLabels[template.niche] : 'Geral'}
                        </DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="content">Conteúdo</TabsTrigger>
                          <TabsTrigger value="comments">
                            Comentários ({comments?.length || 0})
                          </TabsTrigger>
                          <TabsTrigger value="approvals">
                            Aprovações ({approvals?.length || 0})
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="content" className="space-y-4">
                          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                                {template.content}
                              </pre>
                            </div>
                          </ScrollArea>
                          <Separator />
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="review-comments">Comentários da Revisão</Label>
                              <Textarea
                                id="review-comments"
                                placeholder="Adicione seus comentários sobre este conteúdo..."
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                rows={4}
                                disabled={!reviewerName}
                              />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={handleApprove}
                                disabled={!reviewerName || submitApprovalMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button
                                onClick={handleRequestChanges}
                                disabled={!reviewerName || submitApprovalMutation.isPending}
                                variant="outline"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Solicitar Mudanças
                              </Button>
                              <Button
                                onClick={handleReject}
                                disabled={!reviewerName || submitApprovalMutation.isPending}
                                variant="destructive"
                              >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="comments" className="space-y-4">
                          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                            {comments && comments.length > 0 ? (
                              <div className="space-y-4">
                                {comments.map((comment) => (
                                  <Card key={comment.id}>
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold">
                                          {comment.commenter_name}
                                        </CardTitle>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                      </div>
                                      {comment.commenter_email && (
                                        <CardDescription className="text-xs">
                                          {comment.commenter_email}
                                        </CardDescription>
                                      )}
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-sm">{comment.comment}</p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground py-8">
                                Nenhum comentário ainda
                              </p>
                            )}
                          </ScrollArea>
                          <Separator />
                          <div className="space-y-2">
                            <Label htmlFor="new-comment">Adicionar Comentário</Label>
                            <Textarea
                              id="new-comment"
                              placeholder="Digite seu comentário..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              rows={3}
                              disabled={!reviewerName}
                            />
                            <Button
                              onClick={handleAddComment}
                              disabled={!reviewerName || !commentText || submitCommentMutation.isPending}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Adicionar Comentário
                            </Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="approvals">
                          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                            {approvals && approvals.length > 0 ? (
                              <div className="space-y-4">
                                {approvals.map((approval) => (
                                  <Card key={approval.id}>
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold">
                                          {approval.reviewer_name}
                                        </CardTitle>
                                        <Badge
                                          className={
                                            approval.status === 'approved'
                                              ? 'bg-green-500'
                                              : approval.status === 'rejected'
                                              ? 'bg-red-500'
                                              : 'bg-yellow-500'
                                          }
                                        >
                                          {approval.status === 'approved' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                          {approval.status === 'rejected' && <XCircle className="mr-1 h-3 w-3" />}
                                          {approval.status.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                      <CardDescription className="text-xs">
                                        {approval.reviewer_email && `${approval.reviewer_email} • `}
                                        {new Date(approval.created_at).toLocaleDateString('pt-BR')}
                                      </CardDescription>
                                    </CardHeader>
                                    {approval.comments && (
                                      <CardContent>
                                        <p className="text-sm">{approval.comments}</p>
                                      </CardContent>
                                    )}
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground py-8">
                                Nenhuma aprovação registrada
                              </p>
                            )}
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent>
              <p className="text-center text-muted-foreground">
                Nenhum template encontrado nesta categoria
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentApproval;
