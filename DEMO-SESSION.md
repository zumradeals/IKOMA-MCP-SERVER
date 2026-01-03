# 🎬 IKOMA MCP v2.0 — Interactive Demo Session

**Duration:** 15 minutes  
**Skill Level:** Beginner  
**Prerequisites:** IKOMA MCP installed

---

## 🎯 Demo Objectives

By the end of this demo, you will:
1. ✅ Understand IKOMA MCP capabilities
2. ✅ Deploy a sample application end-to-end
3. ✅ Verify deployment integrity
4. ✅ Experience the audit trail

---

## 🚀 Setup

```bash
# Get your API key
export API_KEY=$(cat /opt/ikoma/api-key.txt)
export BASE_URL="http://localhost:3000"

# Verify IKOMA is running
curl -s $BASE_URL/health | jq
```

**Expected output:**
```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

---

## 📚 Step 1: Discover Platform

**Goal:** Learn what IKOMA can do

```bash
# Get platform information
curl -s -X POST $BASE_URL/execute/platform.info \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq
```

**Output explanation:**
- `version`: IKOMA version
- `uptime`: Server uptime in seconds
- `capabilities`: All **19** available tools
- `limits`: Platform constraints

**Try it:** Count the capabilities:
```bash
curl -s -X POST $BASE_URL/execute/platform.info \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq '.result.capabilities | length'
# Expected output: 19
```

---

## 🏥 Step 2: Check Platform Health

**Goal:** Verify all systems operational

```bash
curl -s -X POST $BASE_URL/execute/platform.check \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq
```

**What to look for:**
- `healthy: true` — All systems go
- `docker: true` — Container engine ready
- `postgres: true` — Database ready
- `appsRoot: true` — Storage accessible

**Troubleshooting:** If any check is `false`, see the runbook.

---

## 📦 Step 3: Initialize Demo App

**Goal:** Create application structure

```bash
curl -s -X POST $BASE_URL/execute/apps.init \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Behind the scenes:**
- Creates `/srv/apps/demoapp/`
- Generates `docker-compose.yml`
- Creates `config/`, `migrations/`, `seeds/` directories

**Verify:**
```bash
ls -la /srv/apps/demoapp/
```

---

## 📝 Step 4: Configure Application

**Goal:** Prepare application environment

```bash
# Generate environment template
curl -s -X POST $BASE_URL/execute/apps.env.example \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq -r '.result'
```

**Customize the configuration:**
```bash
cat > /srv/apps/demoapp/.env <<EOF
PORT=3001
NODE_ENV=production
POSTGRES_DB=demoapp
POSTGRES_USER=ikoma
POSTGRES_PASSWORD=demo_password_123
EOF
```

**Create sample app code:**
```bash
mkdir -p /srv/apps/demoapp/src
cat > /srv/apps/demoapp/src/package.json <<EOF
{
  "name": "demoapp",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

cat > /srv/apps/demoapp/src/index.js <<'EOF'
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'demoapp' });
});

app.listen(3000, () => {
  console.log('Demo app listening on port 3000');
});
EOF
```

---

## 🗄️ Step 5: Create Database

**Goal:** Provision PostgreSQL database

```bash
curl -s -X POST $BASE_URL/execute/db.create \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Check database status:**
```bash
curl -s -X POST $BASE_URL/execute/db.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Expected:**
```json
{
  "exists": true,
  "name": "demoapp",
  "size": "8241 kB",
  "tables": []
}
```

---

## 🚀 Step 6: Deploy Application

**Goal:** Start containers

```bash
# Validate first
curl -s -X POST $BASE_URL/execute/apps.validate \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq

# Deploy!
curl -s -X POST $BASE_URL/execute/deploy.up \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Wait a few seconds for containers to start...**

---

## ✅ Step 7: Verify Deployment

**Goal:** Confirm everything works

```bash
# Check application status
curl -s -X POST $BASE_URL/execute/apps.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Expected:**
```json
{
  "name": "demoapp",
  "exists": true,
  "dockerRunning": true,
  "dbExists": true,
  "health": "healthy"
}
```

**Run full verification:**
```bash
curl -s -X POST $BASE_URL/execute/artifact.verify_release \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**🎉 Success criteria:** `verified: true` and all checks pass!

---

## 📊 Step 8: Generate Runbook

**Goal:** Document the deployment

```bash
curl -s -X POST $BASE_URL/execute/artifact.generate_runbook \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Output includes:**
- Deployment timestamp
- Configuration snapshot
- Health check commands
- Rollback procedure

