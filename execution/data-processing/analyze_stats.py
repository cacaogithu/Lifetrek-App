import pandas as pd
import os

FILE = '../../.tmp/MASTER_ENRICHED_LEADS.csv'

if not os.path.exists(FILE):
    print("Master file not found.")
    exit()

df = pd.read_csv(FILE)
total = len(df)
with_dm = df['Decision_Maker'].notna().sum()
with_dm_pct = (with_dm / total) * 100

with_email = df['Email'].notna().sum()
with_email_pct = (with_email / total) * 100

with_li_co = df['LinkedIn_Company'].notna().sum()
with_li_co_pct = (with_li_co / total) * 100

with_li_person = df['LinkedIn_Person'].notna().sum()
with_li_person_pct = (with_li_person / total) * 100

with_phone = 0
if 'Phone' in df.columns:
    with_phone = df['Phone'].notna().sum()

avg_score = 0
if 'V2_Score' in df.columns:
    avg_score = pd.to_numeric(df['V2_Score'], errors='coerce').mean()

print(f"Total Leads: {total}")
print(f"Decision Maker: {with_dm} ({with_dm_pct:.1f}%)")
print(f"Email: {with_email} ({with_email_pct:.1f}%)")
print(f"LinkedIn Company: {with_li_co} ({with_li_co_pct:.1f}%)")
print(f"LinkedIn Person: {with_li_person} ({with_li_person_pct:.1f}%)")
print(f"Phone: {with_phone}")
print(f"Avg V2 Score: {avg_score:.2f}")

# Check distribution of Enrichment Status
if 'Enrichment_Status' in df.columns:
    print("\nEnrichment Status Distribution:")
    print(df['Enrichment_Status'].value_counts())
