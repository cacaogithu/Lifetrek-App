import csv
import os
import sys

# Paths
BASE_DIR = os.getcwd()
INPUT_FILE = os.path.join(BASE_DIR, 'execution', 'FINAL_LEADS_FOR_UPLOAD.csv')
OUTPUT_FILE = os.path.join(BASE_DIR, 'execution', 'RANKED_LEADS_HEATMAP.csv')
SUMMARY_FILE = os.path.join(BASE_DIR, 'execution', 'LEADS_SUMMARY.md')

# Ownership Rules
OWNERSHIP_RULES = {
    'MARCIO': [
        "Implantes Odontológicos", "Implantes Ortopédicos", "Implantes Veterinários",
        "Ferramental Customizado", "Peças de Micro Precisão", "Implantes Espinhais",
        "Veterinário Ortopedia"
    ],
    'VANESSA': [
        "Equipamentos Odontológicos", "Instrumentos Cirúrgicos", "Dispositivos Médicos",
        "Materiais Odontológicos", "Distribuidor", "Distribuidor Ortopedia",
        "Materiais Consumo", "Equipamentos Hospitalares", "Instrumentos Odontológicos",
        "Materiais Hospitalares", "Equipamentos Médicos", "Dispositivos Eletrônicos",
        "MedTech Software", "Dispositivos Diagnóstico"
    ]
}

def determine_heatmap_category(score):
    if score >= 9.0: return 'HOT 🔥'
    if score >= 7.0: return 'WARM ⚠️'
    return 'COLD ❄️'

def determine_owner(segment):
    if not segment: return 'Unassigned'
    norm_seg = segment.strip()
    
    if norm_seg in OWNERSHIP_RULES['MARCIO']: return 'Márcio'
    if norm_seg in OWNERSHIP_RULES['VANESSA']: return 'Vanessa'
    
    lower = norm_seg.lower()
    if any(k in lower for k in ['implante', 'industrial', 'ferramental']): return 'Márcio'
    if any(k in lower for k in ['equipamento', 'distribuidor', 'comércio', 'hospitalar']): return 'Vanessa'
    
    return 'Unassigned'

def main():
    print(f"Processing {INPUT_FILE}...")
    if not os.path.exists(INPUT_FILE):
        print("Input file not found!")
        sys.exit(1)

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fields = reader.fieldnames + ['heatmap_category', 'suggested_owner']
        rows = list(reader)

    ranked_rows = []
    
    stats = {
        'hot': 0, 'warm': 0, 'cold': 0,
        'marcio': 0, 'vanessa': 0, 'unassigned': 0
    }

    for row in rows:
        # Get Score
        score = 0.0
        if row.get('v2_score'): score = float(row['v2_score'])
        elif row.get('predicted_score'): score = float(row['predicted_score'])
        elif row.get('rating'): score = float(row['rating'])
        
        # Get Segment
        segment = row.get('segmento') or row.get('segment') or ''
        
        category = determine_heatmap_category(score)
        owner = determine_owner(segment)
        
        row['heatmap_category'] = category
        row['suggested_owner'] = owner
        ranked_rows.append(row)
        
        # Stats
        if 'HOT' in category: stats['hot'] += 1
        elif 'WARM' in category: stats['warm'] += 1
        else: stats['cold'] += 1
        
        if owner == 'Márcio': stats['marcio'] += 1
        elif owner == 'Vanessa': stats['vanessa'] += 1
        else: stats['unassigned'] += 1

    total = len(ranked_rows)
    
    # Write CSV
    with open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(ranked_rows)
        
    print(f"Written {total} rows to {OUTPUT_FILE}")

    # Write Summary
    md_content = f"""# Lead Ranking Summary Report

**Total Leads Processed:** {total}

## 🔥 Heatmap Distribution
| Category | Count | Percentage |
|----------|-------|------------|
| **HOT 🔥** | {stats['hot']} | {(stats['hot']/total*100):.1f}% |
| **WARM ⚠️** | {stats['warm']} | {(stats['warm']/total*100):.1f}% |
| **COLD ❄️** | {stats['cold']} | {(stats['cold']/total*100):.1f}% |

## 👤 Ownership Assignment Strategy
- **Márcio (Manufacturing & Industrial Focus):** {stats['marcio']} leads
- **Vanessa (Commercial & Products Focus):** {stats['vanessa']} leads
- **Unassigned:** {stats['unassigned']} leads
"""
    
    with open(SUMMARY_FILE, 'w', encoding='utf-8') as f:
        f.write(md_content)
        
    print(f"Summary written to {SUMMARY_FILE}")

if __name__ == "__main__":
    main()
