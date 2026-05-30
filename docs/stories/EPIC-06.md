# EPIC-06 — Multilingue

> **Objectif** : Permettre la navigation et l'usage du site et des emails en français, néerlandais et anglais.
> **Stories** : 3 (S-31 à S-33)

---

## Périmètre

### In scope
- i18n côté frontend (interface, labels, messages).
- Traduction des contenus éditoriaux (artistes, pages CMS, emails).
- Switcher de langue.
- Routing localisé `/fr/...`, `/nl/...`, `/en/...` via le flag `I18N_ROUTING`.
- Templates emails multilingues.

### Out of scope
- Traduction automatique (V2 si volonté business).
- Plus de 3 langues (V2).
- Localisation devise (toujours EUR en V1).

## Dépendances

- Toutes les autres epics consomment cette infrastructure.
- [EPIC-05 S-22](EPIC-05.md) : édition des contenus traduits via le back-office.

## Choix techniques

- **Frontend** : `react-i18next` + namespaces séparés (`common`, `home`, `booking`, etc. selon besoin).
- **Backend** : champs traduits stockés dans des colonnes `*_fr`, `*_nl`, `*_en` (déjà esquissé sur `artists`). Sélection au moment du SELECT selon `lang`. Helpers `pickLocalized(row, lang, fallbacks: ['en','fr'])`.
- **Locales supportées** : enum centralisé.
  ```ts
  export enum AppLocale { FR = "fr", NL = "nl", EN = "en" }
  export const SUPPORTED_LOCALES = [AppLocale.FR, AppLocale.NL, AppLocale.EN] as const;
  export const DEFAULT_LOCALE = AppLocale.FR;
  ```

---

## S-31 — Navigation multilingue

**En tant que** Visiteur, **je veux** naviguer sur le site en français, néerlandais ou anglais, **afin de** comprendre l'offre dans ma langue.

**Estimation** : L

### Critères d'acceptation
- **Given** un visiteur arrive sur `/`, **when** le serveur reçoit la requête, **then** il détecte la langue préférée via `Accept-Language` parmi celles supportées, sinon `fr` par défaut, puis redirige vers `/fr/`.
- **Given** un visiteur clique sur le sélecteur de langue, **when** il choisit "Nederlands", **then** l'URL passe à `/nl/<même-chemin>` et l'UI se rafraîchit instantanément.
- **Given** une URL sans préfixe langue (e.g. `/artists`) est accédée, **when** servie, **then** redirection 301 vers `/fr/artists` (ou langue détectée).
- **Given** un préfixe inconnu (e.g. `/de/...`), **when** accédé, **then** 404.
- **Given** le visiteur change de langue, **when** le choix est fait, **then** la préférence est mémorisée en `localStorage` (`Gazmatek.locale`) pour les visites suivantes (override du `Accept-Language`).
- **Given** une langue mémorisée, **when** le visiteur revient sur `/`, **then** redirection vers son `localStorage` plutôt que `Accept-Language`.

### Spécifications techniques

**Frontend** :
- `I18N_ROUTING = true` dans `src/config/site.ts`.
- Initialisation `i18next` dans `src/i18n/index.ts` avec `i18next-browser-languagedetector` + fallback.
- Routeur `I18nRouter` déjà prévu (cf. frontend/AGENTS.md).
- Composant `LanguageSwitcher` accessible (`<select>` ou menu).
- Toutes les routes app passent par `src/config/pages.ts` (helper `localizedPath(path, locale)`).

**Backend** :
- Lecture du header `Accept-Language` côté middleware applicatif → injection dans `req.locale`.
- API : tous les endpoints publics acceptent un query param `lang` qui override `req.locale`.

### Dépendances inter-stories
- S-32 (contenu effectivement traduit).
- S-33 (back-office pour saisir les traductions).

### Edge cases & risques
- SEO : hreflang à émettre dans `SeoHead` (`<link rel="alternate" hreflang="fr" href="...">` pour chaque langue + `x-default`).
- Sitemap : générer une entrée par URL × par langue.
- Redirections en boucle si mauvaise détection : ne JAMAIS rediriger depuis une URL déjà préfixée.

### DoD
- Test : navigation 3 langues, switcher fonctionnel.
- hreflang présent sur toutes les pages publiques.
- Lighthouse SEO ≥ 95.

---

## S-32 — Contenus traduits (textes, labels, emails)

**En tant que** Visiteur, **je veux** voir le contenu (textes, labels, emails) traduit dans la langue choisie, **afin de** une expérience cohérente de bout en bout.

