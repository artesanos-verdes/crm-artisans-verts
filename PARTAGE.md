# 🔗 Travailler à plusieurs sur le code (Jonathan ↔ Benjamin)

Le projet est **déjà sur un serveur partagé : GitHub** → `github.com/artesanos-verdes/crm-artisans-verts`.
C'est lui qui garde **la version de référence** et synchronise les modifs entre les ordinateurs. Pas besoin d'un autre serveur.

> ⚠️ La copie des fichiers que tu as **envoyée par mail/WhatsApp ne se met pas à jour** : c'est une photo figée. Pour recevoir tes mises à jour, Benjamin doit **se brancher au dépôt GitHub** (ci-dessous). Une fois fait, c'est un clic.

---

## ① À faire UNE fois — par Jonathan : donner accès à Benjamin

1. Va sur **https://github.com/artesanos-verdes/crm-artisans-verts**
2. **Settings** (onglet du dépôt) → **Collaborators** → **Add people**
3. Saisis le **nom d'utilisateur GitHub** (ou l'e-mail) de Benjamin → **Add**.
   *(Si Benjamin n'a pas de compte GitHub, il s'en crée un gratuit sur github.com — 2 min.)*
4. Benjamin reçoit une invitation par e-mail → il l'**accepte**.

✅ À partir de là, vous travaillez **tous les deux sur le même projet**.

---

## ② À faire UNE fois — par Benjamin : récupérer le projet

Le plus simple, **dans Claude Code**, demande‑lui :
> « *Clone le dépôt `https://github.com/artesanos-verdes/crm-artisans-verts` dans mon dossier de travail et ouvre-le.* »

*(En ligne de commande, c'est : `git clone https://github.com/artesanos-verdes/crm-artisans-verts.git`)*

Il aura alors **exactement** le même projet que toi.

---

## ③ Au quotidien — se synchroniser (1 clic)

Deux petits scripts sont dans le dossier (double‑clic) :

| Fichier | Ce qu'il fait |
|---|---|
| **`sync.command`** | **Récupère** la dernière version (les modifs de l'autre). À faire **avant de commencer** à travailler. |
| **`publish.command`** | **Envoie** tes changements à tout le monde. À faire **quand tu as fini**. |

*(Au 1er double‑clic, le Mac peut demander une autorisation : clic droit → **Ouvrir**.)*

Ou encore plus simple : **demande à Claude Code** « *récupère la dernière version* » (pull) / « *publie mes changements* » (push). Il le fait pour toi.

---

## La règle d'or du travail à deux

**Toujours `sync` (récupérer) AVANT de commencer**, et **`publish` (envoyer) APRÈS avoir fini.**
Comme ça personne n'écrase le travail de l'autre, et chacun a toujours la dernière version. 🌿

*(Et côté appli en ligne : les **données** — factures, dossiers… — sont déjà partagées en temps réel via Firebase. Ce guide concerne uniquement le **code** du CRM.)*
