
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const targetDir = Deno.args[0];
if (!targetDir) {
    console.error("Please provide a directory path (e.g., 'goodslides2')");
    Deno.exit(1);
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log(`📂 Scanning directory: ${targetDir}`);

// Group files by parent folder (assuming each folder is a carousel)
// OR if flat structure, treat appropriately. 
// "goodslides2" and "Ideia 3" might contain loose images or folders. 
// Let's assume loose images = individual slides, but we need to group them into a "carousel" entry.
// For simplicity, we'll treat the *directory itself* as one carousel source, 
// OR check if there are subdirectories.
// Strategy: 
// 1. Walk files.
// 2. Identify images (png/jpg).
// 3. Process each image to get text/visual description.
// 4. Aggregate all text for the directory (or sub-folders).
// 5. Generate embedding for the aggregate.
// 6. Insert into DB.

// Let's assume each *directory passed* represents ONE carousel or a collection of related useful slides.
// If "goodslides2" has 10 images, we'll treat them as "Ref: goodslides2".

async function processDirectory(dirPath: string) {
    const imagePaths = [];
    for await (const entry of walk(dirPath, { includeDirs: false, maxDepth: 2 })) {
        if (entry.isFile && /\.(png|jpg|jpeg|webp)$/i.test(entry.name)) {
            imagePaths.push(entry.path);
        }
    }

    if (imagePaths.length === 0) {
        console.log(`⚠️ No images found in ${dirPath}`);
        return;
    }

    console.log(`found ${imagePaths.length} images. Analyzing with Gemini...`);

    const slideAnalyses = [];
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    for (const imgPath of imagePaths) {
        try {
            const imgData = await Deno.readFile(imgPath);
            const b64 = encodeBase64(imgData);

            const result = await model.generateContent([
                "Analyze this slide. Provide a concise description of the Design Style, Color Palette, and Text Content.",
                { inlineData: { data: b64, mimeType: "image/png" } }
            ]);
            const text = result.response.text();
            slideAnalyses.push(`Slide (${imgPath}): ${text}`);
            console.log(`  - Analyzed ${imgPath}`);
        } catch (e) {
            console.error(`  ❌ Failed to analyze ${imgPath}:`, e.message);
        }
    }

    const fullContent = `Source: ${dirPath}\n\n${slideAnalyses.join("\n\n")}`;

    // Generate Embedding
    console.log("creating embedding...");
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embedResult = await embedModel.embedContent(fullContent);
    const vector = embedResult.embedding.values;

    // Insert
    console.log("Inserting into DB...");

    // Retrieve Admin ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users?.length) {
        console.error("❌ Failed to list users for admin assignment");
        return;
    }
    const adminId = users[0].id;

    const { error } = await supabase.from('linkedin_carousels').insert({
        topic: `Reference: ${dirPath}`,
        // title: removed
        slides: slideAnalyses.map(fs => ({ content: fs })),
        content_embedding: vector,
        status: 'accepted',
        quality_score: 100,
        user_id: adminId,
        admin_user_id: adminId,
        target_audience: 'General Professionals',
        tone: 'Professional',
        caption: `Recovered Reference: ${dirPath}` // Fix for caption constraint
    });

    if (error) console.error("❌ DB Insert Error:", error);
    else console.log("✅ Successfully Ingested!");
}

await processDirectory(targetDir);
