# Frontend Agent Guide

This file is the source of truth for all frontend conventions, patterns, and rules.
Agents working in `frontend/` must follow everything here.

---

## Stack

| Concern | Library | Version |
|---|---|---|
| UI | React | 19 |
| Build | Vite | 8 |
| Language | TypeScript (strict) | 5 |
| Routing | React Router DOM | 7 |
| State | Zustand | 5 |
| Animations | GSAP + ScrollTrigger | 3 |
| i18n | i18next + react-i18next | 25 / 16 |
| Styles | SCSS (no CSS modules) | — |
| Notifications | react-hot-toast | 2 |
| Icons | react-icons | 5 |
| SEO | react-helmet-async | — |
| UI library | covaltech-react-ui (submodule) | — |
| Testing | Vitest + React Testing Library | — |

---

## File & Folder Structure

### Components

```
src/components/ComponentName/
  ComponentName.tsx
  ComponentName.scss
```

- File MUST be named `ComponentName.tsx`, NEVER `index.tsx`
- Each component has its own folder, even if it has a single file
- Child components go in subfolders of the parent:

```
src/pages/Home/
  Home.tsx
  Home.scss
  Hero/
    Hero.tsx
    Hero.scss
```

### Pages

```
src/pages/PageName/
  PageName.tsx
  PageName.scss
  SubSection/
    SubSection.tsx
    SubSection.scss
```

### Stores

```
src/stores/StoreName.ts   ← project stores only
```

Stores from `covaltech-react-ui` (ThemeStore, LoadingStore, HeaderBannerStore, PaginationStore)
are imported directly from the submodule — **never re-create them locally**.

---

## TypeScript Rules

- Strict mode is enabled — no `any`, ever
- Interface naming: `ComponentNameProps` for component props
- Union types for variants: `type ButtonStyle = "blue" | "white" | "transparent"`
- Enums for environment/domain values: `export enum EnvironmentEnum { ... }`
- `as const` on config objects (e.g. `SOCIAL_LINKS`)
- `import type { ... }` for type-only imports

---

## Component Template

```tsx
import "./ComponentName.scss";

// External libraries
import { useState } from "react";

// Internal
import { useThemeMode } from "@/covaltech-react-ui";

interface ComponentNameProps {
  label: string;
  onClick?: () => void;
}

const ComponentName = ({ label, onClick }: ComponentNameProps) => {
  const { isDark } = useThemeMode();

  return (
    <div className="componentName">
      <span>{label}</span>
    </div>
  );
};

export default ComponentName;
```

**Rules:**
- SCSS import is always the first line, before all other imports
- Always `export default`, never named export for components
- Props interface defined inline in the same file (unless shared)
- No hardcoded colors — use SCSS variables (`$primary-color`, `$accent-color`, etc.)
- Use `useThemeMode()` from `covaltech-react-ui` to read current theme

---

## SCSS Conventions

### Variables are globally available — never import them manually

The following are auto-injected into every SCSS file via `vite.config.mts`:
- `variables.scss` → colors, fonts, spacing, radii, breakpoints
- `typography.scss` → text mixins (`@include text-t1`, `@include modal-title`, etc.)
- `mixins.scss` → `@include cardShadow(...)`, `@include maxScreen(...)`
- `covaltech-react-ui/index.scss` → UI library variables
- `react-ui.config.scss` → `$card-color`, `$input-background-color`, etc.

**Never write `@import` or `@use` for these files inside a component SCSS file.**

### Naming

- SCSS variables: `kebab-case` (`$primary-color`, `$padding-md`, `$breakpoint-lg-2`)
- Class names: `camelCase` in both JSX and SCSS (`.componentName`, `.styledButton`, `.dropdownDiv`)
- No BEM — use SCSS nesting with `&` instead

### Nesting pattern

```scss
.componentName {
  display: flex;

  .title {
    @include text-t2;
    color: $primary-font;
  }

  &.active {
    background: $secondary-color;
  }

  &:hover {
    opacity: 0.8;
  }
}
```

### Responsive design

Use the `maxScreen` mixin with variables from `variables.scss`:

```scss
@include maxScreen($breakpoint-md) {
  .componentName {
    flex-direction: column;
  }
}
```

Available breakpoints (largest → smallest):
`$breakpoint-xl` (2560) · `$breakpoint-lg` (1920) · `$breakpoint-lg-2` (1600) · `$breakpoint-lg-3` (1440) · `$breakpoint-lg-4` (1280) · `$breakpoint-md` (1024) · `$breakpoint-md-2` (992) · `$breakpoint-md-3` (768) · `$breakpoint-md-4` (640) · `$breakpoint-sm` (576) · `$breakpoint-xs` (393)

### Available global variables (selection)

**Colors:**
`$primary-color` · `$secondary-color` · `$tertiary-color` · `$quaternary-color` · `$accent-color` · `$primary-font` · `$secondary-font` · `$tertiary-font` · `$border-color` · `$light-color` · `$lock-color` · `$green-color` · `$main-orange`

