#!/usr/bin/env python3
"""
Advanced Lead Scoring System
Max score: 15 points across 10 factors
Includes confidence score (0-100%) based on data completeness
"""

import pandas as pd
import json

INPUT_FILE = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'

def count_decision_makers(dm_json):
    """Count decision makers from JSON string"""
    if pd.isna(dm_json) or not dm_json:
        return 0
    try:
        people = json.loads(dm_json)
        return len(people) if isinstance(people, list) else 0
    except:
        return 0

def compute_score(row):
    """Compute lead score (max 15 points)"""
    score = 0.0
    
    # 1. Email (3 points)
    email = row.get('Email') or row.get('Scraped_Emails')
    if isinstance(email, str) and email.strip() and '@' in email:
        score += 3.0
    
    # 2. Decision Maker (2 points base)
    dm_count = count_decision_makers(row.get('Decision_Makers_Deep'))
    if dm_count > 0:
        score += 2.0
        # 3. Multiple DMs (+1 bonus)
        if dm_count >= 2:
            score += 1.0
    
    # 4. Phone Number (1 point)
    phone = row.get('Phone')
    if isinstance(phone, str) and phone.strip() and '+55' in phone:
        score += 1.0
    
    # 5. LinkedIn Company (1 point)
    linkedin_company = row.get('LinkedIn_Company')
    if isinstance(linkedin_company, str) and linkedin_company.strip():
        score += 1.0
    
    # 6. LinkedIn Person (2 points)
    linkedin_person = row.get('LinkedIn_Person')
    if isinstance(linkedin_person, str) and linkedin_person.strip():
        score += 2.0
    
    # 7. FDA Certification (2 points)
    if row.get('FDA_Certified') in [True, 'True', 'true', 1]:
        score += 2.0
    
    # 8. CE Certification (2 points)
    if row.get('CE_Certified') in [True, 'True', 'true', 1]:
        score += 2.0
    
    # 9. Employee Count (1-2 points)
    try:
        emp = int(row.get('employees') or row.get('Employees') or 0)
        if emp >= 200:
            score += 2.0
        elif emp >= 50:
            score += 1.0
    except:
        pass
    
    # 10. Website Quality (1 point)
    website = row.get('Website')
    if isinstance(website, str) and website.startswith('https://'):
        score += 1.0
    
    return min(score, 15.0)

def compute_confidence(row):
    """Compute confidence score (0-100%) based on data completeness"""
    total_fields = 10
    filled_fields = 0
    
    # Check each key field
    if row.get('Email') or row.get('Scraped_Emails'):
        filled_fields += 1
    if count_decision_makers(row.get('Decision_Makers_Deep')) > 0:
        filled_fields += 1
    if row.get('Phone'):
        filled_fields += 1
    if row.get('LinkedIn_Company'):
        filled_fields += 1
    if row.get('LinkedIn_Person'):
        filled_fields += 1
    if row.get('FDA_Certified') or row.get('CE_Certified'):
        filled_fields += 1
    if row.get('employees') or row.get('Employees'):
        filled_fields += 1
    if row.get('Website'):
        filled_fields += 1
    if row.get('City') or row.get('Cidade'):
        filled_fields += 1
    if row.get('State') or row.get('Estado'):
        filled_fields += 1
    
    return int((filled_fields / total_fields) * 100)

def main():
    print("=== ADVANCED LEAD SCORING ===")
    
    df = pd.read_csv(INPUT_FILE)
    print(f"Loaded {len(df)} leads.")
    
    # Compute scores
    df['Lead_Score'] = df.apply(compute_score, axis=1)
    df['Confidence_Score'] = df.apply(compute_confidence, axis=1)
    
    # Save
    df.to_csv(INPUT_FILE, index=False)
    
    # Stats
    print(f"\n✅ Scoring complete!")
    print(f"Score range: {df['Lead_Score'].min():.1f} - {df['Lead_Score'].max():.1f}")
    print(f"Average score: {df['Lead_Score'].mean():.1f}")
    print(f"Average confidence: {df['Confidence_Score'].mean():.0f}%")
    print(f"\nScore distribution:")
    print(f"  10-15 (Excellent): {len(df[df['Lead_Score'] >= 10])}")
    print(f"  7-9 (Good): {len(df[(df['Lead_Score'] >= 7) & (df['Lead_Score'] < 10)])}")
    print(f"  4-6 (Fair): {len(df[(df['Lead_Score'] >= 4) & (df['Lead_Score'] < 7)])}")
    print(f"  0-3 (Low): {len(df[df['Lead_Score'] < 4])}")

if __name__ == "__main__":
    main()
