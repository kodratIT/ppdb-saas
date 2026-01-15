import { sendWhatsappMessage } from '$lib/server/whatsapp/providers/waha';
import type { invoices, users, tenants, applications } from '$lib/server/db/schema';

type Invoice = typeof invoices.$inferSelect;
type Tenant = typeof tenants.$inferSelect;
type Application = typeof applications.$inferSelect;
type User = typeof users.$inferSelect;

function formatCurrency(amount: number) {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(amount);
}

function formatDate(date: Date) {
	return new Date(date).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

function getPhoneNumber(application: Application, user: User): string | null {
	// Prioritize application contact info
	// Note: users table might not have phoneNumber explicitly defined in type if not in schema, 
	// but for WAHA users it's their identity.
	// For now we rely on application.parentPhone
	return application.parentPhone || null;
}

export async function sendInvoiceCreatedNotification(
	invoice: Invoice,
	tenant: Tenant,
	application: Application,
	user: User
) {
	const phone = getPhoneNumber(application, user);
	if (!phone) {
		console.warn(`No phone number found for invoice ${invoice.externalId}, skipping notification`);
		return;
	}

	const message = `*Tagihan Pembayaran PPDB - ${tenant.name}*

Halo Bapak/Ibu ${application.parentFullName || user.name},

Tagihan pembayaran pendaftaran untuk calon siswa *${application.childFullName}* telah dibuat.

*Detail Tagihan:*
No. Invoice: ${invoice.externalId}
Jumlah: ${formatCurrency(invoice.amount)}
Batas Waktu: ${formatDate(invoice.expiryDate)}

Silakan lakukan pembayaran melalui link berikut:
${invoice.invoiceUrl}

Terima kasih.`;

	await sendWhatsappMessage(phone, message);
}

export async function sendPaymentSuccessNotification(
	invoice: Invoice,
	tenant: Tenant,
	application: Application,
	user: User
) {
	const phone = getPhoneNumber(application, user);
	if (!phone) {
		console.warn(`No phone number found for invoice ${invoice.externalId}, skipping notification`);
		return;
	}

	const message = `*Pembayaran Berhasil - ${tenant.name}*

Halo Bapak/Ibu ${application.parentFullName || user.name},

Pembayaran untuk calon siswa *${application.childFullName}* telah kami terima.

*Detail Pembayaran:*
No. Invoice: ${invoice.externalId}
Jumlah: ${formatCurrency(invoice.amount)}
Status: LUNAS ✅

Terima kasih telah melakukan pembayaran. Data pendaftaran Anda sedang kami proses.`;

	await sendWhatsappMessage(phone, message);
}

export async function sendPaymentFailedNotification(
	invoice: Invoice,
	tenant: Tenant,
	application: Application,
	user: User
) {
	const phone = getPhoneNumber(application, user);
	if (!phone) {
		console.warn(`No phone number found for invoice ${invoice.externalId}, skipping notification`);
		return;
	}

	const message = `*Pembayaran Gagal/Kadaluarsa - ${tenant.name}*

Halo Bapak/Ibu ${application.parentFullName || user.name},

Mohon maaf, pembayaran untuk calon siswa *${application.childFullName}* tidak berhasil atau telah kadaluarsa.

*Detail:*
No. Invoice: ${invoice.externalId}
Status: ${invoice.status} ❌

Silakan buat tagihan ulang melalui dashboard PPDB atau hubungi admin sekolah jika ada kendala.

Terima kasih.`;

	await sendWhatsappMessage(phone, message);
}
