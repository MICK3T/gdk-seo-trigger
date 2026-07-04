# gdk-seo-trigger

Micro-service **Railway (cron)** qui déclenche les workflows GitHub de la machine SEO
(`gdk-seo-copilot`) — parce que le planificateur interne de GitHub Actions n'est pas fiable
sur les repos récents.

Il tourne **1×/jour** (cron Railway à **07:00 UTC = 09:00 heure FR**), et déclenche :

| Workflow | Quand |
|---|---|
| `publish.yml` | tous les jours (publie les articles tagués `seo-approved`) |
| `generate.yml` | lundi & vendredi (1 nouvel article brouillon) |
| `optimize.yml` | dimanche (optimisation) |
| `research.yml` | le 1er du mois (nouveaux mots-clés) |

## Variables d'environnement (Railway)

- `GH_DISPATCH_PAT` — **requis**. Fine-grained token GitHub : repo `gdk-seo-copilot`,
  permission **Actions: Read and write**.
- `GH_SEO_REPO` — optionnel (défaut `MICK3T/gdk-seo-copilot`).

## Déploiement Railway

1. Pousser ce dossier sur un repo GitHub.
2. Railway → **New Service** → *Deploy from GitHub repo* → `gdk-seo-trigger`.
3. Service **Settings → Cron Schedule** : `0 7 * * *` (07:00 UTC / 09:00 FR).
   - Restart Policy : **Never** (c'est un job qui s'exécute puis s'arrête).
4. **Variables** → ajouter `GH_DISPATCH_PAT`.

## Test manuel

Depuis le dashboard Railway, un **Deploy** manuel exécute le script une fois
(utile pour vérifier que les workflows se déclenchent). Vérifier les logs : `✅ publish.yml → HTTP 204`.
