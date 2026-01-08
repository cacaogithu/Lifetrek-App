import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Intelligent category and tag inference based on folder/file names
function inferCategoryAndTags(folder: string, filename: string): { category: string; tags: string[] } {
  const lowerFolder = folder.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  const combined = `${lowerFolder} ${lowerFilename}`;
  
  // Category mapping
  let category = "other";
  const tags: string[] = [];
  
  // Facilities: office, reception, cleanroom, factory
  if (combined.includes("office") || combined.includes("escritorio") || combined.includes("escritório")) {
    category = "office";
    tags.push("office", "escritorio", "facilities");
  } else if (combined.includes("reception") || combined.includes("recepção") || combined.includes("recepcao") || combined.includes("lobby")) {
    category = "facilities";
    tags.push("reception", "recepção", "lobby", "office");
  } else if (combined.includes("cleanroom") || combined.includes("sala_limpa") || combined.includes("salalimpa") || combined.includes("sala limpa") || combined.includes("iso7") || combined.includes("iso 7")) {
    category = "cleanroom";
    tags.push("cleanroom", "sala_limpa", "iso7", "qualidade");
  } else if (combined.includes("factory") || combined.includes("fabrica") || combined.includes("fábrica") || combined.includes("exterior") || combined.includes("building")) {
    category = "facilities";
    tags.push("factory", "fabrica", "exterior", "building");
  }
  
  // Equipment: CNC, machinery
  else if (combined.includes("cnc") || combined.includes("citizen") || combined.includes("torno") || combined.includes("machine") || combined.includes("maquina") || combined.includes("máquina")) {
    category = "equipment";
    tags.push("equipment", "cnc", "machinery");
    if (combined.includes("citizen")) tags.push("citizen");
    if (combined.includes("m32")) tags.push("m32", "citizen");
    if (combined.includes("l20")) tags.push("l20", "citizen");
  } else if (combined.includes("electropol") || combined.includes("finishing") || combined.includes("acabamento")) {
    category = "equipment";
    tags.push("equipment", "finishing", "electropolishing");
  }
  
  // Products
  else if (combined.includes("product") || combined.includes("produto") || combined.includes("implant") || combined.includes("parafuso") || combined.includes("screw")) {
    category = "product";
    tags.push("produto", "product");
    if (combined.includes("dental")) tags.push("dental");
    if (combined.includes("spinal")) tags.push("spinal");
    if (combined.includes("ortho")) tags.push("orthopedic");
  }
  
  // Hero images
  else if (combined.includes("hero")) {
    category = "facilities";
    tags.push("hero", "principal");
  }
  
  // Team photos
  else if (combined.includes("team") || combined.includes("equipe") || combined.includes("staff")) {
    category = "team";
    tags.push("team", "equipe", "people");
  }
  
  // Add folder as tag
  if (folder && folder !== "" && !tags.includes(folder.toLowerCase())) {
    tags.push(folder.toLowerCase());
  }
  
  return { category, tags };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 [MIGRATE-ASSETS] Starting comprehensive asset migration...");
    
    const results = {
      processed_products: { migrated: 0, skipped: 0, errors: 0 },
      company_assets: { migrated: 0, skipped: 0, errors: 0 },
      website_assets: { migrated: 0, skipped: 0, errors: 0 },
      content_assets_bucket: { migrated: 0, skipped: 0, errors: 0 },
      total: 0,
      details: [] as string[]
    };

    // === 1. SCAN website-assets BUCKET (NEW - Priority for LinkedIn) ===
    console.log("🌐 [MIGRATE-ASSETS] Scanning website-assets bucket...");
    const websiteBucket = "website-assets";
    
    // Helper: Check if item is a folder (no metadata.size means folder)
    const isFolder = (item: any) => !item.metadata || item.metadata.size === undefined;
    
    // First, list root level
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from(websiteBucket)
      .list("", { limit: 500 });
    
    if (rootError) {
      console.log(`⚠️ website-assets bucket error: ${rootError.message}`);
    } else if (rootFiles) {
      console.log(`📂 Found ${rootFiles.length} items at root of website-assets`);
      
      // Process files and folders
      for (const item of rootFiles) {
        console.log(`  → Checking: ${item.name} (isFolder: ${isFolder(item)}, id: ${item.id})`);
        
        if (isFolder(item)) {
          // It's a folder - scan its contents
          const { data: subFiles, error: subError } = await supabase.storage
            .from(websiteBucket)
            .list(item.name, { limit: 500 });
          
          if (subError) {
            console.log(`    ⚠️ Error listing folder ${item.name}: ${subError.message}`);
          } else if (subFiles) {
            console.log(`    📁 Folder ${item.name} has ${subFiles.length} files`);
            for (const file of subFiles) {
              if (!isFolder(file)) {
                // It's a file - process it with encoded path
                const encodedPath = `${item.name}/${encodeURIComponent(file.name)}`;
                const filePath = `${supabaseUrl}/storage/v1/object/public/${websiteBucket}/${encodedPath}`;
                
                // Check if already exists
                const { data: existing } = await supabase
                  .from("content_assets")
                  .select("id")
                  .eq("file_path", filePath)
                  .maybeSingle();
                
                if (existing) {
                  results.website_assets.skipped++;
                  continue;
                }
                
                const { category, tags } = inferCategoryAndTags(item.name, file.name);
                
                const { error: insertError } = await supabase
                  .from("content_assets")
                  .insert({
                    filename: file.name,
                    file_path: filePath,
                    content_type: file.metadata?.mimetype || "image/webp",
                    category: category,
                    tags: tags,
                    size: file.metadata?.size || null,
                  });
                
                if (insertError) {
                  console.error(`❌ Error inserting ${file.name}:`, insertError.message);
                  results.website_assets.errors++;
                } else {
                  results.website_assets.migrated++;
                  results.details.push(`✅ website-assets/${item.name}/${file.name} → ${category}`);
                }
              }
            }
          }
        } else {
          // It's a file at root level - encode filename
          const encodedFilename = encodeURIComponent(item.name);
          const filePath = `${supabaseUrl}/storage/v1/object/public/${websiteBucket}/${encodedFilename}`;
          
          const { data: existing } = await supabase
            .from("content_assets")
            .select("id")
            .eq("file_path", filePath)
            .maybeSingle();
          
          if (existing) {
            results.website_assets.skipped++;
            continue;
          }
          
          const { category, tags } = inferCategoryAndTags("", item.name);
          
          const { error: insertError } = await supabase
            .from("content_assets")
            .insert({
              filename: item.name,
              file_path: filePath,
              content_type: item.metadata?.mimetype || "image/webp",
              category: category,
              tags: tags,
              size: item.metadata?.size || null,
            });
          
          if (insertError) {
            console.error(`❌ Error inserting root file ${item.name}:`, insertError.message);
            results.website_assets.errors++;
          } else {
            results.website_assets.migrated++;
            results.details.push(`✅ website-assets/${item.name} → ${category}`);
          }
        }
      }
    }
    console.log(`📊 website-assets: ${results.website_assets.migrated} migrated, ${results.website_assets.skipped} skipped`);

    // === 2. SCAN content-assets BUCKET ===
    console.log("📁 [MIGRATE-ASSETS] Scanning content-assets bucket...");
    const contentBucket = "content-assets";
    
    const { data: contentRootFiles } = await supabase.storage
      .from(contentBucket)
      .list("", { limit: 200 });
    
    if (contentRootFiles) {
      for (const item of contentRootFiles) {
        if (item.id === null) {
          // It's a folder - scan its contents
          const { data: subFiles } = await supabase.storage
            .from(contentBucket)
            .list(item.name, { limit: 200 });
          
          if (subFiles) {
            for (const subItem of subFiles) {
              if (subItem.id === null) {
                // Nested folder
                const { data: nestedFiles } = await supabase.storage
                  .from(contentBucket)
                  .list(`${item.name}/${subItem.name}`, { limit: 200 });
                
                if (nestedFiles) {
                  for (const file of nestedFiles) {
                    if (file.id !== null) {
                      const filePath = `${supabaseUrl}/storage/v1/object/public/${contentBucket}/${item.name}/${subItem.name}/${file.name}`;
                      
                      const { data: existing } = await supabase
                        .from("content_assets")
                        .select("id")
                        .eq("file_path", filePath)
                        .maybeSingle();
                      
                      if (existing) {
                        results.content_assets_bucket.skipped++;
                        continue;
                      }
                      
                      const { category, tags } = inferCategoryAndTags(`${item.name}/${subItem.name}`, file.name);
                      
                      const { error: insertError } = await supabase
                        .from("content_assets")
                        .insert({
                          filename: file.name,
                          file_path: filePath,
                          content_type: file.metadata?.mimetype || "image/webp",
                          category: category,
                          tags: tags,
                        });
                      
                      if (insertError) {
                        results.content_assets_bucket.errors++;
                      } else {
                        results.content_assets_bucket.migrated++;
                        results.details.push(`✅ content-assets/${item.name}/${subItem.name}/${file.name} → ${category}`);
                      }
                    }
                  }
                }
              } else {
                // Direct file
                const filePath = `${supabaseUrl}/storage/v1/object/public/${contentBucket}/${item.name}/${subItem.name}`;
                
                const { data: existing } = await supabase
                  .from("content_assets")
                  .select("id")
                  .eq("file_path", filePath)
                  .maybeSingle();
                
                if (existing) {
                  results.content_assets_bucket.skipped++;
                  continue;
                }
                
                const { category, tags } = inferCategoryAndTags(item.name, subItem.name);
                
                const { error: insertError } = await supabase
                  .from("content_assets")
                  .insert({
                    filename: subItem.name,
                    file_path: filePath,
                    content_type: subItem.metadata?.mimetype || "image/webp",
                    category: category,
                    tags: tags,
                  });
                
                if (insertError) {
                  results.content_assets_bucket.errors++;
                } else {
                  results.content_assets_bucket.migrated++;
                  results.details.push(`✅ content-assets/${item.name}/${subItem.name} → ${category}`);
                }
              }
            }
          }
        }
      }
    }
    console.log(`📊 content-assets bucket: ${results.content_assets_bucket.migrated} migrated, ${results.content_assets_bucket.skipped} skipped`);

    // === 3. MIGRATE processed_product_images TABLE ===
    console.log("📦 [MIGRATE-ASSETS] Migrating processed_product_images table...");
    const { data: products, error: productError } = await supabase
      .from("processed_product_images")
      .select("id, name, enhanced_url, category, description, brand, model")
      .eq("is_visible", true);

    if (productError) {
      console.error("❌ Error fetching products:", productError.message);
    } else if (products && products.length > 0) {
      console.log(`📦 Found ${products.length} products to check`);
      
      for (const product of products) {
        const { data: existing } = await supabase
          .from("content_assets")
          .select("id")
          .eq("file_path", product.enhanced_url)
          .maybeSingle();

        if (existing) {
          results.processed_products.skipped++;
          continue;
        }

        const categoryTags = [product.category, "produto", "processado"];
        if (product.brand) categoryTags.push(product.brand.toLowerCase());
        if (product.model) categoryTags.push(product.model.toLowerCase());

        const { error: insertError } = await supabase
          .from("content_assets")
          .insert({
            filename: product.name,
            file_path: product.enhanced_url,
            content_type: "image/png",
            category: product.category || "product",
            tags: categoryTags,
          });

        if (insertError) {
          results.processed_products.errors++;
        } else {
          results.processed_products.migrated++;
        }
      }
    }
    console.log(`📊 processed_product_images: ${results.processed_products.migrated} migrated, ${results.processed_products.skipped} skipped`);

    // === 4. MIGRATE company_assets TABLE (logos, etc.) ===
    console.log("🏢 [MIGRATE-ASSETS] Migrating company_assets table...");
    const { data: companyAssets, error: companyError } = await supabase
      .from("company_assets")
      .select("id, name, url, type, metadata");

    if (companyError) {
      console.error("❌ Error fetching company_assets:", companyError.message);
    } else if (companyAssets && companyAssets.length > 0) {
      console.log(`🏢 Found ${companyAssets.length} company assets to check`);
      
      for (const asset of companyAssets) {
        const { data: existing } = await supabase
          .from("content_assets")
          .select("id")
          .eq("file_path", asset.url)
          .maybeSingle();

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
            category: asset.type === "logo" ? "branding" : asset.type,
            tags: tags,
          });

        if (insertError) {
          results.company_assets.errors++;
        } else {
          results.company_assets.migrated++;
        }
      }
    }
    console.log(`📊 company_assets: ${results.company_assets.migrated} migrated, ${results.company_assets.skipped} skipped`);

    // Calculate totals
    results.total = 
      results.processed_products.migrated + 
      results.company_assets.migrated +
      results.website_assets.migrated +
      results.content_assets_bucket.migrated;

    console.log("✅ [MIGRATE-ASSETS] Migration complete!");
    console.log(`   └─ Total migrated: ${results.total}`);
    console.log(`   └─ Total skipped: ${results.processed_products.skipped + results.company_assets.skipped + results.website_assets.skipped + results.content_assets_bucket.skipped}`);

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
