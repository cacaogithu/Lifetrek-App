
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { glob } from 'glob'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Configure buckets to map local folders to
// Key: Local Folder (relative to project root) -> Value: Storage Bucket Name
const MAPPINGS = {
    'src/assets/products': 'products',
    'src/assets/equipment': 'equipment', 
    'src/assets/certifications': 'certifications',
    'src/assets/facility': 'facility',
    'src/assets/metrology': 'metrology',
    'src/assets': 'assets' // Catch-all for root assets
}

async function uploadAssets() {
    console.log("🚀 Starting Asset Upload...")

    // 1. Ensure buckets exist (optional, or assume they do from migrations)
    const { data: buckets } = await supabase.storage.listBuckets()
    const existingBuckets = new Set(buckets?.map(b => b.name) || [])

    for (const [folder, bucketName] of Object.entries(MAPPINGS)) {
        if (!existingBuckets.has(bucketName)) {
             console.log(`Creating bucket: ${bucketName}...`)
             await supabase.storage.createBucket(bucketName, { public: true })
             existingBuckets.add(bucketName)
        }

        // Find files
        const files = await glob(`${folder}/*.{png,jpg,jpeg,pdf,svg,webp}`)
        
        console.log(`Found ${files.length} files in ${folder} to upload to ${bucketName}...`)

        for (const filePath of files) {
            const fileName = path.basename(filePath)
            const fileContent = fs.readFileSync(filePath)
            
            // Upload
            const { error } = await supabase.storage
                .from(bucketName)
                .upload(fileName, fileContent, {
                    contentType: getContentType(fileName),
                    upsert: true
                })

            if (error) {
                console.error(`❌ Failed to upload ${fileName}:`, error.message)
            } else {
                console.log(`✅ Uploaded ${fileName}`)
            }
        }
    }
    console.log("🎉 Upload Complete!")
}

function getContentType(filename) {
    const ext = path.extname(filename).toLowerCase()
    if (ext === '.png') return 'image/png'
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
    if (ext === '.svg') return 'image/svg+xml'
    if (ext === '.pdf') return 'application/pdf'
    if (ext === '.webp') return 'image/webp'
    return 'application/octet-stream'
}

uploadAssets()
