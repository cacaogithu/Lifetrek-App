import { ProductGallery } from "@/components/admin/ProductGallery";

export default function Gallery() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Galeria de Produtos</h1>
                <p className="text-muted-foreground">Gerencie todas as imagens de produtos e ativos digitais</p>
            </div>

            <ProductGallery />
        </div>
    );
}
