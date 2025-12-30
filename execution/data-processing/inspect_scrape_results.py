import urllib.request
import json

API_TOKEN = 'apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C'

# Let's inspect the last dataset to see what we actually got
dataset_id = 'YqLdfRgYsPb3WV0r9'  # Last one from the output

dataset_url = f'https://api.apify.com/v2/datasets/{dataset_id}/items?token={API_TOKEN}'

with urllib.request.urlopen(dataset_url) as response:
    items = json.loads(response.read().decode('utf-8'))
    
    print(f"Total items: {len(items)}")
    print("\n=== SAMPLE ITEM ===")
    if items:
        # Print first item structure
        print(json.dumps(items[0], indent=2))
        
        print("\n=== ALL SEARCH QUERIES ===")
        for item in items:
            query = item.get('searchQuery', {}).get('term', 'Unknown')
            print(f"Query: {query}")
            print(f"  Title: {item.get('title', 'N/A')}")
            print(f"  URL: {item.get('url', 'N/A')}")
            print(f"  Description: {item.get('description', 'N/A')[:100]}...")
            print()
