#!/usr/bin/env python3
"""
Enhanced Decision Maker Scraper (Deep Mode)
Improvements:
- Crawls up to 3 pages per company (About, Team, Leadership)
- Extracts ALL decision makers (not just top 2)
- Better title detection (Portuguese + English)
- Stores as JSON array with name + title
- Adds confidence scoring
"""

import requests
import pandas as pd
import re
import json
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin
import time

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 30

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

# Expanded team page paths
TEAM_PATHS = [
    '/sobre', '/quem-somos', '/a-empresa', '/equipe', '/time', '/nosso-time',
    '/team', '/about', '/about-us', '/leadership', '/lideranca', '/diretoria',
    '/historia', '/gestao', '/corporativo', '/nossa-equipe', '/management'
]

# Expanded executive titles (Portuguese + English)
EXECUTIVE_TITLES = [
    # C-Level
    r'CEO', r'C\.E\.O\.?', r'Chief Executive Officer',
    r'CTO', r'C\.T\.O\.?', r'Chief Technology Officer',
    r'CFO', r'C\.F\.O\.?', r'Chief Financial Officer',
    r'COO', r'C\.O\.O\.?', r'Chief Operating Officer',
    r'CMO', r'C\.M\.O\.?', r'Chief Marketing Officer',
    r'CCO', r'C\.C\.O\.?', r'Chief Commercial Officer',
    
    # Portuguese Executives
    r'Fundador(?:a)?', r'Co-Fundador(?:a)?', r'Founder', r'Co-Founder',
    r'Presidente', r'President',
    r'Diretor(?:a)?\s+(?:Geral|Executivo|Presidente|Comercial|Técnico|Financeiro)',
    r'Diretor(?:a)?', r'Director',
    r'Vice[- ]Presidente', r'VP', r'V\.P\.?',
    r'Sócio(?:-Diretor)?', r'Partner',
    r'Gerente\s+Geral', r'General Manager',
    r'Dono(?:a)?', r'Owner', r'Proprietário(?:a)?',
    r'Administrador(?:a)?', r'Administrator'
]

TITLE_REGEX = re.compile(r'(?i)\b(' + '|'.join(EXECUTIVE_TITLES) + r')\b')

# Enhanced name regex - handles titles like Dr., Eng., etc.
NAME_REGEX = re.compile(r'\b(?:Dr\.?|Eng\.?|Prof\.)?\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþß]+(?:\s+(?:de|da|do|dos|das|e|van|von))?\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþß]+(?:\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþß]+)*)\b')

# Noise filter
NOISE_WORDS = [
    'fale conosco', 'saiba mais', 'entre em contato', 'quem somos',
    'rio de janeiro', 'são paulo', 'santa catarina', 'minas gerais',
    'nossa história', 'nossa empresa', 'trabalhe conosco', 'política de privacidade',
    'termos de uso', 'todos os direitos', 'direitos reservados'
]

def clean_url(url):
    if not isinstance(url, str) or not url:
        return None
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    return url

def extract_people_from_text(text):
    """Extract name-title pairs from text with confidence scoring"""
    people = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if len(line) > 300 or len(line) < 5:
            continue
            
        # Check for title
        title_match = TITLE_REGEX.search(line)
        if title_match:
            title = title_match.group(0)
            
            # Find names in the same line
            name_matches = NAME_REGEX.findall(line)
            for name in name_matches:
                # Noise filter
                if any(noise in name.lower() for noise in NOISE_WORDS):
                    continue
                    
                # Calculate confidence based on proximity
                name_pos = line.find(name)
                title_pos = line.find(title)
                distance = abs(name_pos - title_pos)
                
                # Closer = higher confidence
                if distance < 50:
                    confidence = 'high'
                elif distance < 100:
                    confidence = 'medium'
                else:
                    confidence = 'low'
                
                people.append({
                    'name': name.strip(),
                    'title': title.strip(),
                    'confidence': confidence
                })
    
    # Deduplicate by name
    seen = set()
    unique_people = []
    for person in people:
        if person['name'] not in seen:
            seen.add(person['name'])
            unique_people.append(person)
    
    return unique_people

def scrape_team_deep(url):
    """Deep scrape: homepage + up to 3 team pages"""
    all_people = []
    visited_urls = set()
    
    try:
        # 1. Homepage
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            visited_urls.add(url)
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = soup.get_text('\n')
            all_people.extend(extract_people_from_text(text))
            
            # 2. Find and visit team pages (max 3)
            team_pages_found = 0
            for link in soup.find_all('a', href=True):
                if team_pages_found >= 3:
                    break
                    
                href = link['href']
                if any(path in href.lower() for path in TEAM_PATHS):
                    full_url = urljoin(url, href)
                    
                    if full_url not in visited_urls:
                        visited_urls.add(full_url)
                        try:
                            sub_resp = requests.get(full_url, headers=HEADERS, timeout=10)
                            if sub_resp.status_code == 200:
                                sub_soup = BeautifulSoup(sub_resp.text, 'html.parser')
                                sub_text = sub_soup.get_text('\n')
                                all_people.extend(extract_people_from_text(sub_text))
                                team_pages_found += 1
                        except:
                            pass
    except:
        pass
    
    # Deduplicate again across all pages
    seen = set()
    unique_people = []
    for person in all_people:
        if person['name'] not in seen:
            seen.add(person['name'])
            unique_people.append(person)
    
    return unique_people

def process_row(row):
    idx = row.name
    website = row.get('Website')
    
    if pd.isna(website) or str(website) == 'nan' or not website:
        return idx, None
    
    url = clean_url(website)
    people = scrape_team_deep(url)
    
    if people:
        # Store as JSON string
        return idx, json.dumps(people, ensure_ascii=False)
    
    return idx, None

def run():
    print("=== DEEP DECISION MAKER DISCOVERY ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Create new column for deep decision makers
    col_name = 'Decision_Makers_Deep'
    if col_name not in df.columns:
        df[col_name] = None
    
    # Target leads without deep DM info
    mask = df[col_name].isna() | (df[col_name] == '')
    target_leads = df[mask]
    
    print(f"Processing {len(target_leads)} leads...")
    
    found_count = 0
    total_people = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row.name for _, row in target_leads.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, res = future.result()
            
            if res:
                df.at[idx, col_name] = res
                people_list = json.loads(res)
                company = df.at[idx, 'Company'] if 'Company' in df.columns else df.at[idx, 'Nome Empresa']
                
                # Display summary
                names = [p['name'] for p in people_list]
                print(f"✅ [{i+1}/{len(target_leads)}] {company}: {len(names)} people - {', '.join(names[:3])}")
                found_count += 1
                total_people += len(names)
            
            # Periodic save
            if i > 0 and i % 50 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"   💾 Checkpoint. Companies: {found_count}, Total people: {total_people}")
    
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Found decision makers in {found_count} companies ({total_people} total people).")

if __name__ == "__main__":
    run()
