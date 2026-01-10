---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  [
    '/_bmad-output/planning-artifacts/prd.md',
    '/_bmad-output/planning-artifacts/architecture.md',
    '/_bmad-output/planning-artifacts/ux-design-specification.md'
  ]
---

# ppdb - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ppdb, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Super Admin dapat mendaftarkan Yayasan/Sekolah baru ke dalam platform.
FR2: Super Admin dapat mengaktifkan, menonaktifkan, atau memperpanjang masa aktif tenant (Sekolah).
FR3: Super Admin dapat memantau kesehatan infrastruktur dan log aktivitas global.
FR4: Super Admin dapat mengelola penarikan dana (payout) ke rekening sekolah.
FR5: Admin Sekolah dapat mengonfigurasi jalur pendaftaran (Afirmasi, Internal, dsb).
FR6: Admin Sekolah dapat menetapkan kuota pendaftar per jalur secara ketat.
FR7: Admin Sekolah dapat mengatur biaya pendaftaran dan momen penagihannya (Upfront/Post).
FR8: Admin Sekolah dapat mengubah konten profil sekolah, brosur, dan banner pengumuman.
FR9: Admin Sekolah dapat mengekspor data pendaftar sesuai format standar (Excel/Dapodik).
FR10: Pendaftar dapat membuat akun menggunakan WhatsApp atau Email dengan verifikasi OTP.
FR11: Pengguna dapat melakukan pemulihan akun (reset password/akses).
FR12: Sistem memberikan hak akses berbeda (RBAC) bagi Admin Yayasan, Sekolah, Keuangan, Penguji, dan Orang Tua.
FR13: Pendaftar dapat mengisi formulir pendaftaran secara bertahap (cicil data).
FR14: Pendaftar dapat mendaftarkan lebih dari satu anak menggunakan satu akun utama.
FR15: Pendaftar dapat mengunggah dokumen pendukung (KK, Akta, Paspor, KITAS).
FR16: Sistem secara otomatis mendeteksi dan memberi pengingat pada pendaftaran yang tidak lengkap (Lead Recovery).
FR17: Admin dapat melakukan verifikasi dokumen pendaftar secara side-by-side.
FR18: Penguji dapat menginput nilai tes/wawancara dan catatan kualitatif pendaftar.
FR19: Petugas Lapangan dapat mengunggah laporan hasil survei rumah pendaftar (Home Visit).
FR20: Sistem secara otomatis melakukan perankingan pendaftar berdasarkan bobot kriteria yang ditetapkan sekolah.
FR21: Sistem mengirimkan notifikasi status pendaftaran secara otomatis via WhatsApp dan Email.
FR22: Admin dapat mengirimkan pesan massal (broadcast) kepada segmen pendaftar tertentu.
FR23: Sistem secara otomatis mempromosikan pendaftar dari daftar tunggu jika tersedia slot kosong.
FR24: Pendaftar dapat melakukan pembayaran biaya pendaftaran dan daftar ulang secara online (VA/QRIS).
FR25: Admin Keuangan dapat memvalidasi pembayaran tunai manual secara langsung di dashboard.
FR26: Sistem menerbitkan bukti bayar (invoice lunas) secara otomatis setelah dana tervalidasi.
FR27: Pengguna dapat memberikan persetujuan (consent) eksplisit atas penggunaan data pribadi.
FR28: Sistem mencatat setiap perubahan data sensitif dalam log audit yang tidak dapat dihapus.
FR29: Pengguna dapat mengajukan permintaan penghapusan atau anonimisasi data sesuai UU PDP.
FR30: Super Admin dapat mengelola definisi Roles dan matriks Permissions secara global maupun spesifik tenant.
FR31: Super Admin dapat mengakses laporan eksekutif terkait pertumbuhan platform, performa pendaftaran sekolah, dan ringkasan keuangan global.

### NonFunctional Requirements

