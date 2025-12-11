#!/usr/bin/env python3
"""
Full Free Enrichment Pipeline
Runs all free enrichment methods in optimal order
"""

import subprocess
import time

def run_script(script_name, description):
    """Run a script and report results"""
    print(f"\n{'='*60}")
    print(f"🚀 {description}")
    print(f"{'='*60}\n")
    
    start = time.time()
    
    try:
        result = subprocess.run(['python3', script_name], check=True, capture_output=True, text=True)
        print(result.stdout)
        
        elapsed = time.time() - start
        print(f"\n✅ Completed in {elapsed:.1f}s")
        return True
    
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        print(e.stdout)
        print(e.stderr)
        return False

def main():
    print("="*60)
    print("  FULL FREE ENRICHMENT PIPELINE")
    print("  Target: 600-700 fully enriched leads")
    print("="*60)
    
    # Phase 1: Deep Email Discovery
    run_script('enrich_emails_deep.py', 'Phase 1: Deep Email Discovery (58% → 70%)')
    
    # Phase 2: LinkedIn via Perplexity + Google
    run_script('enrich_linkedin_perplexity.py', 'Phase 2: LinkedIn Discovery (Perplexity + Google)')
    
    # Phase 3: Advanced Scoring
    run_script('score_leads_advanced.py', 'Phase 3: Advanced Scoring (15-point system)')
    
    # Phase 4: Segmentation
    run_script('segment_leads.py', 'Phase 4: Generate Sales Lists')
    
    print("\n" + "="*60)
    print("  ✅ PIPELINE COMPLETE!")
    print("="*60)
    print("\nCheck results in:")
    print("  - MASTER_ENRICHED_LEADS.csv")
    print("  - ~/Desktop/Sales_Ready_Lists/")

if __name__ == "__main__":
    main()
