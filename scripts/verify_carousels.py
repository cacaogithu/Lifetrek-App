#!/usr/bin/env python3
"""
Quick script to verify generated LinkedIn carousels in Supabase
"""

import os
from supabase import create_client, Client
from datetime import datetime

# Supabase credentials
SUPABASE_URL = "https://iijkbhiqcsvtnfernrbs.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpamtiaGlxY3N2dG5mZXJucmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTE2MzUsImV4cCI6MjA3NTkyNzYzNX0.HQJ1vRWwn7YXmWDvb9Pf_JgzeyCDOpXdf2NI-76IUbM"

# Create Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔍 Checking LinkedIn Carousels in Database...")
print("=" * 60)

try:
    # Query carousels table
    response = supabase.table('linkedin_carousels') \
        .select('id, title, created_at, slides') \
        .order('created_at', desc=True) \
        .limit(10) \
        .execute()
    
    if response.data:
        print(f"\n✅ Found {len(response.data)} carousels:\n")
        for idx, carousel in enumerate(response.data, 1):
            created_date = datetime.fromisoformat(carousel['created_at'].replace('Z', '+00:00'))
            num_slides = len(carousel.get('slides', [])) if carousel.get('slides') else 0
            print(f"{idx}. {carousel['title']}")
            print(f"   ID: {carousel['id']}")
            print(f"   Created: {created_date.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"   Slides: {num_slides}")
            print()
    else:
        print("\n⚠️  No carousels found in database")
        print("   This might mean:")
        print("   1. Edge Function isn't saving to database")
        print("   2. Need to check RLS policies")
        print("   3. Wrong table name")
        
except Exception as e:
    print(f"\n❌ Error querying database: {e}")
    print("\nTroubleshooting steps:")
    print("1. Verify table exists: linkedin_carousels")
    print("2. Check RLS policies allow SELECT")
    print("3. Verify API key has correct permissions")

print("=" * 60)
