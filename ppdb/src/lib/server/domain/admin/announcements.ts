import { db } from '$lib/server/db';
import {
    announcements,
    announcementTemplates,
    announcementViews,
    tenants
} from '$lib/server/db/schema';
import { eq, desc, asc, sql, and, or, like, inArray, gte, lte, count } from 'drizzle-orm';

// ============================================
// Types
// ============================================

export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
export type AnnouncementTargetType = 'all' | 'active' | 'inactive' | 'custom';
export type AnnouncementContentType = 'html' | 'markdown';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    contentType: AnnouncementContentType;
    status: AnnouncementStatus;
    targetType: AnnouncementTargetType;
    targetTenantIds: string[];
    publishedAt: Date | null;
    scheduledAt: Date | null;
    expiresAt: Date | null;
    viewCount: number;
    clickCount: number;
    priority: AnnouncementPriority;
    category: string | null;
    tags: string[];
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AnnouncementTemplate {
    id: string;
    name: string;
    category: string | null;
    title: string;
    content: string;
    contentType: AnnouncementContentType;
    priority: AnnouncementPriority;
    usageCount: number;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAnnouncementInput {
    title: string;
    content: string;
    contentType?: AnnouncementContentType;
    targetType?: AnnouncementTargetType;
    targetTenantIds?: string[];
    scheduledAt?: Date | null;
    expiresAt?: Date | null;
    priority?: AnnouncementPriority;
    category?: string;
    tags?: string[];
    createdBy: string;
}

export interface UpdateAnnouncementInput {
    title?: string;
    content?: string;
    contentType?: AnnouncementContentType;
    targetType?: AnnouncementTargetType;
    targetTenantIds?: string[];
    scheduledAt?: Date | null;
    expiresAt?: Date | null;
    priority?: AnnouncementPriority;
    category?: string;
    tags?: string[];
}

export interface AnnouncementFilters {
    status?: AnnouncementStatus;
    targetType?: AnnouncementTargetType;
    category?: string;
    priority?: AnnouncementPriority;
    search?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
}

export interface AnnouncementStats {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    archived: number;
    totalViews: number;
    totalClicks: number;
}

// ============================================
// CRUD Operations
// ============================================

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
    const now = new Date();

    const [created] = await db
        .insert(announcements)
        .values({
            title: input.title,
            content: input.content,
            contentType: input.contentType || 'html',
            status: 'draft',
            targetType: input.targetType || 'all',
            targetTenantIds: input.targetTenantIds || [],
            scheduledAt: input.scheduledAt,
            expiresAt: input.expiresAt,
            priority: input.priority || 'normal',
            category: input.category,
            tags: input.tags || [],
            createdBy: input.createdBy,
            updatedBy: input.createdBy,
            createdAt: now,
            updatedAt: now
        })
        .returning();

    return mapToAnnouncement(created);
}

export async function updateAnnouncement(
    id: string,
    input: UpdateAnnouncementInput,
    updatedBy: string
): Promise<Announcement | null> {
    const [updated] = await db
        .update(announcements)
        .set({
            ...input,
            updatedBy,
            updatedAt: new Date()
        })
        .where(eq(announcements.id, id))
        .returning();

    if (!updated) return null;
    return mapToAnnouncement(updated);
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
    const result = await db.delete(announcements).where(eq(announcements.id, id)).returning();
    return result.length > 0;
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
    const [result] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);

    if (!result) return null;
    return mapToAnnouncement(result);
}

