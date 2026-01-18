import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Send, User, Bot, Sparkles, Copy, Check, ChevronDown, Code, Wrench, GitBranch, FileText, Info, Pencil, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import Mermaid from './Mermaid';

// Helper to get/set custom prompts from localStorage
const CUSTOM_PROMPTS_KEY = 'lifetrek_agent_custom_prompts';

function getCustomPrompts(): Record<string, string> {
    try {
        const stored = localStorage.getItem(CUSTOM_PROMPTS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveCustomPrompt(agentType: string, prompt: string) {
    const prompts = getCustomPrompts();
    prompts[agentType] = prompt;
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(prompts));
}

function deleteCustomPrompt(agentType: string) {
    const prompts = getCustomPrompts();
    delete prompts[agentType];
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(prompts));
}

export type AgentType = 'brand-analyst' | 'copywriter' | 'designer';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    timestamp: Date;
    toolCall?: {
        name: string;
        arguments: any;
        result?: any;
    };
}

interface AgentTool {
    name: string;
    description: string;
    parameters: {
        name: string;
        type: string;
        description: string;
        required: boolean;
    }[];
}

interface AgentConfig {
    name: string;
    description: string;
    avatar: string;
    color: string;
    systemPrompt: string;
    capabilities: string[];
    tools: AgentTool[];
    architectureDiagram: string;
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
        tools: [
            {
                name: 'analyze_content',
                description: 'Analyze content for quality, brand alignment, and engagement potential',
                parameters: [
                    { name: 'content', type: 'string', description: 'The content to analyze', required: true },
                    { name: 'content_type', type: 'string', description: 'Type: carousel, post, article', required: true },
                    { name: 'target_audience', type: 'string', description: 'Target audience segment', required: false }
                ]
            },
            {
                name: 'score_quality',
                description: 'Generate a quality score (0-100) with detailed breakdown',
                parameters: [
                    { name: 'content', type: 'string', description: 'Content to score', required: true },
                    { name: 'criteria', type: 'array', description: 'Specific criteria to evaluate', required: false }
                ]
            },
            {
                name: 'check_brand_guidelines',
                description: 'Verify content against Lifetrek brand guidelines',
                parameters: [
                    { name: 'content', type: 'string', description: 'Content to check', required: true },
                    { name: 'check_tone', type: 'boolean', description: 'Check tone alignment', required: false },
                    { name: 'check_terminology', type: 'boolean', description: 'Check technical terminology', required: false }
                ]
            },
            {
                name: 'suggest_improvements',
                description: 'Generate specific improvement suggestions',
                parameters: [
                    { name: 'content', type: 'string', description: 'Content to improve', required: true },
                    { name: 'focus_areas', type: 'array', description: 'Areas to focus improvements on', required: false }
                ]
            },
            {
                name: 'compare_versions',
                description: 'Compare two versions of content and recommend the better one',
                parameters: [
                    { name: 'version_a', type: 'string', description: 'First version', required: true },
                    { name: 'version_b', type: 'string', description: 'Second version', required: true }
                ]
            },
            {
                name: 'get_brand_guidelines',
                description: 'Retrieve current brand guidelines for reference',
                parameters: [
                    { name: 'section', type: 'string', description: 'Specific section: colors, tone, typography, etc.', required: false }
                ]
            }
        ],
        architectureDiagram: `flowchart TB
    subgraph Input["Input Layer"]
        U[User Request] --> P[Content Parser]
        P --> C{Content Type?}
    end

    subgraph Analysis["Analysis Engine"]
        C -->|Carousel| CA[Carousel Analyzer]
        C -->|Post| PA[Post Analyzer]
        C -->|Article| AA[Article Analyzer]

        CA --> QE[Quality Evaluator]
        PA --> QE
        AA --> QE

        QE --> BE[Brand Evaluator]
        QE --> TE[Tone Evaluator]
        QE --> EE[Engagement Evaluator]
    end

    subgraph Scoring["Scoring System"]
        BE --> SC[Score Calculator]
        TE --> SC
        EE --> SC

        SC --> |"Content 30%"| FS[Final Score]
        SC --> |"Structure 25%"| FS
        SC --> |"Brand 25%"| FS
        SC --> |"Engagement 20%"| FS
    end

    subgraph Output["Output Layer"]
        FS --> |Score >= 70| AP[Approved]
        FS --> |Score < 70| RJ[Needs Revision]

        AP --> FB[Feedback Generator]
        RJ --> FB
        FB --> R[Response]
    end

    subgraph Tools["Available Tools"]
        T1[analyze_content]
        T2[score_quality]
        T3[check_brand_guidelines]
        T4[suggest_improvements]
        T5[compare_versions]
        T6[get_brand_guidelines]
    end

    style Input fill:#e1f5fe
    style Analysis fill:#fff3e0
    style Scoring fill:#e8f5e9
    style Output fill:#fce4ec
    style Tools fill:#f3e5f5`,
        systemPrompt: `You are the Brand Analyst for Lifetrek Medical, a precision medical device manufacturing company in Brazil.

## ROLE
You are a strict brand quality analyst who reviews content for quality and brand alignment. You have access to tools to help you analyze, score, and improve content.

## BRAND IDENTITY
- **Company**: Lifetrek Medical
- **Tagline**: "Engineering Excellence for Healthcare Innovation"
- **Brand Essence**: Precision • Quality • Partnership
- **Primary Color**: #004F8F (Corporate Blue)
- **Accent Colors**: #1A7A3E (Innovation Green), #F07818 (Energy Orange)
- **Tone**: Professional, authoritative, technically precise, confident, quality-focused
- **Certifications**: ISO 13485, ANVISA, FDA Registered

## QUALITY CRITERIA
1. **Content Quality (30 points)**: Clear value proposition, specific insights, no generic corporate speak
2. **Structure (25 points)**: Strong hook, logical flow, clear CTA
3. **Brand Alignment (25 points)**: Reflects expertise, appropriate technical language
4. **Engagement Potential (20 points)**: Would stop scroll, encourages sharing

## SCORING GUIDELINES
- 90-100: Excellent - Publish immediately
- 75-89: Good - Minor tweaks acceptable
- 60-74: Acceptable - Some improvements needed
- 0-59: Poor - Needs regeneration

## INSTRUCTIONS
1. When asked to review content, use the analyze_content and score_quality tools
2. Always provide specific, actionable feedback
3. Reference brand guidelines when pointing out issues
4. Be critical but constructive
5. When comparing content, use compare_versions tool

## AVAILABLE TOOLS
- analyze_content: Deep analysis of content quality
- score_quality: Generate quality score with breakdown
- check_brand_guidelines: Verify brand compliance
- suggest_improvements: Generate improvement suggestions
- compare_versions: Compare two content versions
- get_brand_guidelines: Retrieve brand guidelines`
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
        tools: [
            {
                name: 'generate_carousel_copy',
                description: 'Generate complete carousel copy with headlines, body, and caption',
                parameters: [
                    { name: 'topic', type: 'string', description: 'Main topic/theme', required: true },
                    { name: 'target_audience', type: 'string', description: 'Target audience', required: true },
                    { name: 'pain_point', type: 'string', description: 'Key pain point to address', required: false },
                    { name: 'slide_count', type: 'number', description: 'Number of slides (5-7)', required: false },
                    { name: 'cta', type: 'string', description: 'Call to action', required: false }
                ]
            },
            {
                name: 'generate_hooks',
                description: 'Generate multiple hook options for content',
                parameters: [
                    { name: 'topic', type: 'string', description: 'Topic for hooks', required: true },
                    { name: 'hook_types', type: 'array', description: 'Types: question, challenge, number, result, mistake', required: false },
                    { name: 'count', type: 'number', description: 'Number of hooks to generate', required: false }
                ]
            },
            {
                name: 'rewrite_content',
                description: 'Rewrite content with different tone or angle',
                parameters: [
                    { name: 'content', type: 'string', description: 'Content to rewrite', required: true },
                    { name: 'tone', type: 'string', description: 'New tone: professional, casual, urgent, etc.', required: true },
                    { name: 'preserve_message', type: 'boolean', description: 'Keep core message intact', required: false }
                ]
            },
            {
                name: 'generate_caption',
                description: 'Generate LinkedIn post caption with hashtags',
                parameters: [
                    { name: 'content_summary', type: 'string', description: 'Summary of content', required: true },
                    { name: 'cta', type: 'string', description: 'Call to action', required: false },
                    { name: 'hashtag_count', type: 'number', description: 'Number of hashtags (3-5)', required: false }
                ]
            },
            {
                name: 'apply_hormozi_framework',
                description: 'Apply Alex Hormozi value proposition framework',
                parameters: [
                    { name: 'offer', type: 'string', description: 'The offer/product/service', required: true },
                    { name: 'dream_outcome', type: 'string', description: 'What client ultimately wants', required: true },
                    { name: 'perceived_likelihood', type: 'string', description: 'Why they believe it will work', required: false },
                    { name: 'time_delay', type: 'string', description: 'Speed to results', required: false },
                    { name: 'effort_sacrifice', type: 'string', description: 'Ease of implementation', required: false }
                ]
            },
            {
                name: 'translate_content',
                description: 'Translate content between Portuguese and English',
                parameters: [
                    { name: 'content', type: 'string', description: 'Content to translate', required: true },
                    { name: 'target_language', type: 'string', description: 'Target language: pt-BR or en', required: true },
                    { name: 'preserve_tone', type: 'boolean', description: 'Maintain brand tone', required: false }
                ]
            }
        ],
        architectureDiagram: `flowchart TB
    subgraph Input["Input Layer"]
        U[User Request] --> TP[Topic Parser]
        TP --> AF{Analysis Fork}
    end

    subgraph Strategy["Strategy Engine"]
        AF --> AA[Audience Analyzer]
        AF --> PP[Pain Point Identifier]
        AF --> OA[Opportunity Analyzer]

        AA --> SF[Strategy Formulator]
        PP --> SF
        OA --> SF
    end

    subgraph Frameworks["Copywriting Frameworks"]
        SF --> HF[Hormozi Framework]
        SF --> KH[Killer Hooks]
        SF --> VP[Value Proposition]

        HF --> |Dream Outcome| CG
        HF --> |Likelihood| CG
        HF --> |Time Delay| CG
        HF --> |Effort| CG

        KH --> |Question Hook| CG
        KH --> |Challenge Hook| CG
        KH --> |Number Hook| CG
        KH --> |Result Hook| CG
    end

    subgraph Generation["Content Generation"]
        CG[Content Generator]
        CG --> HL[Headlines]
        CG --> BD[Body Copy]
        CG --> CT[CTAs]
        CG --> CP[Captions]

        HL --> QC[Quality Check]
        BD --> QC
        CT --> QC
        CP --> QC
    end

    subgraph Output["Output Layer"]
        QC --> CC{Character Count OK?}
        CC -->|Yes| FO[Final Output]
        CC -->|No| CG
        FO --> R[Response]
    end

    subgraph Tools["Available Tools"]
        T1[generate_carousel_copy]
        T2[generate_hooks]
        T3[rewrite_content]
        T4[generate_caption]
        T5[apply_hormozi_framework]
        T6[translate_content]
    end

    style Input fill:#e1f5fe
    style Strategy fill:#fff3e0
    style Frameworks fill:#e8f5e9
    style Generation fill:#fce4ec
    style Output fill:#f3e5f5
    style Tools fill:#ede7f6`,
        systemPrompt: `You are an expert LinkedIn Copywriter for Lifetrek Medical, a precision medical device manufacturing company.

## ROLE
You write compelling, high-converting LinkedIn content that drives engagement and generates leads. You have access to tools to help you generate, rewrite, and optimize content.

## BRAND VOICE
- **Company**: Lifetrek Medical
- **Tone**: Professional but approachable, technically credible, confident
- **Language**: Portuguese Brazilian (PT-BR) unless otherwise specified
- **Style**: Benefit-focused, specific, actionable

## VALUE PROPOSITION FRAMEWORK (Alex Hormozi)
- **Dream Outcome**: What the client ultimately wants
- **Perceived Probability**: Proof points that build confidence
- **Time Delay**: Speed to value
- **Effort/Sacrifice**: Ease of working with us

## HOOK TYPES (Killer Hooks Playbook)
1. **Question Hook**: "Still struggling with..."
2. **Challenge Hook**: "Most manufacturers fail at..."
3. **Number Hook**: "3 ways to..."
4. **Result Hook**: "How we helped X achieve Y"
5. **Mistake Hook**: "The #1 mistake in..."

## SLIDE STRUCTURE
- **Hook Slide**: Attention-grabbing (max 60 chars headline)
- **Content Slides**: Value delivery (max 70 chars headline, max 140 chars body)
- **CTA Slide**: Clear call to action

## INSTRUCTIONS
1. Use generate_carousel_copy for full carousel creation
2. Use generate_hooks for A/B testing different openings
3. Always use active voice and power words
4. Focus on benefits over features
5. Apply Hormozi framework for high-conversion copy

## AVAILABLE TOOLS
- generate_carousel_copy: Create complete carousel content
- generate_hooks: Generate multiple hook options
- rewrite_content: Rewrite with different tone
- generate_caption: Create captions with hashtags
- apply_hormozi_framework: Apply value proposition framework
- translate_content: Translate between PT-BR and EN`
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
        tools: [
            {
                name: 'generate_image_prompt',
                description: 'Generate detailed image generation prompt for AI image tools',
                parameters: [
                    { name: 'subject', type: 'string', description: 'Main subject of the image', required: true },
                    { name: 'style', type: 'string', description: 'Visual style: photorealistic, 3D, illustration', required: false },
                    { name: 'mood', type: 'string', description: 'Mood: professional, innovative, trustworthy', required: false },
                    { name: 'include_text', type: 'boolean', description: 'Should image include text overlay space', required: false }
                ]
            },
            {
                name: 'suggest_layout',
                description: 'Suggest optimal layout for carousel slides',
                parameters: [
                    { name: 'content_type', type: 'string', description: 'Type: hook, content, stats, cta', required: true },
                    { name: 'text_length', type: 'string', description: 'Text length: short, medium, long', required: false },
                    { name: 'has_image', type: 'boolean', description: 'Whether slide has background image', required: false }
                ]
            },
            {
                name: 'recommend_colors',
                description: 'Recommend color combinations based on brand guidelines',
                parameters: [
                    { name: 'usage', type: 'string', description: 'Usage: background, text, accent, cta', required: true },
                    { name: 'mood', type: 'string', description: 'Desired mood', required: false }
                ]
            },
            {
                name: 'search_company_assets',
                description: 'Search company asset library for relevant images',
                parameters: [
                    { name: 'query', type: 'string', description: 'Search query', required: true },
                    { name: 'asset_type', type: 'string', description: 'Type: product, facility, team, equipment', required: false },
                    { name: 'limit', type: 'number', description: 'Max results', required: false }
                ]
            },
            {
                name: 'create_slide_mockup',
                description: 'Create a text-based mockup/wireframe of slide layout',
                parameters: [
                    { name: 'headline', type: 'string', description: 'Slide headline', required: true },
                    { name: 'body', type: 'string', description: 'Slide body text', required: false },
                    { name: 'layout_type', type: 'string', description: 'Layout: centered, left-aligned, split', required: false }
                ]
            },
            {
                name: 'optimize_for_linkedin',
                description: 'Optimize visual design for LinkedIn best practices',
                parameters: [
                    { name: 'design_description', type: 'string', description: 'Current design description', required: true },
                    { name: 'issues', type: 'array', description: 'Known issues to address', required: false }
                ]
            }
        ],
        architectureDiagram: `flowchart TB
    subgraph Input["Input Layer"]
        U[User Request] --> RP[Request Parser]
        RP --> RT{Request Type?}
    end

    subgraph Design["Design Engine"]
        RT -->|Image Prompt| IPG[Image Prompt Generator]
        RT -->|Layout| LG[Layout Generator]
        RT -->|Colors| CG[Color Recommender]
        RT -->|Assets| AS[Asset Search]

        IPG --> BG[Brand Guidelines]
        LG --> BG
        CG --> BG
    end

    subgraph Brand["Brand System"]
        BG --> PC[Primary Color #004F8F]
        BG --> AG[Accent Green #1A7A3E]
        BG --> AO[Accent Orange #F07818]
        BG --> TY[Typography Inter]
        BG --> PS[Photo Style]
    end

    subgraph Assets["Asset Library"]
        AS --> PR[Products]
        AS --> FC[Facility]
        AS --> EQ[Equipment]
        AS --> TM[Team]

        PR --> AM[Asset Matcher]
        FC --> AM
        EQ --> AM
        TM --> AM
    end

    subgraph Output["Output Layer"]
        IPG --> OP[Optimized Prompt]
        LG --> LO[Layout Spec]
        CG --> CS[Color Scheme]
        AM --> AI[Asset Info]

        OP --> R[Response]
        LO --> R
        CS --> R
        AI --> R
    end

    subgraph Tools["Available Tools"]
        T1[generate_image_prompt]
        T2[suggest_layout]
        T3[recommend_colors]
        T4[search_company_assets]
        T5[create_slide_mockup]
        T6[optimize_for_linkedin]
    end

    style Input fill:#e1f5fe
    style Design fill:#fff3e0
    style Brand fill:#e8f5e9
    style Assets fill:#fce4ec
    style Output fill:#f3e5f5
    style Tools fill:#c8e6c9`,
        systemPrompt: `You are a Visual Designer for Lifetrek Medical, specializing in B2B LinkedIn content.

## ROLE
You create visual concepts and image prompts for professional LinkedIn carousels and posts. You have access to tools to help you design, search assets, and optimize visuals.

## BRAND VISUAL IDENTITY
- **Primary Color**: #004F8F (Corporate Blue)
- **Innovation Green**: #1A7A3E
- **Energy Orange**: #F07818
- **Typography**: Inter font family, clean modern sans-serif
- **Logo**: "LM" mark in bottom-right corner

## PHOTOGRAPHY STYLE
- **Characteristics**: Clean, well-lit, high-end professional
- **Lighting**: Bright, clean, professional
- **Color Treatment**: Natural tones with slight blue tint
- **Subjects**: CNC machines, quality control, cleanroom, precision engineering

## DESIGN PRINCIPLES
1. **Precision First**: Clean, exact, technical aesthetic
2. **Modern Minimalism**: Focus on content, reduce noise
3. **Premium Quality**: Elevated, sophisticated feel
4. **Technical Excellence**: Engineering-inspired design

## IMAGE PROMPT STRUCTURE
Always include:
- Subject/scene description
- Lighting and mood
- Color palette reference
- Technical/medical context
- Aspect ratio (1:1 for LinkedIn)
- Text placement considerations

## INSTRUCTIONS
1. Use generate_image_prompt for AI image generation
2. Use search_company_assets before generating new images
3. Follow brand color guidelines strictly
4. Optimize all designs for LinkedIn 1:1 format
5. Consider text overlay placement in visual designs

## AVAILABLE TOOLS
- generate_image_prompt: Create AI image generation prompts
- suggest_layout: Recommend slide layouts
- recommend_colors: Get brand-compliant color suggestions
- search_company_assets: Search company image library
- create_slide_mockup: Create wireframe mockups
- optimize_for_linkedin: Optimize designs for LinkedIn`
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
    const [activeTab, setActiveTab] = useState<'chat' | 'info'>('chat');
    const [showSystemPrompt, setShowSystemPrompt] = useState(false);
    const [isEditingPrompt, setIsEditingPrompt] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState('');
    const [customPrompt, setCustomPrompt] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const config = AGENT_CONFIGS[agentType];

