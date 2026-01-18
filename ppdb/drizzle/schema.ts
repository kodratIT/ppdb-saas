import { pgTable, foreignKey, uuid, text, integer, timestamp, unique, boolean, numeric, jsonb, varchar, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const admissionPathStatus = pgEnum("admission_path_status", ['draft', 'open', 'closed', 'archived'])
export const applicationStatus = pgEnum("application_status", ['draft', 'submitted', 'under_review', 'verified', 'accepted', 'rejected', 'waitlisted'])
export const authType = pgEnum("auth_type", ['firebase', 'waha'])
export const documentStatus = pgEnum("document_status", ['pending', 'verified', 'rejected', 'revision_requested'])
export const documentType = pgEnum("document_type", ['kk', 'akta', 'passport', 'kitas', 'photo', 'other'])
export const feeStatus = pgEnum("fee_status", ['active', 'inactive'])
export const fieldType = pgEnum("field_type", ['text', 'textarea', 'number', 'email', 'tel', 'date', 'select', 'checkbox', 'radio', 'file'])
export const invoiceStatus = pgEnum("invoice_status", ['PENDING', 'PAID', 'EXPIRED', 'FAILED', 'VERIFYING', 'REJECTED'])
export const paymentStatus = pgEnum("payment_status", ['PENDING', 'SUCCESS', 'FAILED'])
export const paymentTiming = pgEnum("payment_timing", ['registration', 'acceptance', 'enrollment', 'custom'])
export const proofStatus = pgEnum("proof_status", ['PENDING', 'ACCEPTED', 'REJECTED'])
export const status = pgEnum("status", ['active', 'inactive'])
export const userRole = pgEnum("user_role", ['super_admin', 'school_admin', 'verifier', 'treasurer', 'interviewer', 'field_officer', 'parent'])
export const userStatus = pgEnum("user_status", ['active', 'inactive', 'pending'])
export const verificationAction = pgEnum("verification_action", ['approve', 'reject', 'request_revision'])


export const applications = pgTable("applications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	userId: uuid("user_id").notNull(),
	admissionPathId: uuid("admission_path_id").notNull(),
	status: applicationStatus().default('draft').notNull(),
	customFieldValues: text("custom_field_values"),
	answeredCustomFields: text("answered_custom_fields"),
	version: integer().default(1).notNull(),
	childFullName: text("child_full_name"),
	childNickname: text("child_nickname"),
	childDob: timestamp("child_dob", { mode: 'string' }),
	childGender: text("child_gender"),
	parentFullName: text("parent_full_name"),
	parentPhone: text("parent_phone"),
	parentEmail: text("parent_email"),
	address: text(),
	city: text(),
	province: text(),
	postalCode: text("postal_code"),
	documents: text(),
	distanceM: integer("distance_m"),
	currentStep: integer("current_step").default(1).notNull(),
	completedSteps: text("completed_steps"),
	submittedAt: timestamp("submitted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "applications_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "applications_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.admissionPathId],
			foreignColumns: [admissionPaths.id],
			name: "applications_admission_path_id_admission_paths_id_fk"
		}),
]);

export const applicationScores = pgTable("application_scores", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicationId: uuid("application_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	scorerId: uuid("scorer_id").notNull(),
	score: integer().notNull(),
	notes: text(),
	isFinalized: boolean("is_finalized").default(false).notNull(),
	finalizedAt: timestamp("finalized_at", { mode: 'string' }),
	unlockedBy: uuid("unlocked_by"),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }),
	unlockReason: text("unlock_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "application_scores_application_id_applications_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "application_scores_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.scorerId],
			foreignColumns: [users.id],
			name: "application_scores_scorer_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.unlockedBy],
			foreignColumns: [users.id],
			name: "application_scores_unlocked_by_users_id_fk"
		}),
	unique("application_scores_application_id_tenant_id_unique").on(table.applicationId, table.tenantId),
]);

