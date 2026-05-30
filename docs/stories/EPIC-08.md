# EPIC-08 — Itération 1 : refinements UX, layouts & admin FR

> **Objectif** : Consolider l'expérience après le premier passage de revue. Layouts partagés, page d'accueil enrichie, fiche artiste resserrée, simulateur pré-remplissable par URL, calendriers s'appuyant sur une vraie librairie, back-office entièrement en français avec DynamicTable et création de booking côté admin, espace client, onboarding artiste complet (invitation + register + contrat signé), animations GSAP partout sur le public.
> **Stories** : 16 (S-37 à S-52)
>
> **Vision UX** : expérience "au petit oignon" — chaque transition, chaque hover, chaque arrivée d'élément à l'écran est intentionnel. Pas d'animation gratuite, pas de page statique froide non plus.

---

## Périmètre

### In scope
- Centralisation des routes API frontend dans `src/config/apiRoutes.ts` (pattern `event-planner`).
- Layout partagé `PublicLayout` (pages : `/`, `/artists`, `/artists/:slug`, `/pricing`, `/contact`) avec navbar publique.
- Layout partagé `AdminLayout` avec navbar admin distincte, background différent du contenu.
- Page d'accueil enrichie : hero, services, artistes en vedette, "Notre histoire", simulateur intégré, témoignages / preuves sociales, FAQ courte, CTA final.
- Fiche artiste : suppression de l'affichage "à partir de XX €/heure".
- Calendrier dispo : remplacement de l'implémentation maison par une librairie dédiée (FullCalendar / react-big-calendar / Cal.com Calendar).
- CTA "Estimer mon budget" depuis la fiche artiste → redirige vers `/pricing?artiste=<slug>` (URL paramétrée, partageable).
- Admin entièrement en FR : libellés, dropdowns, messages.
- Tables admin (`/admin/artists`, `/admin/bookings`) basées sur `DynamicTable` de `covaltech-react-ui`.
- Création / édition d'artiste avec upload d'image et description riche.
- Création manuelle d'un booking par l'admin.
- Animations GSAP sur l'ensemble de la partie publique (catalogue de patterns).
- Espace client : auth par magic link, historique des bookings (à venir / passés) avec statuts détaillés.
- Espace artiste : édition de ses propres infos profil, agenda, photos.
- Onboarding artiste par invitation : lien personnel unique envoyé par l'agence, register, signature du contrat d'engagement, activation.
- Contrat d'engagement artiste-agence signé électroniquement à l'inscription (distinct du contrat par booking S-20).

### Out of scope (explicitement retiré)
- Édition du footer légal via le CMS admin. Le footer légal reste **codé en dur** (i18n statique `en.json` / `fr.json` / `nl.json`) — modifiable uniquement par déploiement. Mise à jour de [EPIC-06 S-33](EPIC-06.md) pour retirer ce contenu de `content_blocks`.

## Dépendances

- [EPIC-01](EPIC-01.md), [EPIC-02](EPIC-02.md), [EPIC-05](EPIC-05.md) : tunings de stories existantes.
- [EPIC-06 S-33](EPIC-06.md) : retrait du footer du périmètre éditorial.
- Référence layout : repo `event-planner` (à consulter pour pattern `<Layout>` + `<Outlet>`).

## Règles visuelles transverses (s'appliquent à toutes les stories de cet epic)

### Typographie — usage strict des fonts déclarées dans `frontend/src/index.scss`

Les seules font-families autorisées sont celles déjà déclarées dans `index.scss` :

| Font-family | Usage |
|---|---|
| `Anton` | Display secondaire, sous-titres marquants, gros chiffres (compteurs "Notre histoire", prix mis en avant). Couverture complète Latin + accents + chiffres. |
| `DAMAGEPLAN` | À utiliser **uniquement** pour du texte hardcoded Latin de base **sans accents ni chiffres** (logo, mot-clé hero court). Pas pour du contenu utilisateur ni i18n. |
| `GazmatekRawDisplay` | Display hybride sûr : DAMAGEPLAN pour les lettres A–Z, repli automatique sur Anton pour chiffres, accents et ponctuation. **À privilégier** pour tout titre display traduit ou contenant des chiffres. |
| `$default-font-family` | Texte courant (paragraphes, formulaires, navbar, footer, boutons standards). Référencée via la variable SCSS, jamais en littéral. |

**Règles d'application** :
- **Aucune nouvelle déclaration `@font-face`** dans cette itération. Pas de Google Fonts, pas de CDN externe, pas d'import sans validation produit.
- Les titres "display" des nouvelles sections (hero, "Notre histoire", FAQ, simulateur, navbar) **doivent** utiliser `GazmatekRawDisplay` ou `Anton`, jamais une font système ad hoc.
- Le texte courant utilise toujours `$default-font-family` via la variable, jamais une chaîne en dur (`font-family: 'Inter'` interdit).
- L'admin et l'artiste utilisent les mêmes fonts que le public (pas de divergence).
- Si un cas d'usage nécessite vraiment une nouvelle font, ouvrir une RFC séparée — ce n'est pas dans le périmètre de l'itération 1.

Vérification : grep `font-family` dans tous les fichiers `.scss` modifiés par l'itération → seules valeurs autorisées : `Anton`, `DAMAGEPLAN`, `GazmatekRawDisplay`, `$default-font-family` (ou variable dérivée déjà déclarée).

---

## S-37 — Layouts partagés PublicLayout & AdminLayout

**En tant que** Système / Développeur, **je veux** factoriser la navbar, le footer et le padding-top dans des layouts dédiés `PublicLayout` et `AdminLayout`, **afin de** garantir une cohérence visuelle et un seul point de modification par contexte.

**Estimation** : M

### Contexte & enjeux
Actuellement chaque page gère son propre wrap. Risque de divergence (padding différent, navbar dupliquée). Le repo event-planner suit déjà ce pattern (`<PublicLayout>` → `<Navbar>` + `<Outlet>` + `<Footer>`).

### Critères d'acceptation
- **Given** un visiteur va sur `/`, `/artists`, `/artists/:slug`, `/pricing` ou `/contact`, **when** la page est rendue, **then** elle est encapsulée dans `<PublicLayout>` qui fournit : navbar publique, footer public, padding-top ≥ `$padding-xl` (40px) sur tablette/desktop, `$padding-lg` (30px) sur mobile, container max-width centré.
- **Given** un admin va sur `/admin/*`, **when** la page est rendue, **then** elle est encapsulée dans `<AdminLayout>` qui fournit : navbar admin (logo + nav admin + user menu + déconnexion), padding-top adapté, fond de page distinct du fond de la navbar.
- **Given** la navbar admin, **when** rendue, **then** son background est `$admin-navbar-bg` (couleur dédiée, ex. `$primary-color` foncé) tandis que le contenu de page a un background `$admin-content-bg` (gris clair ou blanc cassé) — les deux clairement contrastés.
- **Given** un artiste va sur `/artist/*`, **when** la page est rendue, **then** elle est encapsulée dans `<ArtistLayout>` (variante de `AdminLayout` avec nav limitée aux routes artistes).
- **Given** une route inconnue, **when** accédée, **then** `<PublicLayout>` est utilisé pour la page 404.
- **Given** la navbar publique, **when** scrollée, **then** elle reste sticky en haut avec une petite ombre apparaissant après 20px de scroll.
- **Given** mobile (< `$breakpoint-md-3`), **when** la navbar publique est affichée, **then** elle se transforme en burger menu.

### Spécifications techniques

**Frontend** :
- Nouveaux composants :
  - `src/layouts/PublicLayout/PublicLayout.tsx`
  - `src/layouts/PublicLayout/PublicLayout.scss`
  - `src/layouts/AdminLayout/AdminLayout.tsx`
  - `src/layouts/AdminLayout/AdminLayout.scss`
  - `src/layouts/ArtistLayout/ArtistLayout.tsx`
  - `src/layouts/ArtistLayout/ArtistLayout.scss`
- Chaque layout utilise `<Outlet />` de React Router.
- Routers (`I18nRouter.tsx`, `MonoRouter.tsx`) regroupent les routes :
  ```tsx
  <Route element={<PublicLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/artists" element={<Artists />} />
    <Route path="/artists/:slug" element={<ArtistDetail />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/contact" element={<Contact />} />
  </Route>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/artists" element={<AdminArtists />} />
    {/* ... */}
  </Route>
  <Route element={<ArtistLayout />}>
    <Route path="/artist" element={<ArtistDashboard />} />
    {/* ... */}
  </Route>
  ```
- Variables SCSS à ajouter dans `variables.scss` :
  ```scss
  $public-padding-top-desktop: $padding-xl;
  $public-padding-top-mobile: $padding-lg;
  $admin-navbar-bg: $primary-color;     // ou couleur dédiée
  $admin-navbar-fg: $light-color;
  $admin-content-bg: #f5f5f7;           // ou variable centralisée
  $admin-sidebar-width: 240px;
  ```
- Navbar admin : sidebar latérale fixe sur desktop (≥ `$breakpoint-md`), drawer mobile en dessous.
- Sticky shadow sur scroll : IntersectionObserver, classe `.navbar--scrolled`.

### Dépendances inter-stories
- Toutes les pages existantes doivent être migrées sous les layouts.

### Edge cases & risques
- Pages d'authentification (`/admin/login`, `/artist/login`) : NE PAS utiliser `AdminLayout` / `ArtistLayout` (utilisateur non encore loggé) → utiliser un `AuthLayout` minimaliste ou `PublicLayout`.
- Routes legacy sans layout : ajouter un fallback pour ne pas casser un nav vers une route mal configurée.
- Conflit de keys CSS si navbar dupliquée pendant la migration : faire un sweep complet, supprimer les anciens `<Navbar>` inlinés dans les pages.

### DoD
- Tests Vitest : `PublicLayout` rend la navbar et un `<Outlet>`.
- Audit visuel : capture d'écran avant/après pour chaque page.
- Pas de double padding-top observable.
- Aucun appel direct à `<Navbar>` dans les fichiers de pages.

---

## S-38 — Page d'accueil enrichie

