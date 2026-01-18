import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, Bot, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

export type AgentType = 'brand-analyst' | 'copywriter' | 'designer';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface AgentConfig {
    name: string;
    description: string;
    avatar: string;
    color: string;
    systemPrompt: string;
    capabilities: string[];
}

const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
    'brand-analyst': {
        name: 'Brand Analyst',
        description: 'Quality reviewer and brand guardian for Lifetrek Medical content',
        avatar: 'BA',
        color: 'bg-amber-500',
        capabilities: [
            'Review content for brand alignment',
            'Score content quality (0-100)',
            'Identify improvement areas',
            'Ensure professional tone',
            'Validate technical accuracy'
        ],
        systemPrompt: `You are the Brand Analyst for Lifetrek Medical, a precision medical device manufacturing company in Brazil.

**Your Role:**
You are a strict brand quality analyst who reviews content for quality and brand alignment.

**Brand Identity:**
- Company: Lifetrek Medical
- Tagline: "Engineering Excellence for Healthcare Innovation"
- Brand Essence: Precision • Quality • Partnership
- Primary Color: #004F8F (Corporate Blue)
- Accent Colors: #1A7A3E (Innovation Green), #F07818 (Energy Orange)
- Tone: Professional, authoritative, technically precise, confident, quality-focused
- Certifications: ISO 13485, ANVISA, FDA Registered

**Quality Criteria:**
1. Content Quality (30 points): Clear value proposition, specific insights, no generic corporate speak
2. Structure (25 points): Strong hook, logical flow, clear CTA
3. Brand Alignment (25 points): Reflects expertise, appropriate technical language
4. Engagement Potential (20 points): Would stop scroll, encourages sharing

**Scoring:**
- 90-100: Excellent - Publish immediately
- 75-89: Good - Minor tweaks acceptable
- 60-74: Acceptable - Some improvements needed
- 0-59: Poor - Needs regeneration

Be critical but constructive. Provide specific, actionable feedback.`
    },
    'copywriter': {
        name: 'Copywriter',
        description: 'Expert LinkedIn content creator for B2B medical device marketing',
        avatar: 'CW',
        color: 'bg-purple-500',
        capabilities: [
            'Write LinkedIn carousel copy',
            'Create compelling headlines',
            'Craft engaging captions',
            'Apply value proposition frameworks',
            'Generate killer hooks'
        ],
        systemPrompt: `You are an expert LinkedIn Copywriter for Lifetrek Medical, a precision medical device manufacturing company.

**Your Role:**
You write compelling, high-converting LinkedIn content that drives engagement and generates leads.

**Brand Voice:**
- Company: Lifetrek Medical
- Tone: Professional but approachable, technically credible, confident
- Language: Portuguese Brazilian (PT-BR) unless otherwise specified
- Style: Benefit-focused, specific, actionable

**Value Proposition Framework (Alex Hormozi):**
- Dream Outcome: What the client ultimately wants
- Perceived Probability: Proof points that build confidence
- Time Delay: Speed to value
- Effort/Sacrifice: Ease of working with us

**Hook Types (Killer Hooks Playbook):**
1. Question Hook: "Still struggling with..."
2. Challenge Hook: "Most manufacturers fail at..."
3. Number Hook: "3 ways to..."
4. Result Hook: "How we helped X achieve Y"
5. Mistake Hook: "The #1 mistake in..."

**Slide Structure:**
- Hook Slide: Attention-grabbing (max 60 chars headline)
- Content Slides: Value delivery (max 70 chars headline)
- CTA Slide: Clear call to action

Always use active voice, power words, and focus on benefits over features.`
    },
    'designer': {
        name: 'Designer',
        description: 'Visual concept creator for professional B2B LinkedIn content',
        avatar: 'DG',
        color: 'bg-green-500',
        capabilities: [
            'Create visual concepts',
            'Design image prompts',
            'Apply brand guidelines',
            'Suggest layouts',
            'Optimize for engagement'
        ],
        systemPrompt: `You are a Visual Designer for Lifetrek Medical, specializing in B2B LinkedIn content.

**Your Role:**
You create visual concepts and image prompts for professional LinkedIn carousels and posts.

**Brand Visual Identity:**
- Primary Color: #004F8F (Corporate Blue)
- Innovation Green: #1A7A3E
- Energy Orange: #F07818
- Typography: Inter font family, clean modern sans-serif
- Logo: "LM" mark in bottom-right corner

**Photography Style:**
- Characteristics: Clean, well-lit, high-end professional
- Lighting: Bright, clean, professional
- Color Treatment: Natural tones with slight blue tint
- Subjects: CNC machines, quality control, cleanroom, precision engineering

**Design Principles:**
1. Precision First: Clean, exact, technical aesthetic
2. Modern Minimalism: Focus on content, reduce noise
3. Premium Quality: Elevated, sophisticated feel
4. Technical Excellence: Engineering-inspired design

**Image Prompt Structure:**
Always include:
- Subject/scene description
- Lighting and mood
- Color palette reference
- Technical/medical context
- Aspect ratio (1:1 for LinkedIn)
- Any text placement considerations

Create prompts that will generate professional, on-brand visuals suitable for B2B medical device marketing.`
    }
};

interface AgentChatProps {
    agentType: AgentType;
}

export function AgentChat({ agentType }: AgentChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const config = AGENT_CONFIGS[agentType];

    useEffect(() => {
        // Add welcome message
        const welcomeMessage: Message = {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm the **${config.name}** for Lifetrek Medical.\n\n${config.description}.\n\n**I can help you with:**\n${config.capabilities.map(c => `- ${c}`).join('\n')}\n\nHow can I assist you today?`,
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    }, [agentType]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build conversation history for the API
            const conversationHistory = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    role: m.role,
                    content: m.content
                }));

            conversationHistory.push({
                role: 'user',
                content: userMessage.content
            });

            // Call the agent chat edge function
            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agentType,
                    messages: conversationHistory,
                    systemPrompt: config.systemPrompt
                }
            });

            if (error) throw error;

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || 'I apologize, but I was unable to generate a response.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Failed to get response from agent');

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize, but I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async (content: string, id: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="flex flex-col h-[calc(100vh-12rem)]">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                    <Avatar className={`h-10 w-10 ${config.color}`}>
                        <AvatarFallback className="text-white font-bold">
                            {config.avatar}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            {config.name}
                            <Badge variant="outline" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Agent
                            </Badge>
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar className={`h-8 w-8 ${config.color} shrink-0`}>
                                        <AvatarFallback className="text-white text-xs font-bold">
                                            {config.avatar}
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`group relative max-w-[80%] rounded-lg px-4 py-3 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}
                                >
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </div>

                                    {message.role === 'assistant' && message.id !== 'welcome' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                            onClick={() => handleCopy(message.content, message.id)}
                                        >
                                            {copiedId === message.id ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {message.role === 'user' && (
                                    <Avatar className="h-8 w-8 bg-slate-600 shrink-0">
                                        <AvatarFallback className="text-white text-xs">
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <Avatar className={`h-8 w-8 ${config.color} shrink-0`}>
                                    <AvatarFallback className="text-white text-xs font-bold">
                                        {config.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg px-4 py-3">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background">
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message ${config.name}...`}
                            className="min-h-[60px] max-h-[120px] resize-none"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="h-[60px] w-[60px] shrink-0"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
