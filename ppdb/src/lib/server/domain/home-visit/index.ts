/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '$lib/server/db';
import { homeVisitReports, homeVisitPhotos, auditLogs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export interface HomeVisitSubmission {
	applicationId: string;
	tenantId: string;
	officerId: string;
	surveyData: any;
	gpsLocation?: string;
	summary: string;
	recommendation: string;
	photos: { url: string; caption?: string }[];
}

/**
 * Submit a new home visit report with photos.
 */
export async function submitHomeVisitReport(data: HomeVisitSubmission) {
	return await db.transaction(async (tx) => {
		// 1. Create the report
		const [report] = await tx
			.insert(homeVisitReports)
			.values({
				applicationId: data.applicationId,
				tenantId: data.tenantId,
				officerId: data.officerId,
				surveyData: JSON.stringify(data.surveyData),
				gpsLocation: data.gpsLocation,
				summary: data.summary,
				recommendation: data.recommendation
			})
			.returning();

		// 2. Create photos if any
		if (data.photos && data.photos.length > 0) {
			await tx.insert(homeVisitPhotos).values(
				data.photos.map((p) => ({
					reportId: report.id,
					photoUrl: p.url,
					caption: p.caption
				}))
			);
		}

		// 3. Update application status if needed (optional, depends on workflow)
		// For now, we just log it in audit logs
		await tx.insert(auditLogs).values({
			actorId: data.officerId,
			action: 'submit_home_visit_report',
			target: `application:${data.applicationId}`,
			details: JSON.stringify({
				reportId: report.id,
				recommendation: data.recommendation
			})
		});

		return report;
	});
}

/**
 * Get home visit report for an application.
 */
export async function getHomeVisitReport(applicationId: string, tenantId: string) {
	return await db.query.homeVisitReports.findFirst({
		where: and(
			eq(homeVisitReports.applicationId, applicationId),
			eq(homeVisitReports.tenantId, tenantId)
		),
		with: {
			photos: true,
			officer: true
		}
	});
}
