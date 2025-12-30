#!/usr/bin/env python3
"""
LinkedIn Enrichment via Apify (Small Test)
Cost: ~$4 USD
- 50 existing companies (150 profiles)
- 100 new profile discoveries
"""

from apify_client import ApifyClient
import pandas as pd
import json
import os

# Apify token
APIFY_TOKEN = "apify_api_I1Oy2jUQiZy0xvOQUeHlHwsg22COtV3qQLXH"
client = ApifyClient(APIFY_TOKEN)

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
OUTPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/linkedin_enrichment_apify.csv'

def enrich_existing_companies():
    """Part 1: Enrich existing companies with decision makers"""
    print("=== PART 1: Enriching Existing Companies ===")
    
    df = pd.read_csv(INPUT_FILE)
    
    # Get companies with LinkedIn URLs
    has_linkedin = df['LinkedIn_Company'].notna()
    companies = df[has_linkedin]['LinkedIn_Company'].unique().tolist()
    
    # Take first 50
    companies_sample = companies[:50]
    print(f"Targeting {len(companies_sample)} companies")
    
    # Configure Apify input
    run_input = {
        "profileScraperMode": "Full ($8 per 1k)",
        "maxItems": 200,  # Max 200 profiles total
        "companies": companies_sample,
        "jobTitles": ["CEO", "Founder", "Co-Founder", "Director", "VP", "President", 
                      "Diretor", "Presidente", "Fundador", "Sócio"],
        "seniorityLevelIds": ["300", "310", "320"],  # Director, VP, C-Level
        "companyBatchMode": "all_at_once",
        "maxItemsPerCompany": 3,  # Max 3 people per company
    }
    
    print("Starting Apify Company Employees Scraper...")
    print(f"Expected profiles: ~{len(companies_sample) * 3}")
    
    try:
        run = client.actor("Vb6LZkh4EqRlR0Ka9").call(run_input=run_input)
        
        results = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            results.append(item)
        
        print(f"✅ Found {len(results)} profiles from existing companies")
        return results
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def discover_new_profiles():
    """Part 2: Discover new profiles via search"""
    print("\n=== PART 2: Discovering New Profiles ===")
    
    # Configure search input
    run_input = {
        "profileScraperMode": "Full",
        "maxItems": 100,
        "currentJobTitles": ["CEO", "Founder", "Director", "VP", "Diretor", "Presidente"],
        "industryIds": ["3", "14"],  # Healthcare, Medical Devices
        "locations": ["Brazil"],
        "seniorityLevelIds": ["300", "310", "320"],  # Director, VP, C-Level
        "startPage": 1,
        "takePages": 3,
    }
    
    print("Starting Apify People Search Scraper...")
    print("Searching for: Healthcare/Medical executives in Brazil")
    
    try:
        run = client.actor("M2FMdjRVeF1HPGFcc").call(run_input=run_input)
        
        results = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            results.append(item)
        
        print(f"✅ Found {len(results)} new profiles")
        return results
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def process_results(existing, new):
    """Process and save results"""
    print("\n=== Processing Results ===")
    
    all_results = existing + new
    
    processed = []
    for item in all_results:
        processed.append({
            'name': item.get('fullName'),
            'first_name': item.get('firstName'),
            'last_name': item.get('lastName'),
            'title': item.get('title'),
            'company': item.get('companyName'),
            'company_linkedin': item.get('companyUrl'),
            'email': item.get('email'),
            'phone': item.get('phoneNumber'),
            'linkedin_url': item.get('profileUrl'),
            'location': item.get('location'),
            'industry': item.get('industry'),
            'connections': item.get('connectionsCount'),
            'source': 'existing_company' if item in existing else 'new_discovery'
        })
    
    # Save to CSV
    results_df = pd.DataFrame(processed)
    results_df.to_csv(OUTPUT_FILE, index=False)
    
    # Print stats
    print(f"\n✅ RESULTS SAVED: {OUTPUT_FILE}")
    print(f"\nTotal profiles: {len(processed)}")
    print(f"  - From existing companies: {len(existing)}")
    print(f"  - New discoveries: {len(new)}")
    print(f"\nData quality:")
    print(f"  - With email: {results_df['email'].notna().sum()} ({results_df['email'].notna().sum()/len(results_df)*100:.1f}%)")
    print(f"  - With phone: {results_df['phone'].notna().sum()} ({results_df['phone'].notna().sum()/len(results_df)*100:.1f}%)")
    print(f"  - With location: {results_df['location'].notna().sum()} ({results_df['location'].notna().sum()/len(results_df)*100:.1f}%)")
    
    # Top companies
    print(f"\nTop companies:")
    print(results_df['company'].value_counts().head(10))
    
    return results_df

def main():
    print("=== APIFY LINKEDIN ENRICHMENT (SMALL TEST) ===")
    print("Estimated cost: ~$4 USD\n")
    
    # Part 1: Existing companies
    existing = enrich_existing_companies()
    
    # Part 2: New discoveries
    new = discover_new_profiles()
    
    # Process and save
    if existing or new:
        process_results(existing, new)
    else:
        print("\n❌ No results found")

if __name__ == "__main__":
    main()
