import { db } from '$lib/server/db';
import { broadcasts, users } from '$lib/server/db/schema';
import { eq, and, lte, isNull } from 'drizzle-orm';
import { createBroadcast } from '../domain/admin/broadcast';

/**
 * Checks for scheduled broadcasts that are due and processes them.
 * This should be called by a cron job or a background worker every minute.
 */
export async function processScheduledBroadcasts() {
    const now = new Date();

    // 1. Find scheduled broadcasts that are due and still in 'scheduled' status
    const pendingBroadcasts = await db
        .select()
        .from(broadcasts)
        .where(
            and(
                eq(broadcasts.status, 'scheduled'),
                lte(broadcasts.scheduledAt, now)
            )
        );

    if (pendingBroadcasts.length === 0) {
        return;
    }

    console.log(`[ScheduledBroadcast] Processing ${pendingBroadcasts.length} broadcasts...`);

    for (const broadcast of pendingBroadcasts) {
        try {
            // Get actual targets based on targetType
            // Re-using createBroadcast logic for target resolution might be complex, 
            // let's just use the same logic here to get admins
            const targetTenantIds = broadcast.targetTenantIds as string[] | null;

            const admins = await db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    tenantId: users.tenantId
                })
                .from(users)
                .where(
                    and(
                        targetTenantIds ? inArray(users.tenantId, targetTenantIds) : undefined,
                        inArray(users.role, ['school_admin', 'super_admin'])
                    )
                );

            // In a real system, we'd use a queue worker here.
            // For now, we call the same processBroadcast helper from domain
            // But since it's internal to broadcast.ts, we might need to export it 
            // OR just call a new function in domain that handles the processing.

            // Trigger processing
            await processBroadcast(broadcast.id, admins);
        } catch (error) {
            console.error(`[ScheduledBroadcast] Failed to process broadcast ${broadcast.id}:`, error);
        }
    }
}

// Helper to satisfy the imports if I were to implement inArray here
import { inArray } from 'drizzle-orm';
import { processBroadcast } from '../domain/admin/broadcast';
