import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AGENT_REGISTRY, AgentRole } from "@/lib/agents/registry";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    agentRole?: AgentRole;
    timestamp: Date;
}

export function UnifiedChat({ onEdit }: { onEdit?: (content: any) => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeAgent, setActiveAgent] = useState<AgentRole>(AgentRole.ORCHESTRATOR);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Call the Supabase Edge Function (Python)
            const { data, error } = await supabase.functions.invoke("agent-orchestrator", {
                body: {
                    message: userMsg.content,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                    agent_role: activeAgent,
                },
            });

            if (error) throw error;

            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.response,
                agentRole: activeAgent,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err) {
            console.error("Agent Error:", err);
            toast.error("Failed to contact agent. Check connection.");
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "⚠️ I encountered an error connecting to the agent network.",
                    agentRole: activeAgent,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[80vh] flex-col rounded-xl border bg-background/50 backdrop-blur-sm shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary")}>
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">Unified Command Room</h2>
                        <p className="text-xs text-muted-foreground">Orchestrating 4 Agents</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Simple output stats placeholder */}
                    <div className="text-xs text-muted-foreground border px-2 py-1 rounded">
                        Token Cost: $0.00
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {messages.length === 0 && (
                        <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground opacity-50">
                            <Bot className="mb-2 h-12 w-12" />
                            <p>Ready to orchestrate content.</p>
                            <p className="text-sm">Ask me to create a post, plan a strategy, or design a carousel.</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full gap-3",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === "assistant" && (
                                <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold", AGENT_REGISTRY[msg.agentRole || AgentRole.ORCHESTRATOR].color)}>
                                    {/* Avatar Initials */}
                                    {AGENT_REGISTRY[msg.agentRole || AgentRole.ORCHESTRATOR].name[0]}
                                </div>
                            )}

                            <div
                                className={cn(
                                    "max-w-[80%] rounded-lg p-4 text-sm shadow-sm",
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/50 border"
                                )}
                            >
                                {/* Agent Name Label */}
                                {msg.role === "assistant" && (
                                    <div className="mb-1 text-xs font-semibold opacity-70">
                                        {AGENT_REGISTRY[msg.agentRole || AgentRole.ORCHESTRATOR].name}
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.content}</div>

                                {msg.role === "assistant" && onEdit && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 h-7 text-xs gap-1 border border-primary/20 hover:bg-primary/10"
                                        onClick={() => onEdit({ text: msg.content })}
                                    >
                                        <Bot className="h-3 w-3" />
                                        Edit in Studio
                                    </Button>
                                )}
                            </div>

                            {msg.role === "user" && (
                                <div className="h-8 w-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                    <User className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex w-full gap-3 justify-start">
                            <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-500 animate-pulse")}>
                                ...
                            </div>
                            <div className="bg-muted/30 border max-w-[80%] rounded-lg p-4 text-sm flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-muted-foreground">Orchestrator is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
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
                        placeholder="Describe your content goal..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
