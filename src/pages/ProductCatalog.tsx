import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  created_at: string;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin-login");
      return;
    }

    const { data: adminData } = await supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!adminData) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("product_catalog")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data as any) || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      toast({
        title: "Upload concluído",
        description: "Analisando imagem com AI...",
      });

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-product-image",
        { body: { imageUrl: publicUrl } }
      );

      if (analysisError) throw analysisError;

      const { error: insertError } = await supabase
        .from("product_catalog")
        .insert({
          name: analysisData.name,
          description: analysisData.description,
          category: analysisData.category,
          image_url: publicUrl,
        } as any);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Produto adicionado ao catálogo",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        title: "Erro",
        description: "Falha ao processar imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string, name: string, description: string) => {
    try {
      const { error } = await supabase
        .from("product_catalog")
        .update({ name, description } as any)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto atualizado",
      });

      setEditingId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar produto",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }

      const { error } = await supabase
        .from("product_catalog" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto deletado",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({
        title: "Erro",
        description: "Falha ao deletar produto",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Catálogo de Produtos</h1>
          <Button onClick={() => navigate("/admin")}>Voltar</Button>
        </div>

        <Card className="p-6 mb-8">
          <label className="flex items-center justify-center gap-2 cursor-pointer">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <Button disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Nova Imagem
                </>
              )}
            </Button>
          </label>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                {editingId === product.id ? (
                  <div className="space-y-2">
                    <Input
                      defaultValue={product.name}
                      id={`name-${product.id}`}
                    />
                    <Textarea
                      defaultValue={product.description}
                      id={`desc-${product.id}`}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const name = (document.getElementById(`name-${product.id}`) as HTMLInputElement).value;
                          const description = (document.getElementById(`desc-${product.id}`) as HTMLTextAreaElement).value;
                          handleUpdate(product.id, name, description);
                        }}
                      >
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.description}
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      Categoria: {product.category}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(product.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id, product.image_url)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
