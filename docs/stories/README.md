# Backlog Booking Gazmatek

> **Domaine** : `booking.Gazmatek.com`
> **Stack cible** : React 19 + Vite (frontend), Node.js + Express + TypeScript + PostgreSQL (backend)
> **Statut** : Backlog initial — découpé en epics et user stories pour exécution par agents IA / équipe humaine.

---

## Vue d'ensemble

| Métrique | Valeur |
|---|---|
| Epics | 7 |
| User stories | 36 |
| Rôles | 3 (Visiteur, Client, Artiste, Admin, Système) |
| Langues | 3 (FR, NL, EN) |

---

## Index des epics

| ID | Epic | Stories | Fichier |
|---|---|---|---|
| E1 | Site vitrine | 6 | [EPIC-01.md](EPIC-01.md) |
| E2 | Demande de booking (client) | 5 | [EPIC-02.md](EPIC-02.md) |
| E3 | Agenda & disponibilités | 4 | [EPIC-03.md](EPIC-03.md) |
| E4 | Espace artiste | 6 | [EPIC-04.md](EPIC-04.md) |
| E5 | Espace admin | 9 | [EPIC-05.md](EPIC-05.md) |
| E6 | Multilingue | 3 | [EPIC-06.md](EPIC-06.md) |
| E7 | Transverse (sécurité, emails, rôles, responsive) | 3 | [EPIC-07.md](EPIC-07.md) |
| E8 | Itération 1 — refinements UX, layouts, espace client, onboarding artiste | 16 | [EPIC-08.md](EPIC-08.md) |

---

## Rôles utilisateurs

| Rôle | Authentification | Description |
|---|---|---|
| **Visiteur** | Aucune | Toute personne arrivant sur le site sans compte. Peut consulter le site vitrine et soumettre une demande de booking. |
| **Client** | Lien magique / token email | Personne ayant initié une demande. Reçoit des emails, valide le booking, paie l'acompte. Pas de compte permanent par défaut. |
| **Artiste** | JWT (email + mot de passe) | Artiste représenté par l'agence. Accès à son espace, son agenda, ses contrats. |
| **Admin** | JWT (email + mot de passe) | Membre de Gazmatek. Gère artistes, bookings, paiements, contrats. |
| **Système** | N/A | Stories transverses non liées à un acteur humain (emails automatiques, rôles, responsive). |

---

## Codage des stories

- **ID** : `S-XX` (numérotation globale)
- **Estimation (points)** :
  - `S` (Small) ≈ 0.5 à 1 jour
  - `M` (Medium) ≈ 2 à 3 jours
  - `L` (Large) ≈ 4 à 6 jours, à scinder si dépassé

## Conventions techniques

- Backend : voir [backend/AGENTS.md](../../backend/AGENTS.md). Toute requête SQL doit passer par `pgtyped`. Toute route doit être validée par Zod. Authentification via `authenticate(pool)`.
- Frontend : voir [frontend/AGENTS.md](../../frontend/AGENTS.md). Routes via `src/config/pages.ts`. i18n via `react-i18next`. Stores Zustand. Pas de `index.tsx`.
- Pas de magic strings ni de numbers : tout va dans un enum ou une constante centralisée.
- Emails transactionnels : service `mailer` (driver SMTP en prod, logger en dev).
- Paiement : provider externe (Stripe pressenti — à confirmer côté business).
- Signature électronique : provider externe (DocuSign / Yousign pressenti — à confirmer).

## Format des fichiers epic

Chaque fichier `EPIC-XX.md` contient :

1. **Objectif** de l'epic
2. **Périmètre** (in / out of scope)
3. **Dépendances** (autres epics, services externes)
4. **Stories** détaillées avec :
   - User story
   - Contexte & enjeux
   - Critères d'acceptation (format Given / When / Then)
   - Spécifications techniques (frontend, backend, DB, integrations)
   - Dépendances inter-stories
   - Edge cases & risques
   - Definition of Done (DoD)

## Definition of Done — générique (s'applique à toutes les stories)

- [ ] Code mergé sur `main` après revue
- [ ] Tests unitaires / d'intégration passent (`npm run test`)
- [ ] Linter vert (`npm run lint` backend ET frontend)
- [ ] Pas de magic string / number
- [ ] Toutes les chaînes utilisateur sont dans les fichiers i18n (`en.json`, `fr.json`, `nl.json`)
- [ ] Documentation Swagger à jour pour les nouvelles routes backend
- [ ] Migration SQL + types pgtyped commités quand DB modifiée
- [ ] Accessible au clavier et compatible mobile/tablette/desktop
- [ ] Logs via `loggerService` (frontend) ou logger applicatif (backend), pas de `console.log`
