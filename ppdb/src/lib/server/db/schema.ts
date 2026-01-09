import { pgTable, uuid, text, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['active', 'inactive']);

export const tenants = pgTable('tenants', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	status: statusEnum('status').default('active').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull(),
	tenantId: uuid('tenant_id').references(() => tenants.id).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (t) => ({
	unq: unique().on(t.email, t.tenantId)
}));

export const usersRelations = relations(users, ({ one }) => ({
	tenant: one(tenants, {
		fields: [users.tenantId],
		references: [tenants.id]
	})
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
	users: many(users)
}));
