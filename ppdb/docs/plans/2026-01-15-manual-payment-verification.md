# Manual Payment Verification (Story 5-2) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Enable students to upload manual transfer proofs and School Admins/Treasurers to verify (Approve/Reject) them.

**Architecture:**

- **Student Side:** Upload form in Dashboard -> Uploads to R2 -> Creates `payment_proof` record -> Updates Invoice to `VERIFYING`.
- **Admin Side:** List of `VERIFYING` invoices -> Review UI -> Actions (Approve/Reject).
- **Domain Logic:** Handle state transitions (VERIFYING -> PAID/REJECTED) and notifications.

**Tech Stack:** SvelteKit, Drizzle ORM, R2 Storage.

### Task 1: Domain Logic for Manual Verification

**Files:**

- Create: `src/lib/server/domain/payment/verification.ts`
- Modify: `src/lib/server/domain/payment/index.ts` (export new functions)

**Step 1: Write test for verification logic**
Create `tests/unit/payment-verification.test.ts`. Test:

- `submitProof`: Should create proof record and update invoice to VERIFYING.
- `verifyProof(approve)`: Should update proof to ACCEPTED, invoice to PAID, create transaction.
- `verifyProof(reject)`: Should update proof to REJECTED, invoice to REJECTED/PENDING.

**Step 2: Implement `submitPaymentProof`**

- Input: `invoiceId`, `fileUrl`, `notes`.
- Logic: Insert `paymentProofs`, Update `invoices` status.

**Step 3: Implement `processVerification`**

- Input: `proofId`, `action` (accept/reject), `reviewerId`, `reason`.
- Logic: Transactional update of proof and invoice. Triggers notifications.

**Step 4: Commit**

### Task 2: Student Upload UI & Action

**Files:**

- Modify: `src/routes/[tenant]/dashboard/payment/+page.svelte` (Add upload form)
- Modify: `src/routes/[tenant]/dashboard/payment/+page.server.ts` (Add `uploadProof` action)

**Step 1: Implement Form Action**

- Handle file upload using `src/lib/server/storage/r2.ts`.
- Call `submitPaymentProof`.

**Step 2: Update UI**

- Show "Upload Payment Proof" button if invoice is PENDING.
- Show "Verifying..." status if VERIFYING.
- Handle file input and submission.

**Step 3: Commit**

### Task 3: Admin Verification Dashboard

**Files:**

- Create: `src/routes/[tenant]/admin/finance/verification/+page.svelte`
- Create: `src/routes/[tenant]/admin/finance/verification/+page.server.ts`
- Create: `src/routes/[tenant]/admin/finance/verification/[proofId]/+page.svelte` (Detail view)
- Create: `src/routes/[tenant]/admin/finance/verification/[proofId]/+page.server.ts`

**Step 1: List Page**

- Load invoices with status `VERIFYING`.
- Display table with Student Name, Amount, Date.

**Step 2: Detail Page**

- Show Proof Image (using R2 presigned URL or public URL).
- Show Invoice Details.
- Forms for "Approve" and "Reject".

**Step 3: Implement Actions**

- `approve`: Call `processVerification(..., 'accept')`.
- `reject`: Call `processVerification(..., 'reject')`.

**Step 4: Commit**
