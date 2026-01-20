import requests
import pandas as pd
import re
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin
import sys
import time
import argparse

# Configuration
INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
DELTA_FILE = '/Users/rafaelalmeida/lifetrek-mirror/delta_team_fast.csv'
MAX_WORKERS = 50 
TIMEOUT_SECONDS = 10

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
}

# Keywords to find "About" or "Team" pages
TEAM_PATHS_KEYWORDS = [
    'sobre', 'quem-somos', 'a-empresa', 'equipe', 'team', 'about', 
    'nossa-historia', 'lideranca', 'management', 'board', 'diretoria', 
    'corpo-clinico', 'medicos', 'especialistas'
]

# Regex for Titles (Portuguese and English)
TITLE_REGEX = re.compile(
    r'(?i)\b('
    r'CEO|Chief\sExecutive\sOfficer|'
    r'Founder|Co-?Founder|Fundador|Co-?Fundador|'
    r'Diretor|Director|Directora|'
    r'Presidente|President|'
    r'Sócio|Sio|Partner|Owner|Proprietário|Dono|'
    r'Gerente\sGeral|General\sManager|'
    r'Head|Líder|Lead|'
    r'Responsável\sTr?ecnico|'
    r'Cirurgião|Dentista|Médico|Doutor|Dr\.|Dra\.|'
    r'Especialista'
    r')\b'
)

# Regex for Names (Capitalized words, avoiding common scraped junk)
# Must be at least 2 words, mostly letters.
NAME_REGEX = re.compile(r'\b([A-Z][a-z\u00C0-\u00FF]+\s+(?:[A-Z][a-z\u00C0-\u00FF]+\s*){1,4})\b')

# Blocklist to avoid capturing "Fale Conosco" as a name
BLOCKLIST = [
    'Fale Conosco', 'Entre Contato', 'Saiba Mais', 'Voltar Topo', 
    'Politica Privacidade', 'Todos Direitos', 'Minha Conta', 
    'Esqueci Senha', 'Adicionar Carrinho', 'Rio Janeiro', 'Sao Paulo',
    'Minas Gerais', 'Santa Catarina', 'Rio Grande', 'Espírito Santo',
    'United States', 'Redes Sociais', 'Mapa Site', 'Trabalhe Conosco'
]

def clean_url(url):
    if not isinstance(url, str) or not url or url.lower() == 'nan': 
        return None
    url = url.strip()
    if not url.startswith('http'): 
        url = 'https://' + url
    return url

def is_valid_name(name):
    if len(name) < 4 or len(name) > 40: return False
    name_lower = name.lower()
    for block in BLOCKLIST:
        if block.lower() in name_lower: return False
    return True

def extract_people_from_text(text):
    """
    Scans text for lines containing a Title AND a Name.
    Returns list of "Name (Title)"
    """
    found = set()
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if len(line) > 200: continue # Skip long paragraphs
        
        # Check for Title
        title_match = TITLE_REGEX.search(line)
        if title_match:
            # Check for Name in the same line
            name_matches = NAME_REGEX.findall(line)
            for name in name_matches:
                if is_valid_name(name):
                    # Clean the found name
                    clean_name = name.strip()
                    title = title_match.group(0).strip()
                    # formatting
                    entry = f"{clean_name} - {title}"
                    found.add(entry)
                    
    return list(found)

def fetch_and_parse(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT_SECONDS)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            # Kill scripts and styles
            for script in soup(["script", "style"]):
                script.decompose()
            return soup
    except:
        pass
    return None


# Regex for Emails
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

# Regex for Phones (Brazilian formats mainly)
# (XX) 9XXXX-XXXX or (XX) XXXX-XXXX or +55...
PHONE_REGEX = re.compile(r'(?:(?:\+|00)?55\s?)?(?:\(?([1-9][0-9])\)?\s?)(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))')

def extract_emails_phones(text):
    emails = set()
    phones = set()
    
    # Emails
    for match in EMAIL_REGEX.findall(text):
        email = match.lower()
        # Basic junk filter
        if any(x in email for x in ['.png', '.jpg', '.jpeg', '.gif', '.css', '.js', 'domain.com', 'email.com', 'exemplo']):
            continue
        emails.add(email)
            
    # Phones
    # Regex returns tuple groups: (Area, Prefix, Suffix)
    for match in PHONE_REGEX.findall(text):
        try:
            # Format as (XX) XXXXX-XXXX
            area, prefix, suffix = match
            formatted = f"({area}) {prefix}-{suffix}"
            if len(set(formatted)) > 5: # Filter repetitive numbers like 9999-9999
                phones.add(formatted)
        except:
            pass
            
    return list(emails), list(phones)

