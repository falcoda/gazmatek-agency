# Frontend Tests

Unit / component tests for the React frontend. The runner is **Vitest + React
Testing Library**. The layout mirrors the backend's dedicated `tests/` folder.

## Structure

```
tests/
  setupEnv.ts            global test setup (loaded once before every file)
  testUtils.tsx          render helpers + re-export of RTL & userEvent
  unit/                  one test file per source file, mirroring src/
    components/<path>/<Name>.test.tsx
    pages/<path>/<Name>.test.tsx
```

The test path mirrors the source path 1:1:

| Source file                          | Test file                                        |
| ------------------------------------ | ------------------------------------------------ |
| `src/components/Spinner/Spinner.tsx` | `tests/unit/components/Spinner/Spinner.test.tsx` |
| `src/pages/Home/Home.tsx`            | `tests/unit/pages/Home/Home.test.tsx`            |

## Commands

```bash
npm test               # run the whole suite once
npm run test:watch     # watch mode
npm run test:coverage  # full suite + coverage report (coverage/)
```

Scoped run while developing a batch:

```bash
npx vitest run tests/unit/components/Foo
npx vitest run tests/unit/components/Foo --coverage --coverage.reporter=text --coverage.all=false
```

## Conventions

- **Imports**: the component under test is imported with the `@/` alias
  (`@/components/...`, `@/pages/...`); test helpers with `@tests/testUtils`.
- **No globals**: import `describe`, `it`, `expect`, `vi`, `beforeEach`, … from
  `vitest` explicitly. Import order is fixed automatically by ESLint.
- **`render` vs `renderWithProviders`**:
  - `render` — plain RTL render, for components with no router/helmet need.
  - `renderWithProviders` — wraps with `MemoryRouter` + `HelmetProvider`. Pass
    `initialEntries` for the history stack and `routePath` when the component
    reads route params (e.g. `routePath: "/:lang/*"`).
- **i18n**: initialised globally in `setupEnv.ts` and forced to `en`. `t()`
  returns real English strings — assert against the actual translations in
  `src/i18n/translations/en.json`.
- One `describe` per component; meaningful behavioural assertions (props,
  conditional rendering, user interaction, callbacks) — not just smoke tests.

## What `setupEnv.ts` already provides

- A `#root` element so covaltech `Modal` (and other portals) mount correctly.
- jsdom stubs: `matchMedia`, `IntersectionObserver`, `ResizeObserver`,
  `window.scrollTo`, `Element.prototype.scrollIntoView`.
- RTL `cleanup()` after each test.

## Mocking cheat-sheet

`appFetch` (HTTP layer — `src/Utils/Services/Fetch/appFetch.tsx`):

```ts
import { appFetch } from "@/Utils/Services/Fetch/appFetch";

vi.mock("@/Utils/Services/Fetch/appFetch", () => ({
  appFetch: vi.fn(),
  default: vi.fn(),
}));

const appFetchMock = vi.mocked(appFetch);
beforeEach(() => appFetchMock.mockReset());
// per test: appFetchMock.mockResolvedValue({ ... });
```

`react-hot-toast` (default export is a callable with methods):

```ts
vi.mock("react-hot-toast", () => ({
  default: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  }),
}));
```

Zustand stores (`src/stores/*`): prefer the **real** store and seed it with
`useXStore.setState({ ... })` inside `beforeEach`; reset it between tests.

Any heavy third-party module a component depends on (animation libraries,
rich-text editors, etc.) should be mocked with `vi.mock` in the test file.

## Coverage goal

Every file under `src/components/**` and `src/pages/**` must reach **100 %**
(statements, branches, functions, lines). `types.ts` and `constants.ts` are
excluded; plain logic `.ts` files (helpers, etc.) are **not** excluded and need
their own tests. Use the `Uncovered Line #s` column to target gaps and exercise
every branch (loading / error / empty / populated states, every conditional).
