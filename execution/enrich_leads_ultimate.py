"""
Ultimate Deep Research Enrichment Script
Combines Perplexity AI, Apify, and Advanced Scraping to find emails and contact info.
"""

import pandas as pd
import requests
import json
import time
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

# API Keys
PERPLEXITY_API_KEY = "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"
APIFY_API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"

def search_email_perplexity(company, website):
    """Deep search using Perplexity"""
    url = "https://api.perplexity.ai/chat/completions"
    
    prompt = f"""
    Conduct a deep search to find the contact email for "{company}" ({website}).
    Look for:
    1. Direct contact emails (contato@, sales@, info@)
    2. Decision maker emails (CEO, Director) if public
    3. Emails buried in privacy policies or terms
    
    Return ONLY a valid email address. If none found, return "NOT_FOUND".
    """
    
    payload = {
        "model": "sonar-pro", # Using stronger model for deep research
        "messages": [
            {"role": "system", "content": "Return only the email address or NOT_FOUND."},
            {"role": "user", "content": prompt}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        data = response.json()
        content = data['choices'][0]['message']['content'].strip()
        
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
        if email_match:
            email = email_match.group(0).lower()
            if not any(x in email for x in ['example', 'test', 'domain', 'email']):
                return email
    except:
        pass
    return None

def search_google_apify(company):
    """Use Apify Google Search Scraper to find contact pages/emails"""
    url = "https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items"
    
    query = f"{company} email contato sales contact"
    
    payload = {
        "queries": [query],
        "maxItemsPerQuery": 3,
        "languageCode": "pt",
        "mobileResults": False
    }
    
    headers = {
        "Authorization": f"Bearer {APIFY_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        data = response.json()
        
        # Look for emails in snippets and descriptions
        full_text = str(data)
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', full_text)
        
        valid_emails = []
        for email in emails:
            email = email.lower()
            if not any(x in email for x in ['.png', '.jpg', 'wix', 'sentry', 'example', 'google']):
                valid_emails.append(email)
        
        if valid_emails:
            # Prioritize standard business emails
            for prio in ['contato', 'comercial', 'vendas', 'sac', 'adm']:
                for email in valid_emails:
                    if prio in email:
                        return email
            return valid_emails[0]
            
    except Exception as e:
        print(f"Apify error: {e}")
        pass
    return None

def enrich_company(row):
    idx = row.name
    company = row['nome_empresa']
    website = row.get('website', '')
    
    print(f"Processing: {company}")
    
    # 1. Try Perplexity (Deep)
    email = search_email_perplexity(company, website)
    
    # 2. If valid email not found, try Apify Google Search
    if not email:
        # print(f"  > Perplexity failed, trying Apify Google Search for {company}...")
        email = search_google_apify(company)
    
    if email:
        print(f"✅ FOUND: {email} for {company}")
        return idx, email
    else:
        print(f"❌ FAILED: {company}")
        return idx, None

def run_ultimate_enrichment(limit=None):
    input_file = '/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv'
    df = pd.read_csv(input_file)
    
    if 'email' not in df.columns:
        df['email'] = None
        
    # Filter missing
    missing = df[df['email'].isna() | (df['email'] == '')]
    
    if limit:
        missing = missing.head(limit)
        
    print(f"🚀 Starting Deep Research on {len(missing)} companies...")
    
    results = []
    
    # Run in parallel threads (be careful with rate limits)
    # Perplexity is fast, Apify takes time. 
    # Let's do 5 workers to be safe.
    
    counter = 0
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(enrich_company, row): row.name for _, row in missing.iterrows()}
        
        for future in as_completed(futures):
            idx, email = future.result()
            if email:
                df.at[idx, 'email'] = email
                counter += 1
            
            # Save every 5 successes
            if counter > 0 and counter % 5 == 0:
                df.to_csv(input_file, index=False)
                print(f"💾 Checkpoint saved ({counter} found)")

    df.to_csv(input_file, index=False)
    print(f"🏁 Finished. Found {counter} new emails.")

if __name__ == "__main__":
    import sys
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 50
    run_ultimate_enrichment(limit)