NFR1: Laman pendaftaran harus memiliki waktu muat (Largest Contentful Paint) kurang dari 2.5 detik pada koneksi 4G standar.
NFR2: Setiap interaksi pengguna (simpan data, verifikasi OTP) harus memberikan respon visual dalam waktu kurang dari 200ms melalui arsitektur Edge.
NFR3: Sistem harus mampu menangani minimal 500 pengguna konkuren secara serentak tanpa penurunan performa yang signifikan pada satu tenant sekolah.
NFR4: Seluruh data identitas sensitif (NIK, KK) wajib dienkripsi menggunakan standar AES-256 saat disimpan (at rest).
NFR5: Seluruh komunikasi data wajib menggunakan enkripsi TLS 1.3 dalam perjalanan (in transit).
NFR6: Implementasi Rate Limiting yang ketat pada endpoint sensitif (seperti OTP dan Login) untuk mencegah serangan Brute Force.
NFR7: Menjamin ketersediaan layanan (Uptime) minimal 99.9% selama periode kritis pendaftaran (Maret - Juli).
NFR8: Infrastruktur multi-tenant harus mendukung provisi otomatis hingga 100 tenant sekolah baru tanpa gangguan pada tenant yang sudah ada.
NFR9: Backup database harian dengan kemampuan Point-In-Time Recovery (PITR) hingga 30 hari ke belakang.
NFR10: Antarmuka pengguna wajib responsif dan ramah seluler, mendukung peramban mobile populer pada layar minimal 360px.
NFR11: Desain sistem yang ringan untuk memastikan fungsionalitas inti tetap berjalan lancar pada kondisi jaringan seluler rendah (Edge/3G).
NFR12: Penyediaan log audit yang tidak dapat diubah (immutable) untuk setiap transaksi keuangan dan akses data pendaftar.
NFR13: Format ekspor data harus mematuhi skema atribut yang kompatibel dengan standar migrasi database Dapodik Nasional.

### Additional Requirements

