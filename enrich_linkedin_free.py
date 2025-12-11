#!/usr/bin/env python3
"""
LinkedIn Profile Scraper (Free)
Builds LinkedIn company URLs from company names
Searches for decision maker LinkedIn profiles
"""

import requests
import pandas as pd
import re
import json
from urllib.parse import quote_plus
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 10  # Lower to avoid rate limiting

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def slugify(text):
    """Convert company name to LinkedIn slug"""
    # Remove special chars, lowercase, replace spaces with hyphens
    slug = text.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    return slug

def build_linkedin_company_url(company_name):
    """Build LinkedIn company URL from name"""
    slug = slugify(company_name)
    return f"https://www.linkedin.com/company/{slug}"

def verify_linkedin_url(url):
    """Check if LinkedIn URL exists (returns 200)"""
    try:
        resp = requests.head(url, headers=HEADERS, timeout=5, allow_redirects=True)
        if resp.status_code == 200:
            return url
    except:
        pass
    return None

def search_person_linkedin(name, company):
    """Search for person's LinkedIn profile using Google"""
    # Build Google search query
    query = f'site:linkedin.com/in "{name}" "{company}"'
    search_url = f"https://www.google.com/search?q={quote_plus(query)}"
    
    try:
        resp = requests.get(search_url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            # Extract first linkedin.com/in/ URL from results
            matches = re.findall(r'https://[a-z]{2,3}\.linkedin\.com/in/[\w-]+', resp.text)
            if matches:
                return matches[0]
    except:
        pass
    
    return None

def process_row(row):
    idx = row.name
    company = row.get('Company') or row.get('Nome Empresa')
    
    if pd.isna(company) or not company:
        return idx, None, None
    
    # 1. Build company LinkedIn URL
    company_url = build_linkedin_company_url(company)
    verified_company_url = verify_linkedin_url(company_url)
    
    # 2. Search for decision maker LinkedIn (if we have DM data)
    person_url = None
    dm_data = row.get('Decision_Makers_Deep')
    if dm_data and not pd.isna(dm_data):
        try:
            people = json.loads(dm_data)
            if people and len(people) > 0:
                # Search for first high-confidence person
                for person in people:
                    if person.get('confidence') == 'high':
                        name = person.get('name')
                        if name:
                            person_url = search_person_linkedin(name, company)
                            if person_url:
                                break
                        time.sleep(1)  # Rate limit Google searches
        except:
            pass
    
    return idx, verified_company_url, person_url

def run():
    print("=== FREE LINKEDIN DISCOVERY ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Create LinkedIn columns
    if 'LinkedIn_Company' not in df.columns:
        df['LinkedIn_Company'] = None
    if 'LinkedIn_Person' not in df.columns:
        df['LinkedIn_Person'] = None
    
    # Target leads without LinkedIn data
    mask = (df['LinkedIn_Company'].isna() | (df['LinkedIn_Company'] == ''))
    target_leads = df[mask]
    
    print(f"Processing {len(target_leads)} leads...")
    
    company_found = 0
    person_found = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row.name for _, row in target_leads.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, company_url, person_url = future.result()
            
            if company_url:
                df.at[idx, 'LinkedIn_Company'] = company_url
                company_found += 1
            
            if person_url:
                df.at[idx, 'LinkedIn_Person'] = person_url
                person_found += 1
            
            if company_url or person_url:
                company = df.at[idx, 'Company'] if 'Company' in df.columns else df.at[idx, 'Nome Empresa']
                status = []
                if company_url:
                    status.append("Company ✓")
                if person_url:
                    status.append("Person ✓")
                print(f"✅ [{i+1}/{len(target_leads)}] {company}: {' | '.join(status)}")
            
            # Periodic save
            if i > 0 and i % 50 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"   💾 Checkpoint. Company: {company_found}, Person: {person_found}")
    
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Company: {company_found}, Person: {person_found}")

if __name__ == "__main__":
    run()
