import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const tenants = pgTable('tenants', {
	id: text('id').primaryKey(),
});

export const tasks = pgTable(
	'tasks',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		title: text('title').notNull(),
		status: text('status').notNull().default('pending'),
		tenantId: text('tenant_id')
			.notNull()
			.references(() => tenants.id),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
);

export const tenantsRelations = relations(tenants, ({ many }) => ({
	tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
	tenant: one(tenants),
}));

export type Tenant = typeof tenants.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
