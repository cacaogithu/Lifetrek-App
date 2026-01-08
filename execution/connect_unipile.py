import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

UNIPILE_DSN = os.environ.get("UNIPILE_DSN", "http://your-unipile-dsn")
UNIPILE_API_KEY = os.environ.get("UNIPILE_API_KEY", "") # If needed, depending on DSN setup

def get_hosted_auth_link(user_id):
    """
    Generates a Hosted Auth Link for a user to connect their LinkedIn account.
    """
    url = f"{UNIPILE_DSN}/api/v1/hosted/accounts/link"
    
    payload = {
        "type": "create",
        "providers": ["linkedin"], # Limit to LinkedIn only
        "api_url": UNIPILE_DSN,    # The API URL Unipile should use
        "expiresOn": "2030-01-01T00:00:00.000Z", # Long expiration or short, up to you
        "notify_url": "https://your-lifetrek-backend.com/webhook/unipile", # Your Webhook for success
        "name": f"Connect LinkedIn for {user_id}",
        "success_redirect_url": "https://lifetrek.medical.com/admin/settings?success=true",
        "failure_redirect_url": "https://lifetrek.medical.com/admin/settings?error=true"
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": UNIPILE_API_KEY # If using their Cloud API directly
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return data.get("url") # The link you send Vanessa to
        
    except Exception as e:
        print(f"Error generating link: {e}")
        return None

if __name__ == "__main__":
    # Test with a dummy user
    link = get_hosted_auth_link("vanessa_test_123")
    print(f"Send this link to Vanessa: {link}")
