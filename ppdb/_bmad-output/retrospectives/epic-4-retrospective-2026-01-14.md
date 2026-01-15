# Epic 4 Retrospective: Verification, Selection & Ranking Engine

**Retrospective Date:** January 14, 2026
**Epic Status:** ✅ COMPLETED
**Stories Completed:** 4/4 (4.1, 4.2, 4.3, 4.4)

---

## 1. What Went Well ✅

### Complex Domain Logic & TDD
- **Automated Ranking Engine (4.3)** was implemented with a robust TDD approach.
- The `getDraftRanking` service successfully handles complex tie-breaking rules:
  1. Score (Highest first)
  2. Distance (Closest first)
  3. Age (Older first)
  4. Submission Time (Earlier first)
- Integration tests in `tests/integration/ranking/ranking-service.test.ts` provide confidence in the fairness of the system.

### UX Improvements for Admin Operations
- **Side-by-Side Verification (4.1)** significantly improved the workflow for verifying documents.
- **Scoring Dashboard (4.2)** provided a clear separation of concerns between "Verification" and "Scoring/Interview".
- **Mobile-First Home Visit (4.4)** enabled field officers to work directly from location with GPS tagging and photo uploads.

### Database Integrity & Security
- **Strict Schema Constraints**: `application_scores` enforces one score per application per tenant via `UNIQUE` constraints.
- **Audit Logging**: All critical actions (Verification, Scoring Finalization, Home Visit) are integrated with the audit log system.
- **Role-Based Access**: Clear separation of `verifier`, `interviewer`, and `field_officer` roles.

### Feature Completeness
- ✅ **Verification**: Full cycle (Approve/Reject/Request Revision) with reason tracking.
- ✅ **Scoring**: 0-100 scale with qualitative notes and "Finalize" locking mechanism.
- ✅ **Ranking**: Dynamic calculation based on live data, no stale "rank" columns in the application table.
- ✅ **Home Visit**: Field report digitisation with evidence (photos + GPS).

---

## 2. Challenges & Lessons Learned ⚠️

### Svelte 5 Runes Adoption
- **Challenge:** Managing complex state in the Side-by-Side verification UI (tabs, splits) required careful usage of `$state` and `$derived`.
- **Lesson:** Explicit state management with Runes makes the data flow clearer compared to Svelte 4 stores, especially for "computed" values like `selectedDocument`.

### Mobile Upload UX
- **Challenge:** Handling file previews and base64 conversion for Home Visit reports on mobile devices.
- **Resolution:** Implemented client-side preview generation and compression (planned/basic implementation) to ensure smooth UX before upload.

### Data Consistency
- **Decision:** We chose *not* to store `totalScore` or `rank` permanently in the `applications` table to avoid de-synchronization.
- **Outcome:** Ranking is always calculated on-the-fly (`getDraftRanking`), ensuring it's always up-to-date with the latest scores and data corrections.

---

## 3. Improvements for Epic 5 (Payments) 🎯

- **External Integrations:** Epic 5 involves 3rd party Payment Gateways (Xendit/Midtrans). We need to pay extra attention to **Webhook Security** and **Idempotency**.
- **State Machines:** Payment status transitions (Pending -> Paid | Expired | Failed) are critical. We should use strict state machine logic.
- **Testing:** Mocking external API calls will be crucial for TDD in Epic 5.

---

## 4. Artifacts Summary

| Story | Key Artifacts | Status |
|-------|---------------|--------|
| **4.1** | `src/routes/[tenant]/admin/verify/` | ✅ Done |
| **4.2** | `application_scores` table, `src/routes/[tenant]/admin/scoring/` | ✅ Done |
| **4.3** | `src/lib/server/ranking/ranking-service.ts` | ✅ Done |
| **4.4** | `home_visit_reports` table, `src/routes/[tenant]/admin/home-visit/` | ✅ Done |
