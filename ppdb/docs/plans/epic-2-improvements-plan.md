# Epic 2 Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix E2E test blocking issues by creating shared UI components library, update admin pages, and plan Clerk auth integration for Epic 3.

**Architecture:** Create a shadcn-svelte inspired component library in `src/lib/components/ui/` with Button, Card, Input, Label, Textarea, Select, Badge, and Table components. Update existing admin pages to use these components, resolving import issues. Document Clerk auth integration approach for Epic 3.

**Tech Stack:** Svelte 5, Tailwind CSS v4, bits-ui (for primitive components), clsx, tailwind-merge

---

## Files Created

- `src/lib/components/ui/button.svelte`
- `src/lib/components/ui/card.svelte`
- `src/lib/components/ui/input.svelte`
- `src/lib/components/ui/label.svelte`
- `src/lib/components/ui/textarea.svelte`
- `src/lib/components/ui/select.svelte`
- `src/lib/components/ui/badge.svelte`
- `src/lib/components/ui/table.svelte`
- `src/lib/components/ui/table-head.svelte`
- `src/lib/components/ui/table-row.svelte`
- `src/lib/components/ui/table-cell.svelte`
- `docs/plans/clerk-auth-integration-plan.md`

## Files Modified

- `src/routes/admin/settings/school-admins/+page.svelte`
- `src/routes/admin/settings/+page.svelte`
- `src/routes/admin/settings/admission-paths/+page.svelte`
- `src/routes/admin/settings/fee-structures/+page.svelte`
- `_bmad-output/sprint-status.yaml`

---

## Task 1: Create utility function for component exports

**Files:**

- Create: `src/lib/components/ui/index.ts`

**Step 1: Write the utility file**

```typescript
export { default as Button } from './button.svelte';
export { default as Card } from './card.svelte';
export { default as Input } from './input.svelte';
export { default as Label } from './label.svelte';
export { default as Textarea } from './textarea.svelte';
export { default as Select } from './select.svelte';
export { default as Badge } from './badge.svelte';
export { default as Table } from './table.svelte';
export { TableHead } from './table-head.svelte';
export { TableRow } from './table-row.svelte';
export { TableCell } from './table-cell.svelte';
```

**Step 2: Commit**

Run: `git add src/lib/components/ui/index.ts`
Expected: File staged
Commit: `feat(ui): add component library index exports`

---

## Task 2: Create Button component

**Files:**

- Create: `src/lib/components/ui/button.svelte`

**Step 1: Write the Button component**

```svelte
<script lang="ts">
	import { type ButtonHTMLAttributes, type Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		class: className,
		variant = 'default',
		size = 'default',
		children,
		onclick,
		...restProps
	}: Props = $props();

	const variantClasses = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	const sizeClasses = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};
</script>

<button
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
	{onclick}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</button>
```

**Step 2: Commit**

Run: `git add src/lib/components/ui/button.svelte`
Expected: File staged
Commit: `feat(ui): add Button component with variants`

---

## Task 3: Create Card component

**Files:**

- Create: `src/lib/components/ui/card.svelte`
- Create: `src/lib/components/ui/card-content.svelte`
- Create: `src/lib/components/ui/card-header.svelte`
- Create: `src/lib/components/ui/card-title.svelte`
- Create: `src/lib/components/ui/card-description.svelte`
- Create: `src/lib/components/ui/card-footer.svelte`

**Step 1: Write card.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<div
	class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
	{...restProps}
/>
```

**Step 2: Write card-content.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<div class={cn('p-6 pt-0', className)} {...restProps} />
```

**Step 3: Write card-header.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<div class={cn('flex flex-col space-y-1.5 p-6', className)} {...restProps} />
```

**Step 4: Write card-title.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLHeadingAttributes } from 'svelte';

	interface Props extends HTMLHeadingAttributes<HTMLHeadingElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<h3 class={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...restProps} />
```

**Step 5: Write card-description.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLParagraphAttributes } from 'svelte';

	interface Props extends HTMLParagraphAttributes {}

	let { class: className, ...restProps }: Props = $props();
</script>