export const admissionPaths = pgTable("admission_paths", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	name: text().notNull(),
	description: text(),
	quota: integer().notNull(),
	filledSlots: integer("filled_slots").default(0).notNull(),
	status: admissionPathStatus().default('draft').notNull(),
	announcementDate: timestamp("announcement_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "admission_paths_tenant_id_tenants_id_fk"
		}),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	actorId: uuid("actor_id").notNull(),
	action: text().notNull(),
	target: text().notNull(),
	details: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const customFields = pgTable("custom_fields", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	admissionPathId: uuid("admission_path_id"),
	label: text().notNull(),
	key: text().notNull(),
	fieldType: fieldType("field_type").notNull(),
	step: integer().default(1).notNull(),
	required: boolean().default(false).notNull(),
	isEncrypted: boolean("is_encrypted").default(false).notNull(),
	isBaseField: boolean("is_base_field").default(false).notNull(),
	validationRules: text("validation_rules"),
	placeholder: text(),
	helpText: text("help_text"),
	order: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "custom_fields_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.admissionPathId],
			foreignColumns: [admissionPaths.id],
			name: "custom_fields_admission_path_id_admission_paths_id_fk"
		}),
]);

export const documentReviews = pgTable("document_reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid("document_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	reviewerId: uuid("reviewer_id").notNull(),
	action: verificationAction().notNull(),
	reason: text(),
	previousStatus: documentStatus("previous_status").notNull(),
	newStatus: documentStatus("new_status").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [applicationDocuments.id],
			name: "document_reviews_document_id_application_documents_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "document_reviews_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [users.id],
			name: "document_reviews_reviewer_id_users_id_fk"
		}),
]);

export const feeStructures = pgTable("fee_structures", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	admissionPathId: uuid("admission_path_id").notNull(),
	name: text().notNull(),
	description: text(),
	amount: integer().notNull(),
	currency: text().default('IDR').notNull(),
	paymentTiming: paymentTiming("payment_timing").default('registration').notNull(),
	dueDateOffsetDays: integer("due_date_offset_days").default(0).notNull(),
	penaltyAmount: integer("penalty_amount"),
	penaltyGraceDays: integer("penalty_grace_days"),
	status: feeStatus().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "fee_structures_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.admissionPathId],
			foreignColumns: [admissionPaths.id],
			name: "fee_structures_admission_path_id_admission_paths_id_fk"
		}),
]);

export const fieldOptions = pgTable("field_options", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	customFieldId: uuid("custom_field_id").notNull(),
	label: text().notNull(),
	value: text().notNull(),
	order: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.customFieldId],
			foreignColumns: [customFields.id],
			name: "field_options_custom_field_id_custom_fields_id_fk"
		}).onDelete("cascade"),
]);

export const homeVisitReports = pgTable("home_visit_reports", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicationId: uuid("application_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	officerId: uuid("officer_id").notNull(),
	surveyData: text("survey_data"),
	gpsLocation: text("gps_location"),
	summary: text(),
	recommendation: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "home_visit_reports_application_id_applications_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "home_visit_reports_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.officerId],
			foreignColumns: [users.id],
			name: "home_visit_reports_officer_id_users_id_fk"
		}),
]);

export const invoices = pgTable("invoices", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	applicationId: uuid("application_id").notNull(),
	externalId: text("external_id").notNull(),
	amount: integer().notNull(),
	status: invoiceStatus().default('PENDING').notNull(),
	invoiceUrl: text("invoice_url").notNull(),
	expiryDate: timestamp("expiry_date", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "invoices_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "invoices_application_id_applications_id_fk"
		}),
	unique("invoices_external_id_unique").on(table.externalId),
]);

export const broadcasts = pgTable("broadcasts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	senderId: uuid("sender_id").notNull(),
	targetSegment: text("target_segment").notNull(),
	messageTemplate: text("message_template").notNull(),
	sentCount: integer("sent_count").default(0).notNull(),
	failedCount: integer("failed_count").default(0).notNull(),
	failedRecipients: text("failed_recipients"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "broadcasts_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "broadcasts_sender_id_users_id_fk"
		}),
]);

export const otpCodes = pgTable("otp_codes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	phoneNumber: text("phone_number").notNull(),
	code: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("otp_codes_session_id_unique").on(table.sessionId),
]);

export const paymentTransactions = pgTable("payment_transactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	amount: integer().notNull(),
	paymentMethod: text("payment_method"),
	status: paymentStatus().default('PENDING').notNull(),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	externalReference: text("external_reference"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	tenantId: uuid("tenant_id"),
}, (table) => [
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payment_transactions_invoice_id_invoices_id_fk"
		}),
]);

