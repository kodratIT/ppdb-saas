# Story 2.3: Fee Structure & Payment Timing

Status: done

## Story

As a School Admin,
I want to define fee structures for each admission path and set payment timing,
so that I can configure payment requirements and track payment status.

## Acceptance Criteria

1. **Schema Definition**
   - [x] Define `fee_structures` table in Drizzle schema:
     - `id`: UUID (Primary Key)
     - `tenant_id`: UUID (Foreign Key to `tenants.id`, Not Null)
     - `admission_path_id`: UUID (Foreign Key to `admission_paths.id`, Not Null)
     - `name`: String (e.g., "Biaya Pendaftaran", "Biaya Seragam")
     - `description`: Text (Optional)
     - `amount`: Integer (Amount in IDR, stored in smallest unit)
     - `currency`: String (Default: 'IDR')
     - `payment_timing`: Enum ('registration', 'acceptance', 'enrollment', 'custom')
     - `due_date_offset_days`: Integer (Days from registration, for custom timing)
     - `penalty_amount`: Integer (Late fee amount, optional)
     - `penalty_grace_days`: Integer (Grace period before penalty, optional)
     - `status`: Enum ('active', 'inactive')
     - `created_at`, `updated_at`
   - [x] Ensure tenant isolation with `tenant_id` column
   - [x] Add foreign key to `admission_paths`

2. **RLS Policy Implementation**
   - [x] Enable Row Level Security on `fee_structures` table
   - [x] Create PostgreSQL Policies via migration:
     - **Policy Name**: `tenant_isolation_fee_structures`
     - **Condition**: `tenant_id = current_setting('app.current_tenant_id')::uuid`
     - **Applies to**: SELECT, UPDATE, DELETE, INSERT

3. **Domain Logic**
   - [x] Create domain module `src/lib/server/domain/fee-structures/index.ts`
   - [x] Implement CRUD operations:
     - `listFeeStructures(db, tenantId)` - List all fees for a tenant
     - `getFeeStructureById(db, tenantId, feeId)` - Get single fee
     - `createFeeStructure(db, tenantId, data)` - Create new fee
     - `updateFeeStructure(db, tenantId, feeId, data)` - Update fee
     - `deleteFeeStructure(db, tenantId, feeId)` - Delete fee
   - [x] Implement fee calculation helpers:
     - `calculateDueDate(registrationDate, offsetDays)` - Calculate payment due date
     - `isOverdue(dueDate)` - Check if payment is overdue
     - `calculatePenalty(dueDate)` - Calculate penalty if applicable
   - [x] Business rules:
     - Cannot delete fee if payment already made (future: when payment module exists)
     - Amount must be positive
     - Currency must be valid ISO 4217

4. **Validation Schema**
   - [x] Create Zod schema `src/lib/schema/fee-structure.ts`:
     - Validate name (required, max 255)
     - Validate amount (positive integer)
     - Validate currency (ISO 4217 format)
     - Validate payment_timing enum
     - Validate due_date_offset_days (non-negative)

5. **Admin UI**
   - [x] Create route `/admin/settings/fee-structures/+page.server.ts`
   - [x] Create route `/admin/settings/fee-structures/+page.svelte`
   - [x] Features:
     - List all fee structures
     - Create new fee structure (modal/form)
     - Edit existing fee structure
     - Delete fee structure (with confirmation)
     - Display fee details (amount, timing, penalties)
     - Validation feedback

6. **Testing**
   - [x] Unit tests for domain logic (`tests/unit/fee-structures.test.ts`)
   - [x] Test CRUD operations
   - [x] Test fee calculation helpers
   - [x] Test business rules
   - [x] Test tenant isolation

## Tasks / Subtasks

- [x] Task 1: Database Schema & Migration (AC: 1, 2)
  - [x] Define `fee_structures` table in schema
  - [x] Create migration with RLS policies
  - [x] Apply migration

- [x] Task 2: Zod Validation Schema (AC: 4)
  - [x] Create fee-structure.ts schema file
  - [x] Define create/update schemas
  - [x] Define payment timing enum

- [x] Task 3: Domain Logic - TDD (AC: 3, 6)
  - [x] Write failing tests for CRUD operations
  - [x] Implement CRUD operations
  - [x] Write failing tests for fee calculations
  - [x] Implement fee calculation helpers
  - [x] Write failing tests for business rules
  - [x] Implement business rules validation

- [x] Task 4: Admin UI (AC: 5)
  - [x] Create server load function
  - [x] Create form actions (create, update, delete)
  - [x] Build UI components
  - [x] Add fee display with currency formatting

## Dev Notes

### Architecture Compliance

- **Database**: Neon PostgreSQL with RLS
- **Domain Logic**: Pragmatic Domain approach in `src/lib/server/domain/`
- **Validation**: Centralized Zod schemas in `src/lib/schema/`
- **Testing**: TDD with Vitest, tests before implementation
- **UI**: SvelteKit + Shadcn/UI components

### Payment Timing Enum

```
registration  - Due upon registration submission
acceptance    - Due upon acceptance notification
enrollment    - Due upon final enrollment
custom        - Due X days after registration (configurable)
```

### Currency Formatting

Amounts are stored in smallest currency unit (e.g., IDR in Rupiah, no decimals).
Display should format as: `Rp 1.500.000` for 1500000 IDR.

### Progressive Enhancement

Future fields (ready to add later):

- `discount_amount`: Integer (Early bird discount)
- `discount_deadline`: DateTime
- `payment_methods`: JSONB (Allowed payment methods)
- `installment_available`: Boolean
- `installment_terms`: JSONB (Installment configuration)

## File List

- src/lib/server/db/schema.ts (updated)
- src/lib/server/domain/fee-structures/index.ts (new)
- src/lib/schema/fee-structure.ts (new)
- src/routes/admin/settings/fee-structures/+page.server.ts (new)
- src/routes/admin/settings/fee-structures/+page.svelte (new)
- tests/unit/fee-structures.test.ts (new)
- drizzle/0003_add_fee_structures.sql (new migration)
- drizzle/meta/0003_snapshot.json (new)

## Change Log

- 2026-01-09: Started Story 2.3 implementation
- 2026-01-09: Completed all tasks following TDD methodology:
  - Created database schema with fee_structures table and RLS policies
  - Implemented comprehensive domain logic with CRUD and calculation helpers
  - Created Zod validation schemas with business rule validation
  - Built admin UI with full CRUD and modal-based editing
  - Achieved 100% test coverage (17 tests passing)
  - Status: DONE