export async function getAnnouncements(
    filters: AnnouncementFilters = {}
): Promise<{ data: Announcement[]; total: number }> {
    const { page = 1, limit = 20, status, category, priority, search, fromDate, toDate } = filters;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions = [];

    if (status) {
        conditions.push(eq(announcements.status, status));
    }

    if (category) {
        conditions.push(eq(announcements.category, category));
    }

    if (priority) {
        conditions.push(eq(announcements.priority, priority));
    }

    if (search) {
        conditions.push(
            or(
                like(announcements.title, `%${search}%`),
                like(announcements.content, `%${search}%`),
                like(announcements.category, `%${search}%`)
            )
        );
    }

    if (fromDate) {
        conditions.push(gte(announcements.createdAt, fromDate));
    }

    if (toDate) {
        conditions.push(lte(announcements.createdAt, toDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get data
    const data = await db
        .select()
        .from(announcements)
        .where(whereClause)
        .orderBy(desc(announcements.createdAt))
        .limit(limit)
        .offset(offset);

    // Get total count
    const [countResult] = await db
        .select({ count: count() })
        .from(announcements)
        .where(whereClause);

    return {
        data: data.map(mapToAnnouncement),
        total: countResult?.count || 0
    };
}

// ============================================
// Publishing Workflow
// ============================================

export async function publishAnnouncement(id: string, updatedBy: string): Promise<boolean> {
    const result = await db
        .update(announcements)
        .set({
            status: 'published',
            publishedAt: new Date(),
            updatedBy,
            updatedAt: new Date()
        })
        .where(eq(announcements.id, id))
        .returning();

    return result.length > 0;
}

export async function scheduleAnnouncement(
    id: string,
    scheduledAt: Date,
    updatedBy: string
): Promise<boolean> {
    const result = await db
        .update(announcements)
        .set({
            status: 'scheduled',
            scheduledAt,
            updatedBy,
            updatedAt: new Date()
        })
        .where(eq(announcements.id, id))
        .returning();

    return result.length > 0;
}

export async function archiveAnnouncement(id: string, updatedBy: string): Promise<boolean> {
    const result = await db
        .update(announcements)
        .set({
            status: 'archived',
            updatedBy,
            updatedAt: new Date()
        })
        .where(eq(announcements.id, id))
        .returning();

    return result.length > 0;
}

export async function unarchiveAnnouncement(id: string, updatedBy: string): Promise<boolean> {
    const result = await db
        .update(announcements)
        .set({
            status: 'draft',
            updatedBy,
            updatedAt: new Date()
        })
        .where(eq(announcements.id, id))
        .returning();

    return result.length > 0;
}

export async function duplicateAnnouncement(
    id: string,
    createdBy: string
): Promise<Announcement | null> {
    const original = await getAnnouncementById(id);
    if (!original) return null;

    return createAnnouncement({
        title: `${original.title} (Copy)`,
        content: original.content,
        contentType: original.contentType,
        targetType: original.targetType,
        targetTenantIds: original.targetTenantIds,
        priority: original.priority,
        category: original.category ?? undefined,
        tags: original.tags,
        createdBy
    });
}

// ============================================
// Statistics
// ============================================

export async function getAnnouncementStats(): Promise<AnnouncementStats> {
    // Get status counts
    const statusCounts = await db
        .select({
            status: announcements.status,
            count: count()
        })
        .from(announcements)
        .groupBy(announcements.status);

    // Get totals
    const [totals] = await db
        .select({
            totalViews: sql<number>`COALESCE(SUM(${announcements.viewCount}), 0)`,
            totalClicks: sql<number>`COALESCE(SUM(${announcements.clickCount}), 0)`
        })
        .from(announcements);

    const stats: AnnouncementStats = {
        total: 0,
        published: 0,
        draft: 0,
        scheduled: 0,
        archived: 0,
        totalViews: Number(totals?.totalViews) || 0,
        totalClicks: Number(totals?.totalClicks) || 0
    };

    for (const row of statusCounts) {
        const c = Number(row.count);
        stats.total += c;
        switch (row.status) {
            case 'published':
                stats.published = c;
                break;
            case 'draft':
                stats.draft = c;
                break;
            case 'scheduled':
                stats.scheduled = c;
                break;
            case 'archived':
                stats.archived = c;
                break;
        }
    }

    return stats;
}

export async function recordAnnouncementView(
    announcementId: string,
    tenantId: string
): Promise<void> {
    // Record view
    await db.insert(announcementViews).values({
        announcementId,
        tenantId,
        viewedAt: new Date()
    });

    // Update view count
    await db
        .update(announcements)
        .set({
            viewCount: sql`${announcements.viewCount} + 1`
        })
        .where(eq(announcements.id, announcementId));
}

export async function recordAnnouncementClick(announcementId: string): Promise<void> {
    await db
        .update(announcements)
        .set({
            clickCount: sql`${announcements.clickCount} + 1`
        })
        .where(eq(announcements.id, announcementId));
}

// ============================================
// Templates
// ============================================

export async function getAnnouncementTemplates(): Promise<AnnouncementTemplate[]> {
    const results = await db
        .select()
        .from(announcementTemplates)
        .orderBy(desc(announcementTemplates.usageCount), desc(announcementTemplates.createdAt));

    return results.map(mapToAnnouncementTemplate);
}

export async function createAnnouncementTemplate(input: {
    name: string;
    category?: string;
    title: string;
    content: string;
    contentType?: AnnouncementContentType;
    priority?: AnnouncementPriority;
    createdBy: string;
}): Promise<AnnouncementTemplate> {
    const now = new Date();

    const [created] = await db
        .insert(announcementTemplates)
        .values({
            name: input.name,
            category: input.category,
            title: input.title,
            content: input.content,
            contentType: input.contentType || 'html',
            priority: input.priority || 'normal',
            usageCount: 0,
            createdBy: input.createdBy,
            createdAt: now,
            updatedAt: now
        })
        .returning();

    return mapToAnnouncementTemplate(created);
}

export async function updateAnnouncementTemplate(
    id: string,
    input: Partial<{
        name: string;
        category: string;
        title: string;
        content: string;
        contentType: AnnouncementContentType;
        priority: AnnouncementPriority;
    }>
): Promise<AnnouncementTemplate | null> {
    const [updated] = await db
        .update(announcementTemplates)
        .set({
            ...input,
            updatedAt: new Date()
        })
        .where(eq(announcementTemplates.id, id))
        .returning();

    if (!updated) return null;
    return mapToAnnouncementTemplate(updated);
}

export async function deleteAnnouncementTemplate(id: string): Promise<boolean> {
    const result = await db
        .delete(announcementTemplates)
        .where(eq(announcementTemplates.id, id))
        .returning();

    return result.length > 0;
}

export async function incrementTemplateUsage(id: string): Promise<void> {
    await db
        .update(announcementTemplates)
        .set({
            usageCount: sql`${announcementTemplates.usageCount} + 1`
        })
        .where(eq(announcementTemplates.id, id));
}

// ============================================
// Categories
// ============================================

export async function getAnnouncementCategories(): Promise<string[]> {
    const results = await db
        .selectDistinct({ category: announcements.category })
        .from(announcements)
        .where(sql`${announcements.category} IS NOT NULL AND ${announcements.category} != ''`);

    return results.map((r) => r.category).filter((c): c is string => c !== null);
}

// ============================================
// Scheduled Announcements
// ============================================

export async function getScheduledAnnouncements(): Promise<Announcement[]> {
    const results = await db
        .select()
        .from(announcements)
        .where(eq(announcements.status, 'scheduled'))
        .orderBy(asc(announcements.scheduledAt));

    return results.map(mapToAnnouncement);
}

export async function publishScheduledAnnouncements(): Promise<number> {
    const now = new Date();

    const result = await db
        .update(announcements)
        .set({
            status: 'published',
            publishedAt: now,
            updatedAt: now
        })
        .where(
            and(
                eq(announcements.status, 'scheduled'),
                lte(announcements.scheduledAt, now)
            )
        )
        .returning();

    return result.length;
}

// ============================================
// Published Announcements (for tenant dashboard)
// ============================================

export async function getPublishedAnnouncements(tenantId?: string): Promise<Announcement[]> {
    const now = new Date();

    const conditions = [
        eq(announcements.status, 'published'),
        or(
            sql`${announcements.expiresAt} IS NULL`,
            gte(announcements.expiresAt, now)
        )
    ];

    const results = await db
        .select()
        .from(announcements)
        .where(and(...conditions))
        .orderBy(desc(announcements.priority), desc(announcements.publishedAt))
        .limit(10);

    // Filter by tenant targeting if provided
    if (tenantId) {
        return results
            .filter((ann) => {
                const targetType = ann.targetType;
                if (targetType === 'all') return true;
                if (targetType === 'custom') {
                    const ids = (ann.targetTenantIds as string[]) || [];
                    return ids.includes(tenantId);
                }
                // For active/inactive targeting, we'd need tenant status check
                return true;
            })
            .map(mapToAnnouncement);
    }

    return results.map(mapToAnnouncement);
}

// ============================================
// Helper Functions
// ============================================

function mapToAnnouncement(row: typeof announcements.$inferSelect): Announcement {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        contentType: row.contentType as AnnouncementContentType,
        status: row.status as AnnouncementStatus,
        targetType: row.targetType as AnnouncementTargetType,
        targetTenantIds: (row.targetTenantIds as string[]) || [],
        publishedAt: row.publishedAt,
        scheduledAt: row.scheduledAt,
        expiresAt: row.expiresAt,
        viewCount: row.viewCount,
        clickCount: row.clickCount,
        priority: row.priority as AnnouncementPriority,
        category: row.category,
        tags: (row.tags as string[]) || [],
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}

function mapToAnnouncementTemplate(
    row: typeof announcementTemplates.$inferSelect
): AnnouncementTemplate {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        title: row.title,
        content: row.content,
        contentType: row.contentType as AnnouncementContentType,
        priority: row.priority as AnnouncementPriority,
        usageCount: row.usageCount,
        createdBy: row.createdBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}
