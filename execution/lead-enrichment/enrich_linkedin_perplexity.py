#!/usr/bin/env python3
"""
LinkedIn Discovery via Perplexity + Google Search (Free)
Strategy:
1. Use Perplexity to find LinkedIn profiles of decision makers
2. Fallback to Google Search if Perplexity fails
3. Validate URLs before saving
"""

import requests
import pandas as pd
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import quote_plus

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'

# Perplexity API
PERPLEXITY_API_KEY = "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"
PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions"

HEADERS_GOOGLE = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

def query_perplexity(prompt):
    """Query Perplexity AI"""
    try:
        headers = {
            "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "sonar",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 500
        }
        
        response = requests.post(PERPLEXITY_URL, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content']
        
    except Exception as e:
        print(f"Perplexity error: {e}")
    
    return None

def extract_linkedin_urls(text):
    """Extract LinkedIn URLs from text"""
    # Pattern for LinkedIn profiles
    patterns = [
        r'https?://(?:www\.)?linkedin\.com/in/[\w-]+/?',
        r'https?://(?:www\.)?linkedin\.com/company/[\w-]+/?',
        r'linkedin\.com/in/[\w-]+',
        r'linkedin\.com/company/[\w-]+'
    ]
    
    urls = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if not match.startswith('http'):
                match = 'https://' + match
            urls.append(match)
    
    return list(set(urls))

def search_linkedin_perplexity(company_name, decision_maker=None):
    """Search for LinkedIn using Perplexity"""
    if decision_maker:
        # Search for person
        prompt = f"What is the LinkedIn profile URL for {decision_maker['name']} who is {decision_maker['title']} at {company_name}? Please provide only the LinkedIn URL."
    else:
        # Search for company
        prompt = f"What is the LinkedIn company page URL for {company_name}? Please provide only the LinkedIn URL."
    
    result = query_perplexity(prompt)
    
    if result:
        urls = extract_linkedin_urls(result)
        if urls:
            return urls[0]  # Return first URL
    
    return None

def search_linkedin_google(company_name, decision_maker=None):
    """Search for LinkedIn using Google"""
    try:
        if decision_maker:
            query = f'site:linkedin.com/in "{decision_maker["name"]}" "{company_name}"'
        else:
            query = f'site:linkedin.com/company "{company_name}"'
        
        search_url = f"https://www.google.com/search?q={quote_plus(query)}"
        
        time.sleep(1)  # Rate limit
        
        response = requests.get(search_url, headers=HEADERS_GOOGLE, timeout=10)
        
        if response.status_code == 200:
            urls = extract_linkedin_urls(response.text)
            if urls:
                return urls[0]
    
    except Exception as e:
        pass
    
    return None

def verify_linkedin_url(url):
    """Verify LinkedIn URL exists"""
    try:
        response = requests.head(url, headers=HEADERS_GOOGLE, timeout=5, allow_redirects=True)
        if response.status_code == 200:
            return url
    except:
        pass
    return None

def process_row(row):
    idx = row.name
    company = row.get('Company') or row.get('Nome Empresa')
    
    if pd.isna(company):
        return idx, None, None
    
    company_url = None
    person_url = None
    
    # 1. Try to find company LinkedIn
    # Method A: Perplexity
    company_url = search_linkedin_perplexity(company)
    
    # Method B: Google (if Perplexity failed)
    if not company_url:
        company_url = search_linkedin_google(company)
    
    # Verify company URL
    if company_url:
        company_url = verify_linkedin_url(company_url)
    
    # 2. Try to find decision maker LinkedIn (if we have DM data)
    dm_data = row.get('Decision_Makers_Deep')
    if dm_data and not pd.isna(dm_data):
        try:
            people = json.loads(dm_data)
            if people and len(people) > 0:
                # Try first high-confidence person
                for person in people:
                    if person.get('confidence') == 'high':
                        # Method A: Perplexity
                        person_url = search_linkedin_perplexity(company, person)
                        
                        # Method B: Google (if Perplexity failed)
                        if not person_url:
                            person_url = search_linkedin_google(company, person)
                        
                        # Verify person URL
                        if person_url:
                            person_url = verify_linkedin_url(person_url)
                        
                        if person_url:
                            break
                        
                        time.sleep(2)  # Rate limit between attempts
        except:
            pass
    
    return idx, company_url, person_url

def run():
    print("=== LINKEDIN DISCOVERY VIA PERPLEXITY + GOOGLE ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Create columns
    if 'LinkedIn_Company' not in df.columns:
        df['LinkedIn_Company'] = None
    if 'LinkedIn_Person' not in df.columns:
        df['LinkedIn_Person'] = None
    
    # Target leads without LinkedIn
    mask = (df['LinkedIn_Company'].isna() | (df['LinkedIn_Company'] == ''))
    target_leads = df[mask].head(100)  # Start with 100 leads
    
    print(f"Processing {len(target_leads)} leads...")
    print("Note: Using Perplexity API - this may take a while due to rate limits\n")
    
    company_found = 0
    person_found = 0
    
    for i, (idx, row) in enumerate(target_leads.iterrows()):
        company_url, person_url = process_row(row)
        
        if company_url:
            df.at[idx, 'LinkedIn_Company'] = company_url
            company_found += 1
        
        if person_url:
            df.at[idx, 'LinkedIn_Person'] = person_url
            person_found += 1
        
        if company_url or person_url:
            company = row.get('Company') or row.get('Nome Empresa')
            status = []
            if company_url:
                status.append("Company ✓")
            if person_url:
                status.append("Person ✓")
            print(f"✅ [{i+1}/{len(target_leads)}] {company}: {' | '.join(status)}")
        
        # Periodic save
        if (i + 1) % 10 == 0:
            df.to_csv(OUTPUT_FILE, index=False)
            print(f"   💾 Checkpoint. Company: {company_found}, Person: {person_found}")
        
        # Rate limit (Perplexity has limits)
        time.sleep(3)
    
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Company: {company_found}, Person: {person_found}")

if __name__ == "__main__":
    run()
