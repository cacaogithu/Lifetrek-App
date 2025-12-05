"""
Free Lead Enrichment - No Paid APIs Required
Uses public data sources:
1. CNPJ Public Website (receitaws.com.br API - FREE)
2. Google Search for company info
3. Direct website scraping
4. LinkedIn public profiles (no API)
"""

import urllib.request
import json
import re
import time
from typing import Dict, Optional

def get_cnpj_data(cnpj: str) -> Optional[Dict]:
    """
    Get company data from free CNPJ API (ReceitaWS)
    No authentication required, 3 requests/minute limit
    """
    # Clean CNPJ (remove dots and slashes)
    cnpj_clean = re.sub(r'[^\d]', '', cnpj)
    
    url = f'https://www.receitaws.com.br/v1/cnpj/{cnpj_clean}'
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            if data.get('status') == 'OK':
                return {
                    'nome': data.get('nome'),
                    'abertura': data.get('abertura'),  # Founding date
                    'atividade_principal': data.get('atividade_principal', [{}])[0].get('text'),
                    'capital_social': data.get('capital_social'),
                    'situacao': data.get('situacao')
                }
    except Exception as e:
        print(f"Error fetching CNPJ {cnpj}: {str(e)[:50]}")
    
    return None


def calculate_years_in_business(abertura: str) -> int:
    """Calculate years from founding date (DD/MM/YYYY)"""
    try:
        day, month, year = abertura.split('/')
        founding_year = int(year)
        current_year = 2025  # Update as needed
        return current_year - founding_year
    except:
        return 0


def google_search_for_certifications(company_name: str, website: str) -> Dict:
    """
    Use Google Search to find FDA/CE/ISO mentions
    Free via our existing Apify Google Search (already used)
    """
    # This would reuse the google search scraper we already have
    # For now, return structure
    return {
        'has_fda': False,
        'has_ce': False,
        'has_iso': False,
        'export_mentions': 0
    }


def scrape_linkedin_public(company_name: str) -> Optional[Dict]:
    """
    Scrape public LinkedIn company page without API
    Just parse the HTML directly
    """
    # Convert company name to LinkedIn URL format
    company_slug = company_name.lower().replace(' ', '-')
    company_slug = re.sub(r'[^\w-]', '', company_slug)
    
    url = f'https://www.linkedin.com/company/{company_slug}'
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Extract employee count from meta tags
            employee_match = re.search(r'(\d+(?:,\d+)?)\s*employees?', html, re.IGNORECASE)
            employees = int(employee_match.group(1).replace(',', '')) if employee_match else 0
            
            # Extract founding year
            founded_match = re.search(r'Founded[:\s]+(\d{4})', html, re.IGNORECASE)
            founded = int(founded_match.group(1)) if founded_match else 0
            
            return {
                'employees': employees,
                'founded': founded,
                'has_linkedin': True
            }
    except Exception as e:
        print(f"LinkedIn scraping failed for {company_name}: {str(e)[:50]}")
        return None


# Test the free API
if __name__ == "__main__":
    # Test with a known CNPJ
    print("Testing Free CNPJ API...")
    
    # Example CNPJ (Neodent from our dataset)
    test_cnpj = "02177882000197"  # This would need to be looked up
    
    data = get_cnpj_data(test_cnpj)
    if data:
        print(f"✅ Free CNPJ API works!")
        print(f"   Company: {data['nome']}")
        print(f"   Founded: {data['abertura']}")
        print(f"   Years: {calculate_years_in_business(data['abertura'])}")
    else:
        print("❌ CNPJ lookup failed")
