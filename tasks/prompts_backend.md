# Prompts untuk Task Backend PPDB SaaS

File ini berisi prompt siap pakai untuk setiap task backend. Copy-paste prompt ke AI untuk implementasi.

---

## Cara Menggunakan

1. Pilih task ID yang ingin dikerjakan
2. Copy prompt yang tersedia
3. Paste ke AI (termasuk task ID, description, requirements)
4. AI akan implement sesuai spec

---

## Task Group 0.0: Git Setup

### Prompt untuk 0.1 - Create and checkout new branch

```
Task: BE-0.1
Description: Create and checkout new branch `feature/ppdb-saas-backend`

Requirements:
- Create new branch from `main` branch
- Branch name: `feature/ppdb-saas-backend`
- Switch to the new branch after creation

Output:
- Branch created and checked out successfully
- Show current branch status
```

---

## Task Group 1.0: Setup Cloudflare Workers and Hono

### Prompt untuk 1.1 - Initialize Hono project

```
Task: BE-1.1
Description: Initialize Hono project

Requirements:
- Initialize new Node.js project with `npm init -y`
- Install Hono: `npm install hono`
- Install TypeScript and type definitions
- Create basic Hono app structure:
  - `src/index.ts` - Main entry point
  - `src/app.ts` - Hono app configuration
- Configure TypeScript (`tsconfig.json`)
- Add build scripts to package.json

Output:
- Hono project initialized
- Basic app structure created
- TypeScript configured
- Build scripts working
```

### Prompt untuk 1.2 - Configure Cloudflare Workers binding

```
Task: BE-1.2
Description: Configure Cloudflare Workers binding

Requirements:
- Install Cloudflare Workers adapter: `npm install @hono/cloudflare-workers`
- Configure `wrangler.toml`:
  - Worker name
  - Account ID
  - Environment bindings (D1, R2, KV)
- Update `src/index.ts` to export for Workers
- Test local deployment: `npm run dev`

Output:
- Cloudflare Workers configured
- wrangler.toml created
- Local development working
```

### Prompt untuk 1.3 - Setup PostgreSQL connection (Neon)

```
Task: BE-1.3
Description: Setup PostgreSQL connection (Neon)

Requirements:
- Install Drizzle ORM: `npm install drizzle-orm`
- Install Neon client: `npm install @neondatabase/serverless`
- Create `src/lib/db/client.ts`:
  - Database connection pool
  - Connection configuration from env
- Create environment variables:
  - `DATABASE_URL` - Neon database URL
- Test connection

Output:
- PostgreSQL connection established
- Drizzle ORM configured
- Connection test successful
```

### Prompt untuk 1.4 - Configure R2 storage binding

```
Task: BE-1.4
Description: Configure R2 storage binding

Requirements:
- Configure R2 bucket in `wrangler.toml`:
  - Bucket name for document storage
- Create `src/lib/storage/r2.ts`:
  - R2 client initialization
  - Upload function
  - Download function
  - Delete function
  - List objects function
- Test file operations

Output:
- R2 storage configured
- Storage utilities created
- File operations tested
```

### Prompt untuk 1.5 - Setup environment variables management

```
Task: BE-1.5
Description: Setup environment variables management

Requirements:
- Install dotenv: `npm install dotenv`
- Create `.env.example` with all required variables:
  - Database connection
  - R2 bucket
  - Clerk keys
  - Payment gateway keys
  - JWT secrets
- Create environment validation using Zod
- Load environment variables in `src/index.ts`

Output:
- Environment variables documented
- Validation implemented
- .env.example created
```

---

## Task Group 2.0: Implement Database Schema and Migrations

### Prompt untuk 2.1 - Create Drizzle schema definitions

```
Task: BE-2.1
Description: Create Drizzle schema definitions

Requirements:
Create `src/lib/db/schema.ts` with tables:
- `tenants` - tenant information
- `subscriptions` - subscription plans
- `users` - user accounts
- `user_tenant_roles` - user roles per tenant
- `schools` - school profiles
- `periods` - registration periods
- `paths` - registration paths
- `path_rules` - path-specific rules
- `school_quotas` - quota per school/path
- `daily_quotas` - daily quota tracking
- `registrations` - student registrations
- `registration_schools` - multi-school registration
- `students` - student details
- `parents` - parent/guardian info
- `documents` - uploaded documents
- `document_verifications` - verification records
- `payments` - payment records
- `alumni_registrations` - alumni tracking
- `notifications` - notification logs
- `audit_logs` - audit trail

Use Drizzle ORM with proper TypeScript types

Output:
- All schema definitions created
- Proper relationships defined
- TypeScript types generated
```

### Prompt untuk 2.2 - Write migration scripts

```
Task: BE-2.2
Description: Write migration scripts

Requirements:
- Setup Drizzle migrations: `npm install drizzle-kit`
- Configure `drizzle.config.ts`:
  - Database connection
  - Schema path
  - Migration directory
- Generate initial migration: `npx drizzle-kit generate`
- Create migration scripts for:
  - Initial schema
  - Indexes creation
  - Constraints
- Add migration scripts to package.json

Output:
- Drizzle migrations configured
- Initial migration generated
- Migration scripts working
```

