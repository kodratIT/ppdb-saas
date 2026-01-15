# Brainstorming: Story 5.1 - Digital Payment Integration

**Date:** 2026-01-14
**Participants:** Architect Agent, Product Owner Agent, Security Specialist Agent
**Goal:** Define the architecture and user flow for enabling online payments (VA/QRIS) for registration fees.

---

## 1. Context & Objectives

**Story 5.1:** "As a Parent, I want to pay the registration fee using QRIS or Virtual Account..."
**Key Constraints:**
- Must support VA and QRIS.
- Must handle webhooks for status updates.
- Must send WhatsApp receipt.
- Must be tenant-aware (Multi-tenant SaaS).

---

## 2. Vendor Selection Analysis

### Option A: Xendit
*   **Pros:**
    *   **Xendit Invoice:** One API call generates a checkout page with VA, QRIS, E-Wallet, and Retail Outlet options.
    *   **Sub-account (Platform) Support:** Excellent for SaaS (PPDB) to manage funds for different schools (tenants) if needed in the future (though for now, maybe single master account or per-tenant API keys).
    *   **Developer Experience:** Clean API, robust testing sandbox.
*   **Cons:** Pricing can be slightly higher for some channels.

### Option B: Midtrans
*   **Pros:**
    *   **Snap:** Very popular embedded checkout in Indonesia.
    *   **Brand Recognition:** Parents might trust the "Midtrans" logo.
*   **Cons:** Snap integration involves frontend SDK + Backend token, slightly more complex than Xendit Invoice redirect.

**Recommendation:** **Xendit Invoice** for simplicity.
*   **Why?** We can generate a single `invoice_url` and redirect the parent. Xendit handles the UI for choosing BCA/Mandiri/BRI/QRIS. This saves us from building a complex UI for payment method selection.

---

## 3. Technical Architecture

### A. Database Schema
We need two new tables to track the financial lifecycle:

1.  **`invoices`**
    *   Represents the "Bill" to be paid.
    *   Fields: `id`, `tenant_id`, `application_id`, `fee_structure_id`, `amount`, `status` (UNPAID, PAID, EXPIRED), `external_id` (Xendit ID), `expiry_date`.
2.  **`payment_transactions`**
    *   Represents the actual flow of money/attempts.
    *   Fields: `id`, `invoice_id`, `amount`, `payment_method` (e.g., BCA_VA), `status` (PENDING, SUCCESS, FAILED), `paid_at`, `external_reference`.

### B. Payment State Machine
*   **Draft**: Invoice created in DB.
*   **Pending**: Invoice sent to Gateway, waiting for payment.
*   **Paid**: Webhook received with status `PAID`.
*   **Expired**: Webhook/Time passed without payment. User needs to generate a new one.

### C. Webhook Handling (Security)
*   **Endpoint**: `/api/webhooks/xendit` (Global endpoint) or `/[tenant]/api/webhooks/xendit`?
    *   *Decision:* Global endpoint is easier to configure in Xendit Dashboard. We can route based on `external_id` prefix (e.g., `invoice_{tenantId}_{appId}_{timestamp}`).
*   **Verification**: Xendit sends a callback token/signature header (`x-callback-token`). We MUST verify this to prevent spoofing.
*   **Idempotency**: Check if `payment_transactions` already has this `external_reference`. If yes, ignore/return 200.

---

## 4. User Flow (UX)

1.  **Trigger**: Parent clicks "Bayar Biaya Pendaftaran" on Dashboard.
2.  **System**:
    *   Checks if active `invoice` exists.
    *   If yes and not expired -> Redirect to existing Xendit Invoice URL.
    *   If no or expired -> Create new Invoice in Xendit -> Save to DB -> Redirect.
3.  **Payment**: Parent sees Xendit page, chooses BCA VA, pays via M-Banking.
4.  **Feedback**:
    *   Xendit redirects parent back to `ppdb.id/callback/success`.
    *   Simultaneously, Xendit sends Webhook to Backend.
5.  **Completion**:
    *   Backend updates Invoice -> `PAID`.
    *   Backend updates Application -> `PAID`.
    *   Backend triggers WhatsApp Notification (Story 6.1).

---

## 5. Implementation Steps (Plan)

1.  **Schema Design**: Create `invoices` and `payment_transactions` tables.
2.  **Gateway Service**: Create `src/lib/server/gateway/xendit.ts` (using `xendit-node` or fetch).
3.  **Invoice Service**: Domain logic to create/retrieve invoices.
4.  **UI**: "Pay" button on Application Dashboard.
5.  **Webhook**: Secure endpoint to handle callbacks.

---

## 6. Open Questions for User

1.  **Gateway Choice**: Do you agree with using **Xendit** (via Invoice API) for simplicity?
2.  **Credential Management**: For this SaaS, does each School have their own Xendit keys, or does the SaaS owner (Kodrat) collect all money and disburse it (Platform model)?
    *   *Assumption for MVP:* Single Xendit Account (Kodrat's) for simplicity, or we store API keys in `tenants` table if schools have their own.
    *   *Recommendation:* **Per-Tenant API Keys**. Add `xendit_secret_key` column to `tenants` (encrypted). This makes it true SaaS where schools get their money directly.
