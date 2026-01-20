# Lead Enrichment System Guide

## Goal

Discover and enrich company leads with comprehensive data including emails, phone numbers, decision makers, LinkedIn profiles, and company information to create a high-quality sales pipeline.

## Inputs

- **Company Name** (required)
- **Website URL** (optional but recommended)
- **Industry/Vertical** (optional for targeted discovery)
- **Geographic Region** (optional for Google Places discovery)

## Tools & Scripts

### Discovery Scripts (`execution/lead-enrichment/`)

- `discover_leads_perplexity.py` - Discover new leads using Perplexity API
- `generate_leads_places.py` - Generate leads from Google Places API
- `bulk_scrape_leads.py` - Bulk scrape leads from various sources

### Enrichment Scripts

**Email Enrichment:**
- `enrich_emails_advanced_free.py` - Free email discovery methods
- `enrich_emails_deep.py` - Deep email search (multiple methods)

**LinkedIn Enrichment:**
- `enrich_linkedin_apify.py` - LinkedIn data via Apify actors
- `enrich_linkedin_free.py` - Free LinkedIn profile search

**Decision Makers:**
- `find_decision_makers.py` - Identify key decision makers

### Orchestration Scripts

- `run_overnight_enrichment.py` - Long-running overnight enrichment pipeline
- `run_orchestration_pipeline.py` - Main orchestration pipeline

## Process Flow

1. **Discovery Phase**
   - Run discovery scripts to generate initial lead list.
   - Leads are saved to `.tmp/new_leads_*.csv`.
   - These are merged into the master CSV automatically by the pipeline.

2. **Enrichment Phase**
   - Leads are prioritized by score (AI targeting).
   - The system enriches emails, phones, and LinkedIn profiles.
   - It finds decision makers for high-priority leads.

3. **Scoring Phase**
   - Lead scores are calculated based on data completeness and quality.
   - Confidence scores are updated.

4. **Validation**
   - Check enrichment status and generate reports.

## Configuration

**Environment Variables** (Required in `.env`):
- `PERPLEXITY_API_KEY`: Perplexity API key
- `APIFY_API_KEY`: Apify API key (for LinkedIn/web scraping)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## Operational Notes

### Rate Limits & Costs
- **Perplexity**: Has rate limits (~50 req/min). Scripts handle this, but be aware of batch sizes.
- **Apify**: Uses credits. Monitor usage.
- **Google Places**: Free tier has limits.

### Data Quality
- **Missing Websites**: Enrichment is harder without a website.
- **Email Validation**: Always check the confidence score.

### Common Issues
- **FileNotFoundError**: Ensure `.tmp/` directory exists.
- **API Authentication**: Check your `.env` file if scripts fail with auth errors.
