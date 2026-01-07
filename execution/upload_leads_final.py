"""
Upload Enriched Leads to Supabase
Reads LEADS_CONSOLIDATED.csv and uploads to 'leads' table using LeadDBWriter
"""

import pandas as pd
import json
import numpy as np
import sys
import os

# Add parent directory to path to import utils
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))
from db_writer import LeadDBWriter

def clean_value(val):
    """Clean pandas nan values"""
    if pd.isna(val) or val == 'nan':
        return None
    return str(val)

def upload_leads():
    print("🚀 STARTING LEADS UPLOAD TO SUPABASE")
    print("=" * 60)
    
    # 1. Initialize DB Writer
    try:
        db = LeadDBWriter()
        print("✅ Database connection established")
    except Exception as e:
        print(f"❌ Failed to connect to DB: {e}")
        return

    # 2. Load CSV
    csv_file = '/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv'
    if not os.path.exists(csv_file):
        print(f"❌ File not found: {csv_file}")
        return
        
    df = pd.read_csv(csv_file)
    print(f"📊 Loaded {len(df)} leads from CSV")
    
    # 3. Transform Data
    leads_to_upload = []
    
    for idx, row in df.iterrows():
        # Map fields to DB schema
        lead = {
            'nome_empresa': row['nome_empresa'],
            'website': clean_value(row.get('website')),
        }
        
        # Add basic fields if they exist
        if clean_value(row.get('telefone')):
            lead['phone'] = clean_value(row.get('telefone'))
            
        if clean_value(row.get('endereco')):
            lead['address'] = clean_value(row.get('endereco'))
            
        if clean_value(row.get('segmento')):
            lead['segment'] = clean_value(row.get('segmento'))
            
        if clean_value(row.get('cidade')):
            lead['city'] = clean_value(row.get('cidade'))
            
        if clean_value(row.get('estado')):
            lead['state'] = clean_value(row.get('estado'))
            
        # Handle Email (convert single email to array if needed)
        email = clean_value(row.get('email'))
        if email:
            lead['scraped_emails'] = [email] # Overwrite or merge logic handled by app usually, here we just set initial
        
        # Handle Decision Makers (JSON)
        dm_json = row.get('decision_makers')
        if pd.notna(dm_json) and dm_json:
            try:
                # If it's already a string representation of json
                if isinstance(dm_json, str):
                    lead['decision_makers'] = json.loads(dm_json)
                else:
                    lead['decision_makers'] = dm_json
            except:
                pass
                
        # Handle Scores
        if pd.notna(row.get('v2_score')):
            lead['score'] = float(row['v2_score'])
            
        # Status
        lead['enrichment_status'] = 'enriched'
        lead['source'] = 'Deep Research'
        
        leads_to_upload.append(lead)

    print(f"🎯 Prepared {len(leads_to_upload)} records for upload")
    
    # 4. Upload in Batches
    print("\n🚚 Uploading to Supabase...")
    results = db.upsert_leads_batch(leads_to_upload, batch_size=100)
    
    print("\n" + "=" * 60)
    print("🎉 UPLOAD COMPLETE")
    print(f"   ✅ Success: {results['success']}")
    print(f"   ❌ Errors: {results['errors']}")
    print("=" * 60)

if __name__ == "__main__":
    upload_leads()
