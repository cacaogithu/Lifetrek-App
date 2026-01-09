
import os
import json
import requests
from datetime import datetime

# Load env manually to avoid dependency issues
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
    exit(1)

def analyze_content():
    print("🔍 Starting Content Analysis (Python)...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Fetch carousels via REST API
    url = f"{SUPABASE_URL}/rest/v1/linkedin_carousels?select=*&order=created_at.asc"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        carousels = response.json()
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    print(f"📊 Found {len(carousels)} carousels.")

    report = {
        "total": len(carousels),
        "by_status": {},
        "by_profile": {},
        "data_quality_issues": [],
        "first_post_analysis": None
    }

    for index, c in enumerate(carousels):
        # Status
        status = c.get('status', 'unknown')
        report['by_status'][status] = report['by_status'].get(status, 0) + 1
        
        # Profile
        profile = c.get('profile_type', 'unknown')
        report['by_profile'][profile] = report['by_profile'].get(profile, 0) + 1
        
        # Quality
        slides = c.get('slides')
        images = c.get('image_urls')
        
        if not slides or (isinstance(slides, list) and len(slides) == 0):
            report['data_quality_issues'].append(f"ID {c.get('id')}: Missing slides")
            
        if not images or (isinstance(images, list) and len(images) == 0):
            report['data_quality_issues'].append(f"ID {c.get('id')}: Missing image_urls")
            
        # First Post Analysis
        if index == 0:
            caption = c.get('caption', '')
            report['first_post_analysis'] = {
                "id": c.get('id'),
                "topic": c.get('topic'),
                "created_at": c.get('created_at'),
                "slides_count": len(slides) if isinstance(slides, list) else 0,
                "image_count": len(images) if isinstance(images, list) else 0,
                "caption_preview": (caption[:100] + '...') if caption else 'N/A',
                "raw_data": c
            }

    # Output Report
    execution_dir = os.path.join(os.getcwd(), 'execution')
    if not os.path.exists(execution_dir):
        os.makedirs(execution_dir)
        
    report_path = os.path.join(execution_dir, 'CONTENT_AUDIT.md')
    
    md_content = f"""# Content Audit Report

**Date:** {datetime.now().isoformat()}
**Total Records:** {report['total']}

## 📊 Distribution
### By Status
```json
{json.dumps(report['by_status'], indent=2)}
```

### By Profile Type
```json
{json.dumps(report['by_profile'], indent=2)}
```

## 🚨 Data Quality Issues
{chr(10).join(['- ' + i for i in report['data_quality_issues']]) if report['data_quality_issues'] else "No major structure issues found."}

## 🔍 First Post Analysis
**ID:** `{report['first_post_analysis']['id'] if report['first_post_analysis'] else 'N/A'}`
**Topic:** {report['first_post_analysis']['topic'] if report['first_post_analysis'] else 'N/A'}
**Created:** {report['first_post_analysis']['created_at'] if report['first_post_analysis'] else 'N/A'}

### Issues Detected (Automated)
- [{'x' if report['first_post_analysis'] and report['first_post_analysis']['image_count'] > 0 else ' '}] Has Images (Count: {report['first_post_analysis']['image_count'] if report['first_post_analysis'] else 0})
- [{'x' if report['first_post_analysis'] and report['first_post_analysis']['slides_count'] > 0 else ' '}] Has Slides (Count: {report['first_post_analysis']['slides_count'] if report['first_post_analysis'] else 0})

### Raw Record (First Post)
```json
{json.dumps(report['first_post_analysis']['raw_data'] if report['first_post_analysis'] else {}, indent=2)}
```
"""

    with open(report_path, 'w') as f:
        f.write(md_content)
    
    print(f"✅ Audit report saved to: {report_path}")

if __name__ == "__main__":
    analyze_content()
