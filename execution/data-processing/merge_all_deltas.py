import pandas as pd
import shutil
import os

MASTER_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
DELTA_FILES = [
    # (Path, Type)
    ('/Users/rafaelalmeida/lifetrek-mirror/delta_free.csv', 'Free Scraper'),
    ('/Users/rafaelalmeida/lifetrek-mirror/delta_ai.csv', 'AI Enrichment'),
    ('/Users/rafaelalmeida/lifetrek-mirror/delta_linkedin.csv', 'LinkedIn Discovery')
]

def merge_all():
    print("=== MERGING PARALLEL DELTAS ===")
    
    if not os.path.exists(MASTER_FILE):
        print(f"Master file not found: {MASTER_FILE}")
        return

    print(f"Reading Master: {MASTER_FILE}...")
    df = pd.read_csv(MASTER_FILE)
    
    total_updates = 0
    
    # 1. Backup
    shutil.copy(MASTER_FILE, MASTER_FILE + ".bak")
    print(f"Created backup: {MASTER_FILE}.bak")

    for d_path, d_name in DELTA_FILES:
        if not os.path.exists(d_path):
            print(f"[{d_name}] No delta file found ({d_path}). Skipping.")
            continue
            
        try:
            delta = pd.read_csv(d_path)
            if delta.empty:
                print(f"[{d_name}] File empty. Skipping.")
                continue
                
            print(f"[{d_name}] Merging {len(delta)} updates...")
            count = 0
            
            for _, row in delta.iterrows():
                idx = row['index']
                
                # Update Decision Maker
                if 'Decision_Maker' in row and pd.notna(row['Decision_Maker']):
                    # Check if we should overwrite? 
                    # Policy: Overwrite if current is empty OR if this source is AI (higher trust)
                    # But here we just overwrite blindly based on script order (Free -> AI)
                    val = row['Decision_Maker']
                    curr = df.at[idx, 'Decision_Maker']
                    
                    # Don't overwrite existing good data with potentially worse data if already present?
                    # Actually, assume latest delta is best effort.
                    if pd.notna(val) and str(val).strip() != "":
                         df.at[idx, 'Decision_Maker'] = val
                         count += 1
                
                # Update LinkedIn Company
                if 'LinkedIn_Company' in row and pd.notna(row['LinkedIn_Company']):
                    val = row['LinkedIn_Company']
                    if pd.notna(val) and str(val).strip() != "":
                        df.at[idx, 'LinkedIn_Company'] = val
                        
                # Update LinkedIn Person
                if 'LinkedIn_Person' in row and pd.notna(row['LinkedIn_Person']):
                    val = row['LinkedIn_Person']
                    if pd.notna(val) and str(val).strip() != "":
                        df.at[idx, 'LinkedIn_Person'] = val
            
            print(f"   ✅ Applied {count} DM updates from {d_name}.")
            total_updates += count
            
        except Exception as e:
            print(f"Error merging {d_name}: {e}")

    # Save
    df.to_csv(MASTER_FILE, index=False)
    print(f"🎉 Done. Total updates applied: {total_updates}")
    print("To regenerate final deliverable, run: python3 create_final_deliverable.py")

if __name__ == "__main__":
    merge_all()
