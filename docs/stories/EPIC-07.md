# EPIC-07 — Transverse (sécurité, emails, rôles, responsive)

> **Objectif** : Garantir les fondations transverses utilisées par toutes les autres epics : système de rôles, emails automatiques, responsive design.
> **Stories** : 3 (S-34 à S-36)

---

## Périmètre

### In scope
- Système d'authentification & autorisation à trois rôles : Visiteur, Artiste, Admin.
- Service d'emails transactionnels couvrant tout le cycle.
- Responsive design garanti sur mobile, tablette, desktop.

### Out of scope
- SSO / OAuth (V2).
- Multi-facteur (V2).
- App mobile native (V2).

## Dépendances

- Toutes les autres epics dépendent de cette epic.
- Service externe SMTP (Mailgun / SES / Sendgrid — à confirmer).

---

## S-34 — Gestion des trois rôles distincts

**En tant que** Système, **je veux** gérer les accès selon trois rôles distincts : visiteur, artiste, admin, **afin de** garantir la séparation des privilèges.

**Estimation** : M

### Contexte & enjeux
Sécurité fondamentale. Une fuite de privilège ici = compromission générale.

### Critères d'acceptation
- **Given** un utilisateur non authentifié, **when** il accède à une route publique, **then** accès autorisé.
- **Given** un utilisateur non authentifié, **when** il accède à une route `/api/artist/*` ou `/api/admin/*`, **then** 401.
- **Given** un artiste authentifié, **when** il accède à `/api/admin/*`, **then** 403.
- **Given** un admin authentifié, **when** il accède à `/api/artist/*`, **then** 403 (sauf admin-as-artist explicite — V2).
- **Given** un JWT artiste, **when** son champ `kind` est `admin` mais l'utilisateur n'existe pas dans `admin_users`, **then** 403.
- **Given** un JWT sans champ `kind`, **when** utilisé sur `/api/artist/*` ou `/api/admin/*`, **then** 403.
- **Given** un JWT valide mais l'utilisateur a été désactivé (`is_active=false`), **when** utilisé, **then** 403.

### Spécifications techniques

**Backend** :
- JWT payload étendu :
  ```ts
  interface AuthTokenPayload {
    data: string;          // email
    kind: 'artist' | 'admin';
    sub: string;           // user id
    iat?: number;
    exp?: number;
  }
  ```
- Middleware `authenticate(pool, { requiredKind?: 'artist'|'admin' })`.
- Helper : `requireArtist`, `requireAdmin`, qui s'appliquent au router level.
- Vérification "user actif" : check DB à chaque requête (tolérable en perf, sinon cache courte durée).
- Constantes :
  ```ts
  export enum UserKind { ARTIST = 'artist', ADMIN = 'admin' }
  export const AUTH_ERROR_CODES = {
    MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
    INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
    FORBIDDEN_KIND: 'AUTH_FORBIDDEN_KIND',
    USER_DISABLED: 'AUTH_USER_DISABLED',
  } as const;
  ```

**Frontend** :
- `useArtistAuthStore` et `useAdminAuthStore` distincts.
- Guards de route : `<ProtectedRoute kind="artist">`, `<ProtectedRoute kind="admin">`.
- Redirection automatique vers `/artist/login` ou `/admin/login` si 401.

### Dépendances inter-stories
- S-16 (auth artiste).
- Auth admin (couverte implicitement dans S-22+ ; à formaliser similaire à S-16).

### Edge cases & risques
- Mélange artiste/admin dans le même browser (tabs différents) : V1 = les stores sont distincts mais le cookie httpOnly peut entrer en conflit si même domaine. **Recommandation** : préfixer les cookies (`gz_artist_session`, `gz_admin_session`).
- Token volé : V1 = expiration courte (12h), pas de blacklist. V2 = blacklist Redis.
- Tampering JWT : vérification de signature avec `JWT_KEY` obligatoire.

### DoD
- Tests exhaustifs : matrice rôle × route protégée → statut attendu.
- Audit log de chaque tentative 403 pour détection d'abus.
- Documentation Swagger : `security` schemes JWT déclarés.

---

## S-35 — Emails automatiques pour chaque étape clé

**En tant que** Système, **je veux** envoyer des emails automatiques pour chaque étape clé (demande, validation, paiement, contrat), **afin de** informer client, artiste, admin sans intervention manuelle.

**Estimation** : L

### Contexte & enjeux
Tunnel critique. Tout email manqué = friction de conversion ou client perdu.

### Critères d'acceptation
- **Given** un événement métier survient, **when** déclenché, **then** un email est envoyé selon la matrice ci-dessous.
- **Given** un email est envoyé, **when** persisté, **then** une trace est stockée dans `email_deliveries` (recipient, template, status, error si fail).
- **Given** un email a échoué, **when** la cron de retry tourne, **then** elle ré-essaie max 3 fois avec backoff exponentiel (5min, 30min, 2h).
- **Given** un email est livré, **when** confirmé par le SMTP (V2 : webhook), **then** status passe à `delivered`.
- **Given** un email a échoué 3 fois, **when** la cron tente une 4e, **then** elle abandonne et alerte l'admin (notification interne).

#### Matrice d'événements → emails

| Event | Destinataires | Template |
|---|---|---|
| Booking créé (S-07) | Client | `bookingConfirmation` |
| Booking validé par admin (S-24) | Client | `bookingApproved` |
| Booking refusé par admin (S-24) | Client | `bookingRejected` |
| Validation client (S-09) effectuée | Admin (notif interne) | n/a (notif) |
| Acompte payé (S-10/S-11) | Client + Artiste + Admin | `bookingConfirmed` |
| Booking annulé | Client + Artiste | `bookingCancelled` |
| Contrat à signer (S-29) | Artiste | `contractReady` |
| Contrat signé (S-20) | Client + Admin | `contractSigned` |
| Relance contrat (S-30) | Artiste | `contractReminder` |
| Reset mot de passe (S-16) | Artiste/Admin | `passwordReset` |
| Message contact (S-06) | Admin + Expéditeur | `contactMessage` + `contactAck` |