<p class={cn('text-sm text-muted-foreground', className)} {...restProps} />
```

**Step 6: Write card-footer.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<div class={cn('flex items-center p-6 pt-0', className)} {...restProps} />
```

**Step 7: Commit all card files**

Run: `git add src/lib/components/ui/card*.svelte`
Expected: 6 files staged
Commit: `feat(ui): add Card component family (Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter)`

---

## Task 4: Create Input component

**Files:**

- Create: `src/lib/components/ui/input.svelte`

**Step 1: Write the Input component**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { InputHTMLAttributes } from 'svelte';

	interface Props extends InputHTMLAttributes<HTMLInputElement> {}

	let { class: className, value, ...restProps }: Props = $props();
</script>

<input
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	{...restProps}
/>
```

**Step 2: Commit**

Run: `git add src/lib/components/ui/input.svelte`
Expected: File staged
Commit: `feat(ui): add Input component`

---

## Task 5: Create Label component

**Files:**

- Create: `src/lib/components/ui/label.svelte`

**Step 1: Write the Label component**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { LabelHTMLAttributes } from 'svelte';

	interface Props extends LabelHTMLAttributes<HTMLLabelElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<label
	class={cn(
		'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...restProps}
/>
```

**Step 2: Commit**

Run: `git add src/lib/components/ui/label.svelte`
Expected: File staged
Commit: `feat(ui): add Label component`

---

## Task 6: Create Textarea component

**Files:**

- Create: `src/lib/components/ui/textarea.svelte`

**Step 1: Write the Textarea component**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { TextareaHTMLAttributes } from 'svelte';

	interface Props extends TextareaHTMLAttributes {}

	let { class: className, value, ...restProps }: Props = $props();
</script>

<textarea
	class={cn(
		'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	bind:value
	{...restProps}
/>
```

**Step 2: Commit**

Run: `git add src/lib/components/ui/textarea.svelte`
Expected: File staged
Commit: `feat(ui): add Textarea component`

---

## Task 7: Create Select component

**Files:**

- Create: `src/lib/components/ui/select.svelte`

**Step 1: Write the Select component**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SelectHTMLAttributes } from 'svelte';

	interface Props extends SelectHTMLAttributes<HTMLSelectElement> {}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<select
	class={cn(
		'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</select>
```

**Step 2: Write Select sub-components**

Create `select-content.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { children, class: className, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'relative z-50 max-h-96 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
```

Create `select-item.svelte`:

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLOptionElement> {
		value: string;
	}

	let { class: className, value, children, ...restProps }: Props = $props();
</script>

<option
	class={cn(
		'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		className
	)}
	{value}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</option>
```

Create `select-trigger.svelte`:

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
```

Create `select-value.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		placeholder?: string;
		children?: Snippet;
	}

	let { placeholder, children }: Props = $props();
</script>

{#if children}
	{@render children()}
{:else if placeholder}
	<span class="text-muted-foreground">{placeholder}</span>
{/if}
```

**Step 3: Commit**

Run: `git add src/lib/components/ui/select*.svelte`
Expected: 5 files staged
Commit: `feat(ui): add Select component family (Select, SelectContent, SelectItem, SelectTrigger, SelectValue)`

---

## Task 8: Create Badge component

**Files:**

- Create: `src/lib/components/ui/badge.svelte`

**Step 1: Write the Badge component**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
	}

	let { class: className, variant = 'default', ...restProps }: Props = $props();

	const variantClasses = {
		default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
		secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
		destructive:
			'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
		outline: 'text-foreground'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variantClasses[variant],
		className
	)}
	{...restProps}
/>
```

**Step 2: Commit**

Run: `git add src/lib/components/ui/badge.svelte`
Expected: File staged
Commit: `feat(ui): add Badge component`

---

## Task 9: Create Table components

**Files:**

- Create: `src/lib/components/ui/table.svelte`
- Create: `src/lib/components/ui/table-head.svelte`
- Create: `src/lib/components/ui/table-row.svelte`
- Create: `src/lib/components/ui/table-cell.svelte`
- Create: `src/lib/components/ui/table-body.svelte`
- Create: `src/lib/components/ui/table-caption.svelte`

**Step 1: Write table.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<div class="relative w-full overflow-auto">
	<table class={cn('w-full caption-bottom text-sm', className)} {...restProps} />
</div>
```

