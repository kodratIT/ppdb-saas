## Relevant Files
- `ppdb/src/routes/admin/subscription/packages/[id]/+page.server.ts` - Backend: Load details, handle Save/Version logic.
- `ppdb/src/routes/admin/subscription/packages/[id]/+page.svelte` - Frontend: Editor UI (Form).
- `ppdb/src/routes/admin/subscription/packages/new/+page.server.ts` - Backend: Handle Create and Copy logic.
- `ppdb/src/lib/config/package-features.ts` - New file: Standard Feature Dictionary.

### Notes
- We are implementing a shared form strategy or similar UI for both `/new` and `/[id]`.
- The logic for `versioning` (grandfathering) is critical in `[id]/+page.server.ts`.

## Instructions for Completing Tasks
**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update after completing each sub-task.

## Tasks

- [x] 0.0 Create feature branch
- [x] 1.0 Infrastructure: Feature Dictionary
- [ ] 2.0 Backend: Edit Logic & Versioning
- [ ] 3.0 Frontend: Package Editor UI
- [ ] 4.0 Feature: Duplicate/Copy Logic
- [ ] 5.0 Verification & Polish
