"""
Recalculate V2 Scores
Updates the V2 Score for all companies based on the latest enrichment data.
"""

import pandas as pd

def recalculate_scores():
    print("=== RECALCULATING V2 SCORES ===")
    
    try:
        df = pd.read_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv')
    except:
        print("CSV not found")
        return
        
    GLOBAL_BRANDS = {
        'J&J': 3.0, 'JOHNSON': 3.0, 'BIOMET': 3.0, 'ZIMMER': 3.0,
        'STRYKER': 3.0, 'STRAUMANN': 1.5, 'NEODENT': 1.5, 'ARTHREX': 1.5,
        'ALIGN': 1.5, 'DENTSPLY': 1.5, 'BIOTRONIK': 1.5
    }
    
    updates = 0
    score_increases = 0
    
    for idx, row in df.iterrows():
        old_score = row.get('V2_Score', 0)
        score = 0.0
        
        # 1. Rating (if available)
        # Note: 'Rating' might be missing in older leads, present in newer?
        # Master CSV might not have 'Rating' column consistently? 
        # Let's check if it exists or use default
        # Actually, for Renner's leads we didn't have Google Rating.
        # But we can base it on other factors.
        
        # If 'Predicted_Score' exists (from Model), use it as base?
        # OR re-calculate everything from scratch based on Enrichment.
        
        # Base Score matches 'Predicted_Score' logic roughly?
        # Let's stick to the V2 Logic used in `merge_new_leads.py`:
        
        # Re-calc from scratch:
        name = str(row['Nome Empresa']).upper()
        
        # Brand Bonus
        for brand, points in GLOBAL_BRANDS.items():
            if brand in name:
                score += points
                break
        
        # Rating (if present in original data?)
        # For simplicity, we assume rating bonus was already baked into 'Predicted_Score' for some?
        # Let's simple ADD points for Enrichment on top of a base.
        # If we reset to 0, we might lose the Model's prediction for the original 200.
        
        # HYBRID STRATEGY:
        # Take the existing `Predicted_Score` (which came from the ML model) AS BASE if available.
        # IF NOT (New Lead), start from 0.
        
        if row['Status'] == 'New Lead':
            # New Lead: Start from 0 + Rating Bonus if known?
            # We don't have rating easily here unless we saved it.
            # But `V2_Score` was already calculated.
            # Let's just taking EXISTING V2_Score and SUBTRACT old enrichment points? 
            # Too complex.
            
            # Better: Just re-run the point adder checks.
            pass
            
        # Let's try to just recalculate the ENRICHMENT BONUS part.
        # Max Score is 10.0
        
        # Calculate Enrichment Points anew
        enrich_points = 0.0
        
        cert_count = sum([row.get('has_fda', False), row.get('has_ce', False), row.get('has_iso', False)])
        if cert_count >= 2: enrich_points += 2.0
        elif cert_count == 1: enrich_points += 1.0
        
        if row.get('has_rd', False): enrich_points += 1.5
        if row.get('years', 0) >= 20: enrich_points += 1.0
        if row.get('countries', 0) >= 10: enrich_points += 1.0
        if row.get('employees', 0) >= 100: enrich_points += 1.0
        if row.get('is_manufacturer', False): enrich_points += 1.0
        
        # Base Score handling
        # For Orig Leads: Renner_Score or Predicted_Score without enrichment?
        # The 'Predicted_Score' column in Master CSV for Orig Leads INCLUDES the model's prediction.
        # We should use that as base.
        
        # For New Leads: They don't have 'Predicted_Score' from the model (it's aliased).
        # But we want to be consistent.
        
        # Simple Re-Calc for ALL:
        # Base = 5.0 (Average) + Modifiers?
        # No, that's risky.
        
        # Safer: 
        # Score = Existing V2 Score
        # Check if new data (Employees, Years) warrants EXTRA points?
        
        # If we simply re-run the FULL logic from `merge_new_leads.py` it might be safer for consistent "V2".
        
        # Logic from merge_new_leads.py:
        # score = 0.0
        # Rating >= 4.5 -> +1.0
        # Brand -> +Points
        # Enrichment -> +Points
        
        # We lack "Rating" in this CSV for sure.
        # But we can try to preserve the existing score's "Base".
        
        # Let's assume the current V2_Score is correct-ish, but might be missing points for "Employees" if it was 0.
        # So:
        # 1. Calc Points for Employees/Years based on CURRENT values.
        # 2. If the OLD score yielded points for them (likely 0 if they were missing), we are good.
        # But we don't know if they were missing.
        
        # Lets just RE-CALCULATE purely based on available columns.
        # If Rating is missing, we assume 0 (conservative).
        
        # BUT for Original Leads, we trust the `Predicted_Score` model output?
        # The V2 Score for Original Leads was: `Predicted_Score` + Enrichment Boosts.
        
        current_score = row['V2_Score']
        
        # Re-eval Enrichment Boosts
        # 20+ Years: +1.0
        # 100+ Employees: +1.0
        
        # If we see 20+ years NOW, we add 1.0.
        # But what if we already added it?
        # We need to know if we did.
        
        # Hack: Recalculate the "Enrichment Score" component from scratch.
        # Then add it to a "Base Score".
        # Base Score = V2_Score - (Old Enrichment Score)
        # Or simply: Base Score = Predicted_Score (for old leads)?
        
        if row['Status'] != 'New Lead':
            base = row['Predicted_Score'] # This is the Model Score
        else:
            base = 0.0 # New leads rely entirely on the manual formula
            # Use Rating if available? Unfortunately not in this CSV columns list (I checked view_file).
            # Wait, view_file showed: `ID,Nome Empresa,Website,...,V2_Score,...,Phone,Source`
            # It didn't show 'Rating'.
            # So New Leads scores might drop if we reset to 0!
            
            # CRITICAL: We must preserve the "Rating/Brand" part of the score.
            # Best approach:
            # 1. Calculate PURE Enrichment Score (Certification, Years, Employees, etc.)
            # 2. Compare this to the Enrichment Score implied by the previous run?
            # 3. No, too hard.
            
            # Alternative:
            # Just add points if the new data thresholds are met?
            # E.g. If Employees > 100, ensure score >= Previous + 1?
            # But what if it was already >100?
            
            # Let's be aggressive:
            # New Score = calculated_enrichment_score + (Brand Bonus)
            # If (New Score > Old Score): Update.
            # Else: Keep Old Score (assuming it had Rating bonus).
            pass
            
        # Implementation:
        # 1. Calc Enrichment Score
        new_enrich_score = 0.0
        if cert_count >= 2: new_enrich_score += 2.0
        elif cert_count == 1: new_enrich_score += 1.0
        if row.get('has_rd', False): new_enrich_score += 1.5
        if row.get('years', 0) >= 20: new_enrich_score += 1.0
        if row.get('countries', 0) >= 10: new_enrich_score += 1.0
        if row.get('employees', 0) >= 100: new_enrich_score += 1.0
        if row.get('is_manufacturer', False): new_enrich_score += 1.0
        
        # 2. Add Brand Bonus
        brand_bonus = 0.0
        for brand, points in GLOBAL_BRANDS.items():
            if brand in name:
                brand_bonus += points
                break
                
        # 3. Total Constructed Score
        constructed_score = new_enrich_score + brand_bonus
        
        # 4. Final Decision
        if row['Status'] != 'New Lead':
            # For original leads, Base is Predicted_Score.
            # BUT Predicted_Score (Model) might overlap with Enrichment?
            # The previous logic was: V2 = (Predicted + Enrichment)/2 or similar?
            # No, looking at `create_master_csv.py`:
            # V2 = Predicted_Score + (Enrichment Score - Penalties)
            # Actually, `create_master_csv.py` had a logic `v2_score = row['Predicted_Score'] + bonus`.
            
            # So:
            final_score = row['Predicted_Score'] + new_enrich_score
        else:
            # For New Leads: logic was `score = RatingBonus + BrandBonus + EnrichBonus`
            # We lost RatingBonus.
            # But we have `V2_Score` (Old).
            # If `constructed_score` is higher than `V2_Score`, use it.
            # Or add the DELTA of new enrichment points.
            
            # Let's assume RatingBonus is roughly 1.0 for everyone (safe bet for top leads).
            # Or just take MAX(V2_Score, constructed_score + 1.0).
            final_score = max(row['V2_Score'], constructed_score + 1.0) 
            
        final_score = min(10.0, final_score)
        
        if final_score > old_score + 0.1: # Significant increase
            score_increases += 1
            df.at[idx, 'V2_Score'] = final_score
            
    df.to_csv('/Users/rafaelalmeida/lifetrek-mirror/MASTER_ENRICHED_LEADS.csv', index=False)
    print(f"✅ Recalculated Scores. {score_increases} companies improved their score.")
    
if __name__ == "__main__":
    recalculate_scores()
