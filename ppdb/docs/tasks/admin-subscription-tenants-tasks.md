# Admin Tenants Subscription Management Tasks

**Goal:** Refine and expand the Tenant Subscription Management system. Enable comprehensive management of tenant subscriptions including manual overrides, history tracking, plan changes, and cancellation workflows.

**Status:** Ready for Implementation
**Created:** 2026-01-22
**Original File:**

- `src/routes/admin/subscription/tenants/+page.svelte`
- `src/routes/admin/subscription/tenants/+page.server.ts`

---

## Current State Analysis

### Current Features:

- List all tenants with their subscription status and package.
- "Manage Subscription" dialog (Upsert logic).
- Basic status badges (Active, Trial, Past Due, Cancelled).
- Usage bar for student limits.

### Issues Identified:

- **No History**: Cannot see past subscription changes or invoices for a specific tenant from this view.
- **Limited Actions**: No explicit "Cancel Subscription" or "Extend Trial" actions (only generic update).
- **No Search/Filter**: List lists all tenants without pagination or search.
- **Validation**: Minimal validation on date inputs.

---

## Task List

### Phase 1: Enhanced List & Filtering

#### Task 1.1: Add Server-Side Pagination and Filtering

**File:** `src/routes/admin/subscription/tenants/+page.server.ts`

**Status:** ✅ Completed (Backend logic implemented)

**Features:**

- Implement pagination (limit/offset).
- Add search by tenant name/slug.
- Add filter by status (Active, Trial, etc.).
- Add filter by package.

#### Task 1.2: Update UI for Filtering

**File:** `src/routes/admin/subscription/tenants/+page.svelte`

**Status:** ✅ Completed

**Features:**

- Add Search bar.
- Add Status dropdown filter.
- Add Pagination controls.

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 1.1

---

### Phase 2: Advanced Management Actions

#### Task 2.1: Add "Cancel Subscription" Action

**File:** `src/routes/admin/subscription/tenants/+page.server.ts`

**Status:** ✅ Completed (Backend logic implemented)

**Features:**

- Specific action to set status to `cancelled` and `autoRenew` to `false`.
- UI: Confirmation dialog with reason input (optional).

#### Task 2.2: Add "Extend Trial" Action

**File:** `src/routes/admin/subscription/tenants/+page.server.ts`

**Status:** ✅ Completed (Backend logic implemented)

**Features:**

- Helper action to add X days to `currentPeriodEnd` for trial accounts.
- UI: Simple dialog to select extension duration (7, 14, 30 days).

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** None

---

### Phase 3: Tenant Subscription Detail View (New Page)

#### Task 3.1: Create Tenant Detail Route

**File:** `src/routes/admin/subscription/tenants/[tenantId]/+page.svelte`

**Status:** ✅ Completed

**Features:**

- Deep dive into a specific tenant's subscription.
- Show Subscription Details (Plan, Cycle, Dates).
- Show Invoice History (Table of past invoices).
- Show Usage Stats (Students, Storage, etc.).
- Action buttons (Change Plan, Cancel, etc.).

**Priority:** High
**Effort:** 5 hours
**Dependencies:** None

---

## Implementation Order (Remaining)

| Order | Task                                | Effort |
| ----- | ----------------------------------- | ------ |
| 1     | Task 1.2: Filter UI                 | 2h     |
| 2     | Task 3.1: Tenant Detail View        | 5h     |
| 3     | Connect Cancel/Extend Actions to UI | 1h     |

**Total Estimated Effort:** ~8 hours