export const selectionResults = pgTable("selection_results", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	admissionPathId: uuid("admission_path_id").notNull(),
	finalizedAt: timestamp("finalized_at", { mode: 'string' }).defaultNow().notNull(),
	finalizedBy: uuid("finalized_by"),
	quotaAccepted: integer("quota_accepted"),
	quotaReserved: integer("quota_reserved"),
	totalCandidates: integer("total_candidates"),
	cutoffScoreAccepted: numeric("cutoff_score_accepted"),
	cutoffScoreReserved: numeric("cutoff_score_reserved"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "selection_results_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.admissionPathId],
			foreignColumns: [admissionPaths.id],
			name: "selection_results_admission_path_id_admission_paths_id_fk"
		}),
	foreignKey({
			columns: [table.finalizedBy],
			foreignColumns: [users.id],
			name: "selection_results_finalized_by_users_id_fk"
		}),
]);

export const sessions = pgTable("sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	authType: authType("auth_type").notNull(),
	authIdentifier: text("auth_identifier").notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "sessions_tenant_id_tenants_id_fk"
		}),
]);

export const schoolProfiles = pgTable("school_profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	name: text().notNull(),
	description: text(),
	contactEmail: text("contact_email"),
	contactPhone: text("contact_phone"),
	logoUrl: text("logo_url"),
	bannerUrl: text("banner_url"),
	primaryColor: text("primary_color"),
	secondaryColor: text("secondary_color"),
	address: text(),
	bankName: text("bank_name"),
	bankAccountName: text("bank_account_name"),
	bankAccountNumber: text("bank_account_number"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	landingPageConfig: jsonb("landing_page_config"),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "school_profiles_tenant_id_tenants_id_fk"
		}),
	unique("school_profiles_tenant_id_unique").on(table.tenantId),
]);

export const paymentProofs = pgTable("payment_proofs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	invoiceId: uuid("invoice_id").notNull(),
	imageUrl: text("image_url").notNull(),
	notes: text(),
	status: proofStatus().default('PENDING').notNull(),
	rejectionReason: text("rejection_reason"),
	verifiedBy: uuid("verified_by"),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "payment_proofs_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.invoiceId],
			foreignColumns: [invoices.id],
			name: "payment_proofs_invoice_id_invoices_id_fk"
		}),
	foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [users.id],
			name: "payment_proofs_verified_by_users_id_fk"
		}),
]);

export const tenants = pgTable("tenants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	status: status().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("tenants_slug_unique").on(table.slug),
]);

export const applicationDocuments = pgTable("application_documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicationId: uuid("application_id").notNull(),
	tenantId: uuid("tenant_id").notNull(),
	documentType: documentType("document_type").notNull(),
	fileName: text("file_name").notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type").notNull(),
	encryptedUrl: text("encrypted_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	status: documentStatus().default('pending').notNull(),
	verifiedBy: uuid("verified_by"),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "application_documents_application_id_applications_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "application_documents_tenant_id_tenants_id_fk"
		}),
	foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [users.id],
			name: "application_documents_verified_by_users_id_fk"
		}),
]);

export const homeVisitPhotos = pgTable("home_visit_photos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	reportId: uuid("report_id").notNull(),
	photoUrl: text("photo_url").notNull(),
	caption: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.reportId],
			foreignColumns: [homeVisitReports.id],
			name: "home_visit_photos_report_id_home_visit_reports_id_fk"
		}).onDelete("cascade"),
]);

export const selectionResultDetails = pgTable("selection_result_details", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	selectionResultId: uuid("selection_result_id").notNull(),
	applicationId: uuid("application_id").notNull(),
	rank: integer().notNull(),
	status: varchar({ length: 20 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "selection_result_details_application_id_applications_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.selectionResultId],
			foreignColumns: [selectionResults.id],
			name: "selection_result_details_selection_result_id_selection_results_"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	tenantId: uuid("tenant_id").notNull(),
	name: text(),
	role: userRole().default('parent').notNull(),
	status: userStatus().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	firebaseUid: text("firebase_uid"),
}, (table) => [
	uniqueIndex("users_firebase_uid_unique").using("btree", table.firebaseUid.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.tenantId],
			foreignColumns: [tenants.id],
			name: "users_tenant_id_tenants_id_fk"
		}),
	unique("users_email_tenant_id_unique").on(table.email, table.tenantId),
]);
