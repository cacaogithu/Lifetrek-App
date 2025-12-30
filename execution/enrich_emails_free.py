"""
Free Email Scraper
Scrapes company websites for email addresses using Regex and Mailto links.
Target: Companies dealing with medical implants/products.
"""

import requests
import pandas as pd
import re
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

# Regex for email
EMAIL_REGEX = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

# Headers to avoid 403
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
}

def clean_url(url):
    if not isinstance(url, str): return None
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    return url

def scrape_emails_from_url(url):
    found_emails = set()
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            # 1. Regex Search in Text
            text_emails = re.findall(EMAIL_REGEX, resp.text)
            for email in text_emails:
                if not any(x in email.lower() for x in ['.png', '.jpg', '.jpeg', '.gif', 'wix', 'sentry', 'example']):
                    found_emails.add(email.lower())
            
            # 2. Mailto Links
            soup = BeautifulSoup(resp.text, 'html.parser')
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.startswith('mailto:'):
                    email = href.replace('mailto:', '').split('?')[0].strip()
                    if '@' in email:
                        found_emails.add(email.lower())
                        
    except Exception as e:
        # print(f"Error scraping {url}: {e}")
        pass
        
    return list(found_emails)

def process_company(row):
    idx = row.name
    website = row['Website']
    company = row['Nome Empresa']
    
    url = clean_url(website)
    if not url: return idx, None
    
    # print(f"Scraping {company} ({url})...")
    emails = scrape_emails_from_url(url)
    
    # Heuristic for best email
    best_email = None
    if emails:
        # Priority: info, contato, vendas, comercial
        priorities = ['contato', 'comercial', 'vendas', 'info', 'sac', 'atendimento']
        
        # Sort emails by priority
        for prio in priorities:
            for email in emails:
                if prio in email:
                    best_email = email
                    break
            if best_email: break
            
        if not best_email:
            best_email = emails[0] # Fallback to first
            
    return idx, best_email

def run_free_enrichment():
    print("=== FREE EMAIL ENRICHMENT (WEBSITE SCRAPER) ===")
    
    df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')
    print(f"Total Companies: {len(df)}")
    
    # Filter missing emails
    missing_mask = df['Scraped_Emails'].isna() | (df['Scraped_Emails'] == '')
    to_process = df[missing_mask]
    
    print(f"Companies missing emails: {len(to_process)}")
    
    results_found = 0
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(process_company, row): row.name for _, row in to_process.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, email = future.result()
            if email:
                df.at[idx, 'Scraped_Emails'] = email
                results_found += 1
                print(f"✅ Found: {email} for {df.at[idx, 'Nome Empresa']}")
            
            if i % 10 == 0:
                print(f"Progress: {i}/{len(to_process)}")
                
    print(f"🎉 Enrichment Complete. Found {results_found} new emails.")
    df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)

if __name__ == "__main__":
    run_free_enrichment()