### Prompt untuk 2.3 - Implement tenant isolation logic

```
Task: BE-2.3
Description: Implement tenant isolation logic

Requirements:
Create `src/lib/middleware/tenant-resolver.ts`:
- Extract tenant from subdomain
- Validate tenant exists
- Set tenant context for request
- Handle default/invalid tenants

Create `src/lib/db/tenant-scoped.ts`:
- Query builder with tenant filtering
- Ensure all queries include tenant_id
- Prevent cross-tenant data access

Output:
- Tenant resolver middleware created
- Scoped queries implemented
- Tenant isolation enforced
```

### Prompt untuk 2.4 - Add indexes for performance

```
Task: BE-2.4
Description: Add indexes for performance

Requirements:
Add indexes to tables:
- `registrations`:
  - `tenant_id`
  - `school_id`
  - `period_id`
  - `status`
  - `student_id`
  - `path_id`
- `users`:
  - `email`
  - `tenant_id`
  - `role`
- `payments`:
  - `status`
  - `created_at`
- `documents`:
  - `registration_id`
  - `status`

Create migration for indexes

Output:
- Performance indexes created
- Migration generated
```

### Prompt untuk 2.5 - Create seed data scripts

```
Task: BE-2.5
Description: Create seed data scripts

Requirements:
Create `scripts/seed.ts`:
- Seed tenants
- Seed subscription plans
- Seed sample schools with paths
- Seed test users
- Seed registration periods
- Add seed script to package.json

Output:
- Seed script created
- Can populate database with test data
```

---

## Task Group 3.0: Build Authentication and Authorization

### Prompt untuk 3.1 - Implement Clerk webhooks

```
Task: BE-3.1
Description: Implement Clerk webhooks

Requirements:
Create `src/routes/webhooks/clerk.ts`:
- Verify Clerk webhook signature
- Handle user.created event
- Handle user.updated event
- Handle user.deleted event
- Sync user to database
- Create user_tenant_roles record

Create `src/lib/services/clerk-sync.ts`:
- Sync user data from Clerk
- Handle missing data
- Error handling

Output:
- Clerk webhook endpoint created
- User sync working
- Webhook verification implemented
```

### Prompt untuk 3.2 - Create user synchronization service

```
Task: BE-3.2
Description: Create user synchronization service

Requirements:
Create `src/lib/services/user-sync.ts`:
- Sync user from Clerk to database
- Update existing users
- Handle multiple tenants
- Sync user roles and permissions
- Retry logic for failures

Create sync endpoint:
- Manual trigger endpoint
- Batch sync endpoint

Output:
- User sync service created
- Manual and batch sync working
```

### Prompt untuk 3.3 - Implement SSO across tenants

```
Task: BE-3.3
Description: Implement SSO across tenants

Requirements:
Create `src/lib/auth/sso.ts`:
- Share user session across tenants
- Validate user access to tenant
- Generate tenant-specific tokens
- Handle token refresh

Implement middleware:
- Check user has role in target tenant
- Create tenant-scoped session

Output:
- SSO implemented
- Cross-tenant access working
```

### Prompt untuk 3.4 - Build role-based access control

```
Task: BE-3.4
Description: Build role-based access control

Requirements:
Create `src/lib/auth/rbac.ts`:
- Define roles: super_admin, tenant_admin, school_admin, verifikator, parent, student
- Define permissions per role
- Helper functions:
  - `hasRole(userId, role)`
  - `hasPermission(userId, permission)`
  - `canAccessResource(userId, resource, action)`

Create middleware:
- Check user permissions
- Reject unauthorized requests

Output:
- RBAC system created
- Role-based access working
```

### Prompt untuk 3.5 - Implement session management

```
Task: BE-3.5
Description: Implement session management

Requirements:
Create `src/lib/auth/session.ts`:
- Session storage (Redis/KV)
- Create session
- Validate session
- Refresh session
- Revoke session

Implement middleware:
- Attach session to request context
- Validate session on protected routes
- Handle expired sessions

Output:
- Session management working
- Protected routes secured
```

---

## Task Group 4.0: Develop Tenant Management API

### Prompt untuk 4.1 - Create tenant CRUD endpoints

```
Task: BE-4.1
Description: Create tenant CRUD endpoints

Requirements:
Create `src/routes/tenants/index.ts`:
- GET /api/tenants - List all tenants (super_admin only)
- GET /api/tenants/:id - Get tenant by ID
- POST /api/tenants - Create new tenant
- PUT /api/tenants/:id - Update tenant
- DELETE /api/tenants/:id - Delete tenant

Implement validation for all operations

Output:
- Tenant CRUD endpoints created
- All CRUD operations working
```

### Prompt untuk 4.2 - Implement tenant resolution from subdomain

```
Task: BE-4.2
Description: Implement tenant resolution from subdomain

Requirements:
Update `src/lib/middleware/tenant-resolver.ts`:
- Extract subdomain from Host header
- Lookup tenant by subdomain
- Handle root domain (default tenant)
- Cache tenant lookups

Add error handling:
- Return 404 for invalid subdomain
- Return 503 for database errors

Output:
- Subdomain resolution working
- Cached lookups
- Proper error handling
```

### Prompt untuk 4.3 - Build subscription management

