import pandas as pd
import shutil

def merge_delta():
    master_path = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
    delta_path = '/Users/rafaelalmeida/lifetrek-mirror/ai_delta.csv'
    
    print(f"Reading {master_path}...")
    df = pd.read_csv(master_path)
    
    print(f"Reading {delta_path}...")
    try:
        delta = pd.read_csv(delta_path)
    except Exception as e:
        print(f"Delta file empty or not found: {e}")
        return

    print(f"Merging {len(delta)} updates from Parallel Execution...")
    
    updates = 0
    for _, row in delta.iterrows():
        idx = row['index']
        dm = row.get('Decision_Maker')
        li = row.get('LinkedIn_Company')
        
        if pd.notna(dm) and dm:
            df.at[idx, 'Decision_Maker'] = dm
            updates += 1
            
        if pd.notna(li) and li:
             curr = df.at[idx, 'LinkedIn_Company'] 
             if pd.isna(curr) or str(curr) == '':
                 df.at[idx, 'LinkedIn_Company'] = li
                 
    # Backup
    shutil.copy(master_path, master_path + ".bak")
    
    # Save
    df.to_csv(master_path, index=False)
    print(f"✅ Merged {updates} new Decision Makers into Master CSV.")
    
if __name__ == "__main__":
    merge_delta()
