import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Trash2, RefreshCw, Database, Image as ImageIcon, X } from "lucide-react";

const ENVIRONMENT_CATEGORIES = [
  { value: "facility", label: "Instalações" },
  { value: "equipment", label: "Equipamentos" },
  { value: "cleanroom", label: "Cleanroom" },
  { value: "team", label: "Equipe" },
  { value: "process", label: "Processos" },
  { value: "office", label: "Escritório" },
];

interface ContentAsset {
  id: string;
  filename: string;
  file_path: string;
  content_type: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string | null;
}

export default function EnvironmentAssets() {
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("facility");
  const [tags, setTags] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Fetch content_assets
  const { data: assets, isLoading } = useQuery({
    queryKey: ["content-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_assets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ContentAsset[];
    },
  });

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (selectedFiles.length === 0) {
        throw new Error("Selecione pelo menos um arquivo");
      }

      const tagArray = tags.split(",").map(t => t.trim()).filter(Boolean);
      tagArray.push(category);

      const results = [];
      for (const file of selectedFiles) {
        // Sanitize filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `environment/${category}/${Date.now()}_${sanitizedName}`;

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("content-assets")
          .upload(filePath, file, { contentType: file.type });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("content-assets")
          .getPublicUrl(filePath);

        // Insert into content_assets table
        const { error: insertError } = await supabase
          .from("content_assets")
          .insert({
            filename: file.name,
            file_path: urlData.publicUrl,
            content_type: file.type,
            category: category,
            tags: tagArray,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }

        results.push(file.name);
      }

      return results;
    },
    onSuccess: (results) => {
      toast.success(`${results.length} arquivo(s) enviado(s) com sucesso`);
      setSelectedFiles([]);
      setTags("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["content-assets"] });
    },
    onError: (error: any) => {
      toast.error(`Erro no upload: ${error.message}`);
    },
  });

  // Run migration
  const runMigration = async () => {
    setMigrating(true);
    try {
      const { data, error } = await supabase.functions.invoke("migrate-assets");
      
      if (error) throw error;
      
      toast.success(`Migração concluída: ${data.results?.total || 0} assets migrados`);
      queryClient.invalidateQueries({ queryKey: ["content-assets"] });
    } catch (error: any) {
      toast.error(`Erro na migração: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  // Delete asset
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_assets")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Asset removido");
      queryClient.invalidateQueries({ queryKey: ["content-assets"] });
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleUpload = () => {
    setUploading(true);
    uploadMutation.mutate(undefined, {
      onSettled: () => setUploading(false),
    });
  };

  // Group assets by category
  const groupedAssets = assets?.reduce((acc, asset) => {
    const cat = asset.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(asset);
    return acc;
  }, {} as Record<string, ContentAsset[]>) || {};

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fotos de Ambiente</h1>
          <p className="text-muted-foreground">
            Upload de fotos de instalações, equipamentos e equipe para uso pelo Designer Agent
          </p>
        </div>
        <Button onClick={runMigration} disabled={migrating} variant="outline">
          <Database className="h-4 w-4 mr-2" />
          {migrating ? "Migrando..." : "Migrar Assets Existentes"}
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Imagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENVIRONMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="cnc, precisão, usinagem"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição das imagens"
              />
            </div>
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique para selecionar imagens ou arraste aqui
              </p>
            </label>
          </div>

          {/* Selected files preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Arquivos selecionados ({selectedFiles.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
                  >
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <button onClick={() => removeFile(index)}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar {selectedFiles.length} arquivo(s)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : Object.keys(groupedAssets).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum asset encontrado.</p>
              <p className="text-sm">Use o botão "Migrar Assets Existentes" para importar imagens de produtos ou faça upload de novas imagens.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedAssets).map(([categoryKey, categoryAssets]) => (
            <Card key={categoryKey}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">
                  {ENVIRONMENT_CATEGORIES.find(c => c.value === categoryKey)?.label || categoryKey}
                  <Badge variant="secondary" className="ml-2">{categoryAssets.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categoryAssets.map((asset) => (
                    <div key={asset.id} className="group relative">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={asset.file_path}
                          alt={asset.filename}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteMutation.mutate(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {asset.filename}
                      </p>
                      {asset.tags && asset.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {asset.tags.slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
