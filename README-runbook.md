# 📋 IKOMA MCP Deployment Runbook

**Document Version:** 1.0  
**Last Updated:** 2026-01-02  
**Author:** IKOMA Project Team

---

## 🎯 Purpose

This runbook provides step-by-step procedures for deploying, operating, and troubleshooting applications managed by IKOMA MCP v2.0.

## 📋 Prerequisites Checklist

Before deployment, verify:

- [ ] IKOMA MCP is installed and running
- [ ] API key is available and secured
- [ ] Docker daemon is running
- [ ] PostgreSQL is accessible
- [ ] `/srv/apps` has sufficient disk space
- [ ] Application source code is prepared
- [ ] Environment variables are documented

## 🚀 Standard Deployment Workflow

### Phase 1: Initialization

**Objective:** Create application structure

```bash
# 1. Initialize app directory
curl -X POST http://localhost:3000/execute/apps.init \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d '{"appName":"myapp"}'

# 2. Verify structure
ls -la /srv/apps/myapp/
```

**Expected Output:**
```
/srv/apps/myapp/
├── config/
├── migrations/
├── seeds/
└── docker-compose.yml
```

### Phase 2: Configuration

**Objective:** Configure application environment

```bash
# 1. Generate environment template
curl -X POST http://localhost:3000/execute/apps.env.example \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}' | jq -r '.result'

# 2. Create .env file
cat > /srv/apps/myapp/.env <<EOF
PORT=3000
NODE_ENV=production
POSTGRES_DB=myapp
POSTGRES_USER=ikoma
POSTGRES_PASSWORD=secure_password_here
EOF

# 3. Copy application files
cp -r /path/to/source/* /srv/apps/myapp/src/
```

### Phase 3: Database Setup

**Objective:** Provision and configure database

```bash
# 1. Create database
curl -X POST http://localhost:3000/execute/db.create \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -d '{"appName":"myapp"}'

# 2. Run migrations
MIGRATION_SQL=$(cat /srv/apps/myapp/migrations/001_init.sql)
curl -X POST http://localhost:3000/execute/db.migrate \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d "{\"appName\":\"myapp\",\"sql\":\"$MIGRATION_SQL\"}"

# 3. Verify database
curl -X POST http://localhost:3000/execute/db.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

### Phase 4: Deployment

**Objective:** Start application containers

```bash
# 1. Validate configuration
curl -X POST http://localhost:3000/execute/apps.validate \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'

# 2. Deploy
curl -X POST http://localhost:3000/execute/deploy.up \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'

# 3. Check status
curl -X POST http://localhost:3000/execute/apps.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

### Phase 5: Verification

**Objective:** Confirm successful deployment

```bash
# 1. Verify release
curl -X POST http://localhost:3000/execute/artifact.verify_release \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}' | jq

# 2. Check health
curl -X POST http://localhost:3000/execute/apps.health \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'

# 3. Test application endpoint
curl http://localhost:3000/health
```

**Success Criteria:**
- ✅ `verified: true` in release verification
- ✅ `health: "healthy"` in status check
- ✅ Application responds to health check

---

## 🔄 Operational Procedures

### Restart Application

```bash
curl -X POST http://localhost:3000/execute/deploy.restart \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'
```

### Stop Application

```bash
curl -X POST http://localhost:3000/execute/deploy.down \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'
```

### Create Database Backup

```bash
curl -X POST http://localhost:3000/execute/db.backup \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d '{"appName":"myapp","backupName":"myapp-'$(date +%Y%m%d)'.sql"}'
```

### View Application Logs

```bash
docker compose -f /srv/apps/myapp/docker-compose.yml logs -f --tail=100
```

---

## 🆘 Troubleshooting Guide

### Issue: Containers won't start

**Symptoms:** `dockerRunning: false` in status

**Diagnosis:**
```bash
# Check Docker logs
docker compose -f /srv/apps/myapp/docker-compose.yml logs

# Check docker-compose.yml syntax
docker compose -f /srv/apps/myapp/docker-compose.yml config
```

