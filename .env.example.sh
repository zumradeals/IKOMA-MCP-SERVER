# IKOMA MCP Configuration

# Server mode: mcp | http | hybrid
SERVER_MODE=hybrid

# MCP Server (stdio)
MCP_ENABLED=true

# HTTP Server (optional)
HTTP_ENABLED=true
HTTP_PORT=3000

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ikoma
POSTGRES_USER=ikoma
POSTGRES_PASSWORD=change_me_in_production

# Security
# Generate with: echo -n "your-secret-key" | sha256sum
API_KEY_HASH=5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

# Paths
APPS_ROOT=/srv/apps
AUDIT_LOG=/var/log/ikoma/audit.jsonl

# Docker
DOCKER_SOCKET=/var/run/docker.sock

# Rate limiting (HTTP only)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100