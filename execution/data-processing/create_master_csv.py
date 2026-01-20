"""
Merge all enrichment data collected so far
Creates master CSV for Manus
"""

import pandas as pd
import json

print("=== MERGING ALL ENRICHMENT DATA ===\n")

# 1. Load base data with scores
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')
print(f"Base data: {len(df)} companies with V1 scores\n")

# 2. Load contact enrichment (emails + LinkedIn)
try:
    contacts = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/leads_enriched_final_v2.csv')
    print(f"Contact data: {len(contacts)} companies with emails/LinkedIn\n")
    
    # Get column names
    contact_cols = ['Nome Empresa']
    if 'Scraped_Emails' in contacts.columns:
        contact_cols.append('Scraped_Emails')
    if 'LinkedIn_Profiles' in contacts.columns:
        contact_cols.append('LinkedIn_Profiles')
    if 'Decision_Makers' in contacts.columns:
        contact_cols.append('Decision_Makers')
    
    # Merge on company name
    df = df.merge(
        contacts[contact_cols],
        on='Nome Empresa',
        how='left'
    )
    
except Exception as e:
    print(f"Contact data error: {e}\n")
    df['Scraped_Emails'] = ''
    df['LinkedIn_URLs'] = ''

# 3. Load Apify Web Scraper results (10 companies)
try:
    with open('/Users/rafaelalmeida/lifetrek-mirror/apify_enrichment_results.json') as f:
        apify_data = json.load(f)
    
    print(f"Apify data: {len(apify_data['web_results'])} companies with parameters\n")
    
    # Create lookup dict
    apify_lookup = {}
    for url, data in apify_data['web_results'].items():
        apify_lookup[url] = {
            'has_fda': data.get('has_fda', False),
            'has_ce': data.get('has_ce', False),
            'has_iso': data.get('has_iso', False),
            'has_rd': data.get('has_rd', False),
            'years': data.get('years', 0),
            'countries': data.get('countries', 0),
            'employees': data.get('employees', 0)
        }
    
    # Match by website
    def get_apify_data(website):
        if pd.isna(website):
            return pd.Series({'has_fda': False, 'has_ce': False, 'has_iso': False, 'has_rd': False, 'years': 0, 'countries': 0, 'employees': 0})
        
        clean_url = str(website).replace('http://', '').replace('https://', '').replace('www.', '')
        
        for url_key, data in apify_lookup.items():
            if clean_url in url_key or url_key in clean_url:
                return pd.Series(data)
        
        return pd.Series({'has_fda': False, 'has_ce': False, 'has_iso': False, 'has_rd': False, 'years': 0, 'countries': 0, 'employees': 0})
    
    apify_df = df['Website'].apply(get_apify_data)
    df = pd.concat([df, apify_df], axis=1)
    
except Exception as e:
    print(f"Apify data not found: {e}\n")
    df['has_fda'] = False
    df['has_ce'] = False
    df['has_iso'] = False
    df['has_rd'] = False
    df['years'] = 0
    df['countries'] = 0
    df['employees'] = 0

# 4. Load ultra-fast results if available
try:
    with open('/Users/rafaelalmeida/lifetrek-mirror/ultra_fast_results.json') as f:
        ultra_data = json.load(f)
    print(f"Ultra-fast data: {len(ultra_data)} companies\n")
    
    # Merge (will overwrite apify data if both exist)
    for url, data in ultra_data.items():
        clean_url = url.replace('http://', '').replace('https://', '').replace('www.', '')
        
        mask = df['Website'].apply(lambda x: clean_url in str(x) if pd.notna(x) else False)
        if mask.any():
            df.loc[mask, 'has_fda'] = data.get('fda', False)
            df.loc[mask, 'has_ce'] = data.get('ce', False)
            df.loc[mask, 'has_iso'] = data.get('iso', False)
            df.loc[mask, 'has_rd'] = data.get('rd', False)
            df.loc[mask, 'years'] = data.get('yrs', 0)
            df.loc[mask, 'countries'] = data.get('ctry', 0)
            df.loc[mask, 'employees'] = data.get('emp', 0)
except:
    print("Ultra-fast data not yet available\n")

# 5. Calculate V2 Score
print("Calculating V2 scores...\n")

# Global brands lookup
GLOBAL_BRANDS = {
    'J&J': 3.0, 'JOHNSON': 3.0, 'BIOMET': 3.0, 'ZIMMER': 3.0,
    'STRYKER': 3.0, 'STRAUMANN': 1.5, 'NEODENT': 1.5, 'ARTHREX': 1.5,
    'ALIGN': 1.5, 'DENTSPLY': 1.5, 'BIOTRONIK': 1.5
}

def calculate_v2_score(row):
    score = row['Predicted_Score']
    
    # Global brand
    company_upper = str(row['Nome Empresa']).upper()
    for brand, points in GLOBAL_BRANDS.items():
        if brand in company_upper:
            score += points
            break
    
    # Certifications
    cert_count = sum([row.get('has_fda', False), row.get('has_ce', False), row.get('has_iso', False)])
    if cert_count >= 2:
        score += 2.0
    elif cert_count == 1:
        score += 1.0
    
    # R&D
    if row.get('has_rd', False):
        score += 1.5
    
    # Years
    if row.get('years', 0) >= 20:
        score += 1.0
    
    # Countries
    if row.get('countries', 0) >= 10:
        score += 1.0
    
    # Employees
    if row.get('employees', 0) >= 100:
        score += 1.0
    
    return min(10.0, score)

df['V2_Score'] = df.apply(calculate_v2_score, axis=1)

# 6. Add enrichment status
df['Enrichment_Status'] = df.apply(lambda x: 
    'Complete' if (pd.notna(x.get('Scraped_Emails')) and x.get('Scraped_Emails') != '') or (x.get('has_fda') or x.get('has_rd')) 
    else 'Pending', axis=1)

# 7. Sort by V2 score
df = df.sort_values('V2_Score', ascending=False)

# 8. Save master file
output_file = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
df.to_csv(output_file, index=False)

print(f"✅ MASTER FILE CREATED: {output_file}\n")
print(f"Total companies: {len(df)}")
print(f"Enriched (has data): {len(df[df['Enrichment_Status'] == 'Complete'])}")
print(f"Pending: {len(df[df['Enrichment_Status'] == 'Pending'])}")
print(f"\nTop 10 by V2 Score:")
print(df[['Nome Empresa', 'V2_Score', 'Enrichment_Status', 'Scraped_Emails']].head(10).to_string(index=False))
