# EPIC-03 — Agenda & disponibilités

> **Objectif** : Exposer les disponibilités des artistes (lecture publique simplifiée, lecture artiste détaillée) et permettre à un artiste de bloquer ses indisponibilités.
> **Stories** : 4 (S-12 à S-15)

---

## Périmètre

### In scope
- Calendrier public par artiste (vue 3 mois glissants).
- Indisponibilités personnelles ajoutées par l'artiste.
- Déclaration d'événements extérieurs (gigs hors agence) pour bloquer une date.
- Calcul agrégé : la disponibilité d'un artiste = (pas de booking confirmé) ET (pas d'indispo personnelle) ET (pas d'événement extérieur).

### Out of scope
- Calendrier global multi-artistes (cf. [EPIC-05 S-27](EPIC-05.md)).
- Synchronisation Google Calendar / Outlook (V2).

## Dépendances

- [EPIC-04 S-16](EPIC-04.md) : authentification artiste.
- [EPIC-02](EPIC-02.md) : les bookings `confirmed` rendent la date indisponible.

## Modèle de données

```sql
CREATE TYPE unavailability_source AS ENUM (
  'personal',    -- vacances, indispo, etc.
  'external_gig' -- événement hors agence
);

CREATE TABLE artist_unavailabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  source unavailability_source NOT NULL,
  external_event_title TEXT,  -- nullable, requis si source = external_gig
  external_event_location TEXT,
  notes TEXT,                  -- privé, jamais exposé en public
  created_by UUID NOT NULL REFERENCES artists(id),  -- ou admin user
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_unavail_artist_range
  ON artist_unavailabilities USING gist (
    artist_id, tstzrange(starts_at, ends_at, '[)')
  );
```

---

## S-12 — Calendrier public des disponibilités d'un artiste

**En tant que** Visiteur, **je veux** voir les disponibilités d'un artiste sur un calendrier public, **afin de** savoir si ma date est libre avant de soumettre une demande.

**Estimation** : M

### Contexte & enjeux
Outil de transparence et de conversion. Affichage simplifié : jour vert (libre), orange (partiel), rouge (indispo). Pas de détail privé.

### Critères d'acceptation
- **Given** une fiche artiste, **when** elle charge, **then** un calendrier sur 3 mois glissants est affiché.
- **Given** le calendrier, **when** un visiteur clique sur un jour libre, **then** il peut directement initier un booking pré-rempli avec cette date.
- **Given** un jour indispo, **when** un visiteur le survole/clique, **then** seule une mention "Indisponible" est affichée (jamais le motif).
- **Given** le visiteur navigue à un autre mois, **when** la nav est utilisée, **then** les données sont chargées à la demande (lazy).
- **Given** un fuseau différent du serveur, **when** le calendrier est rendu, **then** les jours sont calculés selon `APP_TIMEZONE` (Europe/Brussels).

### Spécifications techniques

**Frontend** :
- Composant : `src/components/PublicAvailabilityCalendar/PublicAvailabilityCalendar.tsx`.
- Date utils : timezone-aware via `Intl.DateTimeFormat` + helper interne.

**Backend** :
- Route `GET /api/artists/:id/availability?from=ISO&to=ISO` — publique.
- Réponse normalisée par jour :
  ```ts
  {
    days: Array<{ date: "YYYY-MM-DD", status: "free" | "partial" | "busy" }>
  }
  ```
- Service : `AvailabilityService.getPublic(artistId, from, to)`. Agrège bookings `confirmed` + `awaiting_deposit` + `pending_validation` (tous traités comme "busy" pour ne pas suroptimistes) + indispos.
- Query pgtyped : `listArtistUnavailabilitiesInRange.sql`, `listArtistBookingsInRange.sql`.
- Limite : range max 12 mois pour éviter requêtes trop larges.

### Dépendances inter-stories
- S-04 (fiche artiste) : consommateur.
- S-14, S-15 (sources de données).

### Edge cases & risques
- Range trop large : retour 422.
- Indispo récurrente : V1 non géré (chaque indispo est ponctuelle).
- Décalage timezone client/serveur : toujours calculer côté serveur dans `APP_TIMEZONE`.

### DoD
- Test backend : indispos partielles → status `partial`.
- Aucun détail privé dans la réponse publique (motif, notes).

---

## S-13 — Affichage des périodes indisponibles (sans détail)

**En tant que** Visiteur, **je veux** voir les périodes indisponibles d'un artiste (sans détail), **afin de** comprendre pourquoi certaines dates ne sont pas réservables.

**Estimation** : S

### Contexte & enjeux
Story complémentaire à S-12 : se concentre sur la confidentialité.

### Critères d'acceptation
- **Given** un jour indispo, **when** le visiteur clique dessus, **then** seul un label générique "Indisponible" est affiché, jamais : nom de l'événement, lieu, client, type d'indispo.
- **Given** l'inspection du DOM ou de la réponse API, **when** examinés, **then** aucun champ privé n'est exposé (pas de `external_event_title` ni `notes`).
- **Given** un journaliste / curieux fouille la réponse réseau, **when** analysée, **then** seuls `date` + `status` sont présents.

### Spécifications techniques

**Backend** :
- La sérialisation `AvailabilitySerializerPublic` n'inclut JAMAIS les champs privés.
- Test backend dédié : snapshot de la réponse, assert absence des champs interdits.

**Frontend** :
- Tooltip / popover affiche uniquement le label i18n `availability.unavailable`.

### Dépendances
- S-12.

### Edge cases & risques
- Régression : un dev ajoute un champ privé par mégarde → test de sérialisation gardé strict.

### DoD
- Test backend snapshot strict de la réponse publique.

---

## S-14 — Ajouter une indisponibilité personnelle

**En tant que** Artiste, **je veux** ajouter une indisponibilité personnelle depuis son espace, **afin de** bloquer des dates où je ne veux pas être réservé (vacances, off, etc.).

**Estimation** : M

### Critères d'acceptation
- **Given** un artiste authentifié, **when** il va sur `/artist/calendar`, **then** il voit son calendrier complet (avec détails) sur 12 mois glissants.
- **Given** l'artiste clique sur un jour ou une plage, **when** un modal s'ouvre, **then** il peut saisir : date début, date fin, type (personnel par défaut), notes privées.
- **Given** l'artiste sauvegarde, **when** soumis, **then** une indispo `source=personal` est créée et le calendrier se rafraîchit.
- **Given** une plage chevauche un booking `confirmed`, **when** la sauvegarde est tentée, **then** un message d'erreur explicite s'affiche listant le booking en conflit.
- **Given** l'artiste veut supprimer une indispo, **when** il clique dessus → "Supprimer", **then** elle disparaît après confirmation.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/ArtistCalendar/ArtistCalendar.tsx`.
- Modal : `src/components/UnavailabilityModal/UnavailabilityModal.tsx`.

**Backend** :
- Routes (authentifiées JWT artiste) :
  - `POST /api/artist/unavailabilities`
  - `DELETE /api/artist/unavailabilities/:id`
  - `GET /api/artist/unavailabilities?from=...&to=...` (avec détails privés)
- Authorization : un artiste ne peut éditer que ses propres indispos (vérification `artist_id = req.user.artist_id`).
- Validation Zod : `starts_at < ends_at`, max 365 jours par indispo.
- Service : `UnavailabilityService.createForArtist(artistId, input)`.

### Dépendances
- S-16 (auth artiste).

### Edge cases & risques
- Chevauchement avec autre indispo : autorisé (fusion non automatique), affiché en V1.
- Plage très longue : limite 365 jours.

### DoD
- Test backend : artiste A ne peut pas créer une indispo pour artiste B.
- Test : conflit avec booking confirmé → 409.

---

## S-15 — Déclarer un événement extérieur

**En tant que** Artiste, **je veux** déclarer un événement extérieur à l'agence pour bloquer une date, **afin de** ne pas être sollicité pour cette date par l'agence.

**Estimation** : M

### Contexte & enjeux
Différencie une indispo "off" d'un gig réel pris en direct par l'artiste — utile pour les rapports internes de l'agence.

### Critères d'acceptation
- **Given** l'artiste ouvre le modal indispo, **when** il choisit "Événement extérieur", **then** des champs additionnels apparaissent : titre, lieu (optionnel), heure début, heure fin.
- **Given** les champs externes obligatoires sont remplis, **when** sauvegardé, **then** une entrée `source=external_gig` est créée.
- **Given** côté public, **when** la disponibilité est lue, **then** seul le statut "busy" est exposé (jamais titre / lieu).
- **Given** l'admin consulte l'agenda global (S-27), **when** il survole l'événement, **then** il voit le titre + lieu (visibilité interne uniquement).

### Spécifications techniques

**Backend** :
- Même endpoint que S-14 mais avec `source=external_gig` + champs externes requis.
- Validation Zod : si `source=external_gig`, alors `external_event_title` requis.

### Dépendances
- S-14.

### Edge cases & risques
- Confusion utilisateur entre "indispo perso" et "gig extérieur" : UX claire dans le modal (deux onglets distincts).

### DoD
- Test : `external_event_title` requis si `source=external_gig` → 422 sinon.
- Test : champ jamais exposé en public.
