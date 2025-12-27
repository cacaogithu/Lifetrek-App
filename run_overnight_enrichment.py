#!/usr/bin/env python3
"""
Overnight Enrichment Pipeline
-----------------------------
Runs the full suite of enrichment scripts in order:
1. Ultra Fast Team Enrichment (Threaded)
2. Ultra Fast LinkedIn Company Guesser (Threaded)
3. Merge results into Master CSV
4. Slow & Steady LinkedIn Person Search (Google) - Optional/Overnight
5. Advanced Scoring
"""

import subprocess
import pandas as pd
import os
import sys
import time

MASTER_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
DELTA_TEAM = '/Users/rafaelalmeida/lifetrek-mirror/delta_team_fast.csv'
DELTA_LINKEDIN = '/Users/rafaelalmeida/lifetrek-mirror/delta_linkedin_guess.csv'


def run_script(script_name, args=[]):
    print(f"\n🚀 STARTING: {script_name}...")
    start = time.time()
    # Use sys.executable to ensure we use the SAME venv as this script
    cmd = [sys.executable, script_name] + args
    try:
        subprocess.run(cmd, check=True)
        print(f"✅ FINISHED: {script_name} (Time: {time.time() - start:.1f}s)")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ FAILED: {script_name} (Error: {e})")
        return False

def merge_deltas():
    print("\n🔄 MERGING DELTAS into MASTER...")
    if not os.path.exists(MASTER_FILE):
        print("Master file not found!")
        return

    df_master = pd.read_csv(MASTER_FILE)
    
    # 1. Merge Team Data (Includes Emails & Phones now)
    if os.path.exists(DELTA_TEAM):
        try:
            df_delta = pd.read_csv(DELTA_TEAM)
            print(f"   Merging {len(df_delta)} Team/Contact records...")
            
            # Create dicts for each field
            lookup = df_delta.set_index('index').to_dict('index')
            
            for idx, data in lookup.items():
                if idx in df_master.index:
                    if 'Decision_Maker' in data and has_val(data['Decision_Maker']):
                        df_master.at[idx, 'Decision_Maker'] = data['Decision_Maker']
                    if 'Scraped_Emails' in data and has_val(data['Scraped_Emails']):
                        df_master.at[idx, 'Scraped_Emails'] = data['Scraped_Emails']
                    if 'Phone' in data and has_val(data['Phone']):
                        curr_phone = df_master.at[idx, 'Phone']
                        # Only overwrite phone if missing? Or overwrite? 
                        # If scraper found one, it's likely fresh.
                        df_master.at[idx, 'Phone'] = data['Phone']
                    
            # Cleanup delta file
            # os.remove(DELTA_TEAM) 
        except Exception as e:
            print(f"   Error merging team delta: {e}")

def has_val(v):
    return not (pd.isna(v) or v == '')


    # 2. Merge LinkedIn Company Data
    if os.path.exists(DELTA_LINKEDIN):
        try:
            df_delta = pd.read_csv(DELTA_LINKEDIN)
            print(f"   Merging {len(df_delta)} LinkedIn Company records...")
            
            li_map = df_delta.set_index('index')['LinkedIn_Company'].to_dict()
            
            for idx, url in li_map.items():
                if idx in df_master.index:
                    df_master.at[idx, 'LinkedIn_Company'] = url
            
            # Cleanup delta file
            # os.remove(DELTA_LINKEDIN)
        except Exception as e:
            print(f"   Error merging LinkedIn delta: {e}")

    df_master.to_csv(MASTER_FILE, index=False)
    print("✅ Merge Complete.")

def main():
    print("=== 🌙 LIFETREK OVERNIGHT ENRICHMENT ===\n")
    
    # 1. Fast Team Enrichment
    run_script('enrich_team_ultra_fast.py')
    
    # 2. Fast LinkedIn Company Guesser
    run_script('enrich_linkedin_company_guess.py')
    
    # 3. Merge Fast Results
    merge_deltas()
    
    # 4. Advanced Scoring (Intermediate)
    run_script('score_leads_advanced.py')
    
    # 5. Slow LinkedIn Person Search (This takes time, perfect for overnight)
    # running standard legacy script which scrapes google
    print("\n🐢 Starting SLOW LinkedIn Person Search (Ctrl+C to stop safely, results save periodically)...")
    run_script('enrich_linkedin_free.py')
    
    # 6. Final Scoring
    run_script('score_leads_advanced.py')

    print("\n🎉🎉🎉 PIPELINE COMPLETE 🎉🎉🎉")

if __name__ == "__main__":
    main()
