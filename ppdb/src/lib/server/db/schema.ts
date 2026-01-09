import { pgTable, uuid, text, timestamp, pgEnum, unique, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const admissionPathStatusEnum = pgEnum('admission_path_status', [
	'draft',
	'open',
	'closed',
	'archived'
]);
export const paymentTimingEnum = pgEnum('payment_timing', [
	'registration',
	'acceptance',
	'enrollment',
	'custom'
]);
export const feeStatusEnum = pgEnum('fee_status', ['active', 'inactive']);

// Story 2.4: School Admin RBAC Assignment
export const userRoleEnum = pgEnum('user_role', [
	'super_admin',
	'school_admin',
	'verifier',
	'treasurer',
	'parent'
]);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'pending']);

export const tenants = pgTable('tenants', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	status: statusEnum('status').default('active').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		email: text('email').notNull(),
		tenantId: uuid('tenant_id')
			.references(() => tenants.id)
			.notNull(),
		// Story 2.4: School Admin RBAC Assignment
		name: text('name'),
		role: userRoleEnum('role').default('parent').notNull(),
		status: userStatusEnum('status').default('active').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(t) => ({
		unq: unique().on(t.email, t.tenantId)
	})
);

export const usersRelations = relations(users, ({ one }) => ({
	tenant: one(tenants, {
		fields: [users.tenantId],
		references: [tenants.id]
	})
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
	users: many(users)
}));

export const auditLogs = pgTable('audit_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	actorId: uuid('actor_id').notNull(), // User ID who performed the action
	action: text('action').notNull(), // e.g., 'create_tenant'
	target: text('target').notNull(), // e.g., 'tenant:new-school'
	details: text('details'), // JSON string
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Story 2.1: School Profile & Branding Configuration
export const schoolProfiles = pgTable('school_profiles', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull()
		.unique(), // One profile per tenant
	// Core fields (MVP)
	name: text('name').notNull(),
	description: text('description'),
	contactEmail: text('contact_email'),
	contactPhone: text('contact_phone'),
	logoUrl: text('logo_url'),
	// Progressive enhancement fields (future)
	bannerUrl: text('banner_url'),
	primaryColor: text('primary_color'),
	secondaryColor: text('secondary_color'),
	address: text('address'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const schoolProfilesRelations = relations(schoolProfiles, ({ one }) => ({
	tenant: one(tenants, {
		fields: [schoolProfiles.tenantId],
		references: [tenants.id]
	})
}));

// Story 2.2: Admission Path & Quota Management
export const admissionPaths = pgTable('admission_paths', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	name: text('name').notNull(),
	description: text('description'),
	quota: integer('quota').notNull(),
	filledSlots: integer('filled_slots').notNull().default(0),
	status: admissionPathStatusEnum('status').notNull().default('draft'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const admissionPathsRelations = relations(admissionPaths, ({ one }) => ({
	tenant: one(tenants, {
		fields: [admissionPaths.tenantId],
		references: [tenants.id]
	})
}));

// Story 2.3: Fee Structure & Payment Timing
export const feeStructures = pgTable('fee_structures', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	admissionPathId: uuid('admission_path_id')
		.references(() => admissionPaths.id)
		.notNull(),
	name: text('name').notNull(),
	description: text('description'),
	amount: integer('amount').notNull(),
	currency: text('currency').notNull().default('IDR'),
	paymentTiming: paymentTimingEnum('payment_timing').notNull().default('registration'),
	dueDateOffsetDays: integer('due_date_offset_days').notNull().default(0),
	penaltyAmount: integer('penalty_amount'),
	penaltyGraceDays: integer('penalty_grace_days'),
	status: feeStatusEnum('status').notNull().default('active'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const feeStructuresRelations = relations(feeStructures, ({ one }) => ({
	tenant: one(tenants, {
		fields: [feeStructures.tenantId],
		references: [tenants.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [feeStructures.admissionPathId],
		references: [admissionPaths.id]
	})
}));
