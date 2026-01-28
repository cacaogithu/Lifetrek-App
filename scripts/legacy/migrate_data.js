
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import dotenv from 'dotenv'

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

async function migrateLeads() {
  const filePath = path.join(process.cwd(), 'FINAL_LEADS_FOR_UPLOAD - FINAL_LEADS_FOR_UPLOAD.csv.csv')
  
  if (!fs.existsSync(filePath)) {
    console.log('Leads file not found, skipping.')
    return
  }

  console.log('Reading leads file...')
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  })

  console.log(`Found ${records.length} leads to migrate.`)

  // Map CSV columns to Database Schema
  // Assuming 'leads' table exists with standard fields. 
  // We need to map Portuguese headers to English DB columns if necessary, 
  // or insert into a structured JSONB column if schema is flexible.
  // Based on previous context, the 'leads' table likely has: name, company, email, phone...
  
  // Let's try to map strictly first.
  const mappedRecords = records.map(record => ({
    company_name: record.nome_empresa,
    website: record.website,
    phone: record.telefone,
    address: record.endereco,
    email: record.email,
    segment: record.segmento,
    city: record.cidade,
    state: record.estado,
    // Store metadata or extra fields in a jsonb column if available, or just map what fits
    enrichment_status: record.enrichment_status || 'pending',
    // We might need to adjust based on actual table schema. 
    // For now, attempting basic mapping.
    score: record.v2_score ? parseFloat(record.v2_score) : null
  }))

  // Batch insert
  const BATCH_SIZE = 100
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < mappedRecords.length; i += BATCH_SIZE) {
    const batch = mappedRecords.slice(i, i + BATCH_SIZE)
    
    // Clean undefined/empty strings (Supabase might reject empty strings for some types)
    const cleanedBatch = batch.map(item => {
        const clean = {}
        for (const key in item) {
            if (item[key] !== '' && item[key] !== undefined) {
                clean[key] = item[key]
            }
        }
        return clean
    })

    const { error } = await supabase.from('leads').insert(cleanedBatch)

    if (error) {
      console.error(`Error inserting batch ${i}:`, error.message)
      errorCount += batch.length
    } else {
      successCount += batch.length
      console.log(`Migrated ${successCount}/${records.length} leads...`)
    }
  }

  console.log(`Migration Complete. Success: ${successCount}, Errors: ${errorCount}`)
}


async function migrateProcessedImages() {
  const files = fs.readdirSync(process.cwd()).filter(file => file.startsWith('processed_product_images-export') && file.endsWith('.csv'))
  
  if (files.length === 0) {
    console.log('No processed_product_images CSVs found, skipping.')
    return
  }

  for (const file of files) {
      console.log(`Processing images file: ${file}...`)
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8')
      const records = parse(content, {
          columns: true,
          skip_empty_lines: true,
          delimiter: ';' // Based on the header we saw
      })

      console.log(`Found ${records.length} images to migrate in ${file}.`)
      
      const mappedRecords = records.map(record => ({
          id: record.id,
          // created_at: record.created_at, // Let Supabase handle defaults or parse if critical
          // updated_at: record.updated_at,
          original_url: record.original_url,
          enhanced_url: record.enhanced_url,
          name: record.name,
          description: record.description,
          category: record.category,
          brand: record.brand,
          model: record.model,
          original_filename: record.original_filename,
          file_size: record.file_size ? parseInt(record.file_size) : null,
          custom_prompt: record.custom_prompt,
          processed_by: null, // Old user IDs don't exist in new project, setting to null to avoid FK errors
          is_featured: record.is_featured === 'true',
          is_visible: record.is_visible === 'true'
      }))

      // Batch insert or upsert
      const BATCH_SIZE = 50
      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < mappedRecords.length; i += BATCH_SIZE) {
          const batch = mappedRecords.slice(i, i + BATCH_SIZE)
          // Upsert to avoid duplicates if running multiple files with overlapping data
          const { error } = await supabase.from('processed_product_images').upsert(batch, { onConflict: 'id' })

          if (error) {
              console.error(`Error processing batch in ${file}:`, error.message)
              errorCount += batch.length
          } else {
              successCount += batch.length
          }
      }
      console.log(`Finished ${file}. Success: ${successCount}, Errors: ${errorCount}`)
  }
}

async function run() {
    await migrateLeads()
    await migrateProcessedImages()
}

run()
