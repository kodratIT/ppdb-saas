# SaaS Subscription System Design

**Date:** 2026-01-19
**Status:** Planned
**Priority:** High

## Overview

Implementasi sistem manajemen langganan (SaaS Subscription) untuk mengelola monetisasi platform PPDB. Sistem ini menggunakan model **Prepaid** (bayar di muka) dengan siklus bulanan atau tahunan.

## Architecture

Sistem subscription dibangun di level aplikasi (schema `public`), bukan per-tenant. Ini memungkinkan pengelolaan terpusat oleh Super Admin.

### Database Schema

Tabel baru akan ditambahkan ke `src/lib/server/db/schema.ts`:

#### 1. `saas_packages`

Katalog produk paket langganan.

```typescript
export const saasPackages = pgTable('saas_packages', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(), // e.g. "Basic", "Pro"
	slug: text('slug').notNull().unique(), // e.g. "basic"
	description: text('description'),
	priceMonthly: integer('price_monthly').notNull(), // IDR
	priceYearly: integer('price_yearly').notNull(), // IDR
	limits: jsonb('limits').notNull().default({}), // e.g. { max_students: 100 }
	features: jsonb('features').notNull().default([]), // e.g. ["whatsapp_blast", "export"]
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
```

#### 2. `saas_subscriptions`

Status langganan aktif untuk setiap tenant.

```typescript
export const saasSubscriptionStatus = pgEnum('saas_subscription_status', [
	'trial',
	'active',
	'past_due',
	'cancelled'
]);

export const saasBillingCycle = pgEnum('saas_billing_cycle', ['monthly', 'yearly']);

export const saasSubscriptions = pgTable('saas_subscriptions', {
	id: uuid('id').defaultRandom().primaryKey(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull()
		.unique(), // One active sub per tenant
	packageId: uuid('package_id')
		.references(() => saasPackages.id)
		.notNull(),
	status: saasSubscriptionStatus('status').notNull().default('trial'),
	billingCycle: saasBillingCycle('billing_cycle').notNull().default('monthly'),
	currentPeriodStart: timestamp('current_period_start').notNull(),
	currentPeriodEnd: timestamp('current_period_end').notNull(),
	autoRenew: boolean('auto_renew').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
```

#### 3. `saas_invoices`

History tagihan dari SaaS ke Tenant.

```typescript
export const saasInvoiceStatus = pgEnum('saas_invoice_status', ['pending', 'paid', 'void']);

export const saasInvoices = pgTable('saas_invoices', {
	id: uuid('id').defaultRandom().primaryKey(),
	subscriptionId: uuid('subscription_id').references(() => saasSubscriptions.id),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	amount: integer('amount').notNull(),
	status: saasInvoiceStatus('status').notNull().default('pending'),
	dueDate: timestamp('due_date').notNull(),
	paidAt: timestamp('paid_at'),
	notes: text('notes'), // e.g. "Manual transfer BCA..."
	createdAt: timestamp('created_at').defaultNow()
});
```

## Implementation Phases

### Phase 1: Foundation (Current Scope)

1.  **Schema & Migration:** Implementasi tabel database di atas.
2.  **Seeding:** Script untuk membuat paket default (Free, Basic, Pro).
3.  **Super Admin UI:**
    - Page `Packages`: CRUD paket langganan.
    - Page `Subscriptions`: List tenant dengan status langganan, tombol manual "Extend/Activate".

### Phase 2: Enforcement (Future)

1.  **Middleware Check:** Block akses jika status `past_due`.
2.  **Feature Gating:** Hide/disable fitur berdasarkan `limits` paket aktif.

## Next Steps

1.  Create migration file.
2.  Implement schema changes.
3.  Run migration.
4.  Create seed data.