### Spécifications techniques

**Backend** :
- Table :
  ```sql
  CREATE TABLE email_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template TEXT NOT NULL,
    recipient TEXT NOT NULL,
    locale TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL,    -- 'pending' | 'sent' | 'delivered' | 'failed' | 'abandoned'
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_email_retry ON email_deliveries(status, next_retry_at);
  ```
- Service `MailerService` (déjà partiellement présent) étendu :
  - `enqueue(template, recipient, locale, payload)` → insert + tentative immédiate.
  - `processRetries()` → cron consommée par `FEATURE_JOBS`.
- Drivers (déjà prévus) : `logger`, `smtp`, `disabled`.
- Templates : `src/services/mailer/templates/<template>/{fr,nl,en}.html` + `.txt`.
- Constantes :
  ```ts
  export enum EmailTemplate {
    BOOKING_CONFIRMATION = 'bookingConfirmation',
    BOOKING_APPROVED = 'bookingApproved',
    BOOKING_REJECTED = 'bookingRejected',
    BOOKING_CONFIRMED = 'bookingConfirmed',
    BOOKING_CANCELLED = 'bookingCancelled',
    CONTRACT_READY = 'contractReady',
    CONTRACT_SIGNED = 'contractSigned',
    CONTRACT_REMINDER = 'contractReminder',
    PASSWORD_RESET = 'passwordReset',
    CONTACT_MESSAGE = 'contactMessage',
    CONTACT_ACK = 'contactAck',
  }
  ```
- Audit & RGPD : conserver `payload` 90 jours puis purger via cron.

### Dépendances
- Toutes les autres stories qui émettent des emails.

### Edge cases & risques
- Boucle d'emails (auto-reply spam) : envoi avec header `Auto-Submitted: auto-generated`.
- Bounce hard : V2 = webhook bounce, marquage `do_not_send`. V1 = log + alerte admin.
- GDPR : un client peut demander suppression → purge `email_deliveries` liés.
- Quota SMTP : monitorer taux via Prometheus (`email_sent_total`, `email_failed_total`).

### DoD
- Tous les templates existent dans les 3 langues.
- Tests d'intégration : chaque event → email enqueue.
- Test : cron retry traite un `failed` → tente une nouvelle fois.
- Métriques Prometheus exposées.

---

## S-36 — Responsive design

**En tant que** Système, **je veux** afficher correctement l'interface sur mobile, tablette et desktop, **afin de** ne pas perdre les visiteurs selon leur device.

**Estimation** : M

### Critères d'acceptation
- **Given** un visiteur sur un téléphone (largeur 360–640px), **when** n'importe quelle page publique est rendue, **then** aucun débordement horizontal (`overflow-x`), tous les CTA sont accessibles au pouce.
- **Given** un visiteur sur tablette (641–1024px), **when** une page est rendue, **then** la mise en page utilise les espaces (grilles 2 colonnes là où pertinent).
- **Given** un visiteur sur desktop (≥ 1280px), **when** une page est rendue, **then** la mise en page exploite l'espace (max-width container 1280–1440px).
- **Given** un test Lighthouse, **when** lancé sur 3 pages clés (`/`, `/artists/:slug`, `/booking/new`), **then** score "Best Practices" ≥ 90 et "Accessibility" ≥ 95.
- **Given** un test au clavier seul, **when** la navigation est tentée, **then** tous les éléments interactifs sont accessibles avec un focus visible.
- **Given** une page espace artiste ou admin sur mobile, **when** rendue, **then** elle reste lisible et utilisable (tableaux scrollables horizontalement, menus burger).

### Spécifications techniques

**Frontend** :
- Breakpoints : utiliser ceux définis dans `variables.scss` (cf. frontend/AGENTS.md). Liste :
  - `$breakpoint-xs` 393
  - `$breakpoint-sm` 576
  - `$breakpoint-md-4` 640
  - `$breakpoint-md-3` 768
  - `$breakpoint-md-2` 992
  - `$breakpoint-md` 1024
  - `$breakpoint-lg-4` 1280
  - `$breakpoint-lg-3` 1440
  - `$breakpoint-lg-2` 1600
  - `$breakpoint-lg` 1920
  - `$breakpoint-xl` 2560
- Mixin `@include maxScreen($breakpoint)` pour les media queries.
- Layout fluide : `clamp()`, `min()`, `max()` ; éviter les largeurs en `px` fixes.
- Images responsive : `srcset` + `sizes`, `loading="lazy"` sauf hero.
- Tester avec Playwright sur 3 viewports : 375×667, 768×1024, 1440×900.

### Dépendances
- Toutes les autres stories.

### Edge cases & risques
- `viewport meta` manquant : impose `<meta name="viewport" content="width=device-width, initial-scale=1">` dans `index.html`.
- Tableaux admin denses sur mobile : prévoir une vue cartes alternative pour `< 768px`.
- Calendrier admin global (S-27) : difficile sur mobile → afficher message "Utilisez tablette ou desktop pour cette vue" (acceptable V1).
- Touch targets : minimum 44×44 px (norme WCAG).

### DoD
- Test Playwright multi-viewport sur pages clés.
- Lighthouse mobile + desktop scores documentés dans le PR.
- Pas de débordement horizontal détecté (script `npm run check:overflow` ou test visuel).
- Vérification manuelle iOS Safari + Android Chrome.
