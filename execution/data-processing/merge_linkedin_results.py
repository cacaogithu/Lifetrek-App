import pandas as pd
import json
import re

def normalize_name(name):
    if not isinstance(name, str): return ""
    return re.sub(r'[^a-zA-Z0-9]', '', name.lower())

def merge_linkedin_data():
    csv_path = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
    json_path = '/Users/rafaelalmeida/lifetrek-mirror/linkedin_mass_results.json'
    
    print(f"Loading {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"Loading {json_path}...")
    with open(json_path, 'r') as f:
        linkedin_data = json.load(f)
        
    print(f"Loaded {len(linkedin_data)} LinkedIn profiles.")
    
    # Create map for fast lookup
    # Heuristic: Normalize company names from CSV to match potential names in JSON
    # Or iterate JSON and fuzzy match against CSV
    
    # Let's try matching by Name first (Normalized)
    
    updates_count = 0
    

    # Create normalization helpers
    def get_domain(url):
        if not isinstance(url, str) or not url: return None
        # Remove protocol
        url = re.sub(r'^https?://(www\.)?', '', url.lower())
        # Remove path
        if '/' in url:
            url = url.split('/')[0]
        return url.strip()

    # Precompute CSV Maps
    website_map = {}
    name_map = {}
    
    for idx, row in df.iterrows():
        # Map Website
        web = row.get('Website')
        if web and pd.notna(web):
            domain = get_domain(str(web))
            if domain:
                if domain not in website_map:
                    website_map[domain] = []
                website_map[domain].append(idx)
        
        # Map Name
        name = row.get('Nome Empresa') or row.get('Company')
        if name and pd.notna(name):
            norm = normalize_name(str(name))
            if norm:
                name_map[norm] = idx
                
    print(f"Mapped {len(website_map)} domains and {len(name_map)} names from CSV.")

    updates_count = 0
    matched_by_web = 0
    matched_by_name = 0
    
    for item in linkedin_data:
        l_name = item.get('name')
        l_url = item.get('linkedinUrl')
        l_website = item.get('website')
        l_employees = item.get('employeeCount')
        
        if not l_name: continue
        
        match_idx = None
        
        # 1. Try Website Match
        if l_website:
            l_domain = get_domain(l_website)
            if l_domain and l_domain in website_map:
                match_idx = website_map[l_domain][0] # Take first match
                matched_by_web += 1
                
        # 2. Try Name Match (if no website match)
        if match_idx is None:
            norm_l_name = normalize_name(l_name)
            if norm_l_name in name_map:
                match_idx = name_map[norm_l_name]
                matched_by_name += 1
            elif len(norm_l_name) > 5:
                # One way fuzzy: check if normalized CSV name contains LinkedIn name or vice versa
                # This is expensive O(N), but N=2000 is tiny.
                # Actually, iterate the name_map
                for c_norm, c_idx in name_map.items():
                    if c_norm in norm_l_name or norm_l_name in c_norm:
                         match_idx = c_idx
                         matched_by_name += 1
                         break
        
        if match_idx is not None:
             # Update Logic
            current_li = df.at[match_idx, 'LinkedIn_Company']
            
            # Update if empty or overwrite policy
            # We assume the scraper data is good.
            df.at[match_idx, 'LinkedIn_Company'] = l_url
            if l_employees:
                # Merge logic for employees: take max
                curr_emp = df.at[match_idx, 'Employees']
                try:
                    curr_emp = int(curr_emp)
                except:
                    curr_emp = 0
                df.at[match_idx, 'Employees'] = max(curr_emp, l_employees)
                
            updates_count += 1

    print(f"Matched by Website: {matched_by_web}")
    print(f"Matched by Name: {matched_by_name}")
    print(f"Total updates: {updates_count}")
    df.to_csv(csv_path, index=False)
    print("Saved merged CSV.")

if __name__ == "__main__":
    merge_linkedin_data()
