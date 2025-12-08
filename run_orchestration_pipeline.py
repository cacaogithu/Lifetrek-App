import subprocess
import os
import glob
import sys

def run_pipeline():
    print("🚀 STARTING SALES ENRICHMENT PIPELINE 🚀")
    print("=========================================")

    # Step 1: Segmentation
    print("\n[STEP 1] Segmenting Leads...")
    try:
        subprocess.run(["python3", "segment_leads.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during segmentation: {e}")
        sys.exit(1)

    # Step 2: Identify Priority File
    print("\n[STEP 2] Identifying Priority List...")
    output_dir = "/Users/rafaelalmeida/Desktop/Sales_Ready_Lists"
    
    # Look for the file starting with '01_Priority_Leads'
    priority_files = glob.glob(os.path.join(output_dir, "01_Priority_Leads*.csv"))
    
    if not priority_files:
        print("❌ Could not find Priority Leads file in", output_dir)
        sys.exit(1)
        
    # Pick the most recent one if multiple (though likely just one)
    priority_file = max(priority_files, key=os.path.getctime)
    print(f"✅ Found Priority File: {priority_file}")

    # Step 3: Enrich Priority Leads
    print(f"\n[STEP 3] Enriching High-Value Leads with Perplexity...")
    print(f"Target: {priority_file}")
    
    try:
        # Run the enrichment script targeting the priority file
        # We don't set a limit here effectively running on all rows in that file
        subprocess.run(["python3", "enrich_leads_perplexity.py", "--input", priority_file], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during enrichment: {e}")
        sys.exit(1)

    print("\n=========================================")
    print("🎉 PIPELINE COMPLETE 🎉")
    print(f"Enriched data saved to: {priority_file}")

if __name__ == "__main__":
    run_pipeline()
