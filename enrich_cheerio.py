"""
ULTRA-LIGHT FAST ENRICHMENT
Uses Apify Cheerio Scraper (No Browser = 10-100x Faster, Low Memory)
Perfect for processing hundreds of sites on Free Tier
"""

from apify_client import ApifyClient
import pandas as pd
import json

API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"
client = ApifyClient(API_TOKEN)

# Load Master CSV
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')

# Filter for Pending companies with websites
pending = df[
    (df['Enrichment_Status'] == 'Pending') & 
    (df['Website'].notna()) & 
    (df['Website'] != '')
].copy()

print(f"=== CHEERIO FAST ENRICHMENT ===")
print(f"Total pending: {len(pending)}")

# Prepare URLs
start_urls = []
for idx, row in pending.iterrows():
    url = str(row['Website'])
    if not url.startswith('http'):
        url = 'http://' + url
    start_urls.append({"url": url, "userData": {"company": row['Nome Empresa']}})

print(f"Valid URLs to scrape: {len(start_urls)}")

# Run in one big batch (Cheerio is light enough)
run_input = {
    "startUrls": start_urls,
    "linkSelector": "a[href]",
    "pseudoUrls": [],
    "globPatterns": [],
    "pageFunction": """
async function pageFunction(context) {
    const { request, $ } = context;
    const html = $('body').text().toLowerCase(); // Get text content only for regex
    
    // Regex Patterns
    const has_fda = /fda|food\s*and\s*drug/.test(html);
    const has_ce = /ce\s*mark|conformit[ée]/.test(html);
    const has_iso = /iso\s*\d{4}/.test(html);
    const has_anvisa = /anvisa/.test(html);
    
    const has_rd = /pesquisa|research|p\s*\+?\s*d|r\s*\+?\s*d|inovação|innovation/.test(html);
    const has_patents = /patente|patent/.test(html);
    
    const years_match = html.match(/(\d+)\s*(?:anos|years)/);
    const countries_match = html.match(/(\d+)\s*(?:pa[íi]ses|countries)/);
    const employees_match = html.match(/(\d+)\s*(?:funcion[áa]rios|colaboradores|employees)/);
    
    // Business model
    const is_manufacturer = /f[áa]brica|manufatura|ind[úu]stria|factory|manufacturer/.test(html);
    const is_distributor = /distribui|importa|distributor/.test(html);
    
    const has_export = /export|exporta/.test(html);
    const has_global = /global|mundial|international/.test(html);

    return {
        url: request.url,
        company: request.userData.company,
        has_fda, has_ce, has_iso, has_anvisa,
        has_rd, has_patents,
        years: years_match ? parseInt(years_match[1]) : 0,
        countries: countries_match ? parseInt(countries_match[1]) : 0,
        employees: employees_match ? parseInt(employees_match[1]) : 0,
        is_manufacturer, is_distributor,
        has_export, has_global
    };
}
    """,
    "proxyConfiguration": {"useApifyProxy": True},
    "maxConcurrency": 50, # High concurrency
    "ignoreSslErrors": True,
    "additionalMimeTypes": [],
    "maxRequestRetries": 1,
    "pageLoadTimeoutSecs": 15
}

print(f"\n🚀 Launching Cheerio Scraper for {len(start_urls)} sites...")
try:
    run = client.actor("apify/cheerio-scraper").call(run_input=run_input)
    
    results = []
    dataset = client.dataset(run["defaultDatasetId"])
    for item in dataset.iterate_items():
        results.append(item)
    
    print(f"✅ Scraped {len(results)} sites successfully!")
    
    # Save results
    with open('/Users/rafaelalmeida/lifetrek-mirror/cheerio_results.json', 'w') as f:
        json.dump(results, f, indent=2)
        
except Exception as e:
    print(f"❌ Scraping failed: {e}")

