import type { PageServerLoad } from './$types';
import { getDashboardStats } from '$lib/server/domain/admin';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { invoices } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const schools = url.searchParams.get('schools');
    const plan = url.searchParams.get('plan');
    const status = url.searchParams.get('status');

    // Parse schools filter - support multi-select
    const schoolIds = schools && schools !== '' ? schools.split(',') : undefined;

    // Apply filters to getDashboardStats
    const stats = await getDashboardStats({
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        tenantIds: schoolIds
    });

    // Additional filtering based on payment status if specified
    let filteredStats = { ...stats };

    if (status && status !== 'all') {
        // Filter transactions by status
        const statusMap: Record<string, Array<'PAID' | 'PENDING' | 'FAILED' | 'EXPIRED' | 'REFUNDED'>> = {
            paid: ['PAID'],
            pending: ['PENDING'],
            failed: ['FAILED'],
            refunded: ['REFUNDED']
        };

        const targetStatuses = statusMap[status];
        if (targetStatuses) {
            // Build conditions array
            const conditions = [];

            // Date range condition - convert to ISO strings
            if (from) {
                conditions.push(sql`${invoices.createdAt} >= ${new Date(from).toISOString()}`);
            }
            if (to) {
                conditions.push(sql`${invoices.createdAt} <= ${new Date(to).toISOString()}`);
            }

            // Status filter - cast to proper enum type
            conditions.push(
                sql`${invoices.status} = ANY(${JSON.stringify(targetStatuses)}::text[])`
            );

            // School filter - support multi-select
            if (schoolIds) {
                conditions.push(inArray(invoices.tenantId, schoolIds));
            }

            // Recalculate financial metrics with status filter
            const [filteredRevenue] = await db
                .select({ total: sql<number>`cast(sum(${invoices.amount}) as integer)` })
                .from(invoices)
                .where(and(...conditions));

            const [filteredTransactions] = await db
                .select({ count: sql<number>`cast(count(*) as integer)` })
                .from(invoices)
                .where(and(...conditions));

            filteredStats.financial = {
                ...stats.financial,
                totalRevenue: filteredRevenue.total || 0,
                totalTransactions: filteredTransactions.count || 0
            };
        }
    }

    return {
        stats: filteredStats,
        filters: {
            schools: schools ? schools.split(',') : [],
            plan: plan || 'all',
            status: status || 'all'
        }
    };
};