**Save for future reference!**

---

## 💾 Step 9: Create Backup

**Goal:** Protect your data

```bash
curl -s -X POST $BASE_URL/execute/db.backup \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d "{\"appName\":\"demoapp\",\"backupName\":\"demoapp-$(date +%Y%m%d).sql\"}" | jq
```

**Verify backup:**
```bash
ls -lh /var/backups/ikoma/
```

---

## 🔄 Step 10: Test Operations

**Goal:** Experience operational commands

```bash
# Restart application
curl -s -X POST $BASE_URL/execute/deploy.restart \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq

# Check health after restart
sleep 5
curl -s -X POST $BASE_URL/execute/apps.health \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

---

## 📜 Step 11: Review Audit Trail

**Goal:** Understand what happened

```bash
# View audit log
tail -n 20 /var/log/ikoma/audit.jsonl | jq

# Find all operations on demoapp
grep 'demoapp' /var/log/ikoma/audit.jsonl | jq

# Count successful operations
grep 'success' /var/log/ikoma/audit.jsonl | wc -l
```

**Notice:**
- Every capability call logged
- Timestamps in ISO 8601
- Secret redaction (passwords show as `***REDACTED***`)
- Duration tracking

---

## 🧹 Step 12: Cleanup (Optional)

**Goal:** Remove demo app

```bash
curl -s -X POST $BASE_URL/execute/apps.remove \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: admin" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**This will:**
- Stop containers
- Remove database
- Delete application directory

---

## 🎓 Learning Outcomes

You've now:

✅ **Discovered** IKOMA's 19 tools  
✅ **Initialized** an application structure  
✅ **Deployed** containers and database  
✅ **Verified** deployment integrity  
✅ **Generated** operational documentation  
✅ **Created** database backups  
✅ **Reviewed** the audit trail  

---

## 🚀 Next Steps

### Try MCP Native Mode

Instead of HTTP, use the stdio MCP transport:

```bash
# Configure in your MCP client (Claude Desktop, etc.)
{
  "mcpServers": {
    "ikoma": {
      "command": "docker",
      "args": ["compose", "-f", "/opt/ikoma/docker-compose.yml", 
               "run", "--rm", "ikoma-mcp", "node", "dist/index.js", "mcp"],
      "env": { "IKOMA_ROLE": "operator" }
    }
  }
}
```

Then interact naturally:
> "Deploy my Node.js app called 'backend' using the provided docker-compose.yml"

IKOMA will handle the entire workflow!

### Explore Role-Based Access

Try different roles:

```bash
# Observer - read-only
curl ... -H "X-Role: observer"

# Operator - deployments + backups
curl ... -H "X-Role: operator"

# Builder - + init apps + DB ops
curl ... -H "X-Role: builder"

# Admin - + remove apps
curl ... -H "X-Role: admin"
```

### Build Complex Workflows

Chain capabilities:
1. `apps.init` → Initialize
2. `db.create` → Provision database
3. `db.migrate` → Schema setup
4. `db.seed` → Test data
5. `deploy.up` → Launch
6. `artifact.verify_release` → Confirm
7. `db.backup` → Protect

---

## 💡 Tips & Tricks

**Pipe through jq for readability:**
```bash
curl ... | jq '.result'
```

**Save API key in shell:**
```bash
echo "export API_KEY=$(cat /opt/ikoma/api-key.txt)" >> ~/.bashrc
```

**Monitor logs live:**
```bash
tail -f /var/log/ikoma/audit.jsonl | jq -C
```

**List all apps:**
```bash
curl -s -X POST $BASE_URL/execute/apps.list \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq -r '.result[]'
```

---

## 🆘 Troubleshooting

**"API key required"**
→ Check `X-Api-Key` header

**"Insufficient permissions"**
→ Your role doesn't allow this capability. Use higher role or different capability.

**"Database already exists"**
→ Normal if re-running demo. Use `db.status` to check.

**Docker errors**
→ Check Docker daemon: `systemctl status docker`

---

## 📚 Further Reading

- [README.md](README.md) - Full documentation
- [README-runbook.md](README-runbook.md) - Production runbook
- [Model Context Protocol Spec](https://modelcontextprotocol.io)

---

**Questions? Issues?**
- GitHub: https://github.com/your-org/ikoma-mcp/issues
- Discord: https://discord.gg/ikoma-mcp

**Happy deploying! 🚀**