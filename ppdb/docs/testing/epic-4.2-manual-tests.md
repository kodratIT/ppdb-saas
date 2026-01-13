# Manual Testing Checklist - Epic 4.2: Scoring Module

## Prerequisites

Before starting testing, ensure the following are completed:

- [ ] Development environment is set up and running
- [ ] Database migrations are applied (Epic 4.2 tables exist)
- [ ] Scoring API endpoints are deployed and accessible
- [ ] Scoring UI pages are built and accessible
- [ ] At least one school with students exists in the database
- [ ] At least one active academic year is configured
- [ ] User accounts are created:
  - [ ] Admin account (has all permissions)
  - [ ] Teacher account (can create and finalize scores)
  - [ ] Staff account (read-only access to scores)

---

## Test Scenarios

### Scenario 1: Create and Save Draft Score

**Objective:** Verify that a teacher can create a new score entry and save it as a draft

**Steps:**

1. Log in as a Teacher user
2. Navigate to the Scoring Dashboard
3. Select a student from the list
4. Fill in the scoring form with valid data:
   - Enter academic score (0-100)
   - Enter non-academic score (0-100)
   - Add notes/comments (optional)
5. Click "Save Draft" button
6. Verify the score is saved successfully
7. Navigate away and back to verify persistence

**Expected Results:**

- Form submits without errors
- Success message is displayed
- Score appears in the dashboard list with "Draft" status
- Score data persists after page refresh
- Score is visible to other authorized users
- Score can be edited by the creating teacher

---

### Scenario 2: Finalize Score (Lock)

**Objective:** Verify that a draft score can be finalized and locked

**Steps:**

1. Log in as a Teacher user
2. Navigate to a draft score created in Scenario 1
3. Review the score data for accuracy
4. Click "Finalize" button
5. Confirm finalization in the modal/dialog
6. Verify the score status changes to "Finalized"
7. Attempt to edit the finalized score

**Expected Results:**

- Finalization modal displays correctly
- Confirmation button works as expected
- Score status changes from "Draft" to "Finalized"
- Score appears as locked/read-only
- Edit controls are disabled or hidden
- Score cannot be modified by the creator
- Finalization timestamp is recorded
- Finalized score is visible to other authorized users

---

### Scenario 3: Admin Unlock with Reason

**Objective:** Verify that admins can unlock finalized scores with a reason

**Steps:**

1. Log in as Admin user
2. Navigate to the Scoring Dashboard
3. Find a finalized score from Scenario 2
4. Click "Unlock" button
5. Enter a valid reason in the unlock reason field
6. Submit the unlock request
7. Verify the score is unlocked

**Expected Results:**

- Unlock button is only visible to admins
- Unlock modal/dialog displays correctly
- Reason field is required and validated
- Score status changes from "Finalized" to "Draft"
- Score becomes editable again
- Unlock reason is recorded in audit log
- Unlock timestamp is recorded
- Admin user who performed unlock is logged

---

### Scenario 4: Edit After Unlock

**Objective:** Verify that an unlocked score can be edited and re-finalized

**Steps:**

1. Using the unlocked score from Scenario 3
2. Log in as a Teacher user (original creator or other authorized teacher)
3. Navigate to the unlocked score
4. Modify the score data:
   - Change academic score
   - Change non-academic score
   - Update notes/comments
5. Click "Save Draft" to preserve changes
6. Review the modified score
7. Click "Finalize" to lock the score again
8. Verify the score is locked with new values

**Expected Results:**

- Score can be edited after unlock
- Modified values are saved correctly
- Old values are replaced (not duplicated)
- Score can be re-finalized
- Finalization creates new audit entry
- Score history/audit trail shows all changes
- Current values are correct and persistent

---

### Scenario 5: Validation Error Handling

**Objective:** Verify that form validation prevents invalid data entry

**Steps:**

1. Log in as a Teacher user
2. Navigate to create a new score or edit an unlocked score
3. Test each validation rule:
   - Enter academic score > 100
   - Enter academic score < 0
   - Enter non-academic score > 100
   - Enter non-academic score < 0
   - Leave required fields empty
   - Enter invalid characters in numeric fields
   - Enter excessively long notes/comments
4. Attempt to submit for each invalid case
5. Verify error messages are displayed
6. Correct each error and submit successfully

**Expected Results:**

