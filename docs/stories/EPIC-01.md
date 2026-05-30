# EPIC-01 — Site vitrine

> **Objectif** : Présenter l'agence Gazmatek, son catalogue d'artistes et amener le visiteur à initier une demande de booking.
> **Statut** : à implémenter
> **Stories** : 6 (S-01 à S-06)

---

## Périmètre

### In scope
- Pages publiques : accueil, catalogue artistes, fiche artiste, contact, simulateur de prix.
- Affichage des artistes, bios, photos, disponibilités publiques, tarif estimatif.
- CTA principal vers le formulaire de demande de booking (cf. [EPIC-02](EPIC-02.md)).
- SEO : balises `<title>`, `<meta description>`, OpenGraph, sitemap.xml, robots.txt.

### Out of scope
- Soumission effective du booking (cf. [EPIC-02](EPIC-02.md)).
- Calendrier interactif détaillé (cf. [EPIC-03](EPIC-03.md)).
- Espaces authentifiés (cf. [EPIC-04](EPIC-04.md) et [EPIC-05](EPIC-05.md)).

## Dépendances

- [EPIC-06 — Multilingue](EPIC-06.md) : toutes les pages doivent être traduisibles dès leur création.
- [EPIC-03 — Agenda](EPIC-03.md) : la fiche artiste consomme l'API `GET /api/artists/:id/availability` (story S-12).
- [EPIC-05 — Espace admin](EPIC-05.md) : le contenu des artistes vient du CRUD admin (story S-22).

## Modèle de données (extrait)

```sql
-- table artists
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  bio_fr TEXT,
  bio_nl TEXT,
  bio_en TEXT,
  hourly_rate_cents INTEGER NOT NULL,
  travel_rate_cents_per_km INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE artist_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_fr TEXT, alt_nl TEXT, alt_en TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
```

---

## S-01 — Page d'accueil

**En tant que** Visiteur, **je veux** accéder à une page d'accueil présentant l'agence, ses services et les artistes mis en avant, **afin de** comprendre rapidement la proposition de valeur et trouver un artiste qui m'intéresse.

**Estimation** : M

### Contexte & enjeux
La page d'accueil est le point d'entrée principal. Elle doit en moins de 5 secondes communiquer : (a) ce que fait l'agence, (b) quels types d'artistes elle représente, (c) comment réserver.

### Critères d'acceptation
- **Given** un visiteur arrive sur `/`, **when** la page est chargée, **then** il voit un hero avec le nom Gazmatek, un sous-titre, et un CTA "Réserver un artiste".
- **Given** la page d'accueil, **when** elle est rendue, **then** une section "Artistes en vedette" affiche entre 3 et 8 artistes (`is_published = TRUE` et `is_featured = TRUE`), chaque carte étant cliquable et menant vers `/artists/:slug`.
- **Given** un visiteur scrolle, **when** il atteint la section services, **then** il voit les types de prestations couvertes (DJ, live, animation, etc.) avec icône, titre et courte description.
- **Given** un visiteur ouvre la page sur mobile (< 640px), **when** la mise en page est rendue, **then** les sections s'empilent en colonne unique sans dépassement horizontal.
- **Given** la page est chargée, **when** on inspecte le DOM, **then** un seul `<h1>` est présent et `<title>` et `<meta description>` sont remplis dans la langue active.

### Spécifications techniques

