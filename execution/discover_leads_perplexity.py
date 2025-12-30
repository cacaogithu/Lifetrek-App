"""
Discover Niche Leads using Perplexity AI
Uses the 'sonar' model to generate lists of companies based on qualitative descriptions.
"""

import requests
import pandas as pd
import json
import time

API_KEY = "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"
OUTPUT_FILE = "new_leads_perplexity_discovery.csv"
MODEL = "sonar"

# Niche Prompts to discover "Hidden Gems"
SEGMENTS = [
    "Top 20 innovative healthtech startups in Santa Catarina",
    "List of 20 high-end aesthetic clinics in Jardins, Sao Paulo",
    "List of 15 medical device simulators manufacturers in Brazil",
    "Top 10 dental implant distributors in Northeast Brazil",
    "List of 20 boutique dermatology clinics in Leblon, Rio de Janeiro",
    "List of 15 exporters of surgical instruments from Brazil",
    "Top 10 telemedicine platform providers in Brazil"
]

def query_perplexity_for_list(query):
    url = "https://api.perplexity.ai/chat/completions"
    
    prompt = f"""
    {query}
    
    For each company found, return a JSON object in a list.
    Each object must have:
    - "name": Company Name
    - "city": City
    - "website": Website URL (if found)
    - "segment": Brief segment description
    
    Your response MUST be a valid JSON list. Do not include introductory text.
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
        
        # Clean markdown if present
        content = content.replace('```json', '').replace('```', '')
        
        return json.loads(content)
    except Exception as e:
        print(f"Error querying {query}: {e}")
        return []

def main():
    print("=== PERPLEXITY LEAD DISCOVERY ===")
    all_leads = []
    
    for segment_query in SEGMENTS:
        print(f"🔎 Researching: {segment_query}...")
        results = query_perplexity_for_list(segment_query)
        
        if results:
            print(f"   + Found {len(results)} companies")
            for company in results:
                company['Source'] = 'Perplexity Discovery'
                company['Search_Query'] = segment_query
                all_leads.append(company)
        else:
            print("   - No results or error.")
            
        time.sleep(1) # Be polite
        
    # Save
    if all_leads:
        df = pd.DataFrame(all_leads)
        # Rename columns to match Master
        df = df.rename(columns={
            'name': 'Nome Empresa',
            'city': 'City',
            'website': 'Website',
            'segment': 'Segment'
        })
        
        df.to_csv(OUTPUT_FILE, index=False)
        print(f"\n✅ Validated {len(df)} leads. Saved to {OUTPUT_FILE}")
    else:
        print("\n⚠️ No leads generated.")

if __name__ == "__main__":
    main()
