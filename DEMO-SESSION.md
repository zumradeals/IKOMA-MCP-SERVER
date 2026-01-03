# 🎬 IKOMA MCP v2.0 — Session de Démonstration Interactive

**Durée :** 15 minutes  
**Niveau :** Débutant  
**Prérequis :** IKOMA MCP installé

---

## 🎯 Objectifs de la Démonstration

À la fin de cette démonstration, vous aurez :
1. ✅ Compris les capacités d'IKOMA MCP
2. ✅ Déployé une application exemple de bout en bout
3. ✅ Vérifié l'intégrité du déploiement
4. ✅ Expérimenté la piste d'audit

---

## 🚀 Configuration

```bash
# Obtenir votre clé API
export API_KEY=$(cat /opt/ikoma/api-key.txt)
export BASE_URL="http://localhost:3000"

# Vérifier qu'IKOMA fonctionne
curl -s $BASE_URL/health | jq
```

**Sortie attendue :**
```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

---

## 📚 Étape 1 : Découvrir la Plateforme

**Objectif :** Apprendre ce qu'IKOMA peut faire

```bash
# Obtenir les informations de la plateforme
curl -s -X POST $BASE_URL/execute/platform.info \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq
```

**Explication de la sortie :**
- `version` : Version d'IKOMA
- `uptime` : Temps de fonctionnement du serveur en secondes
- `capabilities` : Tous les **19** outils disponibles
- `limits` : Contraintes de la plateforme

**Essayez :** Comptez les capacités :
```bash
curl -s -X POST $BASE_URL/execute/platform.info \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq '.result.capabilities | length'
# Sortie attendue : 19
```

---

## 🏥 Étape 2 : Vérifier la Santé de la Plateforme

**Objectif :** Vérifier que tous les systèmes sont opérationnels

```bash
curl -s -X POST $BASE_URL/execute/platform.check \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq
```

**Ce qu'il faut rechercher :**
- `healthy: true` — Tous les systèmes sont opérationnels
- `docker: true` — Moteur de conteneurs prêt
- `postgres: true` — Base de données prête
- `appsRoot: true` — Stockage accessible

**Dépannage :** Si une vérification est `false`, consultez le runbook.

---

## 📦 Étape 3 : Initialiser l'Application de Démonstration

**Objectif :** Créer la structure de l'application

```bash
curl -s -X POST $BASE_URL/execute/apps.init \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**En coulisses :**
- Crée `/srv/apps/demoapp/`
- Génère `docker-compose.yml`
- Crée les répertoires `config/`, `migrations/`, `seeds/`

**Vérifier :**
```bash
ls -la /srv/apps/demoapp/
```

---

## 📝 Étape 4 : Configurer l'Application

**Objectif :** Préparer l'environnement de l'application

```bash
# Générer un modèle d'environnement
curl -s -X POST $BASE_URL/execute/apps.env.example \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq -r '.result'
```

**Personnaliser la configuration :**
```bash
cat > /srv/apps/demoapp/.env <<EOF
PORT=3001
NODE_ENV=production
POSTGRES_DB=demoapp
POSTGRES_USER=ikoma
POSTGRES_PASSWORD=demo_password_123
EOF
```

**Créer le code de l'application exemple :**
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
  console.log('Application de démo en écoute sur le port 3000');
});
EOF
```

---

## 🗄️ Étape 5 : Créer la Base de Données

**Objectif :** Provisionner la base de données PostgreSQL

```bash
curl -s -X POST $BASE_URL/execute/db.create \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: builder" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Vérifier le statut de la base de données :**
```bash
curl -s -X POST $BASE_URL/execute/db.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Attendu :**
```json
{
  "exists": true,
  "name": "demoapp",
  "size": "8241 kB",
  "tables": []
}
```

---

## 🚀 Étape 6 : Déployer l'Application

**Objectif :** Démarrer les conteneurs

```bash
# Valider d'abord
curl -s -X POST $BASE_URL/execute/apps.validate \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq

# Déployer !
curl -s -X POST $BASE_URL/execute/deploy.up \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Attendez quelques secondes que les conteneurs démarrent...**

---

## ✅ Étape 7 : Vérifier le Déploiement

**Objectif :** Confirmer que tout fonctionne

```bash
# Vérifier le statut de l'application
curl -s -X POST $BASE_URL/execute/apps.status \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Attendu :**
```json
{
  "name": "demoapp",
  "exists": true,
  "dockerRunning": true,
  "dbExists": true,
  "health": "healthy"
}
```

**Exécuter une vérification complète :**
```bash
curl -s -X POST $BASE_URL/execute/artifact.verify_release \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**🎉 Critère de succès :** `verified: true` et toutes les vérifications passent !

---

## 📊 Étape 8 : Générer le Runbook

**Objectif :** Documenter le déploiement