```
Task: BE-4.3
Description: Build subscription management

Requirements:
Create `src/routes/tenants/subscriptions.ts`:
- GET /api/tenants/:tenantId/subscription - Get subscription
- POST /api/tenants/:tenantId/subscription - Create subscription
- PUT /api/tenants/:tenantId/subscription - Update plan
- POST /api/tenants/:tenantId/subscription/cancel - Cancel subscription
- POST /api/tenants/:tenantId/subscription/renew - Renew subscription

Implement payment gateway integration

Output:
- Subscription management API created
- Plan creation/update working
```

### Prompt untuk 4.4 - Implement tenant limits enforcement

```
Task: BE-4.4
Description: Implement tenant limits enforcement

Requirements:
Create `src/lib/services/tenant-limits.ts`:
- Check school count limit
- Check user count limit
- Check storage limit
- Check registration limit

Implement middleware:
- Check limits before creating resources
- Return 429 if limit exceeded
- Log limit violations

Output:
- Tenant limits enforced
- Middleware working
```

### Prompt untuk 4.5 - Add tenant health check endpoint

```
Task: BE-4.5
Description: Add tenant health check endpoint

Requirements:
Create `src/routes/tenants/health.ts`:
- GET /api/tenants/:tenantId/health - Check tenant health
- Check:
  - Database connection
  - R2 storage
  - Subscription status
  - Resource usage

Return health status with details

Output:
- Health check endpoint created
- All checks implemented
```

---

## Task Group 5.0: Implement School Management API

### Prompt untuk 5.1 - Create school CRUD endpoints

```
Task: BE-5.1
Description: Create school CRUD endpoints

Requirements:
Create `src/routes/schools/index.ts`:
- GET /api/schools - List schools (tenant-scoped)
- GET /api/schools/:id - Get school by ID
- POST /api/schools - Create school
- PUT /api/schools/:id - Update school
- DELETE /api/schools/:id - Delete school

Implement validation and permissions

Output:
- School CRUD endpoints created
- Tenant isolation working
```

### Prompt untuk 5.2 - Implement school types and levels

```
Task: BE-5.2
Description: Implement school types and levels

Requirements:
Create `src/lib/types/school.ts`:
- Define school types: SD, SMP, SMA, SMK
- Define school levels: elementary, middle, high, vocational
- Validation rules for each type

Implement filtering:
- Filter schools by type
- Filter schools by level

Output:
- School types defined
- Filtering working
```

### Prompt untuk 5.3 - Build school capacity management

```
Task: BE-5.3
Description: Build school capacity management

Requirements:
Create `src/routes/schools/capacity.ts`:
- GET /api/schools/:id/capacity - Get school capacity
- PUT /api/schools/:id/capacity - Update capacity
- GET /api/schools/:id/capacity/utilization - Get utilization

Capacity includes:
- Total capacity
- Used capacity
- Available capacity
- Per-path capacity

Output:
- Capacity management created
- Utilization tracking working
```

### Prompt untuk 5.4 - Implement school configuration

```
Task: BE-5.4
Description: Implement school configuration (paths, quotas)

Requirements:
Create `src/routes/schools/:id/config.ts`:
- GET /api/schools/:id/config - Get school config
- PUT /api/schools/:id/config - Update config

Configuration includes:
- Registration paths (zonasi, prestasi, afirmasi, mutasi, anak-guru, internal)
- Quotas per path
- Validation rules

Output:
- School configuration API created
- Paths and quotas manageable
```

### Prompt untuk 5.5 - Add school validation rules

```
Task: BE-5.5
Description: Add school validation rules

Requirements:
Create `src/lib/validators/school.ts`:
- Validate school NPSN format
- Validate school name
- Validate address
- Validate capacity numbers
- Validate path configurations

Apply validation to all school endpoints

Output:
- School validation created
- All rules enforced
```

---

## Task Group 6.0: Develop Registration Periods API

### Prompt untuk 6.1 - Create period CRUD endpoints

```
Task: BE-6.1
Description: Create period CRUD endpoints

Requirements:
Create `src/routes/periods/index.ts`:
- GET /api/schools/:schoolId/periods - List periods
- GET /api/periods/:id - Get period by ID
- POST /api/schools/:schoolId/periods - Create period
- PUT /api/periods/:id - Update period
- DELETE /api/periods/:id - Delete period

Implement date validation

Output:
- Period CRUD endpoints created
- Date validation working
```

### Prompt untuk 6.2 - Implement period status

```
Task: BE-6.2
Description: Implement period status (open/closed)

Requirements:
Create period status management:
- Statuses: draft, open, closed, ended
- Auto-open at start_date
- Auto-close at end_date
- Manual status override

Create endpoint:
- PUT /api/periods/:id/status - Update status

Output:
- Period status management working
- Auto status transitions
```

### Prompt untuk 6.3 - Build path configuration

```
Task: BE-6.3
Description: Build path configuration (zonasi, prestasi, afirmasi, mutasi, anak-guru, internal)

Requirements:
Create `src/routes/periods/:id/paths.ts`:
- GET /api/periods/:id/paths - Get all paths
- POST /api/periods/:id/paths - Add path
- PUT /api/periods/:id/paths/:pathId - Update path
- DELETE /api/periods/:id/paths/:pathId - Remove path

Path types:
- Zonasi (zone-based)
- Prestasi (achievement-based)
- Afirmasi (affirmation-based)
- Mutasi (transfer)
- Anak Guru (teacher's child)
- Internal (internal transfer)

Output:
- Path configuration created
- All 6 paths supported
```

