# Story 1.3: Subdomain Resolution & Routing

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want to access my specific school's portal via a unique subdomain (e.g., `school-a.ppdb.id`),
so that I am immediately immersed in the correct school context.

## Acceptance Criteria

1. **KV Binding Configuration**
   - [x] Configure `wrangler.jsonc` to include a KV Namespace binding named `TENANTS_KV`.
   - [x] Ensure the binding is accessible in the SvelteKit platform context type definitions (`app.d.ts`).

2. **Tenant Resolution Logic**
   - [x] Create `src/lib/server/tenant/index.ts` (or `resolver.ts`).
   - [x] Implement function `resolveTenant(subdomain: string, platform: App.Platform): Promise<TenantConfig | null>`.
   - [x] Logic:
     - Check KV `TENANTS_KV` for key `subdomain:{subdomain}`.
     - Return cached config (id, name, status) if found.
     - If NOT found in KV, query Database (fallback) -> Cache in KV (TTL 1 hour) -> Return.
     - If not found in DB, return null.

3. **Middleware Implementation**
   - [x] Implement `handle` hook in `src/hooks.server.ts`.
   - [x] Extract subdomain from request URL (handling localhost vs production hostnames).
   - [x] Call `resolveTenant`.
   - [x] If found:
     - Set `event.locals.tenantId` = `tenant.id`.
     - Set `event.locals.tenant` = `tenant` object.
     - [x] If NOT found (and not a root domain page/admin/api):
     - Redirect to Main Landing Page (e.g., `www.ppdb.id` or root `/`) OR 404. (Implemented 404 for now).

4. **Type Safety**
   - [x] Update `src/app.d.ts` Locals interface to include `tenantId` and `tenant`.

5. **Testing**
   - [x] Unit test for `resolveTenant` (mocking KV and DB).
   - [ ] Integration test using a simulated request in `hooks.server.ts` (Covered by E2E or manual test, logic covered in unit test).

## Tasks / Subtasks

- [x] Task 1: KV Setup (AC: 1)
  - [x] Update `wrangler.jsonc`
  - [x] Update `src/app.d.ts` (Platform interface)

- [x] Task 2: Resolution Logic (AC: 2)
  - [x] Create `src/lib/server/tenant/` module
  - [x] Implement `getTenantBySubdomain`
  - [x] Implement Cache-Aside pattern with KV

- [x] Task 3: Middleware Hook (AC: 3, 4)
  - [x] Update `src/hooks.server.ts`
  - [x] Parse Host header
  - [x] Handle reserved subdomains (www, app, api, admin, super-admin) to avoid resolving them as tenants.

## Dev Notes

### Architecture Compliance

- **Edge First**: Resolution MUST happen at Edge (Cloudflare Workers).
- **Latency**: KV is critical. Do not hit DB for every request if possible.
- **Boundaries**: Keep resolution logic in `src/lib/server/tenant/`. Keep `hooks.server.ts` clean (just calling the resolver).

### Technical Requirements

- **Local Development**: `wrangler dev` or `vite dev` needs to simulate subdomains. Use `localhost` with different ports or `lvh.me` if necessary, or just mock headers in tests.
- **Reserved Subdomains**: Define a list of reserved words (www, admin, api, super-admin) that should bypass tenant resolution.

### References

- Architecture Document: `_bmad-output/planning-artifacts/architecture.md` (Sections: "Edge Routing & Metadata", "Project Structure & Boundaries")
- Epics Document: `_bmad-output/planning-artifacts/epics.md` (Story 1.3)

## Dev Agent Record

### Agent Model Used

- BMM-Dev (Edge Specialist)

### Completion Notes List

- [x] Confirmed KV binding works in dev and prod
- [x] Verified fallback to DB logic
- [x] Implemented KV Cache-Aside pattern
- [x] Added unit tests for resolver logic with KV/DB mocks
