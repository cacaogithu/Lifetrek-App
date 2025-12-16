
import requests
import json
import os
import sys

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:54321/functions/v1/generate-linkedin-carousel")
# You might need a valid JWT if you enabled Row Level Security or function protection
# For local dev with --no-verify-jwt, we might not need it, or we use the anon key.
ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "your-anon-key-here")

def test_generate_carousel():
    print(f"Testing API at: {API_URL}")
    
    payload = {
        "topic": "Integration Testing",
        "targetAudience": "Software Engineers",
        "painPoint": "Manual testing is slow",
        "desiredOutcome": "Automated pipelines",
        "proofPoints": "Reduced bugs by 50%",
        "ctaAction": "Try our tool",
        "format": "carousel",
        "wantImages": False, # Disable images for speed/cost in E2E
        "numberOfCarousels": 1
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ANON_KEY}"
    }

    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code != 200:
            print("Error Response:", response.text)
            sys.exit(1)

        data = response.json()
        print("Response JSON keys:", data.keys())

        # Validate Schema
        if "carousel" in data:
            carousel = data["carousel"]
            assert "topic" in carousel
            assert "slides" in carousel
            assert len(carousel["slides"]) > 0
            print("✅ Single Carousel structure valid")
            print(f"Title: {carousel['topic']}")
            print(f"Slides: {len(carousel['slides'])}")
        elif "carousels" in data:
            carousels = data["carousels"]
            assert isinstance(carousels, list)
            print("✅ Batch Carousel structure valid")
        else:
            print("❌ Invalid response structure")
            sys.exit(1)

    except Exception as e:
        print(f"❌ Test Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_generate_carousel()
