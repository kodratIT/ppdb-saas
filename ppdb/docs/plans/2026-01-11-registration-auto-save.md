# Registration Auto-Save Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a robust auto-save mechanism for the registration wizard with debouncing and optimistic concurrency (conflict handling).

**Architecture:** Use a Svelte 5 layout wrapper to monitor the reactive store changes, trigger debounced API calls, and manage sync states (saving, success, conflict).

**Tech Stack:** Svelte 5 ($state, $effect), SvelteKit, Fetch API.

### Task 1: Create the Form Layout Wrapper

**Files:**

- Create: `src/routes/[tenant]/register/form/+layout.svelte`

**Step 1: Implement Layout logic**

- Receive `data` from `+layout.server.ts` (needs to be created or updated).
- Initialize `draftStore`.
- Implement `saveDraft` function with version check.
- Add `$effect` with 1.5s debounce.

**Step 2: Implement UI Shell**

- Move the progress bar and common UI elements from step pages to this layout.
- Add Sync Status indicator.

### Task 2: Refactor Step Pages

**Files:**

- Modify: `src/routes/[tenant]/register/form/step-1/+page.svelte`
- Modify: `src/routes/[tenant]/register/form/step-2/+page.svelte`
- Modify: `src/routes/[tenant]/register/form/step-3/+page.svelte`
- Modify: `src/routes/[tenant]/register/form/step-4/+page.svelte`

**Step 1: Use store from layout**

- Remove local `createFormDraft`.
- Bind inputs directly to the shared store.

### Task 3: Handle Conflicts

**Files:**

- Modify: `src/routes/[tenant]/register/form/+layout.svelte`

**Step 1: Add Conflict Alert**

- Show "Data has been updated on another device" if API returns 409.
- Provide a refresh button.

### Task 4: Verification

**Step 1: Manual Test**

- Change data, wait for "Tersimpan".
- Simulate conflict by manually updating version in DB or via console.
- Verify indicator shows "Conflict".
