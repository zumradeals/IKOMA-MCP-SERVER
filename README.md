# 🏗️ IKOMA MCP v2.0

**Sovereign Model Context Protocol Server for AI-Driven VPS Deployment**

IKOMA MCP is a secure, audited MCP server that enables AI assistants to deploy and manage applications on a VPS without exposing shell access.

## 🎯 Key Features

- **Native MCP Compliance**: Fully conformant to the Model Context Protocol specification
- **Hybrid Transport**: stdio (MCP native) + HTTP REST (optional)
- **Zero Trust Architecture**: No shell access, whitelisted capabilities only
- **Role-Based Access Control**: Observer, Operator, Builder, Admin
- **Comprehensive Audit Trail**: Every action logged with secret redaction
- **Path Confinement**: All operations restricted to `/srv/apps/<app>/`
- **Sovereign PostgreSQL**: No external dependencies
- **Docker Integration**: Managed container orchestration via Docker Compose

## 🏛️ Architecture

```
┌─────────────────┐
│   AI Client     │
│  (MCP stdio)    │
└────────┬────────┘
         │
    ┌────▼────┐
    │  IKOMA  │──────┐
    │   MCP   │      │
    │ Server  │◄─────┤  HTTP API (optional)
    └────┬────┘      │
         │           │
    ┌────▼────────┐  │
    │ Core Logic  │◄─┘
    │ (shared)    │
    └─────┬───────┘
          │
    ┌─────▼──────┬──────────┐
    │   Docker   │  PostgreSQL │
    └────────────┴────────────┘
```

## 🔐 Security Model

### Roles Hierarchy

| Role | Level | Capabilities |
|------|-------|-------------|
| **observer** | 1 | Read-only access (list, status, health) |
| **operator** | 2 | + Deploy, restart, backup |
| **builder** | 3 | + Init apps, DB operations, migrations |
| **admin** | 4 | + Remove apps, destructive operations |

### Security Features

- ✅ API key authentication (SHA256 hashed)
- ✅ Automatic secret redaction in logs
- ✅ Path traversal prevention
- ✅ Docker socket sandboxing
- ✅ PostgreSQL user isolation
- ✅ No arbitrary command execution

## 📦 Installation

### Prerequisites

- Ubuntu 24.04 LTS (or compatible)
- Root access
- Internet connection

### Quick Install

```bash
# Clone the repository
git clone https://github.com/zumradeals/ikoma-mcpp.git
cd ikoma-mcpp

# Copy files to /opt/ikoma
sudo mkdir -p /opt/ikoma
sudo cp -r . /opt/ikoma/

# Run installation script
sudo bash /opt/ikoma/scripts/install.sh
```

The script will:
1. Install Docker, Docker Compose, Node.js
2. Create necessary directories
3. Generate API key and configuration
4. Build and start IKOMA MCP
5. Display your API key (save it securely!)

### Manual Installation

See [INSTALL.md](INSTALL.md) for detailed manual installation steps.

## 🚀 Usage

### MCP Client (stdio)

Configure your MCP client to use IKOMA:

```json
{
  "mcpServers": {
    "ikoma": {
      "command": "docker",
      "args": [
        "compose",
        "-f",
        "/opt/ikoma/docker-compose.yml",
        "run",
        "--rm",
        "ikoma-mcp",
        "node",
        "dist/index.js",
        "mcp"
      ],
      "env": {
        "IKOMA_ROLE": "operator"
      }
    }
  }
}
```

Then use capabilities:

```javascript
// List available tools
const tools = await client.listTools();

// Execute capability
const result = await client.callTool({
  name: "platform.info",
  arguments: {}
});
```

### HTTP API

```bash
# Get API key
API_KEY=$(cat /opt/ikoma/api-key.txt)

# Platform info
curl -X POST http://localhost:3000/execute/platform.info \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{}'

# Initialize app
curl -X POST http://localhost:3000/execute/apps.init \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d '{"appName":"myapp"}'

# Deploy app
curl -X POST http://localhost:3000/execute/deploy.up \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d '{"appName":"myapp"}'
```

## 🛠️ Complete Tool Registry (19 Tools)

**⚠️ LISTE CANONIQUE FIGÉE - SORTIE EXACTE DE CAPABILITIES.map(c => c.name)**

