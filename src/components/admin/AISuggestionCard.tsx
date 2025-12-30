import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, AlertCircle, Lightbulb, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AISuggestion {
  id: string;
  subject_line: string;
  email_body: string;
  key_points: string[];
  follow_up_date: string;
  priority_level: 'low' | 'medium' | 'high';
  created_at: string;
}

interface CompanyResearch {
  domain: string;
  company_name: string | null;
  industry: string | null;
  website_summary: string | null;
  linkedin_info: string | null;
}

interface AISuggestionCardProps {
  suggestion: AISuggestion | null;
  research: CompanyResearch | null;
  leadEmail: string;
}

const priorityConfig = {
  low: { color: "bg-blue-500/10 text-blue-700", label: "Low" },
  medium: { color: "bg-yellow-500/10 text-yellow-700", label: "Medium" },
  high: { color: "bg-red-500/10 text-red-700", label: "High" },
};

export const AISuggestionCard = ({ suggestion, research, leadEmail }: AISuggestionCardProps) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const openEmailClient = () => {
    if (suggestion) {
      const mailtoLink = `mailto:${leadEmail}?subject=${encodeURIComponent(suggestion.subject_line)}&body=${encodeURIComponent(suggestion.email_body)}`;
      window.location.href = mailtoLink;
    }
  };

  if (!suggestion && !research) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Company Research Section */}
      {research && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-blue-600" />
              Company Research
            </CardTitle>
            <CardDescription>Automatically collected information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Domain</p>
              <p className="text-sm">{research.domain}</p>
            </div>
            {research.company_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                <p className="text-sm">{research.company_name}</p>
              </div>
            )}
            {research.industry && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry</p>
                <Badge variant="secondary">{research.industry}</Badge>
              </div>
            )}
            {research.linkedin_info && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">LinkedIn Information</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{research.linkedin_info}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Suggestion Section */}
      {suggestion && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Response Suggestion
                </CardTitle>
                <CardDescription>
                  Generated on {format(new Date(suggestion.created_at), "MM/dd/yyyy 'at' HH:mm")}
                </CardDescription>
              </div>
              <Badge className={priorityConfig[suggestion.priority_level].color}>
                {priorityConfig[suggestion.priority_level].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject Line */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">SUGGESTED SUBJECT</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(suggestion.subject_line, "Subject")}
                >
                  {copiedField === "Subject" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="font-semibold text-base">{suggestion.subject_line}</p>
            </div>

            {/* Email Body */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">EMAIL BODY</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(suggestion.email_body, "Email Body")}
                >
                  {copiedField === "Email Body" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm whitespace-pre-wrap text-muted-foreground max-h-60 overflow-y-auto">
                {suggestion.email_body}
              </div>
            </div>

            {/* Key Points */}
            {suggestion.key_points && suggestion.key_points.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-900">KEY POINTS TO HIGHLIGHT</p>
                </div>
                <ul className="space-y-2">
                  {suggestion.key_points.map((point, index) => (
                    <li key={index} className="text-sm text-amber-900 flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up and Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Suggested follow-up:</span>
                <Badge variant="outline">
                  {format(new Date(suggestion.follow_up_date), "MM/dd/yyyy")}
                </Badge>
              </div>
              <Button onClick={openEmailClient} className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Open in Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
