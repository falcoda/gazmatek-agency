# Website Template

A full-stack personal website template built with **React + Vite**, **Node.js + Express**, **PostgreSQL**, and **Docker**. Includes a self-hosted CI/CD pipeline via GitHub Actions and a built-in component library (`covaltech-react-ui`).

---

## Stack

### Frontend

| Tool                                            | Purpose                 |
| ----------------------------------------------- | ----------------------- |
| [Vite](https://vitejs.dev/)                     | Build tool & dev server |
| [React 19](https://react.dev/)                  | UI framework            |
| [TypeScript](https://www.typescriptlang.org/)   | Type safety             |
| [SCSS](https://sass-lang.com/)                  | Styling                 |
| [Zustand](https://zustand-demo.pmnd.rs/)        | State management        |
| [React Router v7](https://reactrouter.com/)     | Client-side routing     |
| [i18next](https://www.i18next.com/)             | Internationalization    |
| [GSAP](https://greensock.com/gsap/)             | Animations              |
| [react-hot-toast](https://react-hot-toast.com/) | Notifications           |

### Backend

| Tool                                              | Purpose               |
| ------------------------------------------------- | --------------------- |
| [Node.js](https://nodejs.org/)                    | Runtime               |
| [Express](https://expressjs.com/)                 | HTTP server           |
| [TypeScript](https://www.typescriptlang.org/)     | Type safety           |
| [PostgreSQL](https://www.postgresql.org/)         | Database              |
| [pgtyped](https://pgtyped.dev/)                   | Type-safe SQL queries |
| [Zod](https://zod.dev/)                           | Runtime validation    |
| [JWT](https://jwt.io/)                            | Authentication        |
| [Argon2](https://github.com/ranisalt/node-argon2) | Password hashing      |
| [Swagger / OpenAPI](https://swagger.io/)          | API documentation     |
| [Prometheus](https://prometheus.io/)              | Metrics               |
| [Winston](https://github.com/winstonjs/winston)   | Logging               |
| [Helmet](https://helmetjs.github.io/)             | Security headers      |

### Infrastructure

| Tool                                                  | Purpose                       |
| ----------------------------------------------------- | ----------------------------- |
| [Docker Compose](https://docs.docker.com/compose/)    | Container orchestration       |
| [GitHub Actions](https://github.com/features/actions) | CI/CD                         |
| Self-hosted Runner                                    | Deployment on your own server |

---

## Project Structure

```
website-template/
├── frontend/                  # React + Vite app
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level pages
│       ├── stores/            # Zustand stores
│       ├── hooks/             # Custom React hooks
│       ├── i18n/              # Translation files
│       ├── assets/            # Static assets & styles
│       ├── covaltech-react-ui/      # Built-in component library
│       └── types/             # TypeScript type definitions
├── backend/                   # Node.js + Express API
│   └── src/
├── docker/                    # Docker Compose config
│   ├── docker-compose.yml
│   └── db/
└── .github/
    └── workflows/
        └── deploiement-runner.yml
```

---

## covaltech-react-ui

This template ships with an internal component library under `frontend/src/covaltech-react-ui/`. It provides ready-to-use, theme-aware components:

**Layout & Navigation**

- `Navbar` — configurable navigation bar with layout and item type support
- `HeaderBanner` — dismissable top banner
- `Modal` — accessible modal dialog
- `PopupMenu` — contextual dropdown menu

**Form & Inputs**

- `StyledInput*` — text, password, email, number, date, time, file, textarea, search, address
- `StyledDropdown` — styled select dropdown
- `Checkbox`, `StyledSwitch` — toggles
- `Button`, `ButtonSwitcher` — action buttons

**Data Display**

- `Table`, `DynamicTable` — tabular data with pagination (`usePagination`)
- `Slider`, `Identicon`, `ToolTip`, `CopyButton`
- `NoData` — empty state placeholder

**Utilities**

- `ErrorBoundary` — top-level error catching
- `Spinner` — loading indicator
- `Container`, `ContainerContent`, `Card`, `Span` — layout wrappers
- `FormatDate`, `FormatHex`, `FormatNodeID`, `FormatTransaction` — data formatters

**Hooks**

- `useThemeMode` / `useInitTheme` — dark/light theme management
- `useWindowWidth` / `getBreakpoint` — responsive utilities
- `useLoadingStore`, `useHeaderBannerStore`, `useThemeStore` — global stores

---

## Customization — SCSS Variables

All visual tokens are centralized in two files:

### `frontend/src/assets/styles/variables.scss`

Global design tokens shared across the entire app. Edit these to change the look of every component at once.

```scss
// Brand colors
$primary-color: #0d162d;
$secondary-color: #0c90ff; // accent / interactive blue
$tertiary-color: #060d22;
$quaternary-color: #0d2242;

// Backgrounds
$primary-background-color: #0d162d;
$secondary-background-color: rgba(12, 144, 255, 0.1);

// Typography colors
$primary-font: #f3f6fb;
$secondary-font: #7184c1;
$tertiary-font: #9ba3b6;

// Status colors
$lock-color: #f25050; // error / danger
$green-color: #38c769; // success
$main-orange: #ff8e00; // warning

// Border radius scale
$radius-small: 5px;
$radius-medium: 10px;
$radius-large: 15px;
$radius-extra-large: 20px;

// Spacing scale (padding & margin)
$padding-xs: 10px;
$padding-sm: 14px;
$padding-md: 20px;
$padding-lg: 30px;
$padding-xl: 40px;

// Breakpoints
$breakpoint-md: 1024px; // tablet
$breakpoint-md-3: 768px; // small tablet
$breakpoint-sm: 576px; // mobile
```

### `frontend/src/assets/styles/react-ui.config.scss`

Overrides specifically for `covaltech-react-ui` components. Adjust these to restyle the library without touching its source.

```scss
// Inputs
$input-background-color: #252d42;
$input-field-color: rgba(12, 144, 255, 0.5);
$input-label-color: $secondary-font;

// Buttons
$primary-button-background: #0c90ff;
$primary-button-hover: #45affc;

// Navbar
$navbar-background: #0d162d;
$navbar-active-background: #0c90ff;
$navbar-hover-background: rgba(12, 144, 255, 0.2);

// Dropdown
$dropdown-background-color: #252d42;
$dropdown-hover-color: rgba(12, 144, 255, 0.3);

// Table
$table-background-color: #0d162d;
$table-font-color: $light-color;

// Modal
$modal-background-color: $container-content-color;
$modal-font-color: $light-color;
```

> Variables defined in `variables.scss` are automatically available everywhere — no import needed.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Frontend (development)

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` with hot reload.

### Backend (development)

```bash
cd backend
npm install
npm run dev
```

### Production (Docker)

```bash
cd docker
cp .env.example .env   # fill in DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE
docker compose up -d db
docker compose run --rm migrate
docker compose run --rm seed
docker compose up -d website
```

This starts:

- `db` — PostgreSQL database
- `migrate` — one-shot migration job
- `seed` — one-shot seed job
- `website` — Node.js backend on the internal network

---

## CI/CD — Self-hosted Runner

### Setup

1. **Register a self-hosted runner** on your server following the [GitHub Actions documentation](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners).

2. **Create the deployment directory** on your server and grant write permissions to the runner user:

   ```bash
   mkdir -p "$HOME/PROD-your-repository-name"
   chown -R runner-user:runner-user "$HOME/PROD-your-repository-name"
   ```

3. **The workflow deploys into** `$HOME/PROD-${{ github.event.repository.name }}` **in** `.github/workflows/deploiement-runner.yml`:

   ```yaml
   REPO_PATH="$HOME/PROD-${{ github.event.repository.name }}"
   ```

   Replace `your-repository-name` and `runner-user` with your actual repository name and runner user.

4. **Push to main** — the workflow triggers automatically on every push.

---

## Environment Variables

Create a `.env` file in `docker/`:

```env
ENVIRONMENT=prod
NODE_ENV=production
APP_NAME=website
DATABASE_USERNAME=your_user
DATABASE_PASSWORD=your_password
DATABASE=your_database
```

Container names are prefixed automatically using `ENVIRONMENT` and `APP_NAME`.
Example: `prod-website`, `prod-website-migrate`, `prod-your_database-db`.

### Container Prefix Rules

Naming formula used by Docker Compose:

- `website`: `${ENVIRONMENT}-${APP_NAME}`
- `migrate`: `${ENVIRONMENT}-${APP_NAME}-migrate`
- `seed`: `${ENVIRONMENT}-${APP_NAME}-seed`
- `db`: `${ENVIRONMENT}-${DATABASE}-db`

What each variable means:

- `ENVIRONMENT` controls deployment naming scope (`dev`, `staging`, `prod`).
- `NODE_ENV` controls Node.js runtime behavior (`development`, `production`, `test`).

Recommended combinations:

- local dev: `ENVIRONMENT=dev` and `NODE_ENV=development`
- production: `ENVIRONMENT=prod` and `NODE_ENV=production`

Keep the same `ENVIRONMENT` for all services of one stack so every container uses the same prefix.

---

## Available Scripts

### Frontend

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start dev server with hot reload    |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview production build            |
| `npm run lint`    | Run ESLint with auto-fix            |
| `npm test`        | Run Cypress tests                   |

### Backend

| Command                    | Description                        |
| -------------------------- | ---------------------------------- |
| `npm run dev`              | Start with nodemon + ts-node       |
| `npm run build`            | Compile TypeScript                 |
| `npm run test`             | Run all tests                      |
| `npm run test:integration` | Run integration tests only         |
| `npm run lint`             | Run ESLint                         |
| `npm run db:migrate`       | Apply pending SQL migrations       |
| `npm run db:seed`          | Run seed scripts                   |
| `npm run pgtyped`          | Generate TypeScript types from SQL |
| `npm run check:all`        | format + lint + test               |

---

## License

This template is open-source under the [MIT License](LICENSE).
