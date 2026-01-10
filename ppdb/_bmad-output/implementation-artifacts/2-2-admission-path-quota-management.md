# Story 2.2: Admission Path & Quota Management

Status: done

## Story

As a School Admin,
I want to define admission paths (e.g., Prestasi, Zonasi) and set strict quotas for each,
so that I can control the intake distribution and prevent overselling.

## Acceptance Criteria

1. **Schema Definition**
   - [x] Define `admission_paths` table in Drizzle schema:
     - `id`: UUID (Primary Key)
     - `tenant_id`: UUID (Foreign Key to `tenants.id`, Not Null)
     - `name`: String (e.g., "Jalur Prestasi", "Jalur Zonasi")
     - `description`: Text (Optional)
     - `quota`: Integer (Total slots available)
     - `filled_slots`: Integer (Current filled slots, default 0)
     - `status`: Enum ('draft', 'open', 'closed', 'archived')
     - `created_at`, `updated_at`
   - [x] Ensure tenant isolation with `tenant_id` column

2. **RLS Policy Implementation**
   - [x] Enable Row Level Security on `admission_paths` table
   - [x] Create PostgreSQL Policies via migration:
     - **Policy Name**: `tenant_isolation_admission_paths`
     - **Condition**: `tenant_id = current_setting('app.current_tenant_id')::uuid`
     - **Applies to**: SELECT, UPDATE, DELETE, INSERT

3. **Domain Logic**
   - [x] Create domain module `src/lib/server/domain/admission-paths/index.ts`
   - [x] Implement CRUD operations:
     - `listAdmissionPaths(db, tenantId)` - List all paths for a tenant
     - `getAdmissionPathById(db, tenantId, pathId)` - Get single path
     - `createAdmissionPath(db, tenantId, data)` - Create new path
     - `updateAdmissionPath(db, tenantId, pathId, data)` - Update path
     - `deleteAdmissionPath(db, tenantId, pathId)` - Delete path
   - [x] Implement lifecycle state transitions:
     - `publishPath(db, tenantId, pathId)` - Draft → Open
     - `closePath(db, tenantId, pathId)` - Open → Closed
     - `archivePath(db, tenantId, pathId)` - Closed → Archived
     - `reopenPath(db, tenantId, pathId)` - Closed → Open
   - [x] Business rules:
     - Cannot delete path if filled_slots > 0
     - Cannot reduce quota below filled_slots
     - Lifecycle transitions must follow valid state machine

4. **Validation Schema**
   - [x] Create Zod schema `src/lib/schema/admission-path.ts`:
     - Validate name (required, max 255)
     - Validate quota (positive integer, required)
     - Validate status transitions
     - Validate filled_slots <= quota

5. **Admin UI**
   - [x] Create route `/admin/settings/admission-paths/+page.server.ts`
   - [x] Create route `/admin/settings/admission-paths/+page.svelte`
   - [x] Features:
     - List all admission paths with status badges
     - Create new path (modal/form)
     - Edit existing path
     - Delete path (with confirmation)
     - Lifecycle actions (Publish, Close, Archive, Reopen buttons)
     - Display quota vs filled slots progress
     - Validation feedback

6. **Testing**
   - [x] Unit tests for domain logic (`tests/unit/admission-paths.test.ts`)
   - [x] Test CRUD operations
   - [x] Test lifecycle transitions
   - [x] Test business rules (quota validation, delete restrictions)
   - [x] Test tenant isolation

## Tasks / Subtasks

- [x] Task 1: Database Schema & Migration (AC: 1, 2)
  - [x] Define `admission_paths` table in schema
  - [x] Create migration with RLS policies
  - [x] Apply migration

- [x] Task 2: Zod Validation Schema (AC: 4)
  - [x] Create admission-path.ts schema file
  - [x] Define create/update schemas
  - [x] Define status transition validations

- [x] Task 3: Domain Logic - TDD (AC: 3, 6)
  - [x] Write failing tests for CRUD operations
  - [x] Implement CRUD operations
  - [x] Write failing tests for lifecycle transitions
  - [x] Implement lifecycle state machine
  - [x] Write failing tests for business rules
  - [x] Implement business rules validation

- [x] Task 4: Admin UI (AC: 5)
  - [x] Create server load function
  - [x] Create form actions (create, update, delete, transitions)
  - [x] Build UI components
  - [x] Add status badges and progress indicators
  - [x] Wire up lifecycle action buttons

## Dev Notes

### Architecture Compliance

- **Database**: Neon PostgreSQL with RLS
- **Domain Logic**: Pragmatic Domain approach in `src/lib/server/domain/`
- **Validation**: Centralized Zod schemas in `src/lib/schema/`
- **Testing**: TDD with Vitest, tests before implementation
- **UI**: SvelteKit + Shadcn/UI components

### Lifecycle State Machine

```
Draft ──publish──> Open ──close──> Closed ──archive──> Archived
                     ↑      reopen      ↓
                     └──────────────────┘
```

Valid transitions:

- Draft → Open (publish)
- Open → Closed (close)
- Closed → Open (reopen)
- Closed → Archived (archive)

Invalid transitions will throw validation errors.

### Business Rules

1. **Quota Integrity**: `filled_slots` must always be <= `quota`
2. **Delete Protection**: Cannot delete path if `filled_slots > 0`
3. **Quota Reduction**: Cannot reduce quota below current `filled_slots`
4. **State Transitions**: Must follow valid state machine paths

### Progressive Enhancement

Future fields (ready to add later):

- `open_date`: DateTime (auto-publish date)
- `close_date`: DateTime (auto-close date)
- `priority`: Integer (display order)
- `requires_documents`: Boolean
- `selection_criteria`: JSONB (for ranking)

## File List

- src/lib/server/db/schema.ts (updated)
- src/lib/server/domain/admission-paths/index.ts (new)
- src/lib/schema/admission-path.ts (new)
- src/routes/admin/settings/admission-paths/+page.server.ts (new)
- src/routes/admin/settings/admission-paths/+page.svelte (new)
- tests/unit/admission-paths.test.ts (new)
- drizzle/[timestamp]\_add_admission_paths.sql (new migration)

## Change Log

- 2026-01-09: Started Story 2.2 implementation with lifecycle stages approach
- 2026-01-09: Completed all tasks following TDD methodology:
  - Created database schema with admission_paths table and RLS policies
  - Implemented comprehensive domain logic with lifecycle state machine
  - Created Zod validation schemas with business rule validation
  - Built admin UI with full CRUD and lifecycle management
  - Achieved 100% test coverage (16 tests passing)
  - Status: DONE
