import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadPriorityIndicator } from "./LeadPriorityIndicator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building2, Calendar, FileText } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string;
  project_type: string;
  annual_volume: string | null;
  technical_requirements: string;
  message: string | null;
  status: 'new' | 'contacted' | 'in_progress' | 'quoted' | 'closed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

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
  const { toast } = useToast();

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

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detalhes do Projeto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tipo de Projeto</Label>
                <p className="font-medium">{lead.project_type}</p>
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
            <h3 className="font-semibold text-lg">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Criado em
                </Label>
                <p>{format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Atualizado em
                </Label>
                <p>{format(new Date(lead.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
            </div>
          </div>

          {/* Management */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Gestão</h3>
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
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="quoted">Cotado</SelectItem>
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
              <Label>Notas Administrativas</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Adicione notas sobre este lead..."
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
