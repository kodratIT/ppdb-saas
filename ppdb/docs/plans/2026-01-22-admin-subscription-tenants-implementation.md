# Admin Subscription Tenants Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Incremental rebuild of admin subscription tenants management with consistent patterns, clear validation, and proper error handling.

**Architecture:** Preserve existing SvelteKit route structure and domain services. Re-implement list and detail pages to ensure consistency. Actions: updateSubscription, cancelSubscription, extendTrial.

**Tech Stack:** SvelteKit, Drizzle ORM, Lucide icons, shadcn-svelte components.

---

## Tasks

### Task 1: Review and validate current implementation

**Files:**

- Modify: `src/routes/admin/subscription/tenants/+page.svelte:1-439`
- Modify: `src/routes/admin/subscription/tenants/+page.server.ts:1-103`
- Modify: `src/routes/admin/subscription/tenants/[tenantId]/+page.svelte:1-406`
- Modify: `src/routes/admin/subscription/tenants/[tenantId]/+page.server.ts:1-96`
- Modify: `src/lib/server/domain/admin/tenants.ts:1-141`

**Step 1: Read all files and identify inconsistencies**

```bash
cd .worktrees/admin-subscription-tenants
cat src/routes/admin/subscription/tenants/+page.svelte | head -100
cat src/routes/admin/subscription/tenants/+page.server.ts
cat src/routes/admin/subscription/tenants/[tenantId]/+page.svelte | head -100
cat src/routes/admin/subscription/tenants/[tenantId]/+page.server.ts
cat src/lib/server/domain/admin/tenants.ts
```

**Step 2: Create checklist of inconsistencies**

Document:

- Missing or inconsistent validation between list/detail pages
- Different error handling patterns
- Missing i18n keys
- UI patterns that deviate from admin conventions

**Step 3: Commit findings**

```bash
git add -A && git commit -m "chore: review current subscription tenants implementation"
```

---

### Task 2: Fix domain layer validation

**Files:**

- Modify: `src/lib/server/domain/admin/tenants.ts`

**Step 1: Add input validation**

Ensure `cancelSubscription` and `extendTrial` have proper input validation and throw descriptive errors.

```typescript
export async function cancelSubscription(tenantId: string) {
	if (!tenantId || typeof tenantId !== 'string') {
		throw new Error('Invalid tenantId');
	}
	// ... existing code
}

export async function extendTrial(tenantId: string, days: number) {
	if (!tenantId || typeof tenantId !== 'string') {
		throw new Error('Invalid tenantId');
	}
	if (![7, 14, 30].includes(days)) {
		throw new Error('Days must be 7, 14, or 30');
	}
	// ... existing code
}
```

**Step 2: Add subscription existence check**

Before extending trial, verify subscription exists.

```typescript
export async function extendTrial(tenantId: string, days: number) {
	const currentSub = await db.query.saasSubscriptions.findFirst({
		where: eq(saasSubscriptions.tenantId, tenantId)
	});
	if (!currentSub) {
		throw new Error('Subscription not found');
	}
	// ... rest
}
```

**Step 3: Test the changes**

```bash
cd .worktrees/admin-subscription-tenants
npm run check 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/lib/server/domain/admin/tenants.ts && git commit -m "fix: add validation to domain functions"
```

---

### Task 3: Fix list page server actions

**Files:**

- Modify: `src/routes/admin/subscription/tenants/+page.server.ts`

**Step 1: Standardize error handling**

Use consistent error messages and logging.

```typescript
export const actions: Actions = {
	updateSubscription: async ({ request }) => {
		// ... existing code
		try {
			// ... existing code
		} catch (error) {
			console.error('Failed to update subscription:', error);
			return fail(500, { message: 'admin.tenants.subUpdateFailed' });
		}
	},
	cancelSubscription: async ({ request }) => {
		try {
			await cancelSubscription(tenantId);
			return { success: true };
		} catch (error) {
			console.error('Failed to cancel subscription:', error);
			return fail(500, { message: 'admin.tenants.actionFailed' });
		}
	},
	extendTrial: async ({ request }) => {
		try {
			await extendTrial(tenantId, days);
			return { success: true };
		} catch (error) {
			console.error('Failed to extend trial:', error);
			return fail(500, { message: 'admin.tenants.actionFailed' });
		}
	}
};
```

**Step 2: Add proper form validation**

Add zod or manual validation for required fields.

**Step 3: Run check**

```bash
cd .worktrees/admin-subscription-tenants
npm run check 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/routes/admin/subscription/tenants/+page.server.ts && git commit -m "fix: standardize server actions error handling"
```

---

### Task 4: Fix list page UI

**Files:**

- Modify: `src/routes/admin/subscription/tenants/+page.svelte`

**Step 1: Review UI patterns**

Check against existing admin patterns:

- Use of Dialog, Select, Table components
- Form handling with use:enhance
- Toast notifications

**Step 2: Fix any inconsistencies**

- Ensure proper i18n key usage
- Fix date formatting
- Ensure loading states work correctly
- Fix select element accessibility

**Step 3: Run check**

```bash
cd .worktrees/admin-subscription-tenants
npm run check 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/routes/admin/subscription/tenants/+page.svelte && git commit -m "fix: align list page UI with admin patterns"
```

---

### Task 5: Fix detail page server actions

**Files:**

- Modify: `src/routes/admin/subscription/tenants/[tenantId]/+page.server.ts`

**Step 1: Add tenantId validation from params**

```typescript
cancelSubscription: async ({ params }) => {
	const tenantId = params.tenantId;
	if (!tenantId) return fail(400, { missing: true });
	// ... rest
};
```

**Step 2: Standardize error messages**

Use same error keys as list page.

**Step 3: Run check**

```bash
cd .worktrees/admin-subscription-tenants
npm run check 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/routes/admin/subscription/tenants/[tenantId]/+page.server.ts && git commit -m "fix: standardize detail page server actions"
```

---

### Task 6: Fix detail page UI

**Files:**

- Modify: `src/routes/admin/subscription/tenants/[tenantId]/+page.svelte`

**Step 1: Review UI patterns**

Check:

- Conditional button visibility (Extend Trial only for trial status)
- Dialogs for each action
- Loading states
- Toast feedback

**Step 2: Fix any inconsistencies**

- Ensure Extend Trial button only shows for trial tenants
- Ensure Cancel button doesn't show for cancelled tenants
- Fix date input formatting
- Ensure proper i18n usage

**Step 3: Run check**

```bash
cd .worktrees/admin-subscription-tenants
npm run check 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/routes/admin/subscription/tenants/[tenantId]/+page.svelte && git commit -m "fix: align detail page UI with admin patterns"
```

---

### Task 7: Verify all changes

**Step 1: Run full check**

```bash
cd .worktrees/admin-subscription-tenants
npm run check 2>&1
```

**Step 2: Check for TypeScript errors**

```bash
npx tsc --noEmit 2>&1 | head -50
```

**Step 3: Review git log**

```bash
git log --oneline -10
```

**Step 4: Create summary commit**

```bash
git add -A && git commit -m "chore: summarize subscription tenants rebuild - consistency fixes"
```

---

### Task 8: Prepare for merge

**Step 1: Run final verification**

```bash
cd .worktrees/admin-subscription-tenants
npm run check 2>&1 | tail -10
```

**Step 2: Review changes**

```bash
git diff main --stat
```

**Step 3: Ready for finishing-a-development-branch skill**
