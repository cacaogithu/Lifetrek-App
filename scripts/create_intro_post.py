
import os
import json
import urllib.request
import urllib.parse
import sys

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
GEMINI_KEY = env_vars.get('GEMINI_API_KEY')

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_KEY]):
    print("Missing credentials")
    sys.exit(1)

def generate_intro():
    print("🚀 Generating Intro Post with Factory Background...")
    
    # 1. Generate Metadata/Caption via Gemini
    prompt = """
    Create a robust LinkedIn single-image post for 'Lifetrek Medical'.
    CONTEXT:
    - We are a Medical Device Contract Manufacturer (CMO).
    - We just acquired a major factory (the image will be the factory exterior).
    - Tone: Professional, authoritative, 'We have arrived', Growth.
    - Audience: Medical Device OEMs, R&D Engineers.
    
    OUTPUT JSON:
    {
      "headline": "Short punchy headline for the image (max 5 words)",
      "body": "Short subtext for the image (max 10 words)",
      "caption": "Engaging LinkedIn caption (100-150 words) announcing the acquisition, our expanded naming, and capacity. Use 3-4 hashtags."
    }
    """
    
    url_ai = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    
    try:
        req = urllib.request.Request(url_ai, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            ai_data = json.loads(resp.read())
            content_text = ai_data['candidates'][0]['content']['parts'][0]['text']
            content = json.loads(content_text)
            print("✅ Text content generated.")
    except Exception as e:
        print(f"Error generating text: {e}")
        return

    # 2. Insert into Supabase
    # We force the image_url to our local/public file
    # Note: In production, this needs to be a real URL. For now, relative path works if frontend supports it.
    image_url = "/factory-intro.webp"
    
    slide_data = [{
        "type": "hook",
        "headline": content['headline'],
        "body": content['body']
    }]
    
    db_payload = {
        "topic": "Strategic Acquisition & Expansion",
        "target_audience": "Medical Device OEMs",
        "pain_point": "Need for scalable, high-quality manufacturing capacity",
        "desired_outcome": "Reliable partnership with massive capacity",
        "proof_points": "ISO 13485, New Facility, Expert Team",
        "cta_action": "Partner with us",
        "status": "draft",
        "format": "single-image",
        "profile_type": "company",
        "slides": slide_data,
        "caption": content['caption'],
        "image_urls": [image_url],
        "generation_settings": {"model": "manual-override", "notes": "Used factory-intro.webp"}
    }
    
    url_db = f"{SUPABASE_URL}/rest/v1/linkedin_carousels"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        req_db = urllib.request.Request(url_db, data=json.dumps(db_payload).encode(), headers=headers)
        with urllib.request.urlopen(req_db) as resp:
            saved_data = json.loads(resp.read())
            print(f"✅ Intro post created! ID: {saved_data[0]['id']}")
    except Exception as e:
        print(f"Error saving to DB: {e}")

if __name__ == "__main__":
    generate_intro()
