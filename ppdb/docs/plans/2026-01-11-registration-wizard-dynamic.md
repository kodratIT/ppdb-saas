# Dynamic Registration Wizard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 4-step dynamic registration wizard that renders base fields and custom fields, synchronized with a client-side store and optimistic server-side updates.

**Architecture:**

- **Server Load:** Each step fetches the application draft and custom fields filtered by the current step and admission path.
- **Client Store:** `formDraft` store manages the global registration state, handling real-time synchronization and version tracking.
- **Dynamic Rendering:** Uses `DynamicField` component to render custom fields based on database configuration.
- **Progressive Enhancement:** Forms use SvelteKit `enhance` for background saving while maintaining a smooth UI.

**Tech Stack:** SvelteKit (Runes), Drizzle ORM, Tailwind CSS, Lucide Icons (if available), shadcn/ui components (Button, Input, Label, Progress, Card).

## Task 1: Wizard Page Load Logic (Server-side)

**Files:**

- Modify: `src/routes/[tenant]/register/form/step-1/+page.server.ts`
- Create: `src/routes/[tenant]/register/form/step-2/+page.server.ts`
- Create: `src/routes/[tenant]/register/form/step-3/+page.server.ts`
- Create: `src/routes/[tenant]/register/form/step-4/+page.server.ts`

**Step 1: Update Step 1 load to fetch custom fields**
Modify `src/routes/[tenant]/register/form/step-1/+page.server.ts` to fetch custom fields for step 1.

```typescript
// ... existing imports
import { customFields, fieldOptions } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
	// ... existing auth logic

	// Fetch custom fields for step 1
	const stepFields = await db.query.customFields.findMany({
		where: and(
			eq(customFields.tenantId, session.tenantId),
			// admissionPathId filter should ideally be applied if draft exists
			eq(customFields.step, 1)
		),
		with: {
			options: {
				orderBy: [asc(fieldOptions.order)]
			}
		},
		orderBy: [asc(customFields.order)]
	});

	return {
		// ... existing returns
		customFields: stepFields
	};
};
```

**Step 2: Create Load logic for Steps 2, 3, and 4**
Implement similar load functions for other steps, changing `eq(customFields.step, N)`.

**Step 3: Commit**

```bash
git add src/routes/\[tenant\]/register/form/step-*/*.ts
git commit -m "feat: add server-side load logic for dynamic fields in registration wizard"
```

## Task 2: Wizard UI Implementation (Client-side)

**Files:**

- Modify: `src/routes/[tenant]/register/form/step-1/+page.svelte`
- Create: `src/routes/[tenant]/register/form/step-2/+page.svelte`
- Create: `src/routes/[tenant]/register/form/step-3/+page.svelte`
- Create: `src/routes/[tenant]/register/form/step-4/+page.svelte`

**Step 1: Integrate `formDraft` store and `DynamicField` in Step 1**
Update `src/routes/[tenant]/register/form/step-1/+page.svelte`.

```svelte
<script lang="ts">
	import { createFormDraft } from '$lib/stores/form-draft.svelte';
	import DynamicField from '$lib/components/forms/dynamic/DynamicField.svelte';
	// ... other imports

	let { data, form } = $props();

	// Initialize store
	const draftStore = createFormDraft(data.draft || {});

	// Synchronize base fields to store
	$effect(() => {
		draftStore.update({
			childFullName: data.draft?.childFullName || ''
			// ... other base fields
		});
	});
</script>

<!-- In Template -->
<form ...>
	<!-- Base Fields (already exists for Step 1) -->

	<!-- Dynamic Custom Fields -->
	{#each data.customFields as field}
		<DynamicField
			{field}
			value={draftStore.data.customFieldValues[field.key]}
			onchange={(val) => draftStore.updateCustomField(field.key, val)}
		/>
	{/each}
</form>
```

**Step 2: Implement Steps 2, 3, 4 with respective Base Fields**

- Step 2: Parent Info
- Step 3: Address Info
- Step 4: Documents (if any) or Summary

**Step 3: Commit**

```bash
git add src/routes/\[tenant\]/register/form/step-*/*.svelte
git commit -m "feat: implement dynamic field rendering in wizard steps"
```

## Task 3: Form Navigation and Validation

**Files:**

- Modify: `src/routes/[tenant]/register/form/step-[step]/+page.svelte`
- Modify: `src/routes/[tenant]/register/form/step-[step]/+page.server.ts`

**Step 1: Implement validation before "Lanjut"**
Add client-side validation logic in `+page.svelte` and server-side validation in `actions`.

**Step 2: Commit**

```bash
git add src/routes/\[tenant\]/register/form/step-*
git commit -m "feat: add validation and navigation for registration wizard"
```

## Task 4: Data Decryption for Existing Draft Values

**Files:**

- Modify: `src/routes/[tenant]/register/form/step-[step]/+page.server.ts`

**Step 1: Decrypt values in load function**
If `draft.customFieldValues` contains encrypted data, decrypt it before sending to client.

```typescript
import { decrypt } from '$lib/server/utils/crypto';

// inside load
if (existingDraft?.customFieldValues) {
	const values = JSON.parse(existingDraft.customFieldValues);
	// decrypt if field.isEncrypted
}
```

**Step 2: Commit**

```bash
git add src/routes/\[tenant\]/register/form/step-*/*.server.ts
git commit -m "feat: decrypt sensitive draft data for editing"
```