### Prompt untuk 6.4 - Implement path-specific rules

```
Task: BE-6.4
Description: Implement path-specific rules and quotas

Requirements:
Create `src/routes/periods/:id/paths/:pathId/rules.ts`:
- GET - Get path rules
- PUT - Update path rules

Rules per path:
- Zonasi: distance threshold, coordinates
- Prestasi: minimum score, score types
- Afirmasi: eligible families, proof required
- Mutasi: transfer distance, previous school
- Anak Guru: employment proof, school ID
- Internal: transfer semester, grade

Output:
- Path-specific rules created
- All rules configurable
```

### Prompt untuk 6.5 - Add period conflict detection

```
Task: BE-6.5
Description: Add period conflict detection

Requirements:
Create `src/lib/services/period-conflict.ts`:
- Detect overlapping periods
- Detect conflicting paths
- Detect quota conflicts

Implement validation:
- Check conflicts before creating period
- Return detailed conflict information

Output:
- Conflict detection working
- Prevents invalid periods
```

---

## Task Group 7.0: Build Registration API

### Prompt untuk 7.1 - Create registration submission endpoint

```
Task: BE-7.1
Description: Create registration submission endpoint

Requirements:
Create `src/routes/registrations/index.ts`:
- POST /api/registrations - Submit registration
- Validate all required data
- Create student, parent, documents records
- Create registration_schools records
- Return registration ID

Implement transaction for atomicity

Output:
- Registration submission working
- All data validated
```

### Prompt untuk 7.2 - Implement student data validation

```
Task: BE-7.2
Description: Implement student data validation

Requirements:
Create `src/lib/validators/student.ts`:
- Validate NISN format (10 digits)
- Validate NIK format (16 digits)
- Validate age range (6-7 for SD, 12-13 for SMP, 15-16 for SMA/SMK)
- Validate phone number
- Validate email format
- Validate required fields

Apply validation to registration endpoint

Output:
- Student validation created
- All rules enforced
```

### Prompt untuk 7.3 - Build parent/guardian data storage

```
Task: BE-7.3
Description: Build parent/guardian data storage

Requirements:
Create parent data storage:
- Father data (name, NIK, phone, email, occupation)
- Mother data (name, NIK, phone, email, occupation)
- Guardian data (if applicable)

Create parent records in `parents` table
- Link to student via `student_id`
- Store contact information

Output:
- Parent data storage working
- All parent fields captured
```

### Prompt untuk 7.4 - Implement multi-school registration

```
Task: BE-7.4
Description: Implement multi-school registration (max 3)

Requirements:
Create `src/routes/registrations/:id/schools.ts`:
- GET - Get registered schools
- POST - Add school to registration
- DELETE - Remove school from registration

Implement validation:
- Max 3 schools total
- Max 1 public (negeri) school
- Priority ordering (1, 2, 3)

Output:
- Multi-school registration working
- Rules enforced
```

### Prompt untuk 7.5 - Add duplicate registration prevention

```
Task: BE-7.5
Description: Add duplicate registration prevention

Requirements:
Create duplicate detection:
- Check if student already registered
- Check by NISN
- Check by NIK
- Check by email

Implement prevention:
- Return error if duplicate found
- Show existing registration info

Output:
- Duplicate prevention working
- Clear error messages
```

### Prompt untuk 7.6 - Implement registration status tracking

```
Task: BE-7.6
Description: Implement registration status tracking

Requirements:
Create status workflow:
- pending → submitted → verified → selected/not_selected/rejected

Create `src/routes/registrations/:id/status.ts`:
- GET - Get current status
- PUT - Update status
- POST - Trigger status transition

Add audit log for status changes

Output:
- Status tracking working
- Audit logs created
```

---

## Task Group 8.0: Implement Document Management

### Prompt untuk 8.1 - Create document upload endpoints

```
Task: BE-8.1
Description: Create document upload endpoints (R2)

Requirements:
Create `src/routes/documents/upload.ts`:
- POST /api/registrations/:id/documents - Upload document
- Support multipart/form-data
- Upload to R2 storage
- Store metadata in database

Required documents:
- Akta Kelahiran (birth certificate)
- Kartu Keluarga (family card)
- Rapor (report card)
- KIP/PKH (if applicable)

Output:
- Document upload working
- R2 integration working
```

### Prompt untuk 8.2 - Implement file type validation

```
Task: BE-8.2
Description: Implement file type validation

Requirements:
Create `src/lib/validators/document.ts`:
- Allowed types: PDF, JPG, PNG
- Max file size: 5MB
- MIME type validation
- File extension validation

Implement validation in upload endpoint
- Return 400 for invalid files
- Return 413 for oversized files

Output:
- File type validation working
- Size limits enforced
```

### Prompt untuk 8.3 - Build document metadata storage

