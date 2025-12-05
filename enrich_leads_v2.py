import urllib.request
import urllib.parse
import json
import time
import csv
import re

API_TOKEN = 'apify_api_gizStoWPAboFkTPanzVJtX9hbn5xsg0nXc3C'
INPUT_CSV = '/Users/rafaelalmeida/lifetrek-mirror/leads_analysis_output.csv'
OUTPUT_CSV = '/Users/rafaelalmeida/lifetrek-mirror/leads_enriched_final_v2.csv'

# Previous dataset IDs from the bulk run
dataset_ids = ['gJfdz4zikMSQmYeDn', 'ptJ6IbJiZ5fwzJpQ9', 'Zbkr6Aptx50WRozxM', 'YqLdfRgYsPb3WV0r9']

def get_high_score_leads():
    leads = []
    try:
        with open(INPUT_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    score = float(row.get('Predicted_Score', 0))
                    if score >= 8.0:
                        leads.append(row)
                except ValueError:
                    continue
    except Exception as e:
        print(f"Error reading CSV: {e}")
    return leads

def get_dataset(dataset_id):
    dataset_url = f'https://api.apify.com/v2/datasets/{dataset_id}/items?token={API_TOKEN}'
    try:
        with urllib.request.urlopen(dataset_url) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching dataset {dataset_id}: {e}")
        return []

def extract_emails(text):
    if not text: return []
    # Enhanced email regex
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    # Filter out common noise
    return [e for e in emails if not any([
        'w3.org' in e, 'google.com' in e, 'example.com' in e,
        'schema.org' in e, '@sentry' in e
    ])]

def extract_linkedin_profiles(results):
    """Extract LinkedIn profile URLs from organic results"""
    profiles = []
    for result in results:
        url = result.get('url', '')
        if 'linkedin.com/in/' in url or 'linkedin.com/company/' in url:
            profiles.append(url)
    return profiles

def extract_decision_maker_info(results):
    """Extract potential decision maker names and roles from organic results"""
    decision_makers = []
    
    for result in results:
        title = result.get('title', '')
        desc = result.get('description', '')
        url = result.get('url', '')
        
        # Look for CEO, Director, Founder patterns
        combined_text = f"{title} {desc}"
        
        # Common titles in Portuguese and English
        title_patterns = [
            r'(CEO|Diretor|Director|Presidente|President|Founder|Fundador|Sócio|Partner|Gerente)',
            r'(Comercial|Commercial|Vendas|Sales|Executivo|Executive)'
        ]
        
        for pattern in title_patterns:
            if re.search(pattern, combined_text, re.IGNORECASE):
                decision_makers.append({
                    'name': title,
                    'info': desc[:100],
                    'url': url
                })
                break
    
    return decision_makers

def main():
    leads = get_high_score_leads()
    print(f"Found {len(leads)} high scoring leads.")
    
    # Create a map of company to query
    company_to_query = {}
    for lead in leads:
        company = lead['Nome Empresa']
        query = f'"{company}" CEO diretor email contato'
        company_to_query[company] = query
    
    # Fetch all datasets
    all_results = []
    for dataset_id in dataset_ids:
        print(f"Fetching dataset {dataset_id}...")
        items = get_dataset(dataset_id)
        all_results.extend(items)
    
    print(f"Total search results fetched: {len(all_results)}")
    
    # Process results
    company_info = {lead['Nome Empresa']: {
        'emails': set(),
        'linkedin_profiles': [],
        'decision_makers': [],
        'website_found': None
    } for lead in leads}
    
    for item in all_results:
        search_query = item.get('searchQuery', {}).get('term', '')
        
        # Find which company this belongs to
        target_company = None
        for company, query in company_to_query.items():
            if company.lower() in search_query.lower():
                target_company = company
                break
        
        if not target_company:
            continue
        
        # Extract from organic results
        organic_results = item.get('organicResults', [])
        
        # Look for emails in descriptions
        for result in organic_results:
            desc = result.get('description', '')
            title = result.get('title', '')
            url = result.get('url', '')
            
            # Extract emails
            text = f"{title} {desc}"
            emails = extract_emails(text)
            for email in emails:
                company_info[target_company]['emails'].add(email)
            
            # Check if it's the company website
            company_domain = leads[0].get('Website', '') # We'd need to match properly
            # For now, record top URLs
            if not company_info[target_company]['website_found'] and result.get('position', 99) <= 3:
                company_info[target_company]['website_found'] = url
        
        # Extract LinkedIn profiles
        linkedin_urls = extract_linkedin_profiles(organic_results)
        company_info[target_company]['linkedin_profiles'].extend(linkedin_urls[:3])
        
        # Extract decision maker info
        dm_info = extract_decision_maker_info(organic_results)
        company_info[target_company]['decision_makers'].extend(dm_info[:2])
    
    # Write enriched output
    fieldnames = list(leads[0].keys()) + ['Scraped_Emails', 'LinkedIn_Profiles', 'Decision_Makers', 'Top_Search_URL']
    
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for lead in leads:
            company = lead['Nome Empresa']
            info = company_info.get(company, {})
            
            lead['Scraped_Emails'] = "; ".join(list(info.get('emails', []))[:3])
            lead['LinkedIn_Profiles'] = "; ".join(info.get('linkedin_profiles', [])[:3])
            
            # Format decision makers
            dms = info.get('decision_makers', [])
            dm_text = " | ".join([f"{dm['name']}" for dm in dms[:2]]) if dms else ""
            lead['Decision_Makers'] = dm_text
            
            lead['Top_Search_URL'] = info.get('website_found', '')
            
            writer.writerow(lead)
    
    print(f"\nSaved enriched leads to {OUTPUT_CSV}")
    
    # Print summary
    total_emails = sum(len(info['emails']) for info in company_info.values())
    total_linkedin = sum(len(info['linkedin_profiles']) for info in company_info.values())
    print(f"\nSummary:")
    print(f"  Total emails found: {total_emails}")
    print(f"  Total LinkedIn profiles: {total_linkedin}")

if __name__ == "__main__":
    main()
