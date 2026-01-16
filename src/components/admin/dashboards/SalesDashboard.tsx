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
            { id: "1", text: "Verificar leads novos no CRM", completed: false },
            { id: "2", text: "Follow-up de propostas enviadas (3+ dias)", completed: false },
            { id: "3", text: "Confirmar reuniões de amanhã", completed: false },
            { id: "4", text: "Atualizar status dos leads em andamento", completed: false },
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
                <Card className="lg:col-span-2 border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <ListTodo className="h-5 w-5 text-green-600" />
                                Checklist Diário
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={resetTasks} className="text-xs h-8">
                                Novo Dia
                            </Button>
                        </div>
                        <CardDescription>Ações prioritárias para manter o pipeline fluindo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                                    <Checkbox 
                                        id={task.id} 
                                        checked={task.completed} 
                                        onCheckedChange={() => toggleTask(task.id)}
                                        className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                    />
                                    <div className="grid gap-1.5 leading-none w-full">
                                        <label
                                            htmlFor={task.id}
                                            className={`text-sm font-medium leading-normal cursor-pointer ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                        >
                                            {task.text}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {tasks.every(t => t.completed) && (
                            <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-lg text-center font-medium animate-in zoom-in duration-300">
                                🚀 Tudo pronto por hoje! Ótimo trabalho.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Leads / Inbox */}
                <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Novos Leads</CardTitle>
                        <CardDescription>Aguardando contato</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-[300px] px-6">
                            <div className="space-y-4 pb-6">
                                {myLeads.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum lead novo na fila.</p>
                                ) : (
                                    myLeads.map(lead => (
                                        <div key={lead.id} className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer group" onClick={() => navigate('/admin/leads')}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-sm truncate block max-w-[120px]">{lead.name}</span>
                                                <Badge variant="outline" className="text-[10px] uppercase">{lead.status}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-3">{lead.company || "Sem empresa"}</p>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="secondary" className="h-6 w-6">
                                                    <Mail className="h-3 w-3" />
                                                </Button>
                                                <Button size="icon" variant="secondary" className="h-6 w-6">
                                                    <Phone className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <div className="p-4 border-t mt-auto">
                        <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/admin/leads')}>
                            Ver Pipeline Completo <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
