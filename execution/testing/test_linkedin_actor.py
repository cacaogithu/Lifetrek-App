"""
Test LinkedIn Scraper for Decision Makers
Uses Apify Actor: UwSdACBp7ymaGUJjS (User Provided)
"""

from apify_client import ApifyClient
import json

# User's Token
API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"
client = ApifyClient(API_TOKEN)

# Prepare the Actor input
# Trying to target "Implacil Osstem" (Found in our new leads)
run_input = {
    "companies": [
        "https://www.linkedin.com/company/implacil-osstem",
        "https://www.linkedin.com/company/neodent"
    ],
    "searches": [
        "Implacil Osstem",
        "Neodent"
    ],
    # Optional settings
    "deepScrape": True,
    # "scrapePeople": True # Commenting out uncertain flag
}

print("🚀 Launching LinkedIn Scraper Test...")
# Using the specific Actor ID provided by user
try:
    run = client.actor("UwSdACBp7ymaGUJjS").call(run_input=run_input)
    
    print(f"Run Finished: {run['status']}")
    
    # Fetch results
    results = []
    dataset = client.dataset(run["defaultDatasetId"])
    for item in dataset.iterate_items():
        results.append(item)
        
    print(f"✅ Extracted {len(results)} items")
    
    # Save to inspect
    with open('../../.tmp/linkedin_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
        
except Exception as e:
    print(f"❌ Error: {e}")
    # Fallback suggestion if ID is invalid
    print("Note: If Actor ID is invalid, we might need to use 'apify/linkedin-company-scraper'")
