import pandas as pd
import requests
import re
from urllib.parse import quote_plus
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Configuration
INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
MAX_WORKERS = 10

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def search_linkedin_free(query):
    """
    Search Google for LinkedIn Profile (Free/Scraping)
    Note: Highly Rate Limited.
    """
    search_url = f"https://www.google.com/search?q={quote_plus(query)}"
    try:
        resp = requests.get(search_url, headers=HEADERS, timeout=10)
        if resp.status_code == 200:
            matches = re.findall(r'https://[a-z]{2,3}\.linkedin\.com/in/[\w-]+', resp.text)
            if matches:
                return matches[0]
    except:
        pass
    return None

def process_row(idx, row):
    company = row.get('Nome Empresa') or row.get('Company')
    dm_text = row.get('Decision_Maker')
    
    if pd.isna(dm_text) or not dm_text:
        return idx, None

    # Parse DM Text
    # Formats seen: "Name - Title" or "Name (Title)" or just "Name"
    # We want the Name part.
    
    person_name = None
    
    # Simple heuristic
    # Split by semicolon if multiple
    first_person = dm_text.split(';')[0].strip()
    
    # Remove Title
    if '-' in first_person:
        person_name = first_person.split('-')[0].strip()
    elif '(' in first_person:
        person_name = first_person.split('(')[0].strip()
    else:
        person_name = first_person
        
    if not person_name or len(person_name) < 3:
        return idx, None
        
    # Search Query
    query = f'site:linkedin.com/in "{person_name}" "{company}"'
    
    # Execute Search
    url = search_linkedin_free(query)
    
    if url:
        return idx, url
        
    return idx, None

def run_phase_3():
    print("=== PHASE 3: LINKEDIN PEOPLE DISCOVERY ===")
    
    try:
        df = pd.read_csv(INPUT_FILE)
    except:
        print("CSV not found")
        return
        
    print(f"Loaded {len(df)} leads.")
    
    if 'LinkedIn_Person' not in df.columns:
        df['LinkedIn_Person'] = None
        
    # Targets: Have DM Name, But Missing LinkedIn Person
    has_dm = df['Decision_Maker'].notna() & (df['Decision_Maker'] != '')
    missing_li = df['LinkedIn_Person'].isna() | (df['LinkedIn_Person'] == '')
    
    targets = df[has_dm & missing_li]
    print(f"Found {len(targets)} targets for Person Discovery.")
    
    found_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, idx, row): idx for idx, row in targets.iterrows()}
        
        for i, future in enumerate(as_completed(futures)):
            idx, res = future.result()
            
            if res:
                df.at[idx, 'LinkedIn_Person'] = res
                found_count += 1
                name = df.at[idx, 'Decision_Maker'].split(';')[0]
                print(f"✅ Found LinkedIn for {name}: {res}")
                
            if i > 0 and i % 50 == 0:
                df.to_csv(OUTPUT_FILE, index=False)
                print(f"💾 Checkpoint. Found: {found_count}")
                
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"🎉 Done. Found {found_count} personal LinkedIn profiles.")

if __name__ == "__main__":
    run_phase_3()