**En tant que** Visiteur, **je veux** une page d'accueil qui me donne plus de contexte (services, histoire, simulateur intégré, preuves sociales), **afin de** comprendre et engager davantage.

**Estimation** : L

### Contexte & enjeux
La version de S-01 prévoit hero + featured + services. L'agence veut un récit plus complet pour augmenter la confiance et la conversion. Le simulateur reste accessible aussi via `/pricing` mais doit être présenté sur la home pour conversion immédiate.

### Critères d'acceptation
- **Given** un visiteur va sur `/`, **when** la page est rendue, **then** elle contient au minimum les sections suivantes, dans cet ordre :
  1. **Hero** — slogan, sous-titre, CTA principal "Réserver un artiste".
  2. **Services** — 3 à 6 cartes (DJ, live, animation, scénographie, etc.) avec icônes.
  3. **Artistes en vedette** — carrousel ou grille de 4 à 8 artistes (`is_featured = true`).
  4. **Notre histoire** — texte storytelling, photo d'équipe, dates clés (création, premiers événements, chiffres clés).
  5. **Simulateur intégré** — formulaire compact (capacité, prix billet, niveau, type de set) consommant la même API que `/pricing`, rendu en place sans navigation.
  6. **Preuves sociales** — logos clients/festivals partenaires + 2 à 4 témoignages courts.
  7. **FAQ courte** — 4 à 6 questions/réponses (délai de réponse, zones desservies, modalités de paiement, annulation).
  8. **CTA final** — bandeau pleine largeur avec lien vers `/booking/new` et lien secondaire vers `/contact`.
- **Given** la section "Notre histoire", **when** rendue, **then** elle affiche au moins : année de création, mission en 2 phrases, 3 chiffres clés animés (compteur GSAP), 1 photo.
- **Given** la section "Simulateur", **when** un visiteur remplit et clique "Calculer", **then** le résultat s'affiche dans la même section et un CTA "Réserver cet artiste" amène vers `/booking/new?artistId=...` si un artiste a été sélectionné.
- **Given** la section "Preuves sociales", **when** les données admin sont vides (V1), **then** une version par défaut (placeholder neutre) est affichée — pas de section vide.
- **Given** mobile, **when** la page est rendue, **then** toutes les sections s'empilent, le carrousel devient swipe horizontal natif.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/Home/Home.tsx`. Sous-dossiers :
  - `Hero/`, `Services/`, `FeaturedArtists/`, `OurStory/`, `PricingTeaser/`, `SocialProof/`, `Faq/`, `FinalCta/`.
- Compteurs animés dans `OurStory/` : GSAP ScrollTrigger.
- Carrousel : utiliser le composant `Slider` de `covaltech-react-ui` si compatible, sinon implémentation minimale.
- Le simulateur teaser réutilise `PriceSimulator` (cf. S-05) en mode "compact".
- FAQ : composant accordion accessible (clavier, ARIA `aria-expanded`).

**Backend** :
- Pas de changement structurel ; ajout possible d'un endpoint `GET /api/cms/home` qui aggrège : artistes featured, témoignages, partenaires (V2 si pertinent). En V1, données statiques côté frontend pour témoignages/partenaires.

### Dépendances inter-stories
- S-01 (base de la home), S-05 (simulateur intégré).
- S-37 (layout).

### Edge cases & risques
- Beaucoup de sections = page lourde. Lazy-load images sous le fold, code-split (mais composant principal pas trop fragmenté).
- Lighthouse perf : viser ≥ 80 mobile. Optimiser hero image (preload, WebP).
- Animation excessive : respecter `prefers-reduced-motion`.

### DoD
- Toutes les sections présentes, traduites FR/NL/EN.
- Test Vitest : `Home.tsx` rend chaque section identifiée par `data-section`.
- Lighthouse mobile perf ≥ 80, a11y ≥ 95.

---

## S-39 — Calendrier disponibilités basé sur une librairie

**En tant que** Visiteur / Artiste / Admin, **je veux** un calendrier clair et standard pour afficher les disponibilités, **afin de** ne pas être perdu par une implémentation maison maladroite.

**Estimation** : M

### Contexte & enjeux
La V0 utilise un calendrier custom peu lisible. L'objectif est d'adopter une librairie éprouvée et accessible.

### Critères d'acceptation
- **Given** une fiche artiste, **when** la section "Disponibilités" est rendue, **then** un calendrier mensuel rendu par la librairie sélectionnée affiche les jours libres / partiels / occupés avec un code couleur sobre.
- **Given** un artiste connecté sur `/artist/calendar`, **when** la page est rendue, **then** un calendrier semaine / mois / jour est disponible avec création/édition d'indispos par sélection de plage.
- **Given** un admin sur `/admin/calendar` (S-27), **when** la page charge, **then** la même librairie est utilisée pour l'agenda global multi-ressources (artistes en lignes).
- **Given** la librairie est accessible au clavier, **when** un utilisateur navigue sans souris, **then** focus visible et raccourcis fonctionnent.
- **Given** mobile, **when** le calendrier est rendu, **then** il bascule en vue liste / agenda compact.

### Spécifications techniques

**Frontend** :
- **Recommandation** : `FullCalendar` (`@fullcalendar/react` + plugins `daygrid`, `timegrid`, `interaction`, `resource-timegrid` pour S-27).
  - Alternative : `react-big-calendar` (plus léger, moins riche).
  - Décision finale à prendre lors du sprint planning. À défaut, défaut = FullCalendar.
- Wrapper interne : `src/components/AvailabilityCalendar/AvailabilityCalendar.tsx` qui isole la librairie (interface stable côté app, possibilité de remplacement futur).
- Props :
  ```ts
  interface AvailabilityCalendarProps {
    artistId: string;
    mode: "public" | "artist" | "admin";
    onSelectRange?: (range: { start: Date; end: Date }) => void;
    onSelectEvent?: (eventId: string) => void;
  }
  ```
- Thème : surcharger les CSS variables de FullCalendar pour matcher `variables.scss`.
- i18n : passer la locale FR/NL/EN à FullCalendar.

### Dépendances inter-stories
- Remplace l'implémentation prévue dans S-12, S-14, S-15, S-27.

### Edge cases & risques
- Taille bundle FullCalendar : importer uniquement les plugins nécessaires, lazy-load la page calendrier.
- Licence FullCalendar premium pour `resource-timegrid` : vérifier la licence non-commerciale vs commerciale (la licence Premium est requise pour `resource-timegrid`/`scheduler` en commercial). **À valider business**.
- Conflit avec `useScrollAnimation` : désactiver `fi` sur les éléments du calendrier.

### DoD
- Calendrier public, artiste et admin fonctionnent avec la même librairie.
- A11y : navigation clavier validée.
- Bundle JS additionnel mesuré et < 200 KB (gzip) pour la page calendrier.

---

## S-40 — Pré-remplissage du simulateur via query param

**En tant que** Visiteur, **je veux** que le CTA "Estimer mon budget" d'une fiche artiste m'amène sur `/pricing` avec l'artiste pré-sélectionné via l'URL, **afin de** pouvoir partager / bookmarker le lien.

**Estimation** : S

