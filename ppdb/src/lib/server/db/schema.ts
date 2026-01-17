import {
	pgTable,
	uuid,
	text,
	timestamp,
	pgEnum,
	unique,
	integer,
	uniqueIndex,
	boolean,
	numeric,
	varchar,
	jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const admissionPathStatusEnum = pgEnum('admission_path_status', [
	'draft',
	'open',
	'closed',
	'archived'
]);
export const paymentTimingEnum = pgEnum('payment_timing', [
	'registration',
	'acceptance',
	'enrollment',
	'custom'
]);
export const feeStatusEnum = pgEnum('fee_status', ['active', 'inactive']);
export const applicationStatusEnum = pgEnum('application_status', [
	'draft',
	'submitted',
	'under_review',
	'verified',
	'accepted',
	'rejected',
	'waitlisted',
	'withdrawn'
]);

// Story 2.4: School Admin RBAC Assignment
export const userRoleEnum = pgEnum('user_role', [
	'super_admin',
	'school_admin',
	'verifier',
	'treasurer',
	'interviewer', // NEW: Epic 4.2
	'field_officer', // NEW: Epic 4.4
	'parent'
]);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'pending']);
export const authTypeEnum = pgEnum('auth_type', ['firebase', 'waha']);

export const fieldTypeEnum = pgEnum('field_type', [
	'text',
	'textarea',
	'number',
	'email',
	'tel',
	'date',
	'select',
	'checkbox',
	'radio',
	'file'
]);

export const documentTypeEnum = pgEnum('document_type', [
	'kk', // Kartu Keluarga
	'akta', // Akta Kelahiran
	'passport',
	'kitas',
	'photo',
	'other'
]);

export const documentStatusEnum = pgEnum('document_status', [
	'pending',
	'verified',
	'rejected',
	'revision_requested'
]);

export const tenants = pgTable('tenants', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	status: statusEnum('status').default('active').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		email: text('email').notNull(),
		firebaseUid: text('firebase_uid'),
		tenantId: uuid('tenant_id')
			.references(() => tenants.id)
			.notNull(),
		// Story 2.4: School Admin RBAC Assignment
		name: text('name'),
		role: userRoleEnum('role').default('parent').notNull(),
		status: userStatusEnum('status').default('active').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(t) => ({
		unq: unique().on(t.email, t.tenantId),
		firebaseUidUnique: uniqueIndex('users_firebase_uid_unique').on(t.firebaseUid)
	})
);

export const usersRelations = relations(users, ({ one }) => ({
	tenant: one(tenants, {
		fields: [users.tenantId],
		references: [tenants.id]
	})
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
	users: many(users)
}));

