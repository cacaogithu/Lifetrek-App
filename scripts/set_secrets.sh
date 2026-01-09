#!/bin/bash

# Load .env variables
if [ -f .env ]; then
    # Filter for specific keys we care about to avoid cluttering secrets with everything
    # or just source it.
    export $(grep -E "^(GEMINI_API_KEY|AUTONOMA_|SUPABASE_|RESEND_API_KEY)" .env | xargs)
fi

echo "🔐 Setting Secrets in Supabase..."

# Construct the secrets string
SECRETS=""

if [ -n "$GEMINI_API_KEY" ]; then
    SECRETS="$SECRETS GEMINI_API_KEY=$GEMINI_API_KEY"
fi
if [ -n "$AUTONOMA_CLIENT_ID" ]; then
    SECRETS="$SECRETS AUTONOMA_CLIENT_ID=$AUTONOMA_CLIENT_ID"
fi
if [ -n "$AUTONOMA_SECRET_ID" ]; then
    SECRETS="$SECRETS AUTONOMA_SECRET_ID=$AUTONOMA_SECRET_ID"
fi
# Add more if needed

if [ -z "$SECRETS" ]; then
    echo "⚠️ No relevant secrets found in .env (GEMINI_API_KEY, AUTONOMA_...)"
else
    # Run command
    supabase secrets set $SECRETS
    echo "✅ Secrets set successfully!"
fi
