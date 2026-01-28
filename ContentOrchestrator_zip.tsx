import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { FunctionsHttpError } from "@supabase/supabase-js";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ContentOrchestrator() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastRequestTime, setLastRequestTime] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { isAdmin, isLoading: isAuthLoading } = useAdminPermissions();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthLoading && !isAdmin) {
            toast.error("Acesso negado.");
            navigate("/admin/login");
        }
    }, [isAuthLoading, isAdmin, navigate]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Frontend Throttling (2s between requests)
        const now = Date.now();
        if (now - lastRequestTime < 2000) {
            toast.error("Por favor, aguarde um momento antes de enviar outra mensagem.");
            return;
        }

        const userMessage: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setLastRequestTime(now);

        try {
            const { data, error } = await supabase.functions.invoke("chat", {
                body: {
                    messages: [...messages.slice(-5), userMessage],
                    mode: 'orchestrator'
                },
            });

            if (error) {
                // Check if it's a Supabase Auth error (invoking failed)
                if (error instanceof FunctionsHttpError && error.context?.status === 401) {
                    toast.error("Sessão expirada. Por favor, faça login novamente.");
                    navigate("/admin/login");
                    return;
                }

                // Check for rate limit
                if (error.status === 429) {
                    toast.error("Limite de solicitações atingido. Aguarde 1 minuto.");
                    return;
                }

                // Handle other functional errors (like 401 from OpenRouter, which we pass as 200/400 with a message)
                // If the error came from our custom response in the Edge function, handle it here
                throw error;
            }

            // The edge function might return an error in the data body even with 200 status
            if (data?.error) {
                toast.error(`Erro: ${data.error}`);
                console.error("Edge Function error:", data.error);
                return;
            }

            setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
        } catch (error: any) {
            console.error("Chat error details:", error);

            // Only redirect if it's clearly a Supabase Auth failure
            const isAuthError = error.status === 401 && !error.message?.toLowerCase().includes("openrouter");

            if (isAuthError) {
                toast.error("Sessão expirada. Redirecionando...");
                navigate("/admin/login");
            } else {
                const errorMessage = error.message || "Erro ao processar sua solicitação.";
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isAuthLoading) {
        return (
            <AdminLayout>
                <div className="flex h-screen items-center justify-center">
                    <LoadingSpinner />
                </div>
            </AdminLayout>
        );
    }

    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Content Orchestrator</h1>
                        <p className="text-muted-foreground mt-1">Estratégia e Planejamento de Conteúdo Lifetrek</p>
                    </div>
                </div>

                <Card className="flex-1 flex flex-col overflow-hidden bg-background/50 backdrop-blur-sm border-primary/10">
                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">
                            Modo Seguro: Geração automática de jobs desativada para controle de custos.
                        </span>
                    </div>

                    <ScrollArea ref={scrollRef} className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center py-10">
                                    <Bot className="h-12 w-12 mx-auto text-primary opacity-20" />
                                    <p className="text-muted-foreground mt-4">
                                        Como posso ajudar com sua estratégia hoje?
                                    </p>
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        }`}>
                                        {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </div>
                                    <div className={`p-3 rounded-lg max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 animate-pulse">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted animate-pulse">
                                        Digitando...
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-background/50">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
