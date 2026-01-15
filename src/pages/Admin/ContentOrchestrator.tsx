import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HandoffPayload {
  topic: string;
  targetAudience: string;
  painPoint: string;
  desiredOutcome: string;
  angle: string;
  format: "carousel" | "blog";
}

interface PendingJob {
  handoff_action: string;
  job_type: string;
  payload: HandoffPayload;
}

export function ContentOrchestrator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Content Strategy Orchestrator. What kind of content do you want to create today? \n\nI can help you brainstorm topics, find the right angle, and then launch the generation process for **LinkedIn Carousels** or **Blog Posts**.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingJob, setPendingJob] = useState<PendingJob | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const detectHandoff = (content: string) => {
    try {
      // Look for JSON block at the end of the message
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const data = JSON.parse(jsonMatch[1]);
        if (data.handoff_action === "trigger_job") {
          setPendingJob(data);
          // Optional: Remove the JSON block from display? No, keep it for transparency or maybe hide it. 
          // For now, we'll leave it but maybe style it differently in the future.
        }
      }
    } catch (e) {
      console.error("Failed to parse handoff JSON", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setPendingJob(null); // Reset pending job on new interaction

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
            messages: [...messages, userMessage],
            mode: 'orchestrator'
        },
      });

      if (error) throw error;

      if (data?.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
        detectHandoff(data.response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGeneration = async () => {
    if (!pendingJob) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to generate content");
        return;
      }

      const { error } = await supabase
        .from('jobs')
        .insert({
          job_type: pendingJob.job_type,
          payload: pendingJob.payload,
          user_id: user.id,
          status: 'queued'
        });

      if (error) throw error;

      toast.success("Job started successfully! Check the Job Monitor.");
      setPendingJob(null);
      setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "✅ **Job Queued!** I've sent this to the generation agents. You can track progress in the **Job Monitor**." 
      }]);

    } catch (error) {
        console.error("Failed to start job", error);
        toast.error("Failed to start job");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 gap-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Bot className="h-8 w-8 text-primary" />
                Content Orchestrator
            </h1>
            <p className="text-muted-foreground">Brainstorm, strategize, and generate content with AI assistance.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col shadow-md border-border/50">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6">
                {messages.map((message, index) => (
                    <div
                    key={index}
                    className={`flex ${ 
                        message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    >
                    <div
                        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${ 
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-foreground border border-border/50"
                        }`}
                    >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {/* Simple markdown rendering can be added here if needed, for now plain text with whitespace */}
                            <p className="whitespace-pre-wrap">{message.content.replace(/```json[\s\S]*?```/, '')}</p> 
                            {/* Hide the raw JSON from the bubble for cleaner UI */}
                        </div>
                    </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                    <div className="bg-muted/50 rounded-2xl px-5 py-4">
                        <div className="flex gap-1">
                            <span className="animate-bounce">●</span>
                            <span className="animate-bounce delay-75">●</span>
                            <span className="animate-bounce delay-150">●</span>
                        </div>
                    </div>
                    </div>
                )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card">
                <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="E.g., 'I want to write a LinkedIn post about medical device precision...'"
                    disabled={isLoading}
                    className="flex-1"
                />
                <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                >
                    <Send className="h-4 w-4" />
                </Button>
                </div>
            </div>
        </Card>

        {/* Sidebar / Action Area */}
        {(pendingJob || messages.length > 1) && (
            <div className="w-80 flex flex-col gap-4 animate-in slide-in-from-right-10 fade-in duration-300">
                {pendingJob ? (
                    <Card className="border-primary/50 shadow-lg bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Ready to Generate
                            </CardTitle>
                            <CardDescription>Review the strategy before launching</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <span className="font-semibold text-muted-foreground">Topic:</span>
                                <p className="font-medium">{pendingJob.payload.topic}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Angle:</span>
                                <p>{pendingJob.payload.angle}</p>
                            </div>
                            <div>
                                <span className="font-semibold text-muted-foreground">Format:</span>
                                <Badge variant="secondary" className="mt-1">
                                    {pendingJob.payload.format === 'carousel' ? 'LinkedIn Carousel' : 'Blog Post'}
                                </Badge>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleStartGeneration} className="w-full gap-2" size="lg">
                                <FileText className="h-4 w-4" />
                                Start Generation
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-base">Conversation Context</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>The orchestrator is learning about your content goals.</p>
                            <ul className="list-disc pl-4 mt-2 space-y-1">
                                <li>Define Topic</li>
                                <li>Identify Audience</li>
                                <li>Select Angle</li>
                                <li>Confirm Format</li>
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

export default ContentOrchestrator;
