#!/bin/bash

# 🔐 Script untuk Generate Secrets yang Aman
# Usage: bash scripts/generate-secrets.sh

echo "🔐 Generating Secure Secrets..."
echo ""
echo "================================"
echo "JWT_SECRET (32 bytes):"
openssl rand -base64 32
echo ""
echo "================================"
echo "API_SECRET_KEY (32 bytes):"
openssl rand -base64 32
echo ""
echo "================================"
echo "WEB_PUSH_VAPID_KEYS:"
echo "Run: npx web-push generate-vapid-keys"
echo ""
echo "================================"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Copy secrets di atas ke .env.production"
echo "2. JANGAN PERNAH commit .env.production ke Git!"
echo "3. Rotate secrets ini secara berkala (setiap 3-6 bulan)"
echo ""
