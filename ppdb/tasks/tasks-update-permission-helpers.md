# Task List: Update Permission Checking Helpers

## Relevant Files

- `src/lib/server/auth/permissions.ts` - Permission definitions and role mapping
- `src/lib/server/auth/audit-logger.ts` - Audit logging implementation
- `src/lib/server/auth/authorization.ts` - Authorization helpers
- `src/lib/server/auth/firebase.ts` - Firebase token verification
- `src/hooks.server.ts` - Session handling
- `src/lib/server/auth/types.ts` - Type definitions
- `src/routes/admin/settings/school-admins/+page.server.ts` - Admin route update
- `src/routes/admin/settings/admission-paths/+page.server.ts` - Admin route update
- `src/routes/admin/settings/fee-structures/+page.server.ts` - Admin route update
- `tests/unit/authorization.test.ts` - Unit tests
- `tests/integration/rbac.test.ts` - Integration tests

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update after completing each sub-task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout new branch (`git checkout -b feature/update-permission-helpers`)

- [ ] 1.0 Define RBAC Permission Matrix
  - [ ] 1.1 Create `src/lib/server/auth/permissions.ts` and define `PERMISSIONS` constants for all categories (Tenant, Admission Paths, Fees, Admin Users, Verification, Scoring, Payments, Reports).
  - [ ] 1.2 Define `ROLE_PERMISSIONS` mapping for all roles (`super_admin`, `school_admin`, `verifier`, `treasurer`, `parent`).
  - [ ] 1.3 Implement helper function `getPermissionsForRole(role: UserRole): string[]`.
  - [ ] 1.4 Implement helper function `hasPermission(role: UserRole, permission: string): boolean`.
  - [ ] 1.5 Create unit test `tests/unit/permissions.test.ts` to verify matrix correctness and helper functions.

- [ ] 2.0 Implement Audit Logging Module
  - [ ] 2.1 Create `src/lib/server/auth/audit-logger.ts`.
  - [ ] 2.2 Implement `logAuthorizationSuccess(actorId, action, details)`.
  - [ ] 2.3 Implement `logAuthorizationFailure(actorId, action, reason)`.
  - [ ] 2.4 Implement `logSensitiveAction(actorId, action, target, details)`.
  - [ ] 2.5 Ensure functions write to `audit_logs` table using `db` instance.

- [ ] 3.0 Implement Firebase Role Mapping & Session Updates
  - [ ] 3.1 Update `src/lib/server/auth/types.ts` to ensure `Session` interface has optional `role?: UserRole`.
  - [ ] 3.2 Update `src/lib/server/auth/firebase.ts`: Define `FirebaseCustomClaims` interface.
  - [ ] 3.3 Update `verifyToken` in `firebase.ts` to extract `role` and `tenantId` from custom claims.
  - [ ] 3.4 Update `src/hooks.server.ts` to populate session role from Firebase token data.
  - [ ] 3.5 Add unit tests for `verifyToken` role extraction in `tests/unit/firebase-auth.test.ts`.

- [ ] 4.0 Enhance Authorization Helpers
  - [ ] 4.1 Update `src/lib/server/auth/authorization.ts` to import `audit-logger` functions.
  - [ ] 4.2 Implement `requirePermission(auth, ...permissions)` with audit logging on failure.
  - [ ] 4.3 Implement `requireAllPermissions(auth, ...permissions)` with audit logging on failure.
  - [ ] 4.4 Implement `requireSuperAdmin(auth)` with audit logging on failure.
  - [ ] 4.5 Update or wrap existing `requireRole` to use permission matrix if applicable (or ensure it logs audits).
  - [ ] 4.6 Create/Update `tests/unit/authorization.test.ts` to test new helpers with mocked auth context.

- [ ] 5.0 Update Admin Routes to use Permissions
  - [ ] 5.1 Update `src/routes/admin/settings/school-admins/+page.server.ts`: Replace role checks with `requirePermission` and add `logSensitiveAction` for `createAdmin`, `assignRole`, `revokeAccess`.
  - [ ] 5.2 Update `src/routes/admin/settings/admission-paths/+page.server.ts`: Replace role checks with `requirePermission` (e.g., `ADMISSION_PATHS_PUBLISH`, `ADMISSION_PATHS_ARCHIVE`) and add `logSensitiveAction`.
  - [ ] 5.3 Update `src/routes/admin/settings/fee-structures/+page.server.ts`: Add `requirePermission` checks for create/update/delete and add `logSensitiveAction`.

- [ ] 6.0 Verify with Comprehensive Testing
  - [ ] 6.1 Create `tests/integration/rbac.test.ts`.
  - [ ] 6.2 Test School Admin accessing own tenant data (success).
  - [ ] 6.3 Test School Admin accessing other tenant data (fail).
  - [ ] 6.4 Test Verifier/Treasurer restricted actions (fail).
  - [ ] 6.5 Verify audit logs are created in DB for failures and sensitive actions.
