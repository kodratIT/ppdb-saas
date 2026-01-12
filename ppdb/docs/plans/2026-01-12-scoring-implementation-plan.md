# Scoring & Interview Input Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable interviewers to input scores (0-100) and notes for verified candidates, with finalization locking and admin override capability.

**Architecture:** TDD approach with database-first design. Create `application_scores` table with UNIQUE constraint, build REST API endpoints for CRUD operations, then implement dedicated scoring dashboard UI separated from verification flow.

**Tech Stack:** SvelteKit, Drizzle ORM, PostgreSQL, Zod validation, shadcn/ui components

---

## Implementation Phases

**Phase 1:** Database Schema & Migrations (Tasks 1-2)  
**Phase 2:** API Endpoints & Business Logic (Tasks 3-7)  
**Phase 3:** UI Components & Routes (Tasks 8-12)  
**Phase 4:** Integration & Testing (Tasks 13-14)

---

## Task 1: Add application_scores Schema

**Files:**

- Modify: `src/lib/server/db/schema.ts` (append at end, before export relations)
- Create: Test validation in next task

**Step 1: Add enums and table definition**

Add to `src/lib/server/db/schema.ts` after `documentReviews` table (around line 440):

```typescript
// Epic 4.2: Scoring & Interview Input
export const applicationScores = pgTable(
	'application_scores',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		applicationId: uuid('application_id')
			.references(() => applications.id, { onDelete: 'cascade' })
			.notNull(),
		tenantId: uuid('tenant_id')
			.references(() => tenants.id)
			.notNull(),
		scorerId: uuid('scorer_id')
			.references(() => users.id)
			.notNull(),

		// Score data
		score: integer('score').notNull(), // 0-100, validated in application logic
		notes: text('notes'), // Qualitative feedback

		// Finalization tracking
		isFinalized: boolean('is_finalized').default(false).notNull(),
		finalizedAt: timestamp('finalized_at'),

		// Admin override tracking
		unlockedBy: uuid('unlocked_by').references(() => users.id),
		unlockedAt: timestamp('unlocked_at'),
		unlockReason: text('unlock_reason'),

		// Timestamps
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		// Unique constraint: one score per application
		uniqApplicationTenant: unique().on(table.applicationId, table.tenantId)
	})
);

export const applicationScoresRelations = relations(applicationScores, ({ one }) => ({
	application: one(applications, {
		fields: [applicationScores.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [applicationScores.tenantId],
		references: [tenants.id]
	}),
	scorer: one(users, {
		fields: [applicationScores.scorerId],
		references: [users.id]
	}),
	unlocker: one(users, {
		fields: [applicationScores.unlockedBy],
		references: [users.id]
	})
}));
```

**Step 2: Verify no TypeScript errors**

Run: `npm run check`  
Expected: No errors in schema.ts

**Step 3: Commit schema**

```bash
git add src/lib/server/db/schema.ts
git commit -m "feat(epic-4.2): add application_scores schema table

- Add applicationScores table with score (0-100) and notes
- Finalization tracking (isFinalized, finalizedAt)
- Admin override tracking (unlockedBy, unlockReason)
- UNIQUE constraint: one score per application
- Relations to applications, tenants, users

Task: 4.2.1 - Database schema
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 2: Add interviewer Role to Permissions

**Files:**

- Modify: `src/lib/server/auth/permissions.ts`
- Modify: `src/lib/server/db/schema.ts` (userRoleEnum)

**Step 1: Update userRoleEnum in schema**

In `src/lib/server/db/schema.ts`, find `userRoleEnum` (around line 39) and update:

```typescript
export const userRoleEnum = pgEnum('user_role', [
	'super_admin',
	'school_admin',
	'verifier',
	'treasurer',
	'interviewer', // NEW: Epic 4.2
	'parent'
]);
```

**Step 2: Add interviewer permissions**

In `src/lib/server/auth/permissions.ts`, add to the role definitions:

```typescript
const rolePermissions: Record<Role, Permission[]> = {
	super_admin: [
		// ... existing permissions
	],
	school_admin: [
		// ... existing permissions
		'score:unlock' // NEW: Can unlock finalized scores
	],
	verifier: [
		// ... existing permissions (no scoring)
	],
	treasurer: [
		// ... existing permissions
	],
	interviewer: [
		// NEW ROLE
		'score:create',
		'score:read',
		'score:update',
		'score:finalize'
	],
	parent: [
		// ... existing permissions
	]
};
```

**Step 3: Run type check**

Run: `npm run check`  
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/server/auth/permissions.ts src/lib/server/db/schema.ts
git commit -m "feat(epic-4.2): add interviewer role with scoring permissions

- Add 'interviewer' to userRoleEnum
- Grant permissions: score:create, read, update, finalize
- Grant school_admin: score:unlock permission
- Separation of duties: verifier ≠ interviewer

Task: 4.2.2 - RBAC configuration
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 3: Create Score Validation Schema (Zod)

**Files:**

- Create: `src/lib/schemas/score.ts`
- Test: Will test in API endpoint

**Step 1: Create Zod validation schema**

Create `src/lib/schemas/score.ts`:

```typescript
import { z } from 'zod';

export const scoreInputSchema = z.object({
	score: z
		.number()
		.int('Score must be an integer')
		.min(0, 'Score must be at least 0')
		.max(100, 'Score must be at most 100'),
	notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional().nullable(),
	finalize: z.boolean().optional().default(false)
});

export const unlockScoreSchema = z.object({
	reason: z
		.string()
		.min(10, 'Unlock reason must be at least 10 characters')
		.max(500, 'Unlock reason must be 500 characters or less')
});

