import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Image, Trash2, Check, X, Loader2, ImageIcon } from "lucide-react";

interface ProductImage {
  id: string;
  name: string;
  description: string | null;
  category: string;
  enhanced_url: string;
  original_url: string;
  is_visible: boolean;
  is_featured: boolean;
}

interface CompanyAsset {
  id: string;
  type: string;
  url: string;
  name: string | null;
}

const CATEGORIES = [
  { value: "equipment_cnc", label: "CNC Equipment" },
  { value: "equipment_metrology", label: "Metrology" },
  { value: "dental_implants", label: "Dental Implants" },
  { value: "orthopedic_implants", label: "Orthopedic Implants" },
  { value: "surgical_instruments", label: "Surgical Instruments" },
  { value: "medical_devices", label: "Medical Devices" },
  { value: "other", label: "Other" },
];

export default function ProductAssets() {
  const [products, setProducts] = useState<ProductImage[]>([]);
  const [logo, setLogo] = useState<CompanyAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "equipment_cnc",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, logoRes] = await Promise.all([
        supabase
          .from("processed_product_images")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("company_assets")
          .select("*")
          .eq("type", "logo")
          .single(),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (logoRes.data) setLogo(logoRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadProducts = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione pelo menos uma imagem");
      return;
    }

    if (!newProduct.name.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("processed-products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("processed-products")
          .getPublicUrl(filePath);

        // Insert into database
        const { error: insertError } = await supabase
          .from("processed_product_images")
          .insert({
            name: newProduct.name,
            description: newProduct.description || null,
            category: newProduct.category,
            original_url: urlData.publicUrl,
            enhanced_url: urlData.publicUrl,
            original_filename: file.name,
            is_visible: true,
            is_featured: false,
          });

        if (insertError) throw insertError;
      }

      toast.success(`${selectedFiles.length} produto(s) enviado(s) com sucesso!`);
      setSelectedFiles([]);
      setNewProduct({ name: "", description: "", category: "equipment_cnc" });
      fetchData();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("website-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("website-assets")
        .getPublicUrl(fileName);

      // Update or insert in company_assets
      const { error: upsertError } = await supabase
        .from("company_assets")
        .upsert({
          type: "logo",
          url: urlData.publicUrl,
          name: "Lifetrek Logo",
        }, { onConflict: "type" });

      if (upsertError) throw upsertError;

      toast.success("Logo atualizado com sucesso!");
      fetchData();
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error("Erro ao fazer upload do logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from("processed_product_images")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Produto excluído");
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Erro ao excluir");
    }
  };

  const handleToggleVisibility = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("processed_product_images")
        .update({ is_visible: !currentState })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Assets & Produtos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie o logo e imagens de produtos para o Designer Agent
        </p>
      </div>

      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo da Empresa
          </CardTitle>
          <CardDescription>
            O logo é usado pelo Designer Agent para gerar imagens consistentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {logo?.url ? (
              <div className="relative group">
                <img
                  src={logo.url}
                  alt="Logo"
                  className="h-20 w-auto object-contain bg-muted rounded-lg p-2"
                />
              </div>
            ) : (
              <div className="h-20 w-32 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div>
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploadingLogo} asChild>
                  <span>
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {logo ? "Atualizar Logo" : "Upload Logo"}
                  </span>
                </Button>
              </Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadLogo}
              />
              <p className="text-xs text-muted-foreground mt-2">
                PNG, WebP ou SVG. Recomendado: fundo transparente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Products Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Produtos
          </CardTitle>
          <CardDescription>
            Faça upload de imagens de produtos para referência do Designer Agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome do Produto *</Label>
              <Input
                id="product-name"
                placeholder="Ex: Citizen L20 Type VIII"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={newProduct.category}
                onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descrição do produto, características principais..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Imagens</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Label htmlFor="images" className="cursor-pointer">
                <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} arquivo(s) selecionado(s)`
                    : "Clique para selecionar ou arraste imagens"}
                </p>
              </Label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <button
                    onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleUploadProducts} disabled={uploading || selectedFiles.length === 0}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Enviar Produtos
          </Button>
        </CardContent>
      </Card>

      {/* Products Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados ({products.length})</CardTitle>
          <CardDescription>
            Estes produtos são usados como referência visual pelo Designer Agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto cadastrado ainda</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`relative group rounded-lg border overflow-hidden ${
                    !product.is_visible ? "opacity-50" : ""
                  }`}
                >
                  <img
                    src={product.enhanced_url}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => handleToggleVisibility(product.id, product.is_visible)}
                    >
                      {product.is_visible ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