### Critères d'acceptation
- **Given** un visiteur est sur `/artists/:slug`, **when** il clique sur le bouton "Estimer mon budget", **then** il est redirigé vers `/pricing?artiste=<slug>` (URL en clair avec le slug, pas l'UUID).
- **Given** un visiteur arrive sur `/pricing?artiste=jane-doe`, **when** la page se charge, **then** le champ "Artiste" est pré-rempli avec Jane Doe (lookup par slug côté frontend ou API).
- **Given** un slug invalide dans le param, **when** la page se charge, **then** le champ artiste reste vide, un toast info "Artiste introuvable" s'affiche, l'URL est nettoyée (slug retiré).
- **Given** `/pricing` sans param, **when** la page charge, **then** comportement actuel (sélecteur libre).
- **Given** le visiteur change d'artiste dans le simulateur, **when** la sélection est validée, **then** l'URL est mise à jour (`?artiste=<nouveau-slug>`) via `useSearchParams`.

### Spécifications techniques

**Frontend** :
- Helper : étendre `buildBookingUrl` dans `src/config/pages.ts` ou ajouter `buildPricingUrl(slug?: string)`.
- Page : `src/pages/Pricing/Pricing.tsx` lit `useSearchParams()` et utilise le slug pour fetch l'artiste (réutilise `GET /api/artists/:slug`).
- Param name : `artiste` (FR canonique). Accepter aussi `artist` (EN) en alias pour compat URL.
- Constante : `export const PRICING_QUERY_PARAM = "artiste" as const;`

### Dépendances inter-stories
- S-04 (fiche artiste, CTA).
- S-05 (page simulateur).

### Edge cases & risques
- Slug avec caractères spéciaux : encoder via `encodeURIComponent`.
- Slug changé côté admin (S-22) : redirection 301 via `slug_redirects` doit aussi marcher pour ce param.

### DoD
- Test : cliquer le CTA → URL contient `?artiste=<slug>`.
- Test : arriver avec un slug invalide → toast + champ vide.
- URL mise à jour à chaque changement de sélection.

---

## S-41 — Retrait du tarif horaire estimatif sur la fiche artiste

**En tant que** Visiteur, **je veux** ne pas voir "à partir de XX €/heure" sur la fiche artiste, **afin de** que le tarif communiqué corresponde à la réalité (forfait événementiel et non taux horaire).

**Estimation** : S

### Contexte & enjeux
Le modèle commercial repose sur un cachet d'événement (capacité × ticket × niveau), pas sur un taux horaire. Communiquer un tarif horaire est trompeur et nuit à la perception.

### Critères d'acceptation
- **Given** une fiche artiste `/artists/:slug`, **when** la page est rendue, **then** AUCUN libellé "à partir de XX €/heure" ou équivalent n'apparaît.
- **Given** la fiche artiste, **when** rendue, **then** la section tarification affiche soit : un CTA "Estimer mon budget" qui ouvre le simulateur (cf. S-40), soit une fourchette estimative communiquée sous forme `€€ / €€€ / €€€€` (indicateur visuel non chiffré).
- **Given** la base de données contient `hourly_rate_cents`, **when** sérialisée vers le public, **then** ce champ n'est PAS exposé (interne uniquement, utilisé par le service de pricing).
- **Given** la fiche artiste, **when** rendue, **then** un message "Le tarif final est calculé selon votre événement (capacité, prix du billet, format)" est visible avant le CTA simulateur.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/ArtistDetail/ArtistDetail.tsx` — retirer toute mention de `hourly_rate`.
- Composant : `src/pages/ArtistDetail/PriceCard/PriceCard.tsx` rebrandé en `TierIndicator/TierIndicator.tsx` (affiche `€` à `€€€€`).
- Mapping niveau → indicateur :
  ```ts
  const TIER_LABEL: Record<ArtistLevel, string> = {
    L1: "€",
    L2: "€€",
    L3: "€€€",
    L4: "€€€€",
  };
  ```

**Backend** :
- Sérialiseur public artiste : retirer `hourly_rate_cents`. Exposer `level` (ArtistLevel) à la place.
- Mise à jour du DTO public `PublicArtist`.

### Dépendances inter-stories
- S-04 (fiche artiste).
- S-22 (CRUD admin : édition du `level` au lieu / en plus du tarif horaire).
- S-40 (CTA simulateur).

### Edge cases & risques
- Régression sur le simulateur S-05 : la version "duration × hourly_rate" devient obsolète pour les événements billettés. Conserver le calcul horaire pour les cas non-billettés (mariage, anniversaire) → bascule UI dans le simulateur.
- Données existantes : migrer `level` par défaut à `L2` si non renseigné, déclencher un audit admin pour ajustement.

### DoD
- Test : aucune chaîne contenant "€/heure" ou "/h" sur la fiche artiste.
- API publique : champ `hourly_rate_cents` absent.

---

## S-42 — Back-office entièrement en français

**En tant que** Admin, **je veux** que tout le back-office (libellés, boutons, dropdowns, messages, statuts) soit en français, **afin de** travailler dans ma langue de tous les jours.

**Estimation** : M

### Contexte & enjeux
La V0 mélange FR/EN dans l'admin. L'équipe interne travaille en FR. Pas besoin de multilingue côté admin V1 → français exclusif.

### Critères d'acceptation
- **Given** un admin connecté sur `/admin/*`, **when** n'importe quelle page est rendue, **then** 100% des chaînes UI sont en français (boutons, labels, headers de tables, options de dropdowns, toasts, modaux, breadcrumbs).
- **Given** un dropdown de statut booking, **when** ouvert, **then** les options sont libellées : "En attente de validation", "En attente d'acompte", "Confirmé", "Annulé", "Terminé" (pas `pending_validation` ni les codes techniques).
- **Given** un dropdown de filtre par artiste, **when** ouvert, **then** les noms apparaissent triés alphabétiquement, en français pour les options génériques ("Tous les artistes", "Aucun").
- **Given** une erreur API, **when** affichée à l'écran, **then** son message est en français (mapping côté frontend entre `error.code` et message FR).
- **Given** un message vide / état zéro, **when** rendu, **then** il est en français ("Aucun résultat", "Pas encore de booking", etc.).

### Spécifications techniques

**Frontend** :
- Nouveau namespace i18n : `src/i18n/locales/fr-admin.json` (sépare admin du public pour éviter clés pollués).
- Initialisation i18next : ajouter le namespace `admin` chargé sur les routes admin.
- Mapping statut → label : `src/config/bookingStatusLabels.ts`
  ```ts
  export const BOOKING_STATUS_LABEL_FR: Record<BookingStatus, string> = {
    pending_validation: "En attente de validation",
    awaiting_deposit: "En attente d'acompte",
    confirmed: "Confirmé",
    cancelled: "Annulé",
    completed: "Terminé",
  };
  ```
- Mapping code erreur → message FR : `src/config/errorMessagesFr.ts`.
- Règle ESLint custom (ou audit script) : aucun string EN hardcodé dans `src/pages/Admin*` / `src/components/Admin*`.

### Dépendances inter-stories
- [EPIC-06 S-32](EPIC-06.md) : étendre la parité i18n pour inclure `fr-admin.json`.

### Edge cases & risques
- Composants partagés (`Button`, `Modal`, `DynamicTable` de `covaltech-react-ui`) : vérifier que les labels par défaut (ex. "Cancel", "OK") sont surchargeables — sinon wrapper.
- Pluralisation FR : utiliser i18next `_one` / `_other`.

### DoD
- Audit visuel page par page : aucun anglais visible.
- Script d'audit : grep des strings EN dans le dossier admin → liste vide.

---

## S-43 — DynamicTable pour les listes admin

**En tant que** Admin, **je veux** que les pages `/admin/artists` et `/admin/bookings` utilisent le composant `DynamicTable` de `covaltech-react-ui`, **afin de** bénéficier de tri, filtres, pagination et responsive cohérents.

**Estimation** : M

### Critères d'acceptation
- **Given** `/admin/artists`, **when** la page charge, **then** la liste utilise `DynamicTable` avec colonnes : photo (thumbnail 40×40), nom de scène, niveau, statut (publié/brouillon), nombre de bookings actifs, date création, actions (éditer/archiver).
- **Given** `/admin/bookings`, **when** la page charge, **then** la liste utilise `DynamicTable` avec colonnes : ID court, artiste, client, date événement, statut (badge coloré), montant total, acompte (badge "payé"/"en attente"), date création, actions.
- **Given** une colonne triable, **when** cliquée, **then** le tri serveur s'applique (param `sort`, `order`).
- **Given** un filtre actif (dropdown au-dessus de la table), **when** modifié, **then** la query API se met à jour et la pagination revient à 1.
- **Given** mobile (< `$breakpoint-md-3`), **when** la table est rendue, **then** elle bascule en vue cartes (chaque ligne = une carte verticale).
- **Given** une action (éditer / supprimer / etc.), **when** cliquée, **then** elle ouvre le formulaire correspondant ou un modal de confirmation.

### Spécifications techniques

**Frontend** :
- Pages : `src/pages/AdminArtists/AdminArtists.tsx`, `src/pages/AdminBookings/AdminBookings.tsx`.
- Configuration `DynamicTable` :
  ```ts
  const columns: TableColumn<AdminBookingRow>[] = [
    { key: "shortId", label: "Réf.", sortable: false },
    { key: "artistName", label: "Artiste", sortable: true },
    { key: "clientName", label: "Client", sortable: true },
    { key: "eventDate", label: "Date événement", sortable: true, render: formatDateFr },
    { key: "status", label: "Statut", render: renderStatusBadge },
    { key: "totalCents", label: "Total", render: formatPriceFr },
    { key: "depositStatus", label: "Acompte", render: renderDepositBadge },
    { key: "createdAt", label: "Créé le", sortable: true, render: formatDateFr },
    { key: "actions", label: "", render: renderRowActions },
  ];
  ```
- Filtres au-dessus : `StyledDropdown` (multi ou simple) de `covaltech-react-ui`, libellés FR.
- Pagination : `usePagination` (déjà documenté).

### Dépendances inter-stories
- S-22 (admin artists), S-23 (admin bookings).
- S-42 (labels FR).

### Edge cases & risques
- Performance large dataset : pagination serveur obligatoire, ne pas tout charger.
- Si `DynamicTable` ne supporte pas la vue cartes mobile : implémenter un wrapper qui bascule entre `DynamicTable` (desktop) et liste de cartes (mobile) via `useWindowWidth`.

### DoD
- Tests Vitest : tri, filtre, pagination fonctionnent (mock API).
- Vue mobile validée.

---

## S-44 — Création / édition d'artiste avec upload image et description riche

**En tant que** Admin, **je veux** créer ou éditer un artiste avec une image principale (upload) et une description riche, **afin de** publier une fiche complète sans coller des URLs à la main.

**Estimation** : M

### Critères d'acceptation
- **Given** l'admin clique "Nouvel artiste", **when** le formulaire s'ouvre, **then** il propose : nom de scène, slug (auto-généré depuis le nom, modifiable), niveau (`L1`–`L4`), type de set (DJ/hybrid/live), description (FR/NL/EN, éditeur riche), upload image principale (drag & drop ou clic), galerie de photos secondaires, statut publication.
- **Given** l'admin uploade une image, **when** la sélection est faite, **then** un preview immédiat est affiché, l'image est uploadée vers le storage backend, l'URL est stockée dans `cover_image_url`.
- **Given** l'upload est en cours, **when** affiché, **then** une barre de progression est visible et le formulaire ne peut pas être soumis avant la fin.
- **Given** un fichier non image ou > 5 MB, **when** uploadé, **then** rejet immédiat avec message FR ("Format invalide, JPG/PNG/WebP uniquement, 5 Mo max").
- **Given** une description rich text, **when** éditée, **then** l'admin peut formater : gras, italique, listes, liens, sauts de ligne. Pas d'images inline en V1.
- **Given** sauvegarde du formulaire, **when** soumis, **then** l'artiste est créé/mis à jour, audit log écrit, redirection vers la fiche admin avec toast "Artiste enregistré".

### Spécifications techniques

**Frontend** :
- Page : `src/pages/AdminArtistEdit/AdminArtistEdit.tsx`.
- Composant upload : nouveau `src/components/ImageUploader/ImageUploader.tsx` (drag&drop, preview, validation taille/MIME).
- Éditeur riche : TipTap (préféré, modulaire) ou Lexical. **À confirmer**. Wrapper interne `src/components/RichTextEditor/`.
- Validation Zod côté frontend.
- Slug auto-generation : helper `slugify(stageName)` (kebab-case, sans accents).

**Backend** :
- Route `POST /api/admin/artists/:id/cover-image` (multipart, max 5 MB, MIME `image/jpeg|image/png|image/webp`).
- Service : `StorageService.upload(file, { prefix: "artists/cover" })`, retourne URL signée ou publique selon driver.
- Validation Zod : description FR/NL/EN (max 10000 caractères chacune, HTML sanitizé via `sanitize-html`).

### Dépendances inter-stories
- S-22 (CRUD admin artistes).
- S-43 (DynamicTable montre la cover image).

### Edge cases & risques
- HTML injecté malveillant : sanitization stricte côté backend avant persistence.
- Image très lourde : redimensionnement côté serveur via `sharp` (générer 3 tailles : 320, 768, 1280).
- Slug en doublon : Zod + check DB → erreur explicite.

### DoD
- Test : upload PNG OK, upload PDF → 422.
- Test : description HTML avec `<script>` → sanitizée.
- Cover image affichée dans la liste admin et sur la fiche publique.

---

## S-45 — Création d'un booking par l'admin

**En tant que** Admin, **je veux** pouvoir créer manuellement un booking depuis le back-office, **afin de** enregistrer des deals conclus par téléphone, email ou en direct.

**Estimation** : M

### Critères d'acceptation
- **Given** l'admin va sur `/admin/bookings`, **when** il clique "Nouveau booking", **then** un formulaire s'ouvre (modal ou page dédiée) avec les mêmes champs que le formulaire client + champs admin : statut initial, paiement déjà reçu (oui/non), note interne.
- **Given** l'admin remplit le formulaire, **when** soumis, **then** un booking est créé directement avec le statut choisi (`confirmed` possible si paiement déjà reçu hors plateforme).
- **Given** statut `confirmed`, **when** créé par l'admin, **then** un email "Booking confirmé" est envoyé au client ET à l'artiste (avec un disclaimer "Créé par l'agence").
- **Given** l'admin choisit "Pas d'email automatique", **when** soumis, **then** aucun email n'est envoyé (override explicite).
- **Given** une date qui chevauche un autre booking confirmé, **when** soumis, **then** un message d'avertissement apparaît mais l'admin peut forcer (avec confirmation).
- **Given** l'admin créé un booking, **when** soumis, **then** un audit log est écrit avec `actor=admin`, `action=booking.manual_create`.

### Spécifications techniques

**Frontend** :
- Composant : `src/pages/AdminBookingNew/AdminBookingNew.tsx` (page dédiée plutôt que modal car le formulaire est long).
- Réutilise les sous-composants du formulaire client (`StepArtist`, `StepDateTime`, etc.) en mode admin (avec champs supplémentaires).

**Backend** :
- Route `POST /api/admin/bookings` (protégée admin).
- Body Zod étendu :
  ```ts
  {
    ...clientBookingPayload,
    initialStatus: BookingStatus,
    skipEmails: boolean,
    internalNote: string (max 2000),
    overrideConflict: boolean
  }
  ```
- Service `BookingAdminService.createManual(input)` :
  - Pas de génération de `validation_token` ni de `payment_intent` automatique si `initialStatus` ≥ `awaiting_deposit`.
  - Si `skipEmails=false`, déclencher emails appropriés selon `initialStatus`.
  - Si chevauchement et `overrideConflict=false` → 409 ; si true, créer + log warning.
- Audit log obligatoire.

### Dépendances inter-stories
- S-22, S-23, S-24, S-35.

### Edge cases & risques
- Création avec statut `pending_validation` : envoyer l'email de validation comme un booking normal.
- Création avec statut `confirmed` mais pas de paiement enregistré côté Stripe : ajouter un champ `payment_source = 'manual'` sur le booking pour tracer.
- Mauvais usage de `overrideConflict` : audit log + alerte admin notif interne.

### DoD
- Test : création `confirmed` → emails envoyés, audit log écrit.
- Test : conflit + `overrideConflict=false` → 409.
- Test : `skipEmails=true` → aucun email.

---

## S-46 — Footer légal retiré du périmètre CMS

**En tant que** Système, **je veux** que le footer légal (mentions, CGU, politique de confidentialité) NE soit PAS éditable depuis le back-office admin, **afin de** garantir la conformité juridique via le contrôle développeur uniquement.

**Estimation** : S

### Contexte & enjeux
Le contenu légal a une portée juridique. Il ne doit pas être modifiable par un non-juriste via le CMS. Modification = déploiement, traçabilité git.

### Critères d'acceptation
- **Given** la table `content_blocks`, **when** créée (S-33), **then** elle NE contient PAS les clés `footer.legal.*` (mentions, CGU, privacy, cookies).
- **Given** la page `/admin/content`, **when** rendue, **then** aucun champ "footer légal" n'est éditable.
- **Given** le footer public, **when** rendu, **then** les liens et textes légaux viennent de `i18n/locales/{fr,nl,en}.json` (clés `footer.legal.*`).
- **Given** une mise à jour légale, **when** nécessaire, **then** la procédure est : PR sur le repo modifiant les `*.json` → déploiement.
- **Given** la documentation [EPIC-06 S-33](EPIC-06.md), **when** lue, **then** elle mentionne explicitement l'exclusion du footer légal.

### Spécifications techniques

**Frontend** :
- Composant `PublicFooter` lit `t("footer.legal.mentions")`, `t("footer.legal.cgu")`, `t("footer.legal.privacy")`.
- Aucun fetch admin pour ces clés.

**Backend** :
- Seed `content_blocks` : ne pas insérer les clés `footer.legal.*`.

### Dépendances inter-stories
- [EPIC-06 S-33](EPIC-06.md) : mise à jour à effectuer pour retirer le footer.

### Edge cases & risques
- Cohérence multi-langues : la procédure de PR doit imposer la mise à jour des 3 langues simultanément.
- Confusion équipe : documenter clairement dans `README.md` du repo.

### DoD
- Aucune entrée `footer.legal.*` dans `content_blocks` ni dans l'UI admin.
- Footer rendu correctement en lisant les fichiers i18n.
- Documentation `EPIC-06 S-33` mise à jour.

---

## S-47 — Animations GSAP sur la partie publique

**En tant que** Visiteur, **je veux** que la partie publique du site soit fluide et vivante grâce à des animations soignées, **afin de** ressentir une expérience premium qui inspire confiance dans l'agence.

**Estimation** : L

### Contexte & enjeux
Le site doit "vivre" sans tomber dans la démo de portfolio. Chaque animation a une raison d'être : guider l'œil, signaler une action, accompagner un changement d'état. La librairie GSAP est déjà installée et utilisée via `useAnimation` et `useScrollAnimation` — il faut industrialiser, pas réinventer.

### Critères d'acceptation
- **Given** un visiteur arrive sur `/`, **when** la page est rendue, **then** le hero apparaît avec un fade-in + translation Y (titre puis sous-titre puis CTA, en stagger de ~80ms).
- **Given** le visiteur scrolle, **when** une section entre dans le viewport, **then** ses éléments principaux s'animent (fade-in + translateY 24px) une seule fois (pas de replay).
- **Given** un carrousel d'artistes en vedette, **when** rendu, **then** les cartes apparaissent en stagger horizontal, hover = micro-élévation `translateY(-4px)` + ombre douce avec transition GSAP de 200ms.
- **Given** un lien de navigation interne, **when** cliqué, **then** la transition entre pages est lissée par un overlay fade (pas un cut brutal). Durée totale < 400ms.
- **Given** le compteur de "Notre histoire", **when** la section est visible, **then** les chiffres s'incrémentent depuis 0 jusqu'à leur valeur cible en 1.2s avec easing `power2.out`.
- **Given** une FAQ accordion, **when** ouverte, **then** la hauteur s'anime avec GSAP (pas un `display:none` brut).
- **Given** un visiteur a `prefers-reduced-motion: reduce`, **when** les animations devraient jouer, **then** elles sont désactivées et tous les éléments apparaissent immédiatement en état final.
- **Given** un toast / modal s'ouvre, **when** affiché, **then** entrée scale 0.95 → 1 + fade-in (180ms), sortie inverse.
- **Given** la navbar publique, **when** elle passe de "top" à "scrolled" (≥ 20px de scroll), **then** background + ombre s'animent avec une transition de 200ms.
- **Given** un formulaire de contact ou de booking, **when** un champ est focus, **then** son label s'élève en floating-label (transition de 150ms).
- **Given** la page sur mobile, **when** rendue, **then** les animations sont raccourcies (durées × 0.7) ou simplifiées pour ne pas pénaliser la perf.

### Spécifications techniques

**Catalogue centralisé** : `src/hooks/useAnimation.ts` (déjà existant) étendu avec un catalogue exporté de presets :

```ts
export const ANIMATION_PRESETS = {
  HERO_INTRO: { duration: 0.8, ease: "power3.out", staggerMs: 80 },
  SECTION_REVEAL: { duration: 0.6, ease: "power2.out", translateY: 24 },
  CARD_STAGGER: { duration: 0.5, ease: "power2.out", staggerMs: 60 },
  CARD_HOVER: { duration: 0.2, ease: "power1.out", translateY: -4 },
  COUNTER: { duration: 1.2, ease: "power2.out" },
  ACCORDION: { duration: 0.3, ease: "power2.inOut" },
  MODAL_IN: { duration: 0.18, ease: "power2.out", scaleFrom: 0.95 },
  PAGE_TRANSITION: { duration: 0.35, ease: "power2.inOut" },
  NAVBAR_SCROLL: { duration: 0.2, ease: "power1.out" },
} as const;
```

**Composants à créer / étendre** :
- `src/components/AnimatedCounter/AnimatedCounter.tsx` — compteur 0 → N avec GSAP.
- `src/components/PageTransition/PageTransition.tsx` — wrapper d'overlay fade entre routes (utilise `useLocation`).
- `useScrollAnimation` existant : ajouter option `preset: keyof typeof ANIMATION_PRESETS`.
- `useReducedMotion()` hook qui lit `window.matchMedia('(prefers-reduced-motion: reduce)')`.

**Règles d'usage** :
- Une animation = une intention. Pas d'animation décorative sur la table admin ni dans les espaces authentifiés (sauf transitions douces des toasts / modaux).
- Pas d'animation continue (loop) ailleurs que pour des indicateurs de loading (spinner).
- Toujours wrapper les `gsap.from` / `gsap.to` dans un `useEffect` avec cleanup (`ctx.revert()`).
- ScrollTrigger : un seul `play` (`toggleActions: "play none none none"`), pas de "play reverse play reverse" qui rejoue à chaque pass.
- Performance : `will-change: transform, opacity` sur les éléments animés, retiré une fois l'animation finie.

**Où s'appliquent les animations** (matrice page × section) :

| Page | Sections animées |
|---|---|
| `/` | Hero intro, Services (stagger), Featured artists (stagger), Our story (counters + reveal), Pricing teaser (reveal), Social proof (reveal), FAQ (accordion), Final CTA (reveal) |
| `/artists` | Grille en stagger à l'arrivée + à chaque changement de filtre |
| `/artists/:slug` | Hero + galerie (lightbox in/out), calendrier (fade), CTAs (reveal) |
| `/pricing` | Card simulateur (reveal), résultat (slide-in après calcul) |
| `/contact` | Formulaire (reveal), envoi → micro-anim sur le bouton + toast |
| Navbar | Sticky shadow, mobile burger (slide drawer) |

### Dépendances inter-stories
- S-38 (homepage enrichie : c'est là qu'il y a le plus d'animations à brancher).
- S-37 (layouts : la `PageTransition` vit dans `PublicLayout`).
- S-39 (calendrier : ne pas conflit avec animations FullCalendar).

### Edge cases & risques
- Conflit `useScrollAnimation` avec FullCalendar : exclure les sélecteurs de la lib calendrier de la classe `.fi`.
- Trop d'animations simultanées au load : sérialiser via une timeline GSAP master pour le hero, ScrollTrigger pour les autres.
- Perf mobile bas de gamme : tester sur Moto G ou équivalent émulé en DevTools throttling.
- Memory leak GSAP : impératif d'utiliser `gsap.context()` + `ctx.revert()` dans le cleanup `useEffect`.

### DoD
- Catalogue `ANIMATION_PRESETS` documenté.
- Tous les composants des pages publiques mentionnées au-dessus utilisent un preset (pas d'animation freestyle).
- `prefers-reduced-motion` testé manuellement (DevTools → Rendering → Emulate CSS media feature).
- Lighthouse perf mobile sur `/` ≥ 80 même avec toutes les animations actives.
- Aucun warning console "GSAP target not found".

---

## S-48 — Espace client (auth + historique des bookings)

**En tant que** Client, **je veux** pouvoir me connecter à un espace personnel et voir tous mes bookings (en cours, passés) avec leur statut détaillé, **afin de** suivre mes réservations sans devoir fouiller dans mes emails.

**Estimation** : L

### Contexte & enjeux
Aujourd'hui le client interagit uniquement via magic-links par booking (S-09). Il n'a pas de vue agrégée. Pour la fidélisation et la transparence, un mini-espace client est nécessaire — sans pour autant transformer le site en SaaS.

**Choix V1** : authentification par **magic link uniquement** (pas de mot de passe), avec session navigateur 30 jours. Plus simple, plus sûr, adapté à la fréquence faible. Mot de passe possible en V2.

### Critères d'acceptation

**Demande d'accès & auth**
- **Given** un visiteur va sur `/account/login`, **when** il saisit son email, **then** il reçoit un email avec un magic link valable 30 minutes.
- **Given** le magic link est cliqué, **when** validé côté backend, **then** une session client est créée (cookie httpOnly, samesite Lax, 30 jours), redirection vers `/account`.
- **Given** un email inconnu de la base, **when** soumis, **then** la réponse est identique (générique "Si un compte existe, vous recevrez un email") — anti-énumération.
- **Given** le client clique 2 magic links rapprochés, **when** le second arrive, **then** il invalide le premier (un seul token actif).

**Dashboard**
- **Given** un client connecté, **when** il va sur `/account`, **then** il voit : carte récap (nb bookings à venir, prochain événement), liste "À venir" (max 3 cartes), bouton "Voir tous mes bookings".
- **Given** `/account/bookings`, **when** rendu, **then** liste paginée des bookings (à venir + passés) triés par date événement DESC. Onglets ou filtres : "À venir", "Passés", "Annulés", "Tous".
- **Given** un booking dans la liste, **when** rendu, **then** chaque carte affiche : artiste (nom + thumb), date, lieu (ville), statut sous forme de badge, montant total, montant restant à payer.

**Statuts détaillés**
- **Given** un booking en `pending_validation`, **when** affiché, **then** badge "⏳ En attente de validation par l'agence", action proposée : "Modifier ma demande" (V2) / "Annuler ma demande".
- **Given** un booking en `awaiting_deposit` (validé par admin), **when** affiché, **then** badge "✅ Validé — acompte à payer", CTA "Payer l'acompte" qui mène à la page paiement (S-10).
- **Given** un booking `confirmed`, **when** affiché, **then** badge "🎉 Confirmé", actions : "Télécharger le reçu", "Voir le contrat" (si signé), "Contacter l'agence".
- **Given** un booking `cancelled`, **when** affiché, **then** badge "❌ Annulé" + motif (si fourni par admin) + date.
- **Given** un booking `completed`, **when** affiché, **then** badge "✓ Terminé", CTA "Laisser un avis" (V2 hors scope V1).
- **Given** une timeline du booking, **when** déroulée, **then** elle montre les jalons : "Demande envoyée le X", "Validée par l'agence le Y", "Acompte payé le Z", "Contrat signé le W", etc.

**Sécurité**
- **Given** un client tente d'accéder à `/account/*` sans session, **when** la requête arrive, **then** 401 → redirection vers `/account/login` avec `?redirect=<original>`.
- **Given** un client tente d'accéder au booking d'un autre client (manipulation d'ID), **when** la requête est faite, **then** 404.
- **Given** une session inactive depuis 60 jours, **when** le client revient, **then** session expirée, magic link à redemander.

**UX micro**
- **Given** un email reçu, **when** ouvert, **then** il contient explicitement la formule "Cliquez ici pour accéder à votre espace" + le lien.
- **Given** un client est connecté, **when** il voit la navbar publique, **then** un avatar/menu "Mon compte" remplace le bouton login.

### Spécifications techniques

**Frontend** :
- Pages :
  - `src/pages/AccountLogin/AccountLogin.tsx` — form email + envoi.
  - `src/pages/AccountMagicCallback/AccountMagicCallback.tsx` — gère `/account/magic?token=...`.
  - `src/pages/AccountDashboard/AccountDashboard.tsx`.
  - `src/pages/AccountBookings/AccountBookings.tsx`.
  - `src/pages/AccountBookingDetail/AccountBookingDetail.tsx`.
- Layout : nouveau `AccountLayout` (variante simplifiée de `PublicLayout` avec navbar publique mais sans certaines sections).
- Store : `useClientAuthStore` (Zustand) avec persist (juste un flag `isAuthenticated`, le cookie est httpOnly côté serveur).
- Route guard : `<ClientProtected>` qui appelle `GET /api/account/me`, redirige si 401.
- Constantes statuts (réutilise [EPIC-02](EPIC-02.md)) avec labels FR :
  ```ts
  export const CLIENT_STATUS_LABELS: Record<BookingStatus, { label: string; icon: string; tone: "warning"|"info"|"success"|"danger"|"neutral" }> = {
    pending_validation: { label: "En attente de validation", icon: "⏳", tone: "warning" },
    awaiting_deposit: { label: "Validé — acompte à payer", icon: "✅", tone: "info" },
    confirmed: { label: "Confirmé", icon: "🎉", tone: "success" },
    cancelled: { label: "Annulé", icon: "❌", tone: "danger" },
    completed: { label: "Terminé", icon: "✓", tone: "neutral" },
  };
  ```

**Backend** :
- Nouvelle table :
  ```sql
  CREATE TABLE client_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
  );

  CREATE TABLE client_magic_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_magic_token_hash ON client_magic_tokens(token_hash);

  CREATE TABLE client_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    session_token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- Liaison bookings → client : ajouter `bookings.client_account_id UUID REFERENCES client_accounts(id)` (nullable au début, rempli à la création du booking si email connu, sinon créé à la volée).
- Routes :
  - `POST /api/account/magic-link` body `{ email }` → toujours `204`.
  - `GET /api/account/magic-callback?token=<raw>` → set cookie + redirect `/account`.
  - `GET /api/account/me` → `{ email }` ou 401.
  - `GET /api/account/bookings?status=&page=&page_size=` (réutilise `BookingService` avec filtre `client_account_id = req.client.id`).
  - `GET /api/account/bookings/:id` → idem, ownership obligatoire.
  - `POST /api/account/logout` → revoke session.
- Middleware : `authenticateClient(pool)` lisant le cookie httpOnly.
- Constantes :
  ```ts
  export const CLIENT_MAGIC_TOKEN_TTL_MIN = 30;
  export const CLIENT_SESSION_TTL_DAYS = 30;
  export const CLIENT_SESSION_COOKIE = "gz_client_session";
  ```

### Dépendances inter-stories
- [EPIC-02](EPIC-02.md) S-07 / S-09 : à la création d'un booking, créer/récupérer le `client_accounts` correspondant et lier `client_account_id`.
- [EPIC-07 S-34](EPIC-07.md) : étendre l'enum des `kind` pour inclure `client` (et durcir le découplage avec `artist` / `admin`).
- S-37 : layout `AccountLayout`.
- S-47 : animations sur dashboard.

### Edge cases & risques
- Bookings antérieurs au déploiement de cette story : migration une fois pour rétro-lier `client_account_id` par email.
- Un client change d'email entre deux bookings : V1 = compte séparé par email (acceptable). V2 = fusion sur demande support.
- Phishing magic link : email envoyé depuis le domaine officiel + DKIM/SPF/DMARC stricts.
- Multi-comptes (un même client booke pour deux entités) : V1 hors scope, pas de "switch account".

### DoD
- Tests : login OK / token expiré / token consommé / accès booking d'un autre client refusé.
- Audit log magic links générés / consommés.
- Tests E2E : login → voir un booking → cliquer "Payer acompte" → flow continue.

---

## S-49 — Espace artiste : édition de son profil et de ses contenus

**En tant que** Artiste, **je veux** modifier moi-même mes informations (bio, photos, niveau visible, type de set, infos pratiques) sans dépendre de l'admin, **afin de** garder ma fiche à jour.

**Estimation** : M

### Contexte & enjeux
La V1 prévoyait que l'admin gère toutes les fiches (S-22). En réalité, les artistes veulent autonomie pour mettre à jour leur bio, leurs photos, leurs liens sociaux. Mais certains champs restent **réservés à l'admin** : niveau (`L1`–`L4`), publication (`is_published`), tarif de référence, statut commercial.

### Critères d'acceptation
- **Given** un artiste connecté, **when** il va sur `/artist/profile`, **then** il voit son profil avec sections : Identité, Bio (3 langues), Photos, Liens sociaux, Infos techniques (matériel, durée de set, etc.).
- **Given** l'artiste modifie un champ autorisé, **when** il sauvegarde, **then** la modification est persistée immédiatement, un toast "Modifications enregistrées" s'affiche.
- **Given** l'artiste tente de modifier un champ admin (niveau, publication, tarif horaire interne), **when** il consulte le formulaire, **then** ces champs sont absents ou en lecture seule grisée avec libellé "Géré par l'agence — contactez-nous".
- **Given** l'artiste uploade une photo de galerie, **when** la sélection est faite, **then** preview + upload immédiat, l'ordre dans la galerie est modifiable par drag&drop.
- **Given** l'artiste supprime une photo, **when** confirmé, **then** suppression hard côté storage + DB.
- **Given** l'artiste modifie sa bio en FR, **when** il bascule sur NL/EN, **then** les autres versions restent intactes (pas d'écrasement).
- **Given** une modification dans une seule langue, **when** sauvegardée, **then** un indicateur visuel "EN manquant" reste visible sans bloquer la sauvegarde.
- **Given** une modification d'un champ visible publiquement, **when** appliquée, **then** la fiche publique reflète le changement immédiatement (pas de validation admin nécessaire pour les champs autorisés).
- **Given** une modification de bio "sensible" (changement > 500 caractères), **when** détecté, **then** une notification interne est envoyée à l'admin (transparence).

### Spécifications techniques

**Frontend** :
- Page : `src/pages/ArtistProfile/ArtistProfile.tsx` + sous-sections `IdentitySection/`, `BioSection/`, `PhotosSection/`, `SocialLinksSection/`, `TechnicalInfoSection/`.
- Photos drag&drop : librairie déjà-validée (ex. `@dnd-kit/sortable`) ou implémentation native HTML5.
- Éditeur rich text : même composant que S-44 (`RichTextEditor`).
- Validation Zod côté front avant submit.

**Backend** :
- Routes (authentifiées artiste) :
  - `GET /api/artist/profile` → renvoie l'artiste avec tous les champs autorisés.
  - `PATCH /api/artist/profile` body partial (uniquement champs autorisés).
  - `POST /api/artist/profile/photos` multipart.
  - `PATCH /api/artist/profile/photos/:id` (ordre, alt).
  - `DELETE /api/artist/profile/photos/:id`.
- Service : `ArtistSelfService` distinct de `ArtistAdminService`. Liste blanche stricte des champs modifiables :
  ```ts
  export const ARTIST_SELF_EDITABLE_FIELDS = [
    "bio_fr", "bio_nl", "bio_en",
    "social_links",
    "technical_info_fr", "technical_info_nl", "technical_info_en",
    "set_type",
  ] as const;
  ```
- Tout champ hors liste passé en PATCH → ignoré silencieusement avec warning loggé.
- Audit log à chaque modification.

### Dépendances inter-stories
- [EPIC-04 S-16](EPIC-04.md) : auth artiste.
- S-44 (composants upload / rich text).
- S-50 (l'artiste doit avoir été invité et avoir signé son contrat avant de pouvoir éditer — voir gating).

### Edge cases & risques
- Conflit éditorial admin/artiste : last-write-wins V1, ajouter `updated_at` lock optimiste en V2.
- Contenu inapproprié dans la bio : V1 = pas de modération auto. Admin peut désactiver l'artiste (S-22) si abus.
- Photos NSFW : V1 hors scope, accepter manuellement les uploads. V2 = modération auto via API externe.

### DoD
- Test : PATCH avec champ admin → ignoré, retour 200 mais champ inchangé.
- Test : artiste A ne peut pas éditer profil artiste B.
- Audit log écrit pour chaque modification.
- Indicateur "champs admin" clair en UI.

---

## S-50 — Invitation d'un artiste par lien personnel

**En tant que** Admin, **je veux** inviter un nouvel artiste via un lien d'invitation personnel envoyé par email, **afin de** ne pas avoir à créer son compte à sa place et à lui transmettre des identifiants par un canal séparé.

**Estimation** : L

### Contexte & enjeux
Inspiré du flow d'invitation d'organisation dans le repo `event-planner` : l'admin remplit `email + stage_name`, le système génère un token unique, envoie un email avec lien d'invitation. L'artiste clique, complète son profil et choisit son mot de passe. Tant qu'il n'a pas accepté l'invitation et signé son contrat (S-51), il n'est pas réservable.

### Critères d'acceptation

**Côté admin (envoi)**
- **Given** un admin va sur `/admin/artists` et clique "Inviter un artiste", **when** le modal s'ouvre, **then** il saisit : email, nom de scène, niveau (L1–L4), type de set, message personnalisé optionnel.
- **Given** l'admin soumet, **when** validé, **then** un enregistrement `artist_invitations` est créé, un email d'invitation est envoyé à l'artiste, l'admin voit l'invitation dans une liste "Invitations en attente".
- **Given** une invitation en attente, **when** affichée dans `/admin/artists`, **then** elle apparaît avec un badge "Invité — en attente d'acceptation" et un bouton "Renvoyer l'invitation".
- **Given** l'admin clique "Renvoyer", **when** confirmé, **then** un nouveau token est généré (l'ancien est révoqué), un nouvel email part. Limite : 1 renvoi / 10 minutes.
- **Given** l'admin clique "Révoquer l'invitation", **when** confirmé, **then** le token est invalidé, l'invitation passe en `revoked`.
- **Given** une invitation a > 14 jours et n'est pas acceptée, **when** la liste est consultée, **then** un badge "Expirée" est affiché.

**Côté artiste invité (réception et acceptation)**
- **Given** l'artiste reçoit l'email, **when** il clique sur le lien, **then** il atterrit sur `/artist/invitation?token=<raw>`.
- **Given** le token est valide, **when** la page charge, **then** elle affiche : "Bienvenue chez Gazmatek, [nom]. L'agence vous invite à rejoindre le roster." + bouton "Continuer".
- **Given** l'artiste continue, **when** dirigé, **then** il remplit le formulaire d'inscription : confirmation email (pré-rempli, non modifiable), mot de passe (min 12 caractères), confirmation mot de passe, acceptation des CGU et de la politique de confidentialité (case obligatoire).
- **Given** le formulaire est soumis, **when** validé, **then** un compte `artist_accounts` est créé, lié à l'artiste correspondant, l'invitation passe en `accepted_at`, l'utilisateur est redirigé vers la signature du contrat d'engagement (S-51).
- **Given** le contrat est signé (S-51), **when** complété, **then** l'artiste est marqué comme `onboarding_completed_at`, peut accéder à `/artist/*`, mais `is_published` reste `false` jusqu'à validation admin (workflow contrôlé).
- **Given** un token expiré ou invalide, **when** la page charge, **then** message d'erreur clair + invitation à contacter l'agence.
- **Given** un token déjà consommé, **when** rappelé, **then** redirection vers login.

### Spécifications techniques

**Backend** :
- Nouvelles tables :
  ```sql
  CREATE TYPE artist_invitation_status AS ENUM (
    'pending',
    'accepted',
    'expired',
    'revoked'
  );

  CREATE TABLE artist_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    stage_name TEXT NOT NULL,
    level TEXT NOT NULL,             -- ArtistLevel
    set_type TEXT NOT NULL,          -- ArtistSetType
    custom_message TEXT,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status artist_invitation_status NOT NULL DEFAULT 'pending',
    invited_by UUID NOT NULL REFERENCES admin_users(id),
    artist_id UUID REFERENCES artists(id),  -- rempli à l'acceptation
    accepted_at TIMESTAMPTZ,
    last_resent_at TIMESTAMPTZ,
    resend_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_invitation_token ON artist_invitations(token_hash);
  CREATE INDEX idx_invitation_status ON artist_invitations(status);

  ALTER TABLE artists
    ADD COLUMN onboarding_completed_at TIMESTAMPTZ,
    ADD COLUMN engagement_contract_id UUID REFERENCES contracts(id);
  ```
- Routes admin :
  - `POST /api/admin/artists/invitations` body `{ email, stage_name, level, set_type, custom_message? }`.
  - `GET /api/admin/artists/invitations?status=`.
  - `POST /api/admin/artists/invitations/:id/resend`.
  - `POST /api/admin/artists/invitations/:id/revoke`.
- Routes publiques :
  - `GET /api/artist/invitations/:token` → métadonnées (stage_name, email) si token valide, sinon 410/404.
  - `POST /api/artist/invitations/:token/accept` body `{ password, cguAccepted, privacyAccepted }` → crée `artist_accounts` + `artists` (ou rattache si existant) + retourne JWT + URL signature contrat.
- Service `ArtistInvitationService` :
  - `create(adminId, input)` : génère token 32 bytes, hash, expire `INVITATION_TTL_DAYS = 14`.
  - `resend(invitationId)` : génère nouveau token, révoque ancien, increment `resend_count`.
  - `accept(rawToken, input)` : crée compte + artiste, status=`accepted`.
- Constantes :
  ```ts
  export const INVITATION_TTL_DAYS = 14;
  export const INVITATION_RESEND_MIN_INTERVAL_MIN = 10;
  ```
- Template email : `artistInvitation/{fr,nl,en}.html` avec lien `${APP_BASE_URL}/artist/invitation?token=<raw>`.

**Frontend** :
- Modal admin : `src/pages/AdminArtists/InviteArtistModal/InviteArtistModal.tsx`.
- Pages artiste :
  - `src/pages/ArtistInvitationLanding/ArtistInvitationLanding.tsx` — landing après clic email.
  - `src/pages/ArtistInvitationRegister/ArtistInvitationRegister.tsx` — choix mot de passe + CGU.
- État onboarding : flag affiché dans le menu artiste tant que `onboarding_completed_at` IS NULL ("Complétez votre inscription").

### Dépendances inter-stories
- [EPIC-04 S-16](EPIC-04.md) : auth artiste (consomme).
- [EPIC-05 S-22](EPIC-05.md) : étend le CRUD artistes avec le flow d'invitation à la place de la création directe.
- S-51 : signature contrat enchaînée juste après acceptation.
- S-35 (mailer) : nouveau template.

### Edge cases & risques
- Artiste invité avec un email déjà existant en base (autre invitation, ou compte) : si déjà compte → erreur "Cet artiste a déjà un compte". Si invitation pending → message à l'admin proposant de renvoyer plutôt que recréer.
- Token deviné : 256 bits aléatoires, hashés, rate-limit IP sur `GET /api/artist/invitations/:token`.
- Spam d'invitations : limite `INVITATION_RESEND_MIN_INTERVAL_MIN`, max `MAX_RESENDS = 5` par invitation.
- Artiste change d'avis après acceptation : admin peut désactiver (`is_active=false`) ; pas de "désinscription" V1.
- Référence event-planner : reprendre la même structure (token, statut, resend) — ne pas copier le code mais l'architecture.

### DoD
- Test backend complet : invitation → acceptation → compte créé → JWT retourné.
- Test : token expiré → 410.
- Test : 2 acceptations simultanées du même token → la 2e échoue avec 409.
- Audit log de toute action invitation.
- Email rendu OK dans les 3 langues.

---

## S-51 — Contrat d'engagement artiste signé électroniquement à l'inscription (Documenso)

**En tant que** Système, **je veux** que tout artiste nouvellement inscrit signe électroniquement le contrat d'engagement avec l'agence avant de pouvoir être réservé, **afin de** sécuriser juridiquement la relation et garantir que seuls les artistes contractualisés apparaissent au booking.

**Estimation** : L

> **Décision provider — verrouillée** : signature électronique via **Documenso** (open-source, self-hosted). Même provider que [EPIC-04 S-20](EPIC-04.md). Pas de Yousign / DocuSign.
>
> **Référence implémentation** : reprendre **exactement** le fonctionnement des contrats bénévoles du repo `event-planner`. Avant de coder, **lire le code event-planner** (service Documenso, structure DB, webhook handler, frontend de signature). Le pattern à adapter est : `bénévole → contrat à signer avant activation` devient `artiste → contrat d'engagement à signer avant activation`. Noms de champs, structure d'appels API, format de webhook, conventions UI : **alignement strict** pour qu'un dev qui connaît event-planner retrouve ses repères.
>
> **Setup local Documenso** : copier la stack Docker Documenso depuis `event-planner/docker-compose.yml` (service Documenso self-hosted + DB associée + variables `.env.example`). Récupérer tel quel — n'adapter que les ports, noms de containers et préfixes `${ENVIRONMENT}-${APP_NAME}-...` propres à Gazmatek (cf. `backend/AGENTS.md` "Container naming convention"). **Un seul service Documenso pour les deux stories (S-20 + S-51)** ; pas de duplication, l'instance gère les deux types de contrats.

### Contexte & enjeux
Différent du contrat de prestation par booking ([EPIC-04 S-20](EPIC-04.md)) : ici on parle du contrat-cadre entre l'agence et l'artiste, signé une fois à l'onboarding, valable pour la durée de la collaboration. Même infrastructure Documenso que S-20, juste un `kind = 'engagement'` au lieu de `'booking'`.

### Critères d'acceptation

**Génération du contrat**
- **Given** un artiste vient d'accepter une invitation (S-50), **when** son compte est créé, **then** un contrat d'engagement est généré à partir d'un template (PDF), pré-rempli avec : nom de scène, email, niveau, type de set, date de génération, conditions générales (clauses commission, exclusivité, durée, résiliation).
- **Given** le PDF est généré, **when** stocké, **then** il est dans le storage avec clé `contracts/engagement/<artistId>/<contractId>.pdf` + entrée DB `contracts` avec `kind = 'engagement'`.

**Signature**
- **Given** l'artiste est redirigé après acceptation invitation, **when** il arrive sur `/artist/onboarding/contract`, **then** il voit : preview du PDF embedded, scroll obligatoire jusqu'en bas, checkbox "J'ai lu et j'accepte les termes", bouton "Signer" désactivé jusqu'à validation des deux.
- **Given** l'artiste clique "Signer", **when** le flow de signature démarre, **then** une session est ouverte chez le provider de signature (Yousign / DocuSign — réutilise S-20), l'artiste signe via le widget embarqué.
- **Given** la signature est complétée côté provider, **when** le webhook arrive, **then** le contrat passe en `status=signed`, `signed_at` est rempli, le PDF signé est stocké, `artist.engagement_contract_id` est renseigné, `artist.onboarding_completed_at = NOW()`.
- **Given** l'artiste tente d'accéder à `/artist/profile` ou `/artist/bookings` avant signature, **when** la requête est faite, **then** redirection automatique vers `/artist/onboarding/contract`.

**Affichage et accès**
- **Given** l'admin sur `/admin/artists/:id`, **when** la fiche est affichée, **then** un badge montre l'état du contrat d'engagement : "À envoyer", "En attente de signature", "Signé le X", "Expiré".
- **Given** l'artiste sur `/artist/profile`, **when** la section "Contrat" est affichée, **then** il peut télécharger son contrat signé à tout moment.
- **Given** un admin tente de publier un artiste (`is_published=true`) dont le contrat n'est pas signé, **when** action faite, **then** rejet 422 avec message "Le contrat d'engagement doit être signé avant publication".

**Renouvellement (V2 prévu, hors scope V1)**
- En V1 : durée illimitée du contrat. Pas de mécanisme d'expiration automatique. V2 : champ `valid_until`, alerte 30 jours avant.

**Modifications de termes**
- **Given** l'agence modifie le template (clause majeure), **when** déployé, **then** un admin peut déclencher manuellement la signature d'un avenant pour les artistes existants (route `POST /api/admin/artists/:id/engagement-contract/amend`). V1 : pas d'auto-replay.

### Spécifications techniques

**Backend** :
- Extension table `contracts` :
  ```sql
  ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'expired';

  ALTER TABLE contracts
    ADD COLUMN kind TEXT NOT NULL DEFAULT 'booking',  -- 'booking' | 'engagement'
    ADD COLUMN artist_id UUID REFERENCES artists(id),
    ADD COLUMN template_version TEXT NOT NULL DEFAULT 'v1';

  -- booking_id devient nullable car le contrat d'engagement n'a pas de booking
  ALTER TABLE contracts ALTER COLUMN booking_id DROP NOT NULL;

  ALTER TABLE contracts
    ADD CONSTRAINT contract_kind_check CHECK (
      (kind = 'booking' AND booking_id IS NOT NULL) OR
      (kind = 'engagement' AND artist_id IS NOT NULL)
    );
  ```
- **Provider de signature : Documenso** (même instance et même `documensoService` que S-20). Aucun fork, aucun second service.
- Champs DB additionnels (mêmes noms que event-planner / S-20) :
  ```sql
  -- déjà ajoutés par S-20, à réutiliser tels quels :
  -- documenso_document_id, documenso_recipient_id, documenso_signing_url
  ```
- Génération PDF : librairie `pdfkit`, `pdf-lib` ou template HTML → PDF via `puppeteer`. **Recommandation V1** : `pdfkit` (léger, pas de dépendance Chromium). **Si event-planner utilise déjà une méthode de génération PDF pour les contrats bénévoles, la reprendre à l'identique** au lieu d'introduire une autre librairie.
- Template : `backend/src/services/contracts/templates/engagement/{fr,nl,en}.ts` retournant une fonction `(artist) => PDFDocument`.
- Routes :
  - `POST /api/artist/onboarding/engagement/generate` (auth artiste, idempotent : ne génère pas si déjà signé).
  - `POST /api/artist/onboarding/engagement/sign` → crée le document Documenso si pas déjà fait, ajoute le destinataire, retourne `signingUrl` Documenso.
  - `POST /api/webhooks/documenso` (existant S-20) — handler étendu pour router selon `contracts.kind` (`booking` vs `engagement`) et déclencher les hooks appropriés.
  - `GET /api/artist/onboarding/engagement` → renvoie `{ status, pdfUrl, signedPdfUrl?, signedAt?, documensoSigningUrl? }`.
- Service `EngagementContractService` :
  - `generateForArtist(artistId)` → PDF local + entrée DB.
  - `startSignature(contractId)` → appel `documensoService.createDocument` + `addRecipient` + `sendDocument`, persiste `documenso_document_id`, `documenso_recipient_id`, `documenso_signing_url`.
  - `markSigned(contractId, documensoDocumentId, signedPdf)` → idempotent sur `documenso_document_id`.
- Garde de publication : dans `ArtistAdminService.publish(artistId)`, vérifier `engagement_contract_id` lié à un contract `signed`, sinon throw `ArtistEngagementNotSignedError` (422).
- Garde de booking : dans `BookingService.create`, refuser si l'artiste n'a pas `onboarding_completed_at` (sauf `BookingAdminService.createManual` avec override admin).

**Frontend** :
- Pages :
  - `src/pages/ArtistOnboardingContract/ArtistOnboardingContract.tsx` — preview PDF + checkbox + signature.
- Composants :
  - `src/components/PdfPreview/PdfPreview.tsx` — wrapper autour de `react-pdf` ou `<iframe>` du PDF.
  - Détection scroll bottom du PDF : observer + `pdf.numPages === currentPage`.
- Route guard : `<ArtistOnboardingGuard>` intercale tous les accès `/artist/*` (sauf `/artist/onboarding/*`) tant que `onboarding_completed_at` est null.

### Dépendances inter-stories
- S-50 : déclencheur immédiat.
- [EPIC-04 S-20](EPIC-04.md) : **infrastructure Documenso partagée** (service `documensoService`, webhook, stack Docker). S-51 ne réinstancie rien — elle consomme.
- [EPIC-05 S-22](EPIC-05.md) : ajout du garde de publication.
- [EPIC-02 S-07](EPIC-02.md) : ajout du garde de réservation.
- **Pré-requis bloquant** : lire le code event-planner (contrats bénévoles) avant d'écrire la moindre ligne. Documenter dans la PR les fichiers event-planner pris en référence.

### Edge cases & risques
- Artiste refuse de signer : il garde un compte mais ne peut pas être publié ni booké. Admin peut révoquer (`artist_accounts.is_active=false`) après X jours sans signature.
- Documenso down au moment crucial : afficher état "Réessayer plus tard", ne pas bloquer la création du compte (l'artiste pourra revenir signer plus tard via le menu onboarding).
- Modification du template entre invitation et signature : la version du template (`template_version`) est figée au moment de la génération. Si l'agence souhaite forcer une nouvelle version, elle régénère manuellement.
- Conformité légale eIDAS : Documenso fournit une signature électronique avancée — suffisante pour un contrat artiste-agence en BE. À valider par le juriste de Gazmatek si signature qualifiée requise.
- PDF lourd (> 5 MB) : peu probable mais limiter génération à < 2 MB.
- Artistes existants au déploiement de la story : migration de données initiale créant les contrats pour les artistes déjà actifs, marqués `signed` automatiquement s'ils ont déjà un contrat papier (script one-shot avec flag `--legacy-imported`).
- Routage du webhook entre `booking` et `engagement` : un seul endpoint `/api/webhooks/documenso`, switch interne sur `contracts.kind` après lookup par `documenso_document_id`.

### DoD
- Stack Docker Documenso copiée depuis event-planner et opérationnelle en local (`docker compose up documenso`).
- Variables Documenso documentées dans `backend/docs/EnvVariables.md` (`DOCUMENSO_API_URL`, `DOCUMENSO_API_KEY`, `DOCUMENSO_WEBHOOK_SECRET`, `DOCUMENSO_SIGN_RETURN_URL`).
- Code event-planner référencé explicitement dans la PR (commits / fichiers consultés).
- Test backend : génération PDF → entrée `contracts` créée → flow signature Documenso → status `signed`.
- Test : artiste sans contrat signé bloqué sur `/artist/bookings` (garde guard).
- Test : admin ne peut pas publier un artiste sans contrat signé (422).
- Test : webhook Documenso idempotent (rejouer deux fois → un seul update).
- Test : webhook avec mauvaise signature HMAC → 401.
- Audit log complet : generate, start signature, signed.
- PDF rendu OK dans les 3 langues (test visuel + diff snapshot).

---

## S-52 — Centralisation des routes API frontend (`API_ROUTES`)

**En tant que** Développeur, **je veux** toutes les routes API consommées par le frontend centralisées dans un fichier `src/config/apiRoutes.ts`, **afin de** éviter les strings hardcodés disséminés dans les composants et garantir un point unique de mise à jour quand l'API évolue.

**Estimation** : M

### Contexte & enjeux
Le fichier `src/config/apiRoutes.ts` existe déjà mais est vide. Le pattern est repris du repo `event-planner`. Aujourd'hui, des composants utilisent `appFetch("/api/artists")` avec la string en dur — ça empêche de tracer les usages d'un endpoint, complique les renommages, et viole la règle "no magic strings".

### Critères d'acceptation
- **Given** le fichier `src/config/apiRoutes.ts`, **when** consulté, **then** il exporte une constante `API_ROUTES` regroupant toutes les routes par domaine (public, account, artist, admin, webhooks).
- **Given** un endpoint avec param dynamique (ex. `/api/artists/:slug`), **when** consommé, **then** une fonction builder est exportée à côté (ex. `artistDetailPath(slug: string)`) — pas de string `.replace(':slug', ...)` éparpillée.
- **Given** un appel `appFetch` dans le code frontend, **when** la PR est ouverte, **then** l'URL est référencée via `API_ROUTES` ou un builder, jamais via une chaîne littérale.
- **Given** un endpoint qui change côté backend, **when** la modification est faite, **then** un seul fichier (`apiRoutes.ts`) doit être mis à jour côté frontend.
- **Given** un linter custom ou un script d'audit, **when** exécuté, **then** il détecte les chaînes commençant par `/api/` hardcodées dans `src/` (hors `apiRoutes.ts`) et échoue.

### Spécifications techniques

**Frontend** :
- `src/config/apiRoutes.ts` :
  ```ts
  export const API_ROUTES = {
    // Public
    artistsList: "/api/artists",
    artistDetail: "/api/artists/:slug",
    artistAvailability: "/api/artists/:id/availability",
    pricingEstimate: "/api/pricing/estimate",
    pricingArtistFee: "/api/pricing/artist-fee",
    contact: "/api/contact",

    // Bookings (public side)
    bookingsCreate: "/api/bookings",
    bookingValidate: "/api/bookings/validate",
    bookingPaymentIntent: "/api/bookings/:id/payment-intent",

    // Client account
    accountMagicLink: "/api/account/magic-link",
    accountMagicCallback: "/api/account/magic-callback",
    accountMe: "/api/account/me",
    accountBookings: "/api/account/bookings",
    accountBookingDetail: "/api/account/bookings/:id",
    accountLogout: "/api/account/logout",

    // Artist
    artistAuthLogin: "/api/artist/auth/login",
    artistAuthForgotPassword: "/api/artist/auth/forgot-password",
    artistAuthResetPassword: "/api/artist/auth/reset-password",
    artistProfile: "/api/artist/profile",
    artistProfilePhotos: "/api/artist/profile/photos",
    artistProfilePhotoDetail: "/api/artist/profile/photos/:id",
    artistBookings: "/api/artist/bookings",
    artistBookingDetail: "/api/artist/bookings/:id",
    artistBookingContract: "/api/artist/bookings/:id/contract",
    artistUnavailabilities: "/api/artist/unavailabilities",
    artistUnavailabilityDetail: "/api/artist/unavailabilities/:id",
    artistInvitationLanding: "/api/artist/invitations/:token",
    artistInvitationAccept: "/api/artist/invitations/:token/accept",
    artistOnboardingEngagement: "/api/artist/onboarding/engagement",
    artistOnboardingEngagementSign: "/api/artist/onboarding/engagement/sign",

    // Admin
    adminArtists: "/api/admin/artists",
    adminArtistDetail: "/api/admin/artists/:id",
    adminArtistPhotos: "/api/admin/artists/:id/photos",
    adminArtistPhotoDetail: "/api/admin/artists/:id/photos/:photoId",
    adminArtistCoverImage: "/api/admin/artists/:id/cover-image",
    adminArtistInvitations: "/api/admin/artists/invitations",
    adminArtistInvitationResend: "/api/admin/artists/invitations/:id/resend",
    adminArtistInvitationRevoke: "/api/admin/artists/invitations/:id/revoke",
    adminArtistUnavailabilities: "/api/admin/artists/:id/unavailabilities",
    adminBookings: "/api/admin/bookings",
    adminBookingDetail: "/api/admin/bookings/:id",
    adminBookingApprove: "/api/admin/bookings/:id/approve",
    adminBookingReject: "/api/admin/bookings/:id/reject",
    adminBookingPayments: "/api/admin/bookings/:id/payments",
    adminBookingContract: "/api/admin/bookings/:id/contract",
    adminContractRemind: "/api/admin/contracts/:id/remind",
    adminCalendar: "/api/admin/calendar",
    adminContent: "/api/admin/content",
    adminContentBlock: "/api/admin/content/:key",
  } as const;

  export type ApiRouteKey = keyof typeof API_ROUTES;
  ```

- Builders (`src/config/apiRouteBuilders.ts`) pour les routes paramétrées :
  ```ts
  import { API_ROUTES } from "./apiRoutes";

  export const buildArtistDetailUrl = (slug: string): string =>
    API_ROUTES.artistDetail.replace(":slug", encodeURIComponent(slug));

  export const buildArtistAvailabilityUrl = (id: string): string =>
    API_ROUTES.artistAvailability.replace(":id", encodeURIComponent(id));

  export const buildAccountBookingDetailUrl = (id: string): string =>
    API_ROUTES.accountBookingDetail.replace(":id", encodeURIComponent(id));

  // ... un builder par route paramétrée
  ```

- Helper générique `replaceParams(template, params)` accepté en complément si plus pratique :
  ```ts
  export function replaceApiParams<T extends string>(
    template: T,
    params: Record<string, string>
  ): string {
    let out: string = template;
    for (const [k, v] of Object.entries(params)) {
      out = out.replace(`:${k}`, encodeURIComponent(v));
    }
    return out;
  }
  ```
  Usage : `replaceApiParams(API_ROUTES.artistDetail, { slug })`.

- Migration : sweep complet du repo frontend, remplacer chaque `appFetch("/api/...")` par `appFetch(API_ROUTES.xxx)` ou un builder. Aucune chaîne `/api/` ne doit subsister hors `apiRoutes.ts` / builders.

- Règle linter (à ajouter dans `eslint.config.*`) :
  ```js
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/config/apiRoutes.ts", "src/config/apiRouteBuilders.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^\\/api\\//]",
          message: "Use API_ROUTES from @/config/apiRoutes instead of hardcoded API path.",
        },
      ],
    },
  }
  ```

### Dépendances inter-stories
- Toutes les stories de cet epic qui font des appels API doivent l'utiliser dès leur implémentation.
- [EPIC-01 à EPIC-07](README.md) : sweep rétroactif des appels existants.

### Edge cases & risques
- Routes très paramétrées (multi-params) : utiliser `replaceApiParams` ou builder dédié. Éviter les `template.replace().replace()` en chaîne.
- Évolution de l'API : si une route change, mettre à jour `apiRoutes.ts` + relancer les tests. La règle ESLint empêche d'oublier un usage.
- Webhooks (côté backend uniquement) : ne pas inclure dans `API_ROUTES` frontend (le frontend ne les appelle pas).
- Routes publiques vs authentifiées : organiser par section avec commentaires, garder dans un seul objet pour éviter la fragmentation.
- Encoding : toujours `encodeURIComponent` dans les builders, ne pas se reposer sur le composant appelant.

### DoD
- `src/config/apiRoutes.ts` exhaustif et exporté.
- Builders pour chaque route paramétrée.
- Aucune chaîne `"/api/..."` hardcodée dans le code (hors fichier de routes).
- Règle ESLint active et CI verte.
- Documentation rapide dans `frontend/AGENTS.md` : "Toutes les routes API doivent passer par `API_ROUTES` ou ses builders".