export type ScoreInput = z.infer<typeof scoreInputSchema>;
export type UnlockScoreInput = z.infer<typeof unlockScoreSchema>;
```

**Step 2: Verify no errors**

Run: `npm run check`  
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/schemas/score.ts
git commit -m "feat(epic-4.2): add Zod validation schemas for scoring

- scoreInputSchema: validate score (0-100), notes, finalize flag
- unlockScoreSchema: validate unlock reason (10-500 chars)
- Type exports for TypeScript safety

Task: 4.2.3 - Validation schemas
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 4: Create Score API - Create/Update Endpoint

**Files:**

- Create: `src/routes/api/admin/scores/[applicationId]/+server.ts`
- Test: Manual test with curl/Postman after creation

**Step 1: Create API endpoint directory**

```bash
mkdir -p src/routes/api/admin/scores/[applicationId]
```

**Step 2: Write POST handler (create/update score)**

Create `src/routes/api/admin/scores/[applicationId]/+server.ts`:

```typescript
import { json, error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationScores, auditLogs } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { scoreInputSchema } from '$lib/schemas/score';

export async function POST({ request, locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	const applicationId = (params as any).applicationId as string;
	if (!applicationId) {
		throw svelteError(400, 'Application ID required');
	}

	// Parse and validate input
	const body = await request.json();
	const validationResult = scoreInputSchema.safeParse(body);

	if (!validationResult.success) {
		throw svelteError(400, validationResult.error.errors[0].message);
	}

	const { score, notes, finalize } = validationResult.data;

	// Verify application exists and is verified
	const application = await db.query.applications.findFirst({
		where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId))
	});

	if (!application) {
		throw svelteError(404, 'Application not found');
	}

	if (application.status !== 'verified') {
		throw svelteError(400, 'Application must be verified before scoring');
	}

	// Check for existing score
	const existingScore = await db.query.applicationScores.findFirst({
		where: and(
			eq(applicationScores.applicationId, applicationId),
			eq(applicationScores.tenantId, auth.tenantId)
		)
	});

	// If exists and finalized, cannot edit
	if (existingScore?.isFinalized) {
		throw svelteError(403, 'Score is finalized. Contact admin to unlock.');
	}

	try {
		let savedScore;

		if (existingScore) {
			// Update existing score
			const [updated] = await db
				.update(applicationScores)
				.set({
					score,
					notes: notes || null,
					isFinalized: finalize || existingScore.isFinalized,
					finalizedAt: finalize ? new Date() : existingScore.finalizedAt,
					updatedAt: new Date()
				})
				.where(eq(applicationScores.id, existingScore.id))
				.returning();

			savedScore = updated;
		} else {
			// Create new score
			const [created] = await db
				.insert(applicationScores)
				.values({
					applicationId,
					tenantId: auth.tenantId,
					scorerId: auth.userId,
					score,
					notes: notes || null,
					isFinalized: finalize || false,
					finalizedAt: finalize ? new Date() : null
				})
				.returning();

			savedScore = created;
		}

		// Create audit log if finalized
		if (finalize && !existingScore?.isFinalized) {
			await db.insert(auditLogs).values({
				actorId: auth.userId,
				action: 'finalize',
				target: `score:${savedScore.id}`,
				details: JSON.stringify({
					tenantId: auth.tenantId,
					applicationId,
					score,
					action: 'finalize_score'
				})
			});
		}

		return json({
			success: true,
			message: finalize ? 'Score finalized successfully' : 'Score saved as draft',
			score: savedScore
		});
	} catch (error) {
		console.error('Score creation error:', error);
		throw svelteError(500, 'Failed to save score');
	}
}
```

**Step 3: Verify no errors**

Run: `npm run check`  
Expected: No errors

**Step 4: Commit**

```bash
git add src/routes/api/admin/scores/
git commit -m "feat(epic-4.2): add POST /api/admin/scores/[applicationId] endpoint

- Create or update score for verified applications
- Validation: score 0-100, application must be verified
- Cannot edit finalized scores (403 error)
- Audit log entry on finalization
- RBAC: interviewer or school_admin only

Task: 4.2.4 - Create/update score API
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 5: Create Score API - Finalize Endpoint

**Files:**

- Create: `src/routes/api/admin/scores/[applicationId]/finalize/+server.ts`

**Step 1: Create finalize endpoint**

Create `src/routes/api/admin/scores/[applicationId]/finalize/+server.ts`:

```typescript
import { json, error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applicationScores, auditLogs } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function POST({ locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	const applicationId = (params as any).applicationId as string;

	// Find score
	const score = await db.query.applicationScores.findFirst({
		where: and(
			eq(applicationScores.applicationId, applicationId),
			eq(applicationScores.tenantId, auth.tenantId)
		)
	});

	if (!score) {
		throw svelteError(404, 'Score not found');
	}

	if (score.isFinalized) {
		throw svelteError(400, 'Score is already finalized');
	}

	// Finalize score
	const [finalized] = await db
		.update(applicationScores)
		.set({
			isFinalized: true,
			finalizedAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(applicationScores.id, score.id))
		.returning();

	// Audit log
	await db.insert(auditLogs).values({
		actorId: auth.userId,
		action: 'finalize',
		target: `score:${score.id}`,
		details: JSON.stringify({
			tenantId: auth.tenantId,
			applicationId,
			score: score.score,
			action: 'finalize_score'
		})
	});

	return json({
		success: true,
		message: 'Score finalized successfully',
		score: finalized
	});
}
```

**Step 2: Commit**

