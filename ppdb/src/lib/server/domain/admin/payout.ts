import { db } from '$lib/server/db';
import { payouts, tenants, users } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function listPayouts() {
    return await db
        .select({
            id: payouts.id,
            amount: payouts.amount,
            status: payouts.status,
            bankName: payouts.bankName,
            accountNumber: payouts.accountNumber,
            accountName: payouts.accountName,
            reference: payouts.reference,
            tenantName: tenants.name,
            requestedByName: users.name,
            createdAt: payouts.createdAt,
            processedAt: payouts.processedAt
        })
        .from(payouts)
        .innerJoin(tenants, eq(payouts.tenantId, tenants.id))
        .innerJoin(users, eq(payouts.requestedBy, users.id))
        .orderBy(desc(payouts.createdAt));
}

export async function processPayout(payoutId: string, status: 'completed' | 'failed' | 'rejected', reference: string, adminId: string) {
    const [updated] = await db
        .update(payouts)
        .set({
            status,
            reference,
            processedBy: adminId,
            processedAt: new Date(),
            updatedAt: new Date()
        })
        .where(eq(payouts.id, payoutId))
        .returning();

    return updated;
}
