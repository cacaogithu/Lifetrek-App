"""
Apify-based enrichment for all 66 companies
Uses: Web Scraper for websites + LinkedIn Company Scraper
"""

from apify_client import ApifyClient
import pandas as pd
import json
import time

API_TOKEN = "apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C"
client = ApifyClient(API_TOKEN)

# Load high-value leads
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')
high_scores = df[df['Predicted_Score'] >= 8.0].copy()

print(f"=== APIFY ENRICHMENT: {len(high_scores)} companies ===\n")

# Step 1: Scrape company websites
print("STEP 1: Scraping company websites...")

websites = []
for idx, row in high_scores.iterrows():
    website = row.get('Website')
    if website and str(website) != 'nan':
        if not website.startswith('http'):
            website = 'http://' + website
        websites.append({
            'url': website,
            'company': row['Nome Empresa']
        })

print(f"Found {len(websites)} valid websites to scrape\n")

# Run Web Scraper
run_input_web = {
    "startUrls": [{"url": site['url']} for site in websites[:10]],  # Start with 10 to test
    "linkSelector": "a[href]",
    "globs": [],
    "excludes": [{"glob": "/**/*.{png,jpg,jpeg,pdf,svg,gif,webp}"}],
    "pageFunction": """
async function pageFunction(context) {
    const $ = context.jQuery;
    const html = $('body').html().toLowerCase();
    
    // Extract parameters
    const has_fda = /fda|food.and.drug/i.test(html);
    const has_ce = /ce.mark|conformit[ée]/i.test(html);
    const has_iso = /iso.\\d{4,5}/i.test(html);
    const has_rd = /pesquisa|research|p.?.d|r.?.d/i.test(html);
    
    // Extract numbers
    const years_match = html.match(/(\\d+).anos/);
    const countries_match = html.match(/(\\d+).pa[íi]ses/);
    const employees_match = html.match(/(\\d+).funcion[áa]rios/);
    
    return {
        url: context.request.url,
        has_fda,
        has_ce,
        has_iso,
        has_rd,
        years: years_match ? parseInt(years_match[1]) : 0,
        countries: countries_match ? parseInt(countries_match[1]) : 0,
        employees: employees_match ? parseInt(employees_match[1]) : 0
    };
}
    """,
    "injectJQuery": True,
    "proxyConfiguration": {"useApifyProxy": True},
    "maxPagesPerCrawl": 10,
    "maxConcurrency": 5,
    "pageLoadTimeoutSecs": 30
}

print("Running Web Scraper...")
web_run = client.actor("apify/web-scraper").call(run_input=run_input_web)

# Fetch results
web_results = {}
for item in client.dataset(web_run["defaultDatasetId"]).iterate_items():
    url = item.get('url', '').replace('http://', '').replace('https://', '').replace('www.', '')
    web_results[url] = item
    print(f"  ✅ Scraped: {item.get('url', 'Unknown')}")

print(f"\nWeb scraping complete: {len(web_results)} sites\n")

# Step 2: LinkedIn Company Scraper
print("STEP 2: Scraping LinkedIn company pages...")

# Build LinkedIn URLs
linkedin_urls = []
for idx, row in high_scores.head(10).iterrows():
    company = row['Nome Empresa']
    # Try to generate LinkedIn URL
    slug = company.lower().replace(' ', '-').replace('&', 'and')
    slug = ''.join(c for c in slug if c.isalnum() or c in'-')
    linkedin_urls.append(f"https://www.linkedin.com/company/{slug}/")

run_input_linkedin = {
    "startUrls": [{"url": url} for url in linkedin_urls],
    "maxItems": 10
}

print("Running LinkedIn Scraper...")
try:
    linkedin_run = client.actor("apify/linkedin-company-scraper").call(run_input=run_input_linkedin)
    
    linkedin_results = {}
    for item in client.dataset(linkedin_run["defaultDatasetId"]).iterate_items():
        linkedin_results[item.get('companyName', '')] = {
            'employees': item.get('employeesOnLinkedin', 0),
            'follower_count': item.get('followerCount', 0),
            'founded': item.get('foundedYear', 0)
        }
        print(f"  ✅ LinkedIn: {item.get('companyName')} - {item.get('employeesOnLinkedin', 0)} employees")
except Exception as e:
    print(f"LinkedIn scraping failed: {str(e)}")
    linkedin_results = {}

print(f"\nLinkedIn scraping complete: {len(linkedin_results)} companies\n")

# Save results
output = {
    'web_results': web_results,
    'linkedin_results': linkedin_results,
    'timestamp': time.time()
}

with open('/Users/rafaelalmeida/lifetrek-mirror/apify_enrichment_results.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"✅ Saved results to apify_enrichment_results.json")
print(f"\nTotal data points collected:")
print(f"  - Website parameters: {len(web_results)}")
print(f"  - LinkedIn profiles: {len(linkedin_results)}")
