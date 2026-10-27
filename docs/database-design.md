# Mohafiz Case Desk — Database & Domain Model Design (Phase 2.1)

This document specifies the PostgreSQL database architecture, core domain models, schema constraints, and design decisions for **Mohafiz Case Desk**.

---

## 1. Technology & Foundation

- **Database Engine**: PostgreSQL (tested and verified on PostgreSQL 17)
- **ORM & Migrations**: Prisma ORM (v6.x) with TypeScript client generation
- **Runtime Validation**: Zod schemas for input validation and domain constraints
- **Connection Strategy**: Pooled connection through `DATABASE_URL` with health/readiness probe (`SELECT 1`) and graceful pool termination on `SIGTERM` / `SIGINT`.

---

## 2. Core Domain Models

### 2.1 User (`users`)

Manages all system actors, including external client representatives and internal operations staff.

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Internal primary key UUID |
| `fullName` | `String` | | Full legal or display name |
| `email` | `String` | `@unique` | Unique login email |
| `passwordHash` | `String` | | Hashed password credential |
| `role` | `UserRole` | | Exactly one role per user |
| `isActive` | `Boolean` | `@default(true)` | Operational activity status |
| `clientCompanyId`| `String?` | Foreign Key | Required for `CLIENT_USER`, `NULL` for internal staff |
| `createdAt` | `DateTime` | `@default(now())` | Record creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Automatic update timestamp |

#### Role Definitions (`UserRole`)
- `CLIENT_USER`: External business client representative submitting and tracking cases.
- `CRO`: Central Response Officer (intake, triage, acknowledgment, and dispatch).
- `SFSO`: Senior Field Security Officer (supervisory oversight, escalations, report review).
- `FSO`: Field Security Officer (on-ground physical response and investigation).

#### Key Design Decisions:
- **Client Company Isolation**: `clientCompanyId` is strictly enforced via business validation: client users **must** have an associated `clientCompanyId`, while internal staff (`CRO`, `SFSO`, `FSO`) **must not** belong to a client company.
- **Single-Role Architecture**: To prevent privilege ambiguity, each user has exactly one explicit role.

---

### 2.2 ClientCompany (`client_companies`)

Represents logistics partners, e-commerce platforms, or corporate clients whose consignments and riders are protected by Mohafiz.

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Primary key UUID |
| `name` | `String` | | Company name (e.g., "Express Logistics PK") |
| `code` | `String` | `@unique` | Short uppercase alphanumeric identifier (e.g., `TCS`, `DARAZ`) |
| `isActive` | `Boolean` | `@default(true)` | Active partnership status |
| `createdAt` | `DateTime` | `@default(now())` | Registration timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last modification timestamp |

---

### 2.3 Case (`cases`)

The central entity tracking incidents, field response operations, and resolutions.

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Internal database UUID |
| `publicCaseId` | `String?` | `@unique` | Public identifier (e.g. `MCD-2026-0001`), `NULL` until acknowledged |
| `clientCompanyId`| `String` | Foreign Key | Associated client company |
| `createdById` | `String` | Foreign Key | User who logged the incident |
| `issueType` | `CaseIssueType` | | Incident classification |
| `incidentDate` | `DateTime` | | Occurrence timestamp |
| `city` | `CaseCity` | | Operational city |
| `area` | `String` | | Neighborhood/district (e.g., "Gulshan-e-Iqbal") |
| `address` | `String?` | | Detailed street address |
| `trackingNumber` | `String?` | | Client consignment or parcel tracking ID |
| `amountAtStake`| `Decimal` | `@default(0) @db.Decimal(12, 2)` | Financial loss or consignment value in PKR |
| `description` | `String` | `@db.Text` | Detailed narrative of the incident |
| `source` | `CaseSource` | | Ingestion channel (`CLIENT_PORTAL` or `CRO_LOGGED`) |
| `status` | `CaseStatus` | `@default(SUBMITTED)` | Current workflow status |
| `createdAt` | `DateTime` | `@default(now())` | Intake timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Status change timestamp |

#### Enums:
- **`CaseIssueType`**: `CUSTOMER_ISSUE`, `FAKE_DELIVERY`, `SNATCHING`, `THEFT`, `OTHER`.
- **`CaseCity`**: `KARACHI`, `LAHORE`, `RAWALPINDI`, `ISLAMABAD`.
- **`CaseSource`**: `CLIENT_PORTAL`, `CRO_LOGGED`.
- **`CaseStatus`**: `SUBMITTED`, `ACKNOWLEDGED`, `ASSIGNED`, `IN_PROGRESS`, `PENDING_REVIEW`, `RESOLVED`, `CLOSED`, `ON_HOLD`, `REJECTED`, `ARCHIVED`.

#### Key Design Decisions:
- **Internal vs. Public ID Separation**: Internal queries and foreign keys use the immutable UUID (`id`). The client-facing and officer-facing `publicCaseId` remains nullable until formal intake acknowledgment by a CRO, preventing gaps in sequential numbering for rejected submissions.
- **Financial Accuracy**: `amountAtStake` uses PostgreSQL `DECIMAL(12, 2)` to eliminate floating-point rounding errors when tracking currency in PKR.