**Spacing:**
`$padding-xxxs` (4) · `$padding-xxs` (7) · `$padding-xs` (10) · `$padding-sm` (14) · `$padding-md` (20) · `$padding-md-2` (25) · `$padding-lg` (30) · `$padding-xl` (40)

**Radius:**
`$radius-extra-small` · `$radius-small` · `$radius-medium-small` · `$radius-medium` · `$radius-large` · `$radius-extra-large`

---

## Import Order (enforced by ESLint)

`simple-import-sort` is active. Order within a file:

1. SCSS import (`import "./ComponentName.scss"`)
2. External library imports (`react`, `react-router-dom`, etc.)
3. `import type { ... }` statements
4. Internal project imports (`@/components/...`, `@/stores/...`, etc.)

Use `@/` alias for imports from `src/`:

```ts
import { useAuthStore } from "@/stores/AuthStore";
import { PAGES } from "@/config/pages";
```

---

## Stores

### Project store template

```ts
import { create } from "zustand";

import { loggerService, LogTag } from "@/Utils/LoggerService";

interface MyStoreState {
  data: MyType | null;
  setData: (data: MyType) => void;
  clearData: () => void;
}

export const useMyStore = create<MyStoreState>((set) => ({
  data: null,

  setData: (data) => {
    loggerService.info(LogTag.STORE, "MyStore: setData");
    set({ data });
  },

  clearData: () => {
    loggerService.info(LogTag.STORE, "MyStore: clearData");
    set({ data: null });
  },
}));
```

### Stores from covaltech-react-ui

Import directly from the submodule — do not copy or re-declare:

```ts
import { useThemeStore, useLoadingStore, useHeaderBannerStore } from "@/covaltech-react-ui";
```

| Store | Hook | Purpose |
|---|---|---|
| ThemeStore | `useThemeStore` | Light/dark mode, `init()` called in main.tsx |
| LoadingStore | `useLoadingStore` | Loading state per key: `setLoading(key, bool)` |
| HeaderBannerStore | `useHeaderBannerStore` | Global banner visibility/height |
| PaginationStore | via `usePagination` | Table pagination |

### LogTag values

```ts
export enum LogTag {
  APP = "APP",
  AUTH = "AUTH",
  STORE = "STORE",
  API = "API",
  UI = "UI",
  HOOK = "HOOK",
}
```

### Logger API

```ts
loggerService.debug(LogTag.STORE, "message", optionalData);
loggerService.info(LogTag.STORE, "message");
loggerService.warn(LogTag.API, "message");
loggerService.error(LogTag.AUTH, "message", error);
```

`debug` only runs in development. Never use `console.log`.

---

## Routing

### I18N_ROUTING flag (`src/config/site.ts`)

```ts
export const I18N_ROUTING = true;
// true  → /:lang/* routing (/en/, /fr/) with LanguageSwitcher
// false → standard routing (/) for single-language apps
```

### Add a new page

1. Create `src/pages/MyPage/MyPage.tsx` + `MyPage.scss`
2. Add a constant to `src/config/pages.ts`:
   ```ts
   export const PAGES = {
     main: "/",
     myPage: "/my-page",
   };
   ```
3. Add the page to `src/app/router/lazyPages.ts` as a `lazy()` import
4. Register the route in **both** `src/app/router/I18nRouter.tsx` **and** `src/app/router/MonoRouter.tsx` — forgetting either produces a runtime "route not found" depending on the `I18N_ROUTING` flag
5. Add a nav item to `useNavItems.tsx` if needed

### Path source of truth

- All application page paths must live in `src/config/pages.ts`
- Do not hardcode app page URLs in components, hooks, or routers
- Import `PAGES` or page helpers from `@/config/pages` instead
- Exception: dynamic route patterns needed by React Router, such as `/:lang/*`, may stay inline in router files

### Code splitting

- Page components are lazy-loaded: declare them in `src/app/router/lazyPages.ts` with React `lazy()`, and never import a page directly inside a router file
- `AppRouter` wraps the routers in `<Suspense>` with `RouteFallback` as the fallback — no extra Suspense boundary is needed per route

---

## i18n

### Translation key structure

```json
{
  "seo": { "title": "...", "description": "..." },
  "language": { "switcher_aria": "..." },
  "nav": { "home": "..." },
  "contact": { "dropdownPlaceholder": "..." }
}
```

- Nested objects with dot access: `t("seo.title")`, `t("nav.home")`
- Both `en.json` and `fr.json` must always stay in sync
- New keys go at the bottom of the relevant section

### Usage in components

```tsx
import { useTranslation } from "react-i18next";

const { t, i18n } = useTranslation();
const lang = i18n.resolvedLanguage ?? "en";
```

---

## covaltech-react-ui Submodule

Path: `src/covaltech-react-ui/`
Import via alias: `import { ... } from "@/covaltech-react-ui"`

