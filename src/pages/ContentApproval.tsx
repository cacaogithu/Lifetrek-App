import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, FileText, Linkedin, Mail } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATES_DATA } from "@/data/outreachTemplates";

export default function ContentApproval() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const industries = [
    { id: 'orthopedic', label: 'Ortopedia' },
    { id: 'dental', label: 'Odontologia' },
    { id: 'veterinary', label: 'Veterinária' }
  ];

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Templates</h1>
        <p className="text-muted-foreground">
          Scripts de alta conversão para LinkedIn e Email. Copie, personalize e envie.
        </p>
      </div>

      <Tabs defaultValue="orthopedic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          {industries.map((ind) => (
            <TabsTrigger key={ind.id} value={ind.id} className="text-lg py-3">
              {ind.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {industries.map((ind) => (
          <TabsContent key={ind.id} value={ind.id} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* LinkedIn Intro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    LinkedIn Conexão (Intro)
                  </CardTitle>
                  <CardDescription>Primeira mensagem ao conectar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap font-mono">
                    {TEMPLATES_DATA[ind.id as keyof typeof TEMPLATES_DATA].linkedin_intro}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleCopy(TEMPLATES_DATA[ind.id as keyof typeof TEMPLATES_DATA].linkedin_intro, `${ind.id}-intro`)}
                  >
                    {copiedId === `${ind.id}-intro` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedId === `${ind.id}-intro` ? "Copiado!" : "Copiar Script"}
                  </Button>
                </CardContent>
              </Card>

              {/* LinkedIn Follow-up */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    LinkedIn Follow-up
                  </CardTitle>
                  <CardDescription>3-5 dias sem resposta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap font-mono">
                    {TEMPLATES_DATA[ind.id as keyof typeof TEMPLATES_DATA].linkedin_followup}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleCopy(TEMPLATES_DATA[ind.id as keyof typeof TEMPLATES_DATA].linkedin_followup, `${ind.id}-follow`)}
                  >
                    {copiedId === `${ind.id}-follow` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedId === `${ind.id}-follow` ? "Copiado!" : "Copiar Script"}
                  </Button>
                </CardContent>
              </Card>

              {/* Email Outreach */}
              <Card className="md:col-span-2 lg:col-span-1 border-blue-100 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4 text-violet-600" />
                    Email Frio (Outreach)
                  </CardTitle>
                  <CardDescription>Primeiro email formal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-md text-sm whitespace-pre-wrap font-mono border-l-4 border-violet-500">
                    {TEMPLATES_DATA[ind.id as keyof typeof TEMPLATES_DATA].email_outreach}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    onClick={() => handleCopy(TEMPLATES_DATA[ind.id as keyof typeof TEMPLATES_DATA].email_outreach, `${ind.id}-email`)}
                  >
                    {copiedId === `${ind.id}-email` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedId === `${ind.id}-email` ? "Copiado!" : "Copiar Script"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