```bash
curl -s -X POST $BASE_URL/execute/artifact.generate_runbook \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**La sortie inclut :**
- Horodatage du déploiement
- Instantané de la configuration
- Commandes de vérification de santé
- Procédure de rollback

**Sauvegardez pour référence future !**

---

## 💾 Étape 9 : Créer une Sauvegarde

**Objectif :** Protéger vos données

```bash
curl -s -X POST $BASE_URL/execute/db.backup \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d "{\"appName\":\"demoapp\",\"backupName\":\"demoapp-$(date +%Y%m%d).sql\"}" | jq
```

**Vérifier la sauvegarde :**
```bash
ls -lh /var/backups/ikoma/
```

---

## 🔄 Étape 10 : Tester les Opérations

**Objectif :** Expérimenter les commandes opérationnelles

```bash
# Redémarrer l'application
curl -s -X POST $BASE_URL/execute/deploy.restart \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: operator" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq

# Vérifier la santé après le redémarrage
sleep 5
curl -s -X POST $BASE_URL/execute/apps.health \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

---

## 📜 Étape 11 : Examiner la Piste d'Audit

**Objectif :** Comprendre ce qui s'est passé

```bash
# Voir le journal d'audit
tail -n 20 /var/log/ikoma/audit.jsonl | jq

# Trouver toutes les opérations sur demoapp
grep 'demoapp' /var/log/ikoma/audit.jsonl | jq

# Compter les opérations réussies
grep 'success' /var/log/ikoma/audit.jsonl | wc -l
```

**Remarquez :**
- Chaque appel de capacité est journalisé
- Horodatages en ISO 8601
- Rédaction des secrets (les mots de passe apparaissent comme `***REDACTED***`)
- Suivi de la durée

---

## 🧹 Étape 12 : Nettoyage (Optionnel)

**Objectif :** Supprimer l'application de démonstration

```bash
curl -s -X POST $BASE_URL/execute/apps.remove \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: admin" \
  -H "Content-Type: application/json" \
  -d '{"appName":"demoapp"}' | jq
```

**Cela va :**
- Arrêter les conteneurs
- Supprimer la base de données
- Supprimer le répertoire de l'application

---

## 🎓 Résultats d'Apprentissage

Vous avez maintenant :

✅ **Découvert** les 19 outils d'IKOMA  
✅ **Initialisé** une structure d'application  
✅ **Déployé** des conteneurs et une base de données  
✅ **Vérifié** l'intégrité du déploiement  
✅ **Généré** la documentation opérationnelle  
✅ **Créé** des sauvegardes de base de données  
✅ **Examiné** la piste d'audit  

---

## 🚀 Prochaines Étapes

### Essayer le Mode MCP Natif

Au lieu de HTTP, utilisez le transport stdio MCP :

```bash
# Configurer dans votre client MCP (Claude Desktop, etc.)
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

Ensuite, interagissez naturellement :
> "Déploie mon application Node.js appelée 'backend' en utilisant le docker-compose.yml fourni"

IKOMA gérera l'ensemble du workflow !

### Explorer le Contrôle d'Accès Basé sur les Rôles

Essayez différents rôles :

```bash
# Observateur - lecture seule
curl ... -H "X-Role: observer"

# Opérateur - déploiements + sauvegardes
curl ... -H "X-Role: operator"

# Constructeur - + init apps + opérations DB
curl ... -H "X-Role: builder"

# Administrateur - + suppression d'apps
curl ... -H "X-Role: admin"
```

### Construire des Workflows Complexes

Enchaîner les capacités :
1. `apps.init` → Initialiser
2. `db.create` → Provisionner la base de données
3. `db.migrate` → Configuration du schéma
4. `db.seed` → Données de test
5. `deploy.up` → Lancement
6. `artifact.verify_release` → Confirmation
7. `db.backup` → Protection

---

## 💡 Astuces et Conseils

**Passer par jq pour la lisibilité :**
```bash
curl ... | jq '.result'
```

**Sauvegarder la clé API dans le shell :**
```bash
echo "export API_KEY=$(cat /opt/ikoma/api-key.txt)" >> ~/.bashrc
```

**Surveiller les logs en direct :**
```bash
tail -f /var/log/ikoma/audit.jsonl | jq -C
```

**Lister toutes les applications :**
```bash
curl -s -X POST $BASE_URL/execute/apps.list \
  -H "X-Api-Key: $API_KEY" \
  -H "X-Role: observer" \
  -d '{}' | jq -r '.result[]'
```

---

## 🆘 Dépannage

**"API key required"**
→ Vérifiez l'en-tête `X-Api-Key`

**"Insufficient permissions"**
→ Votre rôle ne permet pas cette capacité. Utilisez un rôle supérieur ou une capacité différente.

**"Database already exists"**
→ Normal si vous relancez la démo. Utilisez `db.status` pour vérifier.

**Erreurs Docker**
→ Vérifiez le démon Docker : `systemctl status docker`

---

## 📚 Lectures Complémentaires

- [README.md](README.md) - Documentation complète
- [README-runbook.md](README-runbook.md) - Runbook de production
- [Spécification Model Context Protocol](https://modelcontextprotocol.io)

---

**Questions ? Problèmes ?**
- GitHub : https://github.com/zumradeals/ikoma-mcpp/issues

**Bon déploiement ! 🚀**