**Estimation** : L

### Critères d'acceptation
- **Given** la langue active = `nl`, **when** n'importe quelle page publique est rendue, **then** 100% des labels d'interface sont en NL (aucune chaîne FR/EN hardcodée).
- **Given** une bio artiste n'a pas de version `nl`, **when** affichée, **then** fallback automatique sur `en`, puis `fr` (avec un petit indicateur "EN" optionnel pour signaler).
- **Given** un email transactionnel, **when** envoyé, **then** la langue choisie au moment de la demande est celle utilisée (snapshot dans le booking : `booking.client_locale`).
- **Given** des messages d'erreur backend, **when** retournés au frontend, **then** ils utilisent des codes (`ERR_BOOKING_DATE_PAST`) et la traduction se fait côté frontend (i18n des erreurs).
- **Given** `npm run lint` est exécuté, **when** une chaîne FR hardcodée est détectée par une règle ESLint custom (`no-literal-strings` configurée), **then** le linter échoue.

### Spécifications techniques

**Frontend** :
- Fichiers : `src/i18n/locales/{fr,nl,en}.json` (3 fichiers — actuellement EN + FR, ajouter NL).
- Tous les fichiers DOIVENT contenir exactement les mêmes clés.
- Script `scripts/check-i18n-parity.ts` ajouté à `npm run lint` pour vérifier la parité.

**Backend** :
- Emails : `src/services/mailer/templates/<template>/{fr,nl,en}.html` (+ `.txt`).
- Constantes d'erreurs : `src/helpers/error/errorCodes.ts` avec mapping code → message non traduit (le code suffit côté API).
- Champs traduits DB : pour chaque entité éditable, colonnes `_fr`, `_nl`, `_en`.

### Dépendances
- S-31 (mécanisme de routing).
- S-33 (saisie back-office).

### Edge cases & risques
- Pluralisation : utiliser la syntaxe i18next `_one`, `_other`.
- Formatage dates / nombres : `Intl.DateTimeFormat` / `Intl.NumberFormat` avec la locale active.
- Format adresses : pas de localisation V1 (toujours format BE).

### DoD
- Test parité des clés i18n (script CI).
- Test : email de confirmation existe dans 3 langues.
- Aucun warning console "missing translation key" en environnement test.

---

## S-33 — Gérer les contenus éditoriaux dans les trois langues depuis le back-office

**En tant que** Admin, **je veux** gérer les contenus éditoriaux dans les trois langues depuis le back-office, **afin de** mettre à jour les textes sans déployer.

**Estimation** : M

### Critères d'acceptation
- **Given** l'admin édite un artiste, **when** le formulaire est ouvert, **then** chaque champ traduisible présente 3 onglets/inputs (FR, NL, EN).
- **Given** une bio FR remplie mais EN vide, **when** sauvegardée, **then** la sauvegarde réussit mais un avertissement visuel (icône warning) indique qu'EN manque.
- **Given** un admin va sur `/admin/content`, **when** la page charge, **then** il peut éditer les blocs de contenu CMS (page d'accueil, services, footer) en 3 langues.
- **Given** un changement de contenu, **when** sauvegardé, **then** un audit log est créé (`actor=admin`, `target=content_block`).

### Spécifications techniques

**Backend** :
- Table `content_blocks` :
  ```sql
  CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,    -- 'home.hero.title', 'footer.legal', etc.
    value_fr TEXT,
    value_nl TEXT,
    value_en TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- Routes admin :
  - `GET /api/admin/content`
  - `PUT /api/admin/content/:key`
- Route publique : `GET /api/content?lang=` (cache HTTP `Cache-Control: public, max-age=300`).

**Frontend** :
- Composant `LocalizedField` réutilisable avec 3 inputs.
- Page : `src/pages/AdminContent/AdminContent.tsx`.
- Sur le site public, les blocs CMS sont chargés au boot et fusionnés dans les fichiers i18n statiques (priorité : DB > fichier).

### Dépendances
- S-22 (CRUD artistes étendu à champs i18n).
- S-31, S-32.

### Edge cases & risques
- Cache invalidation : sur PUT, invalider le cache HTTP via tag `content`.
- Conflit de modification concurrente : V1 = last-write-wins, V2 = `updated_at` lock optimiste.
- Migrations de clés CMS : ne JAMAIS supprimer une clé sans plan de retrait.

### DoD
- Test : admin édite un bloc, public voit la nouvelle valeur après TTL (ou invalidation).
- Audit log écrit.
- UX : indicateur visuel des langues incomplètes par champ.
