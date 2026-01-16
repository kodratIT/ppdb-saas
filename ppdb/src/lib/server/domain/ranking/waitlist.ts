import { db } from '$lib/server/db';
import { applications, admissionPaths, selectionResultDetails, selectionResults } from '$lib/server/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { sendWhatsappMessage } from '$lib/server/whatsapp/providers/waha';

export class WaitlistService {
	/**
	 * Promotes the next candidate from waitlist when a slot opens up
	 */
	static async processVacancy(tenantId: string, admissionPathId: string) {
		console.log(`Processing vacancy for path ${admissionPathId}`);
		
		const path = await db.query.admissionPaths.findFirst({
			where: eq(admissionPaths.id, admissionPathId)
		});
		if (!path) return;

		// 1. Check Vacancy
		const acceptedCount = await db.$count(
			applications,
			and(
				eq(applications.admissionPathId, admissionPathId),
				eq(applications.status, 'accepted')
			)
		);

		console.log(`Quota: ${path.quota}, Accepted: ${acceptedCount}`);

		if (acceptedCount >= path.quota) {
			console.log('No vacancy available');
			return;
		}

		// 2. Find top waitlisted candidate
		// We look for 'reserved' status in selection details which maps to waitlist
		// Need to find the latest published batch first
		const latestResult = await db.query.selectionResults.findFirst({
			where: eq(selectionResults.admissionPathId, admissionPathId),
			orderBy: [desc(selectionResults.publishedAt)] // Use publishedAt, not finalizedAt (schema check)
		});

		if (!latestResult) {
			console.log('No selection result found');
			return;
		}

		// Find highest ranked candidate (lowest rank number) who is currently waitlisted
		// We join with applications to ensure current status is indeed 'waitlisted'
		// (e.g. not already withdrawn or manually rejected)
		const nextCandidateDetail = await db.query.selectionResultDetails.findFirst({
			where: and(
				eq(selectionResultDetails.selectionResultId, latestResult.id),
				eq(selectionResultDetails.status, 'reserved')
			),
			orderBy: [asc(selectionResultDetails.rank)],
			with: {
				application: true
			}
		});

		if (!nextCandidateDetail || !nextCandidateDetail.application) {
			console.log('No waitlisted candidates found');
			return;
		}
		
		const candidate = nextCandidateDetail.application;

		if (candidate.status !== 'waitlisted') {
			console.log(`Candidate ${candidate.id} has rank but status is ${candidate.status}, skipping`);
			// In a real system we might loop to find the next one. 
			// For MVP, we stop or could recursively call processVacancy again?
			// Let's just return for safety to avoid infinite loops.
			return; 
		}

		console.log(`Promoting candidate: ${candidate.childFullName} (Rank ${nextCandidateDetail.rank})`);

		// 3. Promote Candidate
		await db.transaction(async (tx) => {
			// Update Application Status
			await tx
				.update(applications)
				.set({ 
					status: 'accepted',
					updatedAt: new Date()
				})
				.where(eq(applications.id, candidate.id));
			
			// Update Selection Detail Status
			await tx
				.update(selectionResultDetails)
				.set({ status: 'accepted' }) 
				.where(eq(selectionResultDetails.id, nextCandidateDetail.id));
		});

		// 4. Send Notification
		if (candidate.parentPhone) {
			const message = `*Selamat! Slot Tersedia (PPDB ${path.name})*

Halo Bapak/Ibu ${candidate.parentFullName},

Kabar gembira! Karena adanya pengunduran diri, ananda *${candidate.childFullName}* yang sebelumnya berada di Daftar Tunggu, kini telah mendapatkan slot dan dinyatakan *DITERIMA*.

Silakan segera login ke dashboard untuk melakukan daftar ulang dan pembayaran.

Terima kasih.`;
			
			await sendWhatsappMessage(candidate.parentPhone, message);
		}
	}
}
