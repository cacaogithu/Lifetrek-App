import requests
import pandas as pd
import re
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin
import os
import random

# Configuration
INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
DELTA_FILE = '/Users/rafaelalmeida/lifetrek-mirror/delta_free.csv'
MAX_WORKERS = 15

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

TEAM_PATHS = [
    '/sobre', '/quem-somos', '/a-empresa', '/equipe', '/team', '/about', '/location', '/contato'
]

TITLE_REGEX = re.compile(r'(?i)\b(CEO|Founder|Diretor|Director|Presidente|Sócio|Owner|Responsável|Cirurgião|Dentista)\b')
NAME_REGEX = re.compile(r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b')

def clean_url(url):
    if not isinstance(url, str) or not url: return None
    url = url.strip()
    if not url.startswith('http'): url = 'https://' + url
    return url

def extract_people(text):
    found = []
    for line in text.split('\n'):
        if len(line) > 300: continue
        title = TITLE_REGEX.search(line)
        if title:
            names = NAME_REGEX.findall(line)
            for n in names:
                if len(n) > 3 and 'fale conosco' not in n.lower():
                    found.append(f"{n} ({title.group(0)})")
    return list(set(found))

def scrape(url):
    people = set()
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            people.update(extract_people(soup.get_text('\n')))
            if not people:
                for a in soup.find_all('a', href=True):
                    if any(p in a['href'].lower() for p in TEAM_PATHS):
                        try:
                            sub = requests.get(urljoin(url, a['href']), headers=HEADERS, timeout=10)
                            people.update(extract_people(BeautifulSoup(sub.text, 'html.parser').get_text('\n')))
                        except: pass
    except: pass
    return list(people)

def append_delta(idx, dm):
    file_exists = os.path.isfile(DELTA_FILE)
    df = pd.DataFrame([{ 'index': idx, 'Decision_Maker': dm }])
    df.to_csv(DELTA_FILE, mode='a', header=not file_exists, index=False)

def run_free():
    print("=== ZERO-COST SCRAPER (DELTA) STARTED ===")
    try: df = pd.read_csv(INPUT_FILE)
    except: return
    
    mask = df['Decision_Maker'].isna() | (df['Decision_Maker'] == '')
    targets = df[mask].sample(frac=1)
    
    print(f"Queue: {len(targets)} sites.")
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as exe:
        futures = {exe.submit(scrape, clean_url(r['Website'])): (i, r['Nome Empresa']) for i, r in targets.iterrows() if r['Website']}
        for fut in as_completed(futures):
            idx, name = futures[fut]
            res = fut.result()
            if res:
                dm_str = "; ".join(res[:2])
                print(f"✅ [Free] {name}: {dm_str}")
                append_delta(idx, dm_str)

if __name__ == "__main__":
    run_free()
