# 🌿 CRM Les Artisans Verts

CRM de **gestion / facturation** (CEE/CAE) en **fichier unique** `index.html` — vanilla JS, **backend Firebase** (multi-postes temps réel), déployé sur GitHub Pages.

**🔗 En ligne :** https://artesanos-verdes.github.io/crm-artisans-verts/
**👥 3 comptes** (Jonathan, Naomi, Benjamin) — données partagées en temps réel.

## Fonctionnalités

- **Factures** achats/ventes par activité (ITE · AGRI · AMPLEUR · LED), filtres, recherche, **scan photo/PDF**, import/export CSV.
- **Dossiers** : tableau par activité (Achats/Ventes HT).
- **Contrôle prix** : agent anti-erreurs (méthode AXDIS) + **veille tarifaire permanente** + lettres de réclamation. Audit AXDIS embarqué (**69 418,83 €** à réclamer).
- **À régler** : échéancier fournisseurs (acomptes / LCR / traites isolés, cascade jusqu'au reste « sec »).
- **Tableau de bord**, **assistant IA** (✨, actions en français + lecture de factures), **alertes** (🔔).

## Démarrer en local

Pas de build. Le fichier déployé utilise Firebase ; pour tester en local sans Firebase, ouvre **`crm-artisans-verts-LOCAL.html`** (login souple, données d'exemple) ou sers le dossier :

```bash
python3 -m http.server 8080   # http://localhost:8080
```

## Modifier & déployer

Tout est dans **`index.html`**. Après modif :

```bash
# 1) valider la syntaxe JS (3 blocs <script>)
node -e "const fs=require('fs'),vm=require('vm');const h=fs.readFileSync('index.html','utf8');const re=/<script>([\s\S]*?)<\/script>/g;let m,i=0,ok=true;while((m=re.exec(h))){i++;try{vm.compileFunction(m[1]);}catch(e){ok=false;console.log('bloc '+i+' KO');}}console.log(ok?i+' blocs OK':'KO');"
# 2) déployer
git add -A && git commit -m "ma modif" && git push origin main
# GitHub Actions déploie tout seul (~30 s). Les 3 postes se rechargent automatiquement.
```

## Tester le contrôle des prix en 30 s

Onglet **Contrôle prix** → **📋 Audit AXDIS** (charge l'analyse de réclamation, 69 418,83 €) → **Générer les réclamations**. Ou importe `exemples/referentiel-exemple.csv` + `exemples/lignes-exemple.csv`.

## Assistant IA — configuration

Site déployé : ouvre ⚙️ dans le panneau de l'assistant et colle l'URL du **proxy Cloudflare** (voir `proxy/`, garde la clé API côté serveur). Ne mets jamais de clé dans le code.

## Pour développer avec Claude Code

👉 **[PARTAGE.md](PARTAGE.md)** — travailler à plusieurs / synchroniser Jonathan ↔ Benjamin.
👉 **[HANDOFF.md](HANDOFF.md)** — prise en main (pour Benjamin).
👉 **[CLAUDE.md](CLAUDE.md)** — brief technique complet (architecture, modèle de données, veille, datasets, Firebase, garde-fous).

> ⚠️ **Règle d'or** : les calculs d'argent restent **déterministes** (jamais l'IA pour produire un montant). L'IA lit/explique, le code calcule.
