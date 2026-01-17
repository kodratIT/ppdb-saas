# Story 5.1: Digital Payment Integration (VA/QRIS)

Status: ready-for-dev

## Story

As a Parent,
I want to pay the registration fee using QRIS or Virtual Account via Xendit,
so that the payment is verified instantly without sending a transfer receipt.

## Acceptance Criteria

1.  **Tenant Configuration**:
    - School Admin can input their own Xendit Secret Key in `Settings > Payments`.
    - Key is stored securely (encrypted) in the database.

2.  **Invoice Creation**:
    - When a parent clicks "Pay", an Invoice is created in Xendit.
    - Parent is redirected to the Xendit Checkout Page (Invoice URL).
    - Invoice amount matches the Fee Structure configuration.

3.  **Payment Processing**:
    - Support all channels enabled in the School's Xendit Dashboard (VA, QRIS, E-Wallet, Retail).
    - Handle "Pending", "Paid", and "Expired" states.

4.  **Webhook Handling**:
    - Secure endpoint to receive Xendit callbacks.
    - Verify `x-callback-token` to ensure authenticity.
    - Idempotent processing (handling same webhook multiple times safely).
    - Automatically update Application Status to `PAID` upon success.

5.  **Notifications**:
    - (Linked to Story 6.1) Trigger notification event upon successful payment.

## Tasks / Subtasks

- [ ] **Database Schema**
  - [ ] Add `xendit_secret_key` (text, encrypted) to `tenants` table.
  - [ ] Create `invoices` table.
  - [ ] Create `payment_transactions` table.
  - [ ] Run migration.

- [ ] **Gateway Integration**
  - [ ] Create `src/lib/server/gateway/xendit.ts`.
  - [ ] Implement `createInvoice(secretKey, params)`.
  - [ ] Implement `getInvoice(secretKey, id)`.
  - [ ] Implement `verifyCallbackToken(token)`.

- [ ] **Domain Logic**
  - [ ] Create `src/lib/server/domain/payment/index.ts`.
  - [ ] Implement `generateInvoiceForApplication`.
  - [ ] Implement `handlePaymentWebhook`.

- [ ] **UI Implementation**
  - [ ] Add "Payment Settings" in Admin Dashboard (to input API Key).
  - [ ] Add "Pay Registration Fee" button in Parent Dashboard.
  - [ ] Create Payment Success/Failure landing pages.

- [ ] **Testing**
  - [ ] Unit tests for Invoice generation logic.
  - [ ] Integration test for Webhook handler (mocking Xendit request).

## Dev Notes

- **API Client**: Use native `fetch` for Cloudflare Workers compatibility. Do not use `xendit-node` SDK to avoid Node.js runtime dependencies.
- **Encryption**: Use the existing `encrypt/decrypt` helpers for the API Key.
- **Webhook URL**: The global webhook URL will be `https://[platform-domain]/api/webhooks/xendit`. We will identify the tenant from the `external_id` pattern `INV-{tenantId}-{appId}-{timestamp}`.

## Database Schema Draft

```typescript
export const invoices = pgTable('invoices', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id').notNull(),
	applicationId: uuid('application_id').notNull(),
	externalId: text('external_id').notNull().unique(), // Xendit Invoice ID
	amount: integer('amount').notNull(),
	status: text('status').notNull(), // PENDING, PAID, EXPIRED
	invoiceUrl: text('invoice_url').notNull(),
	expiryDate: timestamp('expiry_date').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
```
