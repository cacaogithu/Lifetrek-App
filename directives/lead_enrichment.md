# Lead Enrichment System

## Goal

Discover and enrich company leads with comprehensive data including emails, phone numbers, decision makers, LinkedIn profiles, and company information to create a high-quality sales pipeline.

## Inputs

- **Company Name** (required)
- **Website URL** (optional but recommended)
- **Industry/Vertical** (optional for targeted discovery)
- **Geographic Region** (optional for Google Places discovery)

## Tools/Scripts

### Discovery Scripts (`execution/lead-enrichment/`)

- `discover_leads_perplexity.py` - Discover new leads using Perplexity API
- `generate_leads_places.py` - Generate leads from Google Places API
- `bulk_scrape_leads.py` - Bulk scrape leads from various sources
- `scrape_leads_advanced.py` - Advanced lead scraping with parameter tracking

### Enrichment Scripts

**Email Enrichment:**
- `enrich_emails_advanced_free.py` - Free email discovery methods
- `enrich_emails_anymailfinder.py` - AnyMailFinder API integration
- `enrich_emails_deep.py` - Deep email search (multiple methods)
- `enrich_emails_free.py` - Basic free email enrichment
- `enrich_missing_emails.py` - Fill missing emails in existing data

**LinkedIn Enrichment:**
- `enrich_linkedin_apify.py` - LinkedIn data via Apify actors
- `enrich_linkedin_company_guess.py` - Guess LinkedIn company URLs
- `enrich_linkedin_free.py` - Free LinkedIn profile search
- `enrich_linkedin_mass.py` - Mass LinkedIn enrichment
- `enrich_linkedin_perplexity.py` - LinkedIn search via Perplexity

**Phone Enrichment:**
- `enrich_phones_free.py` - Free phone number search
- `enrich_phones_google.py` - Phone numbers from Google search

**Decision Makers:**
- `find_decision_makers.py` - Identify key decision makers
- `enrich_people_linkedin_bulk.py` - Bulk person profile enrichment
- `enrich_people_linkedin_slow_loop.py` - Slow rate-limited LinkedIn person search

**General Enrichment:**
- `enrich_apify.py` - General Apify enrichment workflows
- `enrich_cheerio.py` - Web scraping with Cheerio
- `enrich_perplexity.py` - General Perplexity-based enrichment
- `enrich_smart_ai.py` - AI-powered enrichment targeting high-priority leads
- `enrich_team_deep.py` - Deep team member discovery

### Orchestration Scripts

- `run_overnight_enrichment.py` - Long-running overnight enrichment pipeline
- `run_orchestration_pipeline.py` - Main orchestration pipeline
- `run_full_enrichment.py` - Full enrichment workflow
- `run_free_enrichment_full.py` - Free-only enrichment methods
- `fast_enrichment_all.py` - Fast enrichment for quick results

## Outputs

**File Location:** `.tmp/MASTER_ENRICHED_LEADS.csv`

**Columns:**
- `Company_Name` - Company name
- `Website` - Company website URL
- `Email` - Primary contact email
- `Phone` - Primary phone number
- `Decision_Maker` - Key decision maker name
- `Decision_Makers_Deep` - JSON array of multiple decision makers
- `LinkedIn_Company` - Company LinkedIn URL
- `LinkedIn_Person` - Person LinkedIn URL
- `Industry` - Industry/vertical
- `Lead_Score` - Numeric score (0-15+)
- `Confidence_Score` - Data quality confidence
- Various enrichment status flags

## Environment Variables

Required in `.env`:
- `PERPLEXITY_API_KEY` - Perplexity API key
- `APIFY_API_KEY` - Apify API key (for LinkedIn/web scraping)
- `ANYMAILFINDER_API_KEY` - AnyMailFinder API key (optional)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Process Flow

1. **Discovery Phase**
   - Run discovery scripts to generate initial lead list
   - Save to `.tmp/new_leads_*.csv`
   - Merge new leads into master CSV

2. **Enrichment Phase**
   - Prioritize leads by score (AI targeting)
   - Enrich emails, phones, LinkedIn profiles
   - Find decision makers
   - Update master CSV incrementally

3. **Scoring Phase** (see `data_processing.md`)
   - Calculate lead scores
   - Update confidence scores
   - Segment leads by quality

4. **Validation**
   - Check enrichment status
   - Validate data quality
   - Generate reports

## Edge Cases & Learnings

### API Rate Limits

**Perplexity:**
- Rate limit: ~50 requests/minute
- Solution: Use `slow` variants of scripts for sustained runs
- Batch requests when possible

**Apify:**
- Credits-based (not time-based)
- Monitor credit consumption
- Use proxies to avoid IP bans

**Google Places:**
- Free tier: 40,000 requests/month
- Use caching for repeated queries
- Track query history in `.tmp/scraped_queries_history.json`

### Data Quality Issues

**Missing Websites:**
- If no website URL, LinkedIn enrichment is less effective
- Use Google search to find website first
- Perplexity can help discover website URLs

**Email Validation:**
- Free email patterns may be incorrect (name@company.com format)
- Always mark confidence level
- Verify emails when possible

**LinkedIn URL Guessing:**
- Company name → LinkedIn URL pattern usually works
- Handle edge cases: special characters, multi-word names
- Verify guessed URLs when possible

### Performance Optimization

**Parallelization:**
- Use `enrich_smart_ai_parallel.py` for concurrent API calls
- Limit concurrent requests to avoid rate limits
- Monitor API error rates

**Incremental Processing:**
- Save progress frequently to `.tmp/`
- Use delta CSVs for merging results
- Never reprocess already-enriched leads

**Cost Management:**
- Use free methods first (Google search, website scraping)
- Reserve paid APIs (Perplexity, Apify) for high-priority leads
- Track `Lead_Score` to prioritize spending

### Common Errors

**FileNotFoundError:**
- Ensure `.tmp/` directory exists
- Check if master CSV is initialized
- Scripts now use `../../.tmp/` relative path

**API Authentication:**
- Verify `.env` file exists in project root
- Check API keys are valid and not expired
- Ensure sufficient API credits/quota

**Data Merge Conflicts:**
- Always use merge scripts in `data-processing/`
- Never manually edit CSV files while scripts running
- Use `create_master_csv.py` to rebuild from deltas

## Maintenance Notes

**Weekly:**
- Check API credit balances
- Review enrichment success rates
- Update `.tmp/` file retention policy

**Monthly:**
- Update scraping patterns if websites change
- Review and update Lead_Score calculation
- Archive old delta CSVs

**When APIs Change:**
- Update corresponding enrichment script
- Test with sample data first
- Document changes in this directive
- Update error handling patterns
