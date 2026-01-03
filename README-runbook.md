# 📋 Runbook de Déploiement IKOMA MCP

**Version du Document :** 1.0  
**Dernière Mise à Jour :** 2026-01-02  
**Auteur :** Équipe Projet IKOMA

---

## 🎯 Objectif

Ce runbook fournit des procédures étape par étape pour déployer, opérer et dépanner les applications gérées par IKOMA MCP v2.0.

## 📋 Liste de Vérification des Prérequis

Avant le déploiement, vérifiez :

- [ ] IKOMA MCP est installé et en cours d'exécution
- [ ] La clé API est disponible et sécurisée
- [ ] Le démon Docker est en cours d'exécution
- [ ] PostgreSQL est accessible
- [ ] `/srv/apps` dispose d'un espace disque suffisant
- [ ] Le code source de l'application est préparé
- [ ] Les variables d'environnement sont documentées

## 🚀 Workflow de Déploiement Standard

### Phase 1 : Initialisation

**Objectif :** Créer la structure de l'application

```bash
# 1. Initialiser le répertoire de l'application
curl -X POST http://localhost:3000/execute/apps.init \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d '{"appName":"myapp"}'

# 2. Vérifier la structure
ls -la /srv/apps/myapp/
```

**Sortie Attendue :**
```
/srv/apps/myapp/
├── config/
├── migrations/
├── seeds/
└── docker-compose.yml
```

### Phase 2 : Configuration

**Objectif :** Configurer l'environnement de l'application

```bash
# 1. Générer le modèle d'environnement
curl -X POST http://localhost:3000/execute/apps.env.example \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}' | jq -r '.result'

# 2. Créer le fichier .env
cat > /srv/apps/myapp/.env <<EOF
PORT=3000
NODE_ENV=production
POSTGRES_DB=myapp
POSTGRES_USER=ikoma
POSTGRES_PASSWORD=mot_de_passe_securise_ici
EOF

# 3. Copier les fichiers de l'application
cp -r /chemin/vers/source/* /srv/apps/myapp/src/
```

### Phase 3 : Configuration de la Base de Données

**Objectif :** Provisionner et configurer la base de données

```bash
# 1. Créer la base de données
curl -X POST http://localhost:3000/execute/db.create \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -d '{"appName":"myapp"}'

# 2. Exécuter les migrations
MIGRATION_SQL=$(cat /srv/apps/myapp/migrations/001_init.sql)
curl -X POST http://localhost:3000/execute/db.migrate \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d "{\"appName\":\"myapp\",\"sql\":\"$MIGRATION_SQL\"}"

# 3. Vérifier la base de données
curl -X POST http://localhost:3000/execute/db.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

### Phase 4 : Déploiement

**Objectif :** Démarrer les conteneurs de l'application

```bash
# 1. Valider la configuration
curl -X POST http://localhost:3000/execute/apps.validate \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'

# 2. Déployer
curl -X POST http://localhost:3000/execute/deploy.up \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'

# 3. Vérifier le statut
curl -X POST http://localhost:3000/execute/apps.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

### Phase 5 : Vérification

**Objectif :** Confirmer le succès du déploiement

```bash
# 1. Vérifier la release
curl -X POST http://localhost:3000/execute/artifact.verify_release \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}' | jq

# 2. Vérifier la santé
curl -X POST http://localhost:3000/execute/apps.health \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'

# 3. Tester le endpoint de l'application
curl http://localhost:3000/health
```

**Critères de Succès :**
- ✅ `verified: true` dans la vérification de release
- ✅ `health: "healthy"` dans la vérification de statut
- ✅ L'application répond à la vérification de santé

---

## 🔄 Procédures Opérationnelles

### Redémarrer l'Application

```bash
curl -X POST http://localhost:3000/execute/deploy.restart \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'
```

### Arrêter l'Application

```bash
curl -X POST http://localhost:3000/execute/deploy.down \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'
```

### Créer une Sauvegarde de Base de Données

```bash
curl -X POST http://localhost:3000/execute/db.backup \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d '{"appName":"myapp","backupName":"myapp-'$(date +%Y%m%d)'.sql"}'
```

### Consulter les Logs de l'Application

```bash
docker compose -f /srv/apps/myapp/docker-compose.yml logs -f --tail=100
```

---

## 🆘 Guide de Dépannage

### Problème : Les conteneurs ne démarrent pas

**Symptômes :** `dockerRunning: false` dans le statut

**Diagnostic :**
```bash
# Vérifier les logs Docker
docker compose -f /srv/apps/myapp/docker-compose.yml logs

# Vérifier la syntaxe du docker-compose.yml
docker compose -f /srv/apps/myapp/docker-compose.yml config
```

