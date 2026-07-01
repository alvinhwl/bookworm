#!/usr/bin/env bash
# Creates .env.local for Bookworm cloud mode.
# Usage: ./scripts/setup-env.sh

set -euo pipefail

ENV_FILE=".env.local"

echo "Bookworm — Supabase env setup"
echo ""
echo "Get these from Supabase Dashboard → Project Settings → API"
echo ""

read -r -p "Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
read -r -p "anon public key: " SUPABASE_ANON_KEY

cat > "$ENV_FILE" <<EOF
VITE_USE_SUPABASE=true
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
EOF

echo ""
echo "Wrote ${ENV_FILE}"
echo "Run: npm run dev"