```
Task: BE-8.3
Description: Build document metadata storage

Requirements:
Create `src/routes/documents/index.ts`:
- GET /api/documents/:id - Get document metadata
- GET /api/registrations/:id/documents - List all documents
- DELETE /api/documents/:id - Delete document

Metadata includes:
- File name
- File type
- File size
- Upload timestamp
- R2 key
- Verification status

Output:
- Document metadata working
- CRUD operations available
```

### Prompt untuk 8.4 - Implement document versioning

```
Task: BE-8.4
Description: Implement document versioning

Requirements:
Create versioning system:
- Store multiple versions of each document
- Version history in database
- Keep only latest version active

Implement endpoints:
- GET /api/documents/:id/versions - List versions
- POST /api/documents/:id/versions - Upload new version
- GET /api/documents/:id/versions/:versionId - Get specific version

Output:
- Document versioning working
- History tracking available
```

### Prompt untuk 8.5 - Add document encryption at rest

```
Task: BE-8.5
Description: Add document encryption at rest

Requirements:
Implement encryption:
- Encrypt files before upload to R2
- Use AES-256 encryption
- Store encryption key in database (encrypted)
- Decrypt on download

Create `src/lib/crypto/encryption.ts`:
- encryptFile(file, key)
- decryptFile(encryptedFile, key)
- generateKey()

Output:
- Document encryption working
- Files encrypted at rest
```

---

## Task Group 9.0: Develop Document Verification System

### Prompt untuk 9.1 - Implement manual verification workflow

```
Task: BE-9.1
Description: Implement manual verification workflow

Requirements:
Create `src/routes/verifications/index.ts`:
- GET /api/registrations/:id/verifications - Get verification status
- PUT /api/documents/:id/verify - Approve document
- PUT /api/documents/:id/reject - Reject document (with reason)
- POST /api/registrations/:id/verify - Verify all documents

Implement role-based access:
- Only verifikator can verify
- Log all verification actions

Output:
- Manual verification working
- Role access enforced
```

### Prompt untuk 9.2 - Build verification status tracking

```
Task: BE-9.2
Description: Build verification status tracking

Requirements:
Create status types:
- pending
- verified
- rejected
- requires_review

Track status per:
- Document
- Registration

Create endpoints:
- GET /api/verifications/status - Get verification summary
- GET /api/verifications/queue - Get pending verifications

Output:
- Status tracking working
- Summary endpoints available
```

### Prompt untuk 9.3 - Implement Dukcapil integration

```
Task: BE-9.3
Description: Implement Dukcapil integration (mock/real)

Requirements:
Create `src/lib/services/dukcapil.ts`:
- verifyNIK(nik) - Verify NIK with Dukcapil
- verifyFamilyCard(nikKK, nik) - Verify family relationship
- verifyBirthCertificate(nik) - Verify birth certificate

Implement both:
- Mock implementation for testing
- Real implementation with API integration

Output:
- Dukcapil service created
- Mock and real versions working
```

### Prompt untuk 9.4 - Add verification history

```
Task: BE-9.4
Description: Add verification history

Requirements:
Create `src/routes/verifications/:id/history.ts`:
- GET - Get verification history
- Store:
  - Previous status
  - New status
  - Verifier ID
  - Timestamp
  - Reason (for rejection)

Audit log for all verification changes

Output:
- Verification history working
- Complete audit trail
```

### Prompt untuk 9.5 - Create verification notification system

```
Task: BE-9.5
Description: Create verification notification system

Requirements:
Create `src/lib/services/verification-notifications.ts`:
- Notify parent when verification completes
- Notify verifikator when new documents uploaded
- Notify when documents rejected (with reason)

Notification channels:
- Email
- SMS
- In-app

Output:
- Notifications working
- Multiple channels supported
```

---

## Task Group 10.0: Implement Selection Algorithm

### Prompt untuk 10.1 - Build zonasi distance calculation

```
Task: BE-10.1
Description: Build zonasi distance calculation

Requirements:
Create `src/lib/services/selection/zonasi.ts`:
- Calculate distance between student address and school
- Use Haversine formula or Google Maps API
- Convert address to coordinates (geocoding)
- Rank students by distance

Distance thresholds:
- < 1km: Highest priority
- 1-3km: Medium priority
- > 3km: Lower priority

Output:
- Distance calculation working
- Ranking system implemented
```

### Prompt untuk 10.2 - Implement prestige score calculation

```
Task: BE-10.2
Description: Implement prestige score calculation

Requirements:
Create `src/lib/services/selection/prestasi.ts`:
- Calculate score based on achievements:
  - Academic (grades, competitions)
  - Non-academic (sports, arts)
- Weight score by category
- Normalize scores
- Rank students by total score

Score types:
- National level: 100 points
- Provincial level: 75 points
- City level: 50 points
- School level: 25 points

Output:
- Prestige scoring working
- Multiple achievement types
```

### Prompt untuk 10.3 - Build ranking system per path

```
Task: BE-10.3
Description: Build ranking system per path

Requirements:
Create `src/lib/services/selection/ranking.ts`:
- Generate ranking for each path:
  - Zonasi: by distance
  - Prestasi: by score
  - Afirmasi: by priority (family type)
  - Mutasi: by transfer distance
  - Anak Guru: by employment duration
  - Internal: by previous performance

Return ranked list per path

Output:
- Ranking system created
- All paths ranked
```

