# EPIC-05 — Espace admin

> **Objectif** : Permettre à l'équipe Gazmatek de gérer le catalogue d'artistes, traiter les demandes de booking, suivre les paiements, gérer les contrats et avoir une vue globale.
> **Stories** : 9 (S-22 à S-30)

---

## Périmètre

### In scope
- CRUD artistes (back-office).
- Gestion des demandes de booking (validation, refus).
- Suivi des paiements / acomptes.
- Marquage manuel d'un artiste comme bookable / booké.
- Agenda global multi-artistes.
- Gestion manuelle des indisponibilités d'un artiste.
- Upload et association de contrats PDF.
- Suivi de l'état de signature des contrats.

### Out of scope
- Facturation comptable / export Sage (V2).
- Reporting business avancé (V2).
- Gestion multi-tenant (V2).

## Dépendances

- [EPIC-02](EPIC-02.md), [EPIC-03](EPIC-03.md), [EPIC-04](EPIC-04.md) : sources de données.
- [EPIC-07 S-34](EPIC-07.md) : rôles.

## Modèle de données

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- audit_log pour traçabilité des actions admin
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_kind TEXT NOT NULL,    -- 'admin' | 'artist' | 'system'
  actor_id UUID,
  action TEXT NOT NULL,        -- 'booking.validate', 'artist.create', etc.
  target_kind TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> **Note** : authentification admin = même mécanisme que S-16 (artiste) mais sur `admin_users` et avec rôle distinct.

---

## S-22 — CRUD artistes

**En tant que** Admin, **je veux** ajouter, modifier ou supprimer un artiste du catalogue, **afin de** maintenir l'offre.

**Estimation** : M

### Critères d'acceptation
- **Given** un admin connecté, **when** il va sur `/admin/artists`, **then** la liste de tous les artistes (publiés ou non) est affichée avec filtres et recherche.
- **Given** l'admin clique "Nouveau", **when** le formulaire s'ouvre, **then** il peut saisir : stage_name, slug, bio (FR/NL/EN), tarif horaire, tarif déplacement, photos, cover image, statut publication.
- **Given** l'admin sauvegarde, **when** soumis, **then** l'artiste est créé en `is_published=false` par défaut.
- **Given** un artiste existant, **when** modifié et sauvegardé, **then** les changements sont persistés et visibles côté public si publié.
- **Given** un artiste a des bookings actifs, **when** suppression tentée, **then** une erreur explicite empêche la suppression — proposer "Archiver" à la place (soft delete).
- **Given** une suppression d'un artiste sans booking, **when** confirmée, **then** l'artiste est hard-deleted (avec ses photos via cascade).
- **Given** un changement de slug, **when** sauvegardé, **then** une redirection 301 ancien-slug → nouveau-slug est ajoutée (table `slug_redirects`).

### Spécifications techniques

**Frontend** :
- Pages : `src/pages/AdminArtists/AdminArtists.tsx`, `src/pages/AdminArtistEdit/AdminArtistEdit.tsx`.
- Upload photos : composant `StyledInputFile` → service storage (multipart).

**Backend** :
- Routes (authentifiées admin) :
  - `GET /api/admin/artists?q=&page=&page_size=`
  - `POST /api/admin/artists`
  - `GET /api/admin/artists/:id`
  - `PUT /api/admin/artists/:id`
  - `DELETE /api/admin/artists/:id`
  - `POST /api/admin/artists/:id/photos`
  - `DELETE /api/admin/artists/:id/photos/:photoId`
- Validation Zod stricte.
- Service `ArtistAdminService`.

### Dépendances
- S-34 (rôle admin).

### Edge cases & risques
- Conflit slug : Zod refuse, message clair.
- Soft delete : ajouter `archived_at` plutôt que hard delete si bookings existants.

### DoD
- Test : artiste non publié non visible côté public.
- Test : suppression bloquée si bookings actifs.
- Audit log à chaque action.

