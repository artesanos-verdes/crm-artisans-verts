/**
 * Proxy API pour l'Assistant du CRM (production GitHub Pages).
 * La clé Anthropic reste côté serveur (secret Cloudflare), jamais dans le navigateur.
 *
 * Déploiement :
 *   cd proxy
 *   npm i -g wrangler            # si besoin
 *   wrangler login
 *   wrangler secret put ANTHROPIC_API_KEY   # colle ta clé sk-ant-...
 *   wrangler deploy
 * Puis colle l'URL du Worker dans les réglages ⚙️ de l'Assistant.
 */
export default {
  async fetch(request, env) {
    // Origine autorisée = le domaine du CRM déployé (sécurité).
    const ORIGIN = 'https://artesanos-verdes.github.io';
    const cors = {
      'Access-Control-Allow-Origin': ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY manquante (wrangler secret put ANTHROPIC_API_KEY)' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const body = await request.text();
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body,
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  },
};
