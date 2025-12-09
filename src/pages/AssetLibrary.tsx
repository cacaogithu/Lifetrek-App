import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Copy, Image as ImageIcon, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Asset {
    id: string;
    filename: string;
    category: string;
    tags: string[];
    created_at: string;
    public_url?: string;
}

export default function AssetLibrary() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [category, setCategory] = useState("general");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            let query = supabase.from("content_assets" as any).select("*").order("created_at", { ascending: false });
            const { data, error } = await query;

            if (error) throw error;

            // Enhance with public URLs
            const assetsWithUrls = data.map((asset: any) => {
                const { data: { publicUrl } } = supabase.storage
                    .from("content-assets")
                    .getPublicUrl(asset.filename);
                return { ...asset, public_url: publicUrl };
            });

            setAssets(assetsWithUrls || []);
        } catch (error) {
            console.error("Error fetching assets:", error);
            toast.error("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from("content-assets")
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get current user (admin)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Insert into DB
            const { error: dbError } = await supabase
                .from("content_assets" as any)
                .insert([{
                    filename: fileName,
                    file_path: fileName, // Using filename as path for simplicity in bucket root
                    content_type: file.type,
                    size: file.size,
                    category,
                    admin_user_id: user.id
                }]);

            if (dbError) throw dbError;

            toast.success("Asset uploaded successfully");
            await fetchAssets();
        } catch (error: any) {
            console.error("Error uploading asset:", error);
            toast.error(error.message || "Failed to upload asset");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, filename: string) => {
        try {
            // Delete from DB
            const { error: dbError } = await supabase
                .from("content_assets" as any)
                .delete()
                .eq("id", id);

            if (dbError) throw dbError;

            // Delete from Storage
            const { error: storageError } = await supabase.storage
                .from("content-assets")
                .remove([filename]);

            if (storageError) throw storageError;

            toast.success("Asset deleted");
            setAssets(assets.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting asset:", error);
            toast.error("Failed to delete asset");
        }
    };

    const copyAssetId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Asset ID copied to clipboard");
    };

    const filteredAssets = assets.filter(asset =>
        asset.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Asset Library</h1>
                        <p className="text-muted-foreground">Manage your brand assets for content generation</p>
                    </div>
                    <div className="flex gap-4">
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="logo">Logo</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="person">Person</SelectItem>
                                <SelectItem value="background">Background</SelectItem>
                                <SelectItem value="icon">Icon</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleUpload}
                                accept="image/*"
                                disabled={uploading}
                            />
                            <Button disabled={uploading} asChild>
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    Upload Asset
                                </label>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search assets..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {filteredAssets.map((asset) => (
                            <Card key={asset.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                                <div className="aspect-square bg-muted relative overflow-hidden">
                                    {asset.public_url ? (
                                        <img
                                            src={asset.public_url}
                                            alt={asset.filename}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <ImageIcon className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" variant="secondary" onClick={() => copyAssetId(asset.id)} title="Copy ID">
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => handleDelete(asset.id, asset.filename)} title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">{asset.category}</Badge>
                                        <span className="text-xs text-muted-foreground">{new Date(asset.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm font-medium truncate" title={asset.filename}>{asset.filename}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {!loading && filteredAssets.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No assets found. Upload some images to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
