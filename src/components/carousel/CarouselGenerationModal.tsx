import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { StorageImageSelector } from '../admin/StorageImageSelector';

interface CarouselGenerationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerated: () => void;
}

export function CarouselGenerationModal({ open, onOpenChange, onGenerated }: CarouselGenerationModalProps) {
    const [mode, setMode] = useState<'auto' | 'guided'>('auto');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    // Full Auto mode state
    const [autoRequest, setAutoRequest] = useState('');

    // Guided mode state
    const [backgroundSource, setBackgroundSource] = useState<'ai-browse' | 'manual-select' | 'generate'>('ai-browse');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [headline, setHeadline] = useState('');
    const [subhead, setSubhead] = useState('');
    const [textPosition, setTextPosition] = useState<'auto' | 'top' | 'bottom'>('auto');
    const [imagePrompt, setImagePrompt] = useState('');
    const [selectorOpen, setSelectorOpen] = useState(false);

    const handleGenerate = async () => {
        if (mode === 'auto' && !autoRequest) {
            toast({
                title: "Missing request",
                description: "Please describe what you want to create",
                variant: "destructive"
            });
            return;
        }

        if (mode === 'guided') {
            if (!headline || !subhead) {
                toast({
                    title: "Missing content",
                    description: "Please provide headline and subhead",
                    variant: "destructive"
                });
                return;
            }

            if (backgroundSource === 'generate' && !imagePrompt) {
                toast({
                    title: "Missing image prompt",
                    description: "Please describe the image to generate",
                    variant: "destructive"
                });
                return;
            }

            if (backgroundSource === 'manual-select' && !selectedImage) {
                toast({
                    title: "No image selected",
                    description: "Please select an image from storage",
                    variant: "destructive"
                });
                return;
            }
        }

        setIsGenerating(true);

        try {
            if (mode === 'auto') {
                // Full Auto: Call AI orchestration endpoint
                const { data: userData } = await supabase.auth.getUser();

                const { data, error } = await supabase.functions.invoke('auto-generate-carousel', {
                    body: {
                        request: autoRequest,
                        userId: userData.user?.id
                    }
                });

                if (error) throw error;

                toast({
                    title: "Success!",
                    description: `AI created your carousel! ${data.strategy.reasoning}`,
                });

                onGenerated();
                onOpenChange(false);
                setIsGenerating(false);
                resetForm();
                return;
            }
            // Guided Mode: Call existing compositing function
            let imageUrl = selectedImage;

            if (backgroundSource === 'ai-browse') {
                // AI will browse storage and pick best image
                const { data: browseData, error: browseError } = await supabase.functions.invoke('browse-storage', {
                    body: { prompt: `${headline} - ${subhead}` }
                });

                if (browseError) {
                    toast({
                        title: "AI Browse failed",
                        description: browseError.message,
                        variant: "destructive"
                    });
                    setIsGenerating(false);
                    return;
                }

                // Use the AI-selected image path
                const selectedImagePath = browseData.selectedImage.path;

                toast({
                    title: "AI selected image",
                    description: `Using: ${browseData.selectedImage.description} (${browseData.selectedImage.confidence}% confident)`,
                });

                // For now, we need the actual image data
                // In production, this would load from Supabase Storage
                imageUrl = selectedImagePath; // TODO: Load actual image data
            }

            if (backgroundSource === 'generate') {
                // Generate new image via Vertex AI
                const { data, error } = await supabase.functions.invoke('composite-carousel-image', {
                    body: {
                        imageSource: 'ai-generated',
                        aiPrompt: imagePrompt,
                        text: { headline, subhead, position: textPosition }
                    }
                });

                if (error) throw error;
                imageUrl = data.baseImage;
            }

            // Save to database
            const { data: userData } = await supabase.auth.getUser();

            await supabase.from('linkedin_carousels').insert({
                admin_user_id: userData.user?.id,
                topic: headline,
                format: 'single-image',
                slides: [{ type: 'content', headline, body: subhead }],
                image_urls: [imageUrl],
                caption: `${headline}\n\n${subhead}`,
                generation_method: backgroundSource,
                generation_settings: {
                    mode: 'guided',
                    backgroundSource,
                    textPosition,
                    imagePrompt: backgroundSource === 'generate' ? imagePrompt : null
                }
            });

            toast({
                title: "Success!",
                description: "Carousel generated successfully"
            });

            onGenerated();
            onOpenChange(false);
            resetForm();

        } catch (error) {
            console.error('Generation error:', error);
            toast({
                title: "Generation failed",
                description: error instanceof Error ? error.message : "Unknown error",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const resetForm = () => {
        setAutoRequest('');
        setHeadline('');
        setSubhead('');
        setTextPosition('auto');
        setImagePrompt('');
        setSelectedImage(null);
        setBackgroundSource('ai-browse');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Generate Carousel Image</DialogTitle>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(v) => setMode(v as 'auto' | 'guided')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="auto" className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Full Auto
                        </TabsTrigger>
                        <TabsTrigger value="guided" className="flex items-center gap-2">
                            <Wand2 className="w-4 h-4" />
                            Guided Creation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="auto" className="space-y-4 mt-4">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium">🤖 AI Autopilot Mode</p>
                            <p className="text-xs text-muted-foreground">
                                Describe what you want, and AI will:
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                                <li>✓ Browse your image library or generate new backgrounds</li>
                                <li>✓ Write compelling headlines and copy</li>
                                <li>✓ Position text optimally</li>
                                <li>✓ Apply brand styling</li>
                            </ul>
                        </div>

                        <div>
                            <Label>Your Request</Label>
                            <Textarea
                                placeholder="Example: Create a carousel about our new 5000m² cleanroom facility, emphasizing our ISO certification and advanced manufacturing capabilities"
                                value={autoRequest}
                                onChange={(e) => setAutoRequest(e.target.value)}
                                rows={5}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Be as detailed or high-level as you want. The AI will handle the rest.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="guided" className="space-y-4 mt-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm font-medium">🎨 You're in control</p>
                            <p className="text-xs text-muted-foreground">
                                Direct the AI with specific choices for images, text, and layout.
                            </p>
                        </div>

                        <div>
                            <Label>Background Source</Label>
                            <RadioGroup value={backgroundSource} onValueChange={(v: any) => setBackgroundSource(v)}>
                                <div className="flex items-center space-x-2 border rounded-lg p-3">
                                    <RadioGroupItem value="ai-browse" id="ai-browse" />
                                    <Label htmlFor="ai-browse" className="flex-1 cursor-pointer">
                                        <span className="font-medium">AI Browse Storage</span>
                                        <p className="text-xs text-muted-foreground">AI picks best match from your assets</p>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3">
                                    <RadioGroupItem value="manual-select" id="manual-select" />
                                    <Label htmlFor="manual-select" className="flex-1 cursor-pointer" onClick={() => setSelectorOpen(true)}>
                                        <span className="font-medium">I'll Select from Storage</span>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedImage ? "Image selected" : "Click to browse assets"}
                                        </p>
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border rounded-lg p-3">
                                    <RadioGroupItem value="generate" id="generate" />
                                    <Label htmlFor="generate" className="flex-1 cursor-pointer">
                                        <span className="font-medium">Generate New</span>
                                        <p className="text-xs text-muted-foreground">AI creates a custom background</p>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {backgroundSource === 'generate' && (
                            <div>
                                <Label>Image Description</Label>
                                <Textarea
                                    placeholder="Modern medical cleanroom with precision equipment..."
                                    value={imagePrompt}
                                    onChange={(e) => setImagePrompt(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Headline</Label>
                                <Input
                                    placeholder="INOVAÇÃO MÉDICA"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    maxLength={40}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {headline.length}/40
                                </p>
                            </div>

                            <div>
                                <Label>Text Position</Label>
                                <Select value={textPosition} onValueChange={(v: any) => setTextPosition(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">Auto (AI decides)</SelectItem>
                                        <SelectItem value="top">Top</SelectItem>
                                        <SelectItem value="bottom">Bottom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Subheadline</Label>
                            <Textarea
                                placeholder="Tecnologia de ponta para a saúde do futuro"
                                value={subhead}
                                onChange={(e) => setSubhead(e.target.value)}
                                rows={2}
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {subhead.length}/100
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {mode === 'auto' ? 'Generate with AI' : 'Generate'}
                    </Button>
                </div>
            </DialogContent>

            <StorageImageSelector
                open={selectorOpen}
                onOpenChange={setSelectorOpen}
                onSelect={(url) => {
                    setSelectedImage(url);
                    setBackgroundSource('manual-select');
                }}
            />
        </Dialog>
    );
}
