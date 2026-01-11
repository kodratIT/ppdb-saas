# Epic 3 Integration Guide

Guide for integrating authentication into Epic 3 (Frictionless Registration & Data Collection).

## Overview

Epic 3 implements public-facing registration with WAHA WhatsApp OTP authentication for parents. This guide shows how to integrate with the auth system.

## Parent Authentication Flow

### 1. Public Landing Page

No authentication required for landing page.

```typescript
// src/routes/[tenant]/register/+page.svelte
<script>
	// Public page - no auth required
	// Show school info, admission paths
</script>
```

### 2. Registration Initiation

Request OTP when parent starts registration.

```typescript
// src/routes/[tenant]/register/start/+page.server.ts
import { sendOTP } from '$lib/server/whatsapp/providers/waha';

export const actions = {
	requestOTP: async ({ request, params }) => {
		const data = await request.formData();
		const phoneNumber = data.get('phone');

		// Send OTP via WAHA
		await sendOTP(phoneNumber, params.tenant);

		return { otpSent: true };
	}
};
```

### 3. OTP Verification

Verify OTP and create session.

```typescript
// src/routes/[tenant]/register/verify/+page.server.ts
import { verifyOTP } from '$lib/server/auth/session';

export const actions = {
	verifyOTP: async ({ request, params, cookies }) => {
		const data = await request.formData();
		const phoneNumber = data.get('phone');
		const otp = data.get('otp');

		// Verify OTP and create session
		const session = await verifyOTP(phoneNumber, otp, params.tenant);

		// Set session cookie
		cookies.set('session_id', session.id, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		return { verified: true };
	}
};
```

### 4. Multi-Step Form with Session

Validate session for each step.

```typescript
// src/routes/[tenant]/register/form/step-1/+page.server.ts
import { requireAuth, requireRole } from '$lib/server/auth/authorization';

export const load = async ({ locals }) => {
	// Require authenticated parent
	const session = await requireAuth(locals);
	await requireRole(locals, 'parent');

	// Load draft data if exists
	return {
		userId: session.userId,
		tenantId: session.tenantId
	};
};

export const actions = {
	saveStep: async ({ request, locals }) => {
		await requireAuth(locals);

		const data = await request.formData();
		// Save draft with auto-save
	}
};
```

## Permission Patterns

### Parent Role Permissions

Parents have restricted access:

```typescript
// ✅ Allowed
- View own applications
- Create new applications
- Update own draft applications
- Upload documents for own applications
- View application status

// ❌ Not Allowed
- View other users' applications
- Manage school settings
- Access admin dashboard
- Verify applications
- Manage payments
```

### Permission Checking

```typescript
// Check if user owns the application
import { requireTenantMatch } from '$lib/server/auth/authorization';

export const load = async ({ locals, params }) => {
	const session = await requireAuth(locals);

	// Ensure application belongs to user
	const application = await db.query.applications.findFirst({
		where: and(
			eq(applications.id, params.applicationId),
			eq(applications.userId, session.userId),
			eq(applications.tenantId, session.tenantId)
		)
	});

	if (!application) {
		throw error(403, 'Access denied');
	}

	return { application };
};
```

## Session Persistence

### Auto-Save with Session

```typescript
// Auto-save draft every 30 seconds
<script>
	import { onMount } from 'svelte';

	let formData = $state({});

	onMount(() => {
		const interval = setInterval(async () => {
			await fetch('/api/drafts/save', {
				method: 'POST',
				body: JSON.stringify(formData),
				credentials: 'include' // Include session cookie
			});
		}, 30000);

		return () => clearInterval(interval);
	});
</script>
```

### Session Validation

Session is automatically validated in middleware (`src/hooks.server.ts`):

```typescript
// Automatic session validation
// locals.session available in all server functions
// Expires after 7 days of inactivity
```

## Role-Based UI

### Conditional Rendering

```svelte
<!-- Show different UI based on role -->
<script>
	import { page } from '$app/stores';

	$: session = $page.data.session;
	$: isParent = session?.role === 'parent';
	$: isAdmin = ['school_admin', 'verifier', 'treasurer'].includes(session?.role);
</script>

{#if isParent}
	<!-- Parent view -->
	<div>Your Applications</div>
{/if}

{#if isAdmin}
	<!-- Admin view -->
	<div>Admin Dashboard</div>
{/if}
```

