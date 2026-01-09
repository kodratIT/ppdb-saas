# Story 1.1: Project Setup & Starter Architecture

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want to initialize the SvelteKit project with the approved Hybrid SaaS Foundation stack,
so that the development team has a consistent, production-ready environment to build upon.

## Acceptance Criteria

1. **Project Initialization**
   - [x] Initialize SvelteKit project in current directory using `npx -y create-svelte@latest .`
   - [x] Select options: Skeleton project, TypeScript syntax, Add ESLint, Add Prettier, Add Playwright, Add Vitest.
   - [x] Initialize git if not already present (current dir is a sub-folder of a repo, so just ensure `.gitignore` is correct).

2. **Dependency Installation**
   - [x] Install Core Dependencies:
     - `drizzle-orm` (ORM)
     - `@neondatabase/serverless` (DB Driver)
     - `lucia` (Auth Core)
     - `@lucia-auth/adapter-drizzle` (Auth Adapter)
     - `zod` (Validation)
   - [x] Install Dev Dependencies:
     - `drizzle-kit` (Migrations)
     - `tailwindcss`, `postcss`, `autoprefixer`
     - `bits-ui` (for Shadcn underlying)
     - `clsx`, `tailwind-merge` (Utils)

3. **Cloudflare & Environment Configuration**
   - [x] Create/Update `wrangler.jsonc` for Cloudflare Workers configuration.
   - [x] Ensure compatibility nodejs_compat flag is set if needed.

4. **Design System Setup**
   - [x] Configure Tailwind CSS (`tailwind.config.ts`) with Design System tokens:
     - Primary Color: `#002C5F`
     - Border Radius: `1rem`
   - [x] Set up Shadcn-compatible `components.json`.

5. **Project Structure Enforcement**
   - [x] Create directory structure strictly matching Architecture:
     - `src/lib/server/domain/`
     - `src/lib/server/infra/`
     - `src/lib/server/tenant/`
     - `src/lib/server/db/`
     - `src/lib/schema/`
     - `src/lib/components/ui/`
     - `src/lib/components/shared/`

6. **CI/CD Skeleton**
   - [x] Create `.github/workflows` directory.
   - [x] Add basic CI pipeline (build & lint check).

## Tasks / Subtasks

- [x] Task 1: Initialize SvelteKit Project (AC: 1)
  - [x] Run create-svelte command
  - [x] Configure `svelte.config.js` with adapter-cloudflare
  - [x] Update `.gitignore`

- [x] Task 2: Install and Configure Stack (AC: 2, 3)
  - [x] npm install core dependencies
  - [x] npm install dev dependencies
  - [x] Configure `wrangler.jsonc`

- [x] Task 3: Setup Design System (AC: 4)
  - [x] Initialize Tailwind CSS
  - [x] Configure `tailwind.config.ts` with custom colors/radius
  - [x] Initialize Shadcn (if CLI available) or manual setup of `utils.ts` (cn helper)

- [x] Task 4: Enforce Architecture Structure (AC: 5)
  - [x] Create all required directories
  - [x] Add `.gitkeep` if empty to ensure git tracking

- [x] Task 5: Setup CI/CD (AC: 6)
  - [x] Create `.github/workflows/ci.yml`

## Dev Notes

### Architecture Compliance

- **Stack**: Hybrid SaaS Foundation (SvelteKit + Drizzle + Lucia).
- **Runtime**: Cloudflare Workers (Edge). **CRITICAL**: Use `@neondatabase/serverless` for DB connection (HTTP-based) to support high concurrency.
- **Styling**: Tailwind CSS is mandatory.

### Project Structure Notes

- **Strict Separation**:
  - `domain/`: Complex business logic.
  - `infra/`: External APIs (Payment, WA).
  - `tenant/`: Tenant resolution logic.
- **Naming**: `snake_case` for DB, `kebab-case` for Routes, `PascalCase` for Components.

### Technical Requirements

- **TypeScript**: Strict mode enabled.
- **Validation**: Zod schemas in `src/lib/schema/` are the single source of truth.

### References

- Architecture Document: `_bmad-output/planning-artifacts/architecture.md` (Sections: "Starter Template Evaluation", "Project Structure & Boundaries")
- Epics Document: `_bmad-output/planning-artifacts/epics.md` (Story 1.1)

## Dev Agent Record

### Agent Model Used

- BMM-Dev (SvelteKit Specialist)
- BMM-Reviewer (Auto-Fix)

### Completion Notes List

- [x] Validated SvelteKit version
- [x] Verified directory structure matches architecture
- [x] Confirmed dependencies versions
- [x] Added missing drizzle.config.ts
- [x] Synced git tracking

## File List

- package.json
- svelte.config.js
- wrangler.jsonc
- tailwind.config.ts
- postcss.config.js
- vitest.config.ts
- playwright.config.ts
- tsconfig.json
- vite.config.ts
- eslint.config.js
- drizzle.config.ts
- components.json
- src/app.css
- src/app.html
- src/lib/utils.ts
- src/lib/sanity.test.ts
- src/routes/+layout.svelte
- .github/workflows/ci.yml
- tests/bootstrapping/check-init.js
- src/lib/server/domain/.gitkeep
- src/lib/server/infra/.gitkeep
- src/lib/server/tenant/.gitkeep
- src/lib/server/db/.gitkeep
- src/lib/schema/.gitkeep
- src/lib/components/ui/.gitkeep
- src/lib/components/shared/.gitkeep

## Change Log

- Initialized SvelteKit project with Skeleton template and TypeScript
- Configured Tailwind CSS and Shadcn utils
- Installed core dependencies (Drizzle, Lucia, Neon, Zod)
- Configured Cloudflare adapter and wrangler.jsonc
- Created enforced architecture directory structure
- Added CI/CD pipeline
- Fixed Tailwind v4 configuration (added @tailwindcss/postcss)
- Added sanity unit test
- Verified all tests pass
