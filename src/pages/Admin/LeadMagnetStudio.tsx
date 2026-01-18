import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
    Sparkles,
    FileText,
    Users,
    CheckCircle2,
    ArrowRight,
    Loader2,
    FileCheck,
    Map,
    Calculator as CalcIcon,
    Download,
    Eye,
    Edit3,
    ArrowLeft
} from "lucide-react";
import { dispatchLeadMagnetJob, getJobStatus } from "@/lib/agents";

const TEMPLATES = [
    {
        id: "tco-calculator",
        title: "Calculadora TCO & Lead Time",
        description: "Análise financeira completa: Importado vs Nacional (CFO & Supply Chain).",
        persona: "CFO / Diretor de Supply Chain",
        icon: CalcIcon,
        color: "bg-green-500/10 text-green-500",
        topic: "Comparativo de Landed Cost, Câmbio e Capital de Giro liberado",
        format: "Excel / Planilha Estruturada",
        cta: "CALCULO"
    },
    {
        id: "dfm-checklist",
        title: "Checklist DFM para Implantes",
        description: "Revisão de desenho técnico focado em Swiss-type e manufatura médica.",
        persona: "Engenharia de Produto / P&D",
        icon: FileCheck,
        color: "bg-blue-500/10 text-blue-500",
        topic: "Geometrias críticas, relação Diâmetro/Profundidade e rugosidade (Ra)",
        format: "PDF Técnico (2-3 páginas)",
        cta: "DFM"
    },
    {
        id: "iso-audit-checklist",
        title: "Checklist Auditoria ISO 13485",
        description: "Formulário pronto para visitas técnicas em fornecedores de usinagem.",
        persona: "Gestor de Qualidade / QA",
        icon: Map,
        color: "bg-orange-500/10 text-orange-500",
        topic: "Metrologia, Rastreabilidade, Sala Limpa e Controle de Mudanças (ECN)",
        format: "Excel / Word (Check Matrix)",
        cta: "AUDITORIA"
    },
    {
        id: "capital-planner",
        title: "Redução de Capital de Giro",
        description: "Planejador de estoque sob demanda para reduzir working capital.",
        persona: "Financeiro / Operações",
        icon: Sparkles,
        color: "bg-purple-500/10 text-purple-500",
        topic: "Cobertura de estoque vs fornecimento local just-in-time",
        format: "Planilha + Guia de Lógica",
        cta: "CAPITAL"
    }
];

