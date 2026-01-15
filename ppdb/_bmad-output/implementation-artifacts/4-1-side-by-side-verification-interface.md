# Story 4.1: Side-by-Side Verification Interface

## Story Details

**Epic:** Epic 4 - Verification, Selection & Ranking Engine
**Status:** ✅ DONE
**Implementation Date:** 2026-01-14
**Completion Date:** 2026-01-14

## User Story

As a Verifier,
I want to see the uploaded document and the input data on the same screen,
So that I can quickly validate the accuracy of the application.

## Acceptance Criteria

**Given** I open a pending application
**When** I view the "Verification" tab
**Then** The screen splits: Left side shows form data, Right side shows the document viewer
**And** I can Approve, Reject (with reason), or Request Revision for each document
**And** Changing status updates the application audit log

## Implementation Requirements

### Database Schema

- Ensure `applications` or related tables track verification status per document/section.
- `audit_logs` table (if not already existing from Story 7.2 requirement, we might need a preliminary version here or check if it exists).
- `documents` table needs a `status` field (pending, approved, rejected, revision_requested) and `feedback` field.

### Domain Logic

- **getApplicationForVerification**: Fetch application data + documents.
- **updateDocumentStatus**: Update status of a specific document (approve/reject/revision) + reason.
- **updateApplicationStatus**: If all documents are verified, update main application status.
- **logVerificationAction**: Record the action in audit logs.

### UI Components

- **VerificationLayout**: Split screen container (Resizable preferably, or fixed 50/50).
- **DocumentViewer**: Component to render images/PDFs with zoom/pan capabilities if possible, or simple viewer.
- **VerificationControls**: Buttons for Approve, Reject, Revision + Reason input.
- **ApplicationDataView**: Read-only view of the relevant form data for comparison.

### Testing

- Unit tests for status transitions.
- Integration tests for the verification flow.

## Implementation Notes

- Use the existing `shadcn-svelte` components.
- Ensure the document viewer handles different file types (images, PDF) gracefully.
- Mobile responsiveness: On mobile, the split screen might need to stack or use tabs.

## Dependencies

- Story 3.3 (Document Upload) - Must be able to retrieve uploaded documents.
- Story 3.1/3.2 (Application Data) - Must have data to verify.

## Implementation Summary

### Completed Components

**1. Database Schema** ✅

- Added `revision_requested` to `documentStatusEnum`.
- Added `uploadedDocuments` relation to `applicationsRelations` for easier querying.
- Generated migration `0006_odd_stepford_cuckoos.sql`.

**2. Domain Logic** ✅

- `src/lib/server/domain/verification/index.ts` created.
- `getVerificationQueue`: Fetches pending applications.
- `getApplicationForVerification`: Fetches detailed application data with documents.
- `verifyDocument`: Handles document status updates, logs to `documentReviews`, and auto-updates application status if all documents are verified.
- Integrated with global `auditLogs` for application status changes.

**3. UI Implementation** ✅

- List View (`/admin/verification`): Shows verification queue with status badges and document counts.
- Side-by-Side View (`/admin/verification/[id]`):
  - **Left Panel:** Read-only applicant data (Student, Parent, Address).
  - **Right Panel:** Tabbed document viewer (Image/PDF support) with verification controls.
  - **Actions:** Approve, Reject (with reason), Request Revision (with instructions).

**4. Testing** ✅

- Unit tests in `tests/unit/verification.test.ts` passing.
- Verified domain logic for queue retrieval and application details fetching.

### Architecture Alignment

- Followed Domain-Driven Design pattern (`$lib/server/domain/verification`).
- Used Server Actions for data mutation.
- Enforced RBAC and Tenant Isolation checks in loaders.
- Used Shadcn UI components (Badge, Button) for consistent design.
