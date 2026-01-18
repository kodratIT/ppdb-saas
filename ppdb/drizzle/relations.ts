import { relations } from "drizzle-orm/relations";
import { tenants, applications, users, admissionPaths, applicationScores, customFields, applicationDocuments, documentReviews, feeStructures, fieldOptions, homeVisitReports, invoices, broadcasts, paymentTransactions, selectionResults, sessions, schoolProfiles, paymentProofs, homeVisitPhotos, selectionResultDetails } from "./schema";

export const applicationsRelations = relations(applications, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [applications.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [applications.userId],
		references: [users.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [applications.admissionPathId],
		references: [admissionPaths.id]
	}),
	applicationScores: many(applicationScores),
	homeVisitReports: many(homeVisitReports),
	invoices: many(invoices),
	applicationDocuments: many(applicationDocuments),
	selectionResultDetails: many(selectionResultDetails),
}));

export const tenantsRelations = relations(tenants, ({many}) => ({
	applications: many(applications),
	applicationScores: many(applicationScores),
	admissionPaths: many(admissionPaths),
	customFields: many(customFields),
	documentReviews: many(documentReviews),
	feeStructures: many(feeStructures),
	homeVisitReports: many(homeVisitReports),
	invoices: many(invoices),
	broadcasts: many(broadcasts),
	selectionResults: many(selectionResults),
	sessions: many(sessions),
	schoolProfiles: many(schoolProfiles),
	paymentProofs: many(paymentProofs),
	applicationDocuments: many(applicationDocuments),
	users: many(users),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	applications: many(applications),
	applicationScores_scorerId: many(applicationScores, {
		relationName: "applicationScores_scorerId_users_id"
	}),
	applicationScores_unlockedBy: many(applicationScores, {
		relationName: "applicationScores_unlockedBy_users_id"
	}),
	documentReviews: many(documentReviews),
	homeVisitReports: many(homeVisitReports),
	broadcasts: many(broadcasts),
	selectionResults: many(selectionResults),
	sessions: many(sessions),
	paymentProofs: many(paymentProofs),
	applicationDocuments: many(applicationDocuments),
	tenant: one(tenants, {
		fields: [users.tenantId],
		references: [tenants.id]
	}),
}));

export const admissionPathsRelations = relations(admissionPaths, ({one, many}) => ({
	applications: many(applications),
	tenant: one(tenants, {
		fields: [admissionPaths.tenantId],
		references: [tenants.id]
	}),
	customFields: many(customFields),
	feeStructures: many(feeStructures),
	selectionResults: many(selectionResults),
}));

export const applicationScoresRelations = relations(applicationScores, ({one}) => ({
	application: one(applications, {
		fields: [applicationScores.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [applicationScores.tenantId],
		references: [tenants.id]
	}),
	user_scorerId: one(users, {
		fields: [applicationScores.scorerId],
		references: [users.id],
		relationName: "applicationScores_scorerId_users_id"
	}),
	user_unlockedBy: one(users, {
		fields: [applicationScores.unlockedBy],
		references: [users.id],
		relationName: "applicationScores_unlockedBy_users_id"
	}),
}));

export const customFieldsRelations = relations(customFields, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [customFields.tenantId],
		references: [tenants.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [customFields.admissionPathId],
		references: [admissionPaths.id]
	}),
	fieldOptions: many(fieldOptions),
}));

export const documentReviewsRelations = relations(documentReviews, ({one}) => ({
	applicationDocument: one(applicationDocuments, {
		fields: [documentReviews.documentId],
		references: [applicationDocuments.id]
	}),
	tenant: one(tenants, {
		fields: [documentReviews.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [documentReviews.reviewerId],
		references: [users.id]
	}),
}));

export const applicationDocumentsRelations = relations(applicationDocuments, ({one, many}) => ({
	documentReviews: many(documentReviews),
	application: one(applications, {
		fields: [applicationDocuments.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [applicationDocuments.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [applicationDocuments.verifiedBy],
		references: [users.id]
	}),
}));

export const feeStructuresRelations = relations(feeStructures, ({one}) => ({
	tenant: one(tenants, {
		fields: [feeStructures.tenantId],
		references: [tenants.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [feeStructures.admissionPathId],
		references: [admissionPaths.id]
	}),
}));

export const fieldOptionsRelations = relations(fieldOptions, ({one}) => ({
	customField: one(customFields, {
		fields: [fieldOptions.customFieldId],
		references: [customFields.id]
	}),
}));

export const homeVisitReportsRelations = relations(homeVisitReports, ({one, many}) => ({
	application: one(applications, {
		fields: [homeVisitReports.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [homeVisitReports.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [homeVisitReports.officerId],
		references: [users.id]
	}),
	homeVisitPhotos: many(homeVisitPhotos),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [invoices.tenantId],
		references: [tenants.id]
	}),
	application: one(applications, {
		fields: [invoices.applicationId],
		references: [applications.id]
	}),
	paymentTransactions: many(paymentTransactions),
	paymentProofs: many(paymentProofs),
}));

export const broadcastsRelations = relations(broadcasts, ({one}) => ({
	tenant: one(tenants, {
		fields: [broadcasts.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [broadcasts.senderId],
		references: [users.id]
	}),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({one}) => ({
	invoice: one(invoices, {
		fields: [paymentTransactions.invoiceId],
		references: [invoices.id]
	}),
}));

export const selectionResultsRelations = relations(selectionResults, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [selectionResults.tenantId],
		references: [tenants.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [selectionResults.admissionPathId],
		references: [admissionPaths.id]
	}),
	user: one(users, {
		fields: [selectionResults.finalizedBy],
		references: [users.id]
	}),
	selectionResultDetails: many(selectionResultDetails),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
	tenant: one(tenants, {
		fields: [sessions.tenantId],
		references: [tenants.id]
	}),
}));

export const schoolProfilesRelations = relations(schoolProfiles, ({one}) => ({
	tenant: one(tenants, {
		fields: [schoolProfiles.tenantId],
		references: [tenants.id]
	}),
}));

export const paymentProofsRelations = relations(paymentProofs, ({one}) => ({
	tenant: one(tenants, {
		fields: [paymentProofs.tenantId],
		references: [tenants.id]
	}),
	invoice: one(invoices, {
		fields: [paymentProofs.invoiceId],
		references: [invoices.id]
	}),
	user: one(users, {
		fields: [paymentProofs.verifiedBy],
		references: [users.id]
	}),
}));

export const homeVisitPhotosRelations = relations(homeVisitPhotos, ({one}) => ({
	homeVisitReport: one(homeVisitReports, {
		fields: [homeVisitPhotos.reportId],
		references: [homeVisitReports.id]
	}),
}));

export const selectionResultDetailsRelations = relations(selectionResultDetails, ({one}) => ({
	application: one(applications, {
		fields: [selectionResultDetails.applicationId],
		references: [applications.id]
	}),
	selectionResult: one(selectionResults, {
		fields: [selectionResultDetails.selectionResultId],
		references: [selectionResults.id]
	}),
}));