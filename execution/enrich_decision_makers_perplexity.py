"""
Decision Makers Enrichment using Perplexity AI
Since Apollo search API is restricted, use Perplexity to find decision makers
"""

import pandas as pd
import requests
import json
import time
import re

PERPLEXITY_API_KEY = "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"

def find_decision_makers_perplexity(company_name, website):
    """Use Perplexity AI to find decision makers"""
    url = "https://api.perplexity.ai/chat/completions"
    
    prompt = f"""
    Find the key decision makers at the company "{company_name}" ({website if website else 'no website'}).
    
    Return ONLY a JSON list of decision makers in this exact format:
    [
      {{"name": "Full Name", "title": "CEO", "email": "email@company.com"}},
      {{"name": "Full Name 2", "title": "Director", "email": "email2@company.com"}}
    ]
    
    Focus on:
    - CEO / Presidente / Founder
    - Commercial Director / Diretor Comercial
    - Sales Manager / Gerente de Vendas
    - Technical Director / Diretor Técnico
    
    If you can't find any, return an empty list: []
    Do not include any text besides the JSON.
    """
    
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "You are a business intelligence assistant. Return ONLY valid JSON, no other text."},
            {"role": "user", "content": prompt}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=20)
        response.raise_for_status()
        data = response.json()
        content = data['choices'][0]['message']['content'].strip()
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', content, re.DOTALL)
        if json_match:
            decision_makers = json.loads(json_match.group(0))
            return decision_makers
        return []
    except Exception as e:
        print(f"  ⚠️ Error: {e}")
        return []

def enrich_decision_makers(input_file, output_file, limit=None):
    """Enrich with decision makers using Perplexity"""
    print("👔 DECISION MAKERS ENRICHMENT - Perplexity AI")
    print("=" * 60)
    
    df = pd.read_csv(input_file)
    print(f"📊 Total companies: {len(df)}")
    
    # Add columns
    if 'decision_makers' not in df.columns:
        df['decision_makers'] = None
    if 'decision_makers_emails' not in df.columns:
        df['decision_makers_emails'] = None
    
    # Filter companies without decision makers
    to_enrich = df[
        (df['decision_makers'].isna()) | 
        (df['decision_makers'] == '')
    ]
    
    # Prioritize by score
    if 'v2_score' in df.columns:
        to_enrich = to_enrich.sort_values('v2_score', ascending=False, na_position='last')
    
    if limit:
        to_enrich = to_enrich.head(limit)
    
    print(f"🎯 Companies to enrich: {len(to_enrich)}")
    print("=" * 60)
    
    found_count = 0
    
    for idx, row in to_enrich.iterrows():
        company = row['nome_empresa']
        website = row.get('website')
        
        print(f"\n[{found_count + 1}/{len(to_enrich)}] 🔍 {company}")
        
        decision_makers = find_decision_makers_perplexity(company, website)
        
        if decision_makers:
            print(f"  ✅ Found {len(decision_makers)} decision makers:")
            
            dm_list = []
            emails_list = []
            
            for dm in decision_makers:
                name = dm.get('name', '')
                title = dm.get('title', '')
                email = dm.get('email', '')
                
                if name:
                    dm_str = f"{name} - {title}"
                    dm_list.append(dm_str)
                    print(f"     • {dm_str}")
                    
                    if email and '@' in email:
                        emails_list.append(email)
                        print(f"       📧 {email}")
            
            # Save
            if dm_list:
                df.at[idx, 'decision_makers'] = json.dumps(dm_list)
                found_count += 1
            
            if emails_list:
                df.at[idx, 'decision_makers_emails'] = json.dumps(emails_list)
                # Update main email if empty
                if pd.isna(row.get('email')) or row.get('email') == '':
                    df.at[idx, 'email'] = emails_list[0]
            
            # Checkpoint every 5
            if found_count % 5 == 0:
                df.to_csv(output_file, index=False)
                print(f"\n  💾 Checkpoint: {found_count} companies enriched")
        else:
            print(f"  ❌ No decision makers found")
        
        time.sleep(1.0)
    
    # Final save
    df.to_csv(output_file, index=False)
    
    print("\n" + "=" * 60)
    print(f"🎉 DECISION MAKERS ENRICHMENT COMPLETE!")
    print(f"   ✅ Companies enriched: {found_count}")
    print(f"   📊 Success rate: {found_count / len(to_enrich) * 100:.1f}%")
    print(f"   💾 Saved to: {output_file}")
    print("=" * 60)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv')
    parser.add_argument('--output', default='/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv')
    parser.add_argument('--limit', type=int, default=40)
    
    args = parser.parse_args()
    
    enrich_decision_makers(args.input, args.output, args.limit)
