# CRM Les Artisans Verts

CRM de comptabilité de gestion (CEE/CAE) en **fichier unique** `index.html` — vanilla JS, `localStorage`, déployable sur GitHub Pages. Suivi des factures, marge par dossier, et **agent de contrôle des prix** (détection des erreurs de facturation fournisseurs/prestataires, méthode AXDIS) avec génération de lettres de réclamation.

Embarque aussi un **Assistant IA** (bouton en bas à droite) : tu lui demandes des actions en français (« crée un dossier… », « ajoute une facture d'achat AXDIS… », « combien je récupère chez AXDIS ? ») et il agit directement sur le CRM.

## Démarrer

Ouvre `index.html` dans ton navigateur, ou sers le dossier :

```bash
python3 -m http.server 8080   # http://localhost:8080
```

## Onglets

- **Tableau de bord** — vue d'ensemble (CA, charges, marge, à encaisser).
- **Factures** — achats/ventes, statuts, filtres, recherche, import/export CSV.
- **Dossiers** — marge par chantier (produits − charges).
- **Contrôle prix** — l'agent : référentiel tarifaire + lignes de facture → anomalies chiffrées + réclamations. Teste-le avec les fichiers d'`exemples/`.
- **Données** — import CSV, sauvegarde/restauration JSON, réinitialisation.

## Tester le contrôle des prix en 30 s

Onglet **Contrôle prix** → *Importer CSV* (référentiel) → `exemples/referentiel-exemple.csv`, puis *Importer des lignes* → `exemples/lignes-exemple.csv`. L'agent détecte alors un dépassement de tarif, une remise Daikin non appliquée et une ligne « vélo cargo » facturée à tort.

## Assistant IA — configuration

- **Aperçu claude.ai** : rien à faire, ça marche.
- **Site déployé** : ouvre ⚙️ dans le panneau de l'Assistant et renseigne soit l'URL d'un proxy (voir `proxy/`, recommandé), soit ta clé Anthropic (elle reste dans ton navigateur). Ne mets jamais de clé dans le code.

## Déploiement (GitHub Pages)

```bash
git init && git add -A && git commit -m "CRM Les Artisans Verts"
git branch -M main
git remote add origin git@github.com:770lab/crm-artisans-verts.git
git push -u origin main
```

Settings → Pages → branche `main`. URL : `https://770lab.github.io/crm-artisans-verts/`.

## Travailler avec Claude Code

`CLAUDE.md` contient tout le contexte (modèle de données, moteur de contrôle, conventions). Ouvre ce dossier dans Claude Code et demande tes évolutions ; il sait déjà comment le projet est fait.