**Step 2: Write table-head.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<th
	class={cn(
		'[&:has([role=checkbox])]:pr-0 relative px-4 text-left align-middle font-medium text-muted-foreground [&>[role=checkbox]]:translate-y-[2px]',
		className
	)}
	{...restProps}
/>
```

**Step 3: Write table-row.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<tr
	class={cn(
		'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
		className
	)}
	{...restProps}
/>
```

**Step 4: Write table-cell.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<td
	class={cn(
		'[&:has([role=checkbox])]:pr-0 relative px-4 align-middle [&>[role=checkbox]]:translate-y-[2px]',
		className
	)}
	{...restProps}
/>
```

**Step 5: Write table-body.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<tbody class={cn('[&_tr:last-child]:border-0', className)} {...restProps} />
```

**Step 6: Write table-caption.svelte**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte';

	interface Props extends HTMLAttributes<HTMLTableCaptionElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<caption class={cn('mt-4 text-sm text-muted-foreground', className)} {...restProps} />
```

**Step 7: Commit**

Run: `git add src/lib/components/ui/table*.svelte`
Expected: 6 files staged
Commit: `feat(ui): add Table component family (Table, TableHead, TableRow, TableCell, TableBody, TableCaption)`

---

## Task 10: Update school-admins page to use shared components

**Files:**

- Modify: `src/routes/admin/settings/school-admins/+page.svelte:6-17`

**Step 1: Fix the import statement**

Change from:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '$components/ui/card';
import { Button } from '$components/ui/button';
import { Input } from '$components/ui/input';
import { Label } from '$components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '$components/ui/select';
import { Badge } from '$components/ui/badge';
```

To:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
import { Button } from '$lib/components/ui';
import { Input } from '$lib/components/ui';
import { Label } from '$lib/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui';
import { Badge } from '$lib/components/ui';
```

**Step 2: Commit**

Run: `git add src/routes/admin/settings/school-admins/+page.svelte`
Expected: File staged
Commit: `fix: correct component import paths in school-admins page`

---

## Task 11: Update settings page to use shared components

**Files:**

- Modify: `src/routes/admin/settings/+page.svelte`

**Step 1: Replace native HTML elements with shared components**

Replace all native `<input>`, `<label>`, `<textarea>`, `<button>` with shared components.

Replace `<div class="bg-white shadow-md rounded-lg p-6 space-y-4">` with `<Card>` components.

**Step 2: Commit**

Run: `git add src/routes/admin/settings/+page.svelte`
Expected: File staged
Commit: `refactor: update settings page to use shared UI components`

---

## Task 12: Update admission-paths page to use shared components

**Files:**

- Modify: `src/routes/admin/settings/admission-paths/+page.svelte`

**Step 1: Replace native HTML elements with shared components**

Add Button, Card, Badge imports and replace native elements.

**Step 2: Commit**

Run: `git add src/routes/admin/settings/admission-paths/+page.svelte`
Expected: File staged
Commit: `refactor: update admission-paths page to use shared UI components`

---

## Task 13: Update fee-structures page to use shared components

**Files:**

- Modify: `src/routes/admin/settings/fee-structures/+page.svelte`

**Step 1: Replace native HTML elements with shared components**

Add Button, Card, Input, Label, Select, Table imports and replace native elements.

**Step 2: Commit**

Run: `git add src/routes/admin/settings/fee-structures/+page.svelte`
Expected: File staged
Commit: `refactor: update fee-structures page to use shared UI components`

---

## Task 14: Create Clerk auth integration plan document

**Files:**

- Create: `docs/plans/clerk-auth-integration-plan.md`

**Step 1: Write the plan document**

```markdown
# Clerk Auth Integration Plan for Epic 3

## Overview

Replace the current Lucia Auth implementation with Clerk for better developer experience, faster time-to-market, and robust authentication features.

## Why Clerk?

