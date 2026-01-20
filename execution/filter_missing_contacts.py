"""
Filter and enrich companies missing phone or email
Focus enrichment on companies that need contact data
"""

import pandas as pd
import sys
import os

# Add utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'utils'))

print("🔍 Analisando empresas sem phone/email...\n")

# Load the large database
df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/.tmp/new_leads_advanced.csv')
print(f"📊 Total de empresas: {len(df)}")

# Check current status
has_phone = df['Phone'].notna().sum()
print(f"✅ Com telefone: {has_phone} ({has_phone/len(df)*100:.1f}%)")

# Filter companies missing phone or email
# Assuming email column might not exist, let's check
if 'Email' in df.columns:
    has_email = df['Email'].notna().sum()
    print(f"✅ Com email: {has_email} ({has_email/len(df)*100:.1f}%)")
    missing_contact = df[(df['Phone'].isna()) | (df['Email'].isna())]
else:
    print("⚠️  Coluna Email não existe ainda")
    df['Email'] = None
    missing_contact = df[df['Phone'].isna()]

print(f"\n🎯 Empresas faltando phone/email: {len(missing_contact)}")

if len(missing_contact) > 0:
    # Save filtered list
    output_file = '/Users/rafaelalmeida/lifetrek-mirror/.tmp/leads_missing_contact.csv'
    missing_contact.to_csv(output_file, index=False)
    print(f"💾 Salvo em: {output_file}")
    
    print(f"\n📋 Primeiras 10 empresas sem contato completo:")
    print(missing_contact[['Nome Empresa', 'Website', 'Phone']].head(10).to_string(index=False))
    
    print(f"\n✨ Total para enriquecer: {len(missing_contact)} empresas")
else:
    print("\n🎉 Todas as empresas já têm phone/email!")
