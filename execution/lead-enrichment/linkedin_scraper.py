"""
LinkedIn Company Scraper for all 66 companies
Uses Apify actor: UwSdACBp7ymaGUJjS
"""

from apify_client import ApifyClient
import pandas as pd
import json
import re

API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"
client = ApifyClient(API_TOKEN)

# Load companies
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')
high_scores = df[df['Predicted_Score'] >= 8.0].copy()

print(f"=== LINKEDIN SCRAPER: {len(high_scores)} companies ===\n")

# Prepare company URLs for LinkedIn
companies = []
for idx, row in high_scores.iterrows():
    company = row['Nome Empresa']
    # Clean and create LinkedIn slug
    slug = company.lower()
    slug = slug.replace('ltda', '').replace('s.a.', '').replace('s/a', '').replace('epp', '')
    slug = re.sub(r'\s+-\s+.*', '', slug)  # Remove "- BRAND" suffixes
    slug = slug.strip().replace(' ', '-').replace('&', 'and')
    slug = re.sub(r'[^\w-]', '', slug)  # Remove special chars
    
    linkedin_url = f"https://www.linkedin.com/company/{slug}/"
    companies.append(linkedin_url)

print(f"Generated {len(companies)} LinkedIn URLs...\n")

# Run LinkedIn Company Scraper
run_input = {
    "companies": companies  # Use company URLs, not searches
}

print("Starting LinkedIn scraper...")
try:
    run = client.actor("UwSdACBp7ymaGUJjS").call(run_input=run_input)
    
    print("Fetching results...")
    linkedin_data = []
    
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        linkedin_data.append(item)
        company_name = item.get('name', 'Unknown')
        employees = item.get('staffCount', 0)
        founded = item.get('foundedOn', {}).get('year', 0)
        
        print(f"✅ {company_name}")
        print(f"   Employees: {employees}")
        print(f"   Founded: {founded}")
        print()
    
    # Save results
    with open('/Users/rafaelalmeida/lifetrek-mirror/linkedin_enrichment_results.json', 'w') as f:
        json.dump(linkedin_data, f, indent=2)
    
    print(f"\n✅ Successfully scraped {len(linkedin_data)} companies from LinkedIn")
    print(f"   Saved to linkedin_enrichment_results.json")
    
except Exception as e:
    print(f"❌ LinkedIn scraping failed: {str(e)}")
    import traceback
    traceback.print_exc()
