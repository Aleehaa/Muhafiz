# Mohafiz Case Desk

A professional case-management web application designed for security, legal, and desk operations in Pakistan. This repository contains **Phase 1: Foundation**, **Phase 2.1: Database & Core Models**, and **Phase 3: Professional Dashboard & Main Screens**, establishing an operational dashboard, case listing, single-case inspection, and officer assignment monitoring built on a Model–View–Presenter (MVP) React frontend with Express and PostgreSQL backend.

---

## 1. Technology Stack

- **Frontend**: React 18 + Vite + TypeScript (Strict mode)
- **Frontend Architecture**: Model–View–Presenter (MVP)
- **Routing**: React Router (`react-router-dom` v6)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (tested with PostgreSQL 17) + Prisma ORM (v6.x)
- **Validation**: Zod (runtime schema validation for inputs and domain constraints)
- **API**: REST API using `/api/v1` prefix

---

## 2. Brand Color Palette & Design Tokens

Mohafiz Case Desk utilizes a defined, accessible color palette specified via centralized CSS variables in `frontend/src/styles/tokens.css`:

- **Charcoal**: `#323943`
- **Warm Beige**: `#DED4CB`
- **Crimson Red**: `#CD2536`

### Theme Modes

- **Light Mode**: Warm off-white background (`#F9F7F4`) derived from Warm Beige, crisp white card surfaces (`#FFFFFF`), dark charcoal typography (`#323943`), subtle beige borders (`#DED4CB`), and crimson primary actions (`#CD2536`).
- **Dark Mode**: Deep charcoal page background (`#1A1F26`), elevated charcoal card surfaces (`#252B35`), warm off-white typography (`#F4EFEA`) derived from Warm Beige, and brightened crimson actions (`#CD2536` / `#DE3849`).
- **Theme Persistence**: Theme preference is saved to `localStorage` (`mohafiz_theme`) and falls back to system `prefers-color-scheme`.
- **Anti-Flash**: An inline initialization script in `frontend/index.html` sets the theme before rendering to eliminate flash of unstyled content (FOUC).

---

## 3. Directory Structure

```text
mohafiz-case-desk/
├── frontend/                     # React + Vite + TypeScript client
│   ├── src/
│   │   ├── app/                  # App shell, context providers, and routes
│   │   │   ├── App.tsx
│   │   │   ├── routes.tsx        # React Router: /, /cases, /cases/:id, /assignments
│   │   │   └── ThemeContext.tsx
│   │   ├── models/               # Domain interfaces aligned with Prisma schema
│   │   │   ├── assignment.model.ts
│   │   │   ├── case.model.ts
│   │   │   ├── dashboard.model.ts
│   │   │   ├── health.model.ts
│   │   │   └── theme.model.ts
│   │   ├── views/                # MVP Views (rendering UI, forwarding actions)
│   │   │   ├── DashboardView.tsx
│   │   │   ├── CasesListView.tsx
│   │   │   ├── CaseDetailView.tsx
│   │   │   ├── AssignmentsView.tsx
│   │   │   └── NotFoundView.tsx
│   │   ├── presenters/           # MVP Presenters (state, filters, metrics)
│   │   │   ├── useAssignmentsPresenter.ts
│   │   │   ├── useCaseDetailPresenter.ts
│   │   │   ├── useCasesPresenter.ts
│   │   │   ├── useDashboardPresenter.ts
│   │   │   ├── useHealthPresenter.ts
│   │   │   └── useThemePresenter.ts
│   │   ├── services/             # Service layer & data providers
│   │   │   ├── apiClient.ts
│   │   │   ├── assignment.service.ts
│   │   │   ├── case.service.ts
│   │   │   ├── health.service.ts
│   │   │   └── mockData/
│   │   │       └── cases.mock.ts # Phase 3 validated Pakistani operations dataset
│   │   ├── components/           # Reusable UI components & layouts
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── ui/
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── FilterSelect.tsx
│   │   │       ├── Formatters.ts
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── Pagination.tsx
│   │   │       ├── SearchInput.tsx
│   │   │       ├── StatCard.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── StatusIndicator.tsx
│   │   │       └── ThemeToggle.tsx
│   │   ├── hooks/                # Utility React hooks
│   │   │   └── useLocalStorage.ts
│   │   ├── styles/               # Design tokens and global CSS
│   │   │   ├── global.css
│   │   │   └── tokens.css
│   │   ├── vite-env.d.ts
│   │   └── main.tsx              # React DOM entry point
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                      # Express + TypeScript API server
│   ├── src/
│   │   ├── config/               # Zod-validated environment config
│   │   │   └── env.ts
│   │   ├── middleware/           # Logging, error handling, 404 handler
│   │   │   ├── errorHandler.ts
│   │   │   ├── notFoundHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── modules/              # Feature modules
│   │   │   ├── health/           # Health & Readiness checks
│   │   │   │   ├── health.controller.ts
│   │   │   │   ├── health.routes.ts
│   │   │   │   └── health.service.ts
│   │   │   ├── client-company/   # ClientCompany repository & service
│   │   │   │   ├── client-company.model.ts
│   │   │   │   ├── client-company.repository.ts
│   │   │   │   └── client-company.service.ts
│   │   │   ├── user/             # User domain models & validation
│   │   │   │   └── user.model.ts
│   │   │   ├── case/             # Case domain models & validation
│   │   │   │   └── case.model.ts
│   │   │   ├── assignment/       # Assignment domain models & validation
│   │   │   │   └── assignment.model.ts
│   │   │   └── audit/            # AuditEvent domain models & validation
│   │   │       └── audit.model.ts
│   │   ├── database/             # Prisma client & readiness check probe
│   │   │   └── prisma.ts
│   │   ├── app.ts                # Express application definition
│   │   └── server.ts             # Server entry point & graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL schema definition with 5 core models
│   │   └── migrations/           # Version-controlled SQL migrations
│   ├── tests/
│   │   ├── health.test.ts        # Health and readiness automated tests
│   │   └── domain-models.test.ts # Domain schemas and repository integration tests
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/                         # Architecture and design documentation
│   ├── architecture.md           # MVP and system architecture guide
│   ├── database-design.md        # Comprehensive DB schema and domain models guide
│   └── design-tokens.md          # Brand color tokens and theme guide
├── .gitignore
└── README.md
```