**Frontend** :
- Route : `/` (mono) ou `/:lang/` (i18n) — voir `src/config/pages.ts`.
- Composant page : `src/pages/Home/Home.tsx` avec sous-sections en dossiers enfants : `Hero/`, `FeaturedArtists/`, `ServicesGrid/`, `CtaBanner/`.
- Données featured artists : appel `appFetch("/api/artists?featured=true&limit=8")` (SSR-friendly futur, pour l'instant CSR + skeleton).
- SEO : composant `SeoHead` avec clés `seo.home.title`, `seo.home.description`.
- Animations : `useScrollAnimation()` pour les sections.

**Backend** :
- Route `GET /api/artists` — query params `featured` (bool), `limit` (int, max 50), `lang` (`fr` | `nl` | `en`).
- Validation Zod : `src/schemas/artist.ts`.
- Service `ArtistService.listPublic({ featured, limit, lang })`.
- Query pgtyped : `listPublishedArtists.sql`.

### Dépendances inter-stories
- S-22 (admin CRUD artistes) doit fournir des artistes pour que cette page ne soit pas vide.

### Edge cases & risques
- Aucun artiste featured : afficher fallback "Découvrir nos artistes" pointant vers `/artists`.
- Image manquante : fallback placeholder neutre.
- Erreur API : afficher message non bloquant + toast, page reste utilisable.

### DoD
- Tests Vitest sur `Home.tsx` (rendu OK, fallback OK, CTA cliquable).
- Test d'intégration backend sur `GET /api/artists`.
- Lighthouse perf ≥ 85 desktop, accessibilité ≥ 95.

---

## S-02 — CTA visible vers le booking

**En tant que** Visiteur, **je veux** voir un call-to-action visible pour initier une demande de booking, **afin de** pouvoir entamer le processus sans chercher où cliquer.

**Estimation** : S

### Contexte & enjeux
Conversion : le CTA doit être présent partout dans le tunnel public, pas seulement sur l'accueil.

### Critères d'acceptation
- **Given** un visiteur est sur `/`, `/artists`, `/artists/:slug` ou `/contact`, **when** la page est chargée, **then** au moins un CTA "Réserver" est visible above-the-fold.
- **Given** un visiteur clique sur le CTA, **when** l'action est exécutée, **then** il est redirigé vers `/booking/new` (avec, le cas échéant, l'`artistId` pré-rempli si CTA cliqué depuis une fiche artiste).
- **Given** le visiteur scrolle longuement (> 50% de la page), **when** la position est atteinte, **then** une barre sticky bottom affiche le CTA (mobile uniquement).
- **Given** le CTA est rendu, **when** un lecteur d'écran le lit, **then** il annonce explicitement l'action ("Réserver un artiste") via `aria-label`.

### Spécifications techniques

**Frontend** :
- Composant : `src/components/BookingCta/BookingCta.tsx` avec props `{ artistId?: string; variant: "primary" | "sticky" }`.
- Construction de l'URL via helper `buildBookingUrl(artistId?)` dans `src/config/pages.ts`.
- Sticky variant : visible uniquement sur breakpoint `< $breakpoint-md-3` (768px), animé via GSAP fade-in après 30% de scroll.

**Backend** : n/a (purement frontend).

### Dépendances inter-stories
- S-07 (formulaire de demande) : la cible du CTA doit exister.

### Edge cases & risques
- Double CTA sticky + hero : ne pas afficher le sticky si le hero CTA est visible (IntersectionObserver).

### DoD
- Test Vitest : vérifier présence du CTA sur 4 routes publiques (mock router).
- Lien et `aria-label` traduits dans les 3 langues.

---

## S-03 — Catalogue d'artistes

**En tant que** Visiteur, **je veux** consulter la liste complète des artistes de l'agence, **afin de** trouver celui qui correspond à mon besoin.

**Estimation** : M

### Contexte & enjeux
Page indexable SEO, pivot du tunnel de conversion entre l'accueil et la fiche artiste.

### Critères d'acceptation
- **Given** un visiteur va sur `/artists`, **when** la page charge, **then** tous les artistes publiés sont listés en grille (paginée si > 24).
- **Given** la page liste, **when** des filtres sont disponibles, **then** le visiteur peut filtrer par : style musical / type de prestation, fourchette de tarif, disponibilité sur une date.
- **Given** un filtre est appliqué, **when** la grille se met à jour, **then** l'URL contient les params (`?genre=dj&max_price=2000&date=2026-08-12`) pour permettre le partage.
- **Given** aucun artiste ne correspond, **when** la grille est vide, **then** un état "Aucun artiste ne correspond à votre recherche" est affiché avec bouton "Réinitialiser les filtres".
- **Given** le visiteur clique sur une carte, **when** l'action est exécutée, **then** il arrive sur `/artists/:slug`.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/Artists/Artists.tsx` + sous-composants `Filters/`, `ArtistGrid/`, `ArtistCard/`.
- Pagination via `usePagination` de `covaltech-react-ui`.
- Lecture/écriture des query params via `useSearchParams` (React Router).

