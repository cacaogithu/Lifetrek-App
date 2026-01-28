
import os
import json
import urllib.request
import urllib.parse
import sys

# Load env
env_vars = {}
try:
    with open('.env', 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value.strip('"').strip("'")
except Exception as e:
    print(f"Error reading .env: {e}")

SUPABASE_URL = env_vars.get('SUPABASE_URL')
SUPABASE_KEY = env_vars.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials")
    sys.exit(1)

def clean_data():
    print("🧹 Starting Data Cleaning...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    } # No Prefer: return=representation needed for delete unless checking return

    # 1. Fetch all to inspect
    url_get = f"{SUPABASE_URL}/rest/v1/linkedin_carousels?select=id,slides,image_urls,topic,status"
    
    ids_to_delete = []
    
    try:
        req = urllib.request.Request(url_get, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
            for row in data:
                should_delete = False
                reason = ""
                
                # Criteria 1: Empty Topic (unless it's a draft that just started? unlikely if auto-gen)
                if not row.get('topic'):
                    should_delete = True
                    reason = "Missing Topic"
                
                # Criteria 2: Empty Slides AND Empty Images (Zombie record)
                slides = row.get('slides')
                images = row.get('image_urls')
                
                has_slides = slides and isinstance(slides, list) and len(slides) > 0
                has_images = images and isinstance(images, list) and len(images) > 0
                
                if not has_slides and not has_images:
                    should_delete = True
                    reason = "Empty Slides & Images"
                    
                # Criteria 3: Duplicate logic could go here, but keeping it simple for safety
                
                if should_delete:
                    print(f"❌ Marking for deletion: ID {row['id']} ({reason})")
                    ids_to_delete.append(row['id'])
                else:
                    print(f"✅ Keeping: ID {row['id']} - {row.get('topic', 'N/A')}")

    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    # 2. Delete in batch
    if not ids_to_delete:
        print("🎉 No records to clean.")
        return

    print(f"🗑 Deleting {len(ids_to_delete)} records...")
    
    # Supabase REST delete: DELETE /table?id=in.(1,2,3)
    # ids need to be comma separated, but UUIDs need checking. 
    # REST syntax: id=in.("uuid1","uuid2")
    
    ids_str = ",".join([f'"{id}"' for id in ids_to_delete])
    url_delete = f"{SUPABASE_URL}/rest/v1/linkedin_carousels?id=in.({ids_str})"
    
    try:
        req_delete = urllib.request.Request(url_delete, headers=headers, method='DELETE')
        with urllib.request.urlopen(req_delete) as response:
             print("Deletion successful.")
    except Exception as e:
        print(f"Error deleting records: {e}")

if __name__ == "__main__":
    clean_data()
