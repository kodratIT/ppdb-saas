# SaaS Subscription System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement the backend foundation for a prepaid SaaS subscription system (packages, subscriptions, invoices).

**Architecture:** Use Drizzle ORM to define the schema in `public` namespace. Seed default packages. Create UI for Super Admin to manage packages.

**Tech Stack:** SvelteKit, Drizzle ORM, PostgreSQL.

---

### Task 1: Database Schema & Migration

**Files:**

- Modify: `src/lib/server/db/schema.ts`
- Run: `npx drizzle-kit generate` and `npx drizzle-kit migrate`

**Step 1: Define Enums and Tables**
Add `saasPackages`, `saasSubscriptions`, `saasInvoices` tables and related enums to `src/lib/server/db/schema.ts`.
Refer to the design doc for the exact schema definition.

**Step 2: Generate Migration**
Run `npx drizzle-kit generate` to create the SQL migration file.

**Step 3: Run Migration**
Run `npx drizzle-kit migrate` (or `npm run db:migrate` if alias exists) to apply changes.

**Step 4: Commit**

```bash
git add src/lib/server/db/schema.ts drizzle/
git commit -m "feat(saas): add subscription schema tables"
```

### Task 2: Seed Default Packages

**Files:**

- Create: `src/lib/server/db/seed-saas.ts`
- Modify: `package.json` (add script)

**Step 1: Create Seed Script**
Create a script to upsert default packages:

- **Free:** Rp 0, 100 students, standard features.
- **Basic:** Rp 500k/mo, 500 students, WA integration.
- **Pro:** Rp 1.5jt/mo, Unlimited students, All features.

**Step 2: Run Seed**
Execute the seed script using `tsx` or `node`.

**Step 3: Commit**

```bash
git add src/lib/server/db/seed-saas.ts
git commit -m "chore(saas): add seed script for default packages"
```

### Task 3: Super Admin - Packages UI (CRUD)

**Files:**

- Create: `src/routes/admin/subscription/packages/+page.svelte`
- Create: `src/routes/admin/subscription/packages/+page.server.ts`
- Modify: `src/routes/admin/+layout.svelte` (add menu item)

**Step 1: Backend (Load & Actions)**

- `load`: Fetch all packages from `saasPackages`.
- `actions`:
  - `create`: Insert new package.
  - `update`: Update existing package.
  - `toggleActive`: Enable/disable package.

**Step 2: Frontend (Table & Dialog)**

- Display table of packages (Name, Price, Status).
- "Add Package" button opens a Dialog/Modal with form.
- "Edit" button populates the form.

**Step 3: Add to Navigation**
Add "SaaS Packages" to the "System" group in `src/routes/admin/+layout.svelte` (Super Admin only).

**Step 4: Commit**

```bash
git add src/routes/admin/subscription/packages/
git commit -m "feat(admin): add package management UI"
```

### Task 4: Super Admin - Subscriptions List

**Files:**

- Create: `src/routes/admin/subscription/tenants/+page.svelte`
- Create: `src/routes/admin/subscription/tenants/+page.server.ts`

**Step 1: Backend (Load)**

- `load`: Fetch all tenants with their active subscription (left join).
- Return: Tenant Name, Package Name, Status, Expiry Date.

**Step 2: Frontend (Table)**

- Display list of tenants.
- Columns: Tenant, Package, Status (Badge), Valid Until.
- Action: "Manage" (Placeholder for Phase 2).

**Step 3: Add to Navigation**
Add "Subscriptions" to the "System" group in `src/routes/admin/+layout.svelte`.

**Step 4: Commit**

```bash
git add src/routes/admin/subscription/tenants/
git commit -m "feat(admin): add subscription list UI"
```
