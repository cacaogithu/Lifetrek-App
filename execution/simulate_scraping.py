"""
Script de Scraping Simulado - Popula o spreadsheet localmente
Simula o fluxo de scraping adicionando leads direto no localStorage do navegador
"""

import json
import random
import time

# Empresas do setor médico brasileiro para popular
companies = [
    {"name": "Dental Cremer", "segment": "Dental Equipment", "score": 8.9},
    {"name": "Gnatus", "segment": "Dental Equipment", "score": 8.7},
    {"name": "Straumann Brasil", "segment": "Dental Implants", "score": 9.1},
    {"name": "Biomec", "segment": "Orthopedic Implants", "score": 7.8},
    {"name": "Ortomedical", "segment": "Orthopedic Implants", "score": 7.5},
    {"name": "MDT Implantes", "segment": "Dental Implants", "score": 8.2},
    {"name": "SIN Implante System", "segment": "Dental Implants", "score": 8.8},
    {"name": "Titanium Fix", "segment": "Orthopedic Implants", "score": 8.1},
    {"name": "FGM Dental", "segment": "Dental Materials", "score": 7.9},
    {"name": "Essence Dental", "segment": "Dental Equipment", "score": 7.3},
]

cities = [
    ("São Paulo", "SP"),
    ("Curitiba", "PR"),
    ("Joinville", "SC"),
    ("São José dos Campos", "SP"),
    ("Bauru", "SP"),
    ("Porto Alegre", "RS"),
]

print("🔍 Simulando Scraping de Empresas\n")
print("=" * 60)

leads_data = []

for i, company in enumerate(companies, 1):
    city, state = random.choice(cities)
    
    lead = {
        "nome_empresa": company["name"],
        "website": f"https://{company['name'].lower().replace(' ', '')}.com.br",
        "segmento": company["segment"],
        "cidade": city,
        "estado": state,
        "v2_score": company["score"],
        "employee_count": random.randint(30, 500),
        "has_iso": random.choice([True, False]),
        "has_ce": random.choice([True, False]),
        "enrichment_status": "pending",
        "priority": random.choice(["high", "medium", "low"]),
    }
    
    leads_data.append(lead)
    
    print(f"[{i}/{len(companies)}] ✅ Scraped: {lead['nome_empresa']}")
    print(f"         └─ Segment: {lead['segmento']}")
    print(f"         └─ Location: {lead['cidade']}, {lead['estado']}")
    print(f"         └─ Score: {lead['v2_score']}")
    time.sleep(0.3)  # Simulate scraping delay

print("\n" + "=" * 60)
print(f"📊 Total: {len(leads_data)} empresas encontradas")
print("=" * 60)

# Save to JSON for manual import via frontend
output_file = "/Users/rafaelalmeida/lifetrek-mirror/.tmp/scraped_leads_demo.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump({"leads": leads_data, "timestamp": time.time()}, f, ensure_ascii=False, indent=2)

print(f"\n💾 Dados salvos em: {output_file}")
print("\n📋 Próximos passos:")
print("   1. Abra: http://localhost:8081/admin/leads")
print("   2. Os dados mock já estão aparecendo!")
print("   3. Para adicionar mais dados, use o botão 'Import CSV'")
print("\n💡 Quando conectar ao banco, rode:")
print("   python3 execution/demo_realtime_sync.py")
print("   para ver o sync em tempo real!")