### Prompt untuk 10.4 - Implement quota allocation

```
Task: BE-10.4
Description: Implement quota allocation

Requirements:
Create `src/lib/services/selection/quota-allocation.ts`:
- Allocate students to each path based on quota
- Fill quotas in priority order
- Handle overflow (move to next priority path)
- Create waitlist for remaining students

Algorithm:
1. Rank students per path
2. Fill quota for each path
3. Move overflow to next path
4. Create waitlist

Output:
- Quota allocation working
- Overflow handled
- Waitlist created
```

### Prompt untuk 10.5 - Create selection results storage

```
Task: BE-10.5
Description: Create selection results storage

Requirements:
Create `src/routes/selection/results.ts`:
- GET /api/periods/:periodId/results - Get selection results
- POST /api/periods/:periodId/select - Run selection
- Store results in database:
  - Selected students
  - Not selected students
  - Waitlist students
  - Selection path used
  - Score/distance

Output:
- Selection results stored
- Results endpoint available
```

### Prompt untuk 10.6 - Add selection audit log

```
Task: BE-10.6
Description: Add selection audit log

Requirements:
Create audit logging:
- Log selection run start/end time
- Log algorithm parameters used
- Log quota allocations
- Log all selection decisions
- Log who ran the selection

Store in `audit_logs` table

Output:
- Complete audit trail
- Transparent selection process
```

---

## Task Group 11.0: Build Daily Quota Management

### Prompt untuk 11.1 - Implement daily quota allocation

```
Task: BE-11.1
Description: Implement daily quota allocation

Requirements:
Create `src/lib/services/quota/daily-allocation.ts`:
- Divide monthly quota by working days (20 days)
- Allocate daily quota per path
- Track daily usage
- Carry forward unused quota to next day

Allocation rules:
- Zonasi: 40% of daily quota
- Prestasi: 25% of daily quota
- Afirmasi: 15% of daily quota
- Mutasi: 10% of daily quota
- Anak Guru: 5% of daily quota
- Internal: 5% of daily quota

Output:
- Daily quota allocation working
- Automatic carry forward
```

### Prompt untuk 11.2 - Build quota tracking system

```
Task: BE-11.2
Description: Build quota tracking system

Requirements:
Create `src/routes/quotas/index.ts`:
- GET /api/schools/:id/quotas - Get quota overview
- GET /api/schools/:id/quotas/daily - Get daily quota
- GET /api/schools/:id/quotas/usage - Get quota usage

Track:
- Total quota
- Used quota
- Available quota
- Per-path breakdown
- Daily trends

Output:
- Quota tracking working
- Comprehensive metrics
```

### Prompt untuk 11.3 - Create quota reset mechanism

```
Task: BE-11.3
Description: Create quota reset mechanism

Requirements:
Create reset logic:
- Reset daily quota at midnight
- Reset monthly quota on 1st of month
- Archive old quota records

Create scheduled task:
- Run reset at midnight (00:00)
- Use cron or Cloudflare Cron Triggers

Output:
- Automatic quota reset
- Scheduled task working
```

### Prompt untuk 11.4 - Add quota notification triggers

```
Task: BE-11.4
Description: Add quota notification triggers

Requirements:
Create notification triggers:
- Alert when quota > 80% used
- Alert when daily quota exhausted
- Alert when monthly quota exhausted

Send notifications to:
- School administrators
- Tenant admins

Channels: Email, SMS, In-app

Output:
- Notification triggers working
- Alerts sent at thresholds
```

### Prompt untuk 11.5 - Implement quota fallback handling

```
Task: BE-11.5
Description: Implement quota fallback handling

Requirements:
Create fallback logic:
- When daily quota exhausted, use monthly quota
- When path quota exhausted, use quota from other paths
- Prioritize fallback paths:
  1. Overflow from zonasi → prestasi
  2. Overflow from prestasi → afirmasi
  3. Overflow from afirmasi → mutasi
  4. etc.

Track fallback usage

Output:
- Fallback handling working
- Priority-based fallback
```

---

## Task Group 12.0: Integrate Payment Gateways

### Prompt untuk 12.1 - Implement Midtrans integration

```
Task: BE-12.1
Description: Implement Midtrans integration

Requirements:
Create `src/lib/payment/midtrans.ts`:
- Create payment transaction
- Get payment status
- Handle payment status webhooks
- Implement payment methods:
  - QRIS
  - Credit Card
  - Bank Transfer
  - GoPay, OVO, Dana, LinkAja

Create `src/routes/payments/midtrans.ts`:
- POST /api/payments/midtrans/create - Create payment
- POST /api/payments/webhooks/midtrans - Midtrans webhook

Output:
- Midtrans integration working
- All payment methods supported
```

### Prompt untuk 12.2 - Implement Xendit integration

```
Task: BE-12.2
Description: Implement Xendit integration

Requirements:
Create `src/lib/payment/xendit.ts`:
- Create invoice
- Get invoice status
- Handle invoice payment webhooks
- Implement payment methods:
  - QRIS
  - Credit Card
  - Bank Transfer
  - E-wallets (GoPay, OVO, Dana, ShopeePay)

Create `src/routes/payments/xendit.ts`:
- POST /api/payments/xendit/create - Create invoice
- POST /api/payments/webhooks/xendit - Xendit webhook

Output:
- Xendit integration working
- All payment methods supported
```

