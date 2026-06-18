# CLAUDE.md — CRM Les Artisans Verts

> Brief pour Claude Code. **Lis-le en entier avant toute action.** Il est à jour au 18/06/2026.

## Ce qu'est ce projet

CRM de **gestion / facturation** pour **Les Artisans Verts** (Los Artesanos Verdes SL), société de rénovation énergétique (CEE/CAE : isolation, PAC, déshumidificateurs, LED industriel, vélos cargo). Suivi des **factures** (achats fournisseurs & ventes), du **détail par dossier/chantier et par activité**, un **agent de contrôle des prix** (méthode « AXDIS ») + une **veille tarifaire permanente**, et un **échéancier fournisseurs « à régler »**.

**EN LIGNE** : https://artesanos-verdes.github.io/crm-artisans-verts/ — **multi-postes**, 3 utilisateurs (Jonathan, Naomi, Benjamin), données **partagées en temps réel** (Firebase).

Les 4 activités : **ITE** (isolation ext.), **AGRI** (déshumidificateurs), **AMPLEUR** (rénovation ANAH), **LED** (éclairage indus.). + catégorie **VELO** (vélos cargo AXDIS).

## Stack & principes (à respecter absolument)

- **Fichier unique `index.html`** : tout le HTML + CSS + JS, **vanilla** (aucun framework, aucun bundler, aucune étape de build). ~3150 lignes.
- **Backend Firebase** (compat SDK via CDN gstatic) : **Auth** Email/Password + **Firestore** (1 doc `crm/state`, synchro `onSnapshot` temps réel). Repli **localStorage** + mémoire hors-ligne.
- **Déploiement GitHub Pages** via **GitHub Actions** (`.github/workflows/pages.yml`), org **`artesanos-verdes`** (PAS 770lab). Site statique.
- **UI en français**, ton direct. Palette : papier chaud `--bg:#F7F6F1`, vert forêt `--brand:#234E2C`, rouge `--red`, or `--gold`. Polices IBM Plex Sans / Mono.
- **RÈGLE D'OR : les calculs d'argent restent DÉTERMINISTES et auditables.** L'IA pilote le CRM en langage naturel et **lit** les factures (vision OCR), mais **n'invente JAMAIS un montant**. Aucun chemin d'écriture IA vers un prix/plancher/écart.
- Pas de dépendance surprise. Si une évolution réclame un découpage multi-fichiers ou une base différente, **proposer d'abord**.

## Vérifier AVANT chaque commit (obligatoire)

