import pandas as pd

def analyze_enrichment(file_path):
    try:
        df = pd.read_csv(file_path)
        total_rows = len(df)
        
        # Define what we consider "Enriched"
        has_email = df['Email'].notna() & (df['Email'] != '')
        has_decision_maker = df['Decision_Maker'].notna() & (df['Decision_Maker'] != '')
        has_linkedin_company = df['LinkedIn_Company'].notna() & (df['LinkedIn_Company'] != '')
        has_linkedin_person = False 
        if 'LinkedIn_Person' in df.columns:
             has_linkedin_person = df['LinkedIn_Person'].notna() & (df['LinkedIn_Person'] != '')
        
        has_website = df['Website'].notna() & (df['Website'] != '')
        
        fully_enriched = has_email & has_decision_maker & has_linkedin_company
        
        print(f"Total Companies: {total_rows}")
        print(f"With Website: {has_website.sum()} ({has_website.sum()/total_rows*100:.1f}%)")
        print(f"With Email: {has_email.sum()} ({has_email.sum()/total_rows*100:.1f}%)")
        print(f"With Decision Maker: {has_decision_maker.sum()} ({has_decision_maker.sum()/total_rows*100:.1f}%)")
        print(f"With LinkedIn Company: {has_linkedin_company.sum()} ({has_linkedin_company.sum()/total_rows*100:.1f}%)")
        if 'LinkedIn_Person' in df.columns:
            print(f"With LinkedIn Person: {has_linkedin_person.sum()} ({has_linkedin_person.sum()/total_rows*100:.1f}%)")
            
        print(f"Fully Enriched (Email + DM + LI Company): {fully_enriched.sum()} ({fully_enriched.sum()/total_rows*100:.1f}%)")
        
        # Validation on "1000 100% enriched"
        print("\n--- Progress to Goal ---")
        print(f"Goal: 1000 Fully Enriched")
        print(f"Current Fully Enriched: {fully_enriched.sum()}")
        print(f"Gap: {1000 - fully_enriched.sum()}")

    except Exception as e:
        print(f"Error analyzing file: {e}")

if __name__ == "__main__":
    analyze_enrichment('../../.tmp/MASTER_ENRICHED_LEADS.csv')
