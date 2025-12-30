"""
FAST PARALLEL ENRICHMENT - ALL 200 COMPANIES
Uses Apify Web Scraper with batch processing
"""

from apify_client import ApifyClient
import pandas as pd
import json

API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"
client = ApifyClient(API_TOKEN)

# Load ALL companies (not just high-scorers)
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')

print(f"=== FAST ENRICHMENT: {len(df)} companies ===\n")

# Build website list
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

print(f"Found {len(websites)} valid websites\n")

# Run in larger batches for speed (50 at a time)
BATCH_SIZE = 50
all_results = {}

for batch_num in range(0, len(websites), BATCH_SIZE):
    batch = websites[batch_num:batch_num+BATCH_SIZE]
    batch_end = min(batch_num+BATCH_SIZE, len(websites))
    
    print(f"Processing batch {batch_num//BATCH_SIZE + 1}: Companies {batch_num+1}-{batch_end}...\n")
    
    run_input = {
        "startUrls": [{"url": site['url']} for site in batch],
        "linkSelector": "a[href]",
        "globs": [],
        "excludes": [{"glob": "/**/*.{png,jpg,jpeg,pdf,svg,gif,webp,css,js}"}],
        "pageFunction": """
async function pageFunction(context) {
    const $ = context.jQuery;
    const html = $('body').html();
    if (!html) return {};
    
    const htmlLower = html.toLowerCase();
    
    // Certifications
    const has_fda = /fda|food.and.drug/i.test(html);
    const has_ce = /ce.mark|conformit[ée]/i.test(html);
    const has_iso = /iso.?\\d{4,5}/i.test(html);
    const has_anvisa = /anvisa/i.test(html);
    
    // R&D
    const has_rd = /pesquisa|research|p.?.d|r.?.d|inovação|innovation/i.test(html);
    const has_patents = /patente|patent/i.test(html);
    
    // Extract numbers
    const years_match = html.match(/(\\d+).{0,5}anos/i);
    const countries_match = html.match(/(\\d+).{0,5}pa[íi]ses/i);
    const employees_match = html.match(/(\\d+).{0,5}funcion[áa]rios|colaboradores/i);
    
    // Business model
    const is_manufacturer = /f[áa]brica|manufatura|ind[úu]stria|fabrica/i.test(html);
    const is_distributor = /distribui|importa/i.test(html);
    
    // Export/Global presence
    const has_export = /export|exporta/i.test(html);
    const has_global = /global|mundial|international/i.test(html);
    
    return {
        url: context.request.url,
        has_fda,
        has_ce,
        has_iso,
        has_anvisa,
        has_rd,
        has_patents,
        years: years_match ? parseInt(years_match[1]) : 0,
        countries: countries_match ? parseInt(countries_match[1]) : 0,
        employees: employees_match ? parseInt(employees_match[1]) : 0,
        is_manufacturer,
        is_distributor,
        has_export,
        has_global
    };
}
        """,
        "injectJQuery": True,
        "proxyConfiguration": {"useApifyProxy": True},
        "maxPagesPerCrawl": len(batch),
        "maxConcurrency": 10,  # Process 10 at once for speed
        "pageLoadTimeoutSecs": 30
    }
    
    print(f"Starting Apify Web Scraper (batch {batch_num//BATCH_SIZE + 1})...")
    
    try:
        run = client.actor("apify/web-scraper").call(run_input=run_input)
        
        # Collect results
        batch_count = 0
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            url = item.get('url', '').replace('http://', '').replace('https://', '').replace('www.', '')
            all_results[url] = item
            batch_count += 1
        
        print(f"✅ Batch {batch_num//BATCH_SIZE + 1} complete: {batch_count} sites scraped\n")
        
    except Exception as e:
        print(f"❌ Batch {batch_num//BATCH_SIZE + 1} failed: {str(e)}\n")

# Save all results
with open('/Users/rafaelalmeida/lifetrek-mirror/all_companies_enriched.json', 'w') as f:
    json.dump(all_results, f, indent=2)

print(f"\n✅ COMPLETE!")
print(f"Total companies scraped: {len(all_results)}/{len(websites)}")
print(f"Success rate: {len(all_results)/len(websites)*100:.1f}%")
print(f"\nSaved to: all_companies_enriched.json")