- **[Architecture] Starter Template:** Implement Hybrid SaaS Foundation (SvelteKit + Drizzle + Lucia) using `npx -y create-svelte@latest .` and strict dependency installation.
- **[Architecture] Tenant Isolation:** Implement strict Row-Level Security (RLS) on Neon PostgreSQL with `tenant_id` enforcement.
- **[Architecture] Database Access:** Use Neon Serverless Driver via HTTP for high concurrency (connection-less).
- **[Architecture] Authentication:** Implement Custom Auth Logic (Lucia v3 principles) with session caching in Cloudflare KV.
- **[Architecture] Data Encryption:** Implement Field-Level Encryption (AES-256) for NIK/KK before database storage using Web Crypto API.
- **[Architecture] Validation:** Use Zod schemas centrally in `$lib/schema/` for synchronous client/server validation.
- **[Architecture] Project Structure:** Adhere to the defined directory structure (e.g., `$lib/server/domain/`, `$lib/server/infra/`).
- **[Architecture] Naming Patterns:** Enforce snake_case for DB, kebab-case for API routes, PascalCase for Svelte components.
- **[UX] Design System:** Implement Shadcn/UI (Svelte) with custom theme configuration (Radius 1rem, Primary #002C5F).
- **[UX] Flow Pattern:** Implement "The 5-Minute Quick Enrollment" (Draft-to-Commit) - NO initial login, auto-account creation via WA OTP at the end.
- **[UX] Specific Components:** Build Guided Camera Overlay, Prestigious Digital Card, WhatsApp OTP Input components.
- **[UX] Responsiveness:** Ensure mobile-first design optimized for low-bandwidth ("HP Kentang") with skeleton screens.
- **[UX] Accessibility:** Maintain WCAG AA standards (Contrast, Touch Targets 44px).

### FR Coverage Map

FR1: Epic 1 - Register new Foundation/School
FR2: Epic 1 - Manage Tenant Lifecycle
FR3: Epic 1 - Global Monitoring
FR4: Epic 1 - Payout Management
FR5: Epic 2 - Config Admission Paths
FR6: Epic 2 - Config Quotas
FR7: Epic 2 - Config Fees
FR8: Epic 2 - Config Branding
FR9: Epic 7 - Export Data
FR10: Epic 3 - Auth/OTP
FR11: Epic 7 - Account Recovery
FR12: Epic 2 - RBAC Setup
FR13: Epic 3 - Form Wizard
FR14: Epic 3 - Multi-child
FR15: Epic 3 - Doc Upload
FR16: Epic 3 - Lead Recovery Detection
FR17: Epic 4 - Document Verification
FR18: Epic 4 - Scoring Input
FR19: Epic 4 - Home Visit Report
FR20: Epic 4 - Ranking Engine
FR21: Epic 6 - Notification Status
FR22: Epic 6 - Broadcasting
FR23: Epic 6 - Waitlist Promotion
FR24: Epic 5 - Online Payment
FR25: Epic 5 - Manual Payment
FR26: Epic 5 - Invoice Generation
FR27: Epic 3 - User Consent
FR28: Epic 7 - Audit Log
FR29: Epic 7 - Privacy/Deletion
FR30: Epic 1 - Global Role Management
FR31: Epic 1 - Executive Reports

## Epic List

### Epic 1: Platform Foundation & Tenant Onboarding

Establish the multi-tenant SaaS infrastructure, Super Admin capabilities, and global RBAC to enable school onboarding and system monitoring.
**FRs covered:** FR1, FR2, FR3, FR4, FR30, FR31

### Epic 2: School Admission Configuration

Empower School Admins to fully configure their admission portal, including paths, quotas, fees, and branding, to prepare for student intake.
**FRs covered:** FR5, FR6, FR7, FR8, FR12

### Epic 3: Frictionless Registration & Data Collection

Provide the "5-Minute Quick Enrollment" experience for parents, enabling data collection, document upload, and account creation via WhatsApp OTP.
**FRs covered:** FR10, FR13, FR14, FR15, FR16, FR27

### Epic 4: Verification, Selection & Ranking Engine

Enable the operational workflow for school committees to verify documents, input scores, survey results, and automatically rank candidates.
**FRs covered:** FR17, FR18, FR19, FR20

### Epic 5: Integrated Payment & Settlement

Manage the financial lifecycle of admissions, supporting both automated digital payments and manual cash verification with reconciliation.
**FRs covered:** FR24, FR25, FR26

### Epic 6: Proactive Communication & Engagement

Keep candidates informed and engaged through automated WhatsApp/Email notifications, broadcast messages, and waitlist management.
**FRs covered:** FR21, FR22, FR23

### Epic 7: Governance, Compliance & Reporting

Ensure system compliance with regulations (UU PDP), data security, auditability, and provide standardized reporting (Dapodik).
**FRs covered:** FR9, FR11, FR28, FR29

## Epic 1: Platform Foundation & Tenant Onboarding

Establish the multi-tenant SaaS infrastructure, Super Admin capabilities, and global RBAC to enable school onboarding and system monitoring.

### Story 1.1: Project Setup & Starter Architecture

As a Developer,
I want to initialize the SvelteKit project with the approved Hybrid SaaS Foundation stack,
So that the development team has a consistent, production-ready environment to build upon.

**Acceptance Criteria:**

**Given** A fresh development environment
**When** I run the initialization commands `npx -y create-svelte@latest .` and install Drizzle, Neon, Lucia, and Shadcn
**Then** The project structure should match the architecture document (e.g., `src/lib/server/domain`, `src/lib/server/infra`)
**And** Cloudflare Workers configuration (`wrangler.jsonc`) is set up for TypeScript
**And** Tailwind CSS is configured with the Design System tokens (Primary #002C5F, Radius 1rem)
**And** CI/CD pipeline skeleton is created in `.github/workflows`

### Story 1.2: Tenant Database Isolation (RLS)

As a Super Admin,
I want to ensure every school's data is strictly isolated at the database level using Row-Level Security,
So that there is zero risk of data leakage between schools.

**Acceptance Criteria:**

**Given** A Neon PostgreSQL database instance
**When** I define the Drizzle schema for `tenants` and `users` tables
**Then** An RLS policy must be applied that restricts `SELECT/UPDATE/DELETE` based on `tenant_id`
**And** A helper function in `src/lib/server/db/` enables setting the current `tenant_id` for the session context
**And** Migration scripts are generated and tested to confirm cross-tenant access is blocked by default

### Story 1.3: Subdomain Resolution & Routing

As a User,
I want to access my specific school's portal via a unique subdomain (e.g., `school-a.ppdb.id`),
So that I am immediately immersed in the correct school context.

**Acceptance Criteria:**

**Given** A request comes to `school-a.ppdb.id`
**When** The Cloudflare Worker intercepts the request
**Then** It should resolve the subdomain to a valid `tenant_id` using a cached lookup (Cloudflare KV)
**And** If the subdomain is invalid, redirect to the main platform landing page
**And** The `tenant_id` is passed to the SvelteKit `locals` context for downstream use

### Story 1.4: Global RBAC & Super Admin Dashboard

As a Super Admin,
I want to have a centralized dashboard to manage tenants and define global roles,
So that I can onboard new schools and control platform access.

**Acceptance Criteria:**

**Given** I am logged in as a Super Admin
**When** I access the `/super-admin` route group
**Then** I should see a list of all registered tenants (Schools)
**And** I can creating a new tenant (Name, Subdomain, Active Status)
**And** I can define global roles (Super Admin, School Admin, Parent) in the database permissions matrix
**And** The system logs this administrative action in the global audit log

## Epic 2: School Admission Configuration

Empower School Admins to fully configure their admission portal, including paths, quotas, fees, and branding, to prepare for student intake.

### Story 2.1: School Profile & Branding Configuration

As a School Admin,
I want to customize my school's profile, logos, and welcome messages,
So that the registration portal reflects our school's identity.

**Acceptance Criteria:**

**Given** I am logged in as a School Admin for a specific tenant
**When** I navigate to `Settings > School Profile`
**Then** I can upload a school logo and banner image
**And** I can update the school description and contact details
**And** The changes are immediately reflected on the public landing page for my subdomain
**And** The color theme adapts to use the uploaded logo's primary color (optional) or stays with the platform default

### Story 2.2: Admission Path & Quota Management

As a School Admin,
I want to define admission paths (e.g., Prestasi, Zonasi) and set strict quotas for each,
So that I can control the intake distribution and prevent overselling.

**Acceptance Criteria:**

**Given** I am in the `Settings > Admission Paths` menu
**When** I create a new path named "Jalur Prestasi" with a quota of 50
**Then** The system saves this configuration to the database
**And** An "Active/Inactive" toggle allows me to open or close the path
**And** The total quota across all paths is validated against the school's total capacity (if defined)

### Story 2.3: Fee Structure & Payment Timing

As a School Admin,
I want to configure registration fees and decide when they must be paid (Upfront or Post-Verification),
So that the system adapts to our school's financial policy.

**Acceptance Criteria:**

**Given** I am in the `Settings > Fees` menu
**When** I set a registration fee amount (e.g., IDR 150.000)
**Then** I can select the "Payment Timing" trigger: "Before Form Submission" or "After Verification"
**And** I can optionaly add fee waivers or discount codes
**And** The payment configuration is linked to the active admission paths

### Story 2.4: School Admin RBAC Assignment

As a School Admin,
I want to invite other staff members and assign them specific roles (e.g., Verifier, Treasurer),
So that we can distribute the workload securely.

**Acceptance Criteria:**

**Given** I have "Admin" privileges
**When** I invite a user by email and select the role "Verifier"
**Then** An invitation email/link is generated
**And** Upon acceptance, the user has access only to the "Verification" menu and cannot access "Settings"
**And** I can revoke access at any time

## Epic 3: Frictionless Registration & Data Collection

Provide the "5-Minute Quick Enrollment" experience for parents, enabling data collection, document upload, and account creation via WhatsApp OTP.

### Story 3.1: Public Landing & "Draft" Initiation

As a Parent,
I want to start the registration process immediately without creating an account first,
So that I don't face barriers to entry.

**Acceptance Criteria:**

**Given** I visit `school-a.ppdb.id`
**When** I click "Daftar Sekarang"
**Then** A unique "Registration Draft" session is created in the backend
**And** I am taken to the first step of the form wizard
**And** A progress bar appears at the top showing Step 1 of 5
**And** No login credentials are asked yet

### Story 3.2: Multi-Step Form Wizard with Auto-Save

As a Parent,
I want to fill in candidate data in small, manageable chunks,
So that I don't feel overwhelmed by a long form.

**Acceptance Criteria:**

**Given** I am in the form wizard
**When** I complete the "Student Data" step and click Next
**Then** The data is validated using Zod schemas
**And** The data is auto-saved to the draft session in the database
**And** I proceed to the "Parent Data" step
**And** If I lose connection and return later, my draft data is restored

### Story 3.3: Document Upload with Camera Guide

As a Parent,
I want to upload my KK and Akta Kelahiran easily using my phone camera,
So that I don't need to go to a scanner.

**Acceptance Criteria:**

**Given** I am at the "Document Upload" step
**When** I choose to upload the "Kartu Keluarga"
**Then** A "Guided Camera Overlay" component opens (on mobile) helping me frame the document
**And** The image is compressed client-side before upload to save bandwidth
**And** The file is encrypted (AES-256) before storage for privacy (NFR4)

### Story 3.4: Finalization via WhatsApp OTP (Account Creation)

As a Parent,
I want to finalize my submission and secure my account using my WhatsApp number,
So that I can log in later to check my status.

**Acceptance Criteria:**

**Given** I have completed all form steps
**When** I enter my WhatsApp number and click "Submit"
**Then** An OTP is sent to my WhatsApp
**And** A "WhatsApp OTP Input" component appears
**And** Upon entering the correct OTP, my "Draft" is converted to a "Submitted Application"
**And** A persistent User Account is automatically created linked to this phone number
**And** I see the "Success/Grand Reveal" card

### Story 3.5: Multi-Child Registration Support

As a Parent,
I want to register my second child using the same phone number,
So that I don't need to manage multiple logins.

**Acceptance Criteria:**

**Given** I am already logged in (or verified via OTP)
**When** I choose "Register Another Child" from the dashboard
**Then** A new application draft is started
**And** Common data (Parent Data, Address) is pre-filled from the previous submission
**And** Both applications are linked to my single parent account

## Epic 4: Verification, Selection & Ranking Engine

Enable the operational workflow for school committees to verify documents, input scores, survey results, and automatically rank candidates.

### Story 4.1: Side-by-Side Verification Interface

As a Verifier,
I want to see the uploaded document and the input data on the same screen,
So that I can quickly validate the accuracy of the application.

**Acceptance Criteria:**

**Given** I open a pending application
**When** I view the "Verification" tab
**Then** The screen splits: Left side shows form data, Right side shows the document viewer
**And** I can Approve, Reject (with reason), or Request Revision for each document
**And** Changing status updates the application audit log

### Story 4.2: Scoring & Interview Input

As an Interviewer,
I want to input test scores and interview notes for a candidate,
So that these values can be used for ranking.

**Acceptance Criteria:**

**Given** A candidate is in the "Selection" stage
**When** I input a score (0-100) and qualitative notes
**Then** The system saves the score securely
**And** The score is aggregated into the candidate's total weighted score
**And** I cannot edit the score after final submission (integrity check)

### Story 4.3: Automated Ranking Engine

As a School Admin,
I want the system to automatically rank students based on our weighted criteria,
So that the selection process is objective and fast.

**Acceptance Criteria:**

**Given** Multiple candidates with verified scores
**And** The admission path has defined weights (e.g., Academic 70%, Interview 30%)
**When** I run the "Calculate Ranking" process
**Then** Candidates are ordered by total score
**And** The "Accepted" status is provisionally assigned to the top N candidates (where N = Quota)
**And** The next candidates are assigned "Waitlist" status

### Story 4.4: Home Visit Report Upload

As a Field Officer,
I want to upload survey photos and reports for scholarship candidates,
So that the committee has evidence for decision making.

**Acceptance Criteria:**

**Given** A candidate flagged for "Home Visit"
**When** I upload photos of the house and fill the condition form via mobile
**Then** The report is attached to the candidate's profile
**And** The location (GPS tag) is recorded with the report (optional)
**And** Only authorized admins can view these sensitive reports

## Epic 5: Integrated Payment & Settlement

Manage the financial lifecycle of admissions, supporting both automated digital payments and manual cash verification with reconciliation.

### Story 5.1: Digital Payment Integration (VA/QRIS)

As a Parent,
I want to pay the registration fee using QRIS or Virtual Account,
So that the payment is verified instantly without sending a transfer receipt.

**Acceptance Criteria:**

**Given** My application status requires payment
**When** I select "Pay Online"
**Then** A payment gateway modal (e.g., Xendit/Midtrans) appears
**And** Upon successful transaction, the system receives a webhook
**And** My application status automatically updates to "Paid"
**And** I receive a payment receipt via WhatsApp

### Story 5.2: Manual Payment Verification

As a Finance Admin,
I want to manually mark an application as "Paid" for cash payments,
So that parents who pay at the school are also recorded in the system.

**Acceptance Criteria:**

**Given** A parent pays cash at the front desk
**When** I search for their application ID and click "Mark as Paid"
**Then** I must enter a reference note/receipt number
**And** The system updates the status to "Paid"
**And** The audit log records which admin performed this manual override

### Story 5.3: Invoice Generation & Proof of Payment

As a Parent,
I want to download a formal invoice/proof of payment,
So that I have a valid record of my transaction.

**Acceptance Criteria:**

**Given** My payment is confirmed
**When** I click "Download Invoice"
**Then** A PDF is generated containing School Logo, Student Name, Amount, Date, and Unique Transaction ID
**And** The PDF is digitally signed or watermarked for authenticity

## Epic 6: Proactive Communication & Engagement

Keep candidates informed and engaged through automated WhatsApp/Email notifications, broadcast messages, and waitlist management.

### Story 6.1: Automated Status Notifications

As a Parent,
I want to receive WhatsApp messages whenever my application status changes,
So that I don't have to constantly check the website.

**Acceptance Criteria:**

**Given** My application moves from "Pending" to "Verified" (or any other state)
**When** The status update occurs in the backend
**Then** A background job triggers a WhatsApp message to my registered number
**And** The message uses a friendly, pre-approved template
**And** The message includes a direct "Deep Link" to my dashboard

### Story 6.2: Broadcast Messaging

As a School Admin,
I want to send a broadcast message to all "Waitlisted" candidates,
So that I can inform them about an upcoming announcement simultaneously.

**Acceptance Criteria:**

**Given** I select a segment of users (e.g., Status = Waitlist)
**When** I compose a message and click "Send Broadcast"
**Then** The system queues messages for all targets
**And** The sending is rate-limited to prevent blocking
**And** I get a delivery report (Sent/Failed count)

### Story 6.3: Automated Waitlist Promotion

As a School Admin,
I want the system to automatically offer a slot to the next waitlisted candidate if an accepted student withdraws,
So that our quota remains full without manual tracking.

**Acceptance Criteria:**

**Given** An accepted candidate withdraws or fails to re-register
**When** The slot becomes available
**Then** The system identifies the #1 ranked candidate on the Waitlist
**And** Their status is updated to "Offered"
**And** A time-limited notification (e.g., "You have 24 hours to confirm") is sent via WhatsApp

## Epic 7: Governance, Compliance & Reporting

Ensure system compliance with regulations (UU PDP), data security, auditability, and provide standardized reporting (Dapodik).

### Story 7.1: Data Encryption & Privacy (UU PDP)

As a Data Protection Officer,
I want sensitive data like NIK and KK to be encrypted in the database,
So that even if the database is leaked, the personal data remains unreadable.

**Acceptance Criteria:**

**Given** A user submits the form with NIK and KK
**When** The data reaches the server
**Then** The designated fields are encrypted using AES-256 before INSERT
**And** Decryption only happens on-the-fly when authorized admins view the data
**And** Access to these decryption keys is strictly managed via environment secrets

### Story 7.2: Immutable Audit Log

As a Super Admin,
I want to see a history of all critical actions (Status Change, Payment, Data Edit),
So that we can investigate any disputes or irregularities.

**Acceptance Criteria:**

**Given** Any write operation on critical tables
**When** The operation commits
**Then** A record is inserted into the `audit_logs` table
**And** It includes Timestamp, Actor ID, Action Type, Old Value, and New Value
**And** This log is read-only and cannot be modified via the admin dashboard

### Story 7.3: Dapodik-Compatible Data Export

As a School Admin,
I want to download student data in a format compatible with Dapodik import,
So that I don't have to manually re-type data into the government system.

**Acceptance Criteria:**

**Given** A list of "Accepted" students
**When** I select "Export to Dapodik Format"
**Then** An Excel/CSV file is generated
**And** The columns map 1:1 with the official Dapodik import template
**And** Data formats (Dates, Religion Codes) are automatically converted to standard codes

### Story 7.4: User Right to Erasure (Account Deletion)

As a Parent,
I want to request the deletion of my data after the admission period is over,
So that my privacy is respected.

**Acceptance Criteria:**

**Given** The admission period has ended
**When** I request "Delete Account" from my profile
**Then** My personal identifiable information (PII) is anonymized or hard-deleted from the database
**And** Non-personal statistical data (e.g., "One student from City X applied") is retained for reporting
**And** A confirmation email is sent
