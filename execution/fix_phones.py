import pandas as pd
import re

FILES = [
    '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv',
    '/Users/rafaelalmeida/lifetrek-mirror/FINAL_DELIVERABLE.csv'
]

def clean_phone(phone):
    if pd.isna(phone) or str(phone) == '':
        return phone
    
    s = str(phone).strip()
    
    # Remove leading +
    if s.startswith('+'):
        s = s[1:]
        
    # Remove leading ' if present (excel artifact)
    if s.startswith("'"):
        s = s[1:]
        
    return s.strip()

def run_fix():
    for fpath in FILES:
        print(f"Fixing {fpath}...")
        try:
            df = pd.read_csv(fpath)
            
            # Identify phone columns
            # Usually 'Phone' or 'Telefone'
            cols = [c for c in df.columns if 'phone' in c.lower() or 'telefone' in c.lower()]
            
            if not cols:
                print("No phone column found.")
                continue
                
            for col in cols:
                print(f"  Cleaning column: {col}")
                df[col] = df[col].apply(clean_phone)
                
            df.to_csv(fpath, index=False)
            print("  ✅ Saved.")
            
        except FileNotFoundError:
            print("  Original file not found, skipping.")

if __name__ == "__main__":
    run_fix()
