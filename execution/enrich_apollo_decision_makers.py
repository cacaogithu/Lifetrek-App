"""
Apollo.io Integration - Decision Makers & Email Enrichment
Uses Apollo.io People Search API to find decision makers with contact info
"""

import requests
import pandas as pd
import json
import time

# Apollo.io API Key
APOLLO_API_KEY = "tkUakPp1_YsasMGGTC1o1w"
APOLLO_BASE_URL = "https://api.apollo.io/v1"

def search_people_at_company(company_name, organization_domain=None):
    """
    Search for decision makers at a company using Apollo People Search
    Returns list of people with emails, titles, LinkedIn
    """
    url = f"{APOLLO_BASE_URL}/mixed_people/search"
    
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": APOLLO_API_KEY
    }
    
    # Build search query
    payload = {
        "q_organization_name": company_name,
        "per_page": 10,
        "page": 1,
        # Focus on decision makers
        "person_titles": [
            "CEO", "Founder", "President", "Presidente",
            "Director", "Diretor", "Diretora",
            "VP", "Vice President",
            "Manager", "Gerente",
            "Head", "Chief",
            "Owner", "Proprietário"
        ],
        "person_locations": ["Brazil", "Brasil"],
        "organization_num_employees_ranges": ["1,50", "51,200", "201,500", "501,1000", "1001,10000"]
    }
    
    if organization_domain:
        payload["q_organization_domains"] = organization_domain
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        
        people = []
        if "people" in data:
            for person in data["people"]:
                people.append({
                    "name": person.get("name"),
                    "title": person.get("title"),
                    "email": person.get("email"),
                    "linkedin_url": person.get("linkedin_url"),
                    "phone": person.get("phone_numbers", [{}])[0].get("raw_number") if person.get("phone_numbers") else None,
                    "organization": person.get("organization", {}).get("name"),
                })
        
        return people
    except Exception as e:
        print(f"  ⚠️ Apollo error for {company_name}: {e}")
        return []

def enrich_person(email=None, domain=None):
    """
    Enrich a person's data using Apollo Enrichment API
    """
    url = f"{APOLLO_BASE_URL}/people/enrich"
    
    headers = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": APOLLO_API_KEY
    }
    
    payload = {}
    if email:
        payload["email"] = email
    if domain:
        payload["organization_domain"] = domain
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if "person" in data:
            person = data["person"]
            return {
                "name": person.get("name"),
                "title": person.get("title"),
                "email": person.get("email"),
                "linkedin_url": person.get("linkedin_url"),
                "phone": person.get("phone_numbers", [{}])[0].get("raw_number") if person.get("phone_numbers") else None,
            }
    except:
        pass
    
    return None

def enrich_with_apollo(input_file, output_file, limit=None):
    """
    Enrich companies with decision makers using Apollo.io
    """
    print("🚀 APOLLO.IO ENRICHMENT - Decision Makers Search")
    print("=" * 60)
    
    # Load data
    df = pd.read_csv(input_file)
    print(f"📊 Total companies: {len(df)}")
    
    # Add decision makers column if doesn't exist
    if 'decision_makers_apollo' not in df.columns:
        df['decision_makers_apollo'] = None
    if 'apollo_emails' not in df.columns:
        df['apollo_emails'] = None
    
    # Filter ICP companies (high priority medical device companies)
    # Focus on companies without decision makers yet
    to_enrich = df[
        (df['decision_makers_apollo'].isna()) | 
        (df['decision_makers_apollo'] == '')
    ]
    
    # Prioritize by score if available
    if 'v2_score' in df.columns:
        to_enrich = to_enrich.sort_values('v2_score', ascending=False, na_position='last')
    
    if limit:
        to_enrich = to_enrich.head(limit)
    
    print(f"🎯 Companies to enrich: {len(to_enrich)}")
    print("=" * 60)
    
    found_count = 0
    
    for idx, row in to_enrich.iterrows():
        company = row['nome_empresa']
        website = row.get('website')
        
        # Extract domain from website
        domain = None
        if website and pd.notna(website):
            domain = website.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0]
        
        print(f"\n[{found_count + 1}/{len(to_enrich)}] 🔍 {company}")
        if domain:
            print(f"  📍 Domain: {domain}")
        
        # Search for decision makers
        people = search_people_at_company(company, domain)
        
        if people:
            print(f"  ✅ Found {len(people)} decision makers:")
            
            decision_makers_list = []
            emails_list = []
            
            for person in people:
                if person['name']:
                    dm_str = f"{person['name']} - {person['title']}"
                    decision_makers_list.append(dm_str)
                    print(f"     • {dm_str}")
                    
                    if person['email']:
                        emails_list.append(person['email'])
                        print(f"       📧 {person['email']}")
                    if person['linkedin_url']:
                        print(f"       💼 {person['linkedin_url']}")
            
            # Save to dataframe
            if decision_makers_list:
                df.at[idx, 'decision_makers_apollo'] = json.dumps(decision_makers_list)
                found_count += 1
            
            if emails_list:
                df.at[idx, 'apollo_emails'] = json.dumps(emails_list)
                # Also update main email field if empty
                if pd.isna(row.get('email')) or row.get('email') == '':
                    df.at[idx, 'email'] = emails_list[0]
            
            # Save checkpoint every 5
            if found_count % 5 == 0:
                df.to_csv(output_file, index=False)
                print(f"\n  💾 Checkpoint saved: {found_count} companies enriched")
        else:
            print(f"  ❌ No decision makers found")
        
        # Rate limiting (Apollo has limits)
        time.sleep(1.5)
    
    # Final save
    df.to_csv(output_file, index=False)
    
    print("\n" + "=" * 60)
    print(f"🎉 APOLLO ENRICHMENT COMPLETE!")
    print(f"   ✅ Companies with decision makers: {found_count}")
    print(f"   📊 Success rate: {found_count / len(to_enrich) * 100:.1f}%")
    print(f"   💾 Saved to: {output_file}")
    print("=" * 60)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv')
    parser.add_argument('--output', default='/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv')
    parser.add_argument('--limit', type=int, default=30, help='Number of companies to process')
    
    args = parser.parse_args()
    
    enrich_with_apollo(args.input, args.output, args.limit)
