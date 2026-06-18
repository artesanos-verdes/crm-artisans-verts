# 🤝 Prise en main — pour Benjamin

Bienvenue ! Ce document te permet de **reprendre le développement du CRM** avec **Claude Code**. Lecture : 5 min.

---

## 1. Ce dont tu as besoin

| | |
|---|---|
| **Compte Claude** | Abonnement **Pro ou Max** (Claude Code est inclus). |
| **Claude Code** | App de bureau (Mac/Windows) ou extension VS Code — le plus simple. *(CLI : `npm i -g @anthropic-ai/claude-code` puis `claude`.)* |
| **Le projet** | Ce dossier. Deux options ci-dessous. |

### Récupérer le projet — et rester synchronisé
👉 **Suis [PARTAGE.md](PARTAGE.md)** : Jonathan t'ajoute comme **collaborateur** du dépôt GitHub `artesanos-verdes/crm-artisans-verts`, tu le **clones** une fois, puis tu te synchronises d'un clic (`sync.command` pour recevoir, `publish.command` pour envoyer) — ou tu demandes à Claude Code « récupère la dernière version » / « publie mes changements ».

Ainsi, **les mises à jour de Jonathan apparaissent chez toi**, et inversement. (La copie de fichiers envoyée par mail ne se synchronise pas — passe par le dépôt.)

---

## 2. Comment travailler

Le CRM est **un seul fichier** : `index.html` (HTML + CSS + JS, sans build). Le cycle :

1. Tu **décris ce que tu veux** à Claude Code (en français). Il lit `CLAUDE.md` tout seul et connaît déjà le projet.
2. Il modifie `index.html`, **valide la syntaxe**, et te montre le résultat.
3. **Déploiement** : `git push` → GitHub Actions met en ligne en ~30 s → les 3 postes se rechargent **automatiquement** (plus besoin de Ctrl+Maj+R).

### Premiers essais
> • « *Lis CLAUDE.md et explique-moi comment marche l'onglet « À régler ».* »
> • « *Dans Factures, ajoute un bouton pour exporter la liste filtrée en PDF.* »
> • « *Pourquoi le total LED affiche X ?* »

💡 Pas sûr de comment formuler ? Dans le CRM, menu **⋮ → « Suggérer une amélioration »** génère un **prompt prêt à coller** dans Claude Code (tout le contexte technique est déjà dedans).

---

## 3. Les 3 règles à ne pas casser

1. **Single-file vanilla** — tout reste dans `index.html`, sans framework ni build.
2. **Les calculs d'argent restent déterministes** — l'IA lit/explique, le **code** calcule. On ne laisse jamais l'IA produire un montant.
3. **On valide la syntaxe JS avant de déployer** (Claude Code le fait ; la commande est dans le README).

---

## 4. Où on en est (état au 18/06/2026)

Déjà en place et en ligne :
- ✅ Multi-postes Firebase (3 comptes, temps réel) + **auto-rechargement** des nouvelles versions.
- ✅ Factures par activité, **scan photo/PDF** (lit aussi le détail des lignes).
- ✅ **Contrôle prix** + **Audit AXDIS** (69 418,83 € à réclamer) + **veille tarifaire permanente** (alertes 🔔).
- ✅ **À régler** : échéancier fournisseurs (à devoir 2 537 506 € / reste « sec » 2 214 721 €).
- ✅ Détail **LED** (302 factures / 600 192 € HT).
- ✅ Assistant IA, guide intégré (bouton **?**), grosse passe UX/responsive.

Détails techniques complets : **`CLAUDE.md`**.

---

## 5. En cas de doute

- **Données / chiffres** : les sources sont des Google Sheets ; on les parse en **xlsx** (jamais l'OCR d'un PDF) en ciblant le bon onglet. Toujours vérifier un total contre la source.
- **Déploiement bloqué** : `gh run list --repo artesanos-verdes/crm-artisans-verts --limit 1`.
- **Une question** : demande à Jonathan, ou à Claude Code directement.

Bon dev ! 🌿
