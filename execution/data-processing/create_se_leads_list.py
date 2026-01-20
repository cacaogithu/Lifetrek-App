#!/usr/bin/env python3
"""
Generate Sales Engineer Leads List

Creates a curated list of high-quality leads for the new Sales Engineer.
Filters for leads with:
- Lead Score >= 10
- Has email address
- Has decision maker name

Output: Top 200 leads sorted by score (highest priority first)
"""

import pandas as pd
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
TMP_DIR = PROJECT_ROOT / ".tmp"
MASTER_CSV = TMP_DIR / "MASTER_ENRICHED_LEADS.csv"
OUTPUT_CSV = TMP_DIR / "sales_engineer_leads.csv"

def create_se_leads_list():
    """Generate Sales Engineer leads list from master CSV."""
    
    print("Loading master leads file...")
    df = pd.read_csv(MASTER_CSV)
    print(f"Total leads in database: {len(df)}")
    
    # Filter for high-quality leads
    print("\nFiltering for high-quality leads...")
    se_leads = df[
        (df['Lead_Score'] >= 10) &
        (df['Email'].notna()) &
        (df['Email'] != '') &
        (df['Decision_Maker'].notna()) &
        (df['Decision_Maker'] != '')
    ].copy()
    
    print(f"Leads meeting criteria (Score >= 10, Email, Decision Maker): {len(se_leads)}")
    
    # Add priority categorization
    def categorize_priority(row):
        score = row['Lead_Score']
        has_linkedin_company = pd.notna(row.get('LinkedIn_Company', '')) and row.get('LinkedIn_Company', '') != ''
        has_phone = pd.notna(row.get('Phone', '')) and row.get('Phone', '') != ''
        
        if score >= 13 and has_linkedin_company and has_phone:
            return 'High'
        elif score >= 11 and (has_linkedin_company or has_phone):
            return 'Medium'
        else:
            return 'Low'
    
    se_leads['Priority'] = se_leads.apply(categorize_priority, axis=1)
    
    # Sort by score (highest first), then by priority
    se_leads = se_leads.sort_values(['Lead_Score', 'Priority'], ascending=[False, True])
    
    # Select top 200 for initial assignment
    se_leads = se_leads.head(200)
    
    # Select relevant columns for SE
    output_columns = [
        'Company_Name',
        'Website',
        'Email',
        'Phone',
        'Decision_Maker',
        'LinkedIn_Company',
        'LinkedIn_Person',
        'Industry',
        'Lead_Score',
        'Priority'
    ]
    
    # Only include columns that exist
    available_columns = [col for col in output_columns if col in se_leads.columns]
    se_leads_output = se_leads[available_columns].copy()
    
    # Save to CSV
    se_leads_output.to_csv(OUTPUT_CSV, index=False)
    
    print(f"\n✅ Created SE leads list: {len(se_leads_output)} companies")
    print(f"📁 Saved to: {OUTPUT_CSV}")
    
    # Print summary statistics
    print("\n--- Priority Breakdown ---")
    priority_counts = se_leads['Priority'].value_counts()
    for priority, count in priority_counts.items():
        print(f"{priority}: {count} ({count/len(se_leads)*100:.1f}%)")
    
    print("\n--- Score Distribution ---")
    print(f"Average Score: {se_leads['Lead_Score'].mean():.1f}")
    print(f"Highest Score: {se_leads['Lead_Score'].max()}")
    print(f"Lowest Score: {se_leads['Lead_Score'].min()}")
    
    print("\n--- Data Completeness ---")
    print(f"With Phone: {se_leads['Phone'].notna().sum()} ({se_leads['Phone'].notna().sum()/len(se_leads)*100:.1f}%)")
    if 'LinkedIn_Company' in se_leads.columns:
        linkedin_count = (se_leads['LinkedIn_Company'].notna() & (se_leads['LinkedIn_Company'] != '')).sum()
        print(f"With LinkedIn Company: {linkedin_count} ({linkedin_count/len(se_leads)*100:.1f}%)")
    
    return se_leads_output

if __name__ == "__main__":
    try:
        leads = create_se_leads_list()
        print("\n✅ Success! Sales Engineer leads list ready.")
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("Make sure MASTER_ENRICHED_LEADS.csv exists in .tmp/ directory")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
