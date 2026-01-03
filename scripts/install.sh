#!/bin/bash

set -e

echo "🚀 IKOMA MCP v2.0 Installation Script"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

# Check Ubuntu version
if ! grep -q "Ubuntu" /etc/os-release; then
  echo "⚠️  Warning: This script is designed for Ubuntu. Other distributions may not work."
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "📦 Installing dependencies..."

# Update package list
apt-get update -qq

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
else
  echo "✅ Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker compose &> /dev/null; then
  echo "Installing Docker Compose..."
  apt-get install -y docker-compose-plugin
else
  echo "✅ Docker Compose already installed"
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "✅ Node.js already installed ($(node --version))"
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p /srv/apps
mkdir -p /var/log/ikoma
mkdir -p /var/backups/ikoma
mkdir -p /opt/ikoma

# Set permissions
chown -R root:root /srv/apps
chmod 755 /srv/apps

# Generate API key if not exists
if [ ! -f /opt/ikoma/.env ]; then
  echo "🔑 Generating configuration..."
  
  # Generate random API key
  API_KEY=$(openssl rand -base64 32)
  API_KEY_HASH=$(echo -n "$API_KEY" | sha256sum | cut -d' ' -f1)
  
  # Generate random PostgreSQL password
  PG_PASSWORD=$(openssl rand -base64 24)
  
  # Create .env file
  cat > /opt/ikoma/.env <<EOF
# IKOMA MCP Configuration
# Generated on $(date)

SERVER_MODE=hybrid
MCP_ENABLED=true
HTTP_ENABLED=true
HTTP_PORT=3000

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=ikoma
POSTGRES_USER=ikoma
POSTGRES_PASSWORD=$PG_PASSWORD

API_KEY_HASH=$API_KEY_HASH
APPS_ROOT=/srv/apps
AUDIT_LOG=/var/log/ikoma/audit.jsonl
DOCKER_SOCKET=/var/run/docker.sock

IKOMA_ROLE=operator

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
EOF

  # Save API key separately
  echo "$API_KEY" > /opt/ikoma/api-key.txt
  chmod 600 /opt/ikoma/api-key.txt
  
  echo "✅ Configuration generated"
  echo "⚠️  IMPORTANT: Your API key has been saved to /opt/ikoma/api-key.txt"
  echo "   Keep this file secure!"
else
  echo "✅ Configuration already exists"
fi

# Check if project files exist
if [ ! -f /opt/ikoma/docker-compose.yml ]; then
  echo "❌ Error: Project files not found in /opt/ikoma"
  echo "Please copy the IKOMA MCP project files to /opt/ikoma first"
  exit 1
fi

# Build and start services
echo "🏗️  Building and starting IKOMA MCP..."
cd /opt/ikoma
docker compose build
docker compose up -d

echo ""
echo "✅ IKOMA MCP v2.0 Installation Complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 API Key: $(cat /opt/ikoma/api-key.txt)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Configuration: /opt/ikoma/.env"
echo "📊 Logs: /var/log/ikoma/audit.jsonl"
echo "🗄️  Backups: /var/backups/ikoma"
echo ""
echo "🌐 HTTP API: http://localhost:3000"
echo "🔌 MCP Server: stdio mode available"
echo ""
echo "Test the installation:"
echo "  curl -H 'X-Api-Key: YOUR_API_KEY' -H 'X-Role: observer' http://localhost:3000/health"
echo ""
echo "View logs:"
echo "  docker compose -f /opt/ikoma/docker-compose.yml logs -f"
echo ""