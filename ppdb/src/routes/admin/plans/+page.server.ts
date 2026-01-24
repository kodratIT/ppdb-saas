import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import * as plansDomain from '$lib/server/domain/admin/plans';
import { planCreateSchema, planUpdateSchema } from '$lib/server/validators/admin';

export const load: PageServerLoad = async ({ locals }) => {
    const auth = requireAuth(locals);
    requireSuperAdmin(auth);

    const plans = await plansDomain.getPlans();
    const planStats = await plansDomain.getPlanStatistics();
    const usageMetrics = await plansDomain.getPlanUsageMetrics();
    const allFeatures = await plansDomain.getAllAvailableFeatures();

    return {
        plans,
        planStats,
        usageMetrics,
        allFeatures
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        const auth = requireAuth(locals);
        requireSuperAdmin(auth);
        const formData = Object.fromEntries(await request.formData());

        // Parse complex fields
        const data = {
            ...formData,
            priceMonthly: parseInt(formData.priceMonthly as string),
            priceYearly: parseInt(formData.priceYearly as string),
            isActive: formData.isActive === 'true',
            limits: JSON.parse(formData.limits as string),
            features: JSON.parse(formData.features as string)
        };

        const result = planCreateSchema.safeParse(data);

        if (!result.success) {
            return fail(400, {
                errors: result.error.flatten().fieldErrors,
                data
            });
        }

        try {
            await plansDomain.createPlan(result.data, auth.userId);
            return { success: true };
        } catch (e: any) {
            return fail(500, { message: e.message });
        }
    },

    update: async ({ request, locals }) => {
        const auth = requireAuth(locals);
        requireSuperAdmin(auth);
        const formData = Object.fromEntries(await request.formData());

        const id = formData.id as string;
        if (!id) return fail(400, { message: 'ID is required' });

        // Parse complex fields
        const data = {
            ...formData,
            priceMonthly: formData.priceMonthly ? parseInt(formData.priceMonthly as string) : undefined,
            priceYearly: formData.priceYearly ? parseInt(formData.priceYearly as string) : undefined,
            isActive: formData.isActive !== undefined ? formData.isActive === 'true' : undefined,
            limits: formData.limits ? JSON.parse(formData.limits as string) : undefined,
            features: formData.features ? JSON.parse(formData.features as string) : undefined
        };

        const result = planUpdateSchema.safeParse(data);

        if (!result.success) {
            return fail(400, {
                errors: result.error.flatten().fieldErrors,
                data
            });
        }

        try {
            await plansDomain.updatePlan(id, result.data, auth.userId);
            return { success: true };
        } catch (e: any) {
            return fail(500, { message: e.message });
        }
    },

    delete: async ({ request, locals }) => {
        const auth = requireAuth(locals);
        requireSuperAdmin(auth);
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return fail(400, { message: 'ID is required' });

        try {
            await plansDomain.deletePlan(id);
            return { success: true };
        } catch (e: any) {
            return fail(500, { message: e.message });
        }
    },

    toggleActive: async ({ request, locals }) => {
        const auth = requireAuth(locals);
        requireSuperAdmin(auth);
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const isActive = formData.get('isActive') === 'true';

        if (!id) return fail(400, { message: 'ID is required' });

        try {
            await plansDomain.updatePlan(id, { isActive }, auth.userId);
            return { success: true };
        } catch (e: any) {
            return fail(500, { message: e.message });
        }
    },

    duplicate: async ({ request, locals }) => {
        const auth = requireAuth(locals);
        requireSuperAdmin(auth);
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const newName = formData.get('newName') as string;

        if (!id || !newName) return fail(400, { message: 'ID and new name are required' });

        try {
            await plansDomain.duplicatePlan(id, newName);
            return { success: true };
        } catch (e: any) {
            return fail(500, { message: e.message });
        }
    }
};
