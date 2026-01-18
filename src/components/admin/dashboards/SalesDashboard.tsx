import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, ListTodo, Phone, Mail, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SalesTask {
    id: string;
    text: string;
    completed: boolean;
}

export function SalesDashboard({ userName }: { userName: string }) {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<SalesTask[]>(() => {
        const saved = localStorage.getItem("sales_daily_tasks");
        return saved ? JSON.parse(saved) : [
            { id: "1", text: "Triagem técnica de novos leads", completed: false },
            { id: "2", text: "Follow-up DFM (desenhos pendentes)", completed: false },
            { id: "3", text: "Confirmar recebimento de propostas (USD/BRL)", completed: false },
            { id: "4", text: "Agendamento de Visitas Técnicas", completed: false },
            { id: "5", text: "Atualizar pipeline (CRM Hub)", completed: false },
        ];
    });

    const [myLeads, setMyLeads] = useState<any[]>([]);

    useEffect(() => {
        localStorage.setItem("sales_daily_tasks", JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        const fetchMyLeads = async () => {
            // In a real app, filter by assigned_to = user.id. 
            // For now, showing 'new' leads as a proxy for "inbox".
            const { data } = await supabase
                .from("contact_leads")
                .select("*")
                .eq("status", "new")
                .order("created_at", { ascending: false })
                .limit(5);
            setMyLeads(data || []);
        };
        fetchMyLeads();
    }, []);

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const resetTasks = () => {
        setTasks(prev => prev.map(t => ({ ...t, completed: false })));
        toast.success("Checklist diário reiniciado!");
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold">Painel de Vendas</h2>
                    <p className="text-muted-foreground">Olá, {userName}. Foco nas metas de hoje!</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Checklist - Main Focus */}
                <Card className="lg:col-span-2 border-none shadow-lg overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ListTodo className="h-5 w-5 text-green-600" />
                                    Checklist Industrial
                                </CardTitle>
                                <CardDescription>Fluxo de trabalho diário de engenharia de vendas.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={resetTasks} className="text-xs h-8 hover:bg-green-50 hover:text-green-700">
                                Reiniciar Shift
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Progress Ring for Tasks */}
                        <div className="flex items-center gap-6 mb-8 p-4 bg-muted/30 rounded-2xl">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted/20" />
                                    <circle
                                        cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                                        strokeDasharray={175.9}
                                        strokeDashoffset={175.9 - (175.9 * tasks.filter(t => t.completed).length / tasks.length)}
                                        className="text-green-500 transition-all duration-700 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-xs font-black">{Math.round(tasks.filter(t => t.completed).length / tasks.length * 100)}%</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Progresso Diário</h4>
                                <p className="text-xs text-muted-foreground">{tasks.filter(t => t.completed).length} de {tasks.length} ações concluídas</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border/20 group/item">
                                    <Checkbox
                                        id={task.id}
                                        checked={task.completed}
                                        onCheckedChange={() => toggleTask(task.id)}
                                        className="h-5 w-5 rounded-md data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <label
                                        htmlFor={task.id}
                                        className={`text-sm font-medium leading-normal cursor-pointer flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                    >
                                        {task.text}
                                    </label>
                                    {task.completed && <CheckCircle2 className="h-4 w-4 text-green-500 animate-in zoom-in" />}
                                </div>
                            ))}
                        </div>
                        {tasks.every(t => t.completed) && (
                            <div className="mt-6 p-4 bg-green-500 text-white rounded-xl text-center font-bold animate-in slide-in-from-bottom-2 shadow-lg shadow-green-200">
                                🚀 Shift Completo! Pipeline Saudável.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sales Performance & New Leads */}
                <div className="space-y-6">
                    {/* Performance Meter */}
                    <Card className="bg-slate-900 text-white border-none shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold opacity-70 uppercase tracking-widest">Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <div className="text-4xl font-black mb-1">22%</div>
                            <div className="text-[10px] font-bold text-blue-400 mb-4 uppercase">Taxa de Conversão</div>
                            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-[22%]" />
                            </div>
                            <p className="text-[10px] opacity-40 mt-2">Acima da média industrial (18%)</p>
                        </CardContent>
                    </Card>

                    {/* Quick Leads / Inbox */}
                    <Card className="h-full flex flex-col shadow-lg border-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Novos Leads</CardTitle>
                            <CardDescription>Entrada de funil</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-[250px] px-6">
                                <div className="space-y-3 pb-6">
                                    {myLeads.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">Vazio por agora.</p>
                                    ) : (
                                        myLeads.map(lead => (
                                            <div key={lead.id} className="p-3 rounded-xl border bg-card hover:border-primary/50 transition-all cursor-pointer group shadow-sm" onClick={() => navigate('/admin/leads')}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-xs truncate">{lead.name}</span>
                                                    <Badge className="text-[8px] h-4 bg-blue-50 text-blue-700 border-blue-100 uppercase">{lead.status}</Badge>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground truncate mb-3 font-medium uppercase tracking-tighter">{lead.company || "Sem empresa"}</p>
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg">
                                                        <Mail className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg">
                                                        <Phone className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="outline" className="h-7 text-[10px] px-2 ml-auto font-bold uppercase">Detail</Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                        <div className="p-4 border-t mt-auto">
                            <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-primary" onClick={() => navigate('/admin/leads')}>
                                Ver Todos <ArrowRight className="h-3 w-3 ml-2" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
