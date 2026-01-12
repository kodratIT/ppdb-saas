# Epic 4.2: Scoring & Interview Input - Design Document

**Date:** 2026-01-12  
**Author:** BMAD Team  
**Status:** Approved  
**Epic:** 4 - Verification, Selection & Ranking Engine  
**Story:** 4.2 - Scoring & Interview Input

---

## Overview

Enable interviewers to input test scores and qualitative notes for verified candidates, with score immutability after finalization and admin override capability.

### User Story

> As an Interviewer, I want to input test scores and interview notes for a candidate, So that these values can be used for ranking.

### Acceptance Criteria

1. ✅ Candidate must be in "verified" status before scoring
2. ✅ Input: Score (0-100) + qualitative notes
3. ✅ System saves score securely
4. ✅ Score aggregated into total weighted score (for Epic 4.3)
5. ✅ Cannot edit after final submission (integrity check)

---

## Design Decisions

### 1. Scoring Model

**Decision:** Simple Single Score  
**Rationale:** MVP approach - one final score (0-100) per candidate. Multi-component scoring can be added later if needed.

### 2. Score Immutability

**Decision:** Admin Override with Audit Trail  
**Rationale:** Balance between data integrity and practical correction needs. Interviewers cannot edit finalized scores, but School Admins can unlock with a documented reason.

### 3. Workflow Separation

**Decision:** Dedicated Scoring Dashboard  
**Rationale:** Clear separation from verification dashboard. Different role (interviewer vs verifier), different task focus.

### 4. Score Multiplicity

**Decision:** Single Score per Application  
**Rationale:** One interviewer, one final score. Enforced via UNIQUE constraint on `(applicationId, tenantId)`.

---

## Architecture

### Database Schema

#### New Table: `application_scores`

```sql
CREATE TABLE application_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  scorer_id UUID NOT NULL REFERENCES users(id), -- Interviewer

  -- Score data
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  notes TEXT,

  -- Finalization tracking
  is_finalized BOOLEAN NOT NULL DEFAULT FALSE,
  finalized_at TIMESTAMP,

  -- Admin override tracking
  unlocked_by UUID REFERENCES users(id),
  unlocked_at TIMESTAMP,
  unlock_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(application_id, tenant_id), -- One score per application
  CHECK ((is_finalized = TRUE AND finalized_at IS NOT NULL) OR (is_finalized = FALSE))
);

CREATE INDEX idx_scores_application ON application_scores(application_id);
CREATE INDEX idx_scores_tenant ON application_scores(tenant_id);
CREATE INDEX idx_scores_finalized ON application_scores(is_finalized, tenant_id);
```

#### Schema Notes

- **No `totalScore` in `applications` table** - calculated dynamically to avoid data inconsistency
- **Audit trail fields** - track unlock actions for compliance (NFR12)
- **Constraints** - enforce data integrity at DB level

### RBAC Addition

**New Role:** `interviewer`

- Can view scoring dashboard
- Can create/edit scores (if not finalized)
- Can finalize scores
- Cannot unlock finalized scores

**Existing Role Updates:**

- `school_admin`: Add permission to unlock scores
- `verifier`: No scoring permissions (separation of duties)

---

## User Interface

### Route Structure

```
/[tenant]/admin/scoring/
├── +page.svelte              // Scoring dashboard (list)
├── +page.server.ts           // Load verified applications
└── [applicationId]/
    ├── +page.svelte          // Scoring detail form
    └── +page.server.ts       // Load application + score
```

### User Flows

#### Interviewer Flow

1. **Navigate to Scoring Dashboard** (`/admin/scoring`)
   - View list of verified candidates (status = "verified")
   - Filter: Not scored, Scored (draft), Finalized
   - Search by name/ID

2. **Score a Candidate** (click "Score" button)
   - View application data (read-only)
   - Input score: 0-100 (number input with validation)
   - Input notes: qualitative feedback (textarea, max 2000 chars)
   - Save options:
     - **Save Draft** - editable later
     - **Finalize** - locks the score

