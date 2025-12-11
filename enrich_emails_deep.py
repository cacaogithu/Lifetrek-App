#!/usr/bin/env python3
"""
Enhanced Email Scraper (Deep Mode)
Improvements:
1. Check more page types (footer, header, about, team)
2. Parse JSON-LD structured data
3. Try common email patterns
4. Extract from mailto: links
"""

import requests
import pandas as pd
import re
import json
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 30

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

CONTACT_PATHS = [
    '/contato', '/fale-conosco', '/contact', '/contact-us', '/atendimento',
    '/sobre', '/quem-somos', '/about', '/about-us', '/equipe', '/team'
]

# Common email patterns to try
COMMON_PATTERNS = [
    'contato@', 'vendas@', 'comercial@', 'sac@', 'atendimento@',
    'info@', 'contact@', 'sales@', 'hello@'
]

# Email regex
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

def extract_domain(url):
    """Extract domain from URL"""
    domain = url.replace('https://', '').replace('http://', '').split('/')[0]
    return domain

def extract_emails_from_text(text):
    """Extract emails from text"""
    emails = EMAIL_REGEX.findall(text)
    
    # Filter out common noise
    noise = ['example.com', 'domain.com', 'email.com', 'yoursite.com', 'seusite.com']
    emails = [e for e in emails if not any(n in e.lower() for n in noise)]
    
    return list(set(emails))

def extract_emails_from_json_ld(soup):
    """Extract emails from JSON-LD structured data"""
    emails = []
    
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string)
            
            # Check for email in various JSON-LD properties
            if isinstance(data, dict):
                if 'email' in data:
                    emails.append(data['email'])
                if 'contactPoint' in data and isinstance(data['contactPoint'], dict):
                    if 'email' in data['contactPoint']:
                        emails.append(data['contactPoint']['email'])
        except:
            pass
    
    return emails

def score_email(email, domain):
    """Score email quality (higher = better)"""
    score = 0
    
    # Prefer emails from same domain
    if domain in email:
        score += 10
    
    # Prefer business emails
    business_keywords = ['contato', 'vendas', 'comercial', 'sac', 'atendimento', 'info', 'contact', 'sales']
    if any(kw in email.lower() for kw in business_keywords):
        score += 5
    
    # Penalize personal/generic emails
    personal = ['gmail', 'hotmail', 'yahoo', 'outlook', 'admin', 'webmaster', 'noreply']
    if any(p in email.lower() for p in personal):
        score -= 5
    
    return score

def scrape_emails_deep(url):
    """Deep email scraping"""
    all_emails = []
    domain = extract_domain(url)
    
    try:
        # 1. Homepage
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            # Extract from text
            text = soup.get_text('\n')
            all_emails.extend(extract_emails_from_text(text))
            
            # Extract from JSON-LD
            all_emails.extend(extract_emails_from_json_ld(soup))
            
            # Extract from mailto links
            for link in soup.find_all('a', href=True):
                if link['href'].startswith('mailto:'):
                    email = link['href'].replace('mailto:', '').split('?')[0]
                    all_emails.append(email)
            
            # 2. Try contact pages
            for link in soup.find_all('a', href=True):
                href = link['href']
                if any(path in href.lower() for path in CONTACT_PATHS):
                    full_url = urljoin(url, href)
                    try:
                        sub_resp = requests.get(full_url, headers=HEADERS, timeout=10)
                        if sub_resp.status_code == 200:
                            sub_soup = BeautifulSoup(sub_resp.text, 'html.parser')
                            sub_text = sub_soup.get_text('\n')
                            all_emails.extend(extract_emails_from_text(sub_text))
                            all_emails.extend(extract_emails_from_json_ld(sub_soup))
                    except:
                        pass
                    break
        
        # 3. Try common email patterns
        if not all_emails:
            for pattern in COMMON_PATTERNS:
                test_email = pattern + domain
                all_emails.append(test_email)
    
    except:
        pass
    
    # Deduplicate and score
    all_emails = list(set(all_emails))
    
    if all_emails:
        # Score and sort
        scored = [(email, score_email(email, domain)) for email in all_emails]
        scored.sort(key=lambda x: x[1], reverse=True)
        
        # Return best email
        return scored[0][0]
    
    return None

def clean_url(url):
    if not isinstance(url, str) or not url:
        return None
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    return url

def process_row(row):
    idx = row.name
    website = row.get('Website')
    
    if pd.isna(website) or not website:
        return idx, None
    
    url = clean_url(website)
    email = scrape_emails_deep(url)
    
    return idx, email

def run():
    print("=== DEEP EMAIL DISCOVERY ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    if 'Email' not in df.columns:
        df['Email'] = None
    
    # Target leads without email
    mask = df['Email'].isna() | (df['Email'] == '')
    target_leads = df[mask]
    
    print(f"Processing {len(target_leads)} leads without email...")
    
    found_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row.name for _, row in target_leads.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, email = future.result()
            
            if email:
                df.at[idx, 'Email'] = email
                company = df.at[idx, 'Company'] if 'Company' in df.columns else df.at[idx, 'Nome Empresa']
                print(f"✅ [{i+1}/{len(target_leads)}] {company}: {email}")
                found_count += 1
            
            if i > 0 and i % 50 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"   💾 Checkpoint. Found: {found_count}")
    
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Found {found_count} emails.")

if __name__ == "__main__":
    run()