### Prompt untuk 12.3 - Build payment status webhooks

```
Task: BE-12.3
Description: Build payment status webhooks

Requirements:
Create webhook handlers:
- Verify webhook signature
- Handle payment success
- Handle payment failure
- Handle payment pending
- Update payment status in database
- Trigger notification

Implement for:
- Midtrans
- Xendit

Output:
- Webhook handlers created
- Both gateways working
```

### Prompt untuk 12.4 - Create payment reconciliation

```
Task: BE-12.4
Description: Create payment reconciliation

Requirements:
Create `src/lib/payment/reconciliation.ts`:
- Compare payments with gateway
- Identify discrepancies
- Flag unmatched transactions
- Generate reconciliation report

Create scheduled task:
- Run reconciliation daily
- Alert on discrepancies

Output:
- Reconciliation working
- Discrepancies flagged
```

### Prompt untuk 12.5 - Implement payment refund logic

```
Task: BE-12.5
Description: Implement payment refund logic

Requirements:
Create refund endpoints:
- POST /api/payments/:id/refund - Request refund
- GET /api/payments/:id/refund/:refundId - Get refund status

Implement refund process:
- Validate refund eligibility
- Call gateway refund API
- Update payment status
- Notify user

Output:
- Refund process working
- Eligibility checks
```

---

## Task Group 13.0: Create Reporting and Analytics API

### Prompt untuk 13.1 - Build registration statistics endpoints

```
Task: BE-13.1
Description: Build registration statistics endpoints

Requirements:
Create `src/routes/analytics/registrations.ts`:
- GET /api/analytics/registrations - Overall stats
  - Total registrations
  - Verified registrations
  - Pending verifications
  - Rejected registrations
- GET /api/analytics/registrations/trends - Trends over time
- GET /api/analytics/registrations/by-path - Stats per path
- GET /api/analytics/registrations/by-school - Stats per school

Output:
- Registration statistics available
- Multiple filters supported
```

### Prompt untuk 13.2 - Implement selection results reporting

```
Task: BE-13.2
Description: Implement selection results reporting

Requirements:
Create `src/routes/analytics/selection.ts`:
- GET /api/analytics/selection/results - Selection summary
- GET /api/analytics/selection/by-path - Results per path
- GET /api/analytics/selection/by-school - Results per school
- GET /api/analytics/selection/waitlist - Waitlist status

Include metrics:
- Selected count
- Not selected count
- Waitlist count
- Selection rate

Output:
- Selection reporting working
- Comprehensive metrics
```

### Prompt untuk 13.3 - Create demographic data aggregation

```
Task: BE-13.3
Description: Create demographic data aggregation

Requirements:
Create `src/routes/analytics/demographics.ts`:
- GET /api/analytics/demographics/gender - Gender distribution
- GET /api/analytics/demographics/age - Age distribution
- GET /api/analytics/demographics/location - Geographic distribution
- GET /api/analytics/demographics/school-type - School type preference
- GET /api/analytics/demographics/path - Path distribution

Aggregation by:
- School
- Period
- Date range

Output:
- Demographic analytics working
- Multiple dimensions
```

### Prompt untuk 13.4 - Build custom report builder

```
Task: BE-13.4
Description: Build custom report builder

Requirements:
Create `src/routes/reports/custom.ts`:
- POST /api/reports/build - Build custom report
- Request body:
  - Report type
  - Filters (school, period, date range, path, status)
  - Columns to include
  - Grouping options
  - Sorting options
- GET /api/reports/:reportId - Get saved report
- DELETE /api/reports/:reportId - Delete report

Output:
- Custom report builder working
- Flexible filtering
```

### Prompt untuk 13.5 - Add export functionality

```
Task: BE-13.5
Description: Add export functionality (CSV, PDF)

Requirements:
Create `src/lib/export/index.ts`:
- Export to CSV:
  - Convert data to CSV format
  - Set correct headers
- Export to PDF:
  - Use PDF generation library
  - Format data into tables
  - Add headers and footers

Create `src/routes/reports/export.ts`:
- POST /api/reports/export/csv - Export to CSV
- POST /api/reports/export/pdf - Export to PDF

Output:
- Export functionality working
- CSV and PDF formats
```

---

## Task Group 14.0: Implement Notification System

### Prompt untuk 14.1 - Create email notification templates

```
Task: BE-14.1
Description: Create email notification templates

Requirements:
Create `src/lib/notifications/email-templates.ts`:
- Registration confirmation
- Document verification result
- Selection result announcement
- Payment confirmation
- Payment failure

Create template engine:
- Support variables (name, school, status, etc.)
- HTML email templates
- Plain text fallback

Output:
- Email templates created
- Variable substitution working
```

### Prompt untuk 14.2 - Build SMS notification system

```
Task: BE-14.2
Description: Build SMS notification system

Requirements:
Create `src/lib/notifications/sms.ts`:
- Integrate with SMS gateway (e.g., Twilio, Vonage)
- Send SMS notifications
- Track SMS delivery status
- Handle rate limits

SMS events:
- Registration confirmation
- Verification result
- Selection result
- Payment reminder

Output:
- SMS system working
- Delivery tracking
```