export const auditLogs = pgTable('audit_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	actorId: uuid('actor_id').notNull(), // User ID who performed the action
	action: text('action').notNull(), // e.g., 'create_tenant'
	target: text('target').notNull(), // e.g., 'tenant:new-school'
	details: text('details'), // JSON string
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Story 2.1: School Profile & Branding Configuration
export const schoolProfiles = pgTable('school_profiles', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull()
		.unique(), // One profile per tenant
	// Core fields (MVP)
	name: text('name').notNull(),
	npsn: text('npsn'), // Nomor Pokok Sekolah Nasional
	schoolLevel: text('school_level'), // SD, SMP, SMA, SMK, etc.
	accreditation: text('accreditation'), // A, B, C, Unggul, etc.
	description: text('description'),
	website: text('website'),
	contactEmail: text('contact_email'),
	contactPhone: text('contact_phone'),
	logoUrl: text('logo_url'),
	// Progressive enhancement fields (future)
	bannerUrl: text('banner_url'),
	primaryColor: text('primary_color'),
	secondaryColor: text('secondary_color'),
	// Address Details
	address: text('address'),
	province: text('province'),
	city: text('city'),
	district: text('district'),
	postalCode: text('postal_code'),
	// Epic 5: Manual Payment Bank Info
	bankName: text('bank_name'),
	bankAccountName: text('bank_account_name'),
	bankAccountNumber: text('bank_account_number'),
	landingPageConfig: jsonb('landing_page_config'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const schoolProfilesRelations = relations(schoolProfiles, ({ one }) => ({
	tenant: one(tenants, {
		fields: [schoolProfiles.tenantId],
		references: [tenants.id]
	})
}));

// Story 2.2: Admission Path & Quota Management
export const admissionPaths = pgTable('admission_paths', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	name: text('name').notNull(),
	description: text('description'),
	quota: integer('quota').notNull(),
	filledSlots: integer('filled_slots').notNull().default(0),
	status: admissionPathStatusEnum('status').notNull().default('draft'),
	// Epic 4.3: Ranking Engine - Announcement date for scheduling
	announcementDate: timestamp('announcement_date'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const admissionPathsRelations = relations(admissionPaths, ({ one, many }) => ({
	tenant: one(tenants, {
		fields: [admissionPaths.tenantId],
		references: [tenants.id]
	}),
	feeStructures: many(feeStructures)
}));

// Story 2.3: Fee Structure & Payment Timing
export const feeStructures = pgTable('fee_structures', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	admissionPathId: uuid('admission_path_id')
		.references(() => admissionPaths.id)
		.notNull(),
	name: text('name').notNull(),
	description: text('description'),
	amount: integer('amount').notNull(),
	currency: text('currency').notNull().default('IDR'),
	paymentTiming: paymentTimingEnum('payment_timing').notNull().default('registration'),
	dueDateOffsetDays: integer('due_date_offset_days').notNull().default(0),
	penaltyAmount: integer('penalty_amount'),
	penaltyGraceDays: integer('penalty_grace_days'),
	status: feeStatusEnum('status').notNull().default('active'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const feeStructuresRelations = relations(feeStructures, ({ one }) => ({
	tenant: one(tenants, {
		fields: [feeStructures.tenantId],
		references: [tenants.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [feeStructures.admissionPathId],
		references: [admissionPaths.id]
	})
}));

export const customFields = pgTable('custom_fields', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	admissionPathId: uuid('admission_path_id').references(() => admissionPaths.id),
	label: text('label').notNull(),
	key: text('key').notNull(),
	fieldType: fieldTypeEnum('field_type').notNull(),
	step: integer('step').notNull().default(1),
	required: boolean('required').default(false).notNull(),
	isEncrypted: boolean('is_encrypted').default(false).notNull(),
	isBaseField: boolean('is_base_field').default(false).notNull(),
	validationRules: text('validation_rules'), // JSON: {min, max, pattern}
	placeholder: text('placeholder'),
	helpText: text('help_text'),
	order: integer('order').notNull().default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const fieldOptions = pgTable('field_options', {
	id: uuid('id').primaryKey().defaultRandom(),
	customFieldId: uuid('custom_field_id')
		.references(() => customFields.id, { onDelete: 'cascade' })
		.notNull(),
	label: text('label').notNull(),
	value: text('value').notNull(),
	order: integer('order').notNull().default(0)
});

export const customFieldsRelations = relations(customFields, ({ one, many }) => ({
	tenant: one(tenants, {
		fields: [customFields.tenantId],
		references: [tenants.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [customFields.admissionPathId],
		references: [admissionPaths.id]
	}),
	options: many(fieldOptions)
}));

export const fieldOptionsRelations = relations(fieldOptions, ({ one }) => ({
	customField: one(customFields, {
		fields: [fieldOptions.customFieldId],
		references: [customFields.id]
	})
}));

// Epic 3: Registration & Data Collection
export const applications = pgTable('applications', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	userId: uuid('user_id')
		.references(() => users.id)
		.notNull(), // Parent who created the application
	admissionPathId: uuid('admission_path_id')
		.references(() => admissionPaths.id)
		.notNull(),
	status: applicationStatusEnum('status').default('draft').notNull(),

	// Dynamic custom field values
	customFieldValues: text('custom_field_values'), // JSONB: {"father_name": "Budi", "income": "5000000"}
	answeredCustomFields: text('answered_custom_fields'), // JSON array
	version: integer('version').default(1).notNull(),

	// Child information (filled in multi-step form)
	childFullName: text('child_full_name'),
	childNickname: text('child_nickname'),
	childDob: timestamp('child_dob'),
	childGender: text('child_gender'), // 'male' | 'female'

	// Parent information
	parentFullName: text('parent_full_name'),
	parentPhone: text('parent_phone'),
	parentEmail: text('parent_email'),

	// Address
	address: text('address'),
	city: text('city'),

	// Step tracking
	currentStep: integer('current_step').default(1).notNull(),
	completedSteps: text('completed_steps').default('[]').notNull(), // JSON array
	submittedAt: timestamp('submitted_at'),

	// Epic 4.3: Ranking - Distance in meters for Zonasi
	distanceM: integer('distance_m'),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const applicationsRelations = relations(applications, ({ one, many }) => ({
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
	documents: many(applicationDocuments),
	invoices: many(invoices)
}));

// Story 3.2: Document Upload & Verification
export const applicationDocuments = pgTable('application_documents', {
	id: uuid('id').primaryKey().defaultRandom(),
	applicationId: uuid('application_id')
		.references(() => applications.id, { onDelete: 'cascade' })
		.notNull(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	documentType: documentTypeEnum('document_type').notNull(),
	customFieldId: uuid('custom_field_id'), // Link if uploaded via custom field
	fileUrl: text('file_url').notNull(), // Public URL
	encryptedUrl: text('encrypted_url').notNull(), // R2 path
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	status: documentStatusEnum('status').default('pending').notNull(),
	rejectionReason: text('rejection_reason'),
	verifiedAt: timestamp('verified_at'),
	verifiedBy: uuid('verified_by').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const applicationDocumentsRelations = relations(applicationDocuments, ({ one, many }) => ({
	application: one(applications, {
		fields: [applicationDocuments.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [applicationDocuments.tenantId],
		references: [tenants.id]
	}),
	verifier: one(users, {
		fields: [applicationDocuments.verifiedBy],
		references: [users.id]
	}),
	reviews: many(documentReviews)
}));

export const verificationActionEnum = pgEnum('verification_action', [
	'approve',
	'reject',
	'request_revision'
]);

// Story 4.1: Document Reviews History
export const documentReviews = pgTable('document_reviews', {
	id: uuid('id').primaryKey().defaultRandom(),
	documentId: uuid('document_id')
		.references(() => applicationDocuments.id, { onDelete: 'cascade' })
		.notNull(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	reviewerId: uuid('reviewer_id')
		.references(() => users.id)
		.notNull(),
	action: verificationActionEnum('action').notNull(),
	reason: text('reason'), // Required for reject/request_revision
	previousStatus: documentStatusEnum('previous_status').notNull(),
	newStatus: documentStatusEnum('new_status').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const documentReviewsRelations = relations(documentReviews, ({ one }) => ({
	document: one(applicationDocuments, {
		fields: [documentReviews.documentId],
		references: [applicationDocuments.id]
	}),
	tenant: one(tenants, {
		fields: [documentReviews.tenantId],
		references: [tenants.id]
	}),
	reviewer: one(users, {
		fields: [documentReviews.reviewerId],
		references: [users.id]
	})
}));

// Epic 4.2: Scoring & Interview Input
export const applicationScores = pgTable(
	'application_scores',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		applicationId: uuid('application_id')
			.references(() => applications.id, { onDelete: 'cascade' })
			.notNull(),
		tenantId: uuid('tenant_id')
			.references(() => tenants.id)
			.notNull(),
		scorerId: uuid('scorer_id')
			.references(() => users.id)
			.notNull(),

		// Score data
		score: integer('score').notNull(), // 0-100, validated in application logic
		notes: text('notes'), // Qualitative feedback

		// Finalization tracking
		isFinalized: boolean('is_finalized').default(false).notNull(),
		finalizedAt: timestamp('finalized_at'),

		// Admin override tracking
		unlockedBy: uuid('unlocked_by').references(() => users.id),
		unlockedAt: timestamp('unlocked_at'),
		unlockReason: text('unlock_reason'),

		// Timestamps
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => ({
		// Unique constraint: one score per application
		uniqApplicationTenant: unique().on(table.applicationId, table.tenantId)
	})
);

export const applicationScoresRelations = relations(applicationScores, ({ one }) => ({
	application: one(applications, {
		fields: [applicationScores.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [applicationScores.tenantId],
		references: [tenants.id]
	}),
	scorer: one(users, {
		fields: [applicationScores.scorerId],
		references: [users.id]
	}),
	unlocker: one(users, {
		fields: [applicationScores.unlockedBy],
		references: [users.id]
	})
}));

// Epic 4.3: Automated Ranking Engine
export const selectionResults = pgTable('selection_results', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	admissionPathId: uuid('admission_path_id')
		.references(() => admissionPaths.id)
		.notNull(),
	batchId: text('batch_id').default('BATCH-1').notNull(), // Default added
	publishedAt: timestamp('published_at').defaultNow().notNull(),
	totalCandidates: integer('total_candidates').notNull(),
	quotaAccepted: integer('quota_accepted').notNull(),
	quotaReserved: integer('quota_reserved').notNull(),
	finalizedBy: uuid('finalized_by').references(() => users.id),
	finalizedAt: timestamp('finalized_at'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const selectionResultsRelations = relations(selectionResults, ({ one, many }) => ({
	tenant: one(tenants, {
		fields: [selectionResults.tenantId],
		references: [tenants.id]
	}),
	admissionPath: one(admissionPaths, {
		fields: [selectionResults.admissionPathId],
		references: [admissionPaths.id]
	}),
	details: many(selectionResultDetails)
}));

export const selectionResultDetails = pgTable('selection_result_details', {
	id: uuid('id').primaryKey().defaultRandom(),
	selectionResultId: uuid('selection_result_id')
		.references(() => selectionResults.id, { onDelete: 'cascade' })
		.notNull(),
	applicationId: uuid('application_id')
		.references(() => applications.id)
		.notNull(),
	totalScore: numeric('total_score').notNull(),
	rank: integer('rank').notNull(),
	status: varchar('status', { length: 20 }).notNull() // 'accepted', 'reserved', 'rejected'
});

export const selectionResultDetailsRelations = relations(selectionResultDetails, ({ one }) => ({
	selectionResult: one(selectionResults, {
		fields: [selectionResultDetails.selectionResultId],
		references: [selectionResults.id]
	}),
	application: one(applications, {
		fields: [selectionResultDetails.applicationId],
		references: [applications.id]
	})
}));

// Epic 4.4: Home Visit Report Upload
export const homeVisitReports = pgTable('home_visit_reports', {
	id: uuid('id').primaryKey().defaultRandom(),
	applicationId: uuid('application_id')
		.references(() => applications.id, { onDelete: 'cascade' })
		.notNull(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	officerId: uuid('officer_id')
		.references(() => users.id)
		.notNull(),

	// Survey data (JSONB for flexibility)
	surveyData: text('survey_data'), // JSON: { roof: 'good', floor: 'cement', ... }
	gpsLocation: text('gps_location'), // "lat,lng"
	summary: text('summary'),
	recommendation: text('recommendation'), // 'recommended', 'not_recommended'

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const homeVisitPhotos = pgTable('home_visit_photos', {
	id: uuid('id').primaryKey().defaultRandom(),
	reportId: uuid('report_id')
		.references(() => homeVisitReports.id, { onDelete: 'cascade' })
		.notNull(),
	photoUrl: text('photo_url').notNull(),
	caption: text('caption'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const homeVisitReportsRelations = relations(homeVisitReports, ({ one, many }) => ({
	application: one(applications, {
		fields: [homeVisitReports.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [homeVisitReports.tenantId],
		references: [tenants.id]
	}),
	officer: one(users, {
		fields: [homeVisitReports.officerId],
		references: [users.id]
	}),
	photos: many(homeVisitPhotos)
}));

export const homeVisitPhotosRelations = relations(homeVisitPhotos, ({ one }) => ({
	report: one(homeVisitReports, {
		fields: [homeVisitPhotos.reportId],
		references: [homeVisitReports.id]
	})
}));

// Epic 5.1: Payment & Invoices
export const invoiceStatusEnum = pgEnum('invoice_status', [
	'PENDING',
	'PAID',
	'EXPIRED',
	'FAILED',
	'VERIFYING',
	'REJECTED'
]);
export const paymentStatusEnum = pgEnum('payment_status', ['PENDING', 'SUCCESS', 'FAILED']);
export const proofStatusEnum = pgEnum('proof_status', ['PENDING', 'ACCEPTED', 'REJECTED']);

export const invoices = pgTable('invoices', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	applicationId: uuid('application_id')
		.references(() => applications.id)
		.notNull(),
	externalId: text('external_id').notNull().unique(), // Xendit Invoice ID
	amount: integer('amount').notNull(),
	status: invoiceStatusEnum('status').notNull().default('PENDING'),
	invoiceUrl: text('invoice_url').notNull(),
	expiryDate: timestamp('expiry_date').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	application: one(applications, {
		fields: [invoices.applicationId],
		references: [applications.id]
	}),
	tenant: one(tenants, {
		fields: [invoices.tenantId],
		references: [tenants.id]
	}),
	transactions: many(paymentTransactions),
	proofs: many(paymentProofs)
}));

// Epic 5.2: Payment Webhooks & Transaction Logs
export const paymentTransactions = pgTable('payment_transactions', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	invoiceId: uuid('invoice_id')
		.references(() => invoices.id)
		.notNull(),
	externalId: text('external_id').notNull(), // Xendit Transaction ID / Payment ID
	amount: integer('amount').notNull(),
	paymentMethod: text('payment_method'), // e.g., 'BCA', 'OVO'
	status: paymentStatusEnum('status').notNull(),
	paidAt: timestamp('paid_at').defaultNow().notNull(),
	rawResponse: text('raw_response'), // JSON string
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
	invoice: one(invoices, {
		fields: [paymentTransactions.invoiceId],
		references: [invoices.id]
	}),
	tenant: one(tenants, {
		fields: [paymentTransactions.tenantId],
		references: [tenants.id]
	})
}));

// Epic 5.3: Manual Verification
export const paymentProofs = pgTable('payment_proofs', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	invoiceId: uuid('invoice_id')
		.references(() => invoices.id)
		.notNull(),
	fileUrl: text('file_url').notNull(), // Uploaded proof image
	notes: text('notes'), // User notes
	uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
	reviewedBy: uuid('reviewed_by').references(() => users.id),
	reviewedAt: timestamp('reviewed_at'),
	rejectionReason: text('rejection_reason'),
	status: proofStatusEnum('status').default('PENDING').notNull()
});

export const paymentProofsRelations = relations(paymentProofs, ({ one }) => ({
	invoice: one(invoices, {
		fields: [paymentProofs.invoiceId],
		references: [invoices.id]
	}),
	reviewer: one(users, {
		fields: [paymentProofs.reviewedBy],
		references: [users.id]
	})
}));

// Epic 6.2: Broadcast Messaging
export const broadcasts = pgTable('broadcasts', {
	id: uuid('id').primaryKey().defaultRandom(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	senderId: uuid('sender_id')
		.references(() => users.id)
		.notNull(),
	targetSegment: text('target_segment').notNull(),
	messageTemplate: text('message_template').notNull(),
	sentCount: integer('sent_count').notNull(),
	failedCount: integer('failed_count').notNull(),
	failedRecipients: text('failed_recipients'), // JSON string of phone numbers
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const broadcastsRelations = relations(broadcasts, ({ one }) => ({
	tenant: one(tenants, {
		fields: [broadcasts.tenantId],
		references: [tenants.id]
	}),
	sender: one(users, {
		fields: [broadcasts.senderId],
		references: [users.id]
	})
}));

export const otpCodes = pgTable('otp_codes', {
	id: uuid('id').primaryKey().defaultRandom(),
	sessionId: text('session_id').notNull().unique(),
	phoneNumber: text('phone_number').notNull(),
	code: text('code').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Sessions table for authentication
export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	tenantId: uuid('tenant_id')
		.notNull()
		.references(() => tenants.id),
	authType: text('auth_type').notNull().$type<'firebase' | 'waha'>(),
	authIdentifier: text('auth_identifier').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
	tenant: one(tenants, {
		fields: [sessions.tenantId],
		references: [tenants.id]
	})
}));
