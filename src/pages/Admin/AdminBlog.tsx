import { useState } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Plus,
    FileText,
    Calendar,
    Search,
    Edit,
    Trash2,
    ExternalLink,
    Sparkles,
    RefreshCw,
    Loader2
} from "lucide-react";
import {
    useBlogPosts,
    useCreateBlogPost,
    useDeleteBlogPost,
    usePublishBlogPost,
    useBlogCategories
} from "@/hooks/useBlogPosts";
import { BLOG_TOPICS, BlogTopic } from "@/config/blogTopics";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

export default function AdminBlog() {
    const [activeTab, setActiveTab] = useState("posts");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<BlogTopic | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: posts, isLoading } = useBlogPosts(false);
    const { data: categories } = useBlogCategories();
    const createPost = useCreateBlogPost();
    const deletePost = useDeleteBlogPost();
    const publishPost = usePublishBlogPost();

    const handleGeneratePost = async (topic: BlogTopic) => {
        setIsGenerating(true);
        try {
            toast.info(`Iniciando geração do artigo: ${topic.topic}`);

            const { data, error } = await supabase.functions.invoke('generate-blog-post', {
                body: {
                    topic: topic.topic,
                    keywords: topic.keywords,
                    category: topic.category
                }
            });

            if (error) throw error;

            toast.success("Artigo gerado com sucesso! Revise na aba de Posts.");
            setActiveTab("posts");
        } catch (error) {
            console.error("Error generating post:", error);
            toast.error("Erro ao gerar artigo. Tente novamente.");
        } finally {
            setIsGenerating(false);
            setSelectedTopic(null);
        }
    };

    const filteredPosts = posts?.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.status.includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published': return <Badge className="bg-green-500">Publicado</Badge>;
            case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
            case 'pending_review': return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Revisão</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejeitado</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Blog & SEO</h1>
                    <p className="text-muted-foreground">Gerencie artigos, categorias e estratégia de conteúdo SEO.</p>
                </div>
                <Button onClick={() => setActiveTab("new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Artigo
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="posts">Gerenciar Posts</TabsTrigger>
                    <TabsTrigger value="strategy">Estratégia & Tópicos</TabsTrigger>
                    <TabsTrigger value="categories">Categorias</TabsTrigger>
                    <TabsTrigger value="new" className="hidden">Editor</TabsTrigger>
                </TabsList>

                <TabsContent value="posts">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Artigos ({filteredPosts?.length || 0})</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar artigos..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Data Criação</TableHead>
                                            <TableHead>Views</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPosts?.map((post) => (
                                            <TableRow key={post.id}>
                                                <TableCell className="font-medium">{post.title}</TableCell>
                                                <TableCell>{getStatusBadge(post.status)}</TableCell>
                                                <TableCell>{format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                                                <TableCell>-</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {post.status !== 'published' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-green-600 hover:text-green-700"
                                                            onClick={() => publishPost.mutate(post.id)}
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive/90"
                                                        onClick={() => {
                                                            if (confirm("Tem certeza que deseja excluir?")) {
                                                                deletePost.mutate(post.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="strategy">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BLOG_TOPICS.map((topic, index) => {
                            const exists = posts?.some(p => p.title.includes(topic.topic.substring(0, 20)));
                            return (
                                <Card key={index} className={exists ? "opacity-60 bg-muted" : ""}>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant={topic.priority === 'high' ? 'default' : 'secondary'} className="mb-2">
                                                Prioridade {topic.priority === 'high' ? 'Alta' : topic.priority === 'medium' ? 'Média' : 'Baixa'}
                                            </Badge>
                                            {exists && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Gerado</Badge>}
                                        </div>
                                        <CardTitle className="text-lg leading-tight">{topic.topic}</CardTitle>
                                        <CardDescription className="mt-2">
                                            Mês {topic.month} • {topic.category}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {topic.keywords.map(k => (
                                                <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                                            ))}
                                        </div>
                                        {!exists && (
                                            <Button
                                                className="w-full"
                                                onClick={() => handleGeneratePost(topic)}
                                                disabled={isGenerating}
                                            >
                                                {isGenerating && selectedTopic?.topic === topic.topic ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                )}
                                                Gerar com IA
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="categories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categorias do Blog</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Descrição</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories?.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell>{cat.slug}</TableCell>
                                            <TableCell>{cat.description || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