**Backend** :
- Route `GET /api/artists` (réutilisée de S-01) avec params additionnels : `genre`, `min_price`, `max_price`, `available_on` (date ISO), `page`, `page_size` (max 50).
- Service : `ArtistService.list(filters: ArtistListFilters)`.
- Query pgtyped : `listArtistsWithFilters.sql`. Pour `available_on`, jointure sur `artist_unavailabilities` (cf. EPIC-03).

### Dépendances inter-stories
- S-14 / S-15 (indisponibilités artistes) pour que le filtre date soit pertinent.

### Edge cases & risques
- Filtre date sans S-14/S-15 : retourner tout le catalogue + flag déprécié dans la réponse pour devtools.
- Beaucoup d'artistes : index DB sur `(is_published, stage_name)` et sur `slug`.
- Combinaison filtre + pagination : reset à page 1 quand un filtre change.

### DoD
- Test backend : `GET /api/artists?genre=dj&max_price=2000` retourne uniquement les artistes correspondants.
- Test frontend : navigation avec filtres et pagination, URL synchronisée.

---

## S-04 — Fiche artiste

**En tant que** Visiteur, **je veux** cliquer sur un artiste pour voir sa bio, ses photos, ses disponibilités, son tarif estimatif et ses infos de booking, **afin de** prendre ma décision et lancer une demande.

**Estimation** : L

### Contexte & enjeux
Page de conversion principale. Doit contenir suffisamment d'éléments de réassurance et un CTA fort.

### Critères d'acceptation
- **Given** un slug `artist-slug` valide, **when** le visiteur va sur `/artists/artist-slug`, **then** la page affiche : nom de scène, bio dans la langue active, galerie de photos, vidéos/extraits si fournis, tarif estimatif (tarif horaire + fourchette), pictos services proposés, CTA "Réserver cet artiste".
- **Given** un slug invalide, **when** la page est chargée, **then** un 404 est rendu avec lien retour catalogue.
- **Given** un artiste non publié, **when** un visiteur non admin accède à son URL, **then** un 404 est rendu.
- **Given** la fiche est chargée, **when** la section "Disponibilités" est visible, **then** un calendrier compact affiche les indispos sur 3 mois glissants (cf. S-12).
- **Given** le visiteur clique sur le CTA "Réserver", **when** l'action est exécutée, **then** il est redirigé vers `/booking/new?artistId=<id>`.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/ArtistDetail/ArtistDetail.tsx`. Sous-composants : `Hero/`, `Bio/`, `Gallery/`, `AvailabilityPreview/`, `PriceCard/`, `BookingCta/`.
- Galerie : lightbox accessible (clavier + ARIA), lazy load images.
- Calendrier compact : composant interne consommant `GET /api/artists/:id/availability?from=...&to=...`.

**Backend** :
- Route `GET /api/artists/:slug` — retourne l'artiste publié + photos + tarif.
- 404 si non trouvé ou non publié (sauf admin authentifié).
- Query pgtyped : `getArtistBySlug.sql`, `listArtistPhotos.sql`.

### Dépendances inter-stories
- S-12 (calendrier dispo).
- S-22 (CRUD artistes pour peupler les données).

### Edge cases & risques
- Bio absente dans la langue active : fallback automatique sur `en` puis `fr`.
- Galerie vide : section masquée.
- Cas où le tarif estimatif change après une demande envoyée → gel du tarif au moment du booking côté backend (cf. EPIC-02).

