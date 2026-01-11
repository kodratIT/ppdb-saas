# RBAC Permissions & Authorization

Complete guide to Role-Based Access Control (RBAC) in PPDB SAAS.

## User Roles

| Role           | Count    | Auth Method | Description                                  |
| -------------- | -------- | ----------- | -------------------------------------------- |
| `super_admin`  | ~50      | Firebase    | Global platform admin, no tenant restriction |
| `school_admin` | ~100     | Firebase    | Full tenant admin access                     |
| `verifier`     | ~50      | Firebase    | Verification and scoring access              |
| `treasurer`    | ~31      | Firebase    | Financial operations access                  |
| `parent`       | ~10,000+ | WAHA OTP    | Self-service access (own applications only)  |

## Permission Matrix

### Permission Categories

1. **Tenant Management** - `super_admin` only
   - `manage_tenants`
   - `view_all_tenants`

2. **Admission Paths** - `school_admin`, `verifier`
   - `manage_admission_paths`
   - `view_admission_paths`

3. **Fee Structures** - `school_admin`, `treasurer`
   - `manage_fee_structures`
   - `view_fee_structures`

4. **School Admin Management** - `school_admin` only
   - `manage_school_admins`
   - `assign_roles`

5. **Verification** - `verifier`, `school_admin`
   - `verify_applications`
   - `view_applicant_documents`

6. **Scoring** - `verifier`, `school_admin`
   - `score_applications`
   - `conduct_interviews`

7. **Payments** - `treasurer`, `school_admin`
   - `verify_payments`
   - `manage_invoices`

8. **Reports** - All roles (filtered by context)
   - `view_reports`
   - `export_data`

## Authorization Helpers

Location: `src/lib/server/auth/authorization.ts`

### requireAuth()

Validates session and returns authenticated user.

```typescript
import { requireAuth } from '$lib/server/auth/authorization';

export const load = async ({ locals }) => {
	const session = await requireAuth(locals);
	// session.userId, session.role, session.tenantId available
};
```

### requireRole()

Requires specific role.

```typescript
import { requireRole } from '$lib/server/auth/authorization';

export const actions = {
	default: async ({ locals }) => {
		await requireRole(locals, 'school_admin');
		// Only school_admin can proceed
	}
};
```

### requirePermission()

Requires specific permission.

```typescript
import { requirePermission } from '$lib/server/auth/authorization';

export const load = async ({ locals }) => {
	await requirePermission(locals, 'manage_admission_paths');
	// User must have permission
};
```

### requireAllPermissions()

Requires ALL specified permissions.

```typescript
import { requireAllPermissions } from '$lib/server/auth/authorization';

export const actions = {
	create: async ({ locals }) => {
		await requireAllPermissions(locals, ['manage_admission_paths', 'manage_fee_structures']);
	}
};
```

### requireSuperAdmin()

Requires super_admin role.

```typescript
import { requireSuperAdmin } from '$lib/server/auth/authorization';

export const load = async ({ locals }) => {
	await requireSuperAdmin(locals);
	// Only super_admin can access
};
```

### requireTenantMatch()

Validates tenant context.

```typescript
import { requireTenantMatch } from '$lib/server/auth/authorization';

export const actions = {
	update: async ({ locals, params }) => {
		await requireTenantMatch(locals, params.tenantId);
		// Ensures user belongs to tenant
	}
};
```

## Usage Examples

### Server Load Function

```typescript
// src/routes/admin/settings/+page.server.ts
import { requireRole } from '$lib/server/auth/authorization';

export const load = async ({ locals }) => {
	await requireRole(locals, 'school_admin');

	return {
		// Protected data
	};
};
```

### Form Action

```typescript
// src/routes/admin/admissions/+page.server.ts
import { requirePermission } from '$lib/server/auth/authorization';

export const actions = {
	create: async ({ request, locals }) => {
		await requirePermission(locals, 'manage_admission_paths');

		const data = await request.formData();
		// Create admission path
	}
};
```

### API Endpoint

```typescript
// src/routes/api/verify/+server.ts
import { requireAllPermissions } from '$lib/server/auth/authorization';
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	await requireAllPermissions(locals, ['verify_applications', 'view_applicant_documents']);

	const body = await request.json();
	// Verify application

	return json({ success: true });
};
```

## Error Handling

Authorization failures throw errors with HTTP status codes:

```typescript
try {
	await requireRole(locals, 'school_admin');
} catch (error) {
	// 401 Unauthorized - No valid session
	// 403 Forbidden - Insufficient permissions
	// Automatically logged to audit trail
}
```

## Audit Logging

All authorization failures are automatically logged:

```typescript
// Logged automatically:
// - User ID
// - Attempted action
// - Required permission
// - Timestamp
// - Tenant context
```

See [Audit Logging](./audit-logging.md) for details.

## Best Practices

1. **Always use authorization helpers** - Don't check roles/permissions manually
2. **Check at route level** - Verify in `+page.server.ts` load functions
3. **Check in actions** - Verify in form actions before mutations
4. **Use specific permissions** - Prefer `requirePermission()` over `requireRole()`
5. **Tenant validation** - Always use `requireTenantMatch()` for tenant-specific data

---

**Related:** [Session Management](./session-management.md) | [Audit Logging](./audit-logging.md)
