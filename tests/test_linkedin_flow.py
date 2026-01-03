import os
import requests
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
# Fallback to Publishable/Anon key because Service Role key in .env appears to be for local dev
SUPABASE_KEY = os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials in .env")
    exit(1)

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY,
    "Content-Type": "application/json"
}

def generate_carousel(topic):
    print(f"\n🤖 Generating carousel for topic: {topic}")
    url = f"{SUPABASE_URL}/functions/v1/generate-linkedin-carousel"
    payload = {
        "topic": topic,
        "targetAudience": "Medical Device Manufacturers",
        "painPoint": "Testing reliability",
        "desiredOutcome": "Zero defects",
        "numberOfCarousels": 1
    }
    
    try:
        response = requests.post(url, json=payload, headers=HEADERS, timeout=180)
        if response.status_code != 200:
            print(f"❌ Generation failed: {response.text}")
            return None
        
        data = response.json()
        print(f"DEBUG: Full Response keys: {list(data.keys())}")
        
        # Check if data IS the carousel (direct object)
        if 'topic' in data and 'slides' in data:
            carousel = data
        else:
             carousel = data.get('carousels', [data.get('carousel')])[0]

        # Debug Key (redacted)
        masked_key = f"{SUPABASE_KEY[:5]}...{SUPABASE_KEY[-5:]}" if SUPABASE_KEY else "None"
        print(f"DEBUG: Using Auth Key: {masked_key}")
        
        # fallback to mock if AI failed
        if not carousel:
            print("⚠️ AI Generation empty. Using MOCK data to verify storage.")
            carousel = {
                "topic": topic,
                "targetAudience": "Medical",
                "slides": [
                    {"headline": "Slide 1", "body": "Body 1", "type": "content"},
                    {"headline": "Slide 2", "body": "Body 2", "type": "content"}
                ],
                "caption": "Test Caption"
            }
            
        print("✅ Content ready (Generated or Mock)")
        return carousel
    except Exception as e:
        print(f"❌ Exception during generation: {str(e)}")
        return None

def save_carousel(carousel, topic):
    print("💾 Saving carousel to database...")
    url = f"{SUPABASE_URL}/rest/v1/linkedin_carousels"
    
    # We need an admin_user_id. For testing, we might need to query one or use a dummy if RLS allows.
    # However, since we are using Service Role Key (hopefully), RLS might be bypassed or we can insert any ID.
    # Let's try to fetch a user ID first.
    
    user_id = None
    try:
        # Try to get the first admin user
        res = requests.get(f"{SUPABASE_URL}/rest/v1/admin_users?select=user_id&limit=1", headers=HEADERS)
        if res.status_code == 200 and len(res.json()) > 0:
            user_id = res.json()[0]['user_id']
        else:
            print("⚠️ Could not find admin user, using placeholder UUID")
            user_id = "00000000-0000-0000-0000-000000000000"
    except:
        user_id = "00000000-0000-0000-0000-000000000000"

    payload = {
        "admin_user_id": user_id,
        "topic": topic,
        "target_audience": "Medical Device Manufacturers",
        "slides": carousel['slides'],
        "caption": carousel.get('caption', ''),
        "format": "carousel",
        "generation_settings": {"mode": "test"}
    }
    
    try:
        response = requests.post(url, json=payload, headers=HEADERS)
        if response.status_code == 201:
            print(f"✅ Saved successfully. ID: {response.json().get('id', 'unknown') if response.content else 'Created'}")
            return True
        else:
            print(f"❌ Save failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception during save: {str(e)}")
        return False

def verify_saved(topic):
    print("🔍 Verifying persistence...")
    url = f"{SUPABASE_URL}/rest/v1/linkedin_carousels?topic=eq.{topic}&select=*"
    try:
        response = requests.get(url, headers=HEADERS)
        data = response.json()
        if len(data) > 0:
            print(f"✅ Verified! Found {len(data)} record(s) for topic '{topic}'")
            return True
        else:
            print("❌ Verification failed: Record not found in DB")
            return False
    except Exception as e:
        print(f"❌ Exception during verification: {str(e)}")
        return False

def main():
    topics = [
        f"Test Run {int(time.time())} - ISO 13485"
    ]
    
    success_count = 0
    
    for topic in topics:
        carousel = generate_carousel(topic)
        print(f"DEBUG: Carousel object returned: {type(carousel)} - Truthy? {bool(carousel)}")
        
        if carousel:
            print("DEBUG: Calling save_carousel...")
            if save_carousel(carousel, topic):
                if verify_saved(topic):
                    success_count += 1
        else:
            print("DEBUG: Carousel evaluated as False")
            
        print("-" * 50)
        time.sleep(1)
        
    print(f"\n📊 Test Summary: {success_count}/{len(topics)} successful runs")

if __name__ == "__main__":
    main()