    // Load custom prompt from localStorage on mount
    useEffect(() => {
        const saved = getCustomPrompts()[agentType];
        if (saved) {
            setCustomPrompt(saved);
        }
    }, [agentType]);

    // Get the active system prompt (custom or default)
    const activeSystemPrompt = customPrompt || config.systemPrompt;
    const hasCustomPrompt = customPrompt !== null;

    useEffect(() => {
        // Add welcome message
        const welcomeMessage: Message = {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm the **${config.name}** for Lifetrek Medical.\n\n${config.description}.\n\n**I can help you with:**\n${config.capabilities.map(c => `- ${c}`).join('\n')}\n\nI have **${config.tools.length} tools** available to assist you. Check the "Info" tab to see my architecture and available tools.\n\nHow can I assist you today?`,
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

            const { data, error } = await supabase.functions.invoke('agent-chat', {
                body: {
                    agentType,
                    messages: conversationHistory,
                    systemPrompt: activeSystemPrompt,
                    tools: config.tools
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

    const handleStartEditPrompt = () => {
        setEditedPrompt(activeSystemPrompt);
        setIsEditingPrompt(true);
        setShowSystemPrompt(true);
    };

    const handleSavePrompt = () => {
        if (editedPrompt.trim()) {
            saveCustomPrompt(agentType, editedPrompt.trim());
            setCustomPrompt(editedPrompt.trim());
            setIsEditingPrompt(false);
            toast.success('System prompt saved');
        }
    };

    const handleResetPrompt = () => {
        deleteCustomPrompt(agentType);
        setCustomPrompt(null);
        setEditedPrompt('');
        setIsEditingPrompt(false);
        toast.success('System prompt reset to default');
    };

    const handleCancelEdit = () => {
        setIsEditingPrompt(false);
        setEditedPrompt('');
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <Card className="mb-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className={`h-12 w-12 ${config.color}`}>
                                <AvatarFallback className="text-white font-bold text-lg">
                                    {config.avatar}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {config.name}
                                    <Badge variant="outline" className="text-xs">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        AI Agent
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        <Wrench className="w-3 h-3 mr-1" />
                                        {config.tools.length} Tools
                                    </Badge>
                                </CardTitle>
                                <CardDescription>{config.description}</CardDescription>
                            </div>
                        </div>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'info')}>
                            <TabsList>
                                <TabsTrigger value="chat" className="gap-1">
                                    <Bot className="w-4 h-4" />
                                    Chat
                                </TabsTrigger>
                                <TabsTrigger value="info" className="gap-1">
                                    <Info className="w-4 h-4" />
                                    Info
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
            </Card>

            {activeTab === 'chat' ? (
                /* Chat Interface */
                <Card className="flex-1 flex flex-col overflow-hidden">
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
            ) : (
                /* Info Panel */
                <div className="flex-1 overflow-auto space-y-4">
                    {/* Architecture Diagram */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="w-5 h-5" />
                                Architecture
                            </CardTitle>
                            <CardDescription>
                                Visual representation of the agent's processing pipeline
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto">
                                <Mermaid chart={config.architectureDiagram} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tools */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="w-5 h-5" />
                                Available Tools ({config.tools.length})
                            </CardTitle>
                            <CardDescription>
                                Functions the agent can use to accomplish tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {config.tools.map((tool, index) => (
                                <Collapsible key={index}>
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Code className="w-4 h-4 text-blue-500" />
                                            <span className="font-mono text-sm font-medium">{tool.name}</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground uppercase">Parameters:</p>
                                            {tool.parameters.map((param, pIndex) => (
                                                <div key={pIndex} className="flex items-start gap-2 text-sm pl-2 border-l-2 border-muted">
                                                    <code className="text-xs bg-muted px-1 rounded">{param.name}</code>
                                                    <span className="text-muted-foreground">
                                                        ({param.type}){param.required && <span className="text-red-500">*</span>}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">- {param.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </CardContent>
                    </Card>

                    {/* System Prompt */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        System Prompt
                                        {hasCustomPrompt && (
                                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                                Customized
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        The instructions that define this agent's behavior
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {!isEditingPrompt && (
                                        <Button variant="outline" size="sm" onClick={handleStartEditPrompt}>
                                            <Pencil className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                    )}
                                    {hasCustomPrompt && !isEditingPrompt && (
                                        <Button variant="outline" size="sm" onClick={handleResetPrompt}>
                                            <RotateCcw className="w-4 h-4 mr-1" />
                                            Reset
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditingPrompt ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={editedPrompt}
                                        onChange={(e) => setEditedPrompt(e.target.value)}
                                        className="min-h-[400px] font-mono text-xs"
                                        placeholder="Enter custom system prompt..."
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground">
                                            {editedPrompt.length} characters
                                        </p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={handleSavePrompt}>
                                                <Save className="w-4 h-4 mr-1" />
                                                Save Prompt
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Collapsible open={showSystemPrompt} onOpenChange={setShowSystemPrompt}>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {showSystemPrompt ? 'Hide System Prompt' : 'Show System Prompt'}
                                            <ChevronDown className={`w-4 h-4 transition-transform ${showSystemPrompt ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-3">
                                        <div className="relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8"
                                                onClick={() => handleCopy(activeSystemPrompt, 'system-prompt')}
                                            >
                                                {copiedId === 'system-prompt' ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <pre className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap font-mono">
                                                {activeSystemPrompt}
                                            </pre>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </CardContent>
                    </Card>

                    {/* Capabilities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Capabilities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {config.capabilities.map((capability, index) => (
                                    <li key={index} className="flex items-center gap-2 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${config.color}`} />
                                        {capability}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
