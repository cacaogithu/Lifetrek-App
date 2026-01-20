"""
Fetch dataset from the latest Apify job (New Leads Enrichment)
Saves to cheerios_results_new.json
"""

from apify_client import ApifyClient
import json

API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"
client = ApifyClient(API_TOKEN)

# Get latest run
print("Fetching latest run...")
last_run_client = client.actor("apify/cheerio-scraper").last_run()
run_info = last_run_client.get()

print(f"Run ID: {run_info['id']}")
print(f"Status: {run_info['status']}")

# Get dataset items
print("Fetching dataset items...")
dataset = client.dataset(run_info['defaultDatasetId'])
items = []
for item in dataset.iterate_items():
    items.append(item)

print(f"Fetched {len(items)} items")

# Check unique companies
companies = set(item.get('company') for item in items if item.get('company'))
print(f"Unique companies enriched: {len(companies)}")

# Save
with open('/Users/rafaelalmeida/lifetrek-mirror/cheerio_results_new.json', 'w') as f:
    json.dump(items, f, indent=2)

print("Saved to cheerio_results_new.json")
