# Sales Enrichment Flows

## Goal
Produce a list of "Sales Ready" leads that are enriched with deep research (segment, city, state, decision makers) to facilitate immediate sales outreach.

## Workflow Status
This workflow is automated by the orchestration script: `run_orchestration_pipeline.py`.

## Pipeline Steps

### 1. Segmentation
- **Script**: `execution/segment_leads.py`
- **Input**: `MASTER_ENRICHED_LEADS.csv`
- **Action**: filters and prioritizes leads based on `Lead_Score`.
- **Output**: Generates CSV files in `~/Desktop/Sales_Ready_Lists` (or configured output dir).
    - `01_Priority_Leads_TopX.csv`: Score >= 7.0 (Target for enrichment)
    - `02_Standard_Leads.csv`: Score < 7.0
    - `03_Regional_SaoPaulo.csv`: State == SP

### 2. Deep Enrichment (Perplexity)
- **Script**: `enrich_leads_perplexity.py`
- **Input**: The Priority Leads file from Step 1.
- **Action**: Queries Perplexity API for missing details (Exact Segment, City/State, Decision Makers).
- **Output**: Updates the input CSV file in-place with new columns (`Perplexity_Segment`, `Perplexity_Decision_Makers`, etc.).

## How to Run
Execute the orchestration script to run the full pipeline:

```bash
python3 run_orchestration_pipeline.py
```

## Maintenance
- **API Key**: Ensure `PERPLEXITY_API_KEY` is valid.
- **Rate Limits**: The script runs sequentially to avoid hitting rate limits.
