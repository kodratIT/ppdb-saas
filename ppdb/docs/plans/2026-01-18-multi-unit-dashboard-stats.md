# Multi-Unit Dashboard Statistics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the Super Admin dashboard statistics to include a breakdown of applications and revenue per unit, grouped by tenant.

**Architecture:** Enhance `getDashboardStats` in the admin domain layer using Drizzle ORM subqueries to perform efficient aggregations for each unit, avoiding Cartesian product issues from multiple left joins.

**Tech Stack:** TypeScript, Drizzle ORM, PostgreSQL.

### Task 1: Update Dashboard Stats to include Unit Breakdowns

**Files:**
- Modify: `src/lib/server/domain/admin/index.ts`

**Step 1: Implement subqueries for unit aggregation**

Modify `getDashboardStats` to include the following logic before the return statement:

```typescript
	// 10. Unit-level Breakdown
	const appCountsSubquery = db
		.select({
			unitId: applications.unitId,
			count: sql<number>`cast(count(${applications.id}) as integer)`.as('app_count')
		})
		.from(applications)
		.groupBy(applications.unitId)
		.as('unit_app_counts');

	const revenueSubquery = db
		.select({
			unitId: invoices.unitId,
			total: sql<number>`cast(sum(${invoices.amount}) as integer)`.as('unit_revenue')
		})
		.from(invoices)
		.where(eq(invoices.status, 'PAID'))
		.groupBy(invoices.unitId)
		.as('unit_revenues');

	const unitStats = await db
		.select({
			unitId: units.id,
			unitName: units.name,
			tenantName: tenants.name,
			level: units.level,
			appCount: sql<number>`coalesce(${appCountsSubquery.count}, 0)`,
			revenue: sql<number>`coalesce(${revenueSubquery.total}, 0)`
		})
		.from(units)
		.innerJoin(tenants, eq(units.tenantId, tenants.id))
		.leftJoin(appCountsSubquery, eq(units.id, appCountsSubquery.unitId))
		.leftJoin(revenueSubquery, eq(units.id, revenueSubquery.unitId))
		.orderBy(tenants.name, units.name);
```

**Step 2: Update return object**

Add `unitStats` to the returned object from `getDashboardStats`.

**Step 3: Self-verification**

Check that `unitStats` is correctly typed and included in the final output.

**Step 4: Commit**

```bash
git add src/lib/server/domain/admin/index.ts
git commit -m "feat(admin): add unit-level stats to dashboard aggregation"
```
