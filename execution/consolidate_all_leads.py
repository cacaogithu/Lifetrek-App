"""
Consolidate all enriched lead data into final master file
Merge both databases keeping best data from each
"""

import pandas as pd
import numpy as np

print("🔄 Consolidando todos os dados enriquecidos...\n")

# Load both files
print("📂 Carregando arquivos...")
df_big = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/new_leads_advanced.csv')
df_small = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')

print(f"   Arquivo grande: {len(df_big)} empresas")
print(f"   Arquivo pequeno: {len(df_small)} empresas")

# Prepare big file with standardized columns
df_big_clean = pd.DataFrame({
    'nome_empresa': df_big['Nome Empresa'],
    'website': df_big['Website'],
    'telefone': df_big['Phone'],
    'endereco': df_big['Address'],
    'rating': df_big.get('Rating'),
    'reviews': df_big.get('Reviews'),
    'source': 'Google Places Advanced'
})

# Prepare small file with standardized columns
df_small_clean = pd.DataFrame({
    'nome_empresa': df_small['Nome Empresa'],
    'website': df_small.get('Website'),
    'telefone': df_small.get('Phone'),
    'segmento': df_small.get('Segmento'),
    'cidade': df_small.get('Cidade'),
    'estado': df_small.get('Estado'),
    'email': df_small.get('Scraped_Emails'),
    'v2_score': df_small.get('V2_Score'),
    'predicted_score': df_small.get('Predicted_Score'),
    'enrichment_status': df_small.get('Enrichment_Status'),
    'source': 'MASTER_ENRICHED_LEADS'
})

# Combine both datasets
print("\n🔗 Mesclando datasets...")
df_combined = pd.concat([df_big_clean, df_small_clean], ignore_index=True)

# Remove duplicates, keeping row with most data
print("🧹 Removendo duplicatas...")
before = len(df_combined)

# Group by company name and keep the row with most non-null values
df_combined = df_combined.groupby('nome_empresa', as_index=False).agg(
    lambda x: x.dropna().iloc[0] if len(x.dropna()) > 0 else x.iloc[0]
)

after = len(df_combined)
print(f"   Removidas: {before - after} duplicatas")

# Sort by score (if available)
if 'v2_score' in df_combined.columns:
    df_combined = df_combined.sort_values('v2_score', ascending=False, na_position='last')

# Save consolidated file
output_file = '/Users/rafaelalmeida/lifetrek-mirror/.tmp/LEADS_CONSOLIDATED.csv'
df_combined.to_csv(output_file, index=False)

print(f"\n✅ Arquivo consolidado criado: {output_file}")
print(f"\n📊 Estatísticas finais:")
print(f"   Total de empresas únicas: {len(df_combined)}")
print(f"   Com telefone: {df_combined['telefone'].notna().sum()} ({df_combined['telefone'].notna().sum()/len(df_combined)*100:.1f}%)")
print(f"   Com website: {df_combined['website'].notna().sum()} ({df_combined['website'].notna().sum()/len(df_combined)*100:.1f}%)")
print(f"   Com email: {df_combined['email'].notna().sum()} ({df_combined['email'].notna().sum()/len(df_combined)*100:.1f}%)")
if 'endereco' in df_combined.columns:
    print(f"   Com endereço: {df_combined['endereco'].notna().sum()} ({df_combined['endereco'].notna().sum()/len(df_combined)*100:.1f}%)")

print(f"\n💾 Arquivo salvo: {output_file}")
print("\n🎉 Consolidação concluída!")
