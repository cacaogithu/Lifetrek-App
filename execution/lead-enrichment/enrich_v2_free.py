"""
100% FREE Lead Enrichment Pipeline
No paid APIs - uses only public data

Data Sources (All Free):
1. ReceitaWS CNPJ API - Company registration data
2. Google Search (existing Apify results) - Certifications, export info  
3. Company websites - Additional parameter extraction
4. Manual parameter database - Known global brands
"""

import pandas as pd
import json
import re
import urllib.request
import time
from typing import Dict, Optional

# ===== FREE DATA SOURCE 1: ReceitaWS CNPJ API =====
def get_cnpj_data(cnpj: str) -> Optional[Dict]:
    """Free CNPJ lookup - 3 requests/minute limit"""
    cnpj_clean = re.sub(r'[^\d]', '', str(cnpj))
    
    if len(cnpj_clean) != 14:
        return None
    
    url = f'https://www.receitaws.com.br/v1/cnpj/{cnpj_clean}'
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            if data.get('status') == 'OK':
                # Extract years in business
                abertura = data.get('abertura', '')
                years = 0
                if abertura:
                    try:
                        year = int(abertura.split('/')[-1])
                        years = 2025 - year
                    except:
                        pass
                
                return {
                    'nome': data.get('nome'),
                    'years_in_business': years,
                    'capital_social': float(data.get('capital_social', '0').replace(',', '.')),
                    'atividade': data.get('atividade_principal', [{}])[0].get('text', '')
                }
    except Exception as e:
        print(f"CNPJ lookup failed: {str(e)[:30]}...")
    
    return None


# ===== FREE DATA SOURCE 2: Known Global Brands Database =====
GLOBAL_BRANDS = {
    'J&J': {'parent': 'Johnson & Johnson', 'fortune_500': True},
    'JOHNSON': {'parent': 'Johnson & Johnson', 'fortune_500': True},
    'ARTHREX': {'parent': 'Arthrex Inc', 'fortune_500': False},
    'STRYKER': {'parent': 'Stryker Corporation', 'fortune_500': True},
    'STRAUMANN': {'parent': 'Straumann Group', 'fortune_500': False},
    'NEODENT': {'parent': 'Straumann Group', 'fortune_500': False},
    'BIOMET': {'parent': 'Zimmer Biomet', 'fortune_500': True},
    'ALIGN': {'parent': 'Align Technology', 'fortune_500': False},
    'DENTSPLY': {'parent': 'Dentsply Sirona', 'fortune_500': False},
    'BIOTRONIK': {'parent': 'Biotronik SE', 'fortune_500': False}
}

def check_global_brand(company_name: str) -> Optional[Dict]:
    """Check if company is a known global brand"""
    company_upper = company_name.upper()
    
    for brand, info in GLOBAL_BRANDS.items():
        if brand in company_upper:
            return info
    
    return None


