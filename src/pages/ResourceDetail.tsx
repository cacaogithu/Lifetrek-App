import { useParams, Link } from "react-router-dom";
import { useResource } from "@/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Share2, Download, Printer } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function ResourceDetail() {
    const { slug } = useParams();
    const { data: resource, isLoading, error } = useResource(slug || "");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-slate-800">Recurso não encontrado</h1>
                <Link to="/resources">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Recursos
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <Link to="/resources" className="inline-flex items-center text-slate-500 hover:text-primary mb-6 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Recursos
                    </Link>

                    <div className="max-w-4xl mx-auto">
                        <div className="flex gap-3 mb-4">
                            <Badge variant="secondary" className="uppercase tracking-wider">
                                {resource.type === 'calculator' ? 'Calculadora' :
                                    resource.type === 'checklist' ? 'Checklist' : 'Guia'}
                            </Badge>
                            {resource.persona && (
                                <Badge variant="outline" className="text-slate-500 border-slate-200">
                                    Para {resource.persona.split('/')[0]}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                            {resource.title}
                        </h1>

                        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            {resource.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-slate-500 border-t pt-6">
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(resource.created_at), "d 'de' MMMM, yyyy", { locale: ptBR })}
                                </span>
                                <span className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Lifetrek Engineering
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => window.print()}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Imprimir
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Compartilhar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-8 md:p-12">
                    <div className="prose prose-slate prose-lg max-w-none">
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-slate-900 mb-6 mt-10" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold text-slate-800 mb-4 mt-8 pb-2 border-b" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-6" {...props} />,
                                li: ({ node, ...props }) => <li className="text-slate-700 leading-relaxed" {...props} />,
                                p: ({ node, ...props }) => <p className="text-slate-700 leading-relaxed mb-6" {...props} />,
                                blockquote: ({ node, ...props }) => (
                                    <blockquote className="border-l-4 border-primary bg-slate-50 p-4 rounded-r italic text-slate-700 my-6" {...props} />
                                )
                            }}
                        >
                            {resource.content}
                        </ReactMarkdown>
                    </div>

                    {/* CTA Footer */}
                    <div className="mt-16 pt-8 border-t bg-slate-50 -mx-8 -mb-8 md:-mx-12 md:-mb-12 p-8 md:p-12 text-center rounded-b-xl">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Gostou deste recurso?</h3>
                        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
                            Nossa equipe de engenharia pode ajudar sua empresa a implementar essas estratégias na prática.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/contact">
                                <Button size="lg" className="px-8">
                                    Falar com um Especialista
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg">
                                <Download className="mr-2 h-4 w-4" />
                                Baixar PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
