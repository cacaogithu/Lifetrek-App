"""
CSV to Supabase Database Sync Utility
Migrates lead data from CSV files to the Supabase leads table
"""

import os
import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def parse_json_field(value):
    """Parse JSON fields that might be strings or already parsed"""
    if pd.isna(value) or value == '' or value == '[]':
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except:
            # If it's a simple string, wrap it in a list
            return [value] if value else []
    return []

def transform_lead_row(row):
    """Transform a CSV row to match database schema"""
    return {
        'nome_empresa': str(row.get('Nome Empresa', row.get('nome_empresa', ''))),
        'website': str(row.get('Website', row.get('website', ''))) if pd.notna(row.get('Website', row.get('website'))) else None,
        'telefone': str(row.get('Telefone', row.get('telefone', ''))) if pd.notna(row.get('Telefone', row.get('telefone'))) else None,
        'segmento': str(row.get('Segmento', row.get('segmento', ''))) if pd.notna(row.get('Segmento', row.get('segmento'))) else None,
        'categoria': str(row.get('Categoria', row.get('categoria', ''))) if pd.notna(row.get('Categoria', row.get('categoria'))) else None,
        
        # JSON fields
        'scraped_emails': parse_json_field(row.get('Scraped_Emails', row.get('scraped_emails'))),
        'linkedin_profiles': parse_json_field(row.get('LinkedIn_Profiles', row.get('linkedin_profiles'))),
        'decision_makers': parse_json_field(row.get('Decision_Makers', row.get('decision_makers'))),
        
        # Boolean fields
        'has_fda': bool(row.get('has_fda', False)),
        'has_ce': bool(row.get('has_ce', False)),
        'has_iso': bool(row.get('has_iso', False)),
        'has_rd': bool(row.get('has_rd', False)),
        
        # Integer fields
        'years_in_business': int(row.get('years', row.get('years_in_business', 0))) if pd.notna(row.get('years', row.get('years_in_business', 0))) else 0,
        'countries_served': int(row.get('countries', row.get('countries_served', 0))) if pd.notna(row.get('countries', row.get('countries_served', 0))) else 0,
        'employee_count': int(row.get('employees', row.get('employee_count', 0))) if pd.notna(row.get('employees', row.get('employee_count', 0))) else 0,
        
        # Decimal fields
        'predicted_score': float(row.get('Predicted_Score', row.get('predicted_score', 0))) if pd.notna(row.get('Predicted_Score', row.get('predicted_score', 0))) else 0.0,
        'v2_score': float(row.get('V2_Score', row.get('v2_score', 0))) if pd.notna(row.get('V2_Score', row.get('v2_score', 0))) else 0.0,
        
        # Status fields
        'enrichment_status': str(row.get('Enrichment_Status', row.get('enrichment_status', 'pending'))).lower(),
        'priority': str(row.get('Priority', row.get('priority', 'medium'))).lower(),
        
        # Metadata
        'source': str(row.get('Source', row.get('source', 'csv_import'))),
        'notes': str(row.get('Notes', row.get('notes', ''))) if pd.notna(row.get('Notes', row.get('notes'))) else None,
    }

def sync_csv_to_database(csv_path: str, batch_size: int = 50):
    """Sync CSV file to Supabase database"""
    print(f"📂 Reading CSV: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"❌ File not found: {csv_path}")
        return
    
    # Read CSV
    df = pd.read_csv(csv_path)
    print(f"📊 Found {len(df)} leads in CSV")
    
    # Transform data
    leads_data = []
    for _, row in df.iterrows():
        try:
            lead = transform_lead_row(row)
            leads_data.append(lead)
        except Exception as e:
            print(f"⚠️  Error transforming row: {row.get('Nome Empresa', 'Unknown')} - {e}")
    
    print(f"✅ Transformed {len(leads_data)} leads")
    
    # Upload in batches
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
            print(f"✅ Uploaded batch {i // batch_size + 1}: {len(batch)} leads (Total: {success_count}/{len(leads_data)})")
            
        except Exception as e:
            error_count += len(batch)
            print(f"❌ Error uploading batch {i // batch_size + 1}: {e}")
    
    print(f"\n{'='*60}")
    print(f"📊 Sync Complete:")
    print(f"   ✅ Success: {success_count}")
    print(f"   ❌ Errors: {error_count}")
    print(f"   📈 Total: {len(leads_data)}")
    print(f"{'='*60}\n")

def main():
    """Main function to sync CSV files"""
    print("🚀 Lead CSV to Database Sync Utility\n")
    
    # Common CSV file locations
    csv_files = [
        '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv',
        '/Users/rafaelalmeida/lifetrek-mirror/leads_enriched_final_v2.csv',
        '/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv',
    ]
    
    # Check which files exist
    existing_files = [f for f in csv_files if os.path.exists(f)]
    
    if not existing_files:
        print("❌ No CSV files found in expected locations")
        print("\nExpected locations:")
        for f in csv_files:
            print(f"  - {f}")
        print("\nYou can also specify a custom CSV path:")
        custom_path = input("Enter CSV path (or press Enter to skip): ").strip()
        if custom_path and os.path.exists(custom_path):
            existing_files = [custom_path]
    
    if not existing_files:
        print("❌ No CSV files to process. Exiting.")
        return
    
    print(f"📁 Found {len(existing_files)} CSV file(s):\n")
    for i, f in enumerate(existing_files, 1):
        print(f"{i}. {f}")
    
    # Sync each file
    for csv_file in existing_files:
        print(f"\n{'='*60}")
        sync_csv_to_database(csv_file)

if __name__ == "__main__":
    main()
