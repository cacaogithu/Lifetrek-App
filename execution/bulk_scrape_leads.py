import urllib.request
import urllib.parse
import json
import time
import csv
import re

API_TOKEN = 'apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C'
ACTOR_ID = 'apify~google-search-scraper'
INPUT_CSV = '/Users/rafaelalmeida/lifetrek-mirror/leads_analysis_output.csv'
OUTPUT_CSV = '/Users/rafaelalmeida/lifetrek-mirror/leads_enriched_final.csv'

def get_high_score_leads():
    leads = []
    try:
        with open(INPUT_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    score = float(row.get('Predicted_Score', 0))
                    if score >= 8.0:
                        leads.append(row)
                except ValueError:
                    continue
    except Exception as e:
        print(f"Error reading CSV: {e}")
    return leads

def run_actor(queries):
    url = f'https://api.apify.com/v2/acts/{ACTOR_ID}/runs?token={API_TOKEN}'
    
    # Payload: Google Search for Neodent CEO
    # Queries separated by newline
    queries_str = "\n".join(queries)
    
    data = {
        "queries": queries_str,
        "maxPagesPerQuery": 1,
        "resultsPerPage": 3,
        "countryCode": "br",
        "languageCode": "pt-BR"
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['data']['id']
    except urllib.error.HTTPError as e:
        print(f"Error starting actor: {e.code} - {e.read().decode('utf-8')}")
        return None

def get_dataset(run_id):
    while True:
        status_url = f'https://api.apify.com/v2/actor-runs/{run_id}?token={API_TOKEN}'
        with urllib.request.urlopen(status_url) as response:
            status_data = json.loads(response.read().decode('utf-8'))['data']
            status = status_data['status']
            print(f"Status: {status}")
            
            if status in ['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED']:
                break
        time.sleep(5)
        
    if status == 'SUCCEEDED':
        dataset_id = status_data['defaultDatasetId']
        print(f"Run succeeded. Fetching dataset: {dataset_id}")
        
        dataset_url = f'https://api.apify.com/v2/datasets/{dataset_id}/items?token={API_TOKEN}'
        with urllib.request.urlopen(dataset_url) as response:
            return json.loads(response.read().decode('utf-8'))
    return []

def extract_emails(text):
    if not text: return []
    # simple email regex
    return re.findall(r'[\w\.-]+@[\w\.-]+', text)

def main():
    leads = get_high_score_leads()
    print(f"Found {len(leads)} high scoring leads.")
    
    if not leads:
        print("No leads to process.")
        return

    # Generate queries
    # Map query to company name for later joining
    query_map = {}
    queries = []
    
    for lead in leads:
        company = lead['Nome Empresa']
        query = f'"{company}" CEO diretor email contato'
        queries.append(query)
        query_map[query] = company

    # Limit to top 15 to avoid timeout/limits in this execution if list is huge
    # The user asked to process "these companies", but let's be safe.
    # The file has 200 lines, probably ~50 high scores. 50 queries might take a while.
    # I'll process all of them if the actor handles it. Google Scraper usually handles batches.
    
    BATCH_SIZE = 20
    all_results = []
    
    # Process in batches
    for i in range(0, len(queries), BATCH_SIZE):
        batch_queries = queries[i:i+BATCH_SIZE]
        print(f"Processing batch {i} to {i+BATCH_SIZE}...")
        
        run_id = run_actor(batch_queries)
        if run_id:
            items = get_dataset(run_id)
            all_results.extend(items)
        else:
            print("Batch failed.")
            
    # Aggregate results back to leads
    # Create a dictionary of Company -> Found Info
    company_info = {lead['Nome Empresa']: {'emails': set(), 'snippets': []} for lead in leads}
    
    for item in all_results:
        search_query = item.get('searchQuery', {}).get('term', '')
        # The query might be slightly different if Apify normalized it, but usually it matches
        # Or we can look up which company's query this was.
        
        # item['searchQuery']['term'] should match our input query string
        
        target_company = query_map.get(search_query)
        if not target_company:
            # Fallback check
            for original_query, company in query_map.items():
                if original_query in search_query:
                    target_company = company
                    break
        
        if target_company:
            title = item.get('title', '')
            desc = item.get('description', '')
            text_content = f"{title} {desc}"
            
            emails = extract_emails(text_content)
            for email in emails:
                if not email.endswith('w3.org') and not email.endswith('google.com'): # filtering noise
                    company_info[target_company]['emails'].add(email)
            
            # Save relevant snippets (e.g. LinkedIn profiles)
            if 'linkedin.com' in item.get('url', ''):
                company_info[target_company]['snippets'].append(item.get('url'))

    # Write output
    fieldnames = list(leads[0].keys()) + ['Scraped_Emails', 'Scraped_Social_Links']
    
    with open(OUTPUT_CSV, 'w', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for lead in leads:
            company = lead['Nome Empresa']
            info = company_info.get(company, {})
            
            lead['Scraped_Emails'] = ", ".join(info.get('emails', []))
            lead['Scraped_Social_Links'] = ", ".join(info.get('snippets', [])[:3]) # limit to 3 links
            writer.writerow(lead)
            
    print(f"Saved enriched leads to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