3. **Edit Draft Score**
   - Can edit score/notes if not finalized
   - Cannot edit after finalization

#### School Admin Flow (Unlock)

1. **View Finalized Scores**
   - See lock icon on finalized scores
   - Option: "Unlock" button (admin only)

2. **Unlock Score**
   - Click "Unlock" → modal appears
   - Input required: Unlock reason (why correction needed)
   - Confirm → score unlocked
   - Audit log records: who, when, why

3. **Notify Interviewer**
   - (Future: notification system)
   - Interviewer can now edit the score

---

## API Endpoints

### 1. Create/Update Score

**Endpoint:** `POST /api/admin/scores/[applicationId]`

**Request:**

```json
{
	"score": 85,
	"notes": "Strong communication skills. Confident and well-prepared.",
	"finalize": false
}
```

**Response:**

```json
{
	"success": true,
	"score": {
		"id": "uuid",
		"applicationId": "uuid",
		"score": 85,
		"notes": "...",
		"isFinalized": false,
		"scorerId": "uuid",
		"createdAt": "2026-01-12T10:00:00Z"
	}
}
```

**Errors:**

- `403` - Score is finalized (cannot edit)
- `400` - Score out of range (0-100)
- `404` - Application not found
- `400` - Application not verified yet

---

### 2. Finalize Score

**Endpoint:** `POST /api/admin/scores/[applicationId]/finalize`

**Request:** (empty body)

**Response:**

```json
{
	"success": true,
	"score": {
		"id": "uuid",
		"isFinalized": true,
		"finalizedAt": "2026-01-12T10:05:00Z"
	}
}
```

**Errors:**

- `404` - Score not found
- `400` - Score already finalized
- `403` - Insufficient permissions

---

### 3. Unlock Score (Admin Only)

**Endpoint:** `POST /api/admin/scores/[scoreId]/unlock`

**Request:**

```json
{
	"reason": "Interviewer entered wrong score due to typo (85 should be 58)"
}
```

**Response:**

```json
{
	"success": true,
	"score": {
		"id": "uuid",
		"isFinalized": false,
		"unlockedBy": "admin-uuid",
		"unlockedAt": "2026-01-12T10:10:00Z",
		"unlockReason": "..."
	}
}
```

**Side Effects:**

- Creates audit log entry
- Notifies interviewer (future)

**Errors:**

- `403` - Not admin role
- `400` - Reason is required
- `404` - Score not found

---

## Components

### New Components

**1. `ScoreInput.svelte`**

- Number input with validation (0-100)
- Visual feedback: green (good), yellow (medium), red (low)
- Disabled state when finalized

**2. `NotesTextarea.svelte`**

- Rich textarea for qualitative feedback
- Character count (max 2000)
- Disabled state when finalized

**3. `ScoreCard.svelte`**

- Display score with badge
- Show finalized status (lock icon)
- Show unlock button (admin only)

---

## Validation Rules

### Client-Side Validation

- Score: required, integer, 0-100
- Notes: optional, max 2000 chars
- Cannot submit if score invalid

### Server-Side Validation

- Score range check (0-100)
- Application status check (must be "verified")
- Finalization check (cannot edit if finalized)
- RBAC check (interviewer/admin role)
- Unique constraint (one score per application)

---

## Error Handling

### Common Error Scenarios

| Error            | Status | Message                              | UI Behavior                  |
| ---------------- | ------ | ------------------------------------ | ---------------------------- |
| Score finalized  | 403    | "Score is locked. Contact admin."    | Disable form, show lock icon |
| Not verified     | 400    | "Application must be verified first" | Hide from list               |
| Out of range     | 400    | "Score must be 0-100"                | Inline validation error      |
| No permission    | 403    | "Insufficient permissions"           | Redirect to dashboard        |
| No unlock reason | 400    | "Unlock reason required"             | Modal validation             |
| Concurrent edit  | 409    | "Score modified by another user"     | Refresh and retry            |

### Data Integrity

**Optimistic Locking:**

```sql
UPDATE application_scores
SET score = ?, notes = ?, updated_at = NOW()
WHERE id = ? AND updated_at = ?
```

