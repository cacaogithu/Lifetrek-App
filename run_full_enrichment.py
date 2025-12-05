"""Run full enrichment on ALL 66 high-value leads"""
import pandas as pd
import json
import re
import urllib.request
import time

# Copy all functions from enrich_v2_free.py
exec(open('/Users/rafaelalmeida/lifetrek-mirror/enrich_v2_free.py').read().split('if __name__')[0])

# Load data
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')
high_scores = df[df['Predicted_Score'] >= 8.0].copy()

print(f"=== FULL ENRICHMENT: {len(high_scores)} companies ===\n")

enriched_results = []

for idx, row in high_scores.iterrows():
    enriched = enrich_lead(row)
    
    v1_score = row['Predicted_Score']
    v2_score = calculate_v2_score(enriched, v1_score)
    
    print(f"  V1: {v1_score:.1f} → V2: {v2_score:.1f} | Renner: {row['Renner_Score']:.1f}")
    
    enriched['v1_score'] = v1_score
    enriched['v2_score'] = v2_score
    enriched['renner_score'] = row['Renner_Score']
    enriched['segment'] = row['Segmento']
    enriched_results.append(enriched)

# Save
df_enriched = pd.DataFrame(enriched_results)
df_enriched.to_csv('/Users/rafaelalmeida/lifetrek-mirror/all_enriched_v2.csv', index=False)

print(f"\n✅ Enriched all {len(enriched_results)} companies")
print(f"\nCorrelation V1 vs Renner: {df_enriched[['v1_score', 'renner_score']].corr().iloc[0,1]:.3f}")
print(f"Correlation V2 vs Renner: {df_enriched[['v2_score', 'renner_score']].corr().iloc[0,1]:.3f}")