### Prompt untuk 14.3 - Implement in-app notifications

```
Task: BE-14.3
Description: Implement in-app notifications

Requirements:
Create `src/routes/notifications/index.ts`:
- GET /api/notifications - Get user notifications
- GET /api/notifications/:id - Get notification details
- PUT /api/notifications/:id/read - Mark as read
- DELETE /api/notifications/:id - Delete notification

Store notifications in database
- User ID
- Title
- Message
- Type (info, success, warning, error)
- Read status
- Timestamp

Output:
- In-app notifications working
- CRUD operations available
```

### Prompt untuk 14.4 - Add notification preferences

```
Task: BE-14.4
Description: Add notification preferences

Requirements:
Create `src/routes/notifications/preferences.ts`:
- GET /api/notifications/preferences - Get user preferences
- PUT /api/notifications/preferences - Update preferences

Preferences:
- Email enabled/disabled
- SMS enabled/disabled
- In-app enabled/disabled
- Per-event preferences:
  - Registration events
  - Verification events
  - Selection events
  - Payment events

Output:
- Notification preferences working
- Per-user settings
```

### Prompt untuk 14.5 - Create notification history

```
Task: BE-14.5
Description: Create notification history

Requirements:
Create `src/routes/notifications/history.ts`:
- GET /api/notifications/history - Get notification history
- Filters:
  - Date range
  - Type
  - Status (sent, delivered, failed)
  - Recipient

Track all sent notifications:
- Recipient
- Channel (email, SMS, in-app)
- Status
- Timestamp

Output:
- Notification history working
- Complete audit trail
```

---

## Task Group 15.0: Add API Security and Rate Limiting

### Prompt untuk 15.1 - Implement CORS configuration

```
Task: BE-15.1
Description: Implement CORS configuration

Requirements:
Configure CORS in Hono:
- Allow specific origins (from env)
- Allow methods: GET, POST, PUT, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization
- Handle preflight requests

Create `src/lib/middleware/cors.ts`:
- CORS middleware
- Configurable allowlist

Output:
- CORS configured
- Proper security headers
```

### Prompt untuk 15.2 - Add request rate limiting

```
Task: BE-15.2
Description: Add request rate limiting

Requirements:
Create `src/lib/middleware/rate-limit.ts`:
- Implement rate limiting using Cloudflare KV
- Limit per IP address
- Different limits per endpoint:
  - Public: 100 req/min
  - Authenticated: 1000 req/min
  - Admin: 10000 req/min
- Return 429 when limit exceeded

Store rate limit data in KV

Output:
- Rate limiting working
- Per-endpoint limits
```

### Prompt untuk 15.3 - Build input sanitization

```
Task: BE-15.3
Description: Build input sanitization

Requirements:
Create `src/lib/middleware/sanitization.ts`:
- Sanitize all input data
- Remove XSS attacks
- Remove SQL injection attempts
- Validate against schema

Use Zod for validation
- Schema validation
- Type coercion
- Custom sanitizers

Output:
- Input sanitization working
- XSS and SQLi prevented
```

### Prompt untuk 15.4 - Implement SQL injection prevention

```
Task: BE-15.4
Description: Implement SQL injection prevention

Requirements:
- Use Drizzle ORM (parameterized queries)
- Never use raw SQL with user input
- Use prepared statements
- Validate all inputs

Create `src/lib/security/sql-injection.ts`:
- Helper functions for safe queries
- Input validation for raw SQL (if needed)

Output:
- SQL injection prevented
- All queries safe
```

### Prompt untuk 15.5 - Add request logging and monitoring

```
Task: BE-15.5
Description: Add request logging and monitoring

Requirements:
Create `src/lib/middleware/logging.ts`:
- Log all requests:
  - Method
  - Path
  - User ID (if authenticated)
  - IP address
  - User agent
  - Response status
  - Response time
- Log to file or external service

Create `src/routes/health.ts`:
- Health check endpoint
- Metrics endpoint

Output:
- Request logging working
- Health checks available
```

---

## Tips Menggunakan Prompt Ini

1. **Copy-paste langsung** - Copy seluruh prompt task yang ingin dikerjakan
2. **Bekerja berurutan** - Selesaikan task dalam urutan nomor
3. **Update progress** - Check task di `task_backend.md` setelah selesai
4. **Test setelah selesai** - Run `npm run test`, `npm run lint` setelah task selesai
5. **Commit frequently** - Commit per task dengan pesan yang jelas

## Contoh Menggunakan Prompt

```
User: Tolong kerjakan task BE-1.1

AI: [Copy prompt BE-1.1 dan implement]
```

---

## Notes

- Semua prompt sudah sesuai dengan TDD dan architecture decisions
- Gunakan Hono framework untuk Cloudflare Workers
- Gunakan Drizzle ORM untuk PostgreSQL
- Gunakan R2 untuk file storage
- Pastikan TypeScript tidak ada error
- Implement unit tests untuk setiap service

Output:
- All prompts created for backend tasks
- 75+ detailed prompts ready to use
- Organized by task group
- Copy-paste ready
