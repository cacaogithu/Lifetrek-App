import pandas as pd
import requests
import json
import time
import os

# Configuration
API_KEY = "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"
INPUT_FILE = "../../.tmp/MASTER_ENRICHED_LEADS.csv"
OUTPUT_FILE = "../../.tmp/MASTER_ENRICHED_LEADS.csv"
MODEL = "sonar"

def query_perplexity(company_name, website):
    url = "https://api.perplexity.ai/chat/completions"
    
    prompt = f"""
    Research the company "{company_name}" ({website}).
    Return a JSON object with the following fields:
    - "segment": Specific industry segment (e.g., "Dental Implants", "Orthopedic Devices", "Hospital Equipment").
    - "city": Headquarters city in Brazil.
    - "state": Headquarters state in Brazil (2-letter code, e.g., SP, RJ).
    - "decision_makers": A list of key decision makers (CEO, Director, Manager) with their names and job titles. Format: "Name - Title".
    - "notes": A brief 1-sentence description of what they do.
    
    If you cannot find specific info, return null for that field.
    Your response MUST be a valid JSON object. Do not include any introductory text or markdown formatting. Start with {{ and end with }}.
    """

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful research assistant. You answer ONLY in valid JSON format."
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

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        content = data['choices'][0]['message']['content']
        
        # Parse JSON more robustly
        import re
        json_match = re.search(r'(\{.*\})', content, re.DOTALL)
        if json_match:
            content = json_match.group(1)
            
        return json.loads(content)
    except Exception as e:
        print(f"Error querying {company_name}: {e}")
        if 'response' in locals():
            print(f"Response content: {response.text}")
        return None

import argparse

def enrich_leads():
    parser = argparse.ArgumentParser(description='Enrich leads using Perplexity API.')
    parser.add_argument('--limit', type=int, help='Number of leads to process', default=None)
    parser.add_argument('--input', type=str, help='Input CSV file path', default=INPUT_FILE)
    args = parser.parse_args()

    input_file = args.input
    print(f"Loading {input_file}...")
    try:
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        print(f"File {input_file} not found.")
        return

    # Create columns if they don't exist
    cols_to_add = ['Perplexity_Segment', 'Perplexity_City', 'Perplexity_State', 'Perplexity_Decision_Makers', 'Perplexity_Notes']
    for col in cols_to_add:
        if col not in df.columns:
            df[col] = None

    print("Starting enrichment...")
    
    # Iterate through rows
    # We'll process rows where 'Perplexity_Segment' is empty/NaN to allow resuming
    total_processed = 0
    
    for index, row in df.iterrows():
        # Check limit
        if args.limit and total_processed >= args.limit:
            print(f"Reached limit of {args.limit} records.")
            break
            
        # Skip if already enriched (checking Perplexity_Segment)
        if pd.notna(row['Perplexity_Segment']):
            continue
            
        if 'Company' in row:
             company = row['Company']
        else:
             company = row['Nome Empresa']
             
        # Website
        if 'Website' in row:
             website = row['Website']
        else:
             website = row.get('website', '')
        
        # Skip if no company name
        if pd.isna(company):
            continue
            
        print(f"Enriching: {company}...")
        
        result = query_perplexity(company, website)
        
        if result:
            df.at[index, 'Perplexity_Segment'] = result.get('segment')
            df.at[index, 'Perplexity_City'] = result.get('city')
            df.at[index, 'Perplexity_State'] = result.get('state')
            df.at[index, 'Perplexity_Notes'] = result.get('notes')
            
            dms = result.get('decision_makers')
            if isinstance(dms, list):
                df.at[index, 'Perplexity_Decision_Makers'] = "; ".join(dms)
            elif isinstance(dms, str):
                 df.at[index, 'Perplexity_Decision_Makers'] = dms
                 
            # Also fill the main columns if they are empty
            # Also fill the main columns if they are empty
            # Map legacy -> new names
            col_map = {
                'Segmento': 'Segment',
                'Cidade': 'City',
                'Estado': 'State',
                'Decision_Makers': 'Decision_Maker'
            }
            
            # Segment
            seg_col = 'Segmento' if 'Segmento' in df.columns else 'Segment'
            if seg_col in df.columns and pd.isna(row.get(seg_col)) and result.get('segment'):
                 df.at[index, seg_col] = result.get('segment')

            # City
            city_col = 'Cidade' if 'Cidade' in df.columns else 'City'
            if city_col in df.columns and pd.isna(row.get(city_col)) and result.get('city'):
                 df.at[index, city_col] = result.get('city')

            # State
            state_col = 'Estado' if 'Estado' in df.columns else 'State'
            if state_col in df.columns and pd.isna(row.get(state_col)) and result.get('state'):
                 df.at[index, state_col] = result.get('state')
                 
            # Decision Makers
            dm_col = 'Decision_Makers' if 'Decision_Makers' in df.columns else 'Decision_Maker'
            if dm_col in df.columns and pd.isna(row.get(dm_col)) and result.get('decision_makers'):
                 if isinstance(dms, list):
                     df.at[index, dm_col] = "; ".join(dms)
                 elif isinstance(dms, str):
                     df.at[index, dm_col] = dms

            print(f"  -> Found: {result.get('city')}, {result.get('state')} | {result.get('segment')}")
        else:
            print("  -> No result found.")
            df.at[index, 'Perplexity_Segment'] = "Not Found" # Mark as processed

        total_processed += 1
        
        # Save every 5 rows to be safe
        if total_processed % 5 == 0:
            df.to_csv(OUTPUT_FILE, index=False)
            print(f"Saved progress ({total_processed} processed)")
            
        # Rate limit to be nice
        time.sleep(1)

    # Final save
    df.to_csv(OUTPUT_FILE, index=False)
    print("Enrichment complete. Saved to CSV.")

if __name__ == "__main__":
    enrich_leads()