If `updated_at` mismatch → concurrent modification detected.

**Audit Trail:**

- All finalize actions → `auditLogs`
- All unlock actions → `auditLogs`
- Track: actorId, action, target, details (JSON)

---

## Security & Compliance

### RBAC Enforcement

- Route guards: `requireRole(auth, 'interviewer', 'school_admin')`
- API guards: verify role before score operations
- Unlock action: admin-only

### Audit Logging (NFR12)

- Log finalization: who scored, when, what score
- Log unlock: admin who unlocked, reason, when
- Immutable audit log (append-only)

### Data Privacy

- Scores visible to: interviewer (own), admins (all)
- Notes visible to: same as scores
- No parent access to scores (until accepted)

---

## Testing Strategy

### Unit Tests

- Score validation (range, required)
- Finalization logic (cannot edit after)
- Unlock logic (admin only, reason required)

### Integration Tests

- Create score flow (draft → finalize)
- Unlock flow (admin unlock → edit → re-finalize)
- RBAC enforcement (interviewer vs admin)
- Concurrent edit detection

### E2E Tests (Future)

- Full scoring workflow (login → score → finalize)
- Unlock workflow (admin unlock → notification)

---

## Implementation Checklist

### Phase 1: Database & Backend (Priority: High)

- [ ] Add `application_scores` table migration
- [ ] Update `users` schema for `interviewer` role
- [ ] Create API endpoint: POST `/api/admin/scores/[applicationId]`
- [ ] Create API endpoint: POST `/api/admin/scores/[applicationId]/finalize`
- [ ] Create API endpoint: POST `/api/admin/scores/[scoreId]/unlock`
- [ ] Add audit logging for finalize/unlock actions
- [ ] Write unit tests for API endpoints

### Phase 2: UI Components (Priority: High)

- [ ] Create `ScoreInput.svelte` component
- [ ] Create `NotesTextarea.svelte` component
- [ ] Create `ScoreCard.svelte` component
- [ ] Create scoring dashboard (`/admin/scoring`)
- [ ] Create scoring detail page (`/admin/scoring/[applicationId]`)
- [ ] Add unlock modal for admins

### Phase 3: Integration & Testing (Priority: Medium)

- [ ] Write integration tests (create, finalize, unlock flows)
- [ ] Test RBAC enforcement
- [ ] Test concurrent edit handling
- [ ] Manual QA with real data

### Phase 4: Polish (Priority: Low)

- [ ] Add notifications for unlock events
- [ ] Add score statistics on dashboard
- [ ] Export scores to CSV
- [ ] Rich text support for notes (markdown)

---

## Future Enhancements

### Multi-Component Scoring (Epic 4.2.1)

- Break score into: Academic, Interview, Attitude
- Weighted average calculation
- Separate input fields per component

### Rubric-Based Scoring (Epic 4.2.2)

- Define scoring rubrics (Communication 1-5, Knowledge 1-5)
- Auto-convert rubric to 0-100 score
- Template rubrics per admission path

### Score Analytics (Epic 4.2.3)

- Score distribution charts
- Interviewer statistics (avg score, count)
- Outlier detection (unusually high/low scores)

---

## Open Questions

**Q1:** Should we notify interviewers when admin unlocks their score?  
**A:** Yes, future enhancement (Epic 6 - Notifications)

**Q2:** Can admin directly edit scores, or must unlock first?  
**A:** Must unlock first (audit trail clarity)

**Q3:** What if interviewer leaves organization mid-scoring?  
**A:** Admin can reassign or complete score (future feature)

---

## Approval

**Design Reviewed By:** Kodrat (Project Owner)  
**Approved Date:** 2026-01-12  
**Next Step:** Implementation

---

## References

- Epic 4 Planning: `_bmad-output/planning-artifacts/epics.md`
- Sprint Status: `_bmad-output/sprint-status.yaml`
- Related Story: 4.3 - Automated Ranking Engine (uses scores)
- NFR12: Immutable Audit Log requirement
