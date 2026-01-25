import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users, tenants } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    // Redirect to new system users page
    throw redirect(302, '/admin/system/users');

    // Get all platform users with their roles
    const allUsers = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            status: users.status,
            tenantName: tenants.name,
            createdAt: users.createdAt
        })
        .from(users)
        .leftJoin(tenants, eq(users.tenantId, tenants.id))
        .orderBy(desc(users.createdAt));

    // Role statistics
    const roleStats = await db
        .select({
            role: users.role,
            count: sql<number>`cast(count(*) as integer)`
        })
        .from(users)
        .groupBy(users.role);

    return {
        users: allUsers,
        roleStats: roleStats.map((r) => ({ role: r.role, count: Number(r.count) }))
    };
};

export const actions: Actions = {
    updateRole: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const userId = formData.get('userId')?.toString();
        const newRole = formData.get('role')?.toString();

        if (!userId || !newRole) {
            return { error: 'Missing required fields' };
        }

        await db
            .update(users)
            .set({ role: newRole as any, updatedAt: new Date() })
            .where(eq(users.id, userId));

        return { success: true };
    },

    updateStatus: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const userId = formData.get('userId')?.toString();
        const newStatus = formData.get('status')?.toString();

        if (!userId || !newStatus) {
            return { error: 'Missing required fields' };
        }

        await db
            .update(users)
            .set({ status: newStatus as any, updatedAt: new Date() })
            .where(eq(users.id, userId));

        return { success: true };
    }
};