**Solutions:**
1. Verify environment variables in `.env`
2. Check port conflicts: `netstat -tulpn | grep <PORT>`
3. Restart Docker: `systemctl restart docker`

### Issue: Database connection fails

**Symptoms:** Application logs show database errors

**Diagnosis:**
```bash
# Check database exists
curl -X POST http://localhost:3000/execute/db.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'

# Test PostgreSQL connectivity
docker compose -f /opt/ikoma/docker-compose.yml exec postgres \
  psql -U ikoma -d myapp -c "SELECT 1"
```

**Solutions:**
1. Verify `POSTGRES_*` environment variables match
2. Check PostgreSQL logs: `docker logs ikoma-postgres`
3. Recreate database if corrupted

### Issue: Disk space full

**Symptoms:** Deployment fails with disk errors

**Diagnosis:**
```bash
df -h /srv/apps
du -sh /srv/apps/*
```

**Solutions:**
1. Remove old backups: `rm /var/backups/ikoma/*.sql`
2. Clean Docker: `docker system prune -a`
3. Remove unused apps with `apps.remove`

---

## 🔙 Rollback Procedure

### Emergency Rollback

**Time to rollback:** ~5 minutes

**Steps:**

```bash
# 1. Stop current version
curl -X POST http://localhost:3000/execute/deploy.down \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'

# 2. Restore database backup
BACKUP_FILE="/var/backups/ikoma/myapp-20260101.sql"
docker compose -f /opt/ikoma/docker-compose.yml exec -T postgres \
  psql -U ikoma -d myapp < $BACKUP_FILE

# 3. Revert application code
cd /srv/apps/myapp/src
git checkout previous-release-tag

# 4. Deploy previous version
curl -X POST http://localhost:3000/execute/deploy.up \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'

# 5. Verify rollback
curl -X POST http://localhost:3000/execute/artifact.verify_release \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

---

## 📊 Health Checks

### Platform Health

```bash
curl -X POST http://localhost:3000/execute/platform.check \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}'
```

Expected healthy output:
```json
{
  "healthy": true,
  "checks": {
    "docker": true,
    "postgres": true,
    "appsRoot": true
  }
}
```

### Application Health

```bash
curl -X POST http://localhost:3000/execute/apps.health \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

---

## 🔐 Security Procedures

### Rotate API Key

```bash
# 1. Generate new key
NEW_KEY=$(openssl rand -base64 32)
NEW_HASH=$(echo -n "$NEW_KEY" | sha256sum | cut -d' ' -f1)

# 2. Update configuration
echo "API_KEY_HASH=$NEW_HASH" >> /opt/ikoma/.env

# 3. Restart IKOMA
docker compose -f /opt/ikoma/docker-compose.yml restart

# 4. Save new key securely
echo "$NEW_KEY" > /opt/ikoma/api-key.txt
chmod 600 /opt/ikoma/api-key.txt
```

### Review Audit Log

```bash
# View recent activity
tail -n 100 /var/log/ikoma/audit.jsonl | jq

# Search for specific app
grep '"appName":"myapp"' /var/log/ikoma/audit.jsonl | jq

# Find failed operations
jq 'select(.result == "error")' /var/log/ikoma/audit.jsonl
```

---

## 📞 Escalation Path

| Severity | Response Time | Contact |
|----------|---------------|---------|
| P1 - Critical (production down) | 15 minutes | DevOps on-call |
| P2 - High (degraded service) | 1 hour | Platform team |
| P3 - Medium (minor issue) | 4 hours | Support team |
| P4 - Low (question) | 24 hours | Documentation |

---

## 📝 Post-Deployment Checklist

After each deployment, verify:

- [ ] Release verification passes
- [ ] Application health check passes
- [ ] Database migrations completed
- [ ] Backup created
- [ ] Monitoring alerts configured
- [ ] Runbook updated (if procedures changed)
- [ ] Team notified

---

**Document Maintenance:**
- Review quarterly
- Update after major deployments
- Incorporate lessons learned from incidents

**Last Review:** 2026-01-02  
**Next Review:** 2026-04-02