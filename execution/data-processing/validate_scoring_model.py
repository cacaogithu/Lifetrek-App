import pandas as pd

# Read the analysis output
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_analysis_output.csv')

# Filter to companies where Renner scored them
df_scored = df[df['Renner_Score'] > 0].copy()

print("=== SCORING MODEL VALIDATION ===\n")
print(f"Total companies analyzed: {len(df)}")
print(f"Companies Renner manually scored: {len(df_scored)}\n")

# Calculate accuracy metrics
df_scored['Score_Diff'] = abs(df_scored['Renner_Score'] - df_scored['Predicted_Score'])
df_scored['Within_1pt'] = df_scored['Score_Diff'] <= 1.0
df_scored['Within_2pt'] = df_scored['Score_Diff'] <= 2.0

print("=== ACCURACY METRICS ===")
print(f"Predictions within 1 point: {df_scored['Within_1pt'].sum()}/{len(df_scored)} ({df_scored['Within_1pt'].mean()*100:.1f}%)")
print(f"Predictions within 2 points: {df_scored['Within_2pt'].sum()}/{len(df_scored)} ({df_scored['Within_2pt'].mean()*100:.1f}%)")
print(f"Average difference: {df_scored['Score_Diff'].mean():.2f} points")
print(f"Max difference: {df_scored['Score_Diff'].max():.2f} points\n")

# Show examples of good and bad predictions
print("=== TOP 5 BEST PREDICTIONS (Closest Match) ===")
best_predictions = df_scored.nsmallest(5, 'Score_Diff')[['Nome Empresa', 'Renner_Score', 'Predicted_Score', 'Score_Diff']]
for idx, row in best_predictions.iterrows():
    print(f"{row['Nome Empresa'][:40]:<40} | Renner: {row['Renner_Score']:.1f} | Predicted: {row['Predicted_Score']:.1f} | Diff: {row['Score_Diff']:.1f}")

print("\n=== TOP 5 WORST PREDICTIONS (Need Review) ===")
worst_predictions = df_scored.nlargest(5, 'Score_Diff')[['Nome Empresa', 'Renner_Score', 'Predicted_Score', 'Score_Diff', 'Segmento']]
for idx, row in worst_predictions.iterrows():
    print(f"{row['Nome Empresa'][:40]:<40} | Renner: {row['Renner_Score']:.1f} | Predicted: {row['Predicted_Score']:.1f} | Diff: {row['Score_Diff']:.1f}")
    print(f"  → Segment: {row['Segmento']}")

# Correlation
correlation = df_scored['Renner_Score'].corr(df_scored['Predicted_Score'])
print(f"\n=== OVERALL CORRELATION ===")
print(f"Correlation coefficient: {correlation:.3f} (1.0 = perfect match)")

# Distribution analysis
print(f"\n=== SCORE DISTRIBUTION ===")
print(f"\nRenner's Manual Scores:")
print(df_scored['Renner_Score'].value_counts().sort_index().to_string())
print(f"\nModel Predicted Scores:")
print(df_scored['Predicted_Score'].value_counts().sort_index().to_string())

