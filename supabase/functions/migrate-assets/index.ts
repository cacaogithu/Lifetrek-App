import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 [MIGRATE-ASSETS] Starting asset migration...");
    
    const results = {
      processed_products: { migrated: 0, skipped: 0, errors: 0 },
      company_assets: { migrated: 0, skipped: 0, errors: 0 },
      total: 0
    };

    // 1. Migrate processed_product_images to content_assets
    console.log("📦 [MIGRATE-ASSETS] Fetching processed_product_images...");
    const { data: products, error: productError } = await supabase
      .from("processed_product_images")
      .select("id, name, enhanced_url, category, description, brand, model")
      .eq("is_visible", true);

    if (productError) {
      console.error("❌ Error fetching products:", productError.message);
    } else if (products && products.length > 0) {
      console.log(`📦 [MIGRATE-ASSETS] Found ${products.length} products to migrate`);
      
      for (const product of products) {
        // Check if already exists in content_assets
        const { data: existing } = await supabase
          .from("content_assets")
          .select("id")
          .eq("file_path", product.enhanced_url)
          .single();

        if (existing) {
          results.processed_products.skipped++;
          continue;
        }

        // Infer category tags
        const categoryTags = [product.category, "produto", "processado"];
        if (product.brand) categoryTags.push(product.brand.toLowerCase());
        if (product.model) categoryTags.push(product.model.toLowerCase());

        const { error: insertError } = await supabase
          .from("content_assets")
          .insert({
            filename: product.name,
            file_path: product.enhanced_url,
            content_type: "image/png",
            category: product.category,
            tags: categoryTags,
          });

        if (insertError) {
          console.error(`❌ Error inserting product ${product.name}:`, insertError.message);
          results.processed_products.errors++;
        } else {
          results.processed_products.migrated++;
        }
      }
    }

    // 2. Migrate company_assets (logos, etc.)
    console.log("🏢 [MIGRATE-ASSETS] Fetching company_assets...");
    const { data: companyAssets, error: companyError } = await supabase
      .from("company_assets")
      .select("id, name, url, type, metadata");

    if (companyError) {
      console.error("❌ Error fetching company_assets:", companyError.message);
    } else if (companyAssets && companyAssets.length > 0) {
      console.log(`🏢 [MIGRATE-ASSETS] Found ${companyAssets.length} company assets to migrate`);
      
      for (const asset of companyAssets) {
        // Check if already exists in content_assets
        const { data: existing } = await supabase
          .from("content_assets")
          .select("id")
          .eq("file_path", asset.url)
          .single();

        if (existing) {
          results.company_assets.skipped++;
          continue;
        }

        const tags = [asset.type, "empresa", "branding"];
        if (asset.metadata?.variant) tags.push(asset.metadata.variant);

        const { error: insertError } = await supabase
          .from("content_assets")
          .insert({
            filename: asset.name || `${asset.type}_asset`,
            file_path: asset.url,
            content_type: "image/png",
            category: asset.type,
            tags: tags,
          });

        if (insertError) {
          console.error(`❌ Error inserting company asset ${asset.name}:`, insertError.message);
          results.company_assets.errors++;
        } else {
          results.company_assets.migrated++;
        }
      }
    }

    // 3. List storage buckets to check for additional assets
    console.log("📂 [MIGRATE-ASSETS] Checking storage buckets...");
    
    const bucketsToCheck = ["processed-products", "content-assets", "website-assets"];
    
    for (const bucketName of bucketsToCheck) {
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list("", { limit: 100 });

      if (listError) {
        console.log(`⚠️ Bucket ${bucketName}: ${listError.message}`);
        continue;
      }

      if (files && files.length > 0) {
        console.log(`📂 Bucket ${bucketName}: ${files.length} files found`);
        
        // Check for subdirectories
        for (const file of files) {
          if (file.id === null) {
            // It's a folder, list its contents
            const { data: subFiles } = await supabase.storage
              .from(bucketName)
              .list(file.name, { limit: 100 });
            
            if (subFiles && subFiles.length > 0) {
              console.log(`  └─ ${file.name}/: ${subFiles.length} files`);
            }
          }
        }
      }
    }

    results.total = 
      results.processed_products.migrated + 
      results.company_assets.migrated;

    console.log("✅ [MIGRATE-ASSETS] Migration complete:", JSON.stringify(results, null, 2));

    return new Response(JSON.stringify({
      success: true,
      message: "Asset migration completed",
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ [MIGRATE-ASSETS] Error:", error.message);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
