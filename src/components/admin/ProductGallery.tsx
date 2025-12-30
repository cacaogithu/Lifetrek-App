import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Trash, Star, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { EditImageMetadata } from "./EditImageMetadata";
import { ImageComparisonSlider } from "./ImageComparisonSlider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ProcessedImage {
  id: string;
  created_at: string;
  updated_at: string;
  original_url: string;
  enhanced_url: string;
  name: string;
  description: string | null;
  category: string;
  brand: string | null;
  model: string | null;
  original_filename: string;
  file_size: number | null;
  custom_prompt: string | null;
  processed_by: string | null;
  is_featured: boolean | null;
  is_visible: boolean | null;
}

export const ProductGallery = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<ProcessedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);

  // Get unique categories and brands for filters
  const categories = Array.from(new Set(images.map(img => img.category))).sort();
  const brands = Array.from(new Set(images.map(img => img.brand).filter(Boolean))).sort();

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm, categoryFilter, brandFilter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("processed_product_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Erro ao carregar galeria");
    } finally {
      setLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = [...images];

    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (img.description && img.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (img.brand && img.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (img.model && img.model.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(img => img.category === categoryFilter);
    }

    if (brandFilter !== "all") {
      filtered = filtered.filter(img => img.brand === brandFilter);
    }

    setFilteredImages(filtered);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download iniciado");
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Erro ao baixar imagem");
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      // Extract file paths from URLs
      const originalPath = image.original_url.split('/processed-products/')[1];
      const enhancedPath = image.enhanced_url.split('/processed-products/')[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('processed-products')
        .remove([originalPath, enhancedPath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('processed_product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("Imagem removida");
      setImageToDelete(null);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Erro ao remover imagem");
    }
  };

  const toggleFeatured = async (imageId: string, currentValue: boolean | null) => {
    try {
      const { error } = await supabase
        .from('processed_product_images')
        .update({ is_featured: !currentValue })
        .eq('id', imageId);

      if (error) throw error;

      setImages(prev =>
        prev.map(img =>
          img.id === imageId ? { ...img, is_featured: !currentValue } : img
        )
      );
      toast.success(!currentValue ? "Marcado como destaque" : "Removido dos destaques");
    } catch (error) {
      console.error("Error toggling featured:", error);
      toast.error("Erro ao atualizar");
    }
  };

  const handleViewDetails = (image: ProcessedImage) => {
    setSelectedImage(image);
    setIsViewModalOpen(true);
  };

  const handleEdit = (image: ProcessedImage) => {
    setSelectedImage(image);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchImages();
    setIsEditModalOpen(false);
  };

  const stats = {
    total: images.length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat] = images.filter(img => img.category === cat).length;
      return acc;
    }, {} as Record<string, number>),
    featured: images.filter(img => img.is_featured).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Categorias</p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Marcas</p>
            <p className="text-2xl font-bold">{brands.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Destaques</p>
            <p className="text-2xl font-bold">{stats.featured}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descrição, marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Marcas</SelectItem>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand!}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nenhuma imagem encontrada</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              className="overflow-hidden hover:shadow-xl transition-all"
              onMouseEnter={() => setHoveredImageId(image.id)}
              onMouseLeave={() => setHoveredImageId(null)}
            >
              <div className="relative aspect-video bg-muted">
                <img
                  src={hoveredImageId === image.id ? image.enhanced_url : image.original_url}
                  alt={image.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <Badge className="absolute top-2 right-2 bg-background/90 text-foreground border">
                  {image.category}
                </Badge>
                {image.is_featured && (
                  <Star className="absolute top-2 left-2 h-5 w-5 fill-yellow-400 text-yellow-400" />
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold truncate">{image.name}</h3>
                  {image.brand && image.model && (
                    <p className="text-sm text-muted-foreground">
                      {image.brand} - {image.model}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(image)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadImage(image.enhanced_url, `${image.name}-enhanced.png`)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFeatured(image.id, image.is_featured)}
                  >
                    <Star className={image.is_featured ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4"} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(image)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setImageToDelete(image.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedImage.name}
                  {selectedImage.is_featured && (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <ImageComparisonSlider
                  beforeImage={selectedImage.original_url}
                  afterImage={selectedImage.enhanced_url}
                  beforeLabel="Original"
                  afterLabel="Aprimorada"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Informações</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Categoria</dt>
                        <dd>{selectedImage.category}</dd>
                      </div>
                      {selectedImage.brand && (
                        <div>
                          <dt className="text-muted-foreground">Marca</dt>
                          <dd>{selectedImage.brand}</dd>
                        </div>
                      )}
                      {selectedImage.model && (
                        <div>
                          <dt className="text-muted-foreground">Modelo</dt>
                          <dd>{selectedImage.model}</dd>
                        </div>
                      )}
                      {selectedImage.description && (
                        <div>
                          <dt className="text-muted-foreground">Descrição</dt>
                          <dd>{selectedImage.description}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Detalhes Técnicos</h4>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Arquivo Original</dt>
                        <dd className="truncate">{selectedImage.original_filename}</dd>
                      </div>
                      {selectedImage.file_size && (
                        <div>
                          <dt className="text-muted-foreground">Tamanho</dt>
                          <dd>{(selectedImage.file_size / 1024 / 1024).toFixed(2)} MB</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-muted-foreground">Processado em</dt>
                        <dd>{new Date(selectedImage.created_at).toLocaleDateString('pt-BR')}</dd>
                      </div>
                      {selectedImage.custom_prompt && (
                        <div>
                          <dt className="text-muted-foreground">Prompt Personalizado</dt>
                          <dd className="text-xs">{selectedImage.custom_prompt}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {selectedImage && (
        <EditImageMetadata
          image={selectedImage}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A imagem será permanentemente removida do armazenamento e banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => imageToDelete && deleteImage(imageToDelete)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};