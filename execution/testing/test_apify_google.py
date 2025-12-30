import urllib.request
import urllib.parse
import json
import time

API_TOKEN = 'apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C'
ACTOR_ID = 'apify~google-search-scraper'

def run_actor():
    url = f'https://api.apify.com/v2/acts/{ACTOR_ID}/runs?token={API_TOKEN}'
    
    # Payload: Google Search for Neodent CEO
    data = {
        "queries": "Neodent Straumann CEO email contact",
        "maxPagesPerQuery": 1,
        "resultsPerPage": 5
    }
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            run_id = result['data']['id']
            print(f"Actor run started. ID: {run_id}")
            return run_id
    except urllib.error.HTTPError as e:
        print(f"Error starting actor: {e.code} - {e.read().decode('utf-8')}")
        return None

def get_run_results(run_id):
    # Poll for status
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
            items = json.loads(response.read().decode('utf-8'))
            print("Items summary:")
            # Just print the first item title/snippet to verify
            if items:
                print(f"Title: {items[0].get('title', 'No Title')}")
                print(f"Description: {items[0].get('description', 'No Description')}")
                print(f"Total Results: {len(items)}")
            else:
                print("No items returned.")
    else:
        print(f"Run ended with status: {status}")

if __name__ == "__main__":
    run_id = run_actor()
    if run_id:
        get_run_results(run_id)