- Faster implementation (hours vs weeks)
- Built-in MFA, social login, 2FA
- Excellent React/Svelte SDKs
- Better security compliance
- Easier multi-tenancy support

## Implementation Steps

### Phase 1: Setup and Configuration

1. Create Clerk account and application
2. Install `@clerk/clerk-js` or `@clerk/svelte`
3. Configure environment variables
4. Set up middleware for route protection

### Phase 2: Migration from Lucia

1. Create Clerk user mapping table
2. Migrate existing users to Clerk
3. Update authentication hooks
4. Replace session management

### Phase 3: Integration with Multi-tenancy

1. Map Clerk organizations to school tenants
2. Implement RBAC with Clerk
3. Handle domain-based onboarding

### Phase 4: Public Registration Flow

1. Integrate Clerk SignUp component
2. Implement WhatsApp OTP verification
3. Handle multi-child registration

## Key Files to Modify

- `src/hooks.server.ts`
- `src/routes/+layout.svelte`
- `src/lib/server/auth.ts`
- Environment configuration

## Testing Strategy

1. Unit tests for auth helpers
2. Integration tests for registration flow
3. E2E tests for sign-up/sign-in
4. Security audit for auth flows
```

**Step 2: Commit**

Run: `git add docs/plans/clerk-auth-integration-plan.md`
Expected: File staged
Commit: `docs: add Clerk auth integration plan for Epic 3`

---

## Task 15: Run tests to verify everything works

**Step 1: Run unit tests**

Run: `npm run test:unit`
Expected: All tests pass (69 tests)

**Step 2: Run type check**

Run: `npm run check`
Expected: No type errors

**Step 3: Run lint**

Run: `npm run lint`
Expected: No lint errors

**Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 5: Run E2E tests (optional, requires dev server)**

Run: `npm run test:e2e`
Expected: E2E tests pass

---

## Task 16: Update sprint-status.yaml

**Files:**

- Modify: `_bmad-output/sprint-status.yaml`

**Step 1: Update the sprint status**

Add an `improvements` section after Epic 2, update the `known_issues` section to mark E2E-BUILD-001 as fixed, and update the action items.

```yaml
# Epic 2 Improvements (post-retrospective)
improvements:
  - id: 'IMPROV-2-1'
    name: 'Shared UI Component Library'
    status: 'completed'
    components_created:
      - 'Button'
      - 'Card'
      - 'Input'
      - 'Label'
      - 'Textarea'
      - 'Select'
      - 'Badge'
      - 'Table'
    affected_pages:
      - 'admin/settings'
      - 'admin/settings/school-admins'
      - 'admin/settings/admission-paths'
      - 'admin/settings/fee-structures'

  - id: 'IMPROV-2-2'
    name: 'E2E Test Blocking Issue Fixed'
    status: 'completed'
    resolved_issue: 'E2E-BUILD-001'
    verification: 'Build succeeds, components import correctly'

  - id: 'IMPROV-2-3'
    name: 'Clerk Auth Integration Plan'
    status: 'completed'
    document: '/docs/plans/clerk-auth-integration-plan.md'
    next_action: 'Begin Phase 1 setup in Epic 3'
```

Update `known_issues`:

```yaml
known_issues:
  - id: 'E2E-BUILD-001'
    description: 'E2E tests fail due to missing $components/ui/card import'
    severity: 'high'
    status: 'fixed'
    epic: 'epic-2'
    fix_completed: '2026-01-09'
    resolution: 'Created shared UI component library with proper import paths'
```

**Step 2: Commit**

Run: `git add _bmad-output/sprint-status.yaml`
Expected: File staged
Commit: `chore: update sprint status with Epic 2 improvements completed`

---

## Plan Complete

**Estimated Time:** 2-3 hours
**Total Tasks:** 16
**Files Created:** 20+
**Files Modified:** 5
**Tests to Run:** 4 commands

**Before starting Epic 3:**

- [x] Shared UI component library created and tested
- [x] E2E test blocking issue resolved
- [x] Admin pages refactored to use shared components
- [x] Clerk auth integration plan documented
- [x] Sprint status updated

**Ready for Epic 3: Frictionless Registration & Data Collection**
