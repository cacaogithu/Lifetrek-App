"""
Advanced FREE Email Discovery
Strategy:
1. Visit Company Homepage
2. If no email, visit common contact pages (/contato, /fale-conosco, /contact)
3. Extract emails using aggressive Regex
4. Score emails to pick the best one (priority to info/contato/commercial)
"""

import requests
import pandas as pd
import re
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse
import time
import os

# Configuration
INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 50 # High concurrency for speed

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
}

COMMON_PATHS = [
    '/contato', '/contact', '/fale-conosco', '/sobre', '/about-us', '/contact-us', 
    '/quem-somos', '/atendimento', '/fale-com-a-gente'
]

EMAIL_REGEX = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

def clean_url(url):
    if not isinstance(url, str) or not url: return None
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    return url

def get_emails_from_html(html):
    emails = set()
    # Regex
    found = re.findall(EMAIL_REGEX, html)
    for email in found:
        email = email.lower()
        if not any(x in email for x in ['.png', '.jpg', '.jpeg', '.gif', 'wix', 'sentry', 'example', 'domain.com', '.svg', '.webp']):
            emails.add(email)
            
    # Mailto
    try:
        soup = BeautifulSoup(html, 'html.parser')
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.startswith('mailto:'):
                email = href.replace('mailto:', '').split('?')[0].strip().lower()
                if '@' in email:
                    emails.add(email)
    except:
        pass
        
    return emails

def scrape_company_site(url):
    all_emails = set()
    
    # 1. Homepage
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            all_emails.update(get_emails_from_html(resp.text))
            
            # If no email found, try common subpages
            if not all_emails:
                for path in COMMON_PATHS:
                    # Construct URL
                    contact_url = urljoin(url, path)
                    try:
                        resp_sub = requests.get(contact_url, headers=HEADERS, timeout=5)
                        if resp_sub.status_code == 200:
                            new_emails = get_emails_from_html(resp_sub.text)
                            if new_emails:
                                all_emails.update(new_emails)
                                break # Stop if we found something
                    except:
                        continue
    except Exception as e:
        # print(f"Error {url}: {e}")
        pass
        
    return list(all_emails)

def select_best_email(emails):
    if not emails: return None
    
    # Priority Keywords
    PRIORITY = ['comercial', 'vendas', 'contato', 'info', 'sac', 'atendimento', 'gerente', 'diretoria']
    
    for word in PRIORITY:
        for email in emails:
            if word in email:
                return email
                
    # Logic: Prefer shorter emails (less likely to be specific employee spam) or simple user names
    # Sort by length?
    return sorted(emails, key=len)[0]

def process_row(row):
    idx = row.name
    website = row.get('Website')
    
    if pd.isna(website) or str(website) == 'nan' or not website:
        return idx, None, "No Website"
        
    url = clean_url(website)
    emails = scrape_company_site(url)
    best_email = select_best_email(emails)
    
    status = "Found" if best_email else "Not Found"
    return idx, best_email, status

def run():
    print("=== ADVANCED FREE EMAIL DISCOVERY ===")
    
    if not os.path.exists(INPUT_FILE):
        print(f"File not found: {INPUT_FILE}")
        return

    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Identify target rows: No email present
    # Check if 'Email' column exists or 'Scraped_Emails'
    email_col = 'Scraped_Emails'
    if email_col not in df.columns:
        df[email_col] = None
        
    # Mask: empty or NaN
    mask = df[email_col].isna() | (df[email_col] == '')
    target_leads = df[mask]
    
    print(f"Processing {len(target_leads)} leads without emails...")
    
    found_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row.name for _, row in target_leads.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, email, status = future.result()
            
            if email:
                df.at[idx, email_col] = email
                company = df.at[idx, 'Company'] if 'Company' in df.columns else 'Unknown'
                print(f"✅ [{i+1}/{len(target_leads)}] {company}: {email}")
                found_count += 1
            else:
                pass 
                # print(f"❌ [{i+1}/{len(target_leads)}] {status}")
                
            # Intermittent Save
            if i > 0 and i % 100 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"   💾 Checkpoint saved. Total found so far: {found_count}")

    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Found {found_count} new emails (Free).")
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    run()
