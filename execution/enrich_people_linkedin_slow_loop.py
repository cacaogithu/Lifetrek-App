import pandas as pd
import requests
import re
import time
import os
from urllib.parse import quote_plus

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
DELTA_FILE = '/Users/rafaelalmeida/lifetrek-mirror/delta_linkedin.csv'
HEADERS = {'User-Agent': 'Mozilla/5.0'}

def search_li(query):
    try:
        r = requests.get(f"https://www.google.com/search?q={quote_plus(query)}", headers=HEADERS, timeout=10)
        if r.status_code == 200:
            m = re.findall(r'https://[a-z]{2,3}\.linkedin\.com/in/[\w-]+', r.text)
            if m: return m[0]
        elif r.status_code == 429: return "RATE_LIMIT"
    except: pass
    return None

def append_delta(idx, url):
    file_exists = os.path.isfile(DELTA_FILE)
    df = pd.DataFrame([{ 'index': idx, 'LinkedIn_Person': url }])
    df.to_csv(DELTA_FILE, mode='a', header=not file_exists, index=False)

def run_loop():
    print("=== LINKEDIN LOOP (DELTA) STARTED ===")
    while True:
        try:
            df = pd.read_csv(INPUT_FILE)
            mask = (df['Decision_Maker'].notna() & (df['Decision_Maker'] != '')) & \
                   (df['LinkedIn_Person'].isna() | (df['LinkedIn_Person'] == ''))
            targets = df[mask]
            
            if len(targets) == 0:
                print("No targets. Sleep 60s.")
                time.sleep(60)
                continue
                
            row = targets.sample(1).iloc[0] # Pick random to handle race conditions with other scripts? No, just random.
            idx = row.name
            name = row['Decision_Maker'].split(';')[0].split('(')[0].strip()
            company = row.get('Nome Empresa') or 'Company'
            
            if len(name) < 3: 
                time.sleep(1)
                continue
                
            print(f"[LI] Searching: {name}...", end=" ")
            res = search_li(f'site:linkedin.com/in "{name}" "{company}"')
            
            if res == "RATE_LIMIT":
                print("⚠️ 429. Sleep 2m.")
                time.sleep(120)
                continue
                
            if res:
                print(f"✅ {res}")
                append_delta(idx, res)
            else:
                print("❌")
            
            time.sleep(60)
        except Exception as e:
            print(f"Err: {e}")
            # Turbo Mode Delay
            time.sleep(20)

if __name__ == "__main__":
    run_loop()