export default function LeadMagnetStudio() {
    const [view, setView] = useState<"gallery" | "workspace">("gallery");
    const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [content, setContent] = useState("");
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("preview");
    const previewRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!selectedTemplate) {
            toast.error("Por favor, selecione um template");
            return;
        }

        try {
            setIsGenerating(true);
            const id = await dispatchLeadMagnetJob(
                selectedTemplate.persona,
                topic || selectedTemplate.topic,
                selectedTemplate.id
            );
            toast.success("Consultando o agente de crescimento...");

            const pollInterval = setInterval(async () => {
                try {
                    const job = await getJobStatus(id);
                    if (job.status === 'completed') {
                        setContent(job.result.content);
                        setIsGenerating(false);
                        setView("workspace");
                        setActiveTab("preview");
                        clearInterval(pollInterval);
                        toast.success("Lead Magnet preparado!");
                    } else if (job.status === 'failed') {
                        setIsGenerating(false);
                        clearInterval(pollInterval);
                        toast.error("Erro na geração: " + (job.error || "Desconhecido"));
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }
            }, 3000);

        } catch (error) {
            console.error(error);
            toast.error("Falha ao iniciar geração");
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (view === "workspace") {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setView("gallery")}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h2 className="text-2xl font-bold">{selectedTemplate?.title}</h2>
                            <p className="text-sm text-muted-foreground">{selectedTemplate?.persona}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <div className="flex items-center bg-muted rounded-lg p-1 mr-4">
                            <Button
                                variant={activeTab === "preview" ? "secondary" : "ghost"}
                                size="sm"
                                className="gap-2"
                                onClick={() => setActiveTab("preview")}
                            >
                                <Eye className="w-4 h-4" /> Visualizar
                            </Button>
                            <Button
                                variant={activeTab === "edit" ? "secondary" : "ghost"}
                                size="sm"
                                className="gap-2"
                                onClick={() => setActiveTab("edit")}
                            >
                                <Edit3 className="w-4 h-4" /> Editar
                            </Button>
                        </div>
                        <Button variant="outline" className="gap-2" onClick={handlePrint}>
                            <Download className="w-4 h-4" /> Exportar PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 min-h-[700px]">
                    {activeTab === "edit" ? (
                        <Card className="shadow-none border-2">
                            <CardContent className="p-0">
                                <Textarea
                                    className="min-h-[700px] border-none focus-visible:ring-0 text-lg font-mono p-8 leading-relaxed"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Comece a editar seu lead magnet..."
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex justify-center bg-muted/30 p-8 rounded-xl overflow-hidden print:p-0 print:bg-white">
                            <div
                                ref={previewRef}
                                className="w-[210mm] min-h-[297mm] bg-white shadow-2xl p-[20mm] prose prose-slate max-w-none print:shadow-none print:w-full"
                                style={{
                                    fontFamily: 'system-ui, -apple-system, sans-serif'
                                }}
                            >
                                {/* Branded Header for PDF */}
                                <div className="flex items-center justify-between mb-12 pb-6 border-b-4 border-primary/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
                                            L
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg tracking-tight uppercase">Lifetrek Medical</span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Precision Manufacturing Excellence</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                            ISO 13485:2016 Certified
                                        </Badge>
                                    </div>
                                </div>

                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight border-l-8 border-primary pl-6" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b-2 border-slate-100" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-none space-y-4 my-6" {...props} />,
                                        li: ({ node, ...props }) => (
                                            <li className="flex items-start gap-3" {...props}>
                                                <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                                </div>
                                                <span className="text-slate-700">{props.children}</span>
                                            </li>
                                        ),
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote className="border-none bg-slate-50 p-6 rounded-r-lg border-l-4 border-primary italic text-slate-600 mb-8" {...props} />
                                        )
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>

                                {/* Branded Footer for PDF */}
                                <div className="mt-20 pt-8 border-t border-slate-100 grid grid-cols-2 text-[11px] text-muted-foreground flex items-end">
                                    <div>
                                        <p className="font-bold text-primary mb-1">Lifetrek Medical Indústria e Comércio Ltda.</p>
                                        <p>Indaiatuba, SP - Brasil | global@lifetrek.med</p>
                                    </div>
                                    <div className="text-right">
                                        <p>Este documento é um recurso técnico proprietário para parceiros Lifetrek.</p>
                                        <p>© {new Date().getFullYear()} Lifetrek Medical</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print\\:visible, .print\\:visible * {
                            visibility: visible;
                        }
                        .print-container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                    Lead Magnet Studio
                    <Badge variant="secondary" className="text-xs uppercase tracking-widest bg-orange-500/10 text-orange-600 border-orange-200">
                        Beta
                    </Badge>
                </h1>
                <p className="text-muted-foreground text-lg">
                    Crie ativos de alto valor para atrair tomadores de decisão na indústria médica.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TEMPLATES.map((template) => (
                    <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${selectedTemplate?.id === template.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
                        onClick={() => {
                            setSelectedTemplate(template);
                            setTopic(template.topic);
                        }}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.color}`}>
                                    <template.icon className="w-6 h-6" />
                                </div>
                                <Badge variant="outline" className="text-[10px] opacity-50 uppercase">v1.0 Beta</Badge>
                            </div>
                            <CardTitle className="text-xl">{template.title}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>{template.persona}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedTemplate && (
                <Card className="animate-in slide-in-from-bottom-4 duration-500 overflow-hidden border-primary/20">
                    <div className="h-2 bg-gradient-to-r from-primary to-blue-600" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="w-6 h-6 text-primary" />
                            Personalizar Ativo
                        </CardTitle>
                        <CardDescription>
                            Refine o tópico para o seu contexto específico ou use o padrão recomendado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Tópico ou Diferencial Específico</Label>
                            <Input
                                id="topic"
                                placeholder="Ex: Miniaturização de parafusos pediculares..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="text-lg py-6"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <Badge variant="outline" className="px-3 py-1">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                                Branding Lifetrek Ativo
                            </Badge>
                            <Button
                                size="lg"
                                className="gap-2 px-8 py-6 text-lg"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Gerando Conteúdo...
                                    </>
                                ) : (
                                    <>
                                        Gerar Lead Magnet
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
