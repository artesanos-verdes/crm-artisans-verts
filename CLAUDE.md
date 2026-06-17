# CLAUDE.md — CRM Les Artisans Verts

> Ce fichier briefe Claude Code sur le projet. Lis-le en entier avant toute action.

## Ce qu'est ce projet

CRM de **comptabilité de gestion** pour **Les Artisans Verts** (Los Artesanos Verdes SL), société franco-espagnole de rénovation énergétique (CEE/CAE, isolation des combles, PAC). Le CRM suit les **factures** (achats fournisseurs / ventes au délégataire), la **marge par dossier/chantier**, et embarque un **agent de contrôle des prix** qui détecte les erreurs de facturation des fournisseurs et prestataires (méthode dite « AXDIS »).

Contexte métier utile :
- Fiches CEE en cours : **RES022** (remplace RES020 pour l'isolation combles zones C/D/E, formule forfaitaire VAUZ), BAT-TH-126, BAT-TH-116, IND-BA-117, etc.
- Partenaires : **GreenFlex** (délégataire), **Renovantis** (commercial, partage de marge 50/50), **AXDIS** (fournisseur matériel — c'est sur ses factures qu'a été menée l'analyse de référence : ~69 400 € HT d'écarts sur 146 factures / 200 lignes, en 3 familles : tarifs convenus non respectés, lignes facturées à tort « vélo cargo », remises Daikin/Thaleos non appliquées).
- L'agent de contrôle reproduit exactement cette logique, en permanence.

## Stack & principes (à respecter absolument)

- **Fichier unique `index.html`** : tout le HTML + CSS + JS dans un seul fichier, **vanilla** (aucun framework, aucune dépendance, aucune étape de build).
- **Persistance `localStorage`** (clé `lav_compta_v1`), avec repli en mémoire si indisponible.
- **Déploiement GitHub Pages** (org `770lab`), site statique. Aucun backend requis pour le CRM lui-même.
- **UI en français**, ton direct.
- **Pas de framework, pas de bundler, pas de `node_modules`** sauf demande explicite. Si une évolution réclame vraiment un découpage multi-fichiers ou une base de données, **proposer d'abord**, ne pas l'imposer.
- Palette : papier chaud, vert forêt `--brand:#234E2C`. Polices IBM Plex Sans / IBM Plex Mono (chargées via Google Fonts).

## Carte du dépôt

```
crm-artisans-verts/
├── index.html              ← LE CRM (tout est ici : ~1800 lignes)
├── CLAUDE.md               ← ce fichier
├── README.md               ← démarrage humain
├── .gitignore
├── proxy/                  ← proxy API optionnel (Cloudflare Worker) pour l'Assistant en prod
│   ├── worker.js
│   ├── wrangler.toml
│   └── README.md
├── exemples/               ← CSV de test pour le contrôle des prix
│   ├── lignes-exemple.csv
│   └── referentiel-exemple.csv
└── .github/workflows/
    └── pages.yml           ← déploiement GitHub Pages auto (optionnel)
```

## Modèle de données (objet `state`, sérialisé en JSON)

```js
state = {
  factures:  [ {id, type:'achat'|'vente', date, tiers, ref, libelle, dossierId,
                categorie, ht, tva, ttc, statut:'paye'|'attente', echeance} ],
  dossiers:  [ {id, nom, client, fiche, zone, statut:'En cours'|'Terminé'|'En attente'|'Annulé',
                produits /* number ou '' */, notes} ],
  catalogue: [ {id, fournisseur, ref, libelle, puConvenu, remiseAttendue /* % */} ],  // référentiel tarifaire
  lignes:    [ {id, fournisseur, facture, date, ref, libelle, quantite, puFacture,
                remiseAppliquee /* % */, totalHT /* number ou '' */} ],               // lignes à contrôler
  regles:    [ {id, motCle, type:'interdit', note} ]                                   // mots-clés "ligne indue"
}
```

Helpers globaux clés : `uid(prefix)`, `todayISO()`, `parseNum(str)` (formats FR : `1 234,56`), `round2(n)`, `normFacture(f)` (calcule ht/ttc/tva), `save()`, `load()`, `renderAll()`, `go(view)`, `toast(msg,type)`. Onglets (`view`) : `dashboard`, `factures`, `dossiers`, `controle`, `data`.

## Le moteur de contrôle des prix (déterministe — NE PAS remplacer par de l'IA)

`runControle()` parcourt `state.lignes`, rapproche chaque ligne du `catalogue` (`matchCatalogue`) et renvoie des anomalies typées :
- **Doublon** (vérifié en premier, la ligne entière est contestée, écart = total ; on ne cumule aucun autre écart sur une ligne en doublon).
- **Ligne indue** : le libellé contient un mot-clé d'une règle `interdit` (ex. « vélo cargo ») → écart = total.
- **Dépassement de tarif** / **Remise non appliquée** / **Tarif + remise** : comparaison du *prix net unitaire* facturé vs convenu (`puConvenu × (1 − remiseAttendue/100)`), écart = diff × quantité. Une seule ligne d'écart par anomalie (pas de double comptage).
- **Hors catalogue** (à vérifier, 0 €), **Incohérence de calcul** (qté×PU−remise ≠ total, à vérifier).

Sévérité `haute` = récupérable (chiffré) ; `moyenne` = à vérifier. `controleSummary()` agrège récupérable / à vérifier / par motif / par fournisseur. `genReclamations()` produit une lettre LRAR déterministe par fournisseur (copiable / `.txt`).

**Règle d'or : les calculs financiers restent déterministes.** L'IA sert à piloter le CRM en langage naturel, jamais à inventer des montants.

## Assistant IA intégré (« demander des actions depuis l'intérieur »)

Bouton flottant en bas à droite → panneau de chat. L'utilisateur écrit en français ; le modèle (`claude-sonnet-4-6`) renvoie **strictement** un JSON `{"reply":"...","actions":[...]}` que `aiApply()` exécute sur `state`. Actions : `creer_dossier`, `creer_facture`, `ajouter_reference`, `ajouter_ligne`, `ajouter_regle`, `lancer_controle`, `generer_reclamations`, `naviguer`. Le prompt système et la liste d'actions sont dans `index.html` (constante `AI_SYSTEM`). À chaque tour, un instantané de l'état (`aiSnapshot()`) est envoyé pour que l'Assistant réponde aussi aux questions.

**Trois modes d'appel** (fonction `aiCfg()` / réglages ⚙️ du panneau) :
1. **Préversion claude.ai** — appel sans clé à `api.anthropic.com` (le bac à sable injecte l'auth). Marche dans l'aperçu d'artefact, **pas** en prod.
2. **Clé Anthropic locale** — l'utilisateur colle sa clé (header `anthropic-dangerous-direct-browser-access`). Stockée dans son navigateur, jamais dans le code.
3. **Proxy** (recommandé en prod) — l'URL d'un Cloudflare Worker (`proxy/`) qui garde la clé côté serveur.

Si tu modifies les actions, garde le contrat JSON et le prompt `AI_SYSTEM` synchronisés avec `aiApply()`.

## Lancer en local

Pas de build. Soit ouvrir `index.html` dans le navigateur, soit servir le dossier :
```bash
python3 -m http.server 8080
# puis http://localhost:8080
```

## Vérifier avant commit

La syntaxe JS du fichier unique doit toujours passer :
```bash
node -e "const h=require('fs').readFileSync('index.html','utf8');const m=h.match(/<script>([\s\S]*)<\/script>/);require('vm').compileFunction(m[1]);console.log('JS OK')"
```

## Déploiement GitHub Pages

```bash
git init && git add -A && git commit -m "CRM Les Artisans Verts"
git branch -M main
git remote add origin git@github.com:770lab/crm-artisans-verts.git
git push -u origin main
```
Puis Settings → Pages → Source = branche `main` (racine). URL : `https://770lab.github.io/crm-artisans-verts/`.
Le workflow `.github/workflows/pages.yml` automatise ce déploiement à chaque push si tu préfères l'activer (Settings → Pages → Source = GitHub Actions).

## Proxy pour l'Assistant (optionnel, prod)

Voir `proxy/README.md`. En résumé : `cd proxy`, `wrangler secret put ANTHROPIC_API_KEY`, `wrangler deploy`, puis coller l'URL du Worker dans les réglages ⚙️ de l'Assistant. Pense à restreindre l'origine CORS au domaine du site dans `worker.js`.

## Tâches courantes (exemples de demandes)

- « Ajoute un onglet d'export PDF des dossiers » → rester en vanilla (lib PDF via CDN seulement, pas de bundler).
- « Importe ce CSV de factures de vente » → utiliser l'import CSV existant (mapping de colonnes, formats FR).
- « Branche le CRM sur Firebase pour multi-postes » → **proposer un plan d'abord** : `state` (ce schéma JSON) devient directement le schéma Firestore, la migration est mécanique. Ne pas casser le mode localStorage hors-ligne.
- « Améliore la détection des prix » → modifier `runControle`, garder la logique **déterministe** et **sans double comptage**, revalider avec les CSV d'`exemples/`.

## Garde-fous

- Single-file vanilla par défaut ; pas de dépendances surprises.
- Les calculs d'argent restent déterministes et auditables.
- Ne jamais committer de clé API (voir `.gitignore`). La clé de l'Assistant vit côté navigateur ou côté proxy, pas dans le repo.
