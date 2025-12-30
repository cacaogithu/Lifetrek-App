import pandas as pd
import re

def clean_tier(tier):
    if pd.isna(tier):
        return 0
    tier = str(tier).lower()
    if 'tier 1' in tier or tier == '1':
        return 3
    if 'tier 2' in tier or tier == '2':
        return 2
    if 'tier 3' in tier or tier == '3':
        return 1
    return 0

def analyze_segment(row):
    segment = str(row['Segmento']).lower()
    if 'implantes' in segment:
        return 1
    if 'dispositivos' in segment:
        return -1
    return 0

def analyze_products(row):
    products = str(row['Produtos']).lower()
    score = 0
    # High value keywords
    if 'implantes' in products: score += 1
    if 'cirúrgicos' in products: score += 1
    if 'prótese' in products: score += 1
    
    # Low value keywords (Consumables)
    if 'luvas' in products: score -= 1
    if 'seringas' in products: score -= 1
    if 'agucas' in products: score -= 1 # typo check
    if 'agulhas' in products: score -= 1
    if 'descartáveis' in products: score -= 1
    
    return score

def main():
    try:
        df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/Possiveis 200 - Página1.csv')
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # Clean and Numericize columns for correlation
    df['Renner_Score'] = pd.to_numeric(df['1-10 ICP? Renner'], errors='coerce').fillna(0)
    
    # Feature 1: Tier Score
    df['Tier_Val'] = df['Tier'].apply(clean_tier)
    
    # Feature 2: Segment Score
    df['Segment_Val'] = df.apply(analyze_segment, axis=1)
    
    # Feature 3: Product Score
    df['Product_Val'] = df.apply(analyze_products, axis=1)
    
    # Calculate Correlations
    print("Correlations with Renner Score:")
    print(df[['Renner_Score', 'Tier_Val', 'Segment_Val', 'Product_Val']].corr()['Renner_Score'])
    
    # Proposed Scoring Model
    # Base score 5
    # + Tier_Val * 1.5
    # + Segment_Val * 2
    # + Product_Val * 0.5
    
    df['Predicted_Score'] = 4 + (df['Tier_Val'] * 1.0) + (df['Segment_Val'] * 2.0) + (df['Product_Val'] * 0.5)
    
    # Cap at 10
    df['Predicted_Score'] = df['Predicted_Score'].apply(lambda x: min(10, max(0, x)))
    
    # Compare
    comparison = df[['Nome Empresa', 'Renner_Score', 'Predicted_Score']].head(20)
    print("\nComparison (Top 20):")
    print(comparison)
    
    # Save a sample to check
    df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/leads_analysis_output.csv', index=False)
    print("\nSaved analysis to leads_analysis_output.csv")

if __name__ == "__main__":
    main()
