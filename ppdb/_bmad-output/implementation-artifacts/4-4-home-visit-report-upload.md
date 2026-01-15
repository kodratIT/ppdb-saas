# Story 4.4: Home Visit Report Upload

Status: ready-for-dev

## Story

As a Field Officer,
I want to upload survey photos and reports for scholarship candidates,
so that the committee has evidence for decision making.

## Acceptance Criteria

1. **Candidate Flagging**: Candidates can be flagged for "Home Visit" (handled by Admin).
2. **Mobile Upload**: Field Officers can upload multiple photos (house exterior, interior, etc.) via mobile device.
3. **Condition Form**: Field Officers can fill out a structured form regarding house conditions (roof, floor, walls).
4. **GPS Tagging**: (Optional) Record GPS coordinates at the time of report submission for location verification.
5. **Secure Storage**: Photos and reports are stored securely and only accessible by authorized admins/verifiers.
6. **Integration**: The report is attached to the candidate's profile and visible in the verification dashboard.

## Tasks / Subtasks

- [ ] **Database Schema** (AC: #5)
  - [ ] Add `field_officer` role to `userRoleEnum`.
  - [ ] Create `home_visit_reports` table.
  - [ ] Create `home_visit_photos` table.
- [ ] **Domain Logic** (AC: #3, #4, #5)
  - [ ] Create `src/lib/server/domain/home-visit/index.ts`.
  - [ ] Implement `submitHomeVisitReport` with JSON data and photo links.
  - [ ] Implement `getHomeVisitReportByApplication`.
- [ ] **UI Implementation** (AC: #2, #3)
  - [ ] Create `src/routes/[tenant]/admin/home-visit/[applicationId]/+page.svelte` (Field Officer View).
  - [ ] Implement mobile-friendly photo uploader with compression.
- [ ] **Admin Integration** (AC: #6)
  - [ ] Update `src/routes/[tenant]/admin/verify/[applicationId]/+page.svelte` to display Home Visit reports.
- [ ] **Testing**
  - [ ] Unit tests for report submission logic.

## Dev Notes

- Use `JSONB` for `survey_data` in `home_visit_reports` to allow flexibility.
- Use `shadcn-svelte` for UI components.
- Integrate with existing `audit_logs` for any status changes.

## Dev Agent Record

### Agent Model Used
Gemini-3-Flash-Preview

### Completion Notes List
- [2026-01-14] Created story document based on brainstorming.
