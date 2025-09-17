#!/bin/bash

# Script to generate secure secrets for production environment
# Usage: ./scripts/generate-secrets.sh

echo "🔐 Generating secure secrets for StyleMatch production environment..."

# Generate strong passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
AI_API_KEY=$(openssl rand -hex 32)

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 64)

echo ""
echo "Generated secrets (copy these to your .env.production file):"
echo "============================================================"
echo ""
echo "# Database"
echo "DATABASE_PASSWORD=$DB_PASSWORD"
echo ""
echo "# Authentication"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo ""
echo "# AI Service"
echo "AI_SERVICE_API_KEY=$AI_API_KEY"
echo ""
echo "# Session"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""
echo "⚠️  IMPORTANT: Save these secrets in a secure password manager!"
echo "⚠️  Never commit these values to version control!"
echo ""

# Create .gitignore entries
echo "Updating .gitignore..."
cat >> .gitignore << EOF

# Production environment files
.env.production
.env.production.local
*.pem
*.key
*.crt

# Backup files
*.backup
*.bak

# Log files
logs/
*.log

# Generated files
/tmp
/temp
EOF

echo "✅ Secrets generated successfully!"
echo "📝 Next steps:"
echo "   1. Copy .env.production.example to .env.production"
echo "   2. Replace placeholder values with generated secrets"
echo "   3. Store secrets in a secure password manager"
echo "   4. Never commit .env.production to git"