def process_site(url):
    people = set()
    emails = set()
    phones = set()
    
    # 1. Scrape Homepage
    soup_home = fetch_and_parse(url)
    if not soup_home: 
        return [], [], []

    # Extract from Home
    text_home = soup_home.get_text('\n')
    people.update(extract_people_from_text(text_home))
    e, p = extract_emails_phones(text_home)
    emails.update(e)
    phones.update(p)
    
    # 2. Find "About/Team" links
    links_to_visit = set()
    for a in soup_home.find_all('a', href=True):
        href = a['href'].lower()
        if any(keyword in href for keyword in TEAM_PATHS_KEYWORDS):
            full_url = urljoin(url, a['href'])
            links_to_visit.add(full_url)
    
    # Limit deep links to avoid rabbit holes
    links_to_visit = list(links_to_visit)[:3]

    # 3. Scrape Deep Links
    for deep_url in links_to_visit:
        try:
            soup_deep = fetch_and_parse(deep_url)
            if soup_deep:
                text_deep = soup_deep.get_text('\n')
                people.update(extract_people_from_text(text_deep))
                e_deep, p_deep = extract_emails_phones(text_deep)
                emails.update(e_deep)
                phones.update(p_deep)
        except:
            pass
            
    return list(people), list(emails), list(phones)

def run_scraper(limit=None):
    print("=== ULTRA FAST TEAM & CONTACT ENRICHMENT ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Filter: Leads with missing info
    # We want to re-run for anyone missing DM OR Email
    targets = []
    
    # Prepare targeting logic
    # If limit is set, take top N missing DM
    # If no limit / overwrite, you might want to run on all. 
    # For speed, let's target rows missing DM or Email
    
    if 'Decision_Maker' not in df.columns: df['Decision_Maker'] = None
    if 'Scraped_Emails' not in df.columns: df['Scraped_Emails'] = None
    
    mask = (df['Decision_Maker'].isna()) | (df['Scraped_Emails'].isna())
    target_df = df[mask]
    
    # Also prioritize valid website
    target_df = target_df[target_df['Website'].notna() & (target_df['Website'] != '')]
    
    if limit:
        target_df = target_df.head(limit)
        
    print(f"Targeting {len(target_df)} leads (Max Workers: {MAX_WORKERS})...")
    
    results = []
    processed = 0
    found_count = 0
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Map Future -> (Index, Company Name)
        futures = {}
        for idx, row in target_df.iterrows():
            url = clean_url(row['Website'])
            if url:
                f = executor.submit(process_site, url)
                futures[f] = (idx, row['Nome Empresa'])
        
        for future in as_completed(futures):
            idx, company = futures[future]
            processed += 1
            
            try:
                people_list, email_list, phone_list = future.result()
                
                updates = {}
                score_boost = False
                
                if people_list:
                    dm_string = "; ".join(people_list[:3])
                    updates['Decision_Maker'] = dm_string
                    score_boost = True
                    
                if email_list:
                    # Filter junk emails again?
                    valid_emails = [e for e in email_list if len(e) < 50]
                    if valid_emails:
                        updates['Scraped_Emails'] = "; ".join(valid_emails[:3])
                        score_boost = True
                        
                if phone_list:
                    updates['Phone'] = "; ".join(phone_list[:2])
                    score_boost = True
                
                if updates:
                    found_str = ", ".join(updates.keys())
                    print(f"✅ [{company}] Found: {found_str}")
                    updates['index'] = idx
                    results.append(updates)
                    found_count += 1
                
                if processed % 50 == 0:
                     print(f"   [{processed}/{len(target_df)}] ...")
                     
            except Exception as e:
                pass
                
    elapsed = time.time() - start_time
    print(f"\n🎉 Finished in {elapsed:.1f}s.")
    print(f"Processed: {processed} | enriched: {found_count}")
    
    # Save Delta
    if results:
        delta_df = pd.DataFrame(results)
        delta_df.to_csv(DELTA_FILE, index=False)
        print(f"💾 Saved {len(delta_df)} results to {DELTA_FILE}")
    else:
        print("No new data found.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, help="Limit number of leads to process")
    args = parser.parse_args()
    
    run_scraper(limit=args.limit)
