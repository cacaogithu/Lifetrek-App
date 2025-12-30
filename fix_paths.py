#!/usr/bin/env python3
"""
Path Fixer for Reorganized Project Structure

This script updates hardcoded CSV/JSON file paths in Python scripts
after reorganization. It changes paths from:
  - "MASTER_ENRICHED_LEADS.csv" 
to:
  - "../.tmp/MASTER_ENRICHED_LEADS.csv"

Usage:
  python fix_paths.py --dry-run   # Preview changes
  python fix_paths.py             # Apply changes
"""

import os
import re
import argparse
from pathlib import Path

# Common CSV/JSON files that should be in .tmp/
TMP_FILES = [
    'MASTER_ENRICHED_LEADS.csv',
    'FINAL_DELIVERABLE.csv',
    'ai_delta.csv',
    'all_enriched_v2.csv',
    'delta_ai.csv',
    'delta_free.csv',
    'delta_linkedin.csv',
    'delta_linkedin_guess.csv',
    'delta_team_fast.csv',
    'free_enrichment_results.csv',
    'leads_enriched_final_v2.csv',
    'linkedin_enrichment_apify.csv',
    'new_leads_advanced.csv',
    'new_leads_google_places.csv',
    'new_leads_perplexity_discovery.csv',
    'apify_enrichment_results.json',
    'cheerio_results.json',
    'cheerio_results_new.json',
    'companies_to_scrape.json',
    'linkedin_enrichment_results.json',
    'linkedin_mass_results.json',
    'linkedin_test_results.json',
    'scoring_insights.json',
    'scraped_parameters.json',
    'scraped_queries_history.json',
    'ultra_fast_results.json',
]


def fix_paths_in_file(filepath, dry_run=True):
    """Fix hardcoded paths in a single Python file."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    # Fix each known temporary file
    for tmp_file in TMP_FILES:
        # Pattern: "filename.csv" or 'filename.csv' (not already with path)
        patterns = [
            (f'"{tmp_file}"', f'"../.tmp/{tmp_file}"'),
            (f"'{tmp_file}'", f"'../.tmp/{tmp_file}'"),
        ]
        
        for old, new in patterns:
            if old in content:
                content = content.replace(old, new)
                changes_made.append(f"  {old} → {new}")
    
    if changes_made:
        if not dry_run:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
        
        return changes_made
    
    return None


def main():
    parser = argparse.ArgumentParser(description='Fix hardcoded paths in Python scripts')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without applying them')
    args = parser.parse_args()
    
    execution_dir = Path(__file__).parent / "execution"
    
    if not execution_dir.exists():
        print(f"❌ Error: {execution_dir} does not exist")
        return
    
    print(f"{'[DRY RUN] ' if args.dry_run else ''}Scanning Python files in {execution_dir}...")
    print()
    
    total_files_updated = 0
    
    for py_file in sorted(execution_dir.glob("*.py")):
        changes = fix_paths_in_file(py_file, dry_run=args.dry_run)
        if changes:
            total_files_updated += 1
            print(f"{'[WOULD UPDATE]' if args.dry_run else '[UPDATED]'} {py_file.name}:")
            for change in changes[:5]:  # Show first 5 changes
                print(change)
            if len(changes) > 5:
                print(f"  ... and {len(changes) - 5} more changes")
            print()
    
    print()
    print(f"{'Would update' if args.dry_run else 'Updated'} {total_files_updated} files")
    
    if args.dry_run and total_files_updated > 0:
        print()
        print("Run without --dry-run to apply changes:")
        print("  python fix_paths.py")


if __name__ == "__main__":
    main()
