#!/bin/bash

# Repo URL provided by you
REPO_URL="https://github.com/cacaogithu/lifetrek-mirror.git"
TEMP_DIR="temp_recovery_functions"

echo "🚀 Starting Recovery of Missing Functions..."

# 1. Clone the repo to a temporary folder
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

echo "Cloning $REPO_URL..."
git clone "$REPO_URL" "$TEMP_DIR"

if [ ! -d "$TEMP_DIR" ]; then
    echo "❌ Failed to clone repository. Please check your internet connection or URL."
    exit 1
fi

# 2. List of functions to recover
FUNCTIONS=("generate-blog-post" "sales-engineer-agent" "send-weekly-report")

# 3. Copy them if they exist
for func in "${FUNCTIONS[@]}"; do
    SRC="$TEMP_DIR/supabase/functions/$func"
    DEST="supabase/functions/$func"

    if [ -d "$SRC" ]; then
        echo "✅ Found $func. Restoring..."
        cp -R "$SRC" "supabase/functions/"
    else
        echo "⚠️  Could not find $func in the remote repository."
    fi
done

# 4. Clean up
rm -rf "$TEMP_DIR"

echo "🎉 Recovery Attempt Complete."
echo "If restored, run 'supabase functions deploy' to push them."
