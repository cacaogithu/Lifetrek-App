"""
Simple Python Web Scraper (No Apify needed)
Uses: requests + regex to extract parameters

For Manus to run if needed
"""

import requests
import re
import pandas as pd
import time

def scrape_company_website(url):
    """Scrape one company website"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        html = response.text.lower()
        
        return {
            'url': url,
            'fda': bool(re.search(r'fda', html)),
            'ce': bool(re.search(r'ce.mark', html)),
            'iso': bool(re.search(r'iso.\d{4}', html)),
            'rd': bool(re.search(r'pesquisa|research', html)),
            'years': int(m.group(1)) if (m := re.search(r'(\d+).anos', html)) else 0,
            'countries': int(m.group(1)) if (m := re.search(r'(\d+).pa.ses', html)) else 0,
            'employees': int(m.group(1)) if (m := re.search(r'(\d+).funcion', html)) else 0
        }
    except:
        return {'url': url, 'fda': False, 'ce': False, 'iso': False, 'rd': False, 'years': 0, 'countries': 0, 'employees': 0}

# Usage:
# df = pd.read_csv('companies.csv')
# for url in df['Website']:
#     result = scrape_company_website(url)
#     time.sleep(0.5)  # Be polite
