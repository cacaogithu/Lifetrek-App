#!/usr/bin/env python3
"""
Phone Number Scraper (Free)
Extracts Brazilian phone numbers from company websites
Normalizes to standard format: +55 (XX) XXXXX-XXXX
"""

import requests
import pandas as pd
import re
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 30

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

CONTACT_PATHS = [
    '/contato', '/fale-conosco', '/contact', '/contact-us', '/atendimento'
]

# Brazilian phone regex patterns
PHONE_PATTERNS = [
    r'\+55\s*\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}',  # +55 (XX) XXXXX-XXXX
    r'\(\d{2}\)\s*\d{4,5}[-\s]?\d{4}',           # (XX) XXXXX-XXXX
    r'\d{2}\s+\d{4,5}[-\s]?\d{4}',               # XX XXXXX-XXXX
    r'\d{4,5}[-\s]\d{4}'                         # XXXXX-XXXX (local)
]

# Valid Brazilian area codes (DDD)
VALID_DDDS = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19',  # SP
    '21', '22', '24',  # RJ
    '27', '28',  # ES
    '31', '32', '33', '34', '35', '37', '38',  # MG
    '41', '42', '43', '44', '45', '46',  # PR
    '47', '48', '49',  # SC
    '51', '53', '54', '55',  # RS
    '61',  # DF
    '62', '64',  # GO
    '63',  # TO
    '65', '66',  # MT
    '67',  # MS
    '68',  # AC
    '69',  # RO
    '71', '73', '74', '75', '77',  # BA
    '79',  # SE
    '81', '87',  # PE
    '82',  # AL
    '83',  # PB
    '84',  # RN
    '85', '88',  # CE
    '86', '89',  # PI
    '91', '93', '94',  # PA
    '92', '97',  # AM
    '95',  # RR
    '96',  # AP
    '98', '99'   # MA
]

def clean_url(url):
    if not isinstance(url, str) or not url:
        return None
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    return url

def normalize_phone(phone_str):
    """Normalize phone to +55 (XX) XXXXX-XXXX format"""
    # Remove all non-digits
    digits = re.sub(r'\D', '', phone_str)
    
    # Handle different lengths
    if len(digits) == 13 and digits.startswith('55'):
        # +55 XX XXXXX-XXXX
        ddd = digits[2:4]
        if ddd in VALID_DDDS:
            number = digits[4:]
            if len(number) == 9:
                return f"+55 ({ddd}) {number[:5]}-{number[5:]}"
            elif len(number) == 8:
                return f"+55 ({ddd}) {number[:4]}-{number[4:]}"
    
    elif len(digits) == 11:
        # XX XXXXX-XXXX (mobile)
        ddd = digits[:2]
        if ddd in VALID_DDDS:
            number = digits[2:]
            return f"+55 ({ddd}) {number[:5]}-{number[5:]}"
    
    elif len(digits) == 10:
        # XX XXXX-XXXX (landline)
        ddd = digits[:2]
        if ddd in VALID_DDDS:
            number = digits[2:]
            return f"+55 ({ddd}) {number[:4]}-{number[4:]}"
    
    return None

def extract_phones_from_text(text):
    """Extract and normalize phone numbers from text"""
    phones = []
    
    for pattern in PHONE_PATTERNS:
        matches = re.findall(pattern, text)
        for match in matches:
            normalized = normalize_phone(match)
            if normalized:
                phones.append(normalized)
    
    # Return first valid phone (prefer mobile over landline)
    if phones:
        # Prefer 9-digit (mobile)
        mobile = [p for p in phones if '9' in p.split(')')[1][:2]]
        if mobile:
            return mobile[0]
        return phones[0]
    
    return None

def scrape_phone(url):
    """Scrape phone from homepage and contact pages"""
    try:
        # 1. Homepage
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = soup.get_text('\n')
            
            phone = extract_phones_from_text(text)
            if phone:
                return phone
            
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
                            phone = extract_phones_from_text(sub_text)
                            if phone:
                                return phone
                    except:
                        pass
                    break  # Only try first contact page
    except:
        pass
    
    return None

def process_row(row):
    idx = row.name
    website = row.get('Website')
    
    if pd.isna(website) or str(website) == 'nan' or not website:
        return idx, None
    
    url = clean_url(website)
    phone = scrape_phone(url)
    
    return idx, phone

def run():
    print("=== FREE PHONE NUMBER DISCOVERY ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Create phone column
    col_name = 'Phone'
    if col_name not in df.columns:
        df[col_name] = None
    
    # Target leads without phone
    mask = df[col_name].isna() | (df[col_name] == '')
    target_leads = df[mask]
    
    print(f"Processing {len(target_leads)} leads without phone...")
    
    found_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row.name for _, row in target_leads.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, phone = future.result()
            
            if phone:
                df.at[idx, col_name] = phone
                company = df.at[idx, 'Company'] if 'Company' in df.columns else df.at[idx, 'Nome Empresa']
                print(f"✅ [{i+1}/{len(target_leads)}] {company}: {phone}")
                found_count += 1
            
            # Periodic save
            if i > 0 and i % 50 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"   💾 Checkpoint. Found: {found_count}")
    
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Found {found_count} phone numbers.")

if __name__ == "__main__":
    run()