```bash
# La syntaxe JS de chaque bloc <script> doit passer (il y en a 3) :
node -e "const fs=require('fs'),vm=require('vm');const h=fs.readFileSync('index.html','utf8');const re=/<script>([\s\S]*?)<\/script>/g;let m,i=0,ok=true;while((m=re.exec(h))){i++;try{vm.compileFunction(m[1]);}catch(e){ok=false;console.log('bloc '+i+' KO: '+e.message.split('\n')[0]);}}console.log(ok?i+' blocs JS OK':'KO');"
```
Pour la logique financière (contrôle prix, veille, à régler, datasets), **extraire les fonctions pures et les tester avec `node`** sur des cas connus (ex. l'audit AXDIS doit toujours donner 69 418,83 €). Voir le dossier `../data/` (scripts de build) si présent.

## Déploiement

```bash
git add -A && git commit -m "..." && git push origin main
# GitHub Actions déploie automatiquement (~20-40 s). Vérifier :
gh run list --repo artesanos-verdes/crm-artisans-verts --limit 1
```
Le repo distant est `github.com/artesanos-verdes/crm-artisans-verts`. L'**auto-rechargement** (voir plus bas) fait que les 3 postes prennent la nouvelle version sans Ctrl+Maj+R.

## Modèle de données (objet `state`, sérialisé JSON = schéma Firestore)

```js
state = {
  factures:  [ {id, type:'achat'|'vente', date, tiers, ref, libelle, dossierId,
                categorie, ht, tva, ttc, statut:'paye'|'attente', echeance} ],
  dossiers:  [ {id, nom, client, fiche, zone /* ITE|AGRI|AMPLEUR|LED */, statut, produits, notes} ],
  catalogue: [ {id, fournisseur, ref, libelle, puConvenu, remiseAttendue /* % */} ],   // référentiel tarifaire
  lignes:    [ {id, fournisseur, facture, date, ref, libelle, quantite, puFacture,
                remiseAppliquee, totalHT, source?:'ia', verifie?:false} ],             // lignes à contrôler (veille)
  regles:    [ {id, motCle, type:'interdit', note} ],                                  // mots-clés "ligne indue"
  veilleIgnore: { [stableKey]: {statut:'ignore', ts} },  // exceptions de veille (prix validés "normaux"), SYNCHRONISÉ
  aRegler:   [ {t:tiers, n:num, ttc, ac:acompte, ad:àDevoir, e:engagement, ech, cl:client, z:activité} ]  // échéancier
}
```
Helpers clés : `uid(p)`, `parseNum(str)` (formats FR `1 234,56`), `round2(n)`, `normFacture(f)`, `save()` (→ localStorage + Firestore + veille), `load()`, `renderAll()`, `go(view)`, `toast(msg,type)`, `fmt`/`fmtK` (€), `esc`, `tierColor`. Vues (`go`) : `dashboard`, `factures`, `dossiers`, `controle`, `areregler`, `data`.

## Les 6 onglets

1. **Tableau de bord** (`renderDashboard`) — Achats HT / Ventes HT / **À régler fournisseurs** (si `aRegler` chargé) / Échéances + carte d'alerte veille + factures par activité + top fournisseurs.
2. **Factures** (`renderFactures`) — toutes les factures, **groupées par activité ou par fournisseur** (tri montant/nom), filtres, recherche, ajout, **scan photo/PDF** (`scanFacture`), import/export CSV. Totaux affichés en bas.
3. **Dossiers** (`renderDossiers`) — tableau par activité, colonnes triables (Achats/Ventes HT), recherche.
4. **Contrôle prix** (`renderControle` / moteur `runControle`) — anomalies de facturation + **veille tarifaire** + bouton **📋 Audit AXDIS**. Génère les lettres de réclamation (`genReclamations`).
5. **À régler** (`renderARegler`) — échéancier fournisseurs : **cascade** (brut − acomptes = à devoir − LCR/traites = reste « sec »), par activité/fournisseur, table filtrable.
6. **Données** (`renderData`) — import CSV, sauvegarde/restauration JSON, + boutons d'intégration des datasets (LED, À régler).

## Le moteur de contrôle des prix (déterministe — NE JAMAIS remplacer par de l'IA)

`runControle()` parcourt `state.lignes` (mémoïsé via `ctrlStamp`), rapproche du `catalogue` (`matchCatalogue`, par fournisseur+réf) et renvoie des anomalies typées : **Doublon** (vérifié en 1er) · **Ligne indue** (mot-clé règle) · **Dépassement / Remise non appliquée / Tarif+remise** (net unitaire facturé vs convenu) · **Hors catalogue** · **Incohérence de calcul**. Une seule ligne d'écart par anomalie (**zéro double comptage**). `controleSummary` agrège récupérable (`haute`) / à vérifier (`moyenne`).

### Veille tarifaire (déterministe, auto-apprenante)
`buildReferentielAuto(lignes)` apprend, par (fournisseur, réf), le **plancher** = plus bas prix net réellement payé, **robuste** (rejette les valeurs < médiane×0,5 = avoirs/erreurs ; plancher = prix vu ≥2× sinon P10 ; `MIN_OBS=3` ; marque « ambigüe » si spread>3). `autoEcart()` est appelé **uniquement dans la branche `else` (hors catalogue)** de `runControle` → tout écart vs plancher est classé **`moyenne` (« à vérifier »), JAMAIS `haute`** (une hausse légitime ressemble à une erreur). Alertes proactives : `scheduleVeille()` (débouncé, hooké dans `save()`), cloche `#bellBtn`, carte `renderAlertCard()`, inbox `openAlertInbox()`. État « vu » LOCAL (`localStorage 'lav_veille_seen'`) ; exceptions « ignore » dans `state.veilleIgnore` (synchronisé).

## Datasets embarqués + boutons d'intégration

Trois jeux de données réels sont **embarqués comme constantes** + chargés via un bouton (remplacement propre, synchronisé) :
- `AXDIS_AUDIT` + `loadAxdisAudit()` — audit de réclamation des avoirs AXDIS : **69 418,83 € HT** (18 réf + 21 lignes). Bouton dans **Contrôle prix**.
- `LED_DATASET` + `loadLedFactures()` — détail factures LED : **302 factures / 600 191,99 € HT**. Remplace l'activité LED (purge zone LED + préfixes `f_led_`/`d_led_`, ITE/AGRI/AMPLEUR intacts). Bouton dans **Données**.
- `PAYABLES_DATASET` + `loadARegler()` — échéancier « à régler » : **262 factures, à devoir 2 537 506,03 € / reste sec 2 214 721,38 €**. Remplit `state.aRegler`. Bouton dans **Données**.

⚠️ **Construction des datasets** : les sources sont des **Google Sheets multi-onglets**. **TOUJOURS parser le xlsx via openpyxl en ciblant l'onglet voulu**, JAMAIS la lecture Markdown globale du connecteur Drive (elle concatène TOUS les onglets, y compris les « Détail-fournisseur » qui dupliquent → totaux gonflés — bug réel survenu sur le LED). Scripts de build dans `../data/` (hors repo) : `build_state.py`, `led_dataset.js`, `payables_dataset.js`, etc.

## Firebase, migration & auto-rechargement

- **Config** : `FIREBASE_CONFIG` (projet `crm-gestion-compta-lav`). L'apiKey web n'est PAS secrète (la sécurité vient des règles Firestore + Auth). Mode **hybride** : si `apiKey==='REMPLACER'` → login local souple (sert à tester en local, cf. `crm-artisans-verts-LOCAL.html`).
- **Migration données** : `const DATA_VERSION`. Au snapshot, si `doc._dataVersion !== DATA_VERSION`, l'app remplace le cloud par `EMBEDDED_STATE` (si présent) — une fois. Les champs additifs (`veilleIgnore`, `aRegler`) sont migrés en douceur dans `load`/`fbApplyRemote`/`fbPushDoc`/`fbPushState`/`resetAll` **sans** bumper `DATA_VERSION`.
- **Auto-rechargement** (`checkUpdate`) : compare l'**ETag** de `index.html` (fetch no-store) à celui mesuré au chargement ; si une nouvelle version est déployée → bannière + `location.reload()` automatique **dès que l'écran est au repos** (pas de modale/saisie en cours). Plus besoin de Ctrl+Maj+R. + meta `no-cache`.

## Assistant IA + scan de facture (proxy)

Bouton ✨ : l'utilisateur écrit en français, le modèle (`claude-sonnet-4-6`) renvoie un JSON `{reply, actions}` exécuté par `aiApply()` (actions : `creer_dossier`, `creer_facture`, `ajouter_reference`, `ajouter_ligne`, `ajouter_regle`, `lancer_controle`, `generer_reclamations`, `naviguer`). **Scan** : `aiExtractFacture(file)` lit en-tête **+ détail des lignes** (l'IA recopie ce qui est imprimé ; si un total n'est pas lisible, `totalHT=''` et le moteur recalcule). Les lignes scannées (`importExtractedLignes`, `source:'ia'`) entrent dans la veille. **Appel** via **proxy Cloudflare Worker** (`proxy/`, garde la clé API côté serveur ; URL collée dans ⚙️ de l'assistant, stockée par navigateur). Bouton **💡 Suggérer une amélioration** (menu ⋮) : génère un prompt prêt à coller dans Claude Code.

## Tâches courantes

- Modifier l'affichage → CSS dans le `<style>` de `index.html` (déjà une grosse passe UX : `.kpi`, tables aérées, responsive). Garder la cohérence visuelle.
- Améliorer la détection des prix → modifier `runControle`/`buildReferentielAuto`, garder **déterministe** + **zéro double comptage**, revalider en `node` (AXDIS = 69 418,83 €).
- Ajouter/corriger un dataset → reparser le xlsx (openpyxl, onglet ciblé), régénérer la constante, remplacer dans `index.html`, revalider le total en `node`.
- Toujours : valider la syntaxe JS, déployer (`git push`), confirmer le run GitHub Actions.

## Garde-fous

- Single-file vanilla ; pas de dépendances surprises ; calculs d'argent déterministes & auditables.
- Ne jamais committer de clé API (`.gitignore`). La clé de l'assistant vit côté proxy/navigateur.
- Avant de remplacer un dataset/des données : vérifier le **total** contre la source (xlsx), pas l'OCR d'un PDF.