---

## S-23 — Liste des demandes de booking

**En tant que** Admin, **je veux** consulter toutes les demandes de booking avec leur statut, **afin de** suivre le pipeline commercial.

**Estimation** : M

### Critères d'acceptation
- **Given** un admin va sur `/admin/bookings`, **when** la page charge, **then** la liste de tous les bookings est affichée avec colonnes : ID court, artiste, client, date événement, statut, montant total, acompte payé, date création.
- **Given** la liste, **when** l'admin filtre par statut, artiste, plage de dates, **then** la liste se met à jour.
- **Given** la liste, **when** l'admin clique sur une ligne, **then** il accède au détail du booking.
- **Given** la liste, **when** l'admin trie par colonne, **then** l'ordre change (asc/desc).

### Spécifications techniques

**Backend** :
- Route `GET /api/admin/bookings?status=&artist_id=&from=&to=&page=&page_size=&sort=&order=`.

**Frontend** :
- Page : `src/pages/AdminBookings/AdminBookings.tsx`.
- Utilisation du composant `DynamicTable` de `covaltech-react-ui`.

### Dépendances
- S-22 (filtres par artiste).

### Edge cases & risques
- Beaucoup de bookings : pagination + index DB déjà en place.

### DoD
- Test : filtres combinés OK.

---

## S-24 — Validation ou refus d'une demande de booking

**En tant que** Admin, **je veux** valider ou refuser une demande de booking, **afin de** confirmer commercialement avant paiement.

**Estimation** : M

### Critères d'acceptation
- **Given** un booking en `pending_validation` (côté admin, ce statut signifie aussi "à approuver par l'agence"), **when** l'admin valide, **then** le statut passe à `awaiting_deposit` et l'email de validation client peut être déclenché.
- **Given** un booking, **when** l'admin refuse, **then** le statut passe à `cancelled` avec motif obligatoire, et un email de refus est envoyé au client.
- **Given** un refus, **when** confirmé, **then** un audit log enregistre l'admin, la date, le motif.
- **Given** un booking déjà validé, **when** action de validation re-tentée, **then** l'API retourne 409 (idempotence).

### Spécifications techniques

**Backend** :
- Routes :
  - `POST /api/admin/bookings/:id/approve` body `{ note?: string }`
  - `POST /api/admin/bookings/:id/reject` body `{ reason: string }`
- Service : `BookingAdminService` avec gardes de transition de statut.

### Dépendances
- S-23, S-35 (mailer).

### Edge cases & risques
- Race condition validation client (S-09) / validation admin : décider du workflow. **Recommandation V1** : validation client par email = preuve d'identité, validation admin = approbation business. Les deux sont nécessaires avant paiement → ajouter un champ `admin_approved_at` distinct.

### DoD
- Test : refus → email + statut + audit log.

---

## S-25 — État des acomptes et paiements

**En tant que** Admin, **je veux** voir l'état des acomptes et paiements pour chaque booking, **afin de** suivre la trésorerie.

**Estimation** : M

### Critères d'acceptation
- **Given** la liste des bookings, **when** rendue, **then** chaque ligne affiche : montant total, montant acompte, statut acompte (non payé / payé / remboursé / partiellement), date paiement.
- **Given** le détail d'un booking, **when** ouvert, **then** la timeline des paiements est visible : tentatives, succès, échecs, remboursements.
- **Given** un paiement Stripe, **when** lié, **then** un lien direct vers le dashboard Stripe est proposé.

### Spécifications techniques

