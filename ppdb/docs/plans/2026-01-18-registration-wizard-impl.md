# "Party Mode" Registration Wizard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Transform the school registration into a delightful 4-step wizard with location API integration and atomic backend transactions.

**Architecture:** Client-side Svelte 5 state machine wizard -> Atomic Transaction (Tenant + Profile + User).

**Tech Stack:** Svelte 5 (`$state`), shadcn/ui, Zod, Drizzle ORM (Transactions).

### Task 1: UI Components Setup

**Files:**

- Create: `src/lib/components/ui/stepper/Stepper.svelte` (Custom simple stepper)
- Create: `src/lib/components/ui/stepper/index.ts`
- Create: `src/lib/components/ui/confetti/Confetti.svelte` (Wrapper for canvas-confetti)

**Step 1: Create Stepper Component**
Build a simple horizontal stepper to visualize progress (1-4).

**Step 2: Create Confetti Component**
Wrapper around `canvas-confetti` that fires `confetti()` on mount.

**Step 3: Commit**

```bash
git add src/lib/components/ui/stepper src/lib/components/ui/confetti
git commit -m "feat(ui): add stepper and confetti components"
```

### Task 2: Wizard Logic & Zod Schemas

**Files:**

- Create: `src/routes/admin/register/schema.ts` (Zod schemas for all steps)
- Modify: `src/routes/admin/register/+page.svelte` (Main wizard container)

**Step 1: Define Schemas**
Define Zod schemas for:

- `identitySchema`: name, npsn, slug, level, status
- `locationSchema`: province, city, district, village, address, postalCode
- `adminSchema`: adminName, email, password, whatsapp

**Step 2: Scaffold Wizard Layout**
Replace existing `+page.svelte` content with:

- State management (`currentStep`, `formData`)
- Step conditional rendering
- "Next" / "Back" navigation logic

**Step 3: Commit**

```bash
git add src/routes/admin/register/schema.ts src/routes/admin/register/+page.svelte
git commit -m "feat(register): scaffold wizard layout and schemas"
```

### Task 3: Step 1 - Identity 🏫

**Files:**

- Create: `src/routes/admin/register/steps/StepIdentity.svelte`

**Step 1: Implement Identity Form**

- School Name (Auto-generates slug)
- NPSN input
- Level (Select: SD/SMP/SMA/SMK)
- Status (Radio: Negeri/Swasta)

**Step 2: Slug Logic**

- Auto-slugify name
- Debounced availability check (mock for now or hook up to existing check if available)

**Step 3: Commit**

```bash
git add src/routes/admin/register/steps/StepIdentity.svelte
git commit -m "feat(register): implement identity step"
```

### Task 4: Step 2 - Location 📍 (API Integration)

**Files:**

- Create: `src/routes/admin/register/steps/StepLocation.svelte`
- Create: `src/lib/utils/location-api.ts` (Helper to fetch from emsifa)

**Step 1: Create API Helper**
`fetchProvinces()`, `fetchCities(provinceId)`, etc. using `https://emsifa.github.io/api-wilayah-indonesia/api`

**Step 2: Implement Location Form**

- Chained Selects (Province -> City -> District -> Village)
- Load data on mount / on change
- Address & Postal Code text areas

**Step 3: Commit**

```bash
git add src/routes/admin/register/steps/StepLocation.svelte src/lib/utils/location-api.ts
git commit -m "feat(register): implement location step with API integration"
```

### Task 5: Step 3 & 4 - Admin & Review

**Files:**

- Create: `src/routes/admin/register/steps/StepAdmin.svelte`
- Create: `src/routes/admin/register/steps/StepReview.svelte`

**Step 1: Admin Form**

- Admin Full Name (Separate from school name)
- Email, Password, WhatsApp

**Step 2: Review Screen**

- Read-only summary of all data
- "Create School" button (Submits the form)

**Step 3: Commit**

```bash
git add src/routes/admin/register/steps/StepAdmin.svelte src/routes/admin/register/steps/StepReview.svelte
git commit -m "feat(register): implement admin and review steps"
```

### Task 6: Backend Transaction Refactor

**Files:**

- Modify: `src/lib/server/domain/admin/index.ts` (Update `createTenant` to be transactional)
- Modify: `src/routes/admin/register/+page.server.ts` (Handle new fields)

**Step 1: Update Domain Logic**
Refactor `createTenant` to accept full profile data.
Use `db.transaction`:

1. Insert `tenants`
2. Insert `schoolProfiles` (with location data)
3. Return tenant ID

**Step 2: Update Server Action**

- Parse all new fields from FormData
- Call updated `createTenant`
- Create Firebase User
- Create DB User (Admin)

**Step 3: Commit**

```bash
git add src/lib/server/domain/admin/index.ts src/routes/admin/register/+page.server.ts
git commit -m "refactor(register): implement atomic tenant creation transaction"
```

### Task 7: Integration & Polish

**Files:**

- Modify: `src/routes/admin/register/+page.svelte`

**Step 1: Connect Success State**

- Show `Confetti` on form success
- Redirect after 3 seconds

**Step 2: Verify Flow**

- Manual test of full flow

**Step 3: Commit**

```bash
git commit -am "feat(register): finalize party mode wizard"
```
