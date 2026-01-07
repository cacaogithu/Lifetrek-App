import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ImportResult {
  success: boolean;
  inserted: number;
  skipped: number;
  totalErrors: number;
  errors: string[];
}

// CSV column mapping
const COLUMN_MAP: Record<string, string> = {
  // Common column variations
  "company": "company",
  "empresa": "company",
  "nome empresa": "company",
  "company name": "company",
  
  "email": "email",
  "e-mail": "email",
  
  "name": "name",
  "nome": "name",
  "decision_maker": "name",
  "decision maker": "name",
  "contato": "name",
  
  "phone": "phone",
  "telefone": "phone",
  "tel": "phone",
  
  "website": "website",
  "site": "website",
  "url": "website",
  
  "city": "city",
  "cidade": "city",
  
  "state": "state",
  "estado": "state",
  "uf": "state",
  
  "source": "source",
  "fonte": "source",
  "origem": "source",
  
  "industry": "industry",
  "industria": "industry",
  "setor": "industry",
  
  "employees": "employees",
  "funcionarios": "employees",
  "empregados": "employees",
  
  "lead_score": "lead_score",
  "score": "lead_score",
  "pontuacao": "lead_score",
  
  "linkedin_url": "linkedin_url",
  "linkedin": "linkedin_url",
  
  "cnpj": "cnpj",
  
  "revenue_range": "revenue_range",
  "faturamento": "revenue_range",
  "revenue": "revenue_range",
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  // Detect delimiter (comma, semicolon, or tab)
  const firstLine = lines[0];
  let delimiter = ",";
  if (firstLine.includes(";") && !firstLine.includes(",")) {
    delimiter = ";";
  } else if (firstLine.includes("\t") && !firstLine.includes(",")) {
    delimiter = "\t";
  }

  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ""));
  
  const rows: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      const mappedKey = COLUMN_MAP[header] || header;
      row[mappedKey] = values[index] || "";
    });
    
    if (row.email) {
      rows.push(row);
    }
  }
  
  return rows;
}

interface LeadsImporterProps {
  onImportComplete: () => void;
}

export function LeadsImporter({ onImportComplete }: LeadsImporterProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [preview, setPreview] = useState<{ total: number; sample: Record<string, string>[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const rows = parseCSV(text);
    
    if (rows.length === 0) {
      toast.error("Arquivo vazio ou formato inválido");
      return;
    }

    setPreview({
      total: rows.length,
      sample: rows.slice(0, 3),
    });
    setResult(null);
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Selecione um arquivo primeiro");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const text = await file.text();
      const leads = parseCSV(text);

      if (leads.length === 0) {
        throw new Error("Nenhum lead válido encontrado no arquivo");
      }

      // Process in batches of 100
      const batchSize = 100;
      let totalInserted = 0;
      let totalSkipped = 0;
      let allErrors: string[] = [];

      for (let i = 0; i < leads.length; i += batchSize) {
        const batch = leads.slice(i, i + batchSize);
        
        const { data, error } = await supabase.functions.invoke("import-leads", {
          body: { leads: batch, skipDuplicates },
        });

        if (error) throw error;

        totalInserted += data.inserted || 0;
        totalSkipped += data.skipped || 0;
        if (data.errors) {
          allErrors = [...allErrors, ...data.errors];
        }
      }

      setResult({
        success: true,
        inserted: totalInserted,
        skipped: totalSkipped,
        totalErrors: allErrors.length,
        errors: allErrors.slice(0, 10),
      });

      if (totalInserted > 0) {
        toast.success(`${totalInserted} leads importados com sucesso!`);
        onImportComplete();
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(`Erro na importação: ${error.message}`);
      setResult({
        success: false,
        inserted: 0,
        skipped: 0,
        totalErrors: 1,
        errors: [error.message],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Leads via CSV
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo CSV com seus leads. Colunas suportadas: email, name/decision_maker, 
          company, phone, website, city, state, source, industry, employees, lead_score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button variant="outline" asChild className="cursor-pointer">
              <span>
                <FileText className="h-4 w-4 mr-2" />
                Selecionar Arquivo CSV
              </span>
            </Button>
          </label>
          
          <div className="flex items-center gap-2">
            <Switch
              id="skip-duplicates"
              checked={skipDuplicates}
              onCheckedChange={setSkipDuplicates}
            />
            <Label htmlFor="skip-duplicates">Ignorar duplicados (por email)</Label>
          </div>
        </div>

        {preview && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{preview.total} leads encontrados</span>
              <Button variant="ghost" size="sm" onClick={resetImport}>
                Limpar
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Amostra (primeiros 3):</p>
              {preview.sample.map((row, i) => (
                <p key={i} className="truncate">
                  {row.email} - {row.name || row.company || "N/A"}
                </p>
              ))}
            </div>

            <Button 
              onClick={handleImport} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {preview.total} Leads
                </>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className={`border rounded-lg p-4 ${result.success ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {result.success ? "Importação concluída" : "Erro na importação"}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              <p className="text-green-600">✓ {result.inserted} leads inseridos</p>
              {result.skipped > 0 && (
                <p className="text-yellow-600">⊘ {result.skipped} ignorados (duplicados)</p>
              )}
              {result.totalErrors > 0 && (
                <p className="text-red-600">✗ {result.totalErrors} erros</p>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p className="font-medium">Erros:</p>
                {result.errors.map((err, i) => (
                  <p key={i} className="truncate">{err}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}