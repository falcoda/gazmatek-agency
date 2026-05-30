# EPIC-02 — Demande de booking (client)

> **Objectif** : Permettre à un client potentiel de soumettre une demande de booking, la valider via email, et payer un acompte pour confirmer.
> **Stories** : 5 (S-07 à S-11)

---

## Périmètre

### In scope
- Formulaire public de demande de booking.
- Génération d'un dossier `booking` côté backend.
- Email transactionnel automatique (confirmation, validation, paiement).
- Validation du booking via token email (magic link).
- Paiement de l'acompte via provider externe (Stripe).
- Webhook de réconciliation paiement.

### Out of scope
- Signature électronique du contrat (cf. [EPIC-04 S-20](EPIC-04.md)).
- Backoffice admin du booking (cf. [EPIC-05](EPIC-05.md)).
- Notification artiste (cf. [EPIC-04 S-21](EPIC-04.md)).

## Dépendances

- [EPIC-01 S-04](EPIC-01.md) : entrée principale via fiche artiste.
- [EPIC-07 S-35](EPIC-07.md) : service mailer.
- [EPIC-03](EPIC-03.md) : vérification disponibilité avant insertion.
- Service externe : **Stripe** (paiements) — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`.

## Modèle de données

```sql
CREATE TYPE booking_status AS ENUM (
  'pending_validation',  -- soumis, en attente du clic email
  'awaiting_deposit',    -- validé, en attente du paiement
  'confirmed',           -- acompte payé, booking sécurisé
  'cancelled',           -- annulé (par client ou admin)
  'completed'            -- prestation effectuée
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id),
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_duration_hours NUMERIC(4,1) NOT NULL,
  event_location_address TEXT NOT NULL,
  event_location_lat NUMERIC(9,6),
  event_location_lng NUMERIC(9,6),
  event_context TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  quoted_total_cents INTEGER NOT NULL,
  deposit_amount_cents INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending_validation',
  validation_token_hash TEXT,
  validation_token_expires_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_artist_date ON bookings(artist_id, event_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

---

## S-07 — Soumission d'une demande de booking

**En tant que** Client, **je veux** envoyer une demande de booking via le site (artiste, date, lieu, contexte), **afin de** déclencher la prise en charge par l'agence.

**Estimation** : L

### Contexte & enjeux
Point d'entrée critique du tunnel. Tout échec ici = perte sèche.

### Critères d'acceptation
- **Given** un client est sur `/booking/new` (avec ou sans `?artistId=`), **when** la page charge, **then** un formulaire multi-étapes est présenté : (1) artiste, (2) date & durée, (3) lieu, (4) options, (5) coordonnées client, (6) récapitulatif + envoi.
- **Given** un `artistId` est fourni en query, **when** la page charge, **then** l'étape 1 est pré-remplie et l'utilisateur peut quand même la changer.
- **Given** une date sélectionnée, **when** l'utilisateur passe à l'étape suivante, **then** le système vérifie en temps réel que l'artiste est disponible (appel `GET /api/artists/:id/availability`).
- **Given** l'artiste est indisponible, **when** la vérification revient négative, **then** un message clair + suggestion de dates alternatives s'affiche.
- **Given** toutes les étapes sont valides, **when** le client clique "Envoyer", **then** un appel `POST /api/bookings` est fait, un dossier est créé en statut `pending_validation`, et l'utilisateur est redirigé vers `/booking/sent` avec son email rappelé.
- **Given** le client ferme l'onglet à mi-parcours, **when** il revient, **then** les données du formulaire sont restaurées depuis `sessionStorage`.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/BookingNew/BookingNew.tsx` + sous-composants `StepArtist/`, `StepDateTime/`, `StepLocation/`, `StepOptions/`, `StepClient/`, `StepSummary/`.
- Store local : `useBookingFormStore` (Zustand) avec persist `sessionStorage`.
- Validation pas-à-pas avec Zod.

**Backend** :
- Route `POST /api/bookings` (publique, rate-limit anti-abus).
- Body Zod :
  ```ts
  {
    artistId: string (uuid),
    eventDate: string (ISO datetime, futur > 48h),
    durationHours: number (0.5..24),
    location: { address: string, lat: number, lng: number },
    context: string (max 2000),
    options: Array<{ id: string }>,
    client: {
      email: string (email),
      name: string (min 2, max 100),
      phone: string (E.164 format, optional)
    }
  }
  ```
- Service : `BookingService.create(input)`.
  - Recalcule le devis côté serveur (NE PAS faire confiance au montant client).
  - Vérifie l'artiste publié et disponible (avec lock `SELECT FOR UPDATE` sur les indispos chevauchantes).
  - Insert booking en `pending_validation`.
  - Génère `validation_token` (32 bytes random), stocke le hash (SHA-256), expiration = NOW() + 7 jours.
  - Déclenche email confirmation (cf. S-08).
- Query pgtyped : `createBooking.sql`, `findOverlappingUnavailabilities.sql`.

### Dépendances inter-stories
- S-08 (email confirmation envoyé).
- S-12 (lecture disponibilité).
- S-04 / S-05 (entrée frontale).

### Edge cases & risques
- Conflit d'horaires entre deux clients soumettant simultanément : `SELECT FOR UPDATE` + `INSERT` dans une transaction.
- Email invalide / inexistant : pas de pré-vérification active, mais email de validation jouera le rôle de filtre.
- Champ `event_date` dans le passé : refusé en Zod.
- Provider Stripe configuré mais clé erronée : la création doit réussir (paiement vient plus tard), mais log warning.

### DoD
- Test d'intégration backend : `POST /api/bookings` créé en DB avec status correct.
- Test : booking refusé si artiste indispo.
- Audit log inséré.

---

## S-08 — Email de confirmation automatique

**En tant que** Client, **je veux** recevoir un email de confirmation automatique après soumission de la demande, **afin de** avoir une trace écrite et un lien pour la suite.

**Estimation** : S

### Contexte & enjeux
Garantit la légitimité du contact et déclenche la suite du tunnel.

### Critères d'acceptation
- **Given** un booking vient d'être créé en `pending_validation`, **when** le service mailer est appelé, **then** un email est envoyé au client avec : récapitulatif du booking, lien de validation, mention du délai de 7 jours.
- **Given** l'email est rendu, **when** le client l'ouvre, **then** il est dans sa langue (déterminée par `Accept-Language` lors du POST, fallback `fr`).
- **Given** le mailer échoue, **when** l'envoi est tenté, **then** le booking reste en `pending_validation`, l'erreur est loggée, et un retry est programmé via cron (cf. EPIC-07).

### Spécifications techniques

**Backend** :
- Template : `src/services/mailer/templates/bookingConfirmation/{fr,nl,en}.html` (+ version texte).
- Service `BookingMailer.sendConfirmation(booking, locale)` consommé par `BookingService.create`.
- Variables : `clientName`, `artistStageName`, `eventDate` (formaté i18n + timezone), `validationUrl`, `expiresAt`.
- URL : `${APP_BASE_URL}/booking/validate?token=<raw_token>` (raw, jamais le hash).
- Retry : table `email_deliveries` avec état `pending|sent|failed`, cron rejoue les `failed` < 24h.

### Dépendances inter-stories
- S-07 (création).
- S-35 (mailer générique).

### Edge cases & risques
- Email bouncé : V1 ne gère pas, V2 webhook SMTP/SES bounce.
- Langue inconnue : fallback `en`.

### DoD
- Email rendu OK dans Litmus / Mailgun preview (test manuel).
- Email texte sans HTML inclus pour clients texte-only.

---

## S-09 — Validation du booking via lien sécurisé

**En tant que** Client, **je veux** valider un booking via un lien sécurisé reçu par email, **afin de** prouver que l'email est valide et engager la démarche.

**Estimation** : M

### Critères d'acceptation
- **Given** un client clique sur `/booking/validate?token=XYZ`, **when** la page charge, **then** le frontend appelle `POST /api/bookings/validate` avec le token brut.
- **Given** le token est valide et non expiré, **when** le backend traite la requête, **then** le booking passe en `awaiting_deposit`, `validated_at` est rempli, et la réponse contient l'URL de paiement (S-10).
- **Given** le token est expiré, **when** la validation est tentée, **then** une page d'erreur indique l'expiration avec un bouton "Demander un nouveau lien" (régénère un token, ré-envoie l'email).
- **Given** le token est invalide ou déjà consommé, **when** la validation est tentée, **then** une page d'erreur dédiée s'affiche.
- **Given** le token est consommé une 2e fois, **when** rappelé, **then** la page redirige directement vers l'URL de paiement si le booking est toujours en `awaiting_deposit` (idempotence).

### Spécifications techniques

**Frontend** :
- Page : `src/pages/BookingValidate/BookingValidate.tsx`. États : `loading`, `success`, `expired`, `invalid`.

**Backend** :
- Route `POST /api/bookings/validate` body `{ token: string }`.
- Service `BookingService.validate(rawToken)` :
  - Hash le token, recherche booking.
  - Vérifie `validation_token_expires_at > NOW()`.
  - Vérifie statut == `pending_validation`.
  - Met à jour statut + `validated_at`.
  - Génère un `payment_intent` Stripe pour l'acompte.
- Query pgtyped : `findBookingByValidationToken.sql`, `markBookingValidated.sql`.

### Dépendances inter-stories
- S-08 (envoi du token).
- S-10 (paiement).

### Edge cases & risques
- Attaque par énumération de tokens : tokens 256 bits, hashés en DB, rate-limit IP.
- Race condition validation concurrente : transaction + check de statut dans le `UPDATE WHERE status='pending_validation'`.

### DoD
- Test : token valide → status passe à `awaiting_deposit`.
- Test : token expiré → 410 Gone avec code `TOKEN_EXPIRED`.
- Test : double validation → idempotent (200 OK).

---

## S-10 — Paiement de l'acompte en ligne

**En tant que** Client, **je veux** payer un acompte en ligne pour confirmer le booking, **afin de** sécuriser ma réservation.

**Estimation** : L

### Critères d'acceptation
- **Given** un booking en `awaiting_deposit`, **when** le client arrive sur `/booking/:id/pay?token=<paymentToken>`, **then** une page affiche le récap, le montant de l'acompte, et un bouton "Payer".
- **Given** le client clique "Payer", **when** Stripe Checkout / Elements est invoqué, **then** il peut payer par carte ou autre méthode supportée (Bancontact en BE).
- **Given** le paiement réussit côté Stripe, **when** le webhook Stripe `payment_intent.succeeded` arrive, **then** le booking passe en `confirmed` et un email "Booking confirmé" est envoyé (cf. S-11).
- **Given** le paiement échoue, **when** Stripe retourne une erreur, **then** la page d'erreur permet de réessayer ou contacter l'agence.
- **Given** le webhook est rejoué (Stripe peut envoyer plusieurs fois), **when** traité, **then** l'opération est idempotente (clé d'idempotence = `stripe_payment_intent_id`).

### Spécifications techniques

**Frontend** :
- Page : `src/pages/BookingPay/BookingPay.tsx`.
- Stripe Elements via `@stripe/stripe-js` + `@stripe/react-stripe-js`.
- `STRIPE_PUBLISHABLE_KEY` exposée via `VITE_STRIPE_PUBLISHABLE_KEY`.

**Backend** :
- Route `POST /api/bookings/:id/payment-intent` — crée ou récupère le PaymentIntent, retourne `client_secret`.
- Route `POST /api/webhooks/stripe` — endpoint webhook Stripe, vérifie signature avec `STRIPE_WEBHOOK_SECRET`.
- Service `PaymentService` :
  - `createDepositIntent(booking)`.
  - `handleWebhook(event)` — switch sur le type d'event, idempotent.
- Calcul acompte : 30% du `quoted_total_cents` (constante centralisée `DEPOSIT_PERCENTAGE`).

### Dépendances inter-stories
- S-09 (déclenchement).
- S-11 (email d'accusé).

### Edge cases & risques
- Webhook arrive avant le retour user (front) : ok, le statut sera déjà `confirmed`.
- Double charge : protégé par PaymentIntent unique réutilisé.
- Stripe down : retry exponentiel, status `confirmed` mais flag de réconciliation.
- Tentative de manipulation du montant côté client : ignorée, le backend reprend toujours `quoted_total_cents` de la DB.
- Conformité PSD2/3DS : géré nativement par Stripe.

### DoD
- Test d'intégration avec Stripe test mode.
- Webhook signature vérifiée (test avec mauvaise signature → 400).
- Idempotence webhook : 2 réceptions du même event → un seul update DB.

---

## S-11 — Accusé de réception après paiement

**En tant que** Client, **je veux** recevoir un accusé de réception après paiement de l'acompte, **afin de** avoir la preuve formelle de ma réservation.

**Estimation** : S

### Critères d'acceptation
- **Given** un booking passe en `confirmed`, **when** la transition de statut est effectuée, **then** un email "Booking confirmé" est envoyé au client avec : récap, reçu de paiement (lien Stripe ou PDF généré), prochaines étapes (contrat à signer).
- **Given** l'admin reçoit aussi une notification interne (cf. S-21 / EPIC-05).
- **Given** l'email est rendu, **when** il est ouvert, **then** il contient un lien `/booking/:id?token=...` pour consulter le booking ultérieurement.

### Spécifications techniques

**Backend** :
- Hook sur transition de statut `awaiting_deposit → confirmed` dans `PaymentService.handleWebhook`.
- Template : `src/services/mailer/templates/bookingConfirmed/{fr,nl,en}.html`.
- Variables : récap + `paymentReceiptUrl` (Stripe receipt URL).
- Notification interne admin : driver Telegram ou email selon `NOTIFICATION_DRIVER`.

### Dépendances inter-stories
- S-10 (déclenchement).
- S-35 (mailer).

### Edge cases & risques
- Mailer down au moment du webhook : retry, mais ne bloque PAS le passage en `confirmed`.
- Lien d'accès permanent : utiliser un token signé (JWT court — durée 90 jours par exemple).

### DoD
- Test : transition `confirmed` → mail envoyé.
- Reçu Stripe accessible depuis l'email.
