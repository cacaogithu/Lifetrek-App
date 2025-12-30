# Data Processing & Analytics

## Goal

Process, analyze, score, and segment enriched lead data to create actionable insights and prioritized sales pipelines.

## Inputs

- **Master CSV:** `../../.tmp/MASTER_ENRICHED_LEADS.csv`
- **Delta CSVs:** `../../.tmp/delta_*.csv` (incremental enrichment results)
- **Result JSONs:** `../../.tmp/*_results.json` (API responses)

## Tools/Scripts

### Analysis Scripts (`execution/data-processing/`)

- `analyze_enrichment_status.py` - Check enrichment completion rates
- `analyze_leads.py` - Analyze lead quality and distribution
- `analyze_parameters.py` - Analyze scraping parameters
- `analyze_stats.py` - Generate summary statistics

### Merging Scripts

- `create_master_csv.py` - Create master CSV from scratch
- `create_final_deliverable.py` - Generate final deliverable CSV
- `merge_all_deltas.py` - Merge all delta files into master
- `merge_linkedin_results.py` - Merge LinkedIn enrichment results
- `merge_new_leads.py` - Merge newly discovered leads
- `merge_parallel_delta.py` - Merge parallel enrichment runs

### Scoring Scripts

- `score_leads.py` - Basic lead scoring (0-10)
- `score_leads_advanced.py` - Advanced scoring (0-15+)
- `recalculate_scores.py` - Recalculate all scores
- `validate_scoring_model.py` - Validate scoring accuracy
- `segment_leads.py` - Segment leads by score/quality

### Data Utilities

- `process_cheerio_results.py` - Process web scraping results
- `inspect_scrape_results.py` - Inspect API responses
- `find_hidden_parameters.py` - Discover hidden form parameters
- `fix_phones.py` - Clean phone number formats
- `debug_json.py` - Debug JSON parsing issues

## Outputs

### Primary Output Files

**Master CSV:**
- `../../.tmp/MASTER_ENRICHED_LEADS.csv` - Main lead database

**Deliverables:**
- `../../.tmp/FINAL_DELIVERABLE.csv` - Client-ready CSV
<- `../../.tmp/scoring_insights.json` - Scoring model insights

**Analytics:**
- Console output with statistics
- Progress reports
- Data quality metrics

## Process Flow

### 1. Data Merging

```bash
# After enrichment runs, merge deltas
cd execution/data-processing
python3 merge_all_deltas.py          # Merge all delta files
python3 merge_new_leads.py           # Add new discoveries
python3 merge_linkedin_results.py     # Merge LinkedIn data
```

### 2. Scoring & Segmentation

```bash
# Recalculate scores for all leads
python3 recalculate_scores.py

# Segment leads by quality
python3 segment_leads.py
```

### 3. Analysis & Reporting

```bash
# Check enrichment status
python3 analyze_enrichment_status.py

# Generate statistics
python3 analyze_stats.py

# Analyze lead distribution
python3 analyze_leads.py
```

### 4. Create Deliverable

```bash
# Create final client CSV
python3 create_final_deliverable.py
```

## Scoring Model

### Basic Score (0-10)

| Component | Points | Criteria |
|-----------|--------|----------|
| Website | 2 | Has valid website URL |
| Email | 3 | Has email address |
| Phone | 2 | Has phone number |
| Decision Maker | 2 | Has decision maker name |
| LinkedIn Company | 1 | Has company LinkedIn URL |

### Advanced Score (0-15+)

Additional points for:
- **LinkedIn Person Profile:** +2
- **Multiple Decision Makers:** +1
- **Email Verified:** +1
- **Phone Verified:** +1
- **Industry Match:** +1
- **Geographic Match:** +1

### Confidence Score

Separate scoring dimension (0-100%):
- **Data Source Quality:** Commercial API > Free API > Scraped
- **Verification Status:** Verified > Unverified
- **Data Freshness:** Recent < 30 days = 100%, > 90 days = 50%

## Edge Cases & Learnings

### Data Conflicts

**Duplicate Companies:**
- Use website URL as primary key
- Merge by fuzzy name matching if no website
- Keep highest-scored version
- Log conflicts in merge reports

**Conflicting Data:**
- Prefer newer data over older
- Prefer paid API sources over free scraping
- Manual review for critical conflicts

### Performance

**Large CSV Files (>100MB):**
- Use pandas chunking: `chunksize=10000`
- Process incrementally, don't load entire CSV
- Consider switching to SQLite for >1M rows

**Merge Performance:**
- Index by website URL for faster lookups
- Use sets for deduplication
- Process deltas in chronological order

### Data Quality

**Phone Number Formats:**
- Use `fix_phones.py` to standardize
- Remove '+' prefix causing Excel issues
- Format: International (e.g., 15551234567)

**Email Validation:**
- Check for common patterns (info@, contact@)
- Flag free email providers (gmail, yahoo)
- Mark confidence based on source

**JSON Parsing:**
- Handle malformed `Decision_Makers_Deep` JSON
- Use `debug_json.py` for troubleshooting
- Fallback to string `Decision_Maker` column

## Common Errors & Solutions

**KeyError on Column:**
```python
# Solution: Add default value
df['New_Column'] = df.get('New_Column', '')
```

**Memory Error:**
```python
# Solution: Use chunking
for chunk in pd.read_csv(file, chunksize=10000):
    process(chunk)
```

**Encoding Issues:**
```python
# Solution: Specify encoding
pd.read_csv(file, encoding='utf-8', errors='ignore')
```

## Maintenance Notes

**Daily:**
- Run enrichment status analysis
- Check for merge errors in logs
- Validate new deltas before merging

**Weekly:**
- Recalculate all scores
- Validate scoring model accuracy
- Archive old delta files

**Monthly:**
- Review scoring criteria
- Update segmentation thresholds
- Clean up `.tmp/` directory

**When Scoring Changes:**
- Update `score_leads_advanced.py`
- Run `recalculate_scores.py` on all leads
- Validate with `validate_scoring_model.py`
- Document changes in this directive
