import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Check, X, Eye, FileText, Linkedin, Sparkles, Clock,
  ThumbsUp, ThumbsDown, ArrowLeft, Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  useContentApprovalItems,
  useApproveLinkedInPost,
  useRejectLinkedInPost,
} from "@/hooks/useLinkedInPosts";
import {
  usePublishBlogPost,
  useUpdateBlogPost
} from "@/hooks/useBlogPosts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function ContentApproval() {
  const navigate = useNavigate();
  const { data: items, isLoading } = useContentApprovalItems();
  const approveLinkedIn = useApproveLinkedInPost();
  const rejectLinkedIn = useRejectLinkedInPost();
  const publishBlog = usePublishBlogPost();
  const updateBlog = useUpdateBlogPost();

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handlePreview = (item: any) => {
    setSelectedItem(item);
    setPreviewDialogOpen(true);
  };

  const handleApprove = async (item: any) => {
    try {
      if (item.type === 'blog') {
        await publishBlog.mutateAsync(item.id);
      } else if (item.type === 'linkedin') {
        await approveLinkedIn.mutateAsync(item.id);
      }
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectionReason.trim()) {
      toast.error("Por favor, informe o motivo da rejeição");
      return;
    }

    try {
      if (selectedItem.type === 'blog') {
        await updateBlog.mutateAsync({
          id: selectedItem.id,
          status: 'rejected',
        });
      } else if (selectedItem.type === 'linkedin') {
        await rejectLinkedIn.mutateAsync({
          id: selectedItem.id,
          reason: rejectionReason,
        });
      }
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedItem(null);
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  const openRejectDialog = (item: any) => {
    setSelectedItem(item);
    setRejectDialogOpen(true);
  };

  const renderPreview = () => {
    if (!selectedItem) return null;

    if (selectedItem.type === 'blog') {
      const blog = selectedItem.full_data;
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{blog.title}</h3>
            {blog.excerpt && (
              <p className="text-muted-foreground italic">{blog.excerpt}</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">SEO</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Título SEO:</strong> {blog.seo_title || 'N/A'}</p>
              <p><strong>Descrição:</strong> {blog.seo_description || 'N/A'}</p>
              <p><strong>Keywords:</strong> {blog.keywords?.join(', ') || 'N/A'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Conteúdo</h4>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 1000) + '...' }}
            />
          </div>
        </div>
      );
    } else if (selectedItem.type === 'linkedin') {
      const post = selectedItem.full_data;
      const slides = post.slides || [];

      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{post.topic}</h3>
            <div className="flex gap-2 items-center">
              <Badge variant={post.post_type === 'value' ? 'secondary' : 'default'}>
                {post.post_type === 'value' ? 'Educacional' : 'Comercial'}
              </Badge>
              {post.ai_generated && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  IA
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm"><strong>Público-alvo:</strong> {post.target_audience || 'N/A'}</p>
            <p className="text-sm"><strong>Pain Point:</strong> {post.pain_point || 'N/A'}</p>
            <p className="text-sm"><strong>Outcome Desejado:</strong> {post.desired_outcome || 'N/A'}</p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Slides ({slides.length})</h4>
            <div className="space-y-3">
              {slides.map((slide: any, idx: number) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{slide.type}</Badge>
                      {slide.imageUrl && <Eye className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold">{slide.headline}</p>
                    <p className="text-sm text-muted-foreground">{slide.body}</p>
                    {slide.imageUrl && (
                      <img
                        src={slide.imageUrl}
                        alt={`Slide ${idx + 1}`}
                        className="rounded-md w-full max-h-64 object-cover mt-2"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {post.caption && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Caption LinkedIn</h4>
              <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                {post.caption}
              </p>
            </div>
          )}
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const blogItems = items?.filter(i => i.type === 'blog') || [];
  const linkedInItems = items?.filter(i => i.type === 'linkedin') || [];
  const allPending = items || [];

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aprovação de Conteúdo</h1>
            <p className="text-muted-foreground">
              Revise e aprove conteúdo gerado por IA antes da publicação
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {allPending.length} pendente(s)
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all" className="text-base">
            Todos ({allPending.length})
          </TabsTrigger>
          <TabsTrigger value="blogs" className="text-base">
            <FileText className="h-4 w-4 mr-2" />
            Blogs ({blogItems.length})
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="text-base">
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn ({linkedInItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allPending.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Check className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Tudo aprovado!</h3>
                <p className="text-muted-foreground">
                  Não há conteúdo pendente de aprovação no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            allPending.map((item) => (
              <Card key={`${item.type}-${item.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {item.type === 'blog' ? (
                          <FileText className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Linkedin className="h-5 w-5 text-blue-600" />
                        )}
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                      <CardDescription>{item.content_preview}</CardDescription>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">
                          {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </Badge>
                        {item.ai_generated && (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            Gerado por IA
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePreview(item)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleApprove(item)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      disabled={approveLinkedIn.isPending || publishBlog.isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(item)}
                      className="gap-2"
                      disabled={rejectLinkedIn.isPending || updateBlog.isPending}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="blogs" className="space-y-4">
          {blogItems.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Nenhum blog pendente de aprovação
              </CardContent>
            </Card>
          ) : (
            blogItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                      <CardDescription>{item.content_preview}</CardDescription>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">
                          {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </Badge>
                        {item.ai_generated && (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            Gerado por IA
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePreview(item)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleApprove(item)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      disabled={publishBlog.isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(item)}
                      className="gap-2"
                      disabled={updateBlog.isPending}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          {linkedInItems.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                Nenhum post do LinkedIn pendente de aprovação
              </CardContent>
            </Card>
          ) : (
            linkedInItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                      <CardDescription>{item.content_preview}</CardDescription>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">
                          {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </Badge>
                        {item.ai_generated && (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            Gerado por IA
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePreview(item)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => handleApprove(item)}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      disabled={approveLinkedIn.isPending}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(item)}
                      className="gap-2"
                      disabled={rejectLinkedIn.isPending}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'blog' ? 'Pré-visualização do Blog' : 'Pré-visualização do Post LinkedIn'}
            </DialogTitle>
          </DialogHeader>
          {renderPreview()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Fechar
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setPreviewDialogOpen(false);
                handleApprove(selectedItem);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Conteúdo</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe o motivo da rejeição para feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo da rejeição..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRejectionReason("");
              setSelectedItem(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Rejeição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