```bash
git add src/routes/api/admin/scores/[applicationId]/finalize/
git commit -m "feat(epic-4.2): add POST finalize endpoint for scores

- Endpoint: /api/admin/scores/[applicationId]/finalize
- Sets isFinalized=true, records finalizedAt timestamp
- Creates audit log entry
- Returns 400 if already finalized

Task: 4.2.5 - Finalize score API
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 6: Create Score API - Unlock Endpoint (Admin Only)

**Files:**

- Create: `src/routes/api/admin/scores/[scoreId]/unlock/+server.ts`

**Step 1: Create unlock endpoint**

Create `src/routes/api/admin/scores/[scoreId]/unlock/+server.ts`:

```typescript
import { json, error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applicationScores, auditLogs } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { unlockScoreSchema } from '$lib/schemas/score';

export async function POST({ request, locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'school_admin'); // Admin only

	const scoreId = (params as any).scoreId as string;
	const body = await request.json();

	// Validate reason
	const validationResult = unlockScoreSchema.safeParse(body);
	if (!validationResult.success) {
		throw svelteError(400, validationResult.error.errors[0].message);
	}

	const { reason } = validationResult.data;

	// Find score
	const score = await db.query.applicationScores.findFirst({
		where: and(eq(applicationScores.id, scoreId), eq(applicationScores.tenantId, auth.tenantId))
	});

	if (!score) {
		throw svelteError(404, 'Score not found');
	}

	if (!score.isFinalized) {
		throw svelteError(400, 'Score is not finalized');
	}

	// Unlock score
	const [unlocked] = await db
		.update(applicationScores)
		.set({
			isFinalized: false,
			finalizedAt: null,
			unlockedBy: auth.userId,
			unlockedAt: new Date(),
			unlockReason: reason,
			updatedAt: new Date()
		})
		.where(eq(applicationScores.id, scoreId))
		.returning();

	// Audit log
	await db.insert(auditLogs).values({
		actorId: auth.userId,
		action: 'unlock',
		target: `score:${scoreId}`,
		details: JSON.stringify({
			tenantId: auth.tenantId,
			applicationId: score.applicationId,
			reason,
			action: 'unlock_score'
		})
	});

	return json({
		success: true,
		message: 'Score unlocked successfully',
		score: unlocked
	});
}
```

**Step 2: Commit**

```bash
git add src/routes/api/admin/scores/[scoreId]/unlock/
git commit -m "feat(epic-4.2): add POST unlock endpoint for finalized scores

- Endpoint: /api/admin/scores/[scoreId]/unlock
- Admin-only: requires school_admin role
- Validates unlock reason (10-500 chars)
- Records unlockedBy, unlockedAt, unlockReason
- Creates audit log entry

Task: 4.2.6 - Unlock score API (admin override)
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 7: Add GET Endpoint to Load Score

**Files:**

- Modify: `src/routes/api/admin/scores/[applicationId]/+server.ts` (add GET handler)

**Step 1: Add GET handler to existing file**

In `src/routes/api/admin/scores/[applicationId]/+server.ts`, add before POST:

```typescript
export async function GET({ locals, params }: RequestEvent) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	const applicationId = (params as any).applicationId as string;

	const score = await db.query.applicationScores.findFirst({
		where: and(
			eq(applicationScores.applicationId, applicationId),
			eq(applicationScores.tenantId, auth.tenantId)
		),
		with: {
			scorer: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			},
			unlocker: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});

	if (!score) {
		return json({ score: null });
	}

	return json({ score });
}
```

**Step 2: Commit**

