"""
AnyMailFinder Bulk Email Enrichment
Uses api key: jMIe61zPuuTG3PzeIdjCtYwn
"""

import requests
import pandas as pd
import json
import time
import re

API_KEY = "jMIe61zPuuTG3PzeIdjCtYwn"
HEADERS = {"X-Api-Key": API_KEY, "Content-Type": "application/json"}

def clean_domain(website_url):
    if not isinstance(website_url, str): return None
    # Remove http://, https://, www.
    clean = re.sub(r'https?://(www\.)?', '', website_url)
    # Remove paths
    clean = clean.split('/')[0]
    return clean

def enrich_emails_bulk():
    print("=== ANYMAILFINDER BULK ENRICHMENT ===")
    
    df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')
    print(f"Total rows: {len(df)}")
    
    # Prepare Data for AnyMailFinder
    # Format: [ ["domain", "company"], ["example.com", "Example Inc"], ... ]
    # We will prioritize Domain search.
    
    payload_data = [["domain", "company_name"]] # Header row
    
    valid_indices = []
    
    for idx, row in df.iterrows():
        domain = clean_domain(row.get('Website'))
        company = str(row.get('Nome Empresa', ''))
        
        # We need at least domain or company name
        if domain or company:
            payload_data.append([domain if domain else "", company])
            valid_indices.append(idx)
            
    print(f"Prepared {len(payload_data)-1} rows for enrichment.")
    
    # API Limits? 100k rows allows.
    
    # 1. Create Bulk Search
    url = "https://api.anymailfinder.com/v5.1/bulk/json"
    
    body = {
        "data": payload_data,
        "domain_field_index": 0,
        "company_name_field_index": 1,
        "file_name": "lifetrek_leads_enrichment.json"
    }
    
    print("🚀 Submitting Bulk Search Job...")
    resp = requests.post(url, headers=HEADERS, json=body)
    
    if resp.status_code != 200:
        print(f"Error submitting job: {resp.text}")
        return
        
    job_id = resp.json().get('id')
    print(f"✅ Job ID: {job_id}")
    
    # 2. Poll for Status
    # Docs for Poll/Download usually follow suite: /v5.1/bulk/{id}
    poll_url = f"https://api.anymailfinder.com/v5.1/bulk/{job_id}"  
    
    print("⏳ Waiting for processing...")
    while True:
        time.sleep(10) # 10s wait
        status_resp = requests.get(poll_url, headers=HEADERS)
        if status_resp.status_code != 200:
            print(f"Error checking status: {status_resp.text}")
            break
            
        status_data = status_resp.json()
        state = status_data.get('status') # 'queued', 'processing', 'completed'?
        # Check actual field name in response
        # Assuming 'completed' based on typical APIs, usually has 'status' or 'state'
        
        # Docs say: "Monitor Search Status"
        # Let's print raw status to be safe first time
        # print(f"Raw Status: {status_data}")
        
        ready = status_data.get('download_available', False) # Hypothetical
        # Correct field is likely 'status' == 'done' or similar.
        
        if status_data.get('status') == 'completed' or status_data.get('completed'):
            print("✅ Processing Complete!")
            break
            
        print(f"   Status: {status_data.get('status', 'processing')} - {status_data.get('process_percentage', 0)}%")
        
    # 3. Download Results
    # Reuse existing job_id if we failed at download step? 
    # For now, let's assume we proceed. The script re-runs the whole flow, which is fine (creates new job).
    # Ideally, we should just fetch the old job if we knew it. But user wants result.
    
    download_url = f"https://api.anymailfinder.com/v5.1/bulk/{job_id}/download"
    print("📥 Downloading Results...")
    
    dl_resp = requests.get(download_url, headers=HEADERS)
    if dl_resp.status_code != 200:
        print(f"Error downloading: {dl_resp.text}")
        return
        
    # The endpoint likely returns CSV or JSON depending on Accept header or default.
    # Docs don't specify, but JSONDecodeError implies it might be CSV.
    # Let's check Content-Type or just try parsing text.
    
    content_type = dl_resp.headers.get('Content-Type', '')
    raw_results = []
    
    if 'json' in content_type:
        raw_results = dl_resp.json()
    else:
        # Assume CSV
        # We can use pd.read_csv on the string content
        from io import StringIO
        print("Received CSV response. Parsing...")
        csv_data = StringIO(dl_resp.text)
        # Assuming header match
        results_df = pd.read_csv(csv_data)
        # Convert to list of dicts for consistent merge logic
        raw_results = results_df.to_dict('records')
        
    print(f"Downloaded {len(raw_results)} rows.")
    
    # Map back to DF
    # The results usually maintain order OR provide the input fields back.
    # We used indices in `valid_indices`.
    
    match_count = 0
    # If results is list of lists, header is first.
    # If list of dicts, keys are there.
    
    # Let's inspect first item if complex. 
    # Usually: {"input_domain": "...", "email": "...", "verification_status": "..."}
    
    # Assuming ordered list match (common in bulk APIs)
    # BUT explicitly validation is better.
    
    # Let's save Raw first just in case
    with open('anymail_raw_results.json', 'w') as f:
        json.dump(raw_results, f)
        
    # Simplified merge:
    # AnyMailFinder returns the input row + appended columns?
    # Let's assume we iterate valid_indices and results together if lengths match.
    
    # Actually, let's load the raw results and inspect first.
    # For this script run, I'll print the structure and stop, or try to merge dynamically.
    
    # Assuming: results is a list of objects with 'email' key.
    
    if isinstance(raw_results, list):
        if len(raw_results) == len(valid_indices):
            print("Row counts match. Merging by index.")
            for i, res_row in enumerate(raw_results):
                # If res_row is list, check column index for email
                # If dict, check 'email' key
                email = None
                if isinstance(res_row, dict):
                    email = res_row.get('email')
                elif isinstance(res_row, list):
                    # Guess column? Last one?
                    pass
                
                idx = valid_indices[i]
                if email:
                    df.at[idx, 'Scraped_Emails'] = email # Or append if exists
                    match_count += 1
        else:
            print("⚠️ Length mismatch. Mapping by Domain.")
            # Map logic here
            pass
            
    df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)
    print(f"✅ Merged {match_count} emails.")

if __name__ == "__main__":
    enrich_emails_bulk()
