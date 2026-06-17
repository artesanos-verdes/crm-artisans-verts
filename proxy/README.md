# Proxy API — Assistant du CRM

Petit Cloudflare Worker (gratuit) qui relaie les appels de l'Assistant vers l'API Anthropic en gardant la clé **côté serveur**. À utiliser en production (site GitHub Pages public) plutôt que de coller la clé dans le navigateur.

## Déployer

```bash
cd proxy
npm i -g wrangler          # si besoin
wrangler login
wrangler secret put ANTHROPIC_API_KEY   # colle ta clé sk-ant-...
wrangler deploy
```

`wrangler deploy` affiche une URL du type `https://lav-crm-proxy.<compte>.workers.dev`.
Colle-la dans les réglages ⚙️ de l'Assistant (champ « URL du proxy »).

## Sécuriser

Dans `worker.js`, remplace `const ORIGIN = '*'` par le domaine de ton site, ex. `https://770lab.github.io`, pour que seul ton CRM puisse appeler le proxy.

## Alternative sans proxy

En usage strictement personnel sur ta machine, tu peux à la place coller ta clé Anthropic directement dans ⚙️ (elle reste dans le `localStorage` de ton navigateur, jamais dans le dépôt). Le proxy reste préférable dès que le site est public ou partagé.