### DoD
- Test E2E : visiteur peut naviguer accueil → catalogue → fiche → CTA booking.
- Vérifier OpenGraph (image cover, titre, description) pour partages réseaux sociaux.
- A11y : navigation clavier dans la galerie OK.

---

## S-05 — Simulateur de coût

**En tant que** Visiteur, **je veux** simuler le coût d'un booking selon la durée, le lieu, le déplacement et les options, **afin de** estimer mon budget avant de soumettre une demande.

**Estimation** : L

### Contexte & enjeux
Outil de transparence tarifaire. Le résultat doit être clairement marqué comme **estimation** et non engagement contractuel.

### Critères d'acceptation
- **Given** un visiteur est sur une fiche artiste ou sur `/pricing`, **when** il ouvre le simulateur, **then** il peut saisir : durée (heures), date, lieu (code postal ou adresse), nombre de techniciens, options (matériel, animation, etc.).
- **Given** les champs sont remplis, **when** le visiteur clique "Estimer", **then** le système retourne en moins de 2s : total HT, total TTC, ventilation (artiste, déplacement, options), mention "Estimation non contractuelle".
- **Given** le visiteur a une estimation, **when** il clique "Réserver", **then** il est redirigé vers `/booking/new?artistId=...&duration=...&date=...&location=...&options=...` (params pré-remplis).
- **Given** un champ obligatoire est vide, **when** le visiteur clique "Estimer", **then** un message d'erreur localisé apparaît sous le champ.
- **Given** une adresse hors zone de service, **when** le calcul est fait, **then** un message dédié s'affiche : "Cette zone n'est pas desservie, contactez-nous".

### Spécifications techniques

**Frontend** :
- Composant : `src/components/PriceSimulator/PriceSimulator.tsx`.
- Saisie d'adresse : intégration Mapbox / Google Places (à confirmer côté infra) → géolocalisation (lat, lng).
- Validation côté client : Zod côté front aussi (réutilisable depuis backend si possible).

**Backend** :
- Route `POST /api/pricing/estimate` (publique, rate-limit strict cf. EPIC-07).
- Body Zod :
  ```ts
  {
    artistId: string (uuid),
    durationHours: number (0.5..24),
    date: string (ISO date),
    location: { lat: number, lng: number, address?: string },
    options: string[] // ids d'options
  }
  ```
- Service `PricingService.estimate(input): PricingEstimate`. Calcul :
  - `artistCost = artist.hourly_rate * durationHours`
  - `travelCost = distance_km * artist.travel_rate_cents_per_km` (distance via service externe ou matrice cached)
  - `optionsCost = somme des options.price_cents`
  - TVA 21% (Belgique) appliquée pour total TTC.
- Pas de persistence — pur calcul. Mais log applicatif (audit volumétrie).

#### Sous-module : calcul du cachet artiste (`computeArtistFee`)

Quand le booking concerne un événement billetté (festival, salle, club), le cachet artiste suit une grille **capacité × prix du billet × niveau artiste × type de set**, avec un plancher (`floor`) et un plafond (`cap`).

