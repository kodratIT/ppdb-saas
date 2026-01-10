# Clerk Auth Integration Plan for Epic 3

> **Status:** Planning Document
> **Created:** 2026-01-09
> **Target Epic:** Epic 3 - Frictionless Registration & Data Collection

## Executive Summary

Replace the current Lucia Auth implementation with Clerk for better developer experience, faster time-to-market, and robust authentication features. This plan outlines the migration strategy, implementation phases, and key considerations for integrating Clerk into the PPDB SaaS platform.

## Why Clerk?

| Factor       | Lucia Auth            | Clerk              | Winner |
| ------------ | --------------------- | ------------------ | ------ |
| Setup Time   | 2-3 weeks             | 2-3 hours          | Clerk  |
| MFA/2FA      | Custom implementation | Built-in           | Clerk  |
| Social Login | Manual setup          | 20+ providers      | Clerk  |
| Svelte SDK   | Community maintained  | Official           | Clerk  |
| Compliance   | Manual                | SOC2, GDPR ready   | Clerk  |
| Pricing      | Open source           | Generous free tier | Tie    |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PPDB SaaS V2                             │
├─────────────────────────────────────────────────────────────────┤
│  Public Pages           │  Admin Pages           │  API Routes   │
│  ├─ Landing Page        │  ├─ School Settings    │  ├─ Auth      │
│  ├─ Registration Flow   │  ├─ Admission Paths    │  ├─ Applicants│
│  └─ Login               │  └─ Fee Structures     │  └─ Payments  │
├─────────────────────────────────────────────────────────────────┤
│                     Clerk Authentication                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ User Signs  │  │ Org/School  │  │ Webhook Handlers        │  │
│  │ Up/In       │  │ Management  │  │ (Sync to Database)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                   Supabase (PostgreSQL + RLS)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Tenants     │  │ Applicants  │  │ Audit Logs              │  │
│  │ Settings    │  │ Registrations│  │ Payment Records         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Setup and Configuration

**Goal:** Initialize Clerk and configure environment

**Tasks:**

1. Create Clerk Account and Application
   - Sign up at clerk.com
   - Create new application for PPDB SaaS
   - Configure application settings (name, domain)

2. Install Dependencies

   ```bash
   npm install @clerk/clerk-js
   # or for SvelteKit:
   npm install @clerk/svelte
   ```

3. Configure Environment Variables

   ```env
   # .env
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```

4. Update `svelte.config.js` or `vite.config.ts` for Vite

**Files Modified:**

- `.env`
- `package.json`
- `svelte.config.js` (if needed)

---

### Phase 2: Migration from Lucia Auth

**Goal:** Migrate existing users and replace authentication logic

**Tasks:**

