import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { messageTemplates, broadcasts } from '$lib/server/db/schema';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getBroadcastHistory, getBroadcastAnalytics } from '$lib/server/domain/admin/broadcast';
import { broadcastTemplateSchema } from '$lib/server/validators/admin';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    const type = url.searchParams.get('type');

    if (type === 'templates') {
        const templates = await db.query.messageTemplates.findMany({
            orderBy: [desc(messageTemplates.createdAt)]
        });
        return json(templates);
    }

    if (type === 'history') {
        const limit = Number(url.searchParams.get('limit')) || 20;
        const offset = Number(url.searchParams.get('offset')) || 0;
        const history = await getBroadcastHistory(limit, offset);
        return json(history);
    }

    if (type === 'analytics') {
        const days = Number(url.searchParams.get('days')) || 30;
        const analytics = await getBroadcastAnalytics(days);
        return json(analytics);
    }

    return json({ error: 'Invalid type' }, { status: 400 });
};

export const POST: RequestHandler = async ({ request, locals }) => {
    const auth = await requireAuth(locals);
    requireSuperAdmin(auth);

    const body = (await request.json()) as any;
    const action = body.action;

    if (action === 'save_template') {
        const result = broadcastTemplateSchema.safeParse(body.template);
        if (!result.success) {
            return json({ error: result.error.format() }, { status: 400 });
        }

        const data = result.data;
        if (body.template.id) {
            const [updated] = await db
                .update(messageTemplates)
                .set({
                    ...data,
                    updatedAt: new Date()
                })
                .where(eq(messageTemplates.id, body.template.id))
                .returning();
            return json(updated);
        } else {
            const [created] = await db
                .insert(messageTemplates)
                .values({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning();
            return json(created);
        }
    }

    if (action === 'delete_template') {
        const id = body.id;
        if (!id) return json({ error: 'ID required' }, { status: 400 });

        await db.delete(messageTemplates).where(eq(messageTemplates.id, id));
        return json({ success: true });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
};
