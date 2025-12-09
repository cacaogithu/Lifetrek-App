import { useState } from 'react';
import { Code, Eye, Mail, Bot, MessageSquare, Maximize2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentPreviewProps {
  content: string;
  category: string;
  title?: string;
  maxHeight?: string;
  showTabs?: boolean;
}

// Detect if content is HTML
const isHTMLContent = (content: string): boolean => {
  return (
    content.includes('<!DOCTYPE') ||
    content.includes('<html') ||
    content.includes('<head>') ||
    (content.includes('<body') && content.includes('</body>')) ||
    (content.includes('<table') && content.includes('<tr'))
  );
};

// Detect content type for badge
const getContentType = (content: string, category: string): { 
  type: string; 
  label: string; 
  icon: React.ReactNode; 
  color: string;
} => {
  if (isHTMLContent(content)) {
    return { 
      type: 'html', 
      label: 'HTML Email', 
      icon: <Mail className="h-3 w-3" />,
      color: 'bg-blue-500/20 text-blue-600 border-blue-500/30'
    };
  }
  
  if (category.includes('agent') || category.includes('crm')) {
    return { 
      type: 'prompt', 
      label: 'Prompt IA', 
      icon: <Bot className="h-3 w-3" />,
      color: 'bg-purple-500/20 text-purple-600 border-purple-500/30'
    };
  }
  
  if (category.includes('linkedin') || category.includes('carousel')) {
    return { 
      type: 'linkedin', 
      label: 'LinkedIn', 
      icon: <MessageSquare className="h-3 w-3" />,
      color: 'bg-sky-500/20 text-sky-600 border-sky-500/30'
    };
  }
  
  return { 
    type: 'text', 
    label: 'Texto', 
    icon: <Eye className="h-3 w-3" />,
    color: 'bg-muted text-muted-foreground'
  };
};

// Lifetrek logo as SVG for email previews - matches actual brand logo with DNA/implant icon
const LIFETREK_LOGO_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 70" width="320" height="70">
  <!-- DNA/Implant icon in oval -->
  <ellipse cx="35" cy="35" rx="26" ry="30" fill="none" stroke="#0F3460" stroke-width="2"/>
  <!-- Implant top (screw head) -->
  <rect x="26" y="10" width="18" height="10" rx="2" fill="#0F3460"/>
  <!-- DNA helix strands -->
  <path d="M26 24 Q35 28, 44 24" stroke="#0F3460" stroke-width="2" fill="none"/>
  <path d="M26 31 Q35 27, 44 31" stroke="#0F3460" stroke-width="2" fill="none"/>
  <path d="M26 38 Q35 42, 44 38" stroke="#0F3460" stroke-width="2" fill="none"/>
  <path d="M26 45 Q35 41, 44 45" stroke="#0F3460" stroke-width="2" fill="none"/>
  <!-- Implant bottom point -->
  <polygon points="30,50 40,50 35,58" fill="#0F3460"/>
  <!-- LIFETREK text - italic bold -->
  <text x="72" y="36" font-family="Arial Black, Arial, sans-serif" font-size="26" font-weight="900" fill="#0F3460" font-style="italic" letter-spacing="0.5">LIFETREK</text>
  <!-- medical text - italic lighter -->
  <text x="72" y="56" font-family="Arial, sans-serif" font-size="18" font-weight="400" fill="#0F3460" font-style="italic" letter-spacing="2">medical</text>
</svg>
`)}`;

const LIFETREK_LOGO_WHITE_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 70" width="320" height="70">
  <!-- DNA/Implant icon in oval -->
  <ellipse cx="35" cy="35" rx="26" ry="30" fill="none" stroke="#ffffff" stroke-width="2"/>
  <!-- Implant top (screw head) -->
  <rect x="26" y="10" width="18" height="10" rx="2" fill="#ffffff"/>
  <!-- DNA helix strands -->
  <path d="M26 24 Q35 28, 44 24" stroke="#ffffff" stroke-width="2" fill="none"/>
  <path d="M26 31 Q35 27, 44 31" stroke="#ffffff" stroke-width="2" fill="none"/>
  <path d="M26 38 Q35 42, 44 38" stroke="#ffffff" stroke-width="2" fill="none"/>
  <path d="M26 45 Q35 41, 44 45" stroke="#ffffff" stroke-width="2" fill="none"/>
  <!-- Implant bottom point -->
  <polygon points="30,50 40,50 35,58" fill="#ffffff"/>
  <!-- LIFETREK text - italic bold -->
  <text x="72" y="36" font-family="Arial Black, Arial, sans-serif" font-size="26" font-weight="900" fill="#ffffff" font-style="italic" letter-spacing="0.5">LIFETREK</text>
  <!-- medical text - italic lighter -->
  <text x="72" y="56" font-family="Arial, sans-serif" font-size="18" font-weight="400" fill="#ffffff" font-style="italic" letter-spacing="2">medical</text>
</svg>
`)}`;

// HTML Preview in iframe with image fallback handling
const HTMLPreview = ({ content, height = '500px' }: { content: string; height?: string }) => {
  // Replace broken Supabase image URLs with inline SVG logos
  let processedContent = content
    // Replace white logo on dark backgrounds
    .replace(
      /https:\/\/iijkbhiqcsvtnfernrbs\.supabase\.co\/storage\/v1\/object\/public\/product-images\/lifetrek-logo-white\.png/g,
      LIFETREK_LOGO_WHITE_SVG
    )
    // Replace dark logo
    .replace(
      /https:\/\/iijkbhiqcsvtnfernrbs\.supabase\.co\/storage\/v1\/object\/public\/product-images\/lifetrek-logo-dark\.png/g,
      LIFETREK_LOGO_SVG
    )
    // Replace any other lifetrek logo references
    .replace(
      /https:\/\/iijkbhiqcsvtnfernrbs\.supabase\.co\/storage\/v1\/object\/public\/product-images\/lifetrek-logo[^"']*/g,
      LIFETREK_LOGO_SVG
    );
  
  return (
    <iframe
      srcDoc={processedContent}
      className="w-full border-0 rounded-lg bg-white"
      style={{ height }}
      sandbox="allow-same-origin"
      title="Email Preview"
    />
  );
};

// Formatted text preview for prompts and regular text
const FormattedTextPreview = ({ content, category }: { content: string; category: string }) => {
  const isPrompt = category.includes('agent') || category.includes('crm');
  
  // Format content with sections
  const formatContent = (text: string) => {
    // Split by common section markers
    const sections = text.split(/(?=#{1,3}\s|---|\*\*[A-Z])/);
    
    return sections.map((section, idx) => {
      const trimmed = section.trim();
      if (!trimmed) return null;
      
      // Detect headers
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-foreground mt-6 mb-3 first:mt-0">
            {trimmed.replace(/^#\s/, '')}
          </h2>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-semibold text-foreground mt-4 mb-2">
            {trimmed.replace(/^##\s/, '')}
          </h3>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-medium text-foreground mt-3 mb-1">
            {trimmed.replace(/^###\s/, '')}
          </h4>
        );
      }
      
      // Regular paragraph
      return (
        <p key={idx} className="text-sm text-muted-foreground mb-3 leading-relaxed whitespace-pre-wrap">
          {trimmed}
        </p>
      );
    });
  };
  
  if (isPrompt) {
    return (
      <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-lg p-4 border border-purple-500/10">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-purple-500/10">
          <Bot className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-medium text-purple-600">System Prompt</span>
        </div>
        <div className="space-y-1">
          {formatContent(content)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {formatContent(content)}
    </div>
  );
};

export const ContentPreview = ({ 
  content, 
  category, 
  title,
  maxHeight = '500px',
  showTabs = true 
}: ContentPreviewProps) => {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  
  const isHTML = isHTMLContent(content);
  const contentType = getContentType(content, category);
  
  if (!showTabs) {
    // Simple preview without tabs
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge className={`${contentType.color} border`}>
            <span className="flex items-center gap-1">
              {contentType.icon}
              {contentType.label}
            </span>
          </Badge>
        </div>
        <ScrollArea style={{ maxHeight }} className="border rounded-lg">
          <div className="p-4">
            {isHTML ? (
              <HTMLPreview content={content} height={maxHeight} />
            ) : (
              <FormattedTextPreview content={content} category={category} />
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge className={`${contentType.color} border`}>
          <span className="flex items-center gap-1">
            {contentType.icon}
            {contentType.label}
          </span>
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFullscreenOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          Tela cheia
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Preview Visual
          </TabsTrigger>
          <TabsTrigger value="source" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Código Fonte
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-2">
          <div className="border rounded-lg overflow-hidden" style={{ height: maxHeight }}>
            {isHTML ? (
              <HTMLPreview content={content} height={maxHeight} />
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4">
                  <FormattedTextPreview content={content} category={category} />
                </div>
              </ScrollArea>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="source" className="mt-2">
          <ScrollArea className="border rounded-lg bg-muted/30" style={{ height: maxHeight }}>
            <pre className="p-4 text-xs font-mono whitespace-pre-wrap text-muted-foreground">
              {content}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* Fullscreen Dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {contentType.icon}
              {title || 'Preview'}
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Preview Visual
              </TabsTrigger>
              <TabsTrigger value="source" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                Código Fonte
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="mt-2">
              <div className="border rounded-lg overflow-hidden" style={{ height: '70vh' }}>
                {isHTML ? (
                  <HTMLPreview content={content} height="70vh" />
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <FormattedTextPreview content={content} category={category} />
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="source" className="mt-2">
              <ScrollArea className="border rounded-lg bg-muted/30" style={{ height: '70vh' }}>
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap text-muted-foreground">
                  {content}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mini preview for table rows
export const ContentPreviewMini = ({ content, category }: { content: string; category: string }) => {
  const isHTML = isHTMLContent(content);
  const contentType = getContentType(content, category);
  
  return (
    <div className="space-y-2">
      <Badge className={`${contentType.color} border text-[10px]`}>
        <span className="flex items-center gap-1">
          {contentType.icon}
          {contentType.label}
        </span>
      </Badge>
      <div className="border rounded-lg overflow-hidden bg-background/50" style={{ maxHeight: '300px' }}>
        {isHTML ? (
          <HTMLPreview content={content} height="300px" />
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-3">
              <FormattedTextPreview content={content} category={category} />
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export { isHTMLContent, getContentType };
