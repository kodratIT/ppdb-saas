import { db } from '$lib/server/db';
import { saasPackages, saasSubscriptions, saasInvoices, users } from '$lib/server/db/schema';
import { eq, sql, asc, desc, count, sum, and } from 'drizzle-orm';
import type { PlanCreateInput, PlanUpdateInput, PlanLimitsInput } from '$lib/server/validators/admin';

export type SaasPackage = typeof saasPackages.$inferSelect;

export interface PlanStats {
    planId: string;
    planName: string;
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    pastDueSubscriptions: number;
    totalRevenue: number;
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
}

export async function createPlan(input: PlanCreateInput, createdBy: string) {
    const [plan] = await db
        .insert(saasPackages)
        .values({
            name: input.name,
            slug: input.slug,
            description: input.description,
            priceMonthly: input.priceMonthly,
            priceYearly: input.priceYearly,
            limits: input.limits,
            features: input.features,
            isActive: input.isActive
        })
        .returning();
    return plan;
}

export async function updatePlan(id: string, input: PlanUpdateInput, updatedBy: string) {
    const [plan] = await db
        .update(saasPackages)
        .set({
            ...input,
            updatedAt: new Date()
        })
        .where(eq(saasPackages.id, id))
        .returning();
    return plan;
}

export async function deletePlan(id: string) {
    // Check if there are active subscriptions
    const subs = await db
        .select({ count: count() })
        .from(saasSubscriptions)
        .where(eq(saasSubscriptions.packageId, id));

    if (subs[0].count > 0) {
        throw new Error('Cannot delete plan with active subscriptions. Deactivate it instead.');
    }

    await db.delete(saasPackages).where(eq(saasPackages.id, id));
}

export async function getPlans(filters?: { isActive?: boolean }) {
    let query = db.select().from(saasPackages);

    if (filters?.isActive !== undefined) {
        // @ts-ignore
        query = query.where(eq(saasPackages.isActive, filters.isActive));
    }

    // @ts-ignore
    return query.orderBy(asc(saasPackages.priceMonthly));
}

export async function getPlanById(id: string) {
    const [plan] = await db.select().from(saasPackages).where(eq(saasPackages.id, id));
    return plan || null;
}

export async function getPlanBySlug(slug: string) {
    const [plan] = await db.select().from(saasPackages).where(eq(saasPackages.slug, slug));
    return plan || null;
}

export async function getPlanStatistics(): Promise<PlanStats[]> {
    const plans = await db.select().from(saasPackages);
    const stats: PlanStats[] = [];

    for (const plan of plans) {
        const subStats = await db
            .select({
                total: count(),
                active: sql<number>`count(*) filter (where status = 'active')`,
                trial: sql<number>`count(*) filter (where status = 'trial')`,
                pastDue: sql<number>`count(*) filter (where status = 'past_due')`
            })
            .from(saasSubscriptions)
            .where(eq(saasSubscriptions.packageId, plan.id));

        const revenue = await db
            .select({
                total: sum(saasInvoices.amount)
            })
            .from(saasInvoices)
            .where(and(eq(saasInvoices.status, 'paid'), eq(saasInvoices.status, 'paid'))); // This filter is a bit simplified, ideally join with subscriptions

        // Better revenue query
        const revenueResult = await db
            .select({
                total: sql<number>`sum(amount)`
            })
            .from(saasInvoices)
            .innerJoin(saasSubscriptions, eq(saasInvoices.subscriptionId, saasSubscriptions.id))
            .where(and(eq(saasInvoices.status, 'paid'), eq(saasSubscriptions.packageId, plan.id)));

        const activeCount = Number(subStats[0]?.active || 0);
        const mrr = activeCount * plan.priceMonthly;

        stats.push({
            planId: plan.id,
            planName: plan.name,
            totalSubscriptions: Number(subStats[0]?.total || 0),
            activeSubscriptions: activeCount,
            trialSubscriptions: Number(subStats[0]?.trial || 0),
            pastDueSubscriptions: Number(subStats[0]?.pastDue || 0),
            totalRevenue: Number(revenueResult[0]?.total || 0),
            mrr,
            arr: mrr * 12
        });
    }

    return stats;
}

export async function getPlanUsageMetrics() {
    // This would typically involve counting records in other tables based on tenantId
    // For now, return aggregate counts
    const studentCount = await db.select({ count: count() }).from(sql`applications`); // Assuming applications as students for now
    // This needs more specific implementation based on what "students" means in this context

    return {
        totalStudents: Number(studentCount[0]?.count || 0),
        totalAdmins: 0, // Placeholder
        storageUsed: 0, // Placeholder
        whatsappCreditsUsed: 0 // Placeholder
    };
}

export async function getAllAvailableFeatures() {
    // This could be hardcoded or loaded from a config
    return [
        { key: 'whatsapp_blast', name: 'WhatsApp Blast', category: 'Communication' },
        { key: 'custom_domain', name: 'Custom Domain', category: 'Branding' },
        { key: 'advanced_analytics', name: 'Advanced Analytics', category: 'Reporting' },
        { key: 'api_access', name: 'API Access', category: 'Integration' },
        { key: 'white_label', name: 'White Label', category: 'Branding' },
        { key: 'priority_support', name: 'Priority Support', category: 'Support' }
    ];
}

export async function duplicatePlan(id: string, newName: string) {
    const source = await getPlanById(id);
    if (!source) throw new Error('Plan not found');

    const [plan] = await db
        .insert(saasPackages)
        .values({
            name: newName,
            slug: `${source.slug}-copy-${Date.now()}`,
            description: source.description,
            priceMonthly: source.priceMonthly,
            priceYearly: source.priceYearly,
            limits: source.limits,
            features: source.features,
            isActive: false
        })
        .returning();
    return plan;
}
