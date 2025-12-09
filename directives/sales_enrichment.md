# Sales Enrichment Directive

## Goal
Produce a list of "Sales Ready" leads that are enriched with deep research (segment, city, state, decision makers) to facilitate immediate sales outreach.

## Workflow Status
This workflow is automated by the orchestration script: `run_orchestration_pipeline.py`.

## Pipeline Steps

### 1. Segmentation
- **Script**: `execution/segment_leads.py` (or root `segment_leads.py`)
- **Input**: `MASTER_ENRICHED_LEADS.csv` (The consolidated master database)
- **Action**: filters and prioritizes leads based on `Lead_Score`.
- **Output**: Generates CSV files in `~/Desktop/Sales_Ready_Lists`.
    - `01_Priority_Leads_TopX.csv`: Score >= 7.0 (Target for enrichment)
    - `02_Standard_Leads.csv`: Score < 7.0
    - `03_Regional_SaoPaulo.csv`: State == SP
    - `04_High_Compliance_Leads.csv`: FDA/CE Certified

### 2. Deep Enrichment (Perplexity)
- **Script**: `enrich_leads_perplexity.py`
- **Input**: The `01_Priority_Leads*.csv` file generated in Step 1.
- **Action**: Queries Perplexity API for missing details:
    - Exact Industry Segment
    - City/State (Localization for easier routing)
    - **Decision Makers** (CEO, CTO, Owner names)
- **Output**: Updates the input CSV file in-place with new columns:
    - `Perplexity_Segment`
    - `Perplexity_City`
    - `Perplexity_State`
    - `Perplexity_Decision_Makers`
    - `Perplexity_Notes`
    - Also backfills main `Segment`, `City`, `State`, `Decision_Maker` columns if empty.

## How to Run
Execute the orchestration script to run the full pipeline:

```bash
python3 run_orchestration_pipeline.py
```

## Maintenance
- **API Key**: Ensure `PERPLEXITY_API_KEY` is valid in `mcp_servers.json` or environment.
- **Rate Limits**: The script runs sequentially. If you hit rate limits, check `enrich_leads_perplexity.py`.
