import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as notifications from '../../src/lib/server/domain/payment/notifications';

const { mockDb } = vi.hoisted(() => {
	return {
		mockDb: {
			query: {
				invoices: {
					findFirst: vi.fn()
				},
				paymentProofs: {
					findFirst: vi.fn()
				}
			},
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			returning: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis()
		}
	};
});

vi.mock('$lib/server/db', () => ({
	db: mockDb
}));

// Mock SvelteKit error
vi.mock('@sveltejs/kit', () => ({
	error: (status: number, message: string) => {
		const err = new Error(message);
		(err as any).status = status;
		throw err;
	}
}));

// Mock Notifications
vi.mock('../../src/lib/server/domain/payment/notifications', () => ({
	sendPaymentSuccessNotification: vi.fn(),
	sendPaymentFailedNotification: vi.fn()
}));

// Import subject under test AFTER mocks are set up (though with hoisting it might not strictly matter for static imports, but good practice if using doMock)
import {
	submitPaymentProof,
	processVerification
} from '../../src/lib/server/domain/payment/verification';

describe('Payment Verification Domain', () => {
	const tenantId = 'tenant-123';
	const invoiceId = 'inv-123';
	const proofId = 'proof-123';
	const userId = 'user-123';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('submitPaymentProof', () => {
		it('should submit proof successfully', async () => {
			const mockInvoice = {
				id: invoiceId,
				tenantId,
				status: 'PENDING'
			};

			mockDb.query.invoices.findFirst.mockResolvedValue(mockInvoice);

			const mockProof = {
				id: proofId,
				tenantId,
				invoiceId,
				fileUrl: 'http://example.com/proof.jpg',
				status: 'PENDING'
			};

			// Mock insert chain
			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockProof])
				})
			});

			const result = await submitPaymentProof(tenantId, invoiceId, 'http://example.com/proof.jpg');

			expect(mockDb.query.invoices.findFirst).toHaveBeenCalled();
			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.update).toHaveBeenCalled(); // Should update invoice status
			expect(result).toEqual(mockProof);
		});

		it('should throw if invoice not found', async () => {
			mockDb.query.invoices.findFirst.mockResolvedValue(null);

			await expect(
				submitPaymentProof(tenantId, invoiceId, 'http://example.com/proof.jpg')
			).rejects.toThrow('Invoice not found');
		});

		it('should throw if invoice already paid', async () => {
			mockDb.query.invoices.findFirst.mockResolvedValue({
				id: invoiceId,
				tenantId,
				status: 'PAID'
			});

			await expect(
				submitPaymentProof(tenantId, invoiceId, 'http://example.com/proof.jpg')
			).rejects.toThrow('Invoice is already paid');
		});
	});

	describe('processVerification', () => {
		const mockInvoice = {
			id: invoiceId,
			tenantId,
			amount: 100000,
			status: 'VERIFYING',
			tenant: { name: 'School' },
			application: {
				user: { email: 'parent@test.com' },
				childFullName: 'Student'
			}
		};

		const mockProof = {
			id: proofId,
			tenantId,
			status: 'PENDING',
			invoice: mockInvoice
		};

		it('should accept proof and update invoice', async () => {
			mockDb.query.paymentProofs.findFirst.mockResolvedValue(mockProof);

			// Mock update chains
			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([{ ...mockProof, status: 'ACCEPTED' }])
					})
				})
			});

			// Mock insert transaction
			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue(Promise.resolve()) // Transaction insert
			});

			await processVerification(tenantId, proofId, 'accept', userId);

			expect(mockDb.update).toHaveBeenCalledTimes(2); // Proof and Invoice
			expect(notifications.sendPaymentSuccessNotification).toHaveBeenCalled();
			expect(mockDb.insert).toHaveBeenCalled(); // Transaction
		});

		it('should reject proof and update invoice', async () => {
			mockDb.query.paymentProofs.findFirst.mockResolvedValue(mockProof);

			// Mock update chains
			mockDb.update.mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						returning: vi.fn().mockResolvedValue([{ ...mockProof, status: 'REJECTED' }])
					})
				})
			});

			await processVerification(tenantId, proofId, 'reject', userId, 'Blurry image');

			expect(mockDb.update).toHaveBeenCalledTimes(2); // Proof and Invoice
			expect(notifications.sendPaymentFailedNotification).toHaveBeenCalled();
		});

		it('should throw if proof not found', async () => {
			mockDb.query.paymentProofs.findFirst.mockResolvedValue(null);

			await expect(processVerification(tenantId, proofId, 'accept', userId)).rejects.toThrow(
				'Payment proof not found'
			);
		});

		it('should throw if proof already processed', async () => {
			mockDb.query.paymentProofs.findFirst.mockResolvedValue({
				...mockProof,
				status: 'ACCEPTED'
			});

			await expect(processVerification(tenantId, proofId, 'accept', userId)).rejects.toThrow(
				'Proof is already processed'
			);
		});
	});
});
