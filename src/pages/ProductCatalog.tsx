import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, Trash2, Edit2, X, Check, ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { logError } from "@/utils/errorLogger";

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
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    // Check if user has admin role using new role system
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      toast.error("Access denied. Not an admin user.");
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
      setProducts(data || []);
    } catch (error) {
      logError(error, "Fetch products");
      toast.error("Failed to load products");
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

      toast.success("Analyzing image with AI...");

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
        });

      if (insertError) throw insertError;

      toast.success("Product added successfully!");
      await fetchProducts();
    } catch (error) {
      logError(error, "Product upload");
      toast.error(error instanceof Error ? error.message : "Failed to upload product");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string, name: string, description: string) => {
    try {
      const { error } = await supabase
        .from("product_catalog")
        .update({ name, description })
        .eq("id", id);

      if (error) throw error;

      toast.success("Product updated successfully!");
      setEditingId(null);
      await fetchProducts();
    } catch (error) {
      logError(error, "Product update");
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }

      const { error } = await supabase
        .from("product_catalog")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Product deleted successfully!");
      await fetchProducts();
    } catch (error) {
      logError(error, "Product delete");
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Product Catalog</h1>
          <Button onClick={() => navigate("/admin")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
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
                  <LoadingSpinner />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Product Image
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
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
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
                      Category: {product.category}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(product.id)}
                      >
                        <Edit2 className="w-4 h-4" />
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
