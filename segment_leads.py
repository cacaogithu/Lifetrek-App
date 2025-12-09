"""
Segment Leads
Cleans the master dataset and splits it into sales-ready CSVs.
"""

import pandas as pd
import os

def segment_leads():
    print("=== SEGMENTING CONSOLIDATED LEADS ===")
    
    df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')
    
    # 1. Clean Columns
    # Rename columns to be sales-friendly
    # Keep: ID, Name, Website, Segment, City, State, Score, Products, Notes, Email, LinkedIn, DecisionMaker
    
    # Map valid columns
    cols_map = {
        'Nome Empresa': 'Company',
        'Website': 'Website',
        'Segmento': 'Segment',
        'Cidade': 'City',
        'Estado': 'State',
        'V2_Score': 'Lead_Score',
        'Produtos': 'Products',
        'Scraped_Emails': 'Email',
        'LinkedIn': 'LinkedIn_Company',
        'LinkedIn_Profiles': 'LinkedIn_Person', # If any found
        'Decision_Makers': 'Decision_Maker',
        'employees': 'Employees',
        'years': 'Years_Active',
        'has_fda': 'FDA_Certified',
        'has_ce': 'CE_Certified'
    }
    
    # Create clean DF
    clean_df = df.rename(columns=cols_map)
    
    # Select only relevant columns
    desired_cols = [
        'Company', 'Website', 'Lead_Score', 'Email', 'Decision_Maker', 
        'Employees', 'Years_Active', 'City', 'State', 
        'FDA_Certified', 'CE_Certified', 'Products', 'LinkedIn_Company'
    ]
    
    # Ensure they exist (fill missing)
    for col in desired_cols:
        if col not in clean_df.columns:
            clean_df[col] = ''
            
    final_df = clean_df[desired_cols].sort_values(by='Lead_Score', ascending=False)
    
    # Format Floats
    final_df['Lead_Score'] = final_df['Lead_Score'].map('{:.1f}'.format)
    
    # 2. Export Lists
    output_dir = "/Users/rafaelalmeida/Desktop/Sales_Ready_Lists"
    os.makedirs(output_dir, exist_ok=True)
    
    # List A: High Priority (Score >= 7.0)
    priority_leads = final_df[final_df['Lead_Score'].astype(float) >= 7.0]
    priority_leads.to_csv(f"{output_dir}/01_Priority_Leads_Top{len(priority_leads)}.csv", index=False)
    print(f"✅ Created Priority List: {len(priority_leads)} leads")
    
    # List B: Standard Leads (Score < 7.0)
    standard_leads = final_df[final_df['Lead_Score'].astype(float) < 7.0]
    standard_leads.to_csv(f"{output_dir}/02_Standard_Leads.csv", index=False)
    print(f"✅ Created Standard List: {len(standard_leads)} leads")
    
    # List C: Regional (Sao Paulo)
    sp_leads = final_df[final_df['State'] == 'SP']
    sp_leads.to_csv(f"{output_dir}/03_Regional_SaoPaulo.csv", index=False)
    print(f"✅ Created SP Regional List: {len(sp_leads)} leads")
    
    # List D: Manufacturers (FDA or Manufacturer flag - inferred from Products or explicit)
    # Actually we had 'is_manufacturer' logic but simplified.
    # Let's use FDA/CE as proxy for High Compliance
    compliance_leads = final_df[(final_df['FDA_Certified'] == True) | (final_df['CE_Certified'] == True)]
    compliance_leads.to_csv(f"{output_dir}/04_High_Compliance_Leads.csv", index=False)
    print(f"✅ Created High Compliance List: {len(compliance_leads)} leads")
    
    print(f"\n📂 Files saved to: {output_dir}")

if __name__ == "__main__":
    segment_leads()
