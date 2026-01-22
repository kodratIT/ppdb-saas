import { z } from 'zod';

// Tenant Creation Schema
export const createTenantSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
    slug: z
        .string()
        .min(2, 'Slug minimal 2 karakter')
        .max(50, 'Slug maksimal 50 karakter')
        .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan hyphen')
        .refine(
            (val) => !['www', 'app', 'api', 'admin', 'super-admin', 'sign-in', 'sign-up'].includes(val),
            {
                message: 'Slug ini reserved dan tidak bisa digunakan'
            }
        ),
    type: z.enum(['single', 'foundation']).default('single'),
    npsn: z
        .string()
        .optional()
        .refine((val) => !val || /^[0-9]{8}$/.test(val), {
            message: 'NPSN harus 8 digit angka'
        }),
    level: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    address: z.string().max(500, 'Alamat maksimal 500 karakter').optional(),
    postalCode: z
        .string()
        .optional()
        .refine((val) => !val || /^[0-9]{5}$/.test(val), {
            message: 'Kode pos harus 5 digit angka'
        })
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

// Tenant Update Schema
export const updateTenantSchema = z
    .object({
        id: z.string().uuid('ID tidak valid'),
        name: z.string().min(2).max(100).optional(),
        status: z.enum(['active', 'inactive']).optional(),
        level: z.string().optional()
    })
    .refine((data) => data.name || data.status, {
        message: 'Minimal ada satu field yang diupdate'
    });

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;

// User Invitation Schema
export const inviteUserSchema = z.object({
    email: z.string().email('Email tidak valid'),
    role: z.enum(['school_admin', 'verifier', 'treasurer', 'interviewer', 'field_officer']),
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100).optional()
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

// Fee Structure Schema
export const feeStructureSchema = z.object({
    name: z.string().min(2, 'Nama biaya minimal 2 karakter').max(100),
    amount: z.number().int().positive('Jumlah harus positif'),
    currency: z.string().default('IDR'),
    paymentTiming: z.enum(['registration', 'acceptance', 'enrollment', 'custom']),
    dueDateOffsetDays: z.number().int().min(0).default(0),
    penaltyAmount: z.number().int().min(0).optional(),
    penaltyGraceDays: z.number().int().min(0).optional()
});

export type FeeStructureInput = z.infer<typeof feeStructureSchema>;

// Admission Path Schema
export const admissionPathSchema = z.object({
    name: z.string().min(2, 'Nama jalur minimal 2 karakter').max(100),
    description: z.string().max(500).optional(),
    quota: z.number().int().positive('Kuota harus positif'),
    unitId: z.string().uuid().optional(),
    announcementDate: z.string().datetime().optional()
});

export type AdmissionPathInput = z.infer<typeof admissionPathSchema>;

// Broadcast Message Schema
export const broadcastCreateSchema = z.object({
    targetType: z.enum(['all', 'active', 'inactive', 'custom']),
    targetTenantIds: z.array(z.string()).optional(),
    message: z.string().min(10, 'Pesan minimal 10 karakter').max(2000, 'Pesan maksimal 2000 karakter'),
    scheduledAt: z.string().datetime().optional().nullable(),
    templateId: z.string().optional().nullable(),
    variables: z.record(z.string(), z.string()).optional()
});

export const broadcastTemplateSchema = z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
    category: z.string().max(50).optional(),
    message: z.string().min(10, 'Pesan minimal 10 karakter').max(2000),
    variables: z.array(z.string()).default([])
});

export type BroadcastCreateInput = z.infer<typeof broadcastCreateSchema>;
export type BroadcastTemplateInput = z.infer<typeof broadcastTemplateSchema>;

// Announcement Schemas
export const announcementCreateSchema = z.object({
    title: z.string().min(3, 'Judul minimal 3 karakter').max(200, 'Judul maksimal 200 karakter'),
    content: z
        .string()
        .min(10, 'Konten minimal 10 karakter')
        .max(10000, 'Konten maksimal 10000 karakter'),
    contentType: z.enum(['html', 'markdown']).default('html'),
    targetType: z.enum(['all', 'active', 'inactive', 'custom']).default('all'),
    targetTenantIds: z.array(z.string()).optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    category: z.string().max(50).optional().nullable(),
    tags: z.array(z.string()).optional()
});

export const announcementUpdateSchema = announcementCreateSchema.partial();

export const announcementFilterSchema = z.object({
    status: z.enum(['all', 'draft', 'scheduled', 'published', 'archived']).default('all'),
    category: z.string().optional(),
    priority: z.enum(['all', 'low', 'normal', 'high', 'urgent']).default('all'),
    search: z.string().optional(),
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(20)
});

export const announcementTemplateSchema = z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter').max(100),
    category: z.string().max(50).optional().nullable(),
    title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
    content: z.string().min(10, 'Konten minimal 10 karakter').max(10000),
    contentType: z.enum(['html', 'markdown']).default('html'),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal')
});

export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;
export type AnnouncementUpdateInput = z.infer<typeof announcementUpdateSchema>;
export type AnnouncementFilterInput = z.infer<typeof announcementFilterSchema>;
export type AnnouncementTemplateInput = z.infer<typeof announcementTemplateSchema>;


// Plan Schemas
export const planLimitsSchema = z.object({
    maxStudents: z.number().int().nonnegative().optional().nullable(),
    maxAdmins: z.number().int().nonnegative().optional().nullable(),
    maxDocumentsPerStudent: z.number().int().nonnegative().optional().nullable(),
    storageGb: z.number().nonnegative().optional().nullable(),
    whatsappBlastCredits: z.number().int().nonnegative().optional().nullable(),
    customDomains: z.boolean().optional().default(false),
    advancedAnalytics: z.boolean().optional().default(false),
    prioritySupport: z.boolean().optional().default(false),
    sla: z.string().optional().nullable(),
    apiAccess: z.boolean().optional().default(false),
    whiteLabel: z.boolean().optional().default(false)
});

export const planCreateSchema = z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
    slug: z
        .string()
        .min(2, 'Slug minimal 2 karakter')
        .max(50)
        .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan hyphen'),
    description: z.string().max(500).optional().nullable(),
    priceMonthly: z.number().int().nonnegative('Harga bulanan tidak boleh negatif'),
    priceYearly: z.number().int().nonnegative('Harga tahunan tidak boleh negatif'),
    limits: planLimitsSchema,
    features: z.array(z.string()).default([]),
    isActive: z.boolean().default(true)
});

export const planUpdateSchema = planCreateSchema.partial();

export type PlanLimitsInput = z.infer<typeof planLimitsSchema>;
export type PlanCreateInput = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;