**Backend** :
- Table additionnelle :
  ```sql
  CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    stripe_payment_intent_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    status TEXT NOT NULL,    -- 'succeeded' | 'failed' | 'refunded'
    raw_event JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- Route `GET /api/admin/bookings/:id/payments`.

**Frontend** :
- Composant `PaymentsTimeline` dans la page détail booking admin.

### Dépendances
- S-10 (paiement).
- S-23.

### Edge cases & risques
- Remboursement partiel : montant en negative ou champ dédié.

### DoD
- Test : timeline cohérente avec les events Stripe stockés.

---

## S-26 — Marquage manuel d'un artiste comme "booké"

**En tant que** Admin, **je veux** marquer un artiste comme 'booké' après confirmation du paiement, **afin de** rendre visible l'indisponibilité immédiatement.

**Estimation** : S

### Critères d'acceptation
- **Given** un booking `confirmed`, **when** l'admin clique "Marquer comme booké", **then** une indispo `source=personal` (ou nouveau type `agency_booking`) est créée automatiquement.
- **Given** automatiquement déjà déclenché par le passage en `confirmed`, **when** réutilisé, **then** ne pas créer de doublon.
- **Given** une annulation `cancelled`, **when** appliquée, **then** l'indispo liée est supprimée automatiquement.

### Spécifications techniques

**Backend** :
- Ajouter `unavailability_source.agency_booking` ou utiliser un lien direct `bookings.event_date` agrégé dans la vue dispo. **Recommandation** : ne PAS dupliquer en table — la vue de dispo agrège bookings + indispos manuelles. Voir S-12 / EPIC-03.
- Route admin : `POST /api/admin/bookings/:id/mark-busy` (optionnel si déjà auto).
- Hook auto sur transition `confirmed`.

### Dépendances
- S-12, S-14, S-25.

### Edge cases & risques
- Désynchronisation indispo / booking : un seul SOURCE OF TRUTH = la table bookings. La vue de dispo lit les deux.

### DoD
- Test : passage en `confirmed` → date apparaît comme busy en lecture publique.

---

## S-27 — Agenda global de tous les artistes

**En tant que** Admin, **je veux** consulter un agenda global de tous les artistes en vue calendrier, **afin de** avoir une vue d'ensemble du planning.

**Estimation** : L

### Critères d'acceptation
- **Given** l'admin va sur `/admin/calendar`, **when** la page charge, **then** un calendrier mensuel affiche toutes les bookings + indispos pour tous les artistes.
- **Given** le nombre d'artistes est élevé, **when** affiché, **then** un filtre par artiste(s) (multi-select) permet de réduire la vue.
- **Given** une vue par semaine ou par jour, **when** sélectionnée, **then** affichage groupé par artiste en lignes (vue type Gantt simple).
- **Given** un événement, **when** survolé, **then** popover avec détails admin (titre événement extérieur visible, motif indispo perso visible).
- **Given** un clic sur un événement, **when** fait, **then** accès au détail correspondant.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/AdminCalendar/AdminCalendar.tsx`.
- Librairie : `FullCalendar` (ou équivalent) — à confirmer. Sinon implémentation custom (plus coûteuse).
- Filtres : multi-select via composant `StyledDropdown` de `covaltech-react-ui` (à confirmer si multi-select dispo, sinon adapter).

**Backend** :
- Route `GET /api/admin/calendar?from=&to=&artist_ids=`.
- Réponse fusion : `Array<{ kind: "booking" | "unavailability", artist_id, starts_at, ends_at, ... }>`.
- Performance : pagination temporelle (max 3 mois par requête).

### Dépendances
- S-12, S-14, S-15, S-23.

### Edge cases & risques
- Beaucoup d'artistes : virtualisation des lignes.
- Cache : envisager Redis pour les requêtes calendrier admin lourdes.

### DoD
- Test backend : fusion bookings + indispos correcte sur plage donnée.
- UX : changer mois sans clignotement.

---

## S-28 — Gérer manuellement les disponibilités d'un artiste

**En tant que** Admin, **je veux** gérer manuellement les disponibilités d'un artiste, **afin de** corriger une indispo, retirer un blocage, ou agir au nom de l'artiste.

**Estimation** : M

