
import os
import json
import urllib.request
import urllib.parse
from datetime import datetime
import sys

# Setup logging
log_file = os.path.join(os.getcwd(), 'execution', 'debug_python.log')

def log(msg):
    with open(log_file, 'a') as f:
        f.write(f"{datetime.now()}: {msg}\n")
    print(msg)

log("Script started")

# Load env
env_vars = {}
try:
    with open('.env', 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value.strip('"').strip("'")
    log("Env loaded")
except Exception as e:
    log(f"Error reading .env: {e}")

SUPABASE_URL = env_vars.get('SUPABASE_URL')
SUPABASE_KEY = env_vars.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    log("Missing Supabase credentials")
    sys.exit(1)

def analyze_content():
    log("Starting Content Analysis...")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    # Fetch carousels via urllib
    url = f"{SUPABASE_URL}/rest/v1/linkedin_carousels?select=*&order=created_at.asc"
    log(f"Fetching from {url}")
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = response.read()
            carousels = json.loads(data)
            log(f"Fetched {len(carousels)} carousels")
    except Exception as e:
        log(f"Error fetching data: {e}")
        return

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
    # Dir exists checked by previous steps but good to be safe
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
    
    log(f"Audit report saved to: {report_path}")

if __name__ == "__main__":
    analyze_content()
