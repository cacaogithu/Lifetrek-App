import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface AdminSupportChatProps {
    onClose?: () => void;
    minimized?: boolean;
}

export function AdminSupportChat({ onClose, minimized = false }: AdminSupportChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "👋 Hi! I'm your Admin Support Assistant. I can help you with:\n\n• Understanding admin features and workflows\n• Managing leads and contact information\n• Using analytics and reports\n• Content management and approvals\n• Troubleshooting common issues\n• Navigation and best practices\n\nWhat can I help you with today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("admin-support-agent", {
                body: {
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }
            });

            if (error) throw error;

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Error processing message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (minimized) {
        return null;
    }

    return (
        <Card className="flex flex-col h-[500px] w-[380px] border-t-4 border-t-blue-500 shadow-2xl bg-gradient-to-br from-background to-muted/20 fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white backdrop-blur flex items-center justify-between rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-full">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Admin Support Assistant</h3>
                        <p className="text-xs text-blue-100">Here to help you succeed</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMessages([messages[0]])}
                        className="hover:bg-white/20 text-white"
                    >
                        <Sparkles className="h-4 w-4" />
                    </Button>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="hover:bg-white/20 text-white"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            {message.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Bot className="h-5 w-5 text-blue-600" />
                                </div>
                            )}

                            <div
                                className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed shadow-sm ${message.role === "user"
                                        ? "bg-blue-500 text-white rounded-tr-none"
                                        : "bg-background border border-border rounded-tl-none"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{message.content}</div>
                                <div className={`text-[10px] mt-1 ${message.role === "user" ? "text-blue-100" : "text-muted-foreground"
                                    }`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {message.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="bg-background border border-border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background/50 backdrop-blur">
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
                        placeholder="Ask me anything about the admin panel..."
                        disabled={loading}
                        className="flex-1 bg-background"
                    />
                    <Button type="submit" disabled={loading || !input.trim()} className="bg-blue-500 hover:bg-blue-600">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
