import pandas as pd
import json

# Read the data
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')

# Filter to scored companies
df_scored = df[df['Renner_Score'] > 0].copy()
df_scored['Score_Diff'] = df_scored['Renner_Score'] - df_scored['Predicted_Score']

print("=== DISCOVERING HIDDEN PARAMETERS ===\n")

# Find "Hidden Gems" - Renner scored HIGH, model scored LOW
print("🔍 HIDDEN GEMS (Renner likes them, model doesn't)")
print("=" * 80)
hidden_gems = df_scored[df_scored['Score_Diff'] >= 3.0].sort_values('Score_Diff', ascending=False)
print(f"Found {len(hidden_gems)} companies\n")

gems_for_scraping = []
for idx, row in hidden_gems.head(10).iterrows():
    print(f"📌 {row['Nome Empresa']}")
    print(f"   Renner: {row['Renner_Score']:.0f} | Model: {row['Predicted_Score']:.1f} | Gap: +{row['Score_Diff']:.1f}")
    print(f"   Segment: {row['Segmento']}")
    print(f"   Website: {row['Website']}")
    print(f"   Notas: {row['Notas'][:100] if pd.notna(row['Notas']) else 'N/A'}")
    print()
    
    gems_for_scraping.append({
        'name': row['Nome Empresa'],
        'website': row['Website'],
        'renner_score': row['Renner_Score'],
        'predicted_score': row['Predicted_Score'],
        'gap': row['Score_Diff'],
        'reason': 'hidden_gem'
    })

# Find "False Positives" - Model scored HIGH, Renner scored LOW
print("\n❌ FALSE POSITIVES (Model likes them, Renner doesn't)")
print("=" * 80)
false_positives = df_scored[df_scored['Score_Diff'] <= -3.0].sort_values('Score_Diff')
print(f"Found {len(false_positives)} companies\n")

fps_for_scraping = []
for idx, row in false_positives.head(10).iterrows():
    print(f"📌 {row['Nome Empresa']}")
    print(f"   Renner: {row['Renner_Score']:.0f} | Model: {row['Predicted_Score']:.1f} | Gap: {row['Score_Diff']:.1f}")
    print(f"   Segment: {row['Segmento']}")
    print(f"   Website: {row['Website']}")
    print(f"   Notas: {row['Notas'][:100] if pd.notna(row['Notas']) else 'N/A'}")
    print()
    
    fps_for_scraping.append({
        'name': row['Nome Empresa'],
        'website': row['Website'],
        'renner_score': row['Renner_Score'],
        'predicted_score': row['Predicted_Score'],
        'gap': row['Score_Diff'],
        'reason': 'false_positive'
    })

# Save for scraping
scraping_targets = {
    'hidden_gems': gems_for_scraping,
    'false_positives': fps_for_scraping
}

with open('/Users/rafaelalmeida/lifetrek-mirror/companies_to_scrape.json', 'w') as f:
    json.dump(scraping_targets, f, indent=2)

print(f"\n✅ Saved {len(gems_for_scraping) + len(fps_for_scraping)} companies to scrape")
print("   File: companies_to_scrape.json")
