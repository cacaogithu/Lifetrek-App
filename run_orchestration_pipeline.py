import subprocess
import os
import glob
import sys

def run_pipeline():
    print("🚀 STARTING SALES ENRICHMENT PIPELINE 🚀")
    print("=========================================")

    # Step 0: Advanced Scraping
    print("\n[STEP 0] Running Advanced Scrapers...")
    try:
        # 1. Google Places Advanced
        if os.path.exists("scrape_leads_advanced.py"):
             print("   - Running Google Places Advanced Scraper...")
             subprocess.run(["python3", "scrape_leads_advanced.py"], check=True)
        
        # 2. Perplexity Discovery
        if os.path.exists("discover_leads_perplexity.py"):
             print("   - Running Perplexity Discovery...")
             subprocess.run(["python3", "discover_leads_perplexity.py"], check=True)
             
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Warning: Scraping step had issues: {e}")
        # We continue even if scraping fails, to process existing leads

    # Step 0.5: Merge & Dedup
    print("\n[STEP 0.5] Merging New Leads into Master Database...")
    try:
        if os.path.exists("merge_new_leads.py"):
            subprocess.run(["python3", "merge_new_leads.py"], check=True)
        else:
            print("❌ merge_new_leads.py not found!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during merging: {e}")
        sys.exit(1)

    # Step 0.8: Email Enrichment (Free Mode)
    print("\n[STEP 0.8] Finding Emails (Free Advanced Scraper)...")
    try:
        if os.path.exists("enrich_emails_advanced_free.py"):
             subprocess.run(["python3", "enrich_emails_advanced_free.py"], check=True)
        else:
             print("⚠️ enrich_emails_advanced_free.py not found, skipping.")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Warning: Email enrichment had issues: {e}")

    # Step 1: Segmentation
    print("\n[STEP 1] Segmenting Leads...")
    try:
        subprocess.run(["python3", "segment_leads.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during segmentation: {e}")
        sys.exit(1)

    # Step 2: Identify Priority File
    print("\n[STEP 2] Identifying Priority List...")
    output_dir = "/Users/rafaelalmeida/Desktop/Sales_Ready_Lists"
    
    # Look for the file starting with '01_Priority_Leads'
    priority_files = glob.glob(os.path.join(output_dir, "01_Priority_Leads*.csv"))
    
    if not priority_files:
        print("❌ Could not find Priority Leads file in", output_dir)
        sys.exit(1)
        
    # Pick the most recent one if multiple (though likely just one)
    priority_file = max(priority_files, key=os.path.getctime)
    print(f"✅ Found Priority File: {priority_file}")

    # Step 3: Enrich Priority Leads
    print(f"\n[STEP 3] Enriching High-Value Leads with Perplexity...")
    print(f"Target: {priority_file}")
    
    try:
        # Run the enrichment script targeting the priority file
        # We don't set a limit here effectively running on all rows in that file
        subprocess.run(["python3", "enrich_leads_perplexity.py", "--input", priority_file], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during enrichment: {e}")
        sys.exit(1)

    print("\n=========================================")
    print("🎉 PIPELINE COMPLETE 🎉")
    print(f"Enriched data saved to: {priority_file}")

if __name__ == "__main__":
    run_pipeline()
