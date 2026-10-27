# Mohafiz Case Desk — System Architecture (Phase 1)

This document details the architectural foundation established in Phase 1 for **Mohafiz Case Desk**, a professional case-management platform.

---

## 1. Architectural Philosophy

Mohafiz Case Desk follows clean architecture principles with strict boundary separation between:
1. **Frontend Presentation**: Model–View–Presenter (MVP) with decoupled views and presenters.
2. **Backend API**: Layered REST API (`/api/v1`) using Express, TypeScript, and Zod validation.
3. **Data Layer**: PostgreSQL + Prisma ORM (prepared as an isolated foundation without requiring a running database in Phase 1).

---

## 2. Frontend Architecture — Model–View–Presenter (MVP)

The frontend avoids mixing business logic, data fetching, and state management directly inside React components.

```
┌────────────────────────────────────────────────────────┐
│                        VIEW                            │
│  (Pure React Component: renders UI, forwards actions)  │
└─────────────────────────┬──────────────────────────────┘
                          │ user actions / view model
                          ▼
┌────────────────────────────────────────────────────────┐
│                      PRESENTER                         │
│  (Custom hook/state coordinator: loading, errors, calc)│
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       validates & types         fetches / posts
                ▼                        ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│         MODEL           │    │         SERVICE         │
│  (Zod schemas, types,   │    │  (Centralized HTTP,     │
│   domain entities)      │    │   error translation)    │
└─────────────────────────┘    └─────────────────────────┘
```

### Layer Responsibilities

| Layer | Directory | Responsibilities | Constraints |
| :--- | :--- | :--- | :--- |
| **Model** | `src/models/` | TypeScript types, interfaces, Zod validation schemas, domain types (`Case`, `HealthResponse`, `Theme`). | Pure definitions; no React hooks or DOM APIs. |
| **View** | `src/views/` | Presentation components that render DOM structures and visual layout. | **No direct API calls**, no complex business calculations. Only consumes presenter state. |
| **Presenter** | `src/presenters/` | Coordinates component lifecycle, calls services, manages loading/error states, formats data for view consumption. | Keeps UI presentation decoupled from networking details. |
| **Service** | `src/services/` | Centralizes HTTP communication via `apiClient`, transforms network responses, handles timeouts. | Stateless singletons or static service classes. |

---

## 3. Backend Architecture — Layered Express + TypeScript

The backend is organized modularly under `src/`:

```
backend/src/
├── config/             # Environment validation with Zod (PORT, CORS, DB)
├── middleware/         # Centralized error handler, request logger, 404 handler
├── modules/
│   └── health/         # Modular feature slice: controller, route, service
├── database/           # Prisma client instantiation placeholder
├── app.ts              # Express application configuration and middleware stack
└── server.ts           # HTTP server startup and graceful shutdown
```

### Middleware Pipeline

1. **CORS Middleware**: Validates incoming origin against `CORS_ORIGIN` env variable.
2. **JSON & URL-Encoded Body Parsers**: Standard Express payload parsers.
3. **Request Logger**: Logs timestamp, method, path, HTTP status, and duration (ms).
4. **Router Stack**: Prefixed at `/api/v1/*`.
5. **404 Not Found Handler**: Returns standardized JSON error for unmatched routes.
6. **Centralized Error Handler**: Translates `ZodError`, `AppError`, and unexpected exceptions into structured JSON responses.

### Error Response Schema

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | APP_ERROR | NOT_FOUND | INTERNAL_SERVER_ERROR",
    "message": "Human-readable description",
    "details": []
  }
}
```

---

## 4. Database Layer — Prisma ORM & PostgreSQL

In Phase 1:
- `backend/prisma/schema.prisma` is configured with PostgreSQL provider and client generator.
- Initial placeholder schema includes the `Case` domain model with statuses (`OPEN`, `IN_PROGRESS`, `PENDING_REVIEW`, `CLOSED`, `ARCHIVED`) and priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- `src/database/prisma.ts` exports the Prisma client without blocking server startup when no live PostgreSQL instance is available.