**Référentiel** (à centraliser dans `backend/src/services/pricing/pricingConstants.ts` lors de l'implémentation, jamais de magic number en service) :

| Niveau | Multiplicateur < 2 000 pax | Multiplicateur ≥ 2 000 pax |
|---|---|---|
| L1 | ×20 | ×30 |
| L2 | ×30 | ×40 |
| L3 | ×40 | ×50 |
| L4 | ×50 | ×60 |

| Type de set | Uplift |
|---|---|
| `dj` | ×1.00 |
| `hybrid` | ×1.10 |
| `live` | ×1.15 |

| Borne | < 2 000 pax | ≥ 2 000 pax |
|---|---|---|
| Floor multiplier | 20 | 30 |
| Cap multiplier | 50 | 60 |

**Exemples (cf. tableaux business)** :
- Cap 500, ticket 15 €, L2, DJ → recommended = `30 × 15 = 450 €`, range `[300, 750]`.
- Cap 1 000, ticket 20 €, L3, hybrid → recommended = `round(40 × 1.10) × 20 = 44 × 20 = 880 €`, range `[400, 1000]`.
- Cap 2 500, ticket 25 €, L4, live → recommended = `round(60 × 1.15) × 25 = 69 × 25 = 1 725 €`, range `[750, 1500]` (plafonné).

**Signature de la fonction** (TypeScript, conforme aux règles backend) :

```ts
// backend/src/services/pricing/pricingConstants.ts
export enum ArtistLevel {
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
  L4 = "L4",
}

export enum ArtistSetType {
  DJ = "dj",
  HYBRID = "hybrid",
  LIVE = "live",
}

export const LARGE_CAPACITY_THRESHOLD = 2000;

export const ARTIST_MULTIPLIERS_SMALL: Readonly<Record<ArtistLevel, number>> = {
  [ArtistLevel.L1]: 20,
  [ArtistLevel.L2]: 30,
  [ArtistLevel.L3]: 40,
  [ArtistLevel.L4]: 50,
};

export const ARTIST_MULTIPLIERS_LARGE: Readonly<Record<ArtistLevel, number>> = {
  [ArtistLevel.L1]: 30,
  [ArtistLevel.L2]: 40,
  [ArtistLevel.L3]: 50,
  [ArtistLevel.L4]: 60,
};

export const SET_TYPE_UPLIFT: Readonly<Record<ArtistSetType, number>> = {
  [ArtistSetType.DJ]: 1.0,
  [ArtistSetType.HYBRID]: 1.1,
  [ArtistSetType.LIVE]: 1.15,
};

export const FLOOR_MULTIPLIER_SMALL = 20;
export const FLOOR_MULTIPLIER_LARGE = 30;
export const CAP_MULTIPLIER_SMALL = 50;
export const CAP_MULTIPLIER_LARGE = 60;
```

```ts
// backend/src/services/pricing/artistFeeService.ts
import {
  ARTIST_MULTIPLIERS_LARGE,
  ARTIST_MULTIPLIERS_SMALL,
  ArtistLevel,
  ArtistSetType,
  CAP_MULTIPLIER_LARGE,
  CAP_MULTIPLIER_SMALL,
  FLOOR_MULTIPLIER_LARGE,
  FLOOR_MULTIPLIER_SMALL,
  LARGE_CAPACITY_THRESHOLD,
  SET_TYPE_UPLIFT,
} from "@src/services/pricing/pricingConstants";

export interface ArtistFeeInput {
  capacity: number;
  ticketPrice: number;
  level: ArtistLevel;
  setType: ArtistSetType;
}

export interface ArtistFeeResult {
  multiplier: number;
  recommended: number;
  range: [number, number];
  gross: number;
  pctGross: number;
}

export function computeArtistFee({
  capacity,
  ticketPrice,
  level,
  setType,
}: ArtistFeeInput): ArtistFeeResult {
  const isLarge = capacity >= LARGE_CAPACITY_THRESHOLD;

  const baseMult = isLarge
    ? ARTIST_MULTIPLIERS_LARGE[level]
    : ARTIST_MULTIPLIERS_SMALL[level];

  const uplift = SET_TYPE_UPLIFT[setType];
  const multiplier = Math.round(baseMult * uplift);

  const floorMult = isLarge ? FLOOR_MULTIPLIER_LARGE : FLOOR_MULTIPLIER_SMALL;
  const capMult = isLarge ? CAP_MULTIPLIER_LARGE : CAP_MULTIPLIER_SMALL;

  const recommended = Math.round(multiplier * ticketPrice);
  const floorFee = Math.round(floorMult * ticketPrice);
  const capFee = Math.round(capMult * ticketPrice);

  const gross = Math.round(capacity * ticketPrice);
  const pctGross = gross > 0 ? recommended / gross : 0;

  return {
    multiplier,
    recommended,
    range: [floorFee, capFee],
    gross,
    pctGross,
  };
}
```

**Tests obligatoires** :
- Petite capacité (< 2 000), chaque niveau L1–L4, set DJ → recommended = `multSmall × ticketPrice`.
- Grande capacité (≥ 2 000), chaque niveau, set DJ → recommended = `multLarge × ticketPrice`.
- Uplift `hybrid` et `live` : vérifier que `multiplier = round(baseMult × uplift)`.
- Floor et cap appliqués : `range[0] = floorMult × ticketPrice`, `range[1] = capMult × ticketPrice`.
- `capacity = 0` ou `ticketPrice = 0` → `pctGross = 0`, pas de division par zéro.
- `recommended` peut dépasser `cap` mathématiquement (cf. tableau L4 1 500 €) : c'est attendu, le `cap` reste une borne **indicative** et n'écrête pas `recommended` (le consommateur du résultat décide).

**Intégration UI** :
- Le simulateur frontend (S-05) ajoute une bascule "Événement billetté" qui révèle 4 inputs (capacité, prix billet, niveau, type de set) et appelle `POST /api/pricing/artist-fee` retournant `ArtistFeeResult`.
- Affichage : "Cachet recommandé : 880 € (fourchette 400 – 1 000 €, soit 4,4 % du brut)".

### Dépendances inter-stories
- S-04 (fiche artiste) : entrée principale.
- S-07 (formulaire de booking) : sortie principale.

### Edge cases & risques
- Distance non calculable (adresse invalide) : retour 422 avec code `INVALID_ADDRESS`.
- Provider de distance down : fallback sur une matrice de distance forfaitaire par province.
- Spam / abus : rate-limit `RATE_LIMIT_MAX_API` durci sur cette route, voire CAPTCHA après N requêtes.

### DoD
- Test backend : 5+ cas (distances, options multiples, hors zone, données invalides).
- Disclaimer "Estimation non contractuelle" visible et traduit.

---

## S-06 — Page contact

**En tant que** Visiteur, **je veux** accéder à une page de contact avec formulaire et coordonnées, **afin de** pouvoir poser une question sans nécessairement passer par le tunnel de booking.

**Estimation** : S

### Contexte & enjeux
Canal de capture secondaire pour les demandes informelles, partenariats, presse.

### Critères d'acceptation
- **Given** un visiteur va sur `/contact`, **when** la page charge, **then** elle affiche : formulaire (nom, email, sujet, message), adresse physique, email général, téléphone, liens réseaux sociaux.
- **Given** le formulaire est rempli, **when** le visiteur clique "Envoyer", **then** un email est envoyé à `MAILER_DEFAULT_TO` et un email de confirmation est envoyé à l'expéditeur.
- **Given** un champ est invalide, **when** la soumission est tentée, **then** un message d'erreur localisé apparaît.
- **Given** la soumission a réussi, **when** la réponse est reçue, **then** un toast "Message envoyé" s'affiche et le formulaire est réinitialisé.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/Contact/Contact.tsx`.
- Coordonnées tirées de `src/config/socials.ts`.
- Honeypot anti-spam (champ caché `website` qui doit rester vide).

**Backend** :
- Route `POST /api/contact` (publique, rate-limit strict).
- Validation Zod : `name`, `email` (format), `subject` (min 3), `message` (min 20, max 5000), `website` (doit être vide → sinon 422 silencieux).
- Service : `ContactService.sendMessage(input)` → utilise `mailer`.
- Pas de persistance DB initiale (V2 : table `contact_messages`).

### Dépendances inter-stories
- S-35 (emails automatiques) : la page contact utilise le service mailer.

### Edge cases & risques
- Spam : honeypot + rate-limit + (V2) reCAPTCHA invisible.
- Email mailer down : retour 503 utilisateur, log error, lien fallback `mailto:`.

### DoD
- Test backend : `POST /api/contact` envoie deux emails (admin + auto-réponse).
- Spam honeypot vérifié par test.