# ===== FREE DATA SOURCE 3: Website Scraping Enhancement =====
def scrape_company_parameters(website: str) -> Dict:
    """Enhanced free website scraping for all 7 parameters"""
    if not website or str(website) == 'nan':
        return {}
    
    if not website.startswith('http'):
        website = 'http://' + website
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(website, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore').lower()
            
            # Parameter 1: FDA/CE Certifications
            has_fda = bool(re.search(r'fda|food and drug', html))
            has_ce = bool(re.search(r'ce[\s-]?mark|conformit[ée]', html))
            has_iso = bool(re.search(r'iso[\s-]?\d{4,5}', html))
            
            # Parameter 2: Export Markets (count country mentions)
            countries_mentioned = len(re.findall(r'\b\d+\s*pa[íi]ses', html))
            
            # Parameter 3: R&D Investment
            has_rd = bool(re.search(r'pesquisa|research|p\s*[&\+]\s*d|r\s*[&\+]\s*d', html))
            
            # Parameter 4: Employee Count
            employee_matches = re.findall(r'(\d+)\s*funcion[áa]rios', html)
            employees = int(employee_matches[0]) if employee_matches else 0
            
            # Parameter 5: Product Specialization
            has_specialized_products = bool(re.search(r'(sistema|line|série|modelo)\s+\w+[\s-]\d+', html))
            
            return {
                'certifications': [c for c, exists in [('FDA', has_fda), ('CE', has_ce), ('ISO', has_iso)] if exists],
                'export_countries': countries_mentioned,
                'has_rd': has_rd,
                'employees': employees,
                'specialized_products': has_specialized_products
            }
    except Exception as e:
        return {}


# ===== MAIN ENRICHMENT FUNCTION =====
def enrich_lead(row: pd.Series) -> Dict:
    """Combine all free data sources to score a lead"""
    company = row['Nome Empresa']
    website = row.get('Website')
    
    print(f"Enriching: {company[:40]}...")
    
    enriched = {
        'company': company,
        # Default values
        'parent_company': None,
        'fortune_500': False,
        'years_in_business': 0,
        'certifications': [],
        'export_countries': 0,
        'has_rd': False,
        'employees': 0,
        'specialized_products': False
    }
    
    # Source 1: Global Brands Database
    brand_info = check_global_brand(company)
    if brand_info:
        enriched['parent_company'] = brand_info['parent']
        enriched['fortune_500'] = brand_info['fortune_500']
        print(f"  ✅ Global brand: {brand_info['parent']}")
    
    # Source 2: Website Scraping
    if website:
        params = scrape_company_parameters(website)
        enriched.update(params)
        if params.get('certifications'):
            print(f"  ✅ Found certs: {', '.join(params['certifications'])}")
    
    # Rate limiting for politeness
    time.sleep(0.5)
    
    return enriched


# ===== SCORING WITH NEW PARAMETERS =====
def calculate_v2_score(enriched: Dict, base_score: float) -> float:
    """Calculate V2 score with the 7 parameters"""
    score = base_score  # Start with V1 score
    
    # Parameter 1: Parent Company (Fortune 500)
    if enriched.get('fortune_500'):
        score += 3.0
        print(f"    +3.0 (Fortune 500 parent)")
    elif enriched.get('parent_company'):
        score += 1.5
        print(f"    +1.5 (Global parent)")
    
    # Parameter 2: Certifications
    cert_count = len(enriched.get('certifications', []))
    if cert_count >= 2:
        score += 2.0
        print(f"    +2.0 ({cert_count} certifications)")
    elif cert_count == 1:
        score += 1.0
    
    # Parameter 3: Export Markets
    if enriched.get('export_countries', 0) >= 10:
        score += 1.0  
        print(f"    +1.0 (10+ export countries)")
    
    # Parameter 4: R&D
    if enriched.get('has_rd'):
        score += 1.5
        print(f"    +1.5 (R&D investment)")
    
    # Parameter 5: Years in Business
    if enriched.get('years_in_business', 0) >= 20:
        score += 1.0
        print(f"    +1.0 (20+ years)")
    
    # Parameter 6: Employees
    if enriched.get('employees', 0) >= 100:
        score += 1.0
        print(f"    +1.0 (100+ employees)")
    
    # Parameter 7: Product Specialization
    if enriched.get('specialized_products'):
        score += 0.5
    
    return min(10.0, score)  # Cap at 10


# ===== MAIN SCRIPT =====
if __name__ == "__main__":
    print("=== FREE LEAD ENRICHMENT v2.0 ===\n")
    
    # Load existing analysis
    df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')
    
    # Filter to high-scoring leads (save time on enrichment)
    high_scores = df[df['Predicted_Score'] >= 8.0].copy()
    
    print(f"Enriching {len(high_scores)} high-value leads...\n")
    
    enriched_results = []
    
    for idx, row in high_scores.head(10).iterrows():  # Test with 10 first
        enriched = enrich_lead(row)
        
        # Calculate V2 score
        v1_score = row['Predicted_Score']
        v2_score = calculate_v2_score(enriched, v1_score)
        
        print(f"  Score: {v1_score:.1f} → {v2_score:.1f}")
        print()
        
        enriched['v1_score'] = v1_score
        enriched['v2_score'] = v2_score
        enriched['renner_score'] = row['Renner_Score']
        enriched_results.append(enriched)
    
    # Save results
    df_enriched = pd.DataFrame(enriched_results)
    df_enriched.to_csv('/Users/rafaelalmeida/lifetrek-mirror/free_enrichment_results.csv', index=False)
    
    print(f"\n✅ Saved enrichment results to free_enrichment_results.csv")
    
    # Show improvement
    avg_v1 = df_enriched['v1_score'].mean()
    avg_v2 = df_enriched['v2_score'].mean()
    avg_renner = df_enriched['renner_score'].mean()
    
    print(f"\nScore Comparison:")
    print(f"  V1 Model Average: {avg_v1:.2f}")
    print(f"  V2 Model Average: {avg_v2:.2f}")
    print(f"  Renner Average:   {avg_renner:.2f}")