## Tenant Context

### Automatic Tenant Inheritance

Tenant is automatically determined from subdomain:

```
https://schoolname.ppdb.com/register
         ↓
   tenantId = 'schoolname'
```

All sessions are bound to tenant:

```typescript
// Session automatically includes tenantId
const session = await requireAuth(locals);
session.tenantId; // Matches subdomain
```

### Tenant Validation

Always validate tenant match:

```typescript
import { requireTenantMatch } from '$lib/server/auth/authorization';

export const load = async ({ locals, params }) => {
	// Ensure session tenant matches URL tenant
	await requireTenantMatch(locals, params.tenant);
};
```

## Common Patterns

### 1. Draft Save with Session

```typescript
export const actions = {
	saveDraft: async ({ request, locals }) => {
		const session = await requireAuth(locals);
		const data = await request.formData();

		await db.insert(applicationDrafts).values({
			userId: session.userId,
			tenantId: session.tenantId,
			data: JSON.stringify(Object.fromEntries(data))
		});
	}
};
```

### 2. Document Upload with Ownership

```typescript
export const actions = {
	uploadDocument: async ({ request, locals, params }) => {
		const session = await requireAuth(locals);

		// Verify application ownership
		const application = await db.query.applications.findFirst({
			where: and(eq(applications.id, params.applicationId), eq(applications.userId, session.userId))
		});

		if (!application) {
			throw error(403, 'Not your application');
		}

		// Upload document
	}
};
```

### 3. Finalization via WhatsApp

```typescript
export const actions = {
	finalize: async ({ request, locals }) => {
		const session = await requireAuth(locals);
		await requireRole(locals, 'parent');

		// Send final confirmation via WAHA
		await sendConfirmation(session.phoneNumber, applicationId);
	}
};
```

## Testing Epic 3 with Auth

### Test Fixtures

```typescript
// tests/e2e/fixtures.ts
export const parentUser = {
	phoneNumber: '+6281234567890',
	role: 'parent',
	tenantId: 'test-school'
};

// Create test session
const session = await createTestSession(parentUser);
```

### E2E Tests

```typescript
// tests/e2e/registration.test.ts
import { test, expect } from '@playwright/test';

test('parent can register and create application', async ({ page }) => {
	// Request OTP
	await page.goto('/test-school/register');
	await page.fill('[name=phone]', '+6281234567890');
	await page.click('button:text("Send OTP")');

	// Verify OTP
	await page.fill('[name=otp]', '123456');
	await page.click('button:text("Verify")');

	// Should be logged in
	await expect(page).toHaveURL('/test-school/register/form/step-1');
});
```

## Error Handling

### Common Errors

```typescript
// 401 Unauthorized - No session
// Redirect to /register

// 403 Forbidden - Wrong role or tenant
// Show error message

// Session expired
// Redirect to /register with message
```

### Error Recovery

```svelte
<script>
	import { goto } from '$app/navigation';

	async function handleSave() {
		try {
			await saveDraft();
		} catch (error) {
			if (error.status === 401) {
				// Session expired, redirect to login
				goto('/register?expired=true');
			}
		}
	}
</script>
```

## Security Best Practices

1. ✅ **Always validate session** - Use `requireAuth()` in all protected routes
2. ✅ **Check ownership** - Verify user owns the resource
3. ✅ **Validate tenant** - Use `requireTenantMatch()` for tenant-specific data
4. ✅ **Use HTTPS** - Session cookies are httpOnly and secure
5. ✅ **Rate limiting** - Implement on OTP endpoints
6. ✅ **OTP expiration** - OTPs expire after 5 minutes

## Quick Reference

```typescript
// Parent registration flow
1. Request OTP → sendOTP(phoneNumber, tenantId)
2. Verify OTP → verifyOTP(phoneNumber, otp, tenantId)
3. Set session cookie → cookies.set('session_id', session.id)
4. Validate session → requireAuth(locals)
5. Check role → requireRole(locals, 'parent')
6. Validate ownership → Check userId matches
7. Save data → Bind to session.userId and session.tenantId
```

---

**Related:** [WAHA OTP Integration](./waha-otp-integration.md) | [Session Management](./session-management.md)
