# Enrichment Suite Guide

## Overview
We have a parallel processing engine running to enrich leads from multiple sources aimed at "Zero Cost" or "Low Cost" high-volume processing.

### The Engine Room (Scripts)
All scripts run in parallel and write to specific "Delta" files. They do **not** lock the master CSV.

| Component | Script Name | Output File | Purpose |
| :--- | :--- | :--- | :--- |
| **🧠 AI Core** | `enrich_smart_ai_slow.py` | `delta_ai.csv` | Uses Perplexity API to find DMs. High accuracy. |
| **🕷️ Web Crawler** | `enrich_team_free_v2.py` | `delta_free.csv` | Visits company websites to find "Team/About" pages. Zero cost. |
| **🔎 LinkedIn** | `enrich_people_linkedin_slow_loop.py` | `delta_linkedin.csv` | Slow-loops Google Search for LinkedIn profiles. Zero cost. |

## how to Run Everything
To start the "Maximum Info" mode:

1.  **Start AI (Terminal 1)**: `python3 enrich_smart_ai_slow.py`
2.  **Start Web Crawler (Terminal 2)**: `python3 enrich_team_free_v2.py`
3.  **Start LinkedIn Loop (Terminal 3)**: `python3 enrich_people_linkedin_slow_loop.py`

## How to Get Results
You can pull the data at any time without stopping the scripts.

1.  **Merge Deltas**: 
    ```bash
    python3 merge_all_deltas.py
    ```
    *This pulls all new findings from the 3 delta files and saves them to `MASTER_ENRICHED_LEADS.csv`.*

2.  **Export Final List**:
    ```bash
    python3 create_final_deliverable.py
    ```
    *This filters the Top 1000 best leads into `FINAL_DELIVERABLE.csv` for your use.*

## Troubleshooting
*   **429 Errors**: Normal for Google/Perplexity. The scripts are designed to sleep and retry. Just let them run.
*   **Zero Results**: Phase 3 (LinkedIn) is very hard to do for free at scale. Expect low yield compared to Phase 1 & 2.
