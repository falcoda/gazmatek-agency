## Documenso — setup local et webhook

Self-hosted Documenso pour signer les contrats d'engagement artistes.

### 1. Variables d'environnement requises

Dans `docker/.env` (voir `docker/.env.example` pour la liste complète) :

```env
# Container Documenso
DOCUMENSO_PORT=3002
DOCUMENSO_INTERNAL_PORT=3000
DOCUMENSO_APP_URL=http://localhost:3003
DOCUMENSO_DATABASE_URL=postgresql://user:password@db:5432/documenso
DOCUMENSO_DIRECT_DATABASE_URL=postgresql://user:password@db:5432/documenso
DOCUMENSO_SECRET_KEY=...               # base64, 32 bytes
DOCUMENSO_ENCRYPTION_KEY=...           # hex, 32 bytes
DOCUMENSO_ENCRYPTION_SECONDARY_KEY=... # hex, 32 bytes
DOCUMENSO_SIGNING_CERT=...             # base64 d'un PKCS#12

# Backend ↔ Documenso
DOCUMENSO_URL=http://documenso:3000
DOCUMENSO_API_KEY=...                  # généré dans l'UI Documenso après bootstrap
DOCUMENSO_WEBHOOK_SECRET=...           # secret partagé webhook
DOCUMENSO_WEBHOOK_SSRF_BYPASS_HOSTS=localhost,127.0.0.1,host.docker.internal

# Stockage S3 (MinIO) — requis par Documenso
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_BUCKET=documenso
MINIO_REGION=eu-west-1
MINIO_LOCAL_ENDPOINT=http://localhost:9010

# Backend renderer (Puppeteer via browserless)
PUPPETEER_BROWSER_WS_ENDPOINT=ws://browser:3000
# Si tu lances le backend localement (pas en docker) :
PUPPETEER_BROWSER_WS_ENDPOINT=ws://localhost:3011
```

### 2. Générer les secrets

```bash
# DOCUMENSO_SECRET_KEY (base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# DOCUMENSO_ENCRYPTION_KEY / SECONDARY_KEY (hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# DOCUMENSO_WEBHOOK_SECRET (hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# DOCUMENSO_SIGNING_CERT — cert de signature PKCS#12 auto-signé (dev only)
openssl req -x509 -newkey rsa:2048 -nodes -days 365 -subj "/CN=Gazmatek Dev" -keyout key.pem -out cert.pem
openssl pkcs12 -export -out cert.p12 -inkey key.pem -in cert.pem -passout pass:
base64 -w0 cert.p12  # copie cette valeur dans DOCUMENSO_SIGNING_CERT
```

### 3. Démarrer le stack

```bash
cd docker
docker compose up -d db
docker compose run --rm migrate
docker compose up -d minio minio-init browser documenso
```

Accès :
- Documenso UI : http://localhost:3003
- MinIO console : http://localhost:9011 (user/pass = MINIO_ROOT_USER/PASSWORD)

### 4. Créer un compte admin Documenso + API key

1. Ouvre http://localhost:3003, crée le premier compte (devient admin).
2. Settings → API Tokens → crée un token.
3. Colle la valeur dans `DOCUMENSO_API_KEY` (`.env` racine du backend + `docker/.env`).

### 5. Enregistrer le webhook côté Documenso

```bash
cd backend
npm run documenso:register-webhook
```

Le script affiche l'URL, l'event et le secret à copier dans :
`http://localhost:3003/settings/webhooks` → **Create webhook**.

| Champ        | Valeur                                              |
|--------------|-----------------------------------------------------|
| Webhook URL  | `http://host.docker.internal:3001/api/webhooks/documenso` (dev) |
| Events       | `DOCUMENT_COMPLETED`                                |
| Secret       | valeur de `DOCUMENSO_WEBHOOK_SECRET`                |
| Enabled      | ✓                                                   |

> En production, remplace `host.docker.internal:3001` par `APP_BASE_URL`
> (`https://api.ton-domaine.com`). Documenso doit pouvoir atteindre l'URL.

### 6. Flux complet une fois configuré

```
Artist clique « Signer via Documenso » dans son profil
  ↓
POST /api/artist/onboarding/engagement/sign
  ↓
Backend → Puppeteer → PDF
Backend → POST /api/v2/envelope/create (Documenso)
Backend → POST /api/v2/envelope/distribute (mode NONE)
  ↓
Réponse 200 { signingUrl: "https://documenso/sign/<token>" }
  ↓
Front ouvre la signingUrl dans un nouvel onglet
  ↓
L'artiste signe dans Documenso
  ↓
Documenso → POST /api/webhooks/documenso (event DOCUMENT_COMPLETED)
  ↓
Backend marque le contrat `signed`, set `artists.onboarding_completed_at`
  ↓
Front (polling toutes les 3s) détecte le changement et confirme
```

### 7. Dépannage

| Symptôme | Cause |
|---|---|
| `404 /api/artist/onboarding/engagement` | Backend pas redémarré après ajout des routes |
| `Documenso not configured` | `DOCUMENSO_URL` ou `DOCUMENSO_API_KEY` manquant |
| Webhook → `401 Invalid Documenso signature` | Secret différent entre Documenso et `DOCUMENSO_WEBHOOK_SECRET` |
| Webhook jamais reçu, statut reste `pending_signature` | Documenso ne peut pas joindre `APP_BASE_URL` (vérifie `host.docker.internal` ou ngrok) |
| `Documenso envelope/create error` 401/403 | `DOCUMENSO_API_KEY` invalide ou expirée |
| Puppeteer timeout | `browser` container down, ou `PUPPETEER_BROWSER_WS_ENDPOINT` incorrect |
