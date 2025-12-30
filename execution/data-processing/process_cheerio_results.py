"""
Process Cheerio Results & Merge into Master CSV
Aggregates deep-scraped pages per company (OR logic for boolean, MAX for numbers)
"""

import pandas as pd
import json

print("=== PROCESSING CHEERIO RESULTS ===\n")

# Load Cheerio results
try:
    with open('/Users/rafaelalmeida/lifetrek-mirror/cheerio_results.json') as f:
        data = json.load(f)
    print(f"Loaded {len(data)} pages scraped")
except:
    print("No results found yet")
    exit()

# Group by Company
company_data = {}

for page in data:
    company = page.get('company')
    if not company:
        continue
        
    if company not in company_data:
        company_data[company] = {
            'has_fda': False, 'has_ce': False, 'has_iso': False, 'has_anvisa': False,
            'has_rd': False, 'has_patents': False,
            'years': 0, 'countries': 0, 'employees': 0,
            'is_manufacturer': False, 'is_distributor': False,
            'has_export': False, 'has_global': False
        }
    
    # Aggregate (OR logic)
    c = company_data[company]
    c['has_fda'] = c['has_fda'] or page.get('has_fda', False)
    c['has_ce'] = c['has_ce'] or page.get('has_ce', False)
    c['has_iso'] = c['has_iso'] or page.get('has_iso', False)
    c['has_anvisa'] = c['has_anvisa'] or page.get('has_anvisa', False)
    c['has_rd'] = c['has_rd'] or page.get('has_rd', False)
    c['has_patents'] = c['has_patents'] or page.get('has_patents', False)
    
    c['is_manufacturer'] = c['is_manufacturer'] or page.get('is_manufacturer', False)
    c['is_distributor'] = c['is_distributor'] or page.get('is_distributor', False)
    c['has_export'] = c['has_export'] or page.get('has_export', False)
    c['has_global'] = c['has_global'] or page.get('has_global', False)
    
    # Max logic
    c['years'] = max(c['years'], page.get('years', 0))
    c['countries'] = max(c['countries'], page.get('countries', 0))
    c['employees'] = max(c['employees'], page.get('employees', 0))

print(f"Aggregated data for {len(company_data)} companies\n")

# Load Master CSV
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')

# Update DataFrame
updates = 0
for company, data in company_data.items():
    mask = df['Nome Empresa'] == company
    if mask.any():
        updates += 1
        df.loc[mask, 'has_fda'] = data['has_fda']
        df.loc[mask, 'has_ce'] = data['has_ce']
        df.loc[mask, 'has_iso'] = data['has_iso']
        df.loc[mask, 'has_rd'] = data['has_rd']
        df.loc[mask, 'years'] = data['years']
        df.loc[mask, 'countries'] = data['countries']
        df.loc[mask, 'employees'] = data['employees']

# Recalculate V2 Scores (reuse logic)
GLOBAL_BRANDS = {
    'J&J': 3.0, 'JOHNSON': 3.0, 'BIOMET': 3.0, 'ZIMMER': 3.0,
    'STRYKER': 3.0, 'STRAUMANN': 1.5, 'NEODENT': 1.5, 'ARTHREX': 1.5,
    'ALIGN': 1.5, 'DENTSPLY': 1.5, 'BIOTRONIK': 1.5
}
def calculate_v2_score(row):
    score = row['Predicted_Score']
    # Brands
    company_upper = str(row['Nome Empresa']).upper()
    for brand, points in GLOBAL_BRANDS.items():
        if brand in company_upper:
            score += points
            break
    # Certs
    cert_count = sum([row.get('has_fda', False), row.get('has_ce', False), row.get('has_iso', False)])
    if cert_count >= 2: score += 2.0
    elif cert_count == 1: score += 1.0
    # R&D
    if row.get('has_rd', False): score += 1.5
    # Stats
    if row.get('years', 0) >= 20: score += 1.0
    if row.get('countries', 0) >= 10: score += 1.0
    if row.get('employees', 0) >= 100: score += 1.0
    
    return min(10.0, score)

df['V2_Score'] = df.apply(calculate_v2_score, axis=1)

# Update Status
df['Enrichment_Status'] = df.apply(lambda x: 
    'Complete' if (pd.notna(x.get('Scraped_Emails')) and x.get('Scraped_Emails') != '') or (x.get('has_fda') or x.get('has_rd')) 
    else 'Pending', axis=1)

df = df.sort_values('V2_Score', ascending=False)
df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)

print(f"✅ Updated {updates} companies in MASTER_ENRICHED_LEADS.csv")
print(f"Total Completed: {len(df[df['Enrichment_Status'] == 'Complete'])}")
