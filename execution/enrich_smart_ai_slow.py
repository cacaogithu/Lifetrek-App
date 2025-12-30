import pandas as pd
import requests
import json
import time
import re
import random
import os

# Configuration
API_KEY = "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"
INPUT_FILE = "/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv"
DELTA_FILE = "/Users/rafaelalmeida/lifetrek-mirror/delta_ai.csv"
MODEL = "sonar"

def query_perplexity(company_name, city=None, website=None):
    url = "https://api.perplexity.ai/chat/completions"
    location_context = f"in {city}, Brazil" if city else "in Brazil"
    prompt = f"""
    Find the key decision makers (CEO, Owner, Director, Manager) for the company "{company_name}" located {location_context}.
    Website: {website if website else 'N/A'}
    Return a JSON object with:
    - "decision_makers": List of strings in format "Name - Job Title". Focus on the most senior person.
    - "linkedin_company_url": The LinkedIn Company Page URL (if found).
    Return ONLY JSON.
    """
    payload = {
        "model": MODEL,
        "messages": [
            { "role": "system", "content": "You are a helpful research assistant. Return ONLY valid JSON." },
            { "role": "user", "content": prompt }
        ]
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    max_retries = 5
    base_delay = 10
    
    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=40)
            if response.status_code == 429:
                delay = base_delay * (2 ** attempt) + random.randint(1, 5)
                print(f"   ⚠️ 429. Sleeping {delay}s...")
                time.sleep(delay)
                continue
            response.raise_for_status()
            content = response.json()['choices'][0]['message']['content']
            content = re.sub(r'```json\s*', '', content)
            content = re.sub(r'```', '', content)
            try: return json.loads(content)
            except: return None
        except Exception as e:
            time.sleep(5)
    return None

def append_delta(idx, dm, li):
    file_exists = os.path.isfile(DELTA_FILE)
    df = pd.DataFrame([{ 'index': idx, 'Decision_Maker': dm, 'LinkedIn_Company': li }])
    df.to_csv(DELTA_FILE, mode='a', header=not file_exists, index=False)

def run_slow_mode():
    print("=== SLOW MODE AI ENRICHMENT (DELTA) STARTED ===")
    try: df = pd.read_csv(INPUT_FILE)
    except: return

    if 'V2_Score' in df.columns: df['V2_Score'] = pd.to_numeric(df['V2_Score'], errors='coerce').fillna(0)
    else: df['V2_Score'] = 0
    if 'Decision_Maker' not in df.columns: df['Decision_Maker'] = None
    
    # Target: Missing DM
    mask = df['Decision_Maker'].isna() | (df['Decision_Maker'] == '')
    targets = df[mask].sort_values('V2_Score', ascending=False)
    
    print(f"Queue: {len(targets)} companies.")
    
    for idx, row in targets.iterrows():
        company = row.get('Nome Empresa') or row.get('Company')
        city = row.get('City') or row.get('Cidade')
        website = row.get('Website')
        
        if not company or pd.isna(company): continue
            
        print(f"[AI] {company}...", end=" ", flush=True)
        
        start_t = time.time()
        res = query_perplexity(company, city, website)
        elapsed = time.time() - start_t
        
        dm_val = None
        li_val = None
        
        if res:
            dms = res.get('decision_makers', [])
            li_company = res.get('linkedin_company_url')
            if dms: dm_val = "; ".join(dms[:2])
            if li_company and 'linkedin.com' in str(li_company): li_val = li_company
        
        if dm_val or li_val:
            print(f"✅ Found: {dm_val[:20] if dm_val else ''}...")
            append_delta(idx, dm_val, li_val)
        else:
            print("❌")
            
        wait_time = max(5 - elapsed, 1)
        time.sleep(wait_time)

if __name__ == "__main__":
    run_slow_mode()