```bash
git add src/routes/api/admin/scores/[applicationId]/+server.ts
git commit -m "feat(epic-4.2): add GET endpoint to load existing score

- Endpoint: GET /api/admin/scores/[applicationId]
- Returns score with scorer and unlocker user data
- Returns null if score doesn't exist
- RBAC: interviewer or school_admin

Task: 4.2.7 - Get score API
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 8: Create ScoreInput Component

**Files:**

- Create: `src/lib/components/scoring/ScoreInput.svelte`

**Step 1: Create component**

```bash
mkdir -p src/lib/components/scoring
```

Create `src/lib/components/scoring/ScoreInput.svelte`:

```svelte
<script lang="ts">
	interface Props {
		value: number;
		disabled?: boolean;
		onchange: (value: number) => void;
	}

	let { value = $bindable(0), disabled = false, onchange }: Props = $props();

	const scoreColor = $derived(() => {
		if (value >= 80) return 'text-green-600 border-green-500';
		if (value >= 60) return 'text-yellow-600 border-yellow-500';
		return 'text-red-600 border-red-500';
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const newValue = parseInt(target.value) || 0;
		const clamped = Math.max(0, Math.min(100, newValue));
		value = clamped;
		onchange(clamped);
	}
</script>

<div class="score-input">
	<label for="score" class="block text-sm font-medium text-gray-700 mb-2">
		Score (0-100) <span class="text-red-500">*</span>
	</label>
	<div class="relative">
		<input
			type="number"
			id="score"
			min="0"
			max="100"
			{value}
			{disabled}
			oninput={handleInput}
			class="w-full px-4 py-3 text-2xl font-bold text-center rounded-lg border-2 transition-colors
        {scoreColor()}
        disabled:bg-gray-100 disabled:cursor-not-allowed
        focus:ring-2 focus:ring-blue-500"
		/>
		<div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-normal">
			/ 100
		</div>
	</div>
	<p class="text-xs text-gray-500 mt-1">
		{#if value >= 80}
			Excellent score
		{:else if value >= 60}
			Good score
		{:else}
			Needs improvement
		{/if}
	</p>
</div>

<style>
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		opacity: 1;
	}
</style>
```

**Step 2: Commit**

```bash
git add src/lib/components/scoring/
git commit -m "feat(epic-4.2): add ScoreInput component

- Number input with 0-100 validation
- Color-coded: green (80+), yellow (60-79), red (<60)
- Visual feedback for score ranges
- Disabled state support

Task: 4.2.8 - ScoreInput component
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 9: Create NotesTextarea Component

**Files:**

- Create: `src/lib/components/scoring/NotesTextarea.svelte`

**Step 1: Create component**

Create `src/lib/components/scoring/NotesTextarea.svelte`:

```svelte
<script lang="ts">
	interface Props {
		value: string;
		disabled?: boolean;
		onchange: (value: string) => void;
	}

	let { value = $bindable(''), disabled = false, onchange }: Props = $props();

	const maxLength = 2000;
	const charCount = $derived(value?.length || 0);
	const remaining = $derived(maxLength - charCount);

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		value = target.value;
		onchange(target.value);
	}
</script>

<div class="notes-textarea">
	<label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
		Qualitative Notes (Optional)
	</label>
	<textarea
		id="notes"
		rows="6"
		maxlength={maxLength}
		{value}
		{disabled}
		oninput={handleInput}
		placeholder="Enter interview observations, strengths, areas for improvement..."
		class="w-full px-4 py-3 rounded-lg border border-gray-300 resize-none
      focus:ring-2 focus:ring-blue-500 focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed"
	/>
	<div class="flex justify-between mt-1">
		<p class="text-xs text-gray-500">Optional qualitative feedback for committee review</p>
		<p class="text-xs" class:text-gray-500={remaining > 100} class:text-red-500={remaining <= 100}>
			{charCount} / {maxLength} characters
		</p>
	</div>
</div>
```

**Step 2: Commit**

```bash
git add src/lib/components/scoring/NotesTextarea.svelte
git commit -m "feat(epic-4.2): add NotesTextarea component

- Textarea with 2000 character limit
- Character counter with warning at 100 remaining
- Disabled state support
- Placeholder guidance text

Task: 4.2.9 - NotesTextarea component
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 10: Create Scoring Dashboard Route

**Files:**

- Create: `src/routes/[tenant]/admin/scoring/+page.server.ts`
- Create: `src/routes/[tenant]/admin/scoring/+page.svelte`

**Step 1: Create server loader**

```bash
mkdir -p src/routes/[tenant]/admin/scoring
```

Create `src/routes/[tenant]/admin/scoring/+page.server.ts`:

```typescript
import { type RequestEvent } from '@sveltejs/kit';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationScores, admissionPaths } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function load({ locals, params }: RequestEvent<{ tenant: string }>) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	// Fetch verified applications with score status
	const verifiedApps = await db
		.select({
			id: applications.id,
			childFullName: applications.childFullName,
			parentFullName: applications.parentFullName,
			parentPhone: applications.parentPhone,
			status: applications.status,
			submittedAt: applications.submittedAt,
			createdAt: applications.createdAt,
			admissionPathId: applications.admissionPathId,
			admissionPathName: admissionPaths.name,
			// Join score data
			scoreId: applicationScores.id,
			score: applicationScores.score,
			isFinalized: applicationScores.isFinalized,
			scoredAt: applicationScores.createdAt
		})
		.from(applications)
		.leftJoin(admissionPaths, eq(applications.admissionPathId, admissionPaths.id))
		.leftJoin(
			applicationScores,
			and(
				eq(applicationScores.applicationId, applications.id),
				eq(applicationScores.tenantId, auth.tenantId)
			)
		)
		.where(
			and(
				eq(applications.tenantId, auth.tenantId),
				eq(applications.status, 'verified') // Only verified candidates
			)
		)
		.orderBy(sql`${applications.submittedAt} DESC NULLS LAST`);

	// Stats
	const stats = {
		totalVerified: verifiedApps.length,
		notScored: verifiedApps.filter((app) => !app.scoreId).length,
		scoredDraft: verifiedApps.filter((app) => app.scoreId && !app.isFinalized).length,
		scoredFinalized: verifiedApps.filter((app) => app.isFinalized).length
	};

	return {
		applications: verifiedApps,
		stats,
		tenantSlug: params.tenant
	};
}
```

**Step 2: Create dashboard UI**

Create `src/routes/[tenant]/admin/scoring/+page.svelte`:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import { FileCheck, Clock, CheckCircle2, XCircle, Search, Filter } from 'lucide-svelte';

	let { data } = $props();

	let searchQuery = $state('');
	let statusFilter = $state<string>('all');

	const filteredApplications = $derived(() => {
		let filtered = data.applications;

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(app: any) =>
					app.childFullName?.toLowerCase().includes(query) ||
					app.parentFullName?.toLowerCase().includes(query)
			);
		}

		// Status filter
		if (statusFilter === 'not_scored') {
			filtered = filtered.filter((app: any) => !app.scoreId);
		} else if (statusFilter === 'draft') {
			filtered = filtered.filter((app: any) => app.scoreId && !app.isFinalized);
		} else if (statusFilter === 'finalized') {
			filtered = filtered.filter((app: any) => app.isFinalized);
		}

		return filtered;
	});

	function formatDate(date: Date | string | null): string {
		if (!date) return '-';
		const d = typeof date === 'string' ? new Date(date) : date;
		return d.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function handleScore(applicationId: string) {
		goto(`/${data.tenantSlug}/admin/scoring/${applicationId}`);
	}
</script>

<svelte:head>
	<title>Scoring Dashboard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
	<div class="max-w-7xl mx-auto">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Candidate Scoring</h1>
			<p class="text-gray-600 mt-1">Review and score verified candidates</p>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-100 rounded-lg">
						<FileCheck class="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.totalVerified}</p>
						<p class="text-sm text-gray-500">Total Verified</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-yellow-100 rounded-lg">
						<XCircle class="w-6 h-6 text-yellow-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.notScored}</p>
						<p class="text-sm text-gray-500">Not Scored</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-orange-100 rounded-lg">
						<Clock class="w-6 h-6 text-orange-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.scoredDraft}</p>
						<p class="text-sm text-gray-500">Draft Scores</p>
					</div>
				</div>
			</Card>

			<Card class="p-4">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-green-100 rounded-lg">
						<CheckCircle2 class="w-6 h-6 text-green-600" />
					</div>
					<div>
						<p class="text-2xl font-bold text-gray-900">{data.stats.scoredFinalized}</p>
						<p class="text-sm text-gray-500">Finalized</p>
					</div>
				</div>
			</Card>
		</div>

		<!-- Filters -->
		<Card class="p-4 mb-6">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<div class="relative">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search by name..."
							bind:value={searchQuery}
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Filter class="w-4 h-4 text-gray-500" />
					<select
						bind:value={statusFilter}
						class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
					>
						<option value="all">All Candidates</option>
						<option value="not_scored">Not Scored</option>
						<option value="draft">Draft Scores</option>
						<option value="finalized">Finalized</option>
					</select>
				</div>
			</div>
		</Card>

		<!-- Applications Table -->
		<Card class="overflow-hidden">
			{#if filteredApplications().length === 0}
				<div class="text-center py-12">
					<FileCheck class="w-16 h-16 mx-auto text-gray-300 mb-4" />
					<h3 class="text-lg font-medium text-gray-600 mb-2">No candidates found</h3>
					<p class="text-gray-500">
						{searchQuery || statusFilter !== 'all'
							? 'Try adjusting your filters'
							: 'No verified candidates yet'}
					</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-gray-50 border-b">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Candidate</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Admission Path</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Score Status</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Verified Date</th
								>
								<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							{#each filteredApplications() as app}
								<tr class="hover:bg-gray-50 transition-colors">
									<td class="px-6 py-4">
										<div>
											<p class="font-medium text-gray-900">{app.childFullName}</p>
											<p class="text-sm text-gray-500">{app.parentFullName}</p>
										</div>
									</td>
									<td class="px-6 py-4">
										<span class="text-sm text-gray-900">{app.admissionPathName || 'N/A'}</span>
									</td>
									<td class="px-6 py-4">
										{#if app.isFinalized}
											<Badge variant="default">
												<CheckCircle2 class="w-3 h-3 mr-1" />
												Finalized ({app.score})
											</Badge>
										{:else if app.scoreId}
											<Badge variant="secondary">
												<Clock class="w-3 h-3 mr-1" />
												Draft ({app.score})
											</Badge>
										{:else}
											<Badge variant="secondary">
												<XCircle class="w-3 h-3 mr-1" />
												Not Scored
											</Badge>
										{/if}
									</td>
									<td class="px-6 py-4">
										<span class="text-sm text-gray-900">{formatDate(app.submittedAt)}</span>
									</td>
									<td class="px-6 py-4">
										<Button
											size="sm"
											onclick={() => handleScore(app.id)}
											class="bg-blue-600 hover:bg-blue-700"
										>
											{app.scoreId ? 'Edit Score' : 'Score Now'}
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</Card>
	</div>
</div>
```

