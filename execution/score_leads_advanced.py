#!/usr/bin/env python3
"""
Advanced Lead Scoring (0-100 Scale)

Scoring Rubric:
----------------
CONTACT INFO (Max 65)
- Decision Maker Found: +20
- Email Present: +20
- LinkedIn Company URL: +15
- Phone Number: +10

COMPANY QUALITY (Max 35)
- FDA/CE/Anvisa/ISO Certified: +10
- Employee Count > 50: +10
- Employee Count > 10: +5
- Website Active (URL exists): +5
- Description/Notes populated: +5

Total Possible: 100
"""

import os
import pandas as pd
import numpy as np

INPUT_FILE = "/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv"

def has_value(val):
    if pd.isna(val) or val == '' or str(val).lower() == 'nan':
        return False
    return True

def clean_employees(val):
    try:
        if pd.isna(val): return 0
        s = str(val).lower().replace(',','').replace('.','')
        # extract first number
        import re
        nums = re.findall(r'\d+', s)
        if nums:
            return int(nums[0])
    except:
        pass
    return 0

def compute_score(row):
    score = 0
    
    # 1. Decision Maker (+20)
    dm = row.get('Decision_Maker') or row.get('Decision_Makers')
    if has_value(dm):
        score += 20
        
    # 2. Email (+20)
    email = row.get('Email') or row.get('Scraped_Emails')
    if has_value(email):
        score += 20
        
    # 3. LinkedIn Company (+15)
    li_co = row.get('LinkedIn_Company')
    if has_value(li_co) and 'linkedin.com' in str(li_co):
        score += 15
        
    # 4. Phone (+10)
    phone = row.get('Phone') or row.get('Telefone')
    if has_value(phone):
        score += 10
        
    # 5. Certifications (+10)
    # Check multiple columns
    is_cert = False
    for col in ['FDA_Certified', 'CE_Certified', 'Anvisa', 'ISO_Certified']:
        if row.get(col) in [True, 'True', 'true', 1, '1']:
            is_cert = True
            break
    if is_cert:
        score += 10
        
    # 6. Employees (+10 or +5)
    emp_count = clean_employees(row.get('Employees') or row.get('employees'))
    if emp_count > 50:
        score += 10
    elif emp_count > 10:
        score += 5
        
    # 7. Website (+5) - implicit if we are scoring it, but check field
    if has_value(row.get('Website')):
        score += 5
        
    # 8. Description / Notes (+5)
    notes = row.get('Perplexity_Notes') or row.get('Description')
    if has_value(notes) and len(str(notes)) > 20:
        score += 5
        
    return min(score, 100)

def main():
    print("=== ADVANCED SCORING CALCULATION ===")
    if not os.path.exists(INPUT_FILE):
        print(f"[ERROR] File not found: {INPUT_FILE}")
        return
        
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Calculate Scores
    df['Lead_Score'] = df.apply(compute_score, axis=1)
    
    # Statistics
    avg_score = df['Lead_Score'].mean()
    high_value_count = len(df[df['Lead_Score'] >= 70])
    
    print(f"✅ Recalculated Scores.")
    print(f"   Average Score: {avg_score:.1f}")
    print(f"   High Value (>70): {high_value_count}")
    print(f"   Score Range: {df['Lead_Score'].min()} - {df['Lead_Score'].max()}")
    
    df.to_csv(INPUT_FILE, index=False)
    print(f"💾 Saved to {INPUT_FILE}")

if __name__ == "__main__":
    main()
