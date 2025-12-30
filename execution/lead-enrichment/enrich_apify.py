#!/usr/bin/env python3
"""
Enrich Company Data using Apify (Web Scraper + LinkedIn)
--------------------------------------------------------
Step 2 of the Advanced Scraper Architecture.
1. Reads leads with websites.
2. Visits website using Apify Web Scraper.
3. analyzing HTML with Regex for niche qualification.
4. Finds LinkedIn Company URL.
5. (Optional) Scrapes LinkedIn Company page for employee count.
"""

import os
import sys
import pandas as pd
import json
import time
from dotenv import load_dotenv
from apify_client import ApifyClient

# Load environment variables
load_dotenv()
APIFY_TOKEN = os.getenv("APIFY_API_TOKEN")

if not APIFY_TOKEN:
    print("❌ ERROR: APIFY_API_TOKEN not found in .env")
    sys.exit(1)

INPUT_FILE = "../../.tmp/MASTER_ENRICHED_LEADS.csv" # Default, can be overridden

def get_batches(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def run_apify_enrichment(input_csv=INPUT_FILE, batch_size=10):
    if not os.path.exists(input_csv):
        print(f"❌ Input file not found: {input_csv}")
        return

    print(f"🚀 Starting Apify Enrichment on {input_csv}...")
    df = pd.read_csv(input_csv)

    # Ensure columns exist
    for col in ['LinkedIn_Company', 'Company_Tags', 'Scraped_Tech_Stack', 'Is_Medicare', 'Is_SDR_Agency']:
        if col not in df.columns:
            df[col] = None

    # Filter: Rows with Website but missing info OR explicitly requested
    # We target rows with Website that don't have tags yet
    mask = (
        df['Website'].notna() & 
        (df['Website'] != '') &
        (df['Company_Tags'].isna() | (df['Company_Tags'] == ''))
    )
    
    to_process = df[mask].copy()
    print(f"ℹ️  Found {len(to_process)} leads with Website needing enrichment.")

    if len(to_process) == 0:
        print("✅ No valid leads to process.")
        return

    client = ApifyClient(APIFY_TOKEN)

    # Define the Page Function (JavaScript)
    # Regex logic from SCRAPER_ARCHITECTURE_GUIDE.md
    page_function = """
    async function pageFunction(context) {
        const $ = context.jQuery;
        const html = $('body').html().toLowerCase();
        const text = $('body').text().toLowerCase();
        
        // SDR/Agency Indicators
        const is_hubspot = /hubspot/i.test(html) || /hubspot/i.test(text);
        const is_salesforce = /salesforce/i.test(html) || /salesforce/i.test(text);
        const is_outreach = /outreach\.io/i.test(html);
        
        const does_cold_calling = /(cold[\s\-]call)|(outbound[\s\-]sales)|(appointment[\s\-]setting)/i.test(text);
        
        // Insurance Indicators
        const is_medicare = /medicare|medigap|advantage/i.test(text);
        const is_insurance_product = /life[\s\-]insurance|annuities/i.test(text);
        const is_mga_carrier = /carrier|underwriting|mga/i.test(text);
        
        // Find LinkedIn URL
        // Look for anchor tags with href containing linkedin.com/company
        let linkedin_url = "";
        try {
            const anchor = $('a[href*="linkedin.com/company"]').first();
            if (anchor.length) {
                linkedin_url = anchor.attr('href');
            }
        } catch (e) {}

        return {
            url: context.request.url,
            userData: context.request.userData,
            linkedin_url,
            is_hubspot,
            is_salesforce,
            is_outreach,
            does_cold_calling,
            is_medicare,
            is_insurance_product,
            is_mga_carrier
        };
    }
    """

    # Process in batches
    # We use 'index' to map back results
    indices = to_process.index.tolist()
    
    total_batches = (len(indices) + batch_size - 1) // batch_size
    current_batch = 0

    for batch_indices in get_batches(indices, batch_size):
        current_batch += 1
        print(f"   📦 Processing Batch {current_batch}/{total_batches} ({len(batch_indices)} items)...")
        
        start_urls = []
        for idx in batch_indices:
            url = df.at[idx, 'Website']
            if not url.startswith('http'):
                url = 'http://' + url
            
            start_urls.append({
                "url": url,
                "userData": {"index": idx} # Pass index to identify row later
            })

        run_input = {
            "startUrls": start_urls,
            "pageFunction": page_function,
            "maxPagesPerCrawl": 1, # Limit to 1 page per domain to save money
            "proxyConfiguration": {"useApifyProxy": True},
        }

        try:
            # Run the actor
            run = client.actor("apify/web-scraper").call(run_input=run_input)
            
            # Fetch results
            dataset_items = client.dataset(run["defaultDatasetId"]).list_items().items
            
            for item in dataset_items:
                # Map back using userData.index if available, or try URL matching
                # Note: Apify sometimes redirects, so URL might handle index usually better
                # if logic inside pageFunction returns userData correctly.
                
                # Check if userData came back
                idx = item.get('userData', {}).get('index')
                
                if idx is not None and idx in df.index:
                    # Update DataFrame
                    tags = []
                    if item.get('does_cold_calling'): tags.append('SDR_Service')
                    if item.get('is_medicare'): tags.append('Medicare')
                    if item.get('is_insurance_product'): tags.append('Insurance_Product')
                    if item.get('is_mga_carrier'): tags.append('MGA_Carrier')
                    
                    tech = []
                    if item.get('is_hubspot'): tech.append('HubSpot')
                    if item.get('is_salesforce'): tech.append('Salesforce')
                    if item.get('is_outreach'): tech.append('Outreach')

                    df.at[idx, 'Company_Tags'] = ", ".join(tags)
                    df.at[idx, 'Scraped_Tech_Stack'] = ", ".join(tech)
                    
                    # Update LinkedIn if found and missing
                    found_li = item.get('linkedin_url')
                    current_li = df.at[idx, 'LinkedIn_Company']
                    if found_li and (pd.isna(current_li) or current_li == ''):
                        df.at[idx, 'LinkedIn_Company'] = found_li
                        print(f"      found LI: {found_li}")

                    if item.get('is_medicare'):
                        df.at[idx, 'Is_Medicare'] = True
                    if item.get('does_cold_calling'):
                        df.at[idx, 'Is_SDR_Agency'] = True

        except Exception as e:
            print(f"❌ Error in batch {current_batch}: {e}")
        
        # Save progress periodically
        df.to_csv(input_csv, index=False)
        # Sleep briefly to avoid instant rate limit hitting if loop is tight
        time.sleep(1)

    print("✅ Apify Enrichment Complete.")


if __name__ == "__main__":
    # If file passed as arg
    target_file = sys.argv[1] if len(sys.argv) > 1 else INPUT_FILE
    run_apify_enrichment(target_file)