### Critères d'acceptation
- **Given** un admin sur la fiche artiste back-office, **when** il accède à l'onglet "Disponibilités", **then** il voit toutes les indispos avec source et notes.
- **Given** l'admin peut créer / modifier / supprimer une indispo au nom de l'artiste, **when** action effectuée, **then** `created_by = admin.id`, source conservée, audit log écrit.
- **Given** une indispo créée par l'artiste, **when** l'admin la modifie, **then** une notification email à l'artiste est envoyée pour transparence.

### Spécifications techniques

**Backend** :
- Routes :
  - `GET /api/admin/artists/:id/unavailabilities?from=&to=`
  - `POST /api/admin/artists/:id/unavailabilities`
  - `PUT /api/admin/unavailabilities/:id`
  - `DELETE /api/admin/unavailabilities/:id`
- Réutilise `UnavailabilityService` avec acteur admin.

### Dépendances
- S-14, S-15.

### Edge cases & risques
- Suppression d'une indispo couvrant un booking confirmé : `409` sauf override explicite avec confirmation.

### DoD
- Test : admin peut éditer indispo d'un artiste, audit log enregistré.

---

## S-29 — Upload et association d'un contrat PDF

**En tant que** Admin, **je veux** uploader et associer un contrat PDF à un booking, **afin de** le rendre disponible à l'artiste et déclencher la signature.

**Estimation** : M

### Critères d'acceptation
- **Given** un booking `confirmed`, **when** l'admin uploade un PDF, **then** une entrée `contracts` est créée (ou mise à jour), `status=pending_signature`, le PDF est stocké via le service storage.
- **Given** un contrat existant, **when** l'admin re-uploade, **then** une nouvelle version remplace l'ancienne (V1 : pas d'historique de versions), `signed_pdf_storage_key` reset à NULL.
- **Given** le contrat est uploadé, **when** créé/mis à jour, **then** un email est envoyé à l'artiste "Un contrat est à signer".
- **Given** le fichier > 10 MB ou n'est pas un PDF, **when** uploadé, **then** rejet 422.

### Spécifications techniques

**Backend** :
- Route `POST /api/admin/bookings/:id/contract` multipart, max 10 MB, validation MIME `application/pdf`.
- Service `ContractService.uploadForBooking(bookingId, file)` → `StorageService.upload`.
- Hook : email artiste (S-21 variant).

### Dépendances
- S-23, S-21.

### Edge cases & risques
- Stockage S3 ou local selon `STORAGE_DRIVER`.
- PDF infecté : V1 = pas d'antivirus, V2 = ClamAV scan.

### DoD
- Test : upload non-PDF → 422.
- Test : upload OK → status `pending_signature` + email artiste.

---

## S-30 — Suivi de l'état de signature des contrats

**En tant que** Admin, **je veux** suivre l'état de signature des contrats, **afin de** relancer si nécessaire.

**Estimation** : S

### Critères d'acceptation
- **Given** la liste des bookings, **when** rendue, **then** une colonne / badge affiche le statut contrat : `aucun`, `à signer`, `signé`, `annulé`.
- **Given** un contrat `pending_signature` depuis plus de 7 jours, **when** la liste est affichée, **then** un badge alerte "Relance recommandée" apparaît.
- **Given** l'admin clique "Relancer", **when** action confirmée, **then** un email de rappel est envoyé à l'artiste.

### Spécifications techniques

**Backend** :
- Champ calculé `days_pending` dans la réponse `GET /api/admin/bookings`.
- Route `POST /api/admin/contracts/:id/remind`.
- Cron job optionnel `FEATURE_JOBS` : relance automatique J+7, J+14.

**Frontend** :
- Indicateur visuel dans la colonne contrat.

### Dépendances
- S-20, S-23, S-29.

### Edge cases & risques
- Spam de relance : limiter à 1 relance manuelle / 24h par contrat.

### DoD
- Test : relance manuelle envoie email.
- Test : cron J+7 envoie email automatique.