**Step 3: Commit**

```bash
git add src/routes/[tenant]/admin/scoring/
git commit -m "feat(epic-4.2): add scoring dashboard with stats and filters

- Dashboard route: /admin/scoring
- Stats cards: total verified, not scored, draft, finalized
- Search and filter (not scored, draft, finalized)
- Table view with score status badges
- RBAC: interviewer or school_admin only

Task: 4.2.10 - Scoring dashboard
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 11: Create Scoring Detail Page

**Files:**

- Create: `src/routes/[tenant]/admin/scoring/[applicationId]/+page.server.ts`
- Create: `src/routes/[tenant]/admin/scoring/[applicationId]/+page.svelte`

**Step 1: Create server loader**

```bash
mkdir -p src/routes/[tenant]/admin/scoring/[applicationId]
```

Create `src/routes/[tenant]/admin/scoring/[applicationId]/+page.server.ts`:

```typescript
import { error as svelteError, type RequestEvent } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { applications, applicationScores } from '$lib/server/db/schema';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export async function load({
	locals,
	params
}: RequestEvent<{ tenant: string; applicationId: string }>) {
	const auth = await requireAuth(locals);
	requireRole(auth, 'interviewer', 'school_admin');

	const { applicationId } = params;

	// Fetch application
	const application = await db.query.applications.findFirst({
		where: and(eq(applications.id, applicationId), eq(applications.tenantId, auth.tenantId)),
		with: {
			admissionPath: true
		}
	});

	if (!application) {
		throw svelteError(404, 'Application not found');
	}

	if (application.status !== 'verified') {
		throw svelteError(400, 'Application must be verified before scoring');
	}

	// Fetch existing score
	const score = await db.query.applicationScores.findFirst({
		where: and(
			eq(applicationScores.applicationId, applicationId),
			eq(applicationScores.tenantId, auth.tenantId)
		),
		with: {
			scorer: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			},
			unlocker: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});

	return {
		application,
		score,
		tenantSlug: params.tenant,
		currentUserId: auth.userId,
		isAdmin: auth.session.role === 'school_admin'
	};
}
```

**Step 2: Create scoring form UI**

Create `src/routes/[tenant]/admin/scoring/[applicationId]/+page.svelte`:

```svelte
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Card from '$lib/components/ui/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Badge from '$lib/components/ui/badge.svelte';
	import ScoreInput from '$lib/components/scoring/ScoreInput.svelte';
	import NotesTextarea from '$lib/components/scoring/NotesTextarea.svelte';
	import { ArrowLeft, Lock, Unlock, Save, CheckCircle } from 'lucide-svelte';

	let { data } = $props();

	let score = $state(data.score?.score || 0);
	let notes = $state(data.score?.notes || '');
	let isSubmitting = $state(false);
	let showUnlockModal = $state(false);
	let unlockReason = $state('');

	const isFinalized = $derived(data.score?.isFinalized || false);
	const isLocked = $derived(isFinalized && !data.isAdmin);

	async function handleSave(finalize = false) {
		isSubmitting = true;
		try {
			const response = await fetch(`/api/admin/scores/${data.application.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ score, notes, finalize })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to save score');
			}

			await invalidateAll();
			alert(finalize ? 'Score finalized successfully!' : 'Score saved as draft');
		} catch (error) {
			alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleUnlock() {
		if (!unlockReason.trim() || unlockReason.length < 10) {
			alert('Unlock reason must be at least 10 characters');
			return;
		}

		isSubmitting = true;
		try {
			const response = await fetch(`/api/admin/scores/${data.score.id}/unlock`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason: unlockReason })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to unlock score');
			}

			await invalidateAll();
			showUnlockModal = false;
			unlockReason = '';
			alert('Score unlocked successfully');
		} catch (error) {
			alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Score Candidate - {data.application.childFullName}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="mb-6">
			<Button variant="outline" size="sm" onclick={() => goto(`/${data.tenantSlug}/admin/scoring`)}>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Back to List
			</Button>
		</div>

		<!-- Application Info -->
		<Card class="p-6 mb-6">
			<div class="flex items-start justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">{data.application.childFullName}</h1>
					<p class="text-gray-600 mt-1">{data.application.admissionPath?.name || 'N/A'}</p>
				</div>
				{#if isFinalized}
					<Badge variant="default">
						<Lock class="w-3 h-3 mr-1" />
						Finalized
					</Badge>
				{/if}
			</div>

			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
				<div>
					<p class="text-xs text-gray-500">Parent</p>
					<p class="text-sm font-medium">{data.application.parentFullName}</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">Phone</p>
					<p class="text-sm font-medium">{data.application.parentPhone}</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">Gender</p>
					<p class="text-sm font-medium capitalize">{data.application.childGender || '-'}</p>
				</div>
				<div>
					<p class="text-xs text-gray-500">DOB</p>
					<p class="text-sm font-medium">
						{data.application.childDob
							? new Date(data.application.childDob).toLocaleDateString('id-ID')
							: '-'}
					</p>
				</div>
			</div>
		</Card>

		<!-- Scoring Form -->
		<Card class="p-6">
			<h2 class="text-lg font-bold text-gray-900 mb-6">Candidate Scoring</h2>

			<div class="space-y-6">
				<ScoreInput value={score} disabled={isLocked} onchange={(val) => (score = val)} />

				<NotesTextarea value={notes} disabled={isLocked} onchange={(val) => (notes = val)} />

				{#if data.score?.unlockedBy}
					<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
						<p class="text-sm text-yellow-800">
							<strong>Unlocked by admin:</strong>
							{data.score.unlocker?.name || data.score.unlocker?.email}
						</p>
						<p class="text-xs text-yellow-700 mt-1">Reason: {data.score.unlockReason}</p>
					</div>
				{/if}

				<div class="flex gap-3 pt-4">
					{#if isLocked}
						<p class="text-gray-600 flex items-center gap-2">
							<Lock class="w-4 h-4" />
							Score is finalized. Contact admin to unlock.
						</p>
						{#if data.isAdmin}
							<Button variant="outline" onclick={() => (showUnlockModal = true)}>
								<Unlock class="w-4 h-4 mr-2" />
								Unlock Score
							</Button>
						{/if}
					{:else}
						<Button variant="outline" onclick={() => handleSave(false)} disabled={isSubmitting}>
							<Save class="w-4 h-4 mr-2" />
							Save Draft
						</Button>
						<Button
							onclick={() => handleSave(true)}
							disabled={isSubmitting}
							class="bg-green-600 hover:bg-green-700"
						>
							<CheckCircle class="w-4 h-4 mr-2" />
							Finalize Score
						</Button>
					{/if}
				</div>
			</div>
		</Card>
	</div>
</div>

<!-- Unlock Modal -->
{#if showUnlockModal}
	<div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
		<div class="bg-white rounded-lg max-w-md w-full p-6">
			<h3 class="text-lg font-bold text-gray-900 mb-4">Unlock Score</h3>
			<p class="text-sm text-gray-600 mb-4">
				Please provide a reason for unlocking this finalized score. This will be recorded in the
				audit log.
			</p>
			<textarea
				bind:value={unlockReason}
				placeholder="e.g., Interviewer entered wrong score due to input error"
				rows="4"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
			></textarea>
			<div class="flex gap-3 mt-6">
				<Button
					variant="outline"
					class="flex-1"
					onclick={() => (showUnlockModal = false)}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					class="flex-1 bg-yellow-600 hover:bg-yellow-700"
					onclick={handleUnlock}
					disabled={isSubmitting}
				>
					Unlock
				</Button>
			</div>
		</div>
	</div>
{/if}
```

**Step 3: Commit**

```bash
git add src/routes/[tenant]/admin/scoring/[applicationId]/
git commit -m "feat(epic-4.2): add scoring detail page with form

- Detail route: /admin/scoring/[applicationId]
- Score input + notes textarea components
- Save draft or finalize score
- Admin unlock modal with reason input
- Lock indicator for finalized scores
- Application data display (read-only)

Task: 4.2.11 - Scoring detail page
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 12: Add Integration Tests

**Files:**

- Create: `tests/integration/scoring.test.ts`

**Step 1: Write integration test**

Create `tests/integration/scoring.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import {
	tenants,
	users,
	applications,
	applicationScores,
	admissionPaths
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

describe('Scoring Integration Tests', () => {
	let testTenantId: string;
	let testInterviewerId: string;
	let testApplicationId: string;
	let testPathId: string;

	beforeAll(async () => {
		// Create test tenant
		const [tenant] = await db
			.insert(tenants)
			.values({
				name: 'Test School - Scoring',
				slug: 'test-scoring-school',
				status: 'active'
			})
			.returning();
		testTenantId = tenant.id;

		// Create admission path
		const [path] = await db
			.insert(admissionPaths)
			.values({
				tenantId: testTenantId,
				name: 'Jalur Regular',
				quota: 100,
				status: 'open'
			})
			.returning();
		testPathId = path.id;

		// Create interviewer user
		const [interviewer] = await db
			.insert(users)
			.values({
				email: 'interviewer@test.com',
				tenantId: testTenantId,
				role: 'interviewer',
				name: 'Test Interviewer',
				status: 'active'
			})
			.returning();
		testInterviewerId = interviewer.id;

		// Create verified application
		const [parent] = await db
			.insert(users)
			.values({
				email: 'parent@test.com',
				tenantId: testTenantId,
				role: 'parent',
				status: 'active'
			})
			.returning();

		const [application] = await db
			.insert(applications)
			.values({
				tenantId: testTenantId,
				userId: parent.id,
				admissionPathId: testPathId,
				status: 'verified', // Ready for scoring
				childFullName: 'Test Child',
				parentFullName: 'Test Parent',
				parentPhone: '081234567890'
			})
			.returning();
		testApplicationId = application.id;
	});

	afterAll(async () => {
		// Cleanup
		await db.delete(applicationScores).where(eq(applicationScores.tenantId, testTenantId));
		await db.delete(applications).where(eq(applications.tenantId, testTenantId));
		await db.delete(admissionPaths).where(eq(admissionPaths.tenantId, testTenantId));
		await db.delete(users).where(eq(users.tenantId, testTenantId));
		await db.delete(tenants).where(eq(tenants.id, testTenantId));
	});

	describe('Create Score', () => {
		it('should create score for verified application', async () => {
			const [score] = await db
				.insert(applicationScores)
				.values({
					applicationId: testApplicationId,
					tenantId: testTenantId,
					scorerId: testInterviewerId,
					score: 85,
					notes: 'Good candidate',
					isFinalized: false
				})
				.returning();

			expect(score).toBeDefined();
			expect(score.score).toBe(85);
			expect(score.isFinalized).toBe(false);
		});

		it('should enforce UNIQUE constraint on application', async () => {
			// Try to create duplicate score
			await expect(
				db.insert(applicationScores).values({
					applicationId: testApplicationId,
					tenantId: testTenantId,
					scorerId: testInterviewerId,
					score: 90,
					notes: 'Duplicate'
				})
			).rejects.toThrow();
		});
	});

	describe('Finalize Score', () => {
		it('should finalize draft score', async () => {
			const existingScore = await db.query.applicationScores.findFirst({
				where: eq(applicationScores.applicationId, testApplicationId)
			});

			const [finalized] = await db
				.update(applicationScores)
				.set({
					isFinalized: true,
					finalizedAt: new Date()
				})
				.where(eq(applicationScores.id, existingScore!.id))
				.returning();

			expect(finalized.isFinalized).toBe(true);
			expect(finalized.finalizedAt).toBeDefined();
		});
	});

	describe('Unlock Score', () => {
		it('should unlock finalized score with reason', async () => {
			const adminId = testInterviewerId; // Simulate admin

			const existingScore = await db.query.applicationScores.findFirst({
				where: eq(applicationScores.applicationId, testApplicationId)
			});

			const [unlocked] = await db
				.update(applicationScores)
				.set({
					isFinalized: false,
					finalizedAt: null,
					unlockedBy: adminId,
					unlockedAt: new Date(),
					unlockReason: 'Correction needed - wrong score entered'
				})
				.where(eq(applicationScores.id, existingScore!.id))
				.returning();

			expect(unlocked.isFinalized).toBe(false);
			expect(unlocked.unlockedBy).toBe(adminId);
			expect(unlocked.unlockReason).toBeDefined();
		});
	});
});
```

**Step 2: Commit**

```bash
git add tests/integration/scoring.test.ts
git commit -m "test(epic-4.2): add integration tests for scoring

Test coverage:
- Create score for verified application
- UNIQUE constraint enforcement (one score per app)
- Finalize score flow (isFinalized, finalizedAt)
- Unlock score flow (admin override with reason)

Note: Tests require test DB to run
Task: 4.2.12 - Integration tests
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 13: Manual Testing Checklist

**Files:**

- Create: `docs/testing/epic-4.2-manual-tests.md`

**Step 1: Create manual test guide**

Create `docs/testing/epic-4.2-manual-tests.md`:

```markdown
# Epic 4.2 Manual Testing Checklist

## Prerequisites

- [ ] Test DB running
- [ ] Test tenant created
- [ ] Interviewer user created (email: interviewer@test.com)
- [ ] School admin user created
- [ ] At least 2 verified applications available

## Test Scenarios

### Scenario 1: Create Score (Happy Path)

1. [ ] Login as interviewer
2. [ ] Navigate to `/admin/scoring`
3. [ ] Verify stats cards show correct counts
4. [ ] Click "Score Now" on unscored candidate
5. [ ] Enter score: 85
6. [ ] Enter notes: "Strong communication skills"
7. [ ] Click "Save Draft"
8. [ ] Verify success message
9. [ ] Return to list - verify badge shows "Draft (85)"

### Scenario 2: Finalize Score

1. [ ] Open draft score from Scenario 1
2. [ ] Verify score and notes are loaded
3. [ ] Click "Finalize Score"
4. [ ] Verify success message
5. [ ] Return to list - verify badge shows "Finalized (85)"
6. [ ] Reopen score - verify form is disabled
7. [ ] Verify lock icon and message displayed

### Scenario 3: Unlock Score (Admin Override)

1. [ ] Logout, login as school admin
2. [ ] Navigate to `/admin/scoring`
3. [ ] Open finalized score
4. [ ] Click "Unlock Score" button
5. [ ] Enter reason: "Interviewer entered wrong score"
6. [ ] Confirm unlock
7. [ ] Verify success message
8. [ ] Verify form is now editable
9. [ ] Verify unlock reason displayed

### Scenario 4: Edit After Unlock

1. [ ] Still logged as admin (or relogin as interviewer)
2. [ ] Edit score: change 85 → 92
3. [ ] Update notes
4. [ ] Save draft
5. [ ] Finalize again
6. [ ] Verify new score saved correctly

### Scenario 5: Validation Errors

1. [ ] Open scoring form
2. [ ] Try score: -5 → expect error "Score must be at least 0"
3. [ ] Try score: 105 → expect error "Score must be at most 100"
4. [ ] Try notes: 2500 characters → expect error "Notes must be 2000 characters or less"
5. [ ] Try finalize without score → expect error

### Scenario 6: RBAC Enforcement

1. [ ] Logout, login as verifier (not interviewer)
2. [ ] Navigate to `/admin/scoring` → expect 403 or redirect
3. [ ] Try direct URL to score page → expect 403

### Scenario 7: Application Status Check

1. [ ] Login as interviewer
2. [ ] Navigate to scoring list
3. [ ] Verify only "verified" applications shown
4. [ ] Try to score non-verified application (via direct URL) → expect error

## Expected Results

All scenarios should pass without errors. Audit logs should record:

- Finalize actions
- Unlock actions with reasons

## Bug Reporting

If any test fails, report:

- Scenario number
- Steps to reproduce
- Expected vs actual result
- Screenshots if applicable
```

**Step 2: Commit**

```bash
mkdir -p docs/testing
git add docs/testing/epic-4.2-manual-tests.md
git commit -m "docs(epic-4.2): add manual testing checklist

Manual test scenarios:
- Create and save draft score
- Finalize score (lock)
- Admin unlock with reason
- Edit after unlock
- Validation error handling
- RBAC enforcement
- Application status verification

Task: 4.2.13 - Manual testing guide
Epic: 4 - Verification, Selection & Ranking Engine"
```

---

## Task 14: Update Sprint Status

**Files:**

- Modify: `_bmad-output/sprint-status.yaml`

**Step 1: Mark Epic 4.2 as done**

In `_bmad-output/sprint-status.yaml`, update Epic 4 section:

```yaml
- id: 'epic-4'
  name: 'Verification, Selection & Ranking Engine'
  status: 'in_progress'
  priority: 'high'
  planned_start: '2026-01-12'
  stories:
    - id: '4-1'
      name: 'Side-by-Side Verification Interface'
      status: 'done'
      completed_at: '2026-01-12'
      owner: 'Elena'
    - id: '4-2'
      name: 'Scoring & Interview Input'
      status: 'done'
      completed_at: '2026-01-12'
      owner: 'Elena'
    - id: '4-3'
      name: 'Automated Ranking Engine'
      status: 'pending'
    - id: '4-4'
      name: 'Home Visit Report Upload'
      status: 'pending'
```

**Step 2: Commit**

```bash
git add _bmad-output/sprint-status.yaml
git commit -m "chore: update sprint status - Epic 4.2 completed

Epic 4: Verification, Selection & Ranking Engine
- Story 4-2: Scoring & Interview Input → DONE (2026-01-12)

Implementation summary:
- 14 tasks completed
- Database schema + migrations
- 3 API endpoints (create, finalize, unlock)
- 2 UI routes (dashboard + detail)
- 2 reusable components
- Integration tests
- Manual test guide

Next: Stories 4-3, 4-4 (pending)"
```

---

## Summary

**Total Tasks:** 14  
**Estimated Time:** 8-10 hours  
**Commits:** 14 clean commits

**Implementation Order:**

1. Database & Schema (Tasks 1-2)
2. Validation & API (Tasks 3-7)
3. UI Components (Tasks 8-9)
4. UI Routes (Tasks 10-11)
5. Testing & Docs (Tasks 12-14)

**Key Files Created:** 15+

- Schema: 1 table (application_scores)
- API: 3 endpoints
- Components: 2 (ScoreInput, NotesTextarea)
- Routes: 2 (dashboard + detail)
- Tests: 1 integration test
- Docs: 2 (design + manual tests)

---

## Execution Notes

**Prerequisites:**

- Test database running (port 5433 for integration tests)
- No unstaged changes in working directory
- All existing tests passing

**Post-Implementation:**

- Run `npm run db:push` to apply schema changes (if DB_URL configured)
- Run `npm run test:unit` to verify tests
- Run manual tests per `docs/testing/epic-4.2-manual-tests.md`

**Related Documentation:**

- Design: `docs/plans/2026-01-12-scoring-interview-input-design.md`
- API Spec: Tasks 4-7
- Component Spec: Tasks 8-9

---

**Plan saved to:** `docs/plans/2026-01-12-scoring-implementation-plan.md`
