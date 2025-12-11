#!/usr/bin/env python3
"""
Enhanced Phone Scraper with Google Search Fallback
Strategy:
1. Try website scraping first (existing method)
2. If not found, search Google for "company name telefone"
3. Extract from Google results snippets
"""

import requests
import pandas as pd
import re
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, quote_plus
import time

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 20

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

CONTACT_PATHS = [
    '/contato', '/fale-conosco', '/contact', '/contact-us', '/atendimento',
    '/sobre', '/quem-somos', '/about'
]

# Brazilian phone regex
PHONE_PATTERNS = [
    r'\+55\s*\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}',
    r'\(\d{2}\)\s*\d{4,5}[-\s]?\d{4}',
    r'\d{2}\s+\d{4,5}[-\s]?\d{4}',
    r'\d{4,5}[-\s]\d{4}'
]

VALID_DDDS = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19',
    '21', '22', '24', '27', '28',
    '31', '32', '33', '34', '35', '37', '38',
    '41', '42', '43', '44', '45', '46', '47', '48', '49',
    '51', '53', '54', '55',
    '61', '62', '63', '64', '65', '66', '67', '68', '69',
    '71', '73', '74', '75', '77', '79',
    '81', '82', '83', '84', '85', '86', '87', '88', '89',
    '91', '92', '93', '94', '95', '96', '97', '98', '99'
]

def normalize_phone(phone_str):
    """Normalize phone to +55 (XX) XXXXX-XXXX"""
    digits = re.sub(r'\D', '', phone_str)
    
    if len(digits) == 13 and digits.startswith('55'):
        ddd = digits[2:4]
        if ddd in VALID_DDDS:
            number = digits[4:]
            if len(number) == 9:
                return f"+55 ({ddd}) {number[:5]}-{number[5:]}"
            elif len(number) == 8:
                return f"+55 ({ddd}) {number[:4]}-{number[4:]}"
    
    elif len(digits) == 11:
        ddd = digits[:2]
        if ddd in VALID_DDDS:
            number = digits[2:]
            return f"+55 ({ddd}) {number[:5]}-{number[5:]}"
    
    elif len(digits) == 10:
        ddd = digits[:2]
        if ddd in VALID_DDDS:
            number = digits[2:]
            return f"+55 ({ddd}) {number[:4]}-{number[4:]}"
    
    return None

def extract_phones_from_text(text):
    """Extract phones from text"""
    phones = []
    for pattern in PHONE_PATTERNS:
        matches = re.findall(pattern, text)
        for match in matches:
            normalized = normalize_phone(match)
            if normalized:
                phones.append(normalized)
    
    if phones:
        mobile = [p for p in phones if '9' in p.split(')')[1][:2]]
        if mobile:
            return mobile[0]
        return phones[0]
    
    return None

def scrape_website_phone(url):
    """Scrape phone from website"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = soup.get_text('\n')
            
            phone = extract_phones_from_text(text)
            if phone:
                return phone
            
            # Try contact pages
            for link in soup.find_all('a', href=True):
                href = link['href']
                if any(path in href.lower() for path in CONTACT_PATHS):
                    full_url = urljoin(url, href)
                    try:
                        sub_resp = requests.get(full_url, headers=HEADERS, timeout=10)
                        if sub_resp.status_code == 200:
                            sub_soup = BeautifulSoup(sub_resp.text, 'html.parser')
                            sub_text = sub_soup.get_text('\n')
                            phone = extract_phones_from_text(sub_text)
                            if phone:
                                return phone
                    except:
                        pass
                    break
    except:
        pass
    
    return None

def search_google_phone(company_name, website):
    """Search Google for company phone"""
    try:
        # Build search query
        domain = website.replace('https://', '').replace('http://', '').split('/')[0]
        query = f'"{company_name}" telefone site:{domain}'
        search_url = f"https://www.google.com/search?q={quote_plus(query)}"
        
        time.sleep(1)  # Rate limit
        
        resp = requests.get(search_url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            # Extract from snippets
            phone = extract_phones_from_text(resp.text)
            if phone:
                return phone
    except:
        pass
    
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
    company = row.get('Company') or row.get('Nome Empresa')
    
    if pd.isna(website) or not website:
        return idx, None
    
    url = clean_url(website)
    
    # Method 1: Website scraping
    phone = scrape_website_phone(url)
    
    # Method 2: Google search (if website failed)
    if not phone and company:
        phone = search_google_phone(company, url)
    
    return idx, phone

def run():
    print("=== ENHANCED PHONE DISCOVERY (with Google Search) ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    if 'Phone' not in df.columns:
        df['Phone'] = None
    
    # Target leads without phone
    mask = df['Phone'].isna() | (df['Phone'] == '')
    target_leads = df[mask]
    
    print(f"Processing {len(target_leads)} leads without phone...")
    
    found_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row.name for _, row in target_leads.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, phone = future.result()
            
            if phone:
                df.at[idx, 'Phone'] = phone
                company = df.at[idx, 'Company'] if 'Company' in df.columns else df.at[idx, 'Nome Empresa']
                print(f"✅ [{i+1}/{len(target_leads)}] {company}: {phone}")
                found_count += 1
            
            if i > 0 and i % 50 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"   💾 Checkpoint. Found: {found_count}")
    
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Found {found_count} phone numbers.")

if __name__ == "__main__":
    run()
