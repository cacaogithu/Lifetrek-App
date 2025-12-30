#!/usr/bin/env python3
"""Enrich missing email addresses using the free email scraper.

This script reads MASTER_ENRICHED_LEADS.csv, identifies rows where the
`Email` column is empty or NaN, and runs `enrich_emails_advanced_free.py`
which scans the company website for contact pages and extracts email
addresses. The free scraper is idempotent – it will update only missing
emails, leaving existing ones untouched.
"""

import os
import subprocess
import pandas as pd

INPUT_FILE = "/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv"

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"[ERROR] Input file not found: {INPUT_FILE}")
        return

    df = pd.read_csv(INPUT_FILE)
    missing = df[ df['Email'].isna() | (df['Email'].astype(str).str.strip() == "") ]
    if missing.empty:
        print("✅ No missing emails – nothing to do.")
        return

    print(f"🔎 Found {len(missing)} leads without email. Running free email enrichment...")
    # The free email script works on the whole CSV but only adds missing emails.
    # Running it again is safe and cheap.
    try:
        subprocess.run(["python3", "enrich_emails_advanced_free.py"], check=True)
        print("✅ Email enrichment completed.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Email enrichment failed: {e}")

if __name__ == "__main__":
    main()