- Each validation rule is enforced correctly
- Clear error messages are displayed for each error
- Form does not submit with invalid data
- Invalid fields are highlighted
- Error messages are specific to the validation rule
- Multiple errors can be displayed simultaneously
- Form submits successfully after correcting all errors
- No data is saved when validation fails

---

### Scenario 6: RBAC Enforcement

**Objective:** Verify that role-based access control is properly enforced

**Steps:**

**Test 6a: Teacher Role**

1. Log in as Teacher user
2. Navigate to Scoring Dashboard
3. Verify teacher can create new scores
4. Verify teacher can edit own draft scores
5. Verify teacher cannot edit finalized scores
6. Verify teacher cannot unlock finalized scores
7. Verify teacher can finalize own draft scores

**Test 6b: Staff Role**

1. Log in as Staff user (read-only)
2. Navigate to Scoring Dashboard
3. Verify staff can view scores
4. Verify staff cannot create new scores
5. Verify staff cannot edit any scores
6. Verify staff cannot finalize scores
7. Verify staff cannot unlock scores

**Test 6c: Admin Role**

1. Log in as Admin user
2. Navigate to Scoring Dashboard
3. Verify admin can create scores
4. Verify admin can edit any scores
5. Verify admin can finalize scores
6. Verify admin can unlock any finalized scores
7. Verify admin has access to audit logs

**Expected Results:**

- Each role has correct permissions as specified
- Unauthorized actions are blocked
- Unauthorized UI elements are hidden/disabled
- Access control applies to both UI and API
- Permission errors display appropriate messages
- No privilege escalation is possible
- Cross-user access is properly restricted

---

### Scenario 7: Application Status Verification

**Objective:** Verify that score status correctly reflects application selection state

**Prerequisites:**

- Application system is integrated with scoring (if implemented)

**Steps:**

1. Log in as Admin user
2. Navigate to Scoring Dashboard
3. Review scores for students with different application states:
   - Student with high scores (should be eligible for selection)
   - Student with low scores (should not be eligible)
   - Student with missing/incomplete scores
4. Verify score status indicators:
   - Draft status
   - Finalized status
   - Locked status
5. Verify scoring completeness:
   - All required scores are entered
   - Scores are finalized for ranking
6. Check if scores affect application status (if applicable)

**Expected Results:**

- Score status is clearly displayed in the dashboard
- Finalized scores are counted for ranking/selection
- Draft scores are excluded from ranking/selection
- Missing scores are flagged for attention
- Score status indicators are accurate and up-to-date
- Application status correctly reflects scoring state
- Scoring metrics are calculated correctly
- Ranking/ordering is based on finalized scores

---

## Bug Reporting

### How to Report Bugs

When a bug is discovered during testing:

1. **Document the issue:**
   - Scenario number where bug was found
   - Exact steps to reproduce
   - Expected behavior vs. actual behavior
   - Screenshots or error messages
   - Browser/device information

2. **Severity Levels:**
   - **Critical:** Blocks core functionality (cannot create/edit/finalize scores)
   - **High:** Major feature broken (validation fails, RBAC not working)
   - **Medium:** Minor issues (UI glitches, unclear error messages)
   - **Low:** Cosmetic issues (typos, alignment)

3. **Report in project issue tracker:**
   - Title: `[Epic 4.2] [Scenario X] Brief description`
   - Description: Include all documented information
   - Labels: `bug`, `epic-4.2`, `scoring`

### Bug Template

```markdown
**Scenario:** [X - Scenario Name]

**Steps to Reproduce:**

1. [First step]
2. [Second step]
   ...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Logs:**
[Attach relevant files]

**Environment:**

- Browser: [Chrome/Firefox/Safari + version]
- Device: [Desktop/Mobile/Tablet]
- User Role: [Admin/Teacher/Staff]

**Severity:** [Critical/High/Medium/Low]
```

---

## Additional Notes

- Testing should be performed in multiple browsers (Chrome, Firefox, Safari)
- Consider testing on different screen sizes (responsive design)
- Verify all user-facing messages are clear and helpful
- Check for performance issues with large datasets
- Ensure audit logging captures all important events
- Verify data integrity after concurrent operations (if applicable)

---

## Test Completion Checklist

- [ ] All 7 scenarios have been tested
- [ ] All expected results have been verified
- [ ] All bugs have been documented
- [ ] Critical and high bugs have been reported
- [ ] Test evidence (screenshots/logs) has been saved
- [ ] Test summary has been documented
