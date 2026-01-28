
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";
import { uploadFileToDrive } from "../supabase/functions/_shared/google-drive.ts";

// Load .env
await config({ export: true, path: "./.env" });

const FOLDER_ID = Deno.env.get("GOOGLE_DRIVE_FOLDER_ID");

if (!FOLDER_ID) {
    console.error("❌ GOOGLE_DRIVE_FOLDER_ID not found in .env");
    Deno.exit(1);
}

console.log("🧪 Starting Google Drive Upload Verification...");
console.log(`📂 Target Folder ID: ${FOLDER_ID}`);

// Create a dummy text file
const content = "This is a test file uploaded by the Lifetrek Agent to verify Google Drive integration.";
const blob = new Blob([content], { type: "text/plain" });
const filename = `verification_test_${Date.now()}.txt`;

console.log(`📤 Attempting to upload ${filename}...`);

try {
    const fileId = await uploadFileToDrive(filename, blob, FOLDER_ID, "text/plain");

    if (fileId) {
        console.log(`✅ SUCCESS! File uploaded successfully.`);
        console.log(`🆔 File ID: ${fileId}`);
        console.log("Please check your Google Drive folder to confirm the file exists.");
    } else {
        console.error("❌ Upload failed (no file ID returned). Check console logs for details.");
        Deno.exit(1);
    }
} catch (error) {
    console.error("❌ Exception during upload:", error);
    Deno.exit(1);
}
