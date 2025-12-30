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

# 2. Load New Lead Sources
# Source A: Google Places (Original)
try:
    places_df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/new_leads_google_places.csv')
    print(f"Original Places Leads loaded: {len(places_df)} records")
except:
    places_df = pd.DataFrame()

# Source B: Google Places (Advanced)
try:
    advanced_df = pd.read_csv('../../.tmp/new_leads_advanced.csv')
    print(f"Advanced Places Leads loaded: {len(advanced_df)} records")
except:
    advanced_df = pd.DataFrame()
    
# Source C: Perplexity Discovery
try:
    perplexity_df = pd.read_csv('../../.tmp/new_leads_perplexity_discovery.csv')
    print(f"Perplexity Discovery Leads loaded: {len(perplexity_df)} records")
except:
    perplexity_df = pd.DataFrame()

# Combine all new leads
all_new_leads_df = pd.concat([places_df, advanced_df, perplexity_df], ignore_index=True)
print(f"Total New Raw Leads: {len(all_new_leads_df)}")

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
if 'Status' in master_df.columns:
    original_leads = master_df[master_df['Status'] != 'New Lead'].copy()
else:
    original_leads = master_df.copy()
    original_leads['Status'] = 'Original'

print(f"Preserving {len(original_leads)} original leads")

# Normalize Column Names for checking existence
website_col = 'Website' if 'Website' in original_leads.columns else 'website'
company_col = 'Nome Empresa' if 'Nome Empresa' in original_leads.columns else 'Company'

existing_websites_orig = set(original_leads[website_col].astype(str).str.lower().str.strip())
existing_names_orig = set(original_leads[company_col].astype(str).str.lower().str.strip())

GLOBAL_BRANDS = {
    'J&J': 3.0, 'JOHNSON': 3.0, 'BIOMET': 3.0, 'ZIMMER': 3.0,
    'STRYKER': 3.0, 'STRAUMANN': 1.5, 'NEODENT': 1.5, 'ARTHREX': 1.5,
    'ALIGN': 1.5, 'DENTSPLY': 1.5, 'BIOTRONIK': 1.5
}

for idx, row in all_new_leads_df.iterrows():
    name = str(row['Nome Empresa'])
    website = str(row['Website'])
    
    # Deduplicate against ORIGINAL list only
    if website.lower().strip() in existing_websites_orig:
        continue
    if name.lower().strip() in existing_names_orig:
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
    
    # Prepare Row - Map to Master Schema
    # Master schema: Company, Website, Lead_Score, ...
    new_row = {
        'Company': name,
        'Nome Empresa': name, # Keep both for safety if other scripts rely on it
        'Website': website,
        'Address': row.get('Address'),
        'Phone': row.get('Phone'),
        'Source': row.get('Source', 'Google Places'),
        'Status': 'New Lead',
        'Lead_Score': final_score, # Master uses Lead_Score
        'Predicted_Score': final_score, 
        'V2_Score': final_score,
        'Renner_Score': 0, 
        # Enrichment Cols
        'FDA_Certified': enrich.get('has_fda', False),
        'CE_Certified': enrich.get('has_ce', False),
        'Years_Active': enrich.get('years', 0),
        'Employees': enrich.get('employees', 0),
        'City': row.get('City_Scope') or row.get('City'), # Map from Scraper
        'State': str(row.get('City_Scope', '')).split(',')[-1].strip() if ',' in str(row.get('City_Scope', '')) else None,
        'Enrichment_Status': 'Complete' if len(enrich) > 0 else 'Pending'
    }
    new_rows.append(new_row)

print(f"Prepared {len(new_rows)} new unique leads (re-processed)")

# 6. Append and Save
if new_rows:
    new_df = pd.DataFrame(new_rows)
    # Align columns - Concat handles the union of columns
    combined_df = pd.concat([original_leads, new_df], ignore_index=True)
    
    # Sort by Lead_Score
    score_col = 'Lead_Score' if 'Lead_Score' in combined_df.columns else 'Predicted_Score'
    if score_col in combined_df.columns:
        combined_df = combined_df.sort_values(score_col, ascending=False)
    
    combined_df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)
    print("✅ Successfully Merged into MASTER_ENRICHED_LEADS.csv")
    print(f"Total Count: {len(combined_df)}")
else:
    print("No new unique leads to add")
