import os
import sys
import time
import requests
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

UNIPILE_DSN = os.environ.get("UNIPILE_DSN")
UNIPILE_API_KEY = os.environ.get("UNIPILE_API_KEY", "")

# Configuration
INPUT_FILE = "FINAL_LEADS_FOR_UPLOAD - FINAL_LEADS_FOR_UPLOAD.csv.csv"
OUTPUT_FILE = "execution/FINAL_LEADS_ENRICHED_UNIPILE.csv"
TEST_LIMIT = 0 # Set via args

def get_headers():
    return {
        "X-API-KEY": UNIPILE_API_KEY,
        "Content-Type": "application/json"
    }

def get_linkedin_account_id():
    """Fetches the first connected LinkedIn account ID from Unipile."""
    if not UNIPILE_DSN:
        print("Error: UNIPILE_DSN environment variable is not set.")
        return None

    url = f"{UNIPILE_DSN}/api/v1/accounts"
    try:
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        accounts = response.json().get("items", [])
        
        for acc in accounts:
            if acc.get("provider") == "linkedin" and acc.get("status") == "OK":  # adapt status check as needed
                return acc.get("id")
        
        print("No connected LinkedIn account found.")
        return None
    except Exception as e:
        print(f"Error fetching accounts: {e}")
        return None

def search_decision_makers(account_id, company_name):
    """Searches for decision makers in Sales Navigator."""
    # Query: current_company: <Company Name> AND title: (CEO OR "Sales Director" OR Owner)
    # Sales Nav search syntax might vary, adapting for Unipile
    
    query = f'current_company:"{company_name}" AND (title:"CEO" OR title:"Chief Executive Officer" OR title:"Director" OR title:"Owner" OR title:"President")'
    
    # Unipile generic search endpoint - verifying if specialized sales nav endpoint exists
    # If not, use standard peoples search with sales_navigator_people category if supported, or just people search
    url = f"{UNIPILE_DSN}/api/v1/users/search"
    
    params = {
        "account_id": account_id,
        "query": query,
        "count": 3, # We only need a few top matches
    }
    
    try:
        response = requests.get(url, headers=get_headers(), params=params)
        if response.status_code == 429:
            print("Rate limit reached. Waiting...")
            time.sleep(60)
            return search_decision_makers(account_id, company_name)
            
        response.raise_for_status()
        return response.json().get("items", [])
    except Exception as e:
        print(f"Error searching for {company_name}: {e}")
        return []

def main():
    global TEST_LIMIT
    if len(sys.argv) > 1 and sys.argv[1] == "--test-limit":
        TEST_LIMIT = int(sys.argv[2])
        print(f"Running in test mode with limit: {TEST_LIMIT}")

    # Check Env
    if not UNIPILE_DSN:
        print("Please set UNIPILE_DSN in .env")
        return

    # Get Account
    account_id = get_linkedin_account_id()
    if not account_id:
        print("Aborting: No valid LinkedIn account available.")
        return
    
    print(f"Using LinkedIn Account ID: {account_id}")

    # Load Leads
    try:
        df = pd.read_csv(INPUT_FILE)
    except FileNotFoundError:
        print(f"File not found: {INPUT_FILE}")
        return

    print(f"Loaded {len(df)} leads.")
    
    # Filter Pending
    pending_mask = df['enrichment_status'] == 'Pending'
    pending_leads = df[pending_mask]
    
    print(f"Found {len(pending_leads)} pending leads.")
    
    if TEST_LIMIT > 0:
        pending_leads = pending_leads.head(TEST_LIMIT)
        print(f"Limiting to {TEST_LIMIT} rows for testing.")

    processed_count = 0
    
    for index, row in pending_leads.iterrows():
        company = row.get('nome_empresa') or row.get('Nome Empresa') # Handling variable naming
        if not company or pd.isna(company):
            continue
            
        print(f"Enriching: {company}...")
        
        profiles = search_decision_makers(account_id, company)
        
        decision_makers = []
        for p in profiles:
            name = p.get("name", "Unknown")
            headline = p.get("headline", "")
            linkedin_url = p.get("public_profile_url") or p.get("profile_url") or f"https://www.linkedin.com/in/{p.get('provider_id')}"
            decision_makers.append(f"{name} - {headline} ({linkedin_url})")
        
        # Update DataFrame
        df.at[index, 'decision_makers'] = str(decision_makers)
        df.at[index, 'enrichment_status'] = 'Enriched' if decision_makers else 'Failed'
        
        processed_count += 1
        time.sleep(2) # Respect rate limits
        
    # Save
    df.to_csv(OUTPUT_FILE, index=False)
    print(f"Enrichment complete. Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
