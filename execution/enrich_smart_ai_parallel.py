import pandas as pd
import requests
import json
import time
import re
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
API_KEY = "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"
INPUT_FILE = "/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv"
OUTPUT_FILE = "/Users/rafaelalmeida/lifetrek-mirror/ai_delta.csv" 
MODEL = "sonar"
MAX_WORKERS = 4 # Increased for parallelism since it writes to separate file

def query_perplexity(company_name, city=None, website=None):
    url = "https://api.perplexity.ai/chat/completions"
    
    location_context = f"in {city}, Brazil" if city else "in Brazil"
    
    prompt = f"""
    Find the key decision makers (CEO, Owner, Director, Manager) for the company "{company_name}" located {location_context}.
    Website: {website if website else 'N/A'}
    
    Return a JSON object with:
    - "decision_makers": List of strings in format "Name - Job Title". Focus on the most senior person.
    - "linkedin_company_url": The LinkedIn Company Page URL (if found).
    - "confidence": "high", "medium", or "low".
    
    If no specific person is found, return empty list for decision_makers.
    Return ONLY JSON.
    """

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful research assistant. Return ONLY valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    max_retries = 3
    base_delay = 2
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 429:
                delay = base_delay * (2 ** attempt)
                print(f"   ⚠️ Rate Limit (429). Retrying in {delay}s...")
                time.sleep(delay)
                continue
                
            response.raise_for_status()
            data = response.json()
            content = data['choices'][0]['message']['content']
            
            # Clean markdown
            content = re.sub(r'```json\s*', '', content)
            content = re.sub(r'```', '', content)
            
            try:
                return json.loads(content)
            except:
                return None
                
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"Error querying {company_name}: {e}")
            time.sleep(1)
            
    return None

def process_row(index, row):
    company = row.get('Nome Empresa') or row.get('Company')
    city = row.get('City') or row.get('Cidade')
    website = row.get('Website')
    
    if not company or pd.isna(company):
        return index, None
        
    print(f"[{index}] Enriching: {company}")
    result = query_perplexity(company, city, website)
    time.sleep(0.5) 
    return index, result

def run_smart_enrichment_parallel():
    print("=== SMART AI ENRICHMENT (PARALLEL) ===")
    
    try:
        df = pd.read_csv(INPUT_FILE)
    except:
        print("Input file not found")
        return
        
    print(f"Loaded {len(df)} leads.")
    
    # Ensure Score column is numeric
    if 'V2_Score' in df.columns:
        df['V2_Score'] = pd.to_numeric(df['V2_Score'], errors='coerce').fillna(0)
    else:
        df['V2_Score'] = 0
        
    if 'Decision_Maker' not in df.columns:
        df['Decision_Maker'] = None
        
    # LOGIC:
    # We want to process leads meant for AI (Missing DM)
    # We prioritize Score
    missing_dm = df['Decision_Maker'].isna() | (df['Decision_Maker'] == '')
    
    # Take next 300 best leads
    targets = df[missing_dm].sort_values('V2_Score', ascending=False).head(300)
    
    print(f"Found {len(targets)} Targets for Parallel Execution.")
    
    # Initialize Delta DF
    # We only store columns we change: ID (Index), Decision_Maker, LinkedIn_Company
    delta_rows = []
    
    processed_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, idx, row): idx for idx, row in targets.iterrows()}
        
        for future in as_completed(futures):
            idx = futures[future]
            try:
                idx, res = future.result()
            except Exception as e:
                print(f"Err {idx}: {e}")
                res = None
                
            processed_count += 1
            
            if res:
                dms = res.get('decision_makers', [])
                li_company = res.get('linkedin_company_url')
                
                dm_val = None
                li_val = None
                
                updates = []
                if dms and len(dms) > 0:
                    dm_val = "; ".join(dms[:2])
                    updates.append("DM")
                    
                if li_company and 'linkedin.com' in str(li_company):
                     li_val = li_company
                     updates.append("LI")
                
                if updates:
                    print(f"   ✅ Found [{idx}]: {', '.join(updates)}")
                    delta_rows.append({
                        'index': idx,
                        'Decision_Maker': dm_val,
                        'LinkedIn_Company': li_val
                    })
            
            if processed_count % 10 == 0:
                # Save Delta
                pd.DataFrame(delta_rows).to_csv(OUTPUT_FILE, index=False)
                print(f"💾 Checkpoint. Delta rows: {len(delta_rows)}")

    pd.DataFrame(delta_rows).to_csv(OUTPUT_FILE, index=False)
    print(f"🎉 Parallel Done. Generated {len(delta_rows)} updates in {OUTPUT_FILE}.")

if __name__ == "__main__":
    run_smart_enrichment_parallel()
