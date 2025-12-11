#!/usr/bin/env python3
"""Recalculate Lead_Score using free heuristic rules.

Rules (all additive, max score 10):
1. Email present: +3
2. Decision maker present: +2
3. FDA or CE certified: +2
4. Employees > 50: +1
5. Lead already had a non‑zero V2_Score: keep original (scaled to max 2)

The script reads MASTER_ENRICHED_LEADS.csv, applies the rules, writes the
updated CSV back, and prints a summary.
"""

import os
import pandas as pd

INPUT_FILE = "/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv"

def compute_score(row):
    score = 0.0
    # 1. Email
    email = row.get('Email') or row.get('Scraped_Emails')
    if isinstance(email, str) and email.strip():
        score += 3.0
    # 2. Decision maker
    dm = row.get('Decision_Maker') or row.get('Decision_Makers')
    if isinstance(dm, str) and dm.strip():
        score += 2.0
    # 3. Certifications
    if row.get('FDA_Certified') in [True, 'True', 'true', 1]:
        score += 2.0
    if row.get('CE_Certified') in [True, 'True', 'true', 1]:
        score += 2.0
    # 4. Employees count
    try:
        emp = int(row.get('employees') or row.get('Employees') or 0)
        if emp > 50:
            score += 1.0
    except Exception:
        pass
    # 5. Preserve existing V2_Score (scaled to max 2)
    try:
        old = float(row.get('V2_Score') or 0)
        if old > 0:
            # scale proportionally to max 2 points
            score += min(old / 5.0, 2.0)  # assuming original max ~10
    except Exception:
        pass
    # Cap at 10
    return min(score, 10.0)

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"[ERROR] File not found: {INPUT_FILE}")
        return
    df = pd.read_csv(INPUT_FILE)
    df['Lead_Score'] = df.apply(compute_score, axis=1)
    df.to_csv(INPUT_FILE, index=False)
    print(f"✅ Recalculated Lead_Score for {len(df)} leads. Score range: {df['Lead_Score'].min()} - {df['Lead_Score'].max()}")

if __name__ == "__main__":
    main()
