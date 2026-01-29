import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Search, Zap, User, BarChart3, Mail, Linkedin, AlertTriangle, ArrowRight } from "lucide-react";

const RoiSimulation = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Relatório de Inteligência Comercial
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        Simulação de ROI: Centralização de Dados vs. Status Quo
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-black bg-white/10 hover:bg-white/20 border-white/20 text-white gap-2">
                        <Mail className="w-4 h-4" />
                        Ver Email Simulado
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
                        Aprovar Upgrade Unipile
                    </Button>
                </div>
            </div>

            {/* Main Stats Row */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Mensagens Lidas (Semana)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">142</div>
                        <p className="text-xs text-emerald-400 flex items-center mt-1">
                            <Zap className="w-3 h-3 mr-1" /> 100% Capturado por IA
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Tempo Economizado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">6.5h</div>
                        <p className="text-xs text-blue-400 mt-1">
                            Equivalente a R$ 850/sem em hora/venda
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Oportunidades Salvas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-400">3</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Leads que seriam esquecidos
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border-emerald-500/30 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-300">ROI Projetado (Mês)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">12x</div>
                        <p className="text-xs text-emerald-400 mt-1">
                            Custo Unipile vs. Valor Carga Horária
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Comparison Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Human / Manual */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-red-500/5 rounded-2xl blur-xl group-hover:bg-red-500/10 transition-all"></div>
                    <Card className="relative h-full bg-slate-900 border-slate-800 hover:border-red-500/30 transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4">
                                <User className="w-6 h-6 text-slate-400" />
                            </div>
                            <CardTitle className="text-xl text-white">Método Humano</CardTitle>
                            <CardDescription className="text-slate-400">Sem ferramentas. Caos total.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded bg-red-950/20 border border-red-900/30 text-sm">
                                <X className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-slate-300"><strong className="text-red-400">Caixa Preta:</strong> Você não sabe o que a Vanessa falou para o cliente. Nenhuma mensagem é registrada.</span>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded bg-slate-800/50 border border-slate-700/50 text-sm">
                                <X className="w-5 h-5 text-slate-500 shrink-0" />
                                <span className="text-slate-300">Dados perdidos se o vendedor sair da empresa.</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custo Oculto</span>
                                <span className="text-2xl font-bold text-red-400">Alto Risco</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 2. HubSpot Starter */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-orange-500/5 rounded-2xl blur-xl group-hover:bg-orange-500/10 transition-all"></div>
                    <Card className="relative h-full bg-slate-900 border-slate-800 hover:border-orange-500/30 transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-orange-950/30 flex items-center justify-center mb-4 border border-orange-500/20">
                                <span className="text-lg font-bold text-orange-500">H</span>
                            </div>
                            <CardTitle className="text-xl text-white">HubSpot (Plano Básico)</CardTitle>
                            <CardDescription className="text-slate-400">Barato, mas exige trabalho manual.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded bg-orange-950/20 border border-orange-900/30 text-sm">
                                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                                <span className="text-slate-300"><strong className="text-orange-400">Dependência Manual:</strong> O sync de LinkedIn NÃO é automático. O vendedor precisa copiar e colar.</span>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded bg-slate-800/50 border border-slate-700/50 text-sm">
                                <X className="w-5 h-5 text-slate-500 shrink-0" />
                                <span className="text-slate-300">Vendedores odeiam data entry. Eles não vão fazer.</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-end">
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eficiência</span>
                                    <span className="text-2xl font-bold text-orange-400">Baixa (30%)</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Custo</span>
                                    <span className="text-xl font-bold text-white">$15<span className="text-sm text-slate-400">/mês</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Unipile + AI (Recommended) */}
                <div className="relative group scale-105 z-10">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-2xl group-hover:bg-emerald-500/30 transition-all animate-pulse"></div>
                    <Card className="relative h-full bg-slate-900 border-emerald-500 shadow-2xl shadow-emerald-900/50">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            Recomendado
                        </div>
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/50">
                                <Zap className="w-6 h-6 text-emerald-400" />
                            </div>
                            <CardTitle className="text-xl text-white">Unipile + Lifetrek AI</CardTitle>
                            <CardDescription className="text-emerald-100/60">Sincronização Invisível & Automática.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded bg-emerald-950/40 border border-emerald-500/30 text-sm">
                                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-emerald-100"><strong className="text-emerald-400">100% Automático:</strong> Toda mensagem do LinkedIn vai para o CRM sem a Vanessa clicar em nada.</span>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded bg-emerald-950/40 border border-emerald-500/30 text-sm">
                                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-emerald-100"><strong className="text-emerald-400">Visibilidade Total:</strong> Você audita as conversas e vê o que está sendo prometido.</span>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded bg-emerald-950/40 border border-emerald-500/30 text-sm">
                                <BarChart3 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-emerald-100">Enriquecimento de dados automático.</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-end">
                                <div>
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eficiência</span>
                                    <span className="text-2xl font-bold text-emerald-400">Máxima (100%)</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Custo</span>
                                    <span className="text-xl font-bold text-white">$55<span className="text-sm text-slate-400">/mês</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Google Analytics Integration Simulation */}
            <div className="max-w-7xl mx-auto mt-12 mb-16">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    Google Analytics Integration (Web Traffic)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Tráfego do Site (Semana)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">1,240 Visitas</div>
                            <div className="h-16 mt-4 flex items-end gap-1">
                                {[35, 45, 30, 60, 75, 50, 45].map((h, i) => (
                                    <div key={i} className="bg-orange-500/50 hover:bg-orange-500 transition-all w-full rounded-t" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Correlação: LinkedIn Outbound vs. Visitas no Site</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-40 flex items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded bg-slate-950/50 relative overflow-hidden">
                                {/* Simulated Chart Line */}
                                <svg viewBox="0 0 100 40" className="w-full h-full opacity-80 px-4">
                                    <path d="M0,35 Q10,35 20,30 T40,25 T60,10 T80,15 T100,5" fill="none" stroke="#10b981" strokeWidth="2" /> {/* Green: Outreach */}
                                    <path d="M0,38 Q10,38 20,35 T40,30 T60,15 T80,20 T100,8" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 2" /> {/* Orange: Traffic */}
                                </svg>
                                <div className="absolute top-4 left-4 text-xs space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-0.5 bg-emerald-500"></div>
                                        <span className="text-emerald-400">Msgs LinkedIn Enviadas</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-0.5 bg-orange-500 border-dashed border-t"></div>
                                        <span className="text-orange-400">Acessos Diretos ao Site</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 text-xs text-right">
                                    <p className="font-bold text-white">+210% Visitas</p>
                                    <p className="text-slate-500">nos dias de disparo Unipile</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 italic">
                                "Quando a Vanessa manda mensagem no LinkedIn, o cliente entra no site para ver quem somos. Com Google Analytics integrado, provamos essa influência."
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Simulated AI Insight Feed */}
            <div className="max-w-7xl mx-auto mt-16">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-blue-400" />
                    O que a IA "leu" hoje (Graças ao Unipile)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0" />
                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-white">Dr. Ricardo (Hosp. Santa Casa)</h4>
                                <Badge variant="destructive" className="text-[10px]">Risco de Churn</Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">"Ainda aguardando a cotação dos parafusos..."</p>
                            <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded inline-block">
                                🤖 IA Detectou falha e avisou Vanessa
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 shrink-0" />
                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-white">Julia (Compradora Rede D'Or)</h4>
                                <Badge className="text-[10px] bg-blue-500 hover:bg-blue-600">Interesse Alto</Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">"Vi o post sobre a certificação ISO. Podemos agendar?"</p>
                            <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded inline-block">
                                🤖 Lead salvo automaticamente no CRM
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoiSimulation;
