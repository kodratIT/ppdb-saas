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
export const broadcastSchema = z.object({
    targetSegment: z.enum(['all', 'pending_verification', 'accepted', 'rejected', 'waitlisted']),
    messageTemplate: z
        .string()
        .min(10, 'Pesan minimal 10 karakter')
        .max(2000, 'Pesan maksimal 2000 karakter')
});

export type BroadcastInput = z.infer<typeof broadcastSchema>;
