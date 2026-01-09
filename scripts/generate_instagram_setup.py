
import os
import json
import urllib.request
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

GEMINI_KEY = env_vars.get('GEMINI_API_KEY')
if not GEMINI_KEY:
    print("Missing GEMINI_API_KEY")
    sys.exit(1)

def generate_insta_content():
    print("📸 Generating Instagram Setup Package...")
    
    prompt = """
    Act as an Instagram Strategist for 'Lifetrek Medical' (Precision Medical Manufacturing).
    Create a complete profile setup package.
    
    OUTPUT JSON format:
    {
      "bio": {
        "headline": "Name/Headline (max 30 chars)",
        "body": "Bio text (max 150 chars) with emojis. Highlighting 'Medical Device CMO' and 'Precision'.",
        "link_text": "Link description"
      },
      "posts": [
        {
          "type": "pinned_1_identity",
          "caption": "Caption for 'Who We Are'. Professional, welcoming. Include 30 hashtags.",
          "image_prompt": "Prompt for a clean, modern Introduction image featuring the Lifetrek logo and a welcoming facility shot."
        },
        {
           "type": "pinned_2_capabilities",
           "caption": "Caption for 'What We Do'. bullet points of capabilities (CNC, ISO 13485, etc).",
           "image_prompt": "Prompt for a high-tech collage or split screen of CNC machining, cleanroom packaging, and quality control."
        },
        {
           "type": "pinned_3_trust",
           "caption": "Caption for 'Why Us' or Social Proof. Focus on reliability and partnership.",
           "image_prompt": "Prompt for a 'handshake' or 'partnership' concept visual with medical context, sleek and trustworthy."
        }
      ]
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
            data = json.loads(resp.read())
            text = data['candidates'][0]['content']['parts'][0]['text']
            profile_data = json.loads(text)
            
            # Save to JSON
            with open('execution/instagram_setup/profile_data.json', 'w') as f:
                json.dump(profile_data, f, indent=2)
                
            # Create Markdown Report
            md = f"# 📸 Instagram Setup: Lifetrek Medical\n\n"
            md += f"## 👤 Profile Bio\n"
            md += f"**Headline:** {profile_data['bio']['headline']}\n\n"
            md += f"**Bio:**\n{profile_data['bio']['body']}\n\n"
            md += f"**Link:** {profile_data['bio']['link_text']}\n\n"
            md += f"---\n\n## 📌 Fixed (Pinned) Posts\n\n"
            
            for i, post in enumerate(profile_data['posts']):
                md += f"### {i+1}. {post['type'].replace('_', ' ').title()}\n"
                md += f"**Image Concept:** {post['image_prompt']}\n\n"
                md += f"**Caption:**\n{post['caption']}\n\n"
                md += f"---\n\n"
                
            with open('execution/instagram_setup/STRATEGY.md', 'w') as f:
                f.write(md)
                
            print("✅ Strategic content generated.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_insta_content()
