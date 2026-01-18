# Tenant Creation with Default Unit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically create a default school unit when a new tenant is created.

**Architecture:** Extend the existing `createTenant` transaction in the admin domain to include a `units` table insertion. This ensures that every school (tenant) has at least one operational unit corresponding to its primary level.

**Tech Stack:** TypeScript, Drizzle ORM, PostgreSQL.

### Task 1: Update Imports in Admin Domain

**Files:**

- Modify: `src/lib/server/domain/admin/index.ts`

**Step 1: Add `units` to schema imports**

Update the import statement to include `units`.

**Step 2: Commit**

```bash
git add src/lib/server/domain/admin/index.ts
git commit -m "refactor: add units to schema imports in admin domain"
```

### Task 2: Update `createTenant` Logic

**Files:**

- Modify: `src/lib/server/domain/admin/index.ts`

**Step 1: Insert default unit after school profile creation**

Inside the `db.transaction`, insert a new record into `units`:

- `tenantId`: `newTenant.id`
- `name`: `data.name`
- `level`: `data.level` (cast to any or enum type, default to 'Lainnya' if undefined)
- `config`: `{}`

**Step 2: Update subsequent comment numbers**
Renumber "Create Audit Log" to step 4.

**Step 3: Commit**

```bash
git add src/lib/server/domain/admin/index.ts
git commit -m "feat: create default unit during tenant creation"
```

### Task 3: Verification

**Step 1: Run type check**
Run `npx tsc --noEmit` if possible, or manually verify the code.

**Step 2: Commit final changes**
If any fixes are needed.