```javascript
// Source: src/core/capabilities.ts - CAPABILITIES array
[
  "platform.info",           // 1
  "platform.check",          // 2
  "apps.list",               // 3
  "apps.status",             // 4
  "apps.health",             // 5
  "apps.init",               // 6
  "apps.remove",             // 7
  "apps.env.example",        // 8
  "apps.validate",           // 9
  "deploy.up",               // 10
  "deploy.down",             // 11
  "deploy.restart",          // 12
  "db.create",               // 13
  "db.migrate",              // 14
  "db.seed",                 // 15
  "db.backup",               // 16
  "db.status",               // 17
  "artifact.generate_runbook",  // 18
  "artifact.verify_release"     // 19
]
```

### Platform (2 tools)

| # | Tool | Role | Description |
|---|------|------|-------------|
| 1 | `platform.info` | observer | Get platform information and available capabilities |
| 2 | `platform.check` | observer | Check platform health (Docker, PostgreSQL, filesystem) |

### Applications (7 tools)

| # | Tool | Role | Description |
|---|------|------|-------------|
| 3 | `apps.list` | observer | List all deployed applications |
| 4 | `apps.status` | observer | Get status of a specific application |
| 5 | `apps.health` | observer | Check health of a specific application |
| 6 | `apps.init` | builder | Initialize a new application directory structure |
| 7 | `apps.remove` | admin | Remove an application completely (containers, database, files) |
| 8 | `apps.env.example` | observer | Generate example environment variables for an application |
| 9 | `apps.validate` | observer | Validate application configuration and structure |

### Deployment (3 tools)

| # | Tool | Role | Description |
|---|------|------|-------------|
| 10 | `deploy.up` | operator | Start application containers |
| 11 | `deploy.down` | operator | Stop application containers |
| 12 | `deploy.restart` | operator | Restart application containers |

### Database (5 tools)

| # | Tool | Role | Description |
|---|------|------|-------------|
| 13 | `db.create` | builder | Create a new PostgreSQL database for an application |
| 14 | `db.migrate` | builder | Execute SQL migration on application database |
| 15 | `db.seed` | builder | Insert seed data into application database |
| 16 | `db.backup` | operator | Create a backup of application database |
| 17 | `db.status` | observer | Get database status and information |

### Artifacts (2 tools)

| # | Tool | Role | Description |
|---|------|------|-------------|
| 18 | `artifact.generate_runbook` | observer | Generate deployment runbook for an application |
| 19 | `artifact.verify_release` | observer | Verify application release status and readiness |

---

**TOTAL: 19 tools** (2 + 7 + 3 + 5 + 2 = 19) ✅

## 🧪 Testing

Run the smoke test suite:

```bash
sudo bash /opt/ikoma/scripts/smoke-test.sh
```

This validates:
- Platform health
- Authentication
- App lifecycle (init, status, validate, remove)
- Database operations
- Artifact generation

## 📊 Monitoring

### View Logs

```bash
# Application logs
docker compose -f /opt/ikoma/docker-compose.yml logs -f

# Audit trail
tail -f /var/log/ikoma/audit.jsonl | jq
```

### Audit Log Format

```json
{
  "timestamp": "2026-01-02T10:30:00.000Z",
  "requestId": "abc123",
  "capability": "apps.init",
  "role": "builder",
  "arguments": {"appName": "myapp"},
  "result": "success",
  "duration": 150
}
```

## 🔧 Configuration

Edit `/opt/ikoma/.env`:

```bash
# Server mode
SERVER_MODE=hybrid          # mcp | http | hybrid

# Transport toggles
MCP_ENABLED=true
HTTP_ENABLED=true
HTTP_PORT=3000

# PostgreSQL
POSTGRES_PASSWORD=your_secure_password

# API key (SHA256 hash)
API_KEY_HASH=your_hash_here

# Default role for MCP stdio
IKOMA_ROLE=operator
```

Apply changes:

```bash
cd /opt/ikoma
sudo docker compose restart
```

## 📚 Documentation

- [README-runbook.md](README-runbook.md) - Deployment runbook template
- [DEMO-SESSION.md](DEMO-SESSION.md) - Interactive demo walkthrough
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture details

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🆘 Support

- GitHub Issues: https://github.com/zumradeals/ikoma-mcpp/issues
- Documentation: See project documentation files (README-runbook.md, DEMO-SESSION.md)

## 🙏 Acknowledgments

Built with:
- [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic
- [PostgreSQL](https://postgresql.org)
- [Docker](https://docker.com)
- [Node.js](https://nodejs.org)

---

**Made with ❤️ for the AI deployment community**