"""
Create leads table and import data directly using Supabase client
"""

import os
from supabase import create_client
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("🔌 Connecting to Supabase...")
print(f"URL: {SUPABASE_URL}")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# First, let's check if table exists and create it if not
print("\n📋 Creating leads table...")

# We'll use SQL to create the table
create_table_sql = """
-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Company Information
  nome_empresa TEXT NOT NULL UNIQUE,
  website TEXT,
  telefone TEXT,
  segmento TEXT,
  categoria TEXT,
  
  -- Enrichment Data
  scraped_emails JSONB DEFAULT '[]'::jsonb,
  linkedin_profiles JSONB DEFAULT '[]'::jsonb,
  decision_makers JSONB DEFAULT '[]'::jsonb,
  
  -- Company Indicators
  has_fda BOOLEAN DEFAULT false,
  has_ce BOOLEAN DEFAULT false,
  has_iso BOOLEAN DEFAULT false,
  has_rd BOOLEAN DEFAULT false,
  years_in_business INTEGER DEFAULT 0,
  countries_served INTEGER DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  
  -- Scoring
  predicted_score DECIMAL(4,2) DEFAULT 0,
  v2_score DECIMAL(4,2) DEFAULT 0,
  
  -- Status
  enrichment_status TEXT DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'in_progress', 'complete', 'failed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Metadata
  last_enriched_at TIMESTAMPTZ,
  source TEXT,
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_nome_empresa ON leads(nome_empresa);
CREATE INDEX IF NOT EXISTS idx_leads_v2_score ON leads(v2_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_enrichment_status ON leads(enrichment_status);
"""

try:
    # Execute SQL to create table
    result = supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
    print("✅ Leads table created successfully!")
except Exception as e:
    # If RPC doesn't exist, we'll insert data anyway and let it fail if table doesn't exist
    print(f"⚠️  Could not create table via RPC: {e}")
    print("   Assuming table already exists or will be created manually...")

# Now load and import the CSV data
print("\n📂 Loading CSV data...")
csv_path = "/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv"

df = pd.read_csv(csv_path)
print(f"📊 Found {len(df)} leads in CSV")

# Transform data
print("\n🔄 Transforming data...")
leads_data = []

for _, row in df.iterrows():
    lead = {
        'nome_empresa': str(row.get('Nome Empresa', '')),
        'website': str(row.get('Website', '')) if pd.notna(row.get('Website')) else None,
        'telefone': str(row.get('Phone', '')) if pd.notna(row.get('Phone')) else None,
        'segmento': str(row.get('Segment', '')) if pd.notna(row.get('Segment')) else None,
        'predicted_score': float(row.get('Predicted_Score', 0)) if pd.notna(row.get('Predicted_Score')) else 0.0,
        'v2_score': float(row.get('V2_Score', 0)) if pd.notna(row.get('V2_Score')) else 0.0,
        'enrichment_status': 'pending',
        'priority': 'medium',
        'source': 'csv_import'
    }
    leads_data.append(lead)

print(f"✅ Transformed {len(leads_data)} leads")

# Upload in batches
print("\n📤 Uploading to database...")
batch_size = 50
success_count = 0
error_count = 0

for i in range(0, len(leads_data), batch_size):
    batch = leads_data[i:i + batch_size]
    try:
        response = supabase.table('leads').upsert(
            batch,
            on_conflict='nome_empresa'
        ).execute()
        
        success_count += len(batch)
        batch_num = (i // batch_size) + 1
        total_batches = (len(leads_data) + batch_size - 1) // batch_size
        print(f"✅ Batch {batch_num}/{total_batches}: Uploaded {len(batch)} leads (Total: {success_count}/{len(leads_data)})")
        
    except Exception as e:
        error_count += len(batch)
        print(f"❌ Error uploading batch {i // batch_size + 1}: {e}")

print(f"\n{'='*60}")
print(f"🎉 Import Complete!")
print(f"   ✅ Success: {success_count}")
print(f"   ❌ Errors: {error_count}")
print(f"   📈 Total: {len(leads_data)}")
print(f"{'='*60}")
print(f"\n💡 View your data at: http://localhost:8081/admin/leads")
