import { useParams, Link } from "react-router-dom";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Share2, Printer, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function BlogPostDetails() {
    const { slug } = useParams();
    const { data: post, isLoading, error } = useBlogPost(slug || "");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-slate-800">Artigo não encontrado</h1>
                <Link to="/blog">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o Blog
                    </Button>
                </Link>
            </div>
        );
    }

    // Estimate read time
    const words = post.content.split(/\s+/).length;
    const readTime = Math.ceil(words / 200);

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hero Section */}
            <div className="bg-slate-50 pt-16 pb-20 border-b">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link to="/blog" className="inline-flex items-center text-slate-500 hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o Blog
                    </Link>

                    <div className="flex gap-3 mb-6">
                        {post.category && (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                {post.category.name}
                            </Badge>
                        )}
                        <span className="flex items-center text-sm text-slate-500 gap-2">
                            <Clock className="w-4 h-4" />
                            {readTime} min de leitura
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">{post.author_name || "Equipe Lifetrek"}</p>
                                <p className="text-xs text-slate-500">
                                    {post.published_at
                                        ? format(new Date(post.published_at), "d 'de' MMMM, yyyy", { locale: ptBR })
                                        : format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                                <Share2 className="w-4 h-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 text-slate-500" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {post.featured_image && (
                <div className="container mx-auto px-4 max-w-5xl -mt-10 mb-12">
                    <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-[400px] object-cover rounded-xl shadow-lg"
                    />
                </div>
            )}

            {/* Content using Markdown */}
            <div className="container mx-auto px-4 max-w-3xl">
                <article className="prose prose-slate prose-lg max-w-none">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="hidden" {...props} />, // Hide H1 as title is already shown
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6" {...props} />,
                            p: ({ node, ...props }) => <p className="text-slate-700 leading-8 mb-6" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-6 text-slate-700" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                            img: ({ node, ...props }) => <img className="rounded-lg shadow-md my-8 w-full" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-primary bg-slate-50 p-6 rounded-r italic text-slate-700 my-8 font-serif text-lg" {...props} />
                            )
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </article>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t">
                        <p className="text-sm font-semibold text-slate-500 mb-3">Tags:</p>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
