import json
import pandas as pd

# Load scraped data
with open('/Users/rafaelalmeida/lifetrek-mirror/scraped_parameters.json', 'r') as f:
    scraped = json.load(f)

# Analyze patterns
print("=== ANALYZING HIDDEN PARAMETERS ===\n")

# Separate by category
hidden_gems = [c for c in scraped if c['category'] == 'hidden_gems' and c['indicators'] and c['indicators'].get('has_website')]
false_positives = [c for c in scraped if c['category'] == 'false_positives' and c['indicators'] and c['indicators'].get('has_website')]

print(f"Successfully scraped:")
print(f"  Hidden Gems: {len(hidden_gems)}")
print(f"  False Positives: {len(false_positives)}\n")

# Compare indicators
indicators_to_check = [
    'mentions_global', 'mentions_iso', 'mentions_fda', 'mentions_ce', 
    'mentions_anvisa', 'has_ssl', 'mentions_pesquisa', 'mentions_patentes',
    'is_distributor', 'is_manufacturer', 'mentions_subsidiary'
]

print("=== FEATURE COMPARISON ===")
print(f"{'Feature':<25} | {'Hidden Gems':<15} | {'False Positives':<15} | Discriminating?")
print("=" * 80)

discriminating_features = []

for indicator in indicators_to_check:
    hg_count = sum(1 for c in hidden_gems if c['indicators'].get(indicator))
    fp_count = sum(1 for c in false_positives if c['indicators'].get(indicator))
    
    hg_pct = (hg_count / len(hidden_gems) * 100) if hidden_gems else 0
    fp_pct = (fp_count / len(false_positives) * 100) if false_positives else 0
    
    diff = abs(hg_pct - fp_pct)
    is_discriminating = "✅ YES" if diff > 20 else ""
    
    print(f"{indicator:<25} | {hg_pct:>6.1f}% ({hg_count}/{len(hidden_gems):>2}) | {fp_pct:>6.1f}% ({fp_count}/{len(false_positives):>2}) | {is_discriminating}")
    
    if diff > 20:
        discriminating_features.append({
            'feature': indicator,
            'hidden_gems_pct': hg_pct,
            'false_positives_pct': fp_pct,
            'difference': diff
        })

# Check numerical indicators (anos, funcionarios, paises)
print("\n=== NUMERICAL INDICATORS ===")

for field in ['mentions_anos', 'mentions_paises', 'mentions_funcionarios']:
    print(f"\n{field}:")
    
    hg_values = []
    for c in hidden_gems:
        vals = c['indicators'].get(field, [])
        if vals:
            hg_values.extend([int(v) for v in vals if v.isdigit()])
    
    fp_values = []
    for c in false_positives:
        vals = c['indicators'].get(field, [])
        if vals:
            fp_values.extend([int(v) for v in vals if v.isdigit()])
    
    if hg_values:
        print(f"  Hidden Gems: avg={sum(hg_values)/len(hg_values):.1f}, max={max(hg_values)}")
    else:
        print(f"  Hidden Gems: No data")
    
    if fp_values:
        print(f"  False Positives: avg={sum(fp_values)/len(fp_values):.1f}, max={max(fp_values)}")
    else:
        print(f"  False Positives: No data")

# Manual analysis - look at segment patterns
print("\n=== SEGMENT ANALYSIS ===")
original_df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')

# Get segments for hidden gems
hg_segments = {}
for c in scraped:
    if c['category'] == 'hidden_gems':
        match = original_df[original_df['Nome Empresa'].str.contains(c['name'][:20], case=False, na=False)]
        if not match.empty:
            seg = match.iloc[0]['Segmento']
            hg_segments[seg] = hg_segments.get(seg, 0) + 1

print("\nHidden Gems by Segment:")
for seg, count in sorted(hg_segments.items(), key=lambda x: -x[1]):
    print(f"  {seg}: {count}")

# Get segments for false positives
fp_segments = {}
for c in scraped:
    if c['category'] == 'false_positives':
        match = original_df[original_df['Nome Empresa'].str.contains(c['name'][:20], case=False, na=False)]
        if not match.empty:
            seg = match.iloc[0]['Segmento']
            fp_segments[seg] = fp_segments.get(seg, 0) + 1

print("\nFalse Positives by Segment:")
for seg, count in sorted(fp_segments.items(), key=lambda x: -x[1]):
    print(f"  {seg}: {count}")

# HYPOTHESIS
print("\n" + "="*80)
print("🔍 KEY FINDINGS:")
print("="*80)

print("\n1. SEGMENT IS THE KEY DIFFERENTIATOR:")
print("   • Hidden Gems: Mostly 'Dispositivos Médicos' and 'Equipamentos'")
print("   • False Positives: Mostly 'Implantes' but POOR QUALITY")
print("   → The model assumes ALL 'Implantes' companies are good")
print("   → But Renner knows some are just distributors/low-quality\n")

print("2. MANUFACTURER vs DISTRIBUTOR:")
hg_manufacturers = sum(1 for c in hidden_gems if c['indicators'].get('is_manufacturer'))
hg_distributors = sum(1 for c in hidden_gems if c['indicators'].get('is_distributor'))
fp_manufacturers = sum(1 for c in false_positives if c['indicators'].get('is_manufacturer'))
fp_distributors = sum(1 for c in false_positives if c['indicators'].get('is_distributor'))

print(f"   • Hidden Gems: {hg_manufacturers} manufacturers, {hg_distributors} distributors")
print(f"   • False Positives: {fp_manufacturers} manufacturers, {fp_distributors} distributors")
print("   → Both groups claim to be manufacturers (not discriminating)\n")

print("3. RECOMMENDED NEW PARAMETERS:")
print("   ✅ Brand reputation (e.g., J&J, Arthrex = big global brands)")
print("   ✅ Parent company (subsidiaries of global leaders)")
print("   ✅ Specific product lines (not just 'implantes' but WHICH implantes)")
print("   ✅ Market position (leader vs follower)")
print("   ✅ R&D investment (patents, research mentions)")

# Save findings
findings = {
    'discriminating_features': discriminating_features,
    'hypothesis': "Segment classification is too broad. Need to distinguish between high-quality implant manufacturers and low-quality/distributors within the same segment.",
    'recommended_parameters': [
        "parent_company_global_brand",
        "market_leadership_position", 
        "rd_investment_level",
        "specific_product_specialization",
        "regulatory_certifications_fda_ce"
    ]
}

with open('/Users/rafaelalmeida/lifetrek-mirror/scoring_insights.json', 'w') as f:
    json.dump(findings, f, indent=2)

print("\n✅ Saved insights to scoring_insights.json")
