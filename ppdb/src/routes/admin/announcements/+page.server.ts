 import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    publishAnnouncement,
    archiveAnnouncement,
    unarchiveAnnouncement,
    duplicateAnnouncement,
    getAnnouncementStats,
    getAnnouncementCategories,
    getAnnouncementTemplates,
    createAnnouncementTemplate,
    updateAnnouncementTemplate,
    deleteAnnouncementTemplate,
    getScheduledAnnouncements,
    type AnnouncementStatus,
    type AnnouncementPriority
} from '$lib/server/domain/admin/announcements';
import {
    announcementCreateSchema,
    announcementUpdateSchema,
    announcementTemplateSchema
} from '$lib/server/validators/admin';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { tenants as tenantsTable } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url, depends }) => {
    depends('admin:announcements');

    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    // Parse filters from URL
    const page = parseInt(url.searchParams.get('page') || '1');
    const status = url.searchParams.get('status') || 'all';
    const category = url.searchParams.get('category') || 'all';
    const priority = url.searchParams.get('priority') || 'all';
    const search = url.searchParams.get('search') || '';

    // Get announcements with filters
    const filters = {
        status: status !== 'all' ? (status as AnnouncementStatus) : undefined,
        category: category !== 'all' ? category : undefined,
        priority: priority !== 'all' ? (priority as AnnouncementPriority) : undefined,
        search: search || undefined,
        page,
        limit: 20
    };

    const { data: announcements, total } = await getAnnouncements(filters);

    // Get stats
    const stats = await getAnnouncementStats();

    // Get categories for filter
    const categories = await getAnnouncementCategories();

    // Get templates
    const templates = await getAnnouncementTemplates();

    // Get scheduled announcements
    const scheduledAnnouncements = await getScheduledAnnouncements();

    // Get tenants for targeting
    const allTenants = await db.select({
        id: tenantsTable.id,
        name: tenantsTable.name,
        status: tenantsTable.status
    }).from(tenantsTable);

    return {
        announcements,
        pagination: {
            page,
            total,
            totalPages: Math.ceil(total / 20),
            limit: 20
        },
        stats,
        categories,
        templates,
        scheduledAnnouncements,
        tenants: allTenants,
        filters: { status, category, priority, search }
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const rawData = {
            title: formData.get('title') as string,
            content: formData.get('content') as string,
            contentType: (formData.get('contentType') as string) || 'html',
            targetType: (formData.get('targetType') as string) || 'all',
            targetTenantIds: formData.get('targetTenantIds')
                ? JSON.parse(formData.get('targetTenantIds') as string)
                : [],
            scheduledAt: formData.get('scheduledAt') || null,
            expiresAt: formData.get('expiresAt') || null,
            priority: (formData.get('priority') as string) || 'normal',
            category: formData.get('category') || null,
            tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : []
        };

        const parseResult = announcementCreateSchema.safeParse(rawData);
        if (!parseResult.success) {
            return fail(400, {
                error: parseResult.error.issues[0]?.message || 'Validation failed',
                values: rawData
            });
        }

        try {
            const announcement = await createAnnouncement({
                ...parseResult.data,
                scheduledAt: parseResult.data.scheduledAt ? new Date(parseResult.data.scheduledAt) : null,
                expiresAt: parseResult.data.expiresAt ? new Date(parseResult.data.expiresAt) : null,
                category: parseResult.data.category ?? undefined,
                createdBy: auth.userId
            });

            return { success: true, announcement };
        } catch (e) {
            console.error('Failed to create announcement:', e);
            return fail(500, { error: 'Failed to create announcement' });
        }
    },

    update: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Announcement ID is required' });
        }

        const rawData: Record<string, unknown> = {};

        const title = formData.get('title');
        if (title) rawData.title = title;

        const content = formData.get('content');
        if (content) rawData.content = content;

        const contentType = formData.get('contentType');
        if (contentType) rawData.contentType = contentType;

        const targetType = formData.get('targetType');
        if (targetType) rawData.targetType = targetType;

        const targetTenantIds = formData.get('targetTenantIds');
        if (targetTenantIds) rawData.targetTenantIds = JSON.parse(targetTenantIds as string);

        const scheduledAt = formData.get('scheduledAt');
        if (scheduledAt !== null) rawData.scheduledAt = scheduledAt || null;

        const expiresAt = formData.get('expiresAt');
        if (expiresAt !== null) rawData.expiresAt = expiresAt || null;

        const priority = formData.get('priority');
        if (priority) rawData.priority = priority;

        const category = formData.get('category');
        if (category !== null) rawData.category = category || null;

        const tags = formData.get('tags');
        if (tags) rawData.tags = JSON.parse(tags as string);

        const parseResult = announcementUpdateSchema.safeParse(rawData);
        if (!parseResult.success) {
            return fail(400, {
                error: parseResult.error.issues[0]?.message || 'Validation failed'
            });
        }

        try {
            const updated = await updateAnnouncement(
                id,
                {
                    ...parseResult.data,
                    scheduledAt: parseResult.data.scheduledAt
                        ? new Date(parseResult.data.scheduledAt)
                        : undefined,
                    expiresAt: parseResult.data.expiresAt
                        ? new Date(parseResult.data.expiresAt)
                        : undefined,
                    category: parseResult.data.category ?? undefined
                },
                auth.userId
            );

            if (!updated) {
                return fail(404, { error: 'Announcement not found' });
            }

            return { success: true, announcement: updated };
        } catch (e) {
            console.error('Failed to update announcement:', e);
            return fail(500, { error: 'Failed to update announcement' });
        }
    },

    delete: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Announcement ID is required' });
        }

        try {
            const deleted = await deleteAnnouncement(id);
            if (!deleted) {
                return fail(404, { error: 'Announcement not found' });
            }

            return { success: true };
        } catch (e) {
            console.error('Failed to delete announcement:', e);
            return fail(500, { error: 'Failed to delete announcement' });
        }
    },

    publish: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Announcement ID is required' });
        }

        try {
            const published = await publishAnnouncement(id, auth.userId);
            if (!published) {
                return fail(404, { error: 'Announcement not found' });
            }

            return { success: true };
        } catch (e) {
            console.error('Failed to publish announcement:', e);
            return fail(500, { error: 'Failed to publish announcement' });
        }
    },

    archive: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Announcement ID is required' });
        }

        try {
            const archived = await archiveAnnouncement(id, auth.userId);
            if (!archived) {
                return fail(404, { error: 'Announcement not found' });
            }

            return { success: true };
        } catch (e) {
            console.error('Failed to archive announcement:', e);
            return fail(500, { error: 'Failed to archive announcement' });
        }
    },

    unarchive: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Announcement ID is required' });
        }

        try {
            const unarchived = await unarchiveAnnouncement(id, auth.userId);
            if (!unarchived) {
                return fail(404, { error: 'Announcement not found' });
            }

            return { success: true };
        } catch (e) {
            console.error('Failed to unarchive announcement:', e);
            return fail(500, { error: 'Failed to unarchive announcement' });
        }
    },

    duplicate: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Announcement ID is required' });
        }

        try {
            const duplicated = await duplicateAnnouncement(id, auth.userId);
            if (!duplicated) {
                return fail(404, { error: 'Announcement not found' });
            }

            return { success: true, announcement: duplicated };
        } catch (e) {
            console.error('Failed to duplicate announcement:', e);
            return fail(500, { error: 'Failed to duplicate announcement' });
        }
    },

    saveTemplate: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const rawData = {
            name: formData.get('name') as string,
            category: formData.get('category') || null,
            title: formData.get('title') as string,
            content: formData.get('content') as string,
            contentType: (formData.get('contentType') as string) || 'html',
            priority: (formData.get('priority') as string) || 'normal'
        };

        const parseResult = announcementTemplateSchema.safeParse(rawData);
        if (!parseResult.success) {
            return fail(400, {
                error: parseResult.error.issues[0]?.message || 'Validation failed'
            });
        }

        try {
            const template = await createAnnouncementTemplate({
                ...parseResult.data,
                category: parseResult.data.category ?? undefined,
                createdBy: auth.userId
            });

            return { success: true, template };
        } catch (e) {
            console.error('Failed to save template:', e);
            return fail(500, { error: 'Failed to save template' });
        }
    },

    updateTemplate: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Template ID is required' });
        }

        const rawData: Record<string, unknown> = {};

        const name = formData.get('name');
        if (name) rawData.name = name;

        const category = formData.get('category');
        if (category !== null) rawData.category = category || null;

        const title = formData.get('title');
        if (title) rawData.title = title;

        const content = formData.get('content');
        if (content) rawData.content = content;

        const contentType = formData.get('contentType');
        if (contentType) rawData.contentType = contentType;

        const priority = formData.get('priority');
        if (priority) rawData.priority = priority;

        try {
            const updated = await updateAnnouncementTemplate(id, rawData as Parameters<typeof updateAnnouncementTemplate>[1]);

            if (!updated) {
                return fail(404, { error: 'Template not found' });
            }

            return { success: true, template: updated };
        } catch (e) {
            console.error('Failed to update template:', e);
            return fail(500, { error: 'Failed to update template' });
        }
    },

    deleteTemplate: async ({ request, locals }) => {
        const auth = await requireAuth(locals);
        requireSuperAdmin(auth);

        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { error: 'Template ID is required' });
        }

        try {
            const deleted = await deleteAnnouncementTemplate(id);
            if (!deleted) {
                return fail(404, { error: 'Template not found' });
            }

            return { success: true };
        } catch (e) {
            console.error('Failed to delete template:', e);
            return fail(500, { error: 'Failed to delete template' });
        }
    }
};