**Solutions :**
1. Vérifier les variables d'environnement dans `.env`
2. Vérifier les conflits de ports : `netstat -tulpn | grep <PORT>`
3. Redémarrer Docker : `systemctl restart docker`

### Problème : La connexion à la base de données échoue

**Symptômes :** Les logs de l'application montrent des erreurs de base de données

**Diagnostic :**
```bash
# Vérifier que la base de données existe
curl -X POST http://localhost:3000/execute/db.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'

# Tester la connectivité PostgreSQL
docker compose -f /opt/ikoma/docker-compose.yml exec postgres \
  psql -U ikoma -d myapp -c "SELECT 1"
```

**Solutions :**
1. Vérifier que les variables d'environnement `POSTGRES_*` correspondent
2. Vérifier les logs PostgreSQL : `docker logs ikoma-postgres`
3. Recréer la base de données si corrompue

### Problème : Espace disque plein

**Symptômes :** Le déploiement échoue avec des erreurs de disque

**Diagnostic :**
```bash
df -h /srv/apps
du -sh /srv/apps/*
```

**Solutions :**
1. Supprimer les anciennes sauvegardes : `rm /var/backups/ikoma/*.sql`
2. Nettoyer Docker : `docker system prune -a`
3. Supprimer les applications inutilisées avec `apps.remove`

---

## 🔙 Procédure de Rollback

### Rollback d'Urgence

**Temps de rollback :** ~5 minutes

**Étapes :**

```bash
# 1. Arrêter la version actuelle
curl -X POST http://localhost:3000/execute/deploy.down \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'

# 2. Restaurer la sauvegarde de base de données
BACKUP_FILE="/var/backups/ikoma/myapp-20260101.sql"
docker compose -f /opt/ikoma/docker-compose.yml exec -T postgres \
  psql -U ikoma -d myapp < $BACKUP_FILE

# 3. Revenir au code de l'application précédent
cd /srv/apps/myapp/src
git checkout tag-release-precedent

# 4. Déployer la version précédente
curl -X POST http://localhost:3000/execute/deploy.up \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -d '{"appName":"myapp"}'

# 5. Vérifier le rollback
curl -X POST http://localhost:3000/execute/artifact.verify_release \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

---

## 📊 Vérifications de Santé

### Santé de la Plateforme

```bash
curl -X POST http://localhost:3000/execute/platform.check \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}'
```

Sortie attendue en bonne santé :
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

### Santé de l'Application

```bash
curl -X POST http://localhost:3000/execute/apps.health \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{"appName":"myapp"}'
```

---

## 🔐 Procédures de Sécurité

### Rotation de la Clé API

```bash
# 1. Générer une nouvelle clé
NEW_KEY=$(openssl rand -base64 32)
NEW_HASH=$(echo -n "$NEW_KEY" | sha256sum | cut -d' ' -f1)

# 2. Mettre à jour la configuration
echo "API_KEY_HASH=$NEW_HASH" >> /opt/ikoma/.env

# 3. Redémarrer IKOMA
docker compose -f /opt/ikoma/docker-compose.yml restart

# 4. Sauvegarder la nouvelle clé en sécurité
echo "$NEW_KEY" > /opt/ikoma/api-key.txt
chmod 600 /opt/ikoma/api-key.txt
```

### Examiner le Journal d'Audit

```bash
# Voir l'activité récente
tail -n 100 /var/log/ikoma/audit.jsonl | jq

# Rechercher une application spécifique
grep '"appName":"myapp"' /var/log/ikoma/audit.jsonl | jq

# Trouver les opérations échouées
jq 'select(.result == "error")' /var/log/ikoma/audit.jsonl
```

---

## 📞 Chemin d'Escalade

| Sévérité | Temps de Réponse | Contact |
|----------|------------------|---------|
| P1 - Critique (production arrêtée) | 15 minutes | DevOps d'astreinte |
| P2 - Élevée (service dégradé) | 1 heure | Équipe plateforme |
| P3 - Moyenne (problème mineur) | 4 heures | Équipe support |
| P4 - Faible (question) | 24 heures | Documentation |

---

## 📝 Liste de Vérification Post-Déploiement

Après chaque déploiement, vérifiez :

- [ ] La vérification de release passe
- [ ] La vérification de santé de l'application passe
- [ ] Les migrations de base de données sont terminées
- [ ] La sauvegarde est créée
- [ ] Les alertes de surveillance sont configurées
- [ ] Le runbook est mis à jour (si les procédures ont changé)
- [ ] L'équipe est notifiée

---

**Maintenance du Document :**
- Révision trimestrielle
- Mise à jour après les déploiements majeurs
- Incorporation des leçons apprises des incidents

**Dernière Révision :** 2026-01-02  
**Prochaine Révision :** 2026-04-02