---

## 4. Application Routes (Phase 3)

| Route | View Component | Description |
| :--- | :--- | :--- |
| `/` | `DashboardView` | Operational overview: Summary KPI cards, 7-day intake trend, workflow status distribution, urgent cases needing action, recent incidents table. |
| `/cases` | `CasesListView` | Cases table: Search by case ID, tracking #, or company name; filter by workflow status, city, and issue type; sorting; pagination. |
| `/cases/:id` | `CaseDetailView` | Full read-only case inspection: incident overview, narrative, client details, active FSO dispatch, non-destructive assignment history, and chronological audit trail. |
| `/assignments` | `AssignmentsView` | Officer dispatch management: total, active, unassigned, and reassigned metrics; assignment table with status, dates, notes, and direct links to parent cases. |

---

## 5. Data Architecture & Phase 3 Boundaries

### Live vs Mock Data Separation
- **Live System Probes**: `GET /api/v1/health` and `GET /api/v1/health/ready` actively connect to the running Express backend and PostgreSQL database to monitor server health, latency, and database pool availability.
- **Phase 3 Operations Data**: Operational cases and assignment records are served from a dedicated, structured dataset (`frontend/src/services/mockData/cases.mock.ts`). This avoids populating the production database with temporary demo data before Phase 4 authentication is ready.
- **Missing Backend Endpoints**: Real database endpoints for cases (`GET /api/v1/cases`, `GET /api/v1/cases/:id`, `GET /api/v1/assignments`) are documented and scheduled for Phase 4 along with JWT-authenticated access control.
- **Strict Authentication Boundary**: Authentication, login screens, JWT sessions, role-based route guards, and password management are strictly out of scope for Phase 3 and will be implemented in Phase 4.

---

## 6. Prerequisites & Running the System

### Prerequisites
- **Node.js**: `v20.x` or higher (verified with `v25.8.2`)
- **npm**: `v10.x` or higher (verified with `v11.11.1`)
- **PostgreSQL**: `v14.x` or higher (tested with `v17.x`)

### 1. Start Backend API Server

```bash
cd backend
npm install
npm run dev
```

- API Base URL: `http://localhost:5001`
- Health Endpoint: `http://localhost:5001/api/v1/health`
- Database Readiness: `http://localhost:5001/api/v1/health/ready`

### 2. Start Frontend Application

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

- Web Application URL: `http://localhost:5173`

---

## 7. Testing & Quality Verification

### Backend Verification

```bash
cd backend
npm run typecheck    # Strict TypeScript verification (0 errors)
npm run build        # Production compilation
npm test             # Automated test suite (9 passing tests)
```

### Frontend Verification

```bash
cd frontend
npm run typecheck    # Strict TypeScript verification (0 errors)
npm run build        # Production bundle compilation (Vite)
```

---

## 8. Development Boundaries

- **Phase 1 (Completed)**: Stack foundation, Brand design tokens, MVP pattern, Express setup.
- **Phase 2.1 (Completed)**: PostgreSQL schema, Prisma migration, 5 core models (`User`, `ClientCompany`, `Case`, `Assignment`, `AuditEvent`), Zod validation, `health/ready` probe.
- **Phase 3 (Completed)**: Application shell (Sidebar, Header, Layout), Dashboard, Cases List, Case Details, Assignments screen.
- **Phase 4 (Next)**: User authentication, JWT sessions, role-based authorization, case creation workflows, and database-backed CRUD endpoints.
