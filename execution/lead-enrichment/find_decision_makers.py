"""
Find Decision Makers
Uses Apify Google Search to find CEO/Director profiles for Top High-Value Leads.
"""

import pandas as pd
from apify_client import ApifyClient
import json
import time

# API Token
API_TOKEN = "apify_api_I1Oy2jUQiZy0xvOQUeHlHwsg22COtV3qQLXH"
client = ApifyClient(API_TOKEN)

def find_decision_makers():
    print("=== FINDING DECISION MAKERS (TOP 108) ===")
    
    # 1. Load Data
    df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')
    
    # 2. Filter High Value Targets (Score >= 7.0)
    # And check if we already have decision maker info to avoid re-work?
    # 'Decision_Makers' column might be empty or have generic info.
    
    # Let's target Score >= 7.0
    targets_mask = (df['V2_Score'] >= 7.0)
    targets = df[targets_mask]
    
    print(f"Total High Value Targets: {len(targets)}")
    
    # Prepare Queries
    # Format: site:linkedin.com/in ("CEO" OR "Diretor" OR "Sócio" OR "Presidente") "Nome da Empresa"
    
    queries = []
    indices_map = []
    
    for idx, row in targets.iterrows():
        company = row['Nome Empresa']
        # query = f'site:linkedin.com/in ("CEO" OR "Diretor" OR "Sócio" OR "Presidente") "{company}"'
        # Simpler query often works better
        query = f'site:linkedin.com/in {company} (CEO OR Diretor OR Sócio)'
        queries.append(query)
        indices_map.append(idx)
        
    print(f"Prepared {len(queries)} search queries.")
    
    # 3. Run Google Search Scraper
    # Actor: apify/google-search-scraper
    
    # Batch strings (newlines)
    queries_str = "\n".join(queries)
    
    run_input = {
        "queries": queries_str,
        "resultsPerPage": 3, # Get top 3 to ensure we find a person
        "maxPagesPerQuery": 1,
        "countryCode": "br",
        "mobileResults": False,
        "includeUnfilteredResults": False,
        "saveHtml": False,
        "saveHtmlToKeyValueStore": False,
        "includeIcons": False,
    }
    
    print("🚀 Launching Google Search for Decision Makers...")
    run = client.actor("apify/google-search-scraper").call(run_input=run_input)
    
    print("✅ Search Complete. Fetching results...")
    
    # 4. Process Results
    dataset_items = client.dataset(run["defaultDatasetId"]).list_items().items
    
    updates_count = 0
    
    # Map results back to DF
    # We need to map query -> result -> dataframe index.
    # The result items usually contain 'searchQuery.term'.
    
    # Create a map of Query -> Index
    query_to_idx = {q: idx for q, idx in zip(queries, indices_map)}
    
    for item in dataset_items:
        query_term = item.get('searchQuery', {}).get('term')
        organic_results = item.get('organicResults', [])
        
        if not query_term or not organic_results:
            continue
            
        idx = query_to_idx.get(query_term)
        if idx is None:
            continue
            
        # Find best person
        best_person = None
        best_link = None
        
        for res in organic_results:
            title = res.get('title', '')
            link = res.get('url', '')
            snippet = res.get('description', '')
            
            # Simple heuristic: If title contains target roles
            if any(role in title.lower() for role in ['ceo', 'diretor', 'sócio', 'socio', 'presidente', 'founder', 'fundador']):
                best_person = title.split("-")[0].strip() # "Name - Title" format usually
                best_link = link
                break
                
        # If no explicit title match, take first one (often the right one for specific queries)
        if not best_person and organic_results:
            first = organic_results[0]
            best_person = first.get('title', '').split("-")[0].strip()
            best_link = first.get('url', '')
            
        if best_person:
            df.at[idx, 'Decision_Makers'] = best_person
            df.at[idx, 'LinkedIn_Profiles'] = best_link # Preserving Company LinkedIn in 'LinkedIn' col
            updates_count += 1
            print(f"🎯 Found: {best_person} for {df.at[idx, 'Nome Empresa']}")
            
    print(f"✅ Updated {updates_count} decision makers.")
    df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)

if __name__ == "__main__":
    find_decision_makers()
