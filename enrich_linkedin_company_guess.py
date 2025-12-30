import requests
import pandas as pd
import re
import argparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
DELTA_FILE = '/Users/rafaelalmeida/lifetrek-mirror/delta_linkedin_guess.csv'
MAX_WORKERS = 50
TIMEOUT_SECONDS = 5

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
}

def slugify(text):
    if not isinstance(text, str): return ""
    text = text.lower().strip()
    # Remove common suffixes that might not be in the handle
    text = re.sub(r'\b(ltda|s\.a\.|sa|eireli|me|ep p|inc|llc|ltd)\b', '', text)
    # Remove non-alphanumeric (keep spaces for now)
    text = re.sub(r'[^\w\s-]', '', text)
    # Replace spaces with hyphens
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def check_linkedin_url(slug):
    if not slug or len(slug) < 2: return None
    
    url = f"https://www.linkedin.com/company/{slug}"
    try:
        # Using GET because sometimes HEAD is treated differently by LinkedIn
        # But we only read headers to be fast, or small content
        r = requests.head(url, headers=HEADERS, timeout=TIMEOUT_SECONDS, allow_redirects=True)
        if r.status_code == 200:
            return url
        # If HEAD fails (405 or 999), try GET just to be sure if status is ambiguous
        if r.status_code in [405, 999, 403]:
            # LinkedIn often returns 999 for scrapers. 
            # If we get 999, it implies the page EXISTS but we are blocked. 
            # If the page didn't exist, we usually get 404.
            # However, falsely claiming a 999 is a valid company is risky.
            # Let's stick safe: Only 200 OK.
            pass
            
    except:
        pass
    return None

def process_row(idx, row):
    company = row.get('Nome Empresa') or row.get('Company')
    if not company: return idx, None
    
    slug = slugify(company)
    found_url = check_linkedin_url(slug)
    
    if found_url:
        return idx, found_url
    
    return idx, None

def run_guesser(limit=None):
    print("=== ULTRA FAST LINKEDIN COMPANY GUESSER ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    if 'LinkedIn_Company' not in df.columns:
        df['LinkedIn_Company'] = None
        
    mask = df['LinkedIn_Company'].isna() | (df['LinkedIn_Company'] == '')
    target_df = df[mask]
    
    if limit:
        target_df = target_df.head(limit)
        
    print(f"Targeting {len(target_df)} leads without LinkedIn Company URL...")
    
    results = []
    processed = 0
    found_count = 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, idx, row): (idx, row['Nome Empresa']) for idx, row in target_df.iterrows()}
        
        for future in as_completed(futures):
            processed += 1
            idx, company = futures[future]
            
            try:
                i, url = future.result()
                if url:
                    print(f"✅ Found: {company} -> {url}")
                    results.append({
                        'index': idx,
                        'LinkedIn_Company': url
                    })
                    found_count += 1
            except Exception as e:
                pass
                
            if processed % 50 == 0:
                print(f"   [{processed}/{len(target_df)}] Found so far: {found_count}")

    print(f"\n🎉 Finished. Found {found_count} new LinkedIn Company URLs.")
    
    if results:
         pd.DataFrame(results).to_csv(DELTA_FILE, index=False)
         print(f"💾 Saved to {DELTA_FILE}")
    else:
        print("No new URLs found.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, help="Limit number of leads")
    args = parser.parse_args()
    
    run_guesser(limit=args.limit)
