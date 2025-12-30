import pandas as pd

def create_final_deliverable():
    input_path = '/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv'
    output_path = '/Users/rafaelalmeida/lifetrek-mirror/FINAL_DELIVERABLE.csv'
    
    print(f"Reading {input_path}...")
    df = pd.read_csv(input_path)
    
    # Ensure Score is numeric
    if 'V2_Score' in df.columns:
        df['V2_Score'] = pd.to_numeric(df['V2_Score'], errors='coerce').fillna(0)
    else:
        df['V2_Score'] = 0
        
    # Criteria for "Best":
    # 1. High Score
    # 2. Has Email
    # 3. Has Decision Maker (Bonus)
    
    print("Sorting and filtering...")
    
    # Sort by Score (Desc), then Has DM (Desc), then Has Email (Desc)
    df['has_dm'] = df['Decision_Maker'].notna() & (df['Decision_Maker'] != '')
    df['has_email'] = df['Email'].notna() & (df['Email'] != '')
    
    final_df = df.sort_values(
        by=['V2_Score', 'has_dm', 'has_email'], 
        ascending=[False, False, False]
    ).head(1000)
    
    # Drop temp cols
    final_df = final_df.drop(columns=['has_dm', 'has_email'])
    
    final_df.to_csv(output_path, index=False)
    
    print(f"✅ Created {output_path} with top {len(final_df)} leads.")
    
    # Stats
    print("\n--- Final Stats (Top 1000) ---")
    print(f"Email Coverage: {final_df['Email'].notna().sum()}")
    print(f"Decision Maker Coverage: {final_df['Decision_Maker'].notna().sum()}")
    print(f"LinkedIn Coverage: {final_df['LinkedIn_Company'].notna().sum()}")
    print(f"Avg Score: {final_df['V2_Score'].mean():.2f}")

if __name__ == "__main__":
    create_final_deliverable()