---

### 2.4 Assignment (`assignments`)

Tracks officer dispatch and retains an immutable history of reassignments.

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Primary key UUID |
| `caseId` | `String` | Foreign Key | Target case (`ON DELETE CASCADE`) |
| `assignedFsoId` | `String` | Foreign Key | Assigned field officer (`ON DELETE RESTRICT`) |
| `assigningUserId`| `String` | Foreign Key | Dispatching CRO or SFSO (`ON DELETE RESTRICT`) |
| `status` | `AssignmentStatus` | `@default(ACTIVE)` | `ACTIVE`, `REASSIGNED`, `COMPLETED`, `CANCELLED` |
| `notes` | `String?` | `@db.Text` | Reassignment rationale or dispatch instructions |
| `assignedAt` | `DateTime` | `@default(now())` | Dispatch timestamp |
| `acknowledgedAt`| `DateTime?` | | Officer arrival/acknowledgment timestamp |
| `completedAt` | `DateTime?` | | Investigation completion timestamp |

#### Key Design Decision:
- **Non-Destructive Reassignments**: When an officer is reassigned (due to shift changes, proximity, or escalations), the existing assignment row is updated to `status = REASSIGNED` with the timestamp and notes, and a new `ACTIVE` assignment row is created. Old assignment records are never overwritten or deleted.

---

### 2.5 AuditEvent (`audit_events`)

An append-only audit trail logging all lifecycle actions for compliance and accountability.

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Primary key UUID |
| `caseId` | `String?` | Foreign Key | Related case if applicable (`ON DELETE SET NULL`) |
| `actingUserId` | `String?` | Foreign Key | Acting user or system agent (`ON DELETE SET NULL`) |
| `eventType` | `AuditEventType`| | Action category |
| `details` | `Json?` | | Structured payload of context (JSONB) |
| `createdAt` | `DateTime` | `@default(now())` | Immutable event timestamp |

#### Event Types (`AuditEventType`):
`CASE_CREATED`, `CASE_ACKNOWLEDGED`, `CASE_ASSIGNED`, `CASE_REASSIGNED`, `CASE_STATUS_UPDATED`, `FIELD_REPORT_SUBMITTED`, `EVIDENCE_UPLOADED`, `NOTE_ADDED`, `USER_LOGIN`, `USER_LOGOUT`, `SYSTEM_EVENT`.

#### Key Design Decisions:
- **Security & Privacy Guardrails**: Runtime Zod validation explicitly rejects audit details containing sensitive keywords (such as `password`, `token`, `secret`, `authorization`).
- **Audit Immobility**: Audit records are insert-only; no update methods are exposed on the repository.

---

## 3. Relational Integrity & Deletion Policies

- `User` ──> `ClientCompany`: `ON DELETE RESTRICT` (Companies cannot be dropped while users belong to them).
- `Case` ──> `ClientCompany`: `ON DELETE RESTRICT` (Companies cannot be dropped while active cases exist).
- `Case` ──> `User (CreatedBy)`: `ON DELETE RESTRICT` (Creator history cannot be orphaned).
- `Assignment` ──> `Case`: `ON DELETE CASCADE` (Assignments are bound to the parent case lifecycle).
- `Assignment` ──> `User (FSO / Assigning)`: `ON DELETE RESTRICT` (Officers cannot be deleted while assigned to cases).
- `AuditEvent` ──> `Case / User`: `ON DELETE SET NULL` (Audit events remain intact even if referenced entities are purged).

---

## 4. Indexing Strategy

B-Tree indexes are applied on frequently filtered and joined columns:
- `client_companies(code)`, `client_companies(isActive)`
- `users(email)`, `users(role)`, `users(clientCompanyId)`, `users(isActive)`
- `cases(publicCaseId)`, `cases(clientCompanyId)`, `cases(createdById)`, `cases(status)`, `cases(city)`, `cases(issueType)`, `cases(trackingNumber)`, `cases(incidentDate)`
- `assignments(caseId)`, `assignments(assignedFsoId)`, `assignments(assigningUserId)`, `assignments(status)`
- `audit_events(caseId)`, `audit_events(actingUserId)`, `audit_events(eventType)`, `audit_events(createdAt)`

---

## 5. Extensibility Roadmap

The Phase 2.1 schema is intentionally designed to support future operational modules:
1. **Field Reports**: Will link directly to `caseId` and `assignmentId` with narrative, findings, and recovery status.
2. **Evidence & Attachments**: Photo evidence, voice notes, and FIR copies will attach to cases using pre-signed object storage keys.
3. **GPS Tracking**: Officer location breadcrumbs will reference `assignmentId` and `userId` with geo-coordinates.
4. **Report Publication**: Final client reports will reference `caseId` with sign-off signatures and PDF download links.
