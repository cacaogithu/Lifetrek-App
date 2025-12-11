"""
Free Team/Decision Maker Scraper
Strategy:
1. Navigate to company website.
2. Find "Team", "About", "Leadership" pages (and Portuguese equivalents).
3. Scrape text and look for key titles (CEO, Founder, Director, etc.).
4. Extract likely names associated with those titles using NLP heuristics (proximity).
"""

import requests
import pandas as pd
import re
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin
import time
import os

# Configuration
INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 30 # Moderate concurrency

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8'
}

TEAM_PATHS = [
    '/sobre', '/quem-somos', '/a-empresa', '/equipe', '/team', '/about', '/about-us', 
    '/leadership', '/lideranca', '/historia', '/gestao', '/corporativo'
]

# Titles to look for (Portuguese & English)
TARGET_TITLES = [
    r'CEO', r'C\.E\.O', r'Chief Executive Officer',
    r'Fundador', r'Founder', r'Co-Founder', r'Co-fundador',
    r'Diretor', r'Director', r'Presidente', r'President',
    r'Sócio', r'Partner', r'Gerente Geral', r'General Manager',
    r'Dono', r'Owner', r'Proprietário'
]

TITLE_REGEX = re.compile(r'(?i)\b(' + '|'.join(TARGET_TITLES) + r')\b')

# Regex to find capitalized names: "João Silva", "Maria Oliveira"
# Avoids common words by strict capitalization check
NAME_REGEX = re.compile(r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b')

def clean_url(url):
    if not isinstance(url, str) or not url: return None
    url = url.strip()
    if not url.startswith('http'):
        url = 'https://' + url
    return url

def extract_people(text):
    """
    Heuristic: Find a Title, then look at the text immediately surrounding it for a Name.
    Or Find a Name, then check if Title is near.
    """
    found_people = []
    
    # Split by lines or logical blocks to avoid cross-pollination too far away
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if len(line) > 200: continue # Skip huge paragraphs for now, focus on header/list styles
        
        # Check for Title
        title_match = TITLE_REGEX.search(line)
        if title_match:
            title = title_match.group(0)
            
            # Check for Name in the same line
            name_matches = NAME_REGEX.findall(line)
            for name in name_matches:
                # Basic noise filter
                if name.lower() in ['fale conosco', 'saiba mais', 'entre em contato', 'quem somos', 'rio de janeiro', 'são paulo', 'santa catarina']:
                    continue
                found_people.append(f"{name} ({title})")
                
    return list(set(found_people)) # Dedup

def scrape_team_page(url):
    people_found = set()
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = soup.get_text('\n')
            
            # 1. Search Homepage content mainly for small sites
            people_found.update(extract_people(text))
            
            # 2. Search linked subpages if homepage didn't yield much
            if len(people_found) < 3:
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    # Check if link matches our target paths
                    if any(path in href.lower() for path in TEAM_PATHS):
                        full_url = urljoin(url, href)
                        try:
                            # print(f"  > Checking subpage: {full_url}")
                            sub_resp = requests.get(full_url, headers=HEADERS, timeout=10)
                            if sub_resp.status_code == 200:
                                sub_soup = BeautifulSoup(sub_resp.text, 'html.parser')
                                sub_text = sub_soup.get_text('\n')
                                people_found.update(extract_people(sub_text))
                        except:
                            pass
    except Exception:
        pass
        
    return list(people_found)

def process_row(row):
    idx = row.name
    website = row.get('Website')
    
    if pd.isna(website) or str(website) == 'nan' or not website:
        return idx, None
        
    url = clean_url(website)
    people = scrape_team_page(url)
    
    # Format result: "Name (Title), Name (Title)"
    if people:
        return idx, ", ".join(people[:2]) # Limit to top 2 to avoid clutter
    
    return idx, None

def run():
    print("=== FREE DECISION MAKER DISCOVERY ===")
    
    if not os.path.exists(INPUT_FILE):
        print(f"File not found: {INPUT_FILE}")
        return

    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Target leads without Decision Maker info
    col_name = 'Decision_Maker'
    if col_name not in df.columns:
        df[col_name] = None
        
    mask = df[col_name].isna() | (df[col_name] == '')
    target_leads = df[mask]
    
    print(f"Processing {len(target_leads)} leads without decision info...")
    
    found_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row.name for _, row in target_leads.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, res = future.result()
            
            if res:
                df.at[idx, col_name] = res
                company = df.at[idx, 'Company'] if 'Company' in df.columns else df.at[idx, 'Nome Empresa']
                print(f"✅ [{i+1}/{len(target_leads)}] {company}: {res}")
                found_count += 1
            
            # Periodic Save
            if i > 0 and i % 50 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"   💾 Checkpoint. Found: {found_count}")

    df.to_csv(OUTPUT_FILE, index=False)
    print(f"\n🎉 DONE. Found decision makers for {found_count} companies.")

if __name__ == "__main__":
    run()
