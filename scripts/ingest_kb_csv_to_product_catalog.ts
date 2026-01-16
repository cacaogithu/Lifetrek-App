// scripts/ingest_kb_csv_to_product_catalog.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), 'supabase', 'functions', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase URL or Service Role Key is not set in supabase/functions/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false // Do not persist session for service role
    }
});

async function ingestCsvToProductCatalog(csvFilePath: string) {
  console.log(`Ingesting data from ${csvFilePath} into product_catalog table...`);

  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(parse({
      delimiter: ';', // CSV is semicolon delimited
      columns: true,  // Treat the first row as column names
      skip_empty_lines: true
    }));

  let records: any[] = [];
  for await (const record of parser) {
    records.push(record);
  }

  console.log(`Read ${records.length} records from CSV.`);

  const transformedRecords = records.map(record => {
    // CSV columns: id;content;metadata;embedding;source_type;source_id;chunk_index;created_at;updated_at
    // product_catalog columns: id, name, description, image_url, metadata, embedding

    // Convert stringified embedding to array of numbers
    let embeddingArray: number[] | null = null;
    if (record.embedding && typeof record.embedding === 'string') {
        try {
            // Remove '[' and ']' and split by comma, then convert to float
            embeddingArray = JSON.parse(record.embedding); 
        } catch (e) {
            console.error("Failed to parse embedding:", record.embedding, e);
        }
    }
    
    // Attempt to parse metadata if it's a string
    let parsedMetadata: any = {};
    if (record.metadata && typeof record.metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(record.metadata);
      } catch (e) {
        console.warn("Could not parse metadata string, using as-is or empty object:", record.metadata);
        parsedMetadata = { raw_metadata: record.metadata }; // Store raw if cannot parse
      }
    } else if (record.metadata) {
      parsedMetadata = record.metadata;
    }


    return {
      id: record.id,
      name: parsedMetadata.title || record.content.substring(0, 100) || `Knowledge Item ${record.id}`, // Use title from metadata or first 100 chars of content
      description: record.content,
      image_url: null, // No image_url in source CSV
      metadata: parsedMetadata,
      embedding: embeddingArray, // Ensure this is a number array
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  });

  console.log(`Transformed ${transformedRecords.length} records.`);

  // Insert records in batches to avoid overwhelming the database
  const batchSize = 100;
  for (let i = 0; i < transformedRecords.length; i += batchSize) {
    const batch = transformedRecords.slice(i, i + batchSize);
    console.log(`Inserting batch ${i / batchSize + 1}/${Math.ceil(transformedRecords.length / batchSize)}...`);
    const { error } = await supabase.from('product_catalog').upsert(batch, { onConflict: 'id' }); // Upsert to handle existing IDs

    if (error) {
      console.error(`Error inserting batch starting from index ${i}:`, error);
      // Depending on requirements, you might want to stop or continue
    } else {
      console.log(`Batch ${i / batchSize + 1} inserted successfully.`);
    }
  }

  console.log('CSV ingestion complete!');
}

const csvFilePath = '/Users/rafaelalmeida/Downloads/knowledge_embeddings-export-2026-01-16_08-30-40.csv';
ingestCsvToProductCatalog(csvFilePath).catch(console.error);

