"""
Mass LinkedIn Enrichment Script
Uses Apify: apify/linkedin-company-scraper
"""

from apify_client import ApifyClient
import pandas as pd
import json
import time

API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"
client = ApifyClient(API_TOKEN)

def enrich_linkedin_mass():
    print("=== MASS LINKEDIN ENRICHMENT ===")
    
    # 1. Load Master CSV
    try:
        df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')
    except:
        print("Master CSV not found")
        return

    # 2. Key Targets
    targets = df[
        (df['employees'] == 0) & 
        (df['V2_Score'] >= 5.0)
    ].copy()
    
    print(f"Total Companies: {len(df)}")
    print(f"Candidates for LinkedIn Enrichment: {len(targets)}")
    
    # Batch Size: Process all remaining high value targets
    # We found 82 remaining in the check.
    batch = targets # No limit, take all
    print(f"Processing Batch: {len(batch)} companies")
    
    search_queries = batch['Nome Empresa'].tolist()
    
    # 3. Google Search for LinkedIn URLs
    print(f"🔎 Converting {len(search_queries)} names to LinkedIn URLs via Google...")
    companies_urls = []
    
    google_run_input = {
        "queries": "\n".join([f"site:linkedin.com/company {name}" for name in search_queries]),
        "maxPagesPerQuery": 1,
        "resultsPerPage": 1,
        "countryCode": "br"
    }
    
    try:
        print("   Running Google Search...")
        run_g = client.actor("apify/google-search-scraper").call(run_input=google_run_input)
        
        # Get Results
        dataset_g = client.dataset(run_g["defaultDatasetId"])
        for item in dataset_g.iterate_items():
            results = item.get('organicResults', [])
            if results:
                url = results[0].get('url')
                if 'linkedin.com/company' in url:
                    companies_urls.append(url)
                    print(f"   Found: {url}")
                    
    except Exception as e:
        print(f"Google Search failed: {e}")
        
    print(f"✅ Found {len(companies_urls)} Valid LinkedIn URLs")
    
    if not companies_urls:
        print("No URLs found. Exiting.")
        return

    # 4. LinkedIn Scraper
    run_input = {
        "companies": companies_urls,
        "deepScrape": True,
        "maxConcurrency": 5,
        "minDelay": 5
    }
    
    print(f"🚀 Launching LinkedIn Scraper for {len(companies_urls)} URLs...")
    
    # Using User's validated Actor ID (or harvestapi/linkedin-company-scraper if we wanted)
    # Sticking to what worked: UwSdACBp7ymaGUJjS
    try:
        run = client.actor("UwSdACBp7ymaGUJjS").call(run_input=run_input)
        print("✅ Run Finished!")
        
        # Fetch
        dataset = client.dataset(run["defaultDatasetId"])
        results = []
        for item in dataset.iterate_items():
            results.append(item)
            
        # Save Raw
        with open('/Users/rafaelalmeida/lifetrek-mirror/linkedin_mass_results.json', 'w') as f:
            json.dump(results, f, indent=2)
            
        print(f"Saved {len(results)} profiles to linkedin_mass_results.json")

        # 5. Merge Logic
        print("Merging data...")
        updates = 0
        
        for item in results:
            found_name = item.get('name') 
            employees = item.get('employeeCount', 0)
            
            # Robust Date Parsing
            founded_on = item.get('foundedOn') or {}
            founded_year = founded_on.get('year', 0)
            
            # Find in DF (Fuzzy match)
            # Strategy: Search in original batch to map URL back to Company Name?
            # Or iterate DF
            
            # Simple contains check
            if found_name:
                mask = df['Nome Empresa'].astype(str).str.contains(found_name, case=False, regex=False) | \
                       df['Nome Empresa'].apply(lambda x: str(x) in str(found_name))
                
                if mask.any():
                    idx = df[mask].index[0]
                    
                    if employees > 0:
                        df.at[idx, 'employees'] = max(df.at[idx, 'employees'], employees)
                    
                    curr_years = df.at[idx, 'years']
                    if founded_year > 1900:
                        age = 2025 - founded_year
                        df.at[idx, 'years'] = max(curr_years, age)
                        
                    df.at[idx, 'LinkedIn'] = item.get('linkedinUrl')
                    updates += 1
                    
        df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)
        print(f"✅ Updated {updates} companies in MASTER_ENRICHED_LEADS.csv")
        
    except Exception as e:
        print(f"Scraper failed: {e}")

if __name__ == "__main__":
    enrich_linkedin_mass()
