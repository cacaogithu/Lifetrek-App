
import os
import json
import urllib.request
import urllib.parse
import sys
import time

# Load env variables
env_vars = {}
try:
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                env_vars[key] = val.strip('"').strip("'")
except Exception:
    pass

SUPABASE_URL = env_vars.get('SUPABASE_URL')
SUPABASE_KEY = env_vars.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing credentials")
    sys.exit(1)

FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/generate-linkedin-carousel"

def regenerate_designs():
    print("🎨 Starting Design Regeneration...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # 1. Fetch unapproved carousels that correspond to the 'draft' or 'new' status, or just all non-approved
    # We filter client-side to be safe with status logic
    url_get = f"{SUPABASE_URL}/rest/v1/linkedin_carousels?select=*&order=created_at.desc"
    
    try:
        req = urllib.request.Request(url_get, headers=headers)
        with urllib.request.urlopen(req) as response:
            carousels = json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching carousels: {e}")
        return

    to_process = [c for c in carousels if c.get('status') not in ['approved', 'published']]
    print(f"Found {len(to_process)} carousels to regenerate.")
    
    for c in to_process:
        print(f"Processing ID: {c['id']} - {c.get('topic')}")
        
        # Prepare payload for image-only regeneration
        payload = {
            "action": "regenerate_images",
            "topic": c.get('topic'),
            "profileType": c.get('profile_type', 'company'),
            "existingSlides": c.get('slides'),
            "format": c.get('format', 'carousel'),
            "targetAudience": c.get('target_audience'), # Needed for context logging if any
            "painPoint": c.get('pain_point'),
            "ctaAction": c.get('cta_action')
        }
        
        try:
            # Call Edge Function
            req_fn = urllib.request.Request(FUNCTION_URL, data=json.dumps(payload).encode(), headers=headers)
            with urllib.request.urlopen(req_fn) as resp:
                result = json.loads(resp.read())
                
                if 'error' in result:
                    print(f"  ❌ Error from function: {result['error']}")
                    continue
                
                new_carousel = result.get('carousel', {})
                new_images = new_carousel.get('imageUrls')
                
                if not new_images:
                    print("  ❌ No images returned.")
                    continue
                
                # Update DB
                update_payload = {"image_urls": new_images, "updated_at": "now()"}
                url_update = f"{SUPABASE_URL}/rest/v1/linkedin_carousels?id=eq.{c['id']}"
                
                req_upd = urllib.request.Request(url_update, data=json.dumps(update_payload).encode(), headers=headers, method='PATCH')
                with urllib.request.urlopen(req_upd) as upd_resp:
                    print(f"  ✅ Updated images (Count: {len(new_images)})")
                    
        except Exception as e:
            print(f"  ❌ Failed: {e}")
        
        # Be nice to rate limits
        time.sleep(2)

if __name__ == "__main__":
    regenerate_designs()
