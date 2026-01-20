"""
Super Enrichment - Email Discovery
Uses multiple sources: Perplexity AI, Website Scraping, and smart heuristics
"""

import pandas as pd
import requests
import json
import time
import re
from bs4 import BeautifulSoup
import os

# API Keys
PERPLEXITY_API_KEY = "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"

def query_perplexity_for_email(company_name, website):
    """Use Perplexity AI to find email for a company"""
    url = "https://api.perplexity.ai/chat/completions"
    
    prompt = f"""
    Find the contact email address for the company "{company_name}" ({website if website else 'no website'}).
    
    Return ONLY the email address, nothing else. If you can't find it, return "NOT_FOUND".
    Common patterns: contato@, comercial@, vendas@, info@, sac@
    """
    
    payload = {
        "model": "sonar",
        "messages": [
            {"role": "system", "content": "You are a contact information finder. Return only email addresses or 'NOT_FOUND'."},
            {"role": "user", "content": prompt}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        content = data['choices'][0]['message']['content'].strip()
        
        # Extract email from response
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content)
        if email_match:
            email = email_match.group(0).lower()
            # Filter out common false positives
            if not any(x in email for x in ['example', 'test', 'sample', 'placeholder']):
                return email
        return None
    except Exception as e:
        print(f"  ⚠️ Perplexity error for {company_name}: {e}")
        return None

def scrape_email_from_website(website):
    """Scrape email from company website"""
    if not website or pd.isna(website):
        return None
    
    # Clean URL
    if not website.startswith('http'):
        website = 'https://' + website
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(website, headers=headers, timeout=8)
        
        # Find emails in HTML
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', resp.text)
        
        # Filter and prioritize
        valid_emails = []
        for email in emails:
            email = email.lower()
            # Skip images, trackers, etc
            if any(x in email for x in ['.png', '.jpg', 'wix.', 'google', 'facebook', 'example']):
                continue
            valid_emails.append(email)
        
        if valid_emails:
            # Prioritize by keyword
            priorities = ['contato', 'comercial', 'vendas', 'info', 'sac']
            for prio in priorities:
                for email in valid_emails:
                    if prio in email:
                        return email
            return valid_emails[0]
    except:
        pass
    
    return None

def enrich_emails_aggressive(input_file, output_file, limit=None):
    """
    Aggressive email enrichment using multiple sources
    """
    print("🔥 SUPER EMAIL ENRICHMENT - Multi-Source")
    print("=" * 60)
    
    # Load data
    df = pd.read_csv(input_file)
    print(f"📊 Total companies: {len(df)}")
    
    # Add email column if doesn't exist
    if 'email' not in df.columns:
        df['email'] = None
    
    # Filter companies without email
    missing_email = df['email'].isna() | (df['email'] == '')
    to_enrich = df[missing_email]
    
    if limit:
        to_enrich = to_enrich.head(limit)
    
    print(f"🎯 Companies to enrich: {len(to_enrich)}")
    print("=" * 60)
    
    found_count = 0
    
    for idx, row in to_enrich.iterrows():
        company = row['nome_empresa']
        website = row.get('website')
        
        print(f"\n[{found_count + 1}/{len(to_enrich)}] 🔍 {company}")
        
        email = None
        
        # Method 1: Website Scraping (fast)
        if not email and website:
            print(f"  → Scraping website...")
            email = scrape_email_from_website(website)
            if email:
                print(f"  ✅ Found via scraping: {email}")
        
        # Method 2: Perplexity AI (powerful but slower)
        if not email:
            print(f"  → Querying Perplexity AI...")
            email = query_perplexity_for_email(company, website)
            if email:
                print(f"  ✅ Found via Perplexity: {email}")
        
        # Save if found
        if email:
            df.at[idx, 'email'] = email
            found_count += 1
            
            # Save checkpoint every 10
            if found_count % 10 == 0:
                df.to_csv(output_file, index=False)
                print(f"\n  💾 Checkpoint saved: {found_count} emails found")
        else:
            print(f"  ❌ No email found")
        
        # Rate limiting
        time.sleep(0.5)  # Be nice to APIs
    
    # Final save
    df.to_csv(output_file, index=False)
    
    print("\n" + "=" * 60)
    print(f"🎉 ENRICHMENT COMPLETE!")
    print(f"   ✅ Emails found: {found_count}")
    print(f"   📊 Success rate: {found_count / len(to_enrich) * 100:.1f}%")
    print(f"   💾 Saved to: {output_file}")
    print("=" * 60)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv')
    parser.add_argument('--output', default='/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv')
    parser.add_argument('--limit', type=int, default=50, help='Number of companies to process (default: 50)')
    
    args = parser.parse_args()
    
    enrich_emails_aggressive(args.input, args.output, args.limit)
