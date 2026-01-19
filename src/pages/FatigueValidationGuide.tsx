import React, { useState, useEffect } from 'react';
import Mermaid from '@/components/agents/Mermaid';
import { Button } from '@/components/ui/button';
import { Printer, Download, CheckCircle, AlertTriangle, Info, ArrowRight, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FatigueValidationGuide = () => {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const unlocked = localStorage.getItem('lifetrek_fatigue_guide_unlocked');
        if (unlocked === 'true') {
            setHasAccess(true);
        }
    }, []);

    const mermaidChart = `
    graph TD
        %% Nodes
        Start(["Novo Design de Implante (CAD)"])
        
        subgraph Validacao["1. Validacao de Geometria"]
            Print3D["Impressao 3D Medica (Polimero/Resina)"]
            CheckGeo{"Geometria/Encaixe Aprovados?"}
        end

        subgraph Prep["2. Selecao de Material"]
            CheckMat{"Material Final: Ti, Nitinol ou PEEK?"}
            RejectMat["Rever Projeto/Material (Fora do Escopo)"]
        end

        subgraph CNC["3. Preparacao e Usinagem CNC"]
            DefCrit["Definir Superficies Criticas e Tolerancias"]
            Machining["Usinagem CNC Citizen M32 / 5 Eixos"]
        end

        subgraph Quality["4. Metrologia e Documentacao"]
            Metro["Metrologia CMM - Laudo ISO 13485"]
        end

        subgraph Test["5. Validacao"]
            Fatigue["Ensaio de Fadiga"]
            CheckResult{"Resultados dentro da Meta?"}
            Loop["Analise de Falha - Rever Processo"]
            Final(["Congelar Especificacao - Validacao Final"])
        end

        %% Connections
        Start --> Print3D
        Print3D --> CheckGeo
        CheckGeo -- Nao --> Start
        CheckGeo -- Sim --> CheckMat

        CheckMat -- Nao --> RejectMat
        CheckMat -- Sim --> DefCrit

        DefCrit --> Machining
        Machining --> Metro
        Metro --> Fatigue
        Fatigue --> CheckResult

        CheckResult -- Nao --> Loop
        Loop --> Start
        CheckResult -- Sim --> Final

        %% Styling
        classDef default fill:#ffffff,stroke:#334155,stroke-width:1px,color:#0f172a;
        classDef startend fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a,font-weight:bold;
        classDef decision fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#78350f;
        classDef process fill:#f8fafc,stroke:#64748b,stroke-width:1px;

        class Start,Final startend;
        class CheckGeo,CheckMat,CheckResult decision;
        class Print3D,Machining,Metro,Fatigue,DefCrit,Loop,RejectMat process;
    `;

    const handlePrintClick = () => {
        if (hasAccess) {
            window.print();
        } else {
            setIsModalOpen(true);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate
            if (!formData.name || !formData.email) {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Por favor, preencha nome e email."
                });
                setIsSubmitting(false);
                return;
            }

            // Save lead
            const { error } = await supabase
                .from('contact_leads')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    company: formData.company,
                    source: 'lead_magnet_fatigue',
                    status: 'new',
                    project_types: ['fatigue_validation']
                });

            if (error) {
                console.error('Error saving lead:', error);
                // Continue anyway to not block user if backend fails (graceful degradation for lead magnet)
            }

            // Unlock
            localStorage.setItem('lifetrek_fatigue_guide_unlocked', 'true');
            setHasAccess(true);
            setIsModalOpen(false);

            toast({
                title: "Sucesso!",
                description: "O guia foi desbloqueado. O download iniciará em instantes."
            });

            // Small delay before print to allow toast to show
            setTimeout(() => {
                window.print();
            }, 1000);

        } catch (err) {
            console.error('Unexpected error:', err);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro. Tente novamente."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
            {/* Header / CTA Bar */}
            <div className="max-w-5xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center print:hidden gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fluxo de Validação de Fadiga</h1>
                    <p className="text-slate-600 dark:text-slate-400">Guia 3D + CNC para Implantes Ortopédicos</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={handlePrintClick} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                        {hasAccess ? <Printer className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                        {hasAccess ? "Imprimir / Salvar PDF" : "Baixar PDF do Guia"}
                    </Button>
                </div>
            </div>

            {/* Page 1: Flowchart */}
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-8 print:shadow-none print:border-none print:mb-0 print:break-after-page">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-1 block">Framework Lifetrek</span>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Do CAD ao Teste de Fadiga em Semanas</h2>
                            <p className="text-slate-500 mt-2 max-w-2xl">
                                Combine impressão 3D médica para validar geometria com usinagem CNC em materiais de grau implante para testar fadiga em condições reais.
                            </p>
                        </div>
                        <div className="hidden print:block text-right">
                            <h3 className="text-lg font-bold text-slate-900">Lifetrek Medical</h3>
                            <p className="text-sm text-slate-500">lifetrek.io</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-100 dark:border-slate-700">
                        <Mermaid chart={mermaidChart} />
                    </div>

                    <div className="mt-6 flex gap-6 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20">
                                <Info className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Por que CNC é obrigatório?</h4>
                                <p>Impressão 3D valida forma. Fadiga exige peça usinada em titânio/PEEK com tolerâncias de mícron.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg dark:bg-green-900/20">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Resultado ANVISA/FDA</h4>
                                <p>Materiais reais usinados (F136, Nitinol) geram dados confiáveis para submissão regulatória.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Page 2: Checklist */}
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 print:shadow-none print:border-none">
                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Checklist Técnico & Decisões Críticas</h2>
                        <p className="text-slate-500">Parâmetros para execução segura do pipeline 3D + CNC.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Section A */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm dark:bg-blue-900/30">A</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Impressão 3D (Setup)</h3>
                            </div>
                            <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                        <CheckCircle className="h-4 w-4 text-green-500" /> Quando usar:
                                    </h4>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                                            Validar forma, encaixe e ergonomia.
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                                            Verificar acesso de instrumentais cirúrgicos.
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                                            Aprovação visual de design.
                                        </li>
                                    </ul>
                                    <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Quando NÃO usar:
                                    </h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5" />
                                            Conclusão final de fadiga (anisotropia do material diverge do real).
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Section B */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm dark:bg-indigo-900/30">B</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">CNC & Manufatura</h3>
                            </div>
                            <Card className="border-l-4 border-l-indigo-500 shadow-sm">
                                <CardContent className="pt-6 text-sm text-slate-600 dark:text-slate-300 space-y-4">
                                    <div className="space-y-2">
                                        <h5 className="font-semibold text-slate-900 dark:text-white">Material Real</h5>
                                        <p>Utilizar Ti ASTM F136, Nitinol ou PEEK equivalente ao produto final. Não use substitutos para teste de fadiga.</p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h5 className="font-semibold text-slate-900 dark:text-white">Regiões Críticas</h5>
                                        <p>Identificar áreas de maior tensão (roscas, mudanças de seção). Tolerâncias de mícron são mandatórias aqui.</p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h5 className="font-semibold text-slate-900 dark:text-white">Acabamento</h5>
                                        <p>Especificar rugosidade (Ra) em zonas de contato ósseo ou articular.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Section C */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm dark:bg-teal-900/30">C</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Metrologia & Doc</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Medir 100% das regiões críticas em CMM.</span>
                                </li>
                                <li className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Vincular laudo dimensional ao lote do material e ao programa CNC usado.</span>
                                </li>
                                <li className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-teal-500 shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Rastreabilidade total (ISO 13485).</span>
                                </li>
                            </ul>
                        </section>

                        {/* Section D */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm dark:bg-orange-900/30">D</div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Iteração & Aprendizado</h3>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800">
                                <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Regra de Ouro</h4>
                                <p className="text-sm text-orange-700 dark:text-orange-400 italic">
                                    "Só mudar UMA variável por vez (geometria OU processo) nos loops de teste."
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
                                    Se mudar ambos, você não saberá se a falha foi design ou usinagem.
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 text-center print:mt-4">
                        <p className="font-medium text-slate-900 dark:text-white">Lifetrek Medical — Parceiro de Manufatura Avançada</p>
                        <p className="text-slate-500 text-sm mt-1">lifetrek.io • ISO 13485 Certified</p>
                    </div>
                </div>
            </div>

            {/* Email Capture Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Baixar o Fluxograma Completo</DialogTitle>
                        <DialogDescription>
                            Insira seus dados para liberar o download do PDF com checklist técnico.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                placeholder="Seu nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="voce@empresa.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Empresa (Opcional)</Label>
                            <Input
                                id="company"
                                placeholder="Nome da sua empresa"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Liberando..." : "Desbloquear PDF"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FatigueValidationGuide;
