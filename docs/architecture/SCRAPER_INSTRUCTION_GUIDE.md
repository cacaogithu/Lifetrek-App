# Guide: Building a Lightweight Company Data Scraper

This guide describes how to build a Python-based scraper designed to enrich company profiles by extracting key business indicators directly from their websites. This approach avoids paid APIs by using simple HTML parsing and Regular Expressions.

## 1. Core Concept
The scraper visits a company's website (provided in a CSV) and scans the raw HTML for specific keywords and regex patterns that indicate:
- **Certifications**: FDA, CE Mark, ISO.
- **Business Activities**: R&D (Research & Development).
- **Scale Signals**: Number of employees, years in market, presence in multiple countries.

## 2. Dependencies
The script relies on minimal, standard Python libraries to ensure portability across environments (like different LLM workspaces).

```python
import requests
import re
import pandas as pd
import time
```

## 3. The Scraping Function
The core logic is encapsulated in a single function `scrape_company_website(url)`.

### Key Components:
1.  **Headers**: Always include a `User-Agent` to mimic a real browser request and avoid 403 errors.
2.  **Timeout**: Set a strict timeout (e.g., 10s) to prevent the script from hanging on slow sites.
3.  **Regex Extraction**: Use `re.search` to find patterns in the lowercased HTML content.

### Implementation Blueprint:

```python
def scrape_company_website(url):
    try:
        # 1. Be polite and look like a browser
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'}
        
        # 2. Fetch content
        response = requests.get(url, headers=headers, timeout=10)
        html = response.text.lower() # Normalize to lowercase for easier matching
        
        # 3. Extract Indicators (Boolean Flags)
        # Check for specific terms indicating compliance or department types
        has_fda = bool(re.search(r'fda', html))
        has_ce  = bool(re.search(r'ce.mark', html)) # matches "ce mark", "ce-mark"
        has_iso = bool(re.search(r'iso.\d{4}', html)) # matches iso 9001, iso 13485, etc.
        has_rd  = bool(re.search(r'pesquisa|research', html))
        
        # 4. Extract Metrics (Integers)
        # Capture numbers preceding specific keywords using capturing groups (\d+)
        
        # Years in market (e.g., "20 anos", "20 years")
        m_years = re.search(r'(\d+).anos|(\d+).years', html)
        years = int(m_years.group(1) or m_years.group(2)) if m_years else 0
        
        # Countries presence (e.g., "5 países", "5 countries")
        m_countries = re.search(r'(\d+).pa.ses|(\d+).countries', html)
        countries = int(m_countries.group(1) or m_countries.group(2)) if m_countries else 0
        
        # Employee count (e.g., "100 funcionarios", "100 employees")
        m_emp = re.search(r'(\d+).funcion|(\d+).employ', html)
        employees = int(m_emp.group(1) or m_emp.group(2)) if m_emp else 0
        
        return {
            'url': url,
            'fda': has_fda,
            'ce': has_ce,
            'iso': has_iso,
            'rd': has_rd,
            'years': years,
            'countries': countries,
            'employees': employees
        }
    except Exception as e:
        # Return a default "empty" object on failure
        return {'url': url, 'error': str(e)}
```

## 4. Execution Loop
To run this at scale, wrap the function in a loop that iterates through a CSV file.

```python
# Load your target list
df = pd.read_csv('companies_to_enrich.csv')

results = []
for index, row in df.iterrows():
    url = row['Website']
    if pd.notna(url):
        print(f"Scraping: {url}")
        data = scrape_company_website(url)
        results.append(data)
        time.sleep(1) # Important: Rate limiting to avoid blocking
        
# Save results
pd.DataFrame(results).to_csv('enrichment_results.csv', index=False)
```

## 5. Advanced Extension (Optional)
For more complex scraping (e.g., finding team members), you can extend this logic using `BeautifulSoup` to parse specific HTML tags (like `<a>` tags) to find "About Us" or "Team" pages, and then recursively scrape those pages for names and job titles.
