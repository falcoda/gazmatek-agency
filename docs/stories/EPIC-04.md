# EPIC-04 — Espace artiste

> **Objectif** : Fournir aux artistes un espace personnel sécurisé pour consulter leurs bookings, gérer leur agenda, télécharger et signer leurs contrats.
> **Stories** : 6 (S-16 à S-21)

---

## Périmètre

### In scope
- Authentification artiste (login, recovery).
- Tableau de bord agenda (à venir / passés).
- Détail d'un booking.
- Téléchargement du contrat PDF.
- Signature électronique du contrat.
- Notifications email lors d'un booking concernant l'artiste.

### Out of scope
- Édition de profil artiste public (cf. [EPIC-05 S-22](EPIC-05.md), confiée à l'admin).
- Chat / messagerie interne (V2).
- Statistiques de revenus (V2).

## Dépendances

- [EPIC-02](EPIC-02.md) : alimente les bookings affichés.
- [EPIC-07 S-34](EPIC-07.md) : gestion des rôles.
- [EPIC-05 S-29](EPIC-05.md) : upload du contrat par l'admin.
- Service externe : provider de signature électronique (Yousign / DocuSign — à confirmer).

## Modèle de données

```sql
CREATE TABLE artist_accounts (
  artist_id UUID PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  last_login_at TIMESTAMPTZ,
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE contract_status AS ENUM (
  'draft',           -- non envoyé
  'pending_signature',
  'signed',
  'cancelled'
);

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  pdf_storage_key TEXT NOT NULL,
  status contract_status NOT NULL DEFAULT 'draft',
  signature_provider TEXT,            -- 'yousign' | 'docusign' | etc.
  signature_provider_envelope_id TEXT,
  signed_at TIMESTAMPTZ,
  signed_pdf_storage_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## S-16 — Authentification artiste

**En tant que** Artiste, **je veux** se connecter à un espace personnel sécurisé, **afin de** accéder à ses bookings et son agenda.

**Estimation** : M

### Critères d'acceptation
- **Given** un artiste a un compte créé par l'admin, **when** il va sur `/artist/login`, **then** il saisit email + mot de passe et reçoit un JWT en cas de succès.
- **Given** un mot de passe erroné, **when** la tentative est faite, **then** un message générique "Identifiants invalides" est affiché (pas de discrimination email/mdp).
- **Given** 5 tentatives échouées en moins de 10 min sur un même email, **when** le 6e essai est fait, **then** le compte est temporairement bloqué (lockout 15 min).
- **Given** l'artiste oublie son mot de passe, **when** il clique "Mot de passe oublié", **then** un email avec lien magique (token 32 bytes, expire 1h) lui est envoyé.
- **Given** un JWT artiste est utilisé, **when** un endpoint protégé est appelé, **then** seules les routes `/artist/*` sont autorisées (pas accès admin).
- **Given** un JWT expiré, **when** utilisé, **then** 401 + redirection vers login.

### Spécifications techniques

**Frontend** :
- Pages : `src/pages/ArtistLogin/ArtistLogin.tsx`, `src/pages/ArtistForgotPassword/`, `src/pages/ArtistResetPassword/`.
- Store : `useArtistAuthStore` (Zustand, JWT en `localStorage` ou cookie httpOnly via API selon décision sécu — recommandé : cookie httpOnly).

**Backend** :
- Routes :
  - `POST /api/artist/auth/login` body `{ email, password }` → `{ token, artist: {...} }`.
  - `POST /api/artist/auth/forgot-password` body `{ email }`.
  - `POST /api/artist/auth/reset-password` body `{ token, newPassword }`.
- Hash mot de passe : `bcrypt` ou `argon2id` (recommandé : argon2id, cost adapté).
- JWT payload : `{ data: artist.email, kind: "artist", artist_id }`, durée 12h, refresh token V2.
- Service `ArtistAuthService` avec lockout en mémoire (Redis si dispo, sinon table `auth_attempts`).
- Validation Zod : email format, password ≥ 8 caractères.

### Dépendances
- S-22 (création du compte artiste par admin).
- S-34 (rôles).

### Edge cases & risques
- Énumération d'emails : message identique succès/échec.
- Brute force : lockout + rate limit IP.
- Reset token volé : usage unique, expire 1h.

### DoD
- Test : login OK / mot de passe erroné / lockout après 5 essais.
- Test : token reset usage unique.

---

## S-17 — Agenda de bookings (à venir & passés)

**En tant que** Artiste, **je veux** consulter son agenda de bookings à venir et passés, **afin de** organiser sa planification.

**Estimation** : M

### Critères d'acceptation
- **Given** un artiste connecté, **when** il va sur `/artist/bookings`, **then** deux onglets : "À venir" (futurs, status ∈ {`confirmed`, `awaiting_deposit`}), "Passés" (status `completed` ou date < NOW).
- **Given** la liste est affichée, **when** rendue, **then** chaque entrée montre : date, lieu (ville), client (nom seulement), statut, montant.
- **Given** l'artiste clique sur une ligne, **when** l'action est exécutée, **then** il accède au détail (S-18).
- **Given** beaucoup de bookings, **when** la liste dépasse 25, **then** une pagination est présente.

### Spécifications techniques

**Frontend** :
- Page : `src/pages/ArtistBookings/ArtistBookings.tsx`.
- Tabs via état local + URL param `?tab=upcoming|past`.

**Backend** :
- Route `GET /api/artist/bookings?tab=upcoming|past&page=&page_size=`.
- Authorization : artiste ne voit QUE ses bookings.
- Query pgtyped : `listArtistBookings.sql` avec filtrage statut + date.

### Dépendances
- S-16.

### Edge cases & risques
- Performance pagination : index `(artist_id, event_date DESC)`.

### DoD
- Test : artiste A ne voit pas bookings artiste B.

---

## S-18 — Détail d'un booking (vue artiste)

**En tant que** Artiste, **je veux** voir le détail d'un booking (client, date, lieu, statut), **afin de** préparer la prestation.

**Estimation** : M

### Critères d'acceptation
- **Given** l'artiste clique sur un booking, **when** la page charge, **then** il voit : nom & téléphone client (visibles uniquement si `status >= confirmed`), date complète, durée, adresse complète, contexte, options, montant total, montant net pour l'artiste, statut contrat.
- **Given** un booking en statut `pending_validation` ou `awaiting_deposit`, **when** affiché, **then** les coordonnées client sont masquées (RGPD : pas avant confirmation paiement).
- **Given** un contrat associé, **when** la section "Contrat" est rendue, **then** elle propose : "Télécharger" (S-19) et/ou "Signer" (S-20).

### Spécifications techniques

**Backend** :
- Route `GET /api/artist/bookings/:id`.
- Vérifie `booking.artist_id = req.user.artist_id` (sinon 404).
- Réponse adaptative : masque les champs sensibles si status < `confirmed`.

### Dépendances
- S-17, S-19, S-20.

### Edge cases & risques
- Booking annulé : afficher mais lecture seule, motif d'annulation si renseigné.

### DoD
- Test : champs sensibles présents/absents selon statut.

---

## S-19 — Télécharger le contrat en PDF

**En tant que** Artiste, **je veux** télécharger son contrat en PDF depuis l'espace personnel, **afin de** en avoir une copie locale.

**Estimation** : M

### Critères d'acceptation
- **Given** un booking confirmé avec contrat uploadé, **when** l'artiste clique "Télécharger contrat", **then** un PDF est servi par le backend (depuis le service storage).
- **Given** aucun contrat n'est uploadé, **when** la section est rendue, **then** un message "Contrat à venir" est affiché, le bouton est désactivé.
- **Given** un artiste demande le contrat d'un autre artiste (manipulation d'URL), **when** la requête est faite, **then** 404.

### Spécifications techniques

**Backend** :
- Route `GET /api/artist/bookings/:id/contract`.
- Service `StorageService.getSignedUrl(contract.pdf_storage_key)` ou stream direct.
- Headers `Content-Disposition: attachment; filename="contract-<bookingId>.pdf"`.
- Audit log téléchargement.

### Dépendances
- S-29 (upload admin).

### Edge cases & risques
- URL signée S3 expirée : redirection serveur ré-émet une nouvelle URL.
- Contrat très lourd : stream et pas buffer en mémoire.

### DoD
- Test : artiste A ne peut pas télécharger contrat artiste B.

---

## S-20 — Signature électronique du contrat (Documenso)

**En tant que** Artiste, **je veux** signer électroniquement un contrat directement depuis le site, **afin de** ne pas avoir à imprimer / scanner.

**Estimation** : L

> **Décision provider — verrouillée** : la signature électronique utilise **Documenso** (open-source, self-hostable, REST API + webhooks). Pas de Yousign, pas de DocuSign.
>
> **Référence implémentation** : reprendre **exactement** le fonctionnement déjà en place dans le repo `event-planner` (flow de signature des contrats bénévoles). Avant de coder, **lire et comprendre l'implémentation event-planner** : structure des tables, nommage des champs (`documenso_document_id`, `documenso_recipient_id`, `signing_url`, etc.), gestion du webhook, callbacks. Aligner pour qu'un développeur qui connaît event-planner retrouve les mêmes patterns.
>
> **Setup local Documenso** : copier les services et variables Docker depuis `event-planner` (le `docker-compose.yml` du repo event-planner contient déjà un service Documenso self-hosted fonctionnel avec sa DB, son secret de chiffrement, etc.). Récupérer tel quel : entrées du `docker-compose.yml`, variables `.env.example` liées à Documenso, et éventuels scripts d'init (clés de chiffrement, comptes initiaux). Ne pas réinventer la configuration — c'est une copie quasi 1:1 (en n'oubliant pas d'adapter les ports, noms de containers et préfixes `${ENVIRONMENT}-` propres à Gazmatek, cf. `backend/AGENTS.md`).

### Critères d'acceptation
- **Given** un contrat en `pending_signature`, **when** l'artiste clique "Signer", **then** un document Documenso a été créé (ou existe déjà), un destinataire a été ajouté, et l'artiste est redirigé vers `signing_url` Documenso (page embarquée ou popup selon ce qui est fait dans event-planner).
- **Given** la signature est complétée côté Documenso, **when** le webhook `document.signed` (ou équivalent — vérifier le nom exact utilisé dans event-planner) arrive, **then** le contrat passe en `signed`, `signed_at` est rempli, le PDF signé est récupéré via l'API Documenso et stocké dans `signed_pdf_storage_key`, et un email "Contrat signé" est envoyé au client et à l'admin.
- **Given** la signature échoue ou est annulée, **when** le retour arrive, **then** le statut reste `pending_signature`, l'utilisateur peut réessayer (réutilise le même document Documenso si encore valide, recrée sinon).
- **Given** le contrat est déjà `signed`, **when** l'artiste accède à la page, **then** seul "Télécharger version signée" est proposé.
- **Given** un développeur compare le code de cette feature avec event-planner, **when** revue, **then** les conventions de nommage et la structure des appels Documenso sont identiques.

### Spécifications techniques

**Provider — Documenso** :
- API : Documenso REST API (`https://app.documenso.com` ou instance self-hosted selon décision infra).
- Endpoints utilisés (à confirmer en lisant event-planner) :
  - `POST /api/v1/documents` — créer un document à partir d'un PDF uploadé.
  - `POST /api/v1/documents/:id/recipients` — ajouter un destinataire.
  - `POST /api/v1/documents/:id/send` — envoyer et obtenir le `signing_url`.
  - `GET /api/v1/documents/:id` — récupérer le PDF signé après webhook.
- Webhook Documenso : event `document.signed` (vérifier le nom exact dans event-planner), signature HMAC à valider via le secret `DOCUMENSO_WEBHOOK_SECRET`.

**Variables d'environnement** (à ajouter dans la config backend) :
```
DOCUMENSO_API_URL=
DOCUMENSO_API_KEY=
DOCUMENSO_WEBHOOK_SECRET=
DOCUMENSO_SIGN_RETURN_URL=  # URL de retour après signature (côté frontend Gazmatek)
```

**Backend** :
- Service : `backend/src/services/signature/documensoService.ts` — wrapper autour de l'API Documenso. **Structure et noms de méthodes identiques à event-planner** (`createDocument`, `addRecipient`, `sendDocument`, `downloadSignedPdf`, `verifyWebhookSignature`, etc. — adapter aux noms exacts utilisés là-bas).
- Route `POST /api/artist/contracts/:id/sign` — initie la session de signature Documenso, retourne `signingUrl`.
- Route `POST /api/webhooks/documenso` — endpoint webhook Documenso, signature vérifiée via `DOCUMENSO_WEBHOOK_SECRET`. **Nom de route et structure du handler alignés sur event-planner**.
- Champs DB à ajouter sur `contracts` (mêmes noms que event-planner) :
  ```sql
  ALTER TABLE contracts
    ADD COLUMN documenso_document_id TEXT,
    ADD COLUMN documenso_recipient_id TEXT,
    ADD COLUMN documenso_signing_url TEXT;
  ```
  Le champ existant `signature_provider_envelope_id` peut être remplacé par `documenso_document_id` directement (puisque le provider est verrouillé).
- Téléchargement du PDF signé via API Documenso après webhook → upload sur storage (clé `contracts/signed/<contractId>.pdf`).
- Idempotence webhook : clé d'idempotence = `documenso_document_id` + type d'event.

**Frontend** :
- Composant de signature : reprendre le même pattern UI que event-planner (popup, iframe embarquée, ou redirection plein écran selon ce qui est fait).
- Configuration `DOCUMENSO_SIGN_RETURN_URL` pointe sur `/artist/contracts/:id/signed` qui poll le statut côté backend.

### Dépendances
- S-19 (PDF de base).
- S-29 (upload admin).
- **Pré-requis bloquant** : lire le code event-planner concerné avant d'écrire la moindre ligne. Lister explicitement dans la PR les fichiers event-planner pris en référence.

### Edge cases & risques
- Documenso down : afficher état d'erreur, ne pas marquer le contrat comme signé.
- Webhook rejoué : idempotent sur `documenso_document_id`.
- Conformité légale eIDAS : Documenso fournit une signature électronique avancée (suffisant pour un contrat de prestation BE). À valider avec le juriste de Gazmatek si signature qualifiée est requise.
- `signing_url` Documenso expire (durée selon Documenso) : si l'artiste clique "Signer" après expiration, régénérer le document ou réutiliser selon le pattern event-planner.
- Différence entre Documenso cloud vs self-hosted : confirmer en début de sprint laquelle des deux est utilisée par Gazmatek.

### DoD
- Code event-planner référencé explicitement dans la PR (commit hashes des fichiers consultés).
- Test : webhook Documenso valide → status `signed` et PDF stocké.
- Test : webhook avec mauvaise signature HMAC → 401.
- Audit trail complet (création doc, send, webhook, download).
- Variables d'environnement Documenso documentées dans `backend/docs/EnvVariables.md`.

---

## S-21 — Notification email lors d'un nouveau booking

**En tant que** Artiste, **je veux** recevoir une notification email lors d'un nouveau booking qui le concerne, **afin de** être informé sans avoir à checker manuellement.

**Estimation** : S

### Critères d'acceptation
- **Given** un booking passe en `confirmed`, **when** la transition a lieu, **then** l'artiste concerné reçoit un email avec : date, lieu, lien vers le détail dans l'espace artiste.
- **Given** l'artiste a désactivé les notifications email (V2), **when** une notif devrait partir, **then** elle est sautée.
- **Given** plusieurs bookings confirmés rapidement, **when** ils sont créés, **then** un email distinct par booking est envoyé (pas de digest en V1).

### Spécifications techniques

**Backend** :
- Hook sur transition de statut côté `PaymentService.handleWebhook`.
- Template `artistBookingConfirmed/{fr,nl,en}.html`.
- Langue déterminée par `artist.preferred_locale` (V2) ou fallback `fr`.

### Dépendances
- S-11 (déclenchement).
- S-35 (mailer).

### Edge cases & risques
- Email artiste invalide : log error, alerter admin via notification interne.

### DoD
- Test : transition `confirmed` → mail à l'artiste envoyé.