**Components:**
`Button` · `Modal` · `Navbar` · `Spinner` · `ErrorBoundary` · `HeaderBanner` · `HeaderButtons` · `DynamicTable` · `Table` · `Checkbox` · `Calendar` · `StyledInputText` · `StyledInputEmail` · `StyledInputPassword` · `StyledInputNumber` · `StyledInputDate` · `StyledInputFile` · `StyledInputTextArea` · `StyledDropdown` · `StyledSwitch` · `PopupMenu` · `ToolTip` · `CopyButton` · `Identicon` · `Slider` · `NoData`

**Hooks:**
`useThemeMode` · `useInitTheme` · `useWindowWidth` · `usePagination`

**Stores:**
`useThemeStore` · `useLoadingStore` · `useHeaderBannerStore`

---

## Animations

GSAP is the only animation library. Never use framer-motion or CSS keyframe animations for complex sequences.

### useAnimation hook

```ts
import useAnimation from "@/hooks/useAnimation";
const { animateFadeIn, animateFadeInWithMove, scrollToSection } = useAnimation();
```

### useScrollAnimation hook

Auto-applies scroll-triggered fade-in to elements with class `fi`:

```tsx
import useScrollAnimation from "@/hooks/useScrollAnimation";

// In a page/section component:
useScrollAnimation();

// With stagger groups:
useScrollAnimation([
  { itemsSelector: ".myGrid .myCard", triggerSelector: ".myGrid" }
]);
```

```html
<!-- Any element with class "fi" fades in when it enters the viewport -->
<div className="fi">Content</div>
```

Respects `prefers-reduced-motion`.

### useRevealOnScroll hook

Lightweight scroll-reveal for marketing pages — adds the `reveal--visible` class to any element with the class `reveal` once it enters the viewport. IntersectionObserver-based, respects `prefers-reduced-motion`.

```tsx
import useRevealOnScroll from "@/hooks/useRevealOnScroll";

useRevealOnScroll();
```

### SVG import

```tsx
import Logo from "@/assets/svg/logo.svg?react";
// Usage: <Logo />
```

---

## SEO & Config

- Site metadata lives in `src/config/site.ts` (`SITE_NAME`, `SITE_URL`, `I18N_ROUTING`)
- Social links and contact email in `src/config/socials.ts`
- `SeoHead` component handles all meta tags — use it once at the root of each localized layout
- `react-helmet-async` HelmetProvider is mounted in `main.tsx`

---

## API Calls

Use `appFetch` from `@/Utils/Services/Fetch/appFetch`:

```ts
import { appFetch } from "@/Utils/Services/Fetch/appFetch";

const data = await appFetch("/api/users");
```

- Handles 403 (unauthorized), 429 (rate limit), PDF blobs, JSON
- Shows `toast.error` automatically on error
- Never use raw `fetch()` directly

### Keeping data fresh

`useAutoRefresh` re-runs a callback when the tab regains focus and on a light interval (60s) while visible — use it on pages that must stay current without a realtime connection:

```ts
import useAutoRefresh from "@/hooks/useAutoRefresh";

useAutoRefresh({ onRefresh: refetch });
```

Wrap `onRefresh` in `useCallback` so its identity stays stable.

---

## Testing

Unit tests use **Vitest** + **React Testing Library** (jsdom environment).

### Layout

- Tests live in `tests/unit/` and mirror `src/` 1:1 (`src/components/Button/Button.tsx` → `tests/unit/components/Button/Button.test.tsx`)
- Shared setup is in `tests/setupEnv.ts`; render helpers in `tests/testUtils.tsx`
- `vitest.config.mts` is the dedicated test config; `tsconfig.test.json` type-checks tests

### Commands

```bash
npm run test           # run once
npm run test:watch     # watch mode
npm run test:coverage  # coverage report
```

### Conventions

- Render components with `renderWithProviders()` from `@tests/testUtils` (wraps `MemoryRouter` + `HelmetProvider`)
- Import test utilities with the `@tests/*` alias
- Test behavior, not implementation — query by role/text, not class names
- A new component or page is not done until it ships with its test file

---

## PR Checklist

Before opening a PR on frontend code, verify:

- [ ] No `index.tsx` files — every component is `ComponentName.tsx`
- [ ] No `any` in TypeScript
- [ ] No `console.log` — use `loggerService`
- [ ] No hardcoded colors in SCSS — use `$variables`
- [ ] No manual `@use`/`@import` for global SCSS files in component `.scss` files
- [ ] `ThemeStore`, `LoadingStore`, `HeaderBannerStore` imported from `@/covaltech-react-ui`, not redeclared
- [ ] New i18n keys added to both `en.json` and `fr.json`
- [ ] New routes added to `config/pages.ts` and the relevant router files
- [ ] No hardcoded app page paths outside `config/pages.ts` except React Router dynamic patterns
- [ ] `loggerService` used with the correct `LogTag` value
- [ ] New pages added to `lazyPages.ts` and registered in both routers
- [ ] New component/page ships with a Vitest test file; `npm run test` passes
