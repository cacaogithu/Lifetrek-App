#!/usr/bin/env python3
"""
Enrich Company Data using Perplexity (Intelligence Layer)
--------------------------------------------------------
Step 3 of the Advanced Scraper Architecture.
1. Reads enriched leads (with Scraped Tags).
2. Asks Perplexity for Decision Maker and Contact Priority.
3. Updates Master CSV.
"""

import os
import sys
import pandas as pd
import requests
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

if not PERPLEXITY_API_KEY:
    print("❌ ERROR: PERPLEXITY_API_KEY not found in .env")
    sys.exit(1)

INPUT_FILE = "../../.tmp/MASTER_ENRICHED_LEADS.csv"

def get_batches(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def query_perplexity(company_name, website):
    url = "https://api.perplexity.ai/chat/completions"
    
    prompt = f"""
    Research the US-based company "{company_name}" ({website}).
    
    I am selling a B2B service (Lead Gen / Insurance Product) to them.
    
    1. **Exact Niche**: What specific type of agency are they? (e.g. "Medicare FMO", "B2B SaaS Lead Gen", "General Marketing").
    2. **Decision Maker**: Who is the Owner, Founder, or CEO? Return ONLY "Name - Title".
    3. **Priority**: Rate 1-10 (10 = Perfect fit for outbound sales partnership).
    
    Return pure JSON: {{ "niche": "...", "dm": "...", "priority": 8, "reason": "..." }}
    """
    
    payload = {
        "model": "sonar-pro",
        "messages": [
            {"role": "system", "content": "You are a B2B Sales Analyst. Return JSON only."},
            {"role": "user", "content": prompt}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content']
            # Clean md blocks
            content = content.replace('```json', '').replace('```', '')
            return json.loads(content)
        else:
            print(f"   ⚠️ Perplexity Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"   ⚠️ Request Failed: {e}")
    
    return None

def run_perplexity_enrichment(input_csv=INPUT_FILE):
    if not os.path.exists(input_csv):
        print(f"❌ Input file not found: {input_csv}")
        return

    print(f"🧠 Starting Perplexity Intelligence on {input_csv}...")
    df = pd.read_csv(input_csv)

    # Ensure columns
    for col in ['Perplexity_Niche', 'Perplexity_DM', 'Perplexity_Priority', 'Perplexity_Reason']:
        if col not in df.columns:
            df[col] = None

    # Filter: Has Website, Has Tags (from Apify) or just Has Website, BUT missing Perplexity info
    mask = (
        df['Website'].notna() &
        (df['Perplexity_DM'].isna()) &
        (df['Website'] != '')
    )
    
    to_process = df[mask].copy()
    print(f"ℹ️  Found {len(to_process)} leads needing Intelligence.")

    if len(to_process) == 0:
        print("✅ No leads to process.")
        return

    # Limit for safety/cost (Optional: Remove limit for full run)
    MAX_RUNS = 50 
    print(f"   ⚠️ Limiting to {MAX_RUNS} runs for this session cost control.")
    to_process = to_process.head(MAX_RUNS)

    count = 0
    for idx, row in to_process.iterrows():
        count += 1
        company = row['Company']
        website = row['Website']
        
        print(f"   [{count}/{len(to_process)}] Analyzing: {company}...")
        
        data = query_perplexity(company, website)
        
        if data:
            df.at[idx, 'Perplexity_Niche'] = data.get('niche')
            df.at[idx, 'Perplexity_DM'] = data.get('dm')
            df.at[idx, 'Perplexity_Priority'] = data.get('priority')
            df.at[idx, 'Perplexity_Reason'] = data.get('reason')
            print(f"      ✅ Found DM: {data.get('dm')} | Prio: {data.get('priority')}")
        
        # Save every 5
        if count % 5 == 0:
            df.to_csv(input_csv, index=False)
        
        time.sleep(1) # Rate limit nice

    df.to_csv(input_csv, index=False)
    print("✅ Perplexity Enrichment Complete.")

if __name__ == "__main__":
    target_file = sys.argv[1] if len(sys.argv) > 1 else INPUT_FILE
    run_perplexity_enrichment(target_file)
