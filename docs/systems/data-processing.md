# Data Processing & Pipeline Guide

## Goal

Process, analyze, score, and segment enriched lead data to create actionable insights and prioritized sales pipelines.

## Inputs

- **Master CSV:** `../../.tmp/MASTER_ENRICHED_LEADS.csv`
- **Delta CSVs:** `../../.tmp/delta_*.csv`
- **Result JSONs:** `../../.tmp/*_results.json`

## Tools & Scripts

### Analysis Scripts (`execution/data-processing/`)
- `analyze_enrichment_status.py`: Check completion rates.
- `analyze_leads.py`: Analyze lead quality.
- `analyze_stats.py`: Generate summary statistics.

### Merging Scripts
- `create_master_csv.py`: Create master CSV from scratch.
- `merge_all_deltas.py`: Merge all delta files into master.
- `merge_new_leads.py`: Merge newly discovered leads.

### Scoring Scripts
- `score_leads.py`: Basic lead scoring.
- `segment_leads.py`: Segment leads by score/quality.

## Process Flow

### 1. Data Merging
After enrichment runs, merge deltas:
```bash
cd execution/data-processing
python3 merge_all_deltas.py
python3 merge_new_leads.py
python3 merge_linkedin_results.py
```

### 2. Scoring & Segmentation
Recalculate scores and segment:
```bash
python3 recalculate_scores.py
python3 segment_leads.py
```

### 3. Analysis & Reporting
Generate stats:
```bash
python3 analyze_stats.py
```

### 4. Create Deliverable
Create final client CSV:
```bash
python3 create_final_deliverable.py
```

## Scoring Model

### Basic Score (0-10)
- **Website**: 2 pts
- **Email**: 3 pts
- **Phone**: 2 pts
- **Decision Maker**: 2 pts
- **LinkedIn Company**: 1 pt

### Advanced Score (0-15+)
- **LinkedIn Person Profile**: +2
- **Multiple Decision Makers**: +1
- **Email/Phone Verified**: +1 each
- **Industry/Geo Match**: +1 each

## Common Errors & Solutions

- **Memory Error**: If processing very large CSVs, scripts use chunking. Ensure your machine has available RAM.
- **Mac/Excel Issues**: Phone numbers are cleaned to remove `+` prefixes to avoid Excel formatting issues (`fix_phones.py`).
