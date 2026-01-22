# Admin Tickets (Helpdesk) System Tasks

**Goal:** Build a professional Helpdesk system for Super Admins to support Tenants, featuring threaded conversations, internal notes, assignment, file attachments, and comprehensive analytics.

**Status:** Ready for Implementation
**Created:** 2026-01-22
**Original File:**

- `src/routes/admin/tickets/+page.svelte`
- `src/routes/admin/tickets/[id]/+page.svelte`

---

## Current State Analysis

### Current Files:

| File | Purpose | Status |
|Data | Domain | Status |
| --- | --- | --- |
| `src/routes/admin/tickets/+page.svelte` | List view | ⚠️ Client-side filtering only |
| `src/routes/admin/tickets/[id]/+page.svelte` | Detail view | ⚠️ Basic chat UI, no internal notes |
| `src/lib/server/domain/tickets.ts` | Domain logic | ⚠️ Basic CRUD, missing advanced query |
| `src/lib/server/db/schema.ts` | Database Schema | ✅ Basic schema exists |

### Current Features:

- Basic listing of all tickets
- Detail view with conversation history
- Simple text reply functionality
- "Mark as Resolved" quick action
- Client-side search and filtering

### Issues Identified:

| Category        | Issue                                                            | Severity |
| --------------- | ---------------------------------------------------------------- | -------- |
| **Performance** | List view loads ALL tickets and filters client-side              | High     |
| **Features**    | No file attachment support (UI exists, logic missing)            | High     |
| **Features**    | No "Internal Note" functionality (Schema supports `is_internal`) | High     |
| **Features**    | No Ticket Assignment (Schema missing `assignedTo`)               | High     |
| **Features**    | No Rich Text Editor for replies                                  | Medium   |
| **Features**    | Statistics are mocked/calculated client-side                     | Medium   |
| **UX**          | No confirmation when resolving/closing                           | Low      |

---

## Task List

### Phase 1: Database & Infrastructure

#### Task 1.1: Update Database Schema

**File:** `src/lib/server/db/schema.ts`

**Changes:**

```typescript
// Add assignedTo field to tickets table
export const tickets = pgTable('tickets', {
	// ... existing fields
	assignedTo: uuid('assigned_to').references(() => users.id)
	// ... existing fields
});

// Add relations
export const ticketsRelations = relations(tickets, ({ one, many }) => ({
	// ... existing relations
	assignee: one(users, {
		fields: [tickets.assignedTo],
		references: [users.id]
	})
}));
```

**Priority:** High
**Effort:** 1 hour
**Dependencies:** None

---

#### Task 1.2: Enhance Domain Logic (Server-side Operations)

**File:** `src/lib/server/domain/tickets.ts`

**Features:**

- `getTickets` with server-side pagination, filtering, and sorting.
- `getTicketStats` for real database aggregation.
- `assignTicket` function.
- `addTicketMessage` with attachment support.

**Priority:** Critical
**Effort:** 4 hours
**Dependencies:** Task 1.1

---

### Phase 2: Components & UI Refactoring

#### Task 2.1: Create Reusable TicketList Component

**File:** `src/lib/components/admin/tickets/TicketList.svelte`

**Features:**

- Server-side pagination integration
- Server-side filtering (Status, Priority, Assignee)
- Search input with debounce
- Bulk actions (Assign, Close)

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 1.2

---

#### Task 2.2: Enhance TicketDetail Component

**File:** `src/lib/components/admin/tickets/TicketDetail.svelte`

**Features:**

- **Conversation Stream**: Distinct styles for Customer Reply vs Internal Note.
- **Reply Editor**:
  - Toggle: "Public Reply" vs "Internal Note"
  - File attachment handling
  - Quick responses (canned responses - optional)
- **Sidebar**:
  - Assignee selector (Searchable user list)
  - Status changer (Open, In Progress, Resolved, Closed)
  - Priority changer
  - Customer profile card

**Priority:** Critical
**Effort:** 6 hours
**Dependencies:** Task 1.2

---

#### Task 2.3: Ticket Analytics Dashboard

**File:** `src/lib/components/admin/tickets/TicketAnalytics.svelte`

**Features:**

- Cards: New Tickets (24h), Open, Resolved, Avg Response Time.
- Charts: Tickets by Priority, Tickets over time.

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 1.2

---

### Phase 3: Advanced Features

#### Task 3.1: File Attachment System

**Files:** `src/lib/server/storage.ts` (or similar), `ticket-domain`

**Features:**

- Upload files to R2/Storage.
- Secure link generation.
- Preview for images/PDFs in chat.

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

#### Task 3.2: Internal Notes System

**Files:** `TicketDetail.svelte`, `tickets.ts`

**Features:**

- UI toggle for Internal Note (Yellow background).
- Backend enforcement of `is_internal`.
- Visual distinction in thread.

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 2.2

---

### Phase 4: Integration

#### Task 4.1: Update Admin Tickets Page

**File:** `src/routes/admin/tickets/+page.svelte` & `+page.server.ts`

**Changes:**

- Replace current monolithic file with `TicketList` and `TicketAnalytics` components.
- Implement `load` function to fetch paginated data and stats.

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 2.1, 2.3

#### Task 4.2: Update Ticket Detail Page

**File:** `src/routes/admin/tickets/[id]/+page.svelte` & `+page.server.ts`

**Changes:**

- Replace content with `TicketDetail` component.
- Implement form actions for Reply, Note, Assign, Status Update.

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 2.2

---

## Implementation Order

| Order | Task                                       | Effort |
| ----- | ------------------------------------------ | ------ |
| 1     | Task 1.1: Database Schema                  | 1h     |
| 2     | Task 1.2: Domain Logic                     | 4h     |
| 3     | Task 2.1: TicketList Component             | 4h     |
| 4     | Task 4.1: Update List Page (Integration)   | 2h     |
| 5     | Task 2.2: TicketDetail Component           | 6h     |
| 6     | Task 3.2: Internal Notes                   | 2h     |
| 7     | Task 4.2: Update Detail Page (Integration) | 2h     |
| 8     | Task 2.3: Analytics                        | 3h     |
| 9     | Task 3.1: File Attachments                 | 4h     |

**Total Estimated Effort:** ~28 hours
