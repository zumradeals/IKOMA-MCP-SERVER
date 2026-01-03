# Contribuer à IKOMA MCP

Merci de votre intérêt pour contribuer à IKOMA MCP ! Ce document fournit des lignes directrices pour contribuer au projet.

## 🤝 Comment Contribuer

### Signaler des Problèmes

Si vous trouvez un bug ou avez une demande de fonctionnalité :

1. Vérifiez si le problème existe déjà dans [GitHub Issues](https://github.com/zumradeals/ikoma-mcpp/issues)
2. Si non, créez une nouvelle issue avec :
   - Un titre et une description clairs
   - Les étapes pour reproduire (pour les bugs)
   - Le comportement attendu vs le comportement réel
   - Votre environnement (OS, version Node.js, version Docker)

### Soumettre des Changements

1. **Forker le dépôt**
   ```bash
   git clone https://github.com/zumradeals/ikoma-mcpp.git
   cd ikoma-mcpp
   ```

2. **Créer une branche de fonctionnalité**
   ```bash
   git checkout -b feature/nom-de-votre-fonctionnalite
   # ou
   git checkout -b fix/votre-correction-de-bug
   ```

3. **Faire vos modifications**
   - Suivez le style de code existant
   - Ajoutez des tests pour les nouvelles fonctionnalités
   - Mettez à jour la documentation si nécessaire

4. **Tester vos modifications**
   ```bash
   # Installer les dépendances
   npm ci
   
   # Exécuter la compilation TypeScript
   npm run build
   
   # Exécuter les tests (si disponibles)
   npm test
   
   # Tester le build Docker
   docker-compose build
   ```

5. **Commiter vos modifications**
   ```bash
   git add .
   git commit -m "feat: Ajouter une nouvelle capacité pour X"
   # ou
   git commit -m "fix: Résoudre le problème avec Y"
   ```

   Utilisez des messages de commit conventionnels :
   - `feat:` pour les nouvelles fonctionnalités
   - `fix:` pour les corrections de bugs
   - `docs:` pour les changements de documentation
   - `refactor:` pour le refactoring de code
   - `test:` pour l'ajout de tests
   - `chore:` pour les tâches de maintenance

6. **Pousser vers votre fork**
   ```bash
   git push origin feature/nom-de-votre-fonctionnalite
   ```

7. **Créer une Pull Request**
   - Allez sur le dépôt original
   - Cliquez sur "New Pull Request"
   - Sélectionnez votre branche
   - Fournissez une description claire de vos modifications

## 📋 Lignes Directrices de Développement

### Style de Code

- Utilisez TypeScript pour tout le code source
- Suivez les conventions de nommage existantes
- Utilisez des noms de variables et de fonctions significatifs
- Ajoutez des commentaires JSDoc pour les APIs publiques
- Gardez les fonctions petites et focalisées

### Structure du Projet

```
ikoma-mcpp/
├── src/
│   ├── core/           # Capacités et logique centrale
│   ├── http/           # Implémentation du serveur HTTP
│   └── mcp/            # Implémentation du protocole MCP
├── scripts/            # Scripts d'installation et utilitaires
├── docker-compose.yml  # Orchestration Docker
└── Dockerfile          # Définition du conteneur
```

### Ajouter de Nouvelles Capacités

Lors de l'ajout d'une nouvelle capacité :

1. Définissez-la dans `src/core/capabilities.ts`
2. Suivez la structure de capacité existante
3. Spécifiez le niveau de rôle requis
4. Ajoutez un schéma de validation d'entrée
5. Implémentez la fonction de capacité
6. Mettez à jour le nombre d'outils dans README.md
7. Ajoutez des tests

Exemple :

```typescript
{
  name: 'votre.capacite',
  description: 'Description claire de ce qu\'elle fait',
  requiredRole: 'operator',
  schema: z.object({
    param: z.string().describe('Description du paramètre')
  }),
  handler: async (args, context) => {
    // Implémentation
    return { success: true, data: result };
  }
}
```

### Considérations de Sécurité

- Ne jamais exposer l'accès shell
- Toujours valider et assainir les entrées
- Utiliser le confinement de chemin pour les opérations de fichiers
- Rédiger les secrets dans les logs
- Suivre le principe du moindre privilège

## 🧪 Tests

- Écrivez des tests pour les nouvelles fonctionnalités
- Assurez-vous que tous les tests passent avant de soumettre une PR
- Testez le build Docker localement
- Vérifiez que les contraintes de sécurité sont maintenues

## 📝 Documentation

- Mettez à jour README.md pour les changements visibles par l'utilisateur
- Mettez à jour les commentaires de code en ligne
- Ajoutez des exemples pour les nouvelles fonctionnalités
- Mettez à jour le nombre de capacités si vous ajoutez/supprimez des outils

## 🔍 Processus de Revue de Code

1. Les mainteneurs examineront votre PR
2. Répondez aux commentaires ou aux changements demandés
3. Une fois approuvée, votre PR sera fusionnée
4. Votre contribution sera créditée dans les notes de version

## 💡 Questions ?

Si vous avez des questions sur la contribution :

- Ouvrez une discussion dans GitHub Issues
- Consultez la documentation existante
- Examinez les PRs similaires fusionnées

## 📜 Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

---

Merci d'aider à améliorer IKOMA MCP ! 🙏