1. Create Clerk User Mapping Table

   ```sql
   -- Migration script for PostgreSQL
   CREATE TABLE clerk_user_mappings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
     tenant_id UUID REFERENCES tenants(id),
     user_email VARCHAR(255) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. Migrate Existing Users
   - Export users from current auth system
   - Create Clerk users via API or Admin API
   - Sync mapping table with Clerk user IDs

3. Update Authentication Hooks

   **Current `src/hooks.server.ts` (Lucia):**

   ```typescript
   // Replace with Clerk middleware
   import { clerkMiddleware, createRouteMatcher } from '@clerk/sveltekit/server';

   export const handle = clerkMiddleware({
   	publicRoutes: ['/', '/register(.*)', '/api/webhooks(.*)']
   });
   ```

4. Replace Session Management

   **Current Lucia approach:**

   ```typescript
   // src/lib/server/auth.ts
   import { Lucia } from 'lucia';
   import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
   ```

   **New Clerk approach:**

   ```typescript
   // Clerk handles sessions automatically
   // Use auth() helper from @clerk/sveltekit/server
   import { auth, currentUser } from '@clerk/sveltekit/server';

   export const load = async ({ locals }) => {
   	const { userId, sessionClaims } = await auth();
   	const user = await currentUser();
   	return { user };
   };
   ```

5. Protect Routes

   **Server-side:**

   ```typescript
   import { redirect } from '@sveltejs/kit';

   export const load = async ({ locals }) => {
   	const { userId } = await auth();
   	if (!userId) {
   		throw redirect(303, '/sign-in');
   	}
   };
   ```

**Files Created/Modified:**

- `src/hooks.server.ts`
- `src/lib/server/auth.ts` (or delete)
- Database migration file

---

### Phase 3: Integration with Multi-tenancy

**Goal:** Map Clerk organizations to school tenants and implement RBAC

**Tasks:**

1. Enable Clerk Organizations
   - Configure in Clerk Dashboard
   - Set organization permissions

2. Create Organization Mapping

   ```typescript
   // src/lib/server/organizations.ts
   import { orgRouter } from '@clerk/sveltekit/server';

   export async function getOrganizationForTenant(tenantId: string) {
   	// Query mapping table
   	// Return Clerk organization ID
   }

   export async function syncTenantToOrganization(tenant: Tenant) {
   	// Create or update Clerk organization
   	// Set organization metadata with tenant ID
   }
   ```

3. Implement RBAC with Clerk

   ```typescript
   // Check user role in organization
   import { auth } from '@clerk/sveltekit/server';

   export async function requireRole(role: 'admin' | 'member') {
   	const { sessionClaims } = await auth();

   	const orgRole = sessionClaims?.org_role;
   	if (orgRole !== role && role === 'admin') {
   		throw redirect(303, '/unauthorized');
   	}
   }
   ```

4. Handle Domain-based Onboarding

   ```typescript
   // Auto-create organization based on email domain
   import { clerkClient } from '@clerk/sveltekit/server';

   export async function handleDomainVerification(email: string) {
   	const domain = email.split('@')[1];
   	// Check if domain matches known tenant
   	// Create organization if needed
   }
   ```

**Files Created/Modified:**

- `src/lib/server/organizations.ts`
- `src/hooks.server.ts`
- Database migration for organization mappings

---

### Phase 4: Public Registration Flow

**Goal:** Integrate Clerk into the public registration wizard

**Tasks:**

1. Integrate Clerk SignUp Component

   ```svelte
   <!-- src/routes/register/+page.svelte -->
   <script>
   	import { SignUp } from '@clerk/svelte';
   </script>

   <SignUp afterSignUpUrl="/register/wizard" signInUrl="/sign-in" />
   ```

2. Implement WhatsApp OTP Verification

   Clerk supports custom verification methods. For WhatsApp:
   - Use Clerk's custom flow or
   - Integrate with WhatsApp Business API separately
   - Store verification status in database

   ```typescript
   // Custom verification flow
   export async function verifyWhatsApp(phone: string, code: string) {
   	// Verify with WhatsApp provider
   	// Update user metadata in Clerk
   }
   ```

3. Handle Multi-child Registration
   - Primary user signs up with Clerk
   - Create applicant records linked to Clerk user ID
   - Link multiple applicants to single user

4. Update Database Schema

   ```sql
   ALTER TABLE applicants
   ADD COLUMN clerk_user_id VARCHAR(255),
   ADD CONSTRAINT fk_clerk_user FOREIGN KEY (clerk_user_id)
     REFERENCES clerk_user_mappings(clerk_user_id);
   ```

**Files Created/Modified:**

- `src/routes/register/+page.svelte`
- `src/routes/register/wizard/+page.svelte`
- Database migration file

---

### Phase 5: Webhook Integration

**Goal:** Handle Clerk webhooks for database synchronization

**Tasks:**

1. Create Webhook Handler

   ```typescript
   // src/routes/api/webhooks/clerk/+server.ts
   import { Webhook } from 'svix';
   import { WEBHOOK_SECRET } from '$env/static/private';

   export const POST = async ({ request }) => {
   	const webhook = new Webhook(WEBHOOK_SECRET);
   	const payload = await request.json();

   	const event = webhook.verify(payload);

   	switch (event.type) {
   		case 'user.created':
   			// Sync to database
   			break;
   		case 'user.updated':
   			// Update in database
   			break;
   		case 'user.deleted':
   			// Remove from database
   			break;
   		case 'organization.created':
   			// Create tenant
   			break;
   	}
   };
   ```

2. Configure Webhooks in Clerk Dashboard
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `organization.created`
   - `organization.updated`

**Files Created:**

- `src/routes/api/webhooks/clerk/+server.ts`

---

## Key Files Reference

| File                                       | Action  | Description            |
| ------------------------------------------ | ------- | ---------------------- |
| `.env`                                     | Modify  | Add Clerk API keys     |
| `src/hooks.server.ts`                      | Replace | Clerk middleware       |
| `src/routes/sign-in/+page.svelte`          | Create  | Sign-in page           |
| `src/routes/sign-up/+page.svelte`          | Create  | Sign-up page           |
| `src/routes/register/+page.svelte`         | Modify  | Registration landing   |
| `src/routes/register/wizard/+page.svelte`  | Modify  | Multi-step wizard      |
| `src/routes/api/webhooks/clerk/+server.ts` | Create  | Webhook handler        |
| `src/lib/server/organizations.ts`          | Create  | Organization utilities |
| Database migrations                        | Create  | Schema updates         |

## Testing Strategy

### Unit Tests

- Auth helper functions
- Role checking utilities
- Organization mapping logic

### Integration Tests

- Sign-up flow
- Sign-in flow
- Session management
- Webhook processing

### E2E Tests

- Complete registration flow
- Admin dashboard access
- Role-based access control

### Security Tests

- Token validation
- Session hijacking prevention
- RBAC bypass attempts

## Rollback Plan

1. Keep Lucia Auth code in separate branch
2. Feature flag for Clerk vs Lucia
3. Database migration for user mappings is reversible
4. Backup Clerk configuration

## Estimated Timeline

| Phase                  | Effort        | Duration    |
| ---------------------- | ------------- | ----------- |
| Phase 1: Setup         | 1 day         | 1 day       |
| Phase 2: Migration     | 2-3 days      | 3 days      |
| Phase 3: Multi-tenancy | 2 days        | 2 days      |
| Phase 4: Registration  | 3-4 days      | 4 days      |
| Phase 5: Webhooks      | 1 day         | 1 day       |
| **Total**              | **9-11 days** | **11 days** |

## Dependencies

- Clerk account (free tier sufficient for development)
- SvelteKit 2.x
- Node.js 18+
- Supabase/PostgreSQL database access

## Next Steps

1. Review and approve this plan
2. Create Clerk account
3. Begin Phase 1: Setup and Configuration
4. Set up development environment variables
5. Run initial integration tests

---

**Document Version:** 1.0
**Last Updated:** 2026-01-09
**Author:** Epic 2 Retrospective
