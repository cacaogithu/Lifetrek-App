import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityIndicator } from "./LeadPriorityIndicator";
import { Badge } from "@/components/ui/badge";
import { AISuggestionCard } from "./AISuggestionCard";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building2, Calendar, FileText } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string;
  project_types: string[];
  annual_volume: string | null;
  technical_requirements: string;
  message: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'quoted' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  lead_score: number | null;
  score_breakdown: any | null;
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  dental_implants: "Implantes Dentários",
  orthopedic_implants: "Implantes Ortopédicos",
  spinal_implants: "Implantes Espinhais",
  veterinary_implants: "Implantes Veterinários",
  surgical_instruments: "Instrumentos Cirúrgicos",
  micro_precision_parts: "Micro Precisão",
  custom_tooling: "Ferramentas Sob Medida",
  medical_devices: "Dispositivos Médicos",
  measurement_tools: "Ferramentas de Medição",
  other_medical: "Outros Médicos",
};

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const LeadDetailsModal = ({ lead, open, onOpenChange, onUpdate }: LeadDetailsModalProps) => {
  const [status, setStatus] = useState(lead?.status || 'new');
  const [priority, setPriority] = useState(lead?.priority || 'medium');
  const [adminNotes, setAdminNotes] = useState(lead?.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [companyResearch, setCompanyResearch] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const { toast } = useToast();

  // Fetch AI suggestion and company research when lead changes
  useEffect(() => {
    const fetchAIData = async () => {
      if (!lead?.id) return;
      
      setIsLoadingAI(true);
      try {
        // Fetch AI suggestion
        const { data: suggestion } = await supabase
          .from('ai_response_suggestions')
          .select('*, company_research:company_research_id(*)')
          .eq('lead_id', lead.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (suggestion) {
          setAiSuggestion(suggestion);
          setCompanyResearch(suggestion.company_research);
        }
      } catch (error) {
        console.error('Error fetching AI data:', error);
      } finally {
        setIsLoadingAI(false);
      }
    };

    if (open && lead) {
      fetchAIData();
    }
  }, [lead?.id, open]);

  if (!lead) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('contact_leads')
        .update({
          status,
          priority,
          admin_notes: adminNotes
        })
        .eq('id', lead.id);

      if (error) throw error;

      toast({
        title: "Lead atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar lead. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Detalhes do Lead
            <LeadStatusBadge status={lead.status} />
            <LeadPriorityIndicator priority={lead.priority} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações de Contato</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Nome</Label>
                <p className="font-medium">{lead.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </Label>
                <p className="font-medium">{lead.company || '-'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                  {lead.email}
                </a>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                  {lead.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Lead Score Section */}
          {lead.lead_score !== null && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Pontuação do Lead</h3>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Pontuação Total</span>
                  <Badge 
                    variant={
                      lead.lead_score >= 80 ? "default" : 
                      lead.lead_score >= 60 ? "secondary" : 
                      "outline"
                    }
                    className={`text-lg px-4 py-2 ${
                      lead.lead_score >= 80 ? "bg-red-500 hover:bg-red-600" : 
                      lead.lead_score >= 60 ? "bg-amber-500 hover:bg-amber-600" : 
                      ""
                    }`}
                  >
                    {lead.lead_score >= 80 ? "🔥 QUENTE" : lead.lead_score >= 60 ? "⚡ MORNO" : "❄️ FRIO"} - {lead.lead_score}/100
                  </Badge>
                </div>
                
                {lead.score_breakdown && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Porte da Empresa</span>
                        <span className="font-medium">{lead.score_breakdown.companySize}/15</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Match de Indústria</span>
                        <span className="font-medium">{lead.score_breakdown.industryMatch}/15</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Qualidade do Site</span>
                        <span className="font-medium">{lead.score_breakdown.websiteQuality}/20</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Presença LinkedIn</span>
                        <span className="font-medium">{lead.score_breakdown.linkedinPresence}/20</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Urgência</span>
                        <span className="font-medium">{lead.score_breakdown.urgency}/2</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Complexidade do Projeto</span>
                        <span className="font-medium">{lead.score_breakdown.projectComplexity}/15</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Volume Anual</span>
                        <span className="font-medium">{lead.score_breakdown.annualVolume}/15</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Detalhe Técnico</span>
                        <span className="font-medium">{lead.score_breakdown.technicalDetail}/5</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completude do Form</span>
                        <span className="font-medium">{lead.score_breakdown.completeness}/3</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detalhes do Projeto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-muted-foreground">Tipos de Projeto</Label>
                <div className="flex flex-wrap gap-2">
                  {lead.project_types.map((type) => (
                    <Badge key={type} variant="secondary">
                      {PROJECT_TYPE_LABELS[type] || type}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Volume Anual</Label>
                <p className="font-medium">{lead.annual_volume || '-'}</p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-muted-foreground">Requisitos Técnicos</Label>
                <p className="whitespace-pre-wrap">{lead.technical_requirements}</p>
              </div>
              {lead.message && (
                <div className="col-span-2 space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Mensagem
                  </Label>
                  <p className="whitespace-pre-wrap">{lead.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Cronograma</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Criado em
                </Label>
                <p>{format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm")}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Atualizado em
                </Label>
                <p>{format(new Date(lead.updated_at), "dd/MM/yyyy 'às' HH:mm")}</p>
              </div>
            </div>
          </div>

          {/* AI Suggestions and Research */}
          {!isLoadingAI && (aiSuggestion || companyResearch) && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg">Inteligência Artificial</h3>
              <AISuggestionCard 
                suggestion={aiSuggestion}
                research={companyResearch}
                leadEmail={lead.email}
              />
            </div>
          )}

          {/* Management */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Gerenciamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="contacted">Contatado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="quoted">Orçado</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas do Admin</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Adicionar notas sobre este lead..."
                rows={4}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};