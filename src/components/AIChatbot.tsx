import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm here to help answer questions about Lifetrek's precision manufacturing capabilities, equipment, certifications, and processes. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        setShowButton(scrollDepth >= 75);
      } else {
        setShowButton(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: [...messages, userMessage] },
      });

      if (error) {
        if (error.message?.includes("429") || error.message?.includes("rate limit")) {
          toast.error("We're experiencing high demand. Please try again in a moment.");
        } else if (error.message?.includes("402") || error.message?.includes("payment")) {
          toast.error("Service temporarily unavailable. Please try again later.");
        } else {
          toast.error("Failed to get response. Please try again.");
        }
        console.error("Chat error:", error);
        return;
      }

      if (data?.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && showButton && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 left-6 h-14 w-14 md:h-14 md:w-14 sm:h-12 sm:w-12 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 bg-primary"
        >
          <MessageCircle className="h-6 w-6 md:h-6 md:w-6 sm:h-5 sm:w-5" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-bold">Lifetrek Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about our capabilities..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
