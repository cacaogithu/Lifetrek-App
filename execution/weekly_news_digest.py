"""
Weekly News Digest Generator
----------------------------
Fetches top customer interests from blog analytics and searches Perplexity API
for relevant industry news. Saves results to Supabase for the content team.

Usage:
    python execution/weekly_news_digest.py
"""

import os
import sys
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

# Constants
DEFAULT_INTERESTS = [
    "Fabricação de dispositivos médicos",
    "Regulamentação ANVISA", 
    "Implantes ortopédicos", 
    "Usinagem CNC médica",
    "ISO 13485"
]

def fetch_customer_interests():
    """Get top keywords from high-engagement blog posts via Supabase RPC"""
    print("🔍 Fetching customer interests...")
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/rpc/get_top_customer_interests"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, headers=headers, json={"limit_count": 5}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                interests = [item['keyword'] for item in data]
                print(f"✅ Found {len(interests)} customer interests: {', '.join(interests)}")
                return interests
            else:
                print("⚠️ No analytics data yet, using default interests.")
                return DEFAULT_INTERESTS
        else:
            print(f"⚠️ API Error fetching interests: {response.status_code}. Using defaults.")
            return DEFAULT_INTERESTS
            
    except Exception as e:
        print(f"⚠️ Error fetching interests: {str(e)}. Using defaults.")
        return DEFAULT_INTERESTS

def search_perplexity_news(keywords):
    """Search for relevant news using Perplexity API"""
    if not PERPLEXITY_API_KEY:
        print("❌ Error: PERPLEXITY_API_KEY not found.")
        sys.exit(1)
        
    print(f"🤖 Searching Perplexity for news on: {', '.join(keywords)}...")
    
    try:
        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = f"""
        Find the latest and most relevant news (last 7 days) related to:
        {chr(10).join([f'- {kw}' for kw in keywords])}
        
        Focus on:
        - Brazilian medical device market (ANVISA, industry trends)
        - Global innovations in orthopedic/dental implants
        - Manufacturing technologies (CNC, 3D printing for medical)
        - Regulatory updates affecting manufacturers
        
        Format the response as a structured digest with:
        1. Headline
        2. Brief summary (2-3 sentences)
        3. Relevance to a contract manufacturer like Lifetrek Medical
        4. Source URL
        
        Prioritize news that would interest Medical Device OEMs (B2B).
        """
        
        payload = {
            "model": "sonar",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a medical industry research assistant. Find factual, recent news."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "search_recency_filter": "week"
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            content = data['choices'][0]['message']['content']
            citations = data.get('citations', [])
            print(f"✅ Perplexity search complete. Found {len(citations)} sources.")
            return content, citations
        else:
            print(f"❌ Perplexity API Error: {response.status_code} - {response.text}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Perplexity Request Failed: {str(e)}")
        sys.exit(1)

def save_news_digest(content, sources, interests):
    """Save the digest to Supabase"""
    print("💾 Saving digest to database...")
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/news_digest"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        payload = {
            "content": content,
            "sources": sources,
            "customer_interests": interests,
            "search_query": f"News related to: {', '.join(interests)}",
            "generated_at": datetime.now().isoformat()
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Success! Digest saved with ID: {data[0]['id']}")
            return True
        else:
            print(f"❌ Database Save Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Database Request Failed: {str(e)}")
        return False

def notify_team(content):
    """
    Optional: Send notification (Placeholder for now).
    In a real scenario, this could trigger an email via Resend or a Slack webhook.
    """
    print("\n📧 (Simulation) Sending notification to sales@lifetrek-medical.com...")
    print("Subject: 📰 Weekly Industry News Digest")
    print("Digest ready for review in Admin Dashboard.")

def main():
    print("=== Weekly News Digest Generator ===")
    
    # 1. Get interests
    interests = fetch_customer_interests()
    
    # 2. Search news
    content, sources = search_perplexity_news(interests)
    
    # 3. Save to DB
    if save_news_digest(content, sources, interests):
        # 4. Notify
        notify_team(content)
        print("\n=== Workflow Completed Successfully ===")
    else:
        print("\n=== Workflow Failed at Save Step ===")
        sys.exit(1)

if __name__ == "__main__":
    main()
