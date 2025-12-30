import urllib.request
import json
import time
import re
from urllib.parse import urlparse

# Read companies to scrape
with open('/Users/rafaelalmeida/lifetrek-mirror/companies_to_scrape.json', 'r') as f:
    targets = json.load(f)

def scrape_company_website(url):
    """Scrape company website for key indicators"""
    if not url or str(url) == 'nan':
        return None
    
    # Normalize URL
    if not url.startswith('http'):
        url = 'http://' + url
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Extract key indicators
            indicators = {
                'has_website': True,
                'content_length': len(html),
                
                # Brand/Market indicators
                'mentions_global': bool(re.search(r'(global|international|mundial|export)', html, re.IGNORECASE)),
                'mentions_iso': bool(re.search(r'ISO[\s-]?\d{4,5}', html, re.IGNORECASE)),
                'mentions_fda': bool(re.search(r'FDA|Food and Drug', html, re.IGNORECASE)),
                'mentions_ce': bool(re.search(r'CE[\s-]?Mark|Conformité Européenne', html, re.IGNORECASE)),
                'mentions_anvisa': bool(re.search(r'ANVISA', html, re.IGNORECASE)),
                
                # Scale indicators
                'mentions_anos': re.findall(r'(\d+)\+?\s*anos', html, re.IGNORECASE),  # Years in business
                'mentions_paises': re.findall(r'(\d+)\+?\s*pa[íi]ses', html, re.IGNORECASE),  # Countries
                'mentions_funcionarios': re.findall(r'(\d+)\+?\s*funcion[áa]rios', html, re.IGNORECASE),  # Employees
                
                # Quality indicators
                'has_ssl': url.startswith('https'),
                'mentions_pesquisa': bool(re.search(r'pesquisa|research|P\u0026D|R\u0026D', html, re.IGNORECASE)),
                'mentions_patentes': bool(re.search(r'patente|patent', html, re.IGNORECASE)),
                
                # Business model
                'is_distributor': bool(re.search(r'distribui(dor|ção)|importa(dor|ção)', html, re.IGNORECASE)),
                'is_manufacturer': bool(re.search(r'f[áa]brica|manufatura|ind[úu]stria', html, re.IGNORECASE)),
                
                # Corporate structure
                'mentions_subsidiary': bool(re.search(r'subsidi[áa]ria|filial|parte de|part of|grupo', html, re.IGNORECASE)),
            }
            
            return indicators
            
    except Exception as e:
        print(f"Error scraping {url}: {str(e)[:50]}")
        return {'has_website': False, 'error': str(e)[:100]}

# Scrape all companies
print("=== SCRAPING COMPANY WEBSITES ===\n")

all_results = []

for category in ['hidden_gems', 'false_positives']:
    print(f"\n{'='*60}")
    print(f"Scraping {category.upper().replace('_', ' ')}")
    print(f"{'='*60}\n")
    
    for company in targets[category]:
        print(f"🔍 {company['name'][:50]}")
        
        indicators = scrape_company_website(company['website'])
        
        result = {
            **company,
            'category': category,
            'indicators': indicators
        }
        all_results.append(result)
        
        if indicators and indicators.get('has_website'):
            print(f"   ✅ Scraped {indicators.get('content_length', 0)} chars")
            if indicators.get('mentions_global'):
                print(f"      🌍 Global presence")
            if indicators.get('mentions_iso'):
                print(f"      📜 ISO certified")
            if indicators.get('is_manufacturer'):
                print(f"      🏭 Manufacturer")
            if indicators.get('is_distributor'):
                print(f"      📦 Distributor")
        else:
            print(f"   ❌ Failed to scrape")
        
        time.sleep(1)  # Be polite

# Save results
with open('/Users/rafaelalmeida/lifetrek-mirror/scraped_parameters.json', 'w') as f:
    json.dump(all_results, f, indent=2)

print(f"\n✅ Saved scraping results to scraped_parameters.json")
print(f"   Total companies scraped: {len(all_results)}")
