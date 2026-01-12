import { z } from 'zod';

export const registrationSchema = z.object({
	// Step 1: Data Anak
	admissionPathId: z.string().min(1, 'Jalur pendaftaran harus dipilih'),
	childFullName: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100),
	childNickname: z.string().max(50).optional(),
	childDob: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Tanggal lahir tidak valid'
	}),
	childGender: z.enum(['male', 'female'], {
		error: 'Jenis kelamin harus dipilih'
	} as any),

	// Step 2: Data Orang Tua
	parentFullName: z.string().min(3, 'Nama orang tua minimal 3 karakter').max(100),
	parentPhone: z
		.string()
		.min(10, 'Nomor telepon minimal 10 digit')
		.regex(/^[0-9]+$/, 'Nomor telepon hanya boleh angka'),
	parentEmail: z.string().email('Format email tidak valid').optional().or(z.literal('')),

	// Step 3: Alamat
	address: z.string().min(10, 'Alamat minimal 10 karakter'),
	city: z.string().min(2, 'Kota/Kabupaten harus diisi'),
	province: z.string().min(2, 'Provinsi harus diisi'),
	postalCode: z.string().length(5, 'Kode pos harus 5 digit').optional().or(z.literal(''))
});

export type RegistrationSchema = z.infer<typeof registrationSchema>;

// Per-step schemas for partial validation
export const step1Schema = registrationSchema.pick({
	admissionPathId: true,
	childFullName: true,
	childNickname: true,
	childDob: true,
	childGender: true
});

export const step2Schema = registrationSchema.pick({
	parentFullName: true,
	parentPhone: true,
	parentEmail: true
});

export const step3Schema = registrationSchema.pick({
	address: true,
	city: true,
	province: true,
	postalCode: true
});
