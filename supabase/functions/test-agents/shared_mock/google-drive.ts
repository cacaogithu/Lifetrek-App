
// supabase/functions/_shared/google-drive.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Fetch config from Environment Variables first, then generic app_config table.
 */
export async function getConfig(key: string): Promise<string | null> {
    const envVal = Deno.env.get(key);
    if (envVal) return envVal;

    // Fallback to Supabase DB
    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data } = await supabase
            .from("app_config")
            .select("value")
            .eq("key", key)
            .single();

        if (data?.value) return data.value;
    } catch (e) {
        console.warn(`Failed to fetch ${key} from DB`, e);
    }
    return null;
}

/**
 * Exchange the refresh token for a new access token.
 */
async function getAccessToken() {
    const CLIENT_ID = await getConfig("GOOGLE_CLIENT_ID");
    const CLIENT_SECRET = await getConfig("GOOGLE_CLIENT_SECRET");
    const REFRESH_TOKEN = await getConfig("GOOGLE_DRIVE_REFRESH_TOKEN");

    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error("Missing Google Drive configuration (Env Vars or app_config table)");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: "refresh_token",
        }),
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`Error refreshing token: ${data.error_description || JSON.stringify(data)}`);
    }

    return data.access_token;
}

/**
 * Upload a file to Google Drive.
 * @param filename Name of the file
 * @param blob File content (Blob or Uint8Array)
 * @param folderId ID of the parent folder
 * @param mimeType Mime type of the file
 */
export async function uploadFileToDrive(
    filename: string,
    blob: Blob | Uint8Array,
    folderId: string,
    mimeType: string = "image/png"
) {
    try {
        const accessToken = await getAccessToken();

        const metadata = {
            name: filename,
            parents: [folderId],
        };

        const form = new FormData();
        form.append(
            "metadata",
            new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        form.append(
            "file",
            blob instanceof Uint8Array ? new Blob([blob], { type: mimeType }) : blob
        );

        const response = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: form,
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(`Error uploading file: ${data.error.message}`);
        }

        console.log(`✅ Uploaded to Drive: ${filename} (ID: ${data.id})`);
        return data.id;
    } catch (error) {
        console.error("❌ Google Drive Upload Error:", error);
        // Don't throw, just log so we don't break the whole process if upload fails
        return null;
    }
}

/**
 * Create a folder in Google Drive.
 * @param folderName Name of the new folder
 * @param parentId ID of the parent folder
 * @returns ID of the new folder
 */
export async function createFolder(folderName: string, parentId: string) {
    try {
        const accessToken = await getAccessToken();

        const metadata = {
            name: folderName,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentId],
        };

        const response = await fetch("https://www.googleapis.com/drive/v3/files", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(metadata),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Error creating folder: ${data.error.message}`);
        }

        console.log(`✅ Created Folder: ${folderName} (ID: ${data.id})`);
        return data.id;
    } catch (error) {
        console.error("❌ Google Drive Folder Creation Error:", error);
        return null;
    }
}
