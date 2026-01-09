#!/bin/bash

# Migration Helper Script for Lifetrek
# This script guides you through linking your project and pushing the schema.

echo "🚀 Starting Migration Helper..."

# Check for Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: 'supabase' command not found."
    echo "Please install the Supabase CLI first:"
    echo "  brew install supabase/tap/supabase"
    echo "  OR via npm: npm install -g supabase"
    exit 1
fi

# Load .env variables (Simplified)
# We skip exporting to shell to avoid parsing errors with comments
if [ ! -f .env ]; then
    echo "⚠️ .env file not found!"
fi

echo "👉 TIP: If you get a 'permissions' error, run: supabase login"

echo "🔗 Linking to Supabase Project..."
# Using provided Project ID automatically
REF_ID="dlflpvmdzkeouhgqwqba"
echo "Project ID: $REF_ID"

if [ -n "$REF_ID" ]; then
    # Link command
    echo "Checking if already linked..."
    supabase link --project-ref "$REF_ID"
else
    echo "❌ No Project ID configured."
    exit 1
fi

echo "⬆️ Pushing Database Migrations..."
supabase db push

echo "✅ Migration commands completed."
echo "⚠️ Important: Your Edge Functions are ready to deploy!"
echo "Run: supabase functions deploy"
