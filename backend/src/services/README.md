# Services Overview

This backend uses service factories to keep infrastructure concerns out of controllers.

## Lifecycle rules

- Services with persistent state should be cached.
- Services that expose resources should also expose a close function.
- App entrypoints register shutdown handlers for cached services.

## Current patterns

- Storage: cached service with explicit shutdown via `closeStorageService()`.
- Mailer: cached service with explicit shutdown via `closeMailerService()`.
- Notifications: cached service with explicit shutdown via `closeNotificationService()`.

## Driver selection

- Storage currently uses `local` with a disabled fallback when the feature flag is off.
- Mailer uses `logger`, `smtp`, or `disabled`.
- Notifications use `logger` or `telegram`.

## Example module

The `example` module is demo-only.

- It exists to show the expected route/controller/service/schema structure.
- Its service returns placeholder data and should be replaced in a real project.
- Keep the structure, not the business logic.
