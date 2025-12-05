"""
Merge New Leads (Google Places + Cheerio Enrichment) into Master CSV
"""

import pandas as pd
import json

print("=== MERGING NEW LEADS ===\n")

# 1. Load Master CSV
try:
    master_df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')
    print(f"Master CSV loaded: {len(master_df)} records")
except:
    print("Master CSV not found!")
    exit()

# 2. Load Google Places Leads
try:
    places_df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/new_leads_google_places.csv')
    print(f"New Leads loaded: {len(places_df)} records")
except:
    print("No new leads found")
    exit()

# 3. Load Cheerio Results
try:
    with open('/Users/rafaelalmeida/lifetrek-mirror/cheerio_results_new.json') as f:
        cheerio_data = json.load(f)
    print(f"Cheerio results loaded: {len(cheerio_data)} pages")
except:
    print("No Cheerio results yet, using empty")
    cheerio_data = []

# 4. Aggregate Cheerio Data
company_enrichment = {}
for page in cheerio_data:
    company = page.get('company')
    if not company: continue
    
    if company not in company_enrichment:
        company_enrichment[company] = {
            'has_fda': False, 'has_ce': False, 'has_iso': False, 'has_anvisa': False,
            'has_rd': False, 'has_patents': False,
            'years': 0, 'countries': 0, 'employees': 0,
            'is_manufacturer': False, 'is_distributor': False,
            'has_export': False, 'has_global': False
        }
    
    c = company_enrichment[company]
    # OR Logic
    for k in ['has_fda', 'has_ce', 'has_iso', 'has_anvisa', 'has_rd', 'has_patents', 'is_manufacturer', 'is_distributor', 'has_export', 'has_global']:
        c[k] = c[k] or page.get(k, False)
    # MAX Logic
    for k in ['years', 'countries', 'employees']:
        c[k] = max(c[k], page.get(k, 0))

# 5. Process New Leads & Calculate Score
new_rows = []

# Seprate Master into Original vs New (to avoid duplication or stale data)
original_leads = master_df[master_df['Status'] != 'New Lead'].copy()
print(f"Preserving {len(original_leads)} original leads")

existing_websites_orig = set(original_leads['Website'].astype(str))
existing_names_orig = set(original_leads['Nome Empresa'].astype(str))

GLOBAL_BRANDS = {
    'J&J': 3.0, 'JOHNSON': 3.0, 'BIOMET': 3.0, 'ZIMMER': 3.0,
    'STRYKER': 3.0, 'STRAUMANN': 1.5, 'NEODENT': 1.5, 'ARTHREX': 1.5,
    'ALIGN': 1.5, 'DENTSPLY': 1.5, 'BIOTRONIK': 1.5
}

for idx, row in places_df.iterrows():
    name = str(row['Nome Empresa'])
    website = str(row['Website'])
    
    # Deduplicate against ORIGINAL list only
    if website in existing_websites_orig or name in existing_names_orig:
        continue
    
    # Get Enrichment Data
    enrich = company_enrichment.get(name, {})
    
    # Calculate Score
    score = 0.0 # Base score for new leads
    
    # Rating influence?
    try:
        rating = float(row.get('Rating', 0))
        if rating >= 4.5: score += 1.0
    except: pass
    
    # Brands
    name_upper = name.upper()
    for brand, points in GLOBAL_BRANDS.items():
        if brand in name_upper:
            score += points
            break
            
    # Enrichment Points
    cert_count = sum([enrich.get('has_fda', False), enrich.get('has_ce', False), enrich.get('has_iso', False)])
    if cert_count >= 2: score += 2.0
    elif cert_count == 1: score += 1.0
    
    if enrich.get('has_rd', False): score += 1.5
    if enrich.get('years', 0) >= 20: score += 1.0
    if enrich.get('countries', 0) >= 10: score += 1.0
    if enrich.get('employees', 0) >= 100: score += 1.0
    if enrich.get('is_manufacturer', False): score += 1.0
    
    final_score = min(10.0, score)
    
    # Prepare Row
    new_row = {
        'Nome Empresa': name,
        'Website': website,
        'Address': row.get('Address'),
        'Phone': row.get('Phone'),
        'Source': 'Google Places',
        'Status': 'New Lead',
        'V2_Score': final_score,
        'Predicted_Score': final_score, # Alias
        'Renner_Score': None, # Unknown
        # Enrichment Cols
        'has_fda': enrich.get('has_fda', False),
        'has_ce': enrich.get('has_ce', False),
        'has_iso': enrich.get('has_iso', False),
        'has_rd': enrich.get('has_rd', False),
        'years': enrich.get('years', 0),
        'countries': enrich.get('countries', 0),
        'employees': enrich.get('employees', 0),
        'Enrichment_Status': 'Complete' if len(enrich) > 0 else 'Pending'
    }
    new_rows.append(new_row)

print(f"Prepared {len(new_rows)} new unique leads (re-processed)")

# 6. Append and Save
if new_rows:
    new_df = pd.DataFrame(new_rows)
    # Align columns
    combined_df = pd.concat([original_leads, new_df], ignore_index=True)
    combined_df = combined_df.sort_values('V2_Score', ascending=False)
    
    combined_df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)
    print("✅ Successfully Merged into MASTER_ENRICHED_LEADS.csv")
    print(f"Total Count: {len(combined_df)}")
else:
    print("No new unique leads to add")
