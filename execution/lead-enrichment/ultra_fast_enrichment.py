"""
ULTRA-FAST ENRICHMENT - 10X SPEED BOOST
- 100 concurrent requests per batch (vs 10)
- Multiple Apify actors running in parallel (async)
- 10s timeout (vs 30s)
- Batch processing optimized
"""

from apify_client import ApifyClient
import pandas as pd
import json
import asyncio
from concurrent.futures import ThreadPoolExecutor

API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"

def run_apify_batch(batch_websites, batch_num):
    """Run one Apify batch (thread-safe)"""
    client = ApifyClient(API_TOKEN)
    
    print(f"[Batch {batch_num}] Starting {len(batch_websites)} websites...")
    
    run_input = {
        "startUrls": [{"url": site['url']} for site in batch_websites],
        "linkSelector": "a[href]",
        "globs": [],
        "excludes": [{"glob": "/**/*.{png,jpg,jpeg,pdf,svg,gif,webp,css,js,woff,ttf}"}],
        "pageFunction": """
async function pageFunction(context) {
    const $ = context.jQuery;
    const html = $('body').html();
    if (!html) return {url: context.request.url};
    
    const h = html.toLowerCase();
    
    return {
        url: context.request.url,
        fda: /fda/.test(h),
        ce: /ce.mark/.test(h),
        iso: /iso.?\\d{4}/.test(h),
        rd: /pesquisa|research|p.d|r.d/.test(h),
        yrs: (h.match(/(\\d+).anos/) || [0,0])[1],
        ctry: (h.match(/(\\d+).pa.ses/) || [0,0])[1],
        emp: (h.match(/(\\d+).funcion/) || [0,0])[1],
        mfg: /f.brica|ind.stria/.test(h),
        dist: /distribui|importa/.test(h)
    };
}
        """,
        "injectJQuery": True,
        "proxyConfiguration": {"useApifyProxy": True},
        "maxPagesPerCrawl": len(batch_websites),
        "maxConcurrency": 100,  # 10X MORE CONCURRENT!
        "pageLoadTimeoutSecs": 10,  # 3X FASTER TIMEOUT
        "pageFunctionTimeoutSecs": 5
    }
    
    try:
        run = client.actor("apify/web-scraper").call(run_input=run_input)
        
        results = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            results.append(item)
        
        print(f"[Batch {batch_num}] ✅ Complete: {len(results)} scraped")
        return results
        
    except Exception as e:
        print(f"[Batch {batch_num}] ❌ Failed: {str(e)}")
        return []

# Load companies
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')

websites = []
for idx, row in df.iterrows():
    website = row.get('Website')
    if website and str(website) != 'nan':
        if not website.startswith('http'):
            website = 'http://' + website
        websites.append({
            'url': website,
            'company': row['Nome Empresa']
        })

print(f"=== ULTRA-FAST ENRICHMENT ===")
print(f"Total websites: {len(websites)}")
print(f"Concurrency: 100x per batch")
print(f"Strategy: Parallel Apify instances\n")

# Split into 3 batches for parallel processing
BATCH_SIZE = len(websites) // 3 + 1
batches = [
    websites[i:i+BATCH_SIZE] 
    for i in range(0, len(websites), BATCH_SIZE)
]

print(f"Running {len(batches)} batches in PARALLEL...\n")

# Run all batches in parallel using ThreadPoolExecutor
all_results = []
with ThreadPoolExecutor(max_workers=3) as executor:
    futures = [
        executor.submit(run_apify_batch, batch, i+1) 
        for i, batch in enumerate(batches)
    ]
    
    for future in futures:
        batch_results = future.result()
        all_results.extend(batch_results)

# Save
output = {url['url']: data for data in all_results for url in [{'url': data.get('url', '')}] if data}

with open('/Users/rafaelalmeida/lifetrek-mirror/ultra_fast_results.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n✅ COMPLETE!")
print(f"Total scraped: {len(output)}/{len(websites)}")
print(f"Success rate: {len(output)/len(websites)*100:.1f}%")
print(f"Saved to: ultra_fast_results.json")
