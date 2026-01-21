# Super Admin Multi-Language Support (i18n)

**Goal:** Add Indonesian and English language support to the super admin interface.

**Status:** Ready for Implementation
**Created:** 2026-01-21
**Languages:** Indonesian (id), English (en)
**Default:** Indonesian (id)

---

## Current State Analysis

### Existing i18n Infrastructure:

- **None** - No existing i18n setup
- All UI text is hardcoded in English

### Files Requiring Translation:

| Category            | Files                                                | Estimated Strings |
| ------------------- | ---------------------------------------------------- | ----------------- |
| **Layout**          | DashboardHeader.svelte, DashboardSidebar.svelte      | ~50 strings       |
| **Admin Pages**     | schools/, register/, verification/, broadcast/, etc. | ~300 strings      |
| **Components**      | KPICard, SchoolsTable, BulkActionToolbar, etc.       | ~150 strings      |
| **Forms**           | All step components in register/                     | ~100 strings      |
| **Server Messages** | +page.server.ts files                                | ~50 strings       |
| **Validation**      | schema.ts files                                      | ~30 strings       |

**Total Estimated Strings:** ~680 strings

---

## Task List

### Phase 1: Setup i18n Infrastructure

#### Task 1.1: Create Translation Structure

**Directory:** `src/lib/i18n/`

**Structure:**

```
src/lib/i18n/
├── index.ts              # Main i18n store/configuration
├── config.ts             # i18n configuration
├── loaders/
│   ├── en.ts            # English translations
│   └── id.ts            # Indonesian translations
├── types.ts             # TypeScript types
├── utils/
│   ├── interpolate.ts   # String interpolation
│   ├── plural.ts        # Pluralization rules
│   └── date.ts          # Date formatting
└── detector/
    ├── index.ts         # Language detection
    └── storage.ts       # LocalStorage persistence
```

**Features:**

- Type-safe translations
- SSR compatible
- Hot reload support
- Fallback language

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 1.2: Create Core i18n Store

**File:** `src/lib/i18n/index.ts`

**Features:**

- Svelte 5 runes-based store
- Language state management
- Translation function `t(key: string, params?: object): string`
- Current language getter
- Language setter with persistence

**API:**

```typescript
// Set language
i18n.setLanguage('id');

// Get current language
const lang = i18n.language;

// Translate
i18n.t('admin.sidebar.dashboard');
i18n.t('admin.form.name.required', { field: 'School Name' });

// With reactive
$effect(() => {
	console.log(i18n.t('common.save'));
});
```

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 1.1

---

#### Task 1.3: Create Language Detector

**File:** `src/lib/i18n/detector/index.ts`

**Features:**

- Detect browser language
- Check localStorage preference
- URL parameter support (?lang=en)
- Cookie support for SSR
- Persist preference

**Detection Priority:**

1. URL parameter (`?lang=id`)
2. Cookie (`locale=id`)
3. LocalStorage (`i18nextLng=id`)
4. Browser navigator (`navigator.language`)
5. Fallback (`id`)

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 1.2

---

#### Task 1.4: Create Translation Loaders

**Files:** `src/lib/i18n/loaders/en.ts` and `id.ts`

**Structure:**

```typescript
export const en = {
	common: {
		save: 'Save',
		cancel: 'Cancel',
		delete: 'Delete',
		edit: 'Edit',
		view: 'View',
		create: 'Create',
		loading: 'Loading...',
		error: 'Error',
		success: 'Success',
		confirm: 'Confirm',
		search: 'Search',
		filter: 'Filter',
		export: 'Export',
		import: 'Import',
		back: 'Back',
		next: 'Next',
		submit: 'Submit',
		close: 'Close',
		yes: 'Yes',
		no: 'No',
		all: 'All',
		none: 'None',
		select: 'Select',
		selected: 'Selected',
		actions: 'Actions',
		status: 'Status',
		date: 'Date',
		time: 'Time',
		name: 'Name',
		email: 'Email',
		phone: 'Phone',
		address: 'Address'
	},
	admin: {
		sidebar: {
			dashboard: 'Dashboard',
			organizations: 'Organizations'
			// ...
		}
		// ...
	}
};
```

**Priority:** High
**Effort:** 5 hours
**Dependencies:** Task 1.1

---

#### Task 1.5: Create TypeScript Types

**File:** `src/lib/i18n/types.ts`

**Features:**

- Type-safe translation keys
- Nested key autocomplete support
- Language-specific types

```typescript
type NestedKeys<T> = T extends object
	? {
			[K in keyof T]: K extends string
				? T[K] extends string
					? K
					: `${K}.${NestedKeys<T[K]>}`
				: never;
		}[keyof T]
	: never;

type TranslationKey = NestedKeys<typeof en>;
```

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 1.4

---

### Phase 2: Create Translation Files

#### Task 2.1: Create English Translations

**File:** `src/lib/i18n/loaders/en.ts`

**Categories:**

```typescript
export const en: TranslationSchema = {
	// Common UI
	common: {
		save: 'Save',
		cancel: 'Cancel',
		delete: 'Delete',
		edit: 'Edit',
		view: 'View',
		create: 'Create',
		loading: 'Loading...',
		error: 'Error',
		success: 'Success',
		confirm: 'Confirm',
		search: 'Search',
		filter: 'Filter',
		export: 'Export',
		import: 'Import',
		back: 'Back',
		next: 'Next',
		submit: 'Submit',
		close: 'Close',
		yes: 'Yes',
		no: 'No',
		all: 'All',
		none: 'None',
		select: 'Select',
		selected: 'Selected',
		actions: 'Actions',
		status: 'Status',
		date: 'Date',
		time: 'Time',
		name: 'Name',
		email: 'Email',
		phone: 'Phone',
		address: 'Address',
		password: 'Password',
		saveDraft: 'Save Draft',
		continue: 'Continue',
		finish: 'Finish',
		reset: 'Reset',
		apply: 'Apply',
		clear: 'Clear',
		showMore: 'Show More',
		showLess: 'Show Less',
		copy: 'Copy',
		copied: 'Copied!',
		download: 'Download',
		upload: 'Upload',
		preview: 'Preview',
		required: 'Required',
		optional: 'Optional'
	},

	// Navigation
	nav: {
		main: 'Main',
		management: 'Management',
		subscription: 'Subscription',
		analytics: 'Analytics',
		system: 'System',
		dashboard: 'Dashboard',
		organizations: 'Organizations',
		registerSchool: 'Register School',
		schoolUnits: 'School Units',
		verification: 'Verification',
		broadcastCenter: 'Broadcast Center',
		announcements: 'Announcements',
		supportTickets: 'Support Tickets',
		plans: 'Plans',
		activeSubscriptions: 'Active Subscriptions',
		transactions: 'Transactions',
		payouts: 'Payouts',
		globalReports: 'Global Reports',
		healthMonitor: 'Health Monitor',
		rolesPermissions: 'Roles & Permissions',
		auditLogs: 'Audit Logs',
		platformAdmins: 'Platform Admins',
		settings: 'Settings',
		signOut: 'Sign Out'
	},

	// Admin Dashboard
	admin: {
		dashboard: {
			title: 'Dashboard',
			subtitle: 'System overview and performance metrics',
			totalRevenue: 'Total Revenue',
			organizations: 'Organizations',
			totalParents: 'Total Parents',
			transactions: 'Transactions',
			verificationQueue: 'Verification Queue',
			successRate: 'Success Rate',
			conversion: 'Conversion',
			avgRevOrg: 'Avg Rev/Org',
			grossProcessed: 'Gross processed',
			activeTotal: 'Active / {total} Total',
			registeredUsers: 'Registered users',
			successfulCount: 'Successful count',
			pendingOrgs: 'Pending organizations',
			paymentGateway: 'Payment gateway',
			visitToLead: 'Visit to Lead',
			monthlyAverage: 'Monthly average',
			today: 'Today',
			downloadReport: 'Download Report',
			performaPerUnit: 'Performa Per Unit',
			breakdownPendaftaran: 'Breakdown pendaftar dan pendapatan tiap jenjang',
			unit: 'Unit',
			jenjang: 'Jenjang',
			applicants: 'Applicants',
			pendaftars: 'Pendaftars',
			pendapatan: 'Pendapatan',
			revenue: 'Revenue',
			marketLeaders: 'Market Leaders',
			topSchools: 'Top Schools by Revenue',
			recentActivity: 'Recent Activity',
			pipelineActivity: 'Pipeline Activity',
			recentTenants: 'Recent Tenants'
		},

		schools: {
			title: 'Schools Management',
			subtitle: 'Manage access, monitor performance, and configure tenant settings.',
			addNewSchool: 'Add New School',
			totalSchools: 'Total Schools',
			activeSchools: 'Active Schools',
			securityStatus: 'Security Status',
			allOrganizations: 'All Organizations',
			listRegistered: 'List of all registered organizations in the system.',
			searchOrgs: 'Search organizations...',
			filterStatus: 'Filter by Status',
			allStatus: 'All Status',
			active: 'Active',
			inactive: 'Inactive',
			selectAll: 'Select all schools',
			schoolsSelected: '{count} schools selected',
			showingRange: 'Showing {start}-{end} of {total} schools',
			noSchools: 'No schools found.',
			schoolIdentity: 'School Identity',
			type: 'Type',
			accessUrl: 'Access URL',
			applicantsStat: 'Applicants',
			performanceStat: 'Performance',
			paidInvoices: 'PAIS Invoices',
			viewAsPublic: 'View as Public',
			loginAsAdmin: 'Login as Admin',
			activateSchool: 'Activate School',
			deactivateSchool: 'Deactivate School',
			selectSchool: 'Select {name}'
		},

		register: {
			title: 'Register New School',
			subtitle: 'Complete the steps below to set up a new school tenant.',
			stepIdentity: 'School Identity',
			stepLocation: 'Location',
			stepAdmin: 'Admin Account',
			stepReview: 'Review',
			enterBasicInfo: 'Enter the basic information about your school.',
			provideAddress: 'Provide the complete address of your school.',
			createAdmin: 'Create the super admin account for your school.',
			reviewSubmit: 'Please review all information before submitting.',
			institutionType: 'Institution Type',
			singleSchool: 'Sekolah Satuan',
			foundation: 'Yayasan / Institusi',
			foundationNote:
				'You can add school units (TK, SD, SMP, SMA) under this Foundation after registration.',
			schoolName: 'School Name',
			foundationName: 'Foundation Name',
			npsn: 'NPSN (Nomor Pokok Sekolah Nasional)',
			npsnOptional: '(Optional)',
			npsnRequired: '*',
			npsnHelper: "Enter your school's 8-digit NPSN number from Kemdikbud.",
			foundationNpsnHelper: 'Enter parent NPSN if available, or leave empty.',
			slug: 'Slug',
			foundationSlug: 'Foundation Slug',
			slugHelper: 'This will be your subdomain:',
			subdomain: '.ppdb.id',
			level: 'Level',
			firstUnitLevel: 'First Unit Level',
			selectLevel: 'Select level',
			status: 'School Status',
			active: 'Active',
			inactive: 'Inactive',
			province: 'Province',
			city: 'City/Regency',
			district: 'District',
			village: 'Village',
			streetAddress: 'Street Address',
			postalCode: 'Postal Code',
			adminName: 'Admin Full Name',
			adminEmail: 'Email Address',
			adminPassword: 'Password',
			whatsapp: 'WhatsApp Number',
			adminNote: "This is the name of the person who will manage the school's PPDB system.",
			emailNote: 'This email will be used to log in to the admin dashboard.',
			passwordNote: 'Choose a strong password with at least 6 characters.',
			whatsappNote: 'Include country code (e.g., +62 for Indonesia).',
			beforeSubmit: 'Before you submit',
			submitNotice:
				'Make sure all information is correct. After submission, a new tenant will be created.',
			registrationSuccess: 'Registration Successful!',
			redirecting: 'Redirecting to schools dashboard...',
			saveDraft: 'Save Draft',
			draftSaved: 'Draft saved successfully',
			loadDraft: 'Load saved draft?'
		}

		// ... more categories
	},

	// Validation Messages
	validation: {
		required: '{field} is required',
		minLength: '{field} must be at least {min} characters',
		maxLength: '{field} must be at most {max} characters',
		email: 'Please enter a valid email address',
		phone: 'Invalid phone number format',
		numeric: '{field} must be a number',
		url: 'Please enter a valid URL',
		slug: 'Slug can only contain lowercase letters, numbers, and hyphens',
		npsn: 'NPSN must be exactly 8 digits for single school',
		postalCode: 'Postal code must be 5 digits'
	},

	// Actions
	actions: {
		save: 'Save',
		saveChanges: 'Save Changes',
		cancel: 'Cancel',
		confirm: 'Confirm',
		delete: 'Delete',
		edit: 'Edit',
		view: 'View',
		create: 'Create',
		update: 'Update',
		remove: 'Remove',
		activate: 'Activate',
		deactivate: 'Deactivate',
		export: 'Export',
		import: 'Import',
		download: 'Download',
		upload: 'Upload',
		search: 'Search',
		filter: 'Filter',
		sort: 'Sort',
		reset: 'Reset',
		clear: 'Clear',
		refresh: 'Refresh',
		submit: 'Submit',
		next: 'Next',
		previous: 'Previous',
		back: 'Back',
		finish: 'Finish',
		close: 'Close',
		retry: 'Retry',
		continue: 'Continue',
		selectAll: 'Select All',
		deselectAll: 'Deselect All',
		copy: 'Copy',
		copied: 'Copied!',
		share: 'Share',
		print: 'Print'
	},

	// Messages
	messages: {
		success: {
			saved: '{item} saved successfully',
			created: '{item} created successfully',
			updated: '{item} updated successfully',
			deleted: '{item} deleted successfully',
			activated: '{item} activated successfully',
			deactivated: '{item} deactivated successfully'
		},
		error: {
			generic: 'An error occurred. Please try again.',
			notFound: '{item} not found',
			unauthorized: 'You are not authorized to perform this action',
			validation: 'Please check your input and try again',
			network: 'Network error. Please check your connection.'
		},
		confirm: {
			delete: 'Are you sure you want to delete {item}?',
			deactivate: 'Are you sure you want to deactivate {item}?',
			activate: 'Are you sure you want to activate {item}?',
			discard: 'Are you sure you want to discard changes?'
		},
		loading: {
			loading: 'Loading...',
			saving: 'Saving...',
			processing: 'Processing...',
			fetching: 'Fetching data...'
		}
	},

	// Time & Numbers
	time: {
		today: 'Today',
		yesterday: 'Yesterday',
		thisWeek: 'This Week',
		thisMonth: 'This Month',
		thisYear: 'This Year',
		ago: '{time} ago',
		in: 'in {time}',
		justNow: 'Just now',
		minutes: 'minutes',
		hours: 'hours',
		days: 'days',
		weeks: 'weeks',
		months: 'months',
		years: 'years'
	},

	// Pagination
	pagination: {
		previous: 'Previous',
		next: 'Next',
		showing: 'Showing {start}-{end} of {total}',
		page: 'Page {page} of {total}',
		first: 'First',
		last: 'Last'
	}
};
```

**Priority:** High
**Effort:** 8 hours
**Dependencies:** Task 1.1

---

#### Task 2.2: Create Indonesian Translations

**File:** `src/lib/i18n/loaders/id.ts`

**Structure:** Same as English but in Indonesian

**Example:**

```typescript
export const id: TranslationSchema = {
	common: {
		save: 'Simpan',
		cancel: 'Batal',
		delete: 'Hapus',
		edit: 'Ubah',
		view: 'Lihat',
		create: 'Buat',
		loading: 'Memuat...',
		error: 'Kesalahan',
		success: 'Berhasil'
		// ...
	},
	admin: {
		dashboard: {
			title: 'Dasbor',
			subtitle: 'Ringkasan sistem dan metrik performa'
			// ...
		}
		// ...
	}
	// ...
};
```

**Priority:** High
**Effort:** 8 hours
**Dependencies:** Task 2.1

---

### Phase 3: Create UI Components

#### Task 3.1: Create Language Switcher Component

**File:** `src/lib/components/ui/language-switcher.svelte`

**Features:**

- Dropdown or toggle UI
- Current language indicator
- Flag support
- Accessible

**Props:**

```typescript
interface Props {
	variant?: 'dropdown' | 'toggle' | 'select';
	showLabel?: boolean;
	showFlags?: boolean;
}
```

**UI Design Options:**

```
Option 1 (Dropdown):
┌─ EN ▼  │  ┌─ Indonesia 🇮🇩
          │  └─ English 🇺🇸

Option 2 (Toggle):
🇮🇩 ID  |  🇺🇸 EN

Option 3 (Select):
[ Indonesia ▼ ]
```

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 1.2

---

#### Task 3.2: Create Translatable Text Component

**File:** `src/lib/components/ui/translatable.svelte`

**Features:**

- Wrapper for static text
- Key-based translation
- Fallback display
- HTML content support

**Usage:**

```svelte
<Translatable key="admin.dashboard.title" />

<Translatable key="admin.form.name.required" params={{ field: 'School Name' }} />

<Translatable key="admin.notice.html" html />
```

**Priority:** High
**Effort:** 1.5 hours
**Dependencies:** Task 1.2

---

#### Task 3.3: Create i18n Hook

**File:** `src/lib/i18n/hooks.ts`

**Features:**

- `useTranslations(locale)` hook
- `useI18n()` for current language
- Reactive translation updates

**Usage:**

```svelte
<script>
	const t = useTranslations('id');
	const i18n = useI18n();
</script>

<button>{$t('common.save')}</button>
<button onclick={() => i18n.setLanguage('en')}>Switch to English</button>
```

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 1.2

---

### Phase 4: Update Components

#### Task 4.1: Update DashboardHeader

**File:** `src/lib/components/admin/DashboardHeader.svelte`

**Changes:**

```svelte
<script>
	import { i18n } from '$lib/i18n';

	let breadcrumbs = $derived([
		{ label: $i18n.t('nav.dashboard'), href: '/admin' }
		// ...
	]);
</script>

<header>
	<nav>
		{#each breadcrumbs as crumb}
			<a href={crumb.href}>{crumb.label}</a>
		{/each}
	</nav>

	<LanguageSwitcher variant="dropdown" />
</header>
```

**Priority:** High
**Effort:** 1.5 hours
**Dependencies:** Task 3.1

---

#### Task 4.2: Update DashboardSidebar

**File:** `src/lib/components/admin/DashboardSidebar.svelte`

**Changes:**

```svelte
<script>
	import { i18n } from '$lib/i18n';

	const t = $i18n.t;

	const navigation = [
		{
			name: t('nav.main'),
			items: [{ name: t('nav.dashboard'), icon: LayoutDashboard, href: '/admin' }]
		},
		{
			name: t('nav.management'),
			items: [
				{ name: t('nav.organizations'), icon: Building2, href: '/admin/schools' },
				{ name: t('nav.registerSchool'), icon: UserPlus, href: '/admin/register' }
				// ...
			]
		}
		// ...
	];
</script>
```

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 4.1

---

#### Task 4.3: Update Admin Dashboard Page

**File:** `src/routes/admin/+page.svelte`

**Changes:**

- All hardcoded text → translation keys
- KPI card labels
- Table headers
- Button labels
- Toast messages

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 4.2

---

#### Task 4.4: Update Schools Page & Components

**Files:**

- `src/routes/admin/schools/+page.svelte`
- `src/routes/admin/schools/components/SchoolsTable.svelte`
- `src/routes/admin/schools/components/BulkActionToolbar.svelte`
- `src/routes/admin/schools/components/StatsCards.svelte`

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 4.3

---

#### Task 4.5: Update Register Page & Steps

**Files:**

- `src/routes/admin/register/+page.svelte`
- `src/routes/admin/register/steps/StepIdentity.svelte`
- `src/routes/admin/register/steps/StepLocation.svelte`
- `src/routes/admin/register/steps/StepAdmin.svelte`
- `src/routes/admin/register/steps/StepReview.svelte`

**Priority:** High
**Effort:** 5 hours
**Dependencies:** Task 4.4

---

#### Task 4.6: Update Other Admin Pages

**Files to Update:**

- `/admin/verification/+page.svelte`
- `/admin/broadcast/+page.svelte`
- `/admin/settings/+page.svelte`
- `/admin/plans/+page.svelte`
- `/admin/reports/+page.svelte`
- `/admin/users/+page.svelte`
- `/admin/roles/+page.svelte`
- `/admin/health/+page.svelte`
- `/admin/audit-logs/+page.svelte`
- `/admin/payouts/+page.svelte`
- `/admin/announcements/+page.svelte`

**Priority:** Medium
**Effort:** 8 hours
**Dependencies:** Task 4.5

---

#### Task 4.7: Update Server Messages

**Files:** All `+page.server.ts` in admin routes

**Changes:**

```typescript
// Before
return fail(400, { message: 'School name is required' });

// After
return fail(400, {
	message: i18n.t('validation.required', { field: i18n.t('admin.form.schoolName') })
});
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 4.6

---

### Phase 5: Advanced Features

#### Task 5.1: Add Pluralization Support

**File:** `src/lib/i18n/utils/plural.ts`

**Features:**

- Indonesian plural rules (different from English)
- English plural rules
- Count-based pluralization

**Usage:**

```typescript
// English
i18n.t('admin.selectedCount', { count: 5 });
// → "5 schools selected"

// Indonesian (no plural for most)
i18n.t('admin.selectedCount', { count: 5 });
// → "5 sekolah dipilih"
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 2.2

---

#### Task 5.2: Add Date/Number Formatting

**File:** `src/lib/i18n/utils/date.ts`

**Features:**

- Localized date formatting
- Localized number formatting
- Currency formatting
- Relative time

**Usage:**

```typescript
i18n.formatDate(new Date(), 'long');
// English: "January 21, 2026"
// Indonesian: "21 Januari 2026"

i18n.formatNumber(1000000, 'currency');
// English: "$1,000,000"
// Indonesian: "Rp 1.000.000"
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.2

---

#### Task 5.3: Add Interpolation Support

**File:** `src/lib/i18n/utils/interpolate.ts`

**Features:**

- Variable substitution
- Nested object support
- Safe escaping

**Usage:**

```typescript
i18n.t('validation.required', { field: 'School Name' });
// → "School Name is required"

i18n.t('messages.success.created', { item: 'School' });
// → "School created successfully"
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 1.5

---

#### Task 5.4: Add Missing Translations Checker

**File:** `scripts/check-missing-translations.ts`

**Features:**

- Scan all Svelte/TS files
- Find translation keys used but not defined
- Generate missing keys report

**Usage:**

```bash
npm run i18n:check-missing
```

**Output:**

```
Missing translations in id.json:
- admin.dashboard.newFeature (used in +page.svelte:42)
- admin.form.customField (used in form.svelte:15)
```

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** Task 2.2

---

#### Task 5.5: Add Translation Export Script

**File:** `scripts/export-translations.ts`

**Features:**

- Export translations to CSV/Excel
- Import translations from CSV
- Sync with external translation service

**Usage:**

```bash
npm run i18n:export -- --format=csv --output=translations.csv
npm run i18n:import -- --format=csv --input=translations_id.csv --lang=id
```

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** Task 2.2

---

### Phase 6: Testing & Documentation

#### Task 6.1: Create i18n Tests

**File:** `src/lib/i18n/**/*.test.ts`

**Tests:**

- Translation loading
- Language switching
- Fallback behavior
- Interpolation
- Pluralization
- Date formatting

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** All previous tasks

---

#### Task 6.2: Create i18n Documentation

**File:** `/docs/i18n-guide.md`

**Content:**

- Setup instructions
- Usage guide
- Best practices
- Translation file structure
- Adding new languages
- Common patterns

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** All previous tasks

---

## Implementation Order

### Week 1: Infrastructure

| Order | Task                                   | Effort |
| ----- | -------------------------------------- | ------ |
| 1     | Task 1.1: Create Translation Structure | 4h     |
| 2     | Task 1.2: Create Core i18n Store       | 3h     |
| 3     | Task 1.3: Create Language Detector     | 2h     |
| 4     | Task 1.5: Create TypeScript Types      | 2h     |
| 5     | Task 3.3: Create i18n Hook             | 2h     |

### Week 2: Translation Files

| Order | Task                                     | Effort |
| ----- | ---------------------------------------- | ------ |
| 6     | Task 1.4: Create Translation Loaders     | 5h     |
| 7     | Task 2.1: Create English Translations    | 8h     |
| 8     | Task 2.2: Create Indonesian Translations | 8h     |
| 9     | Task 3.1: Create Language Switcher       | 2h     |
| 10    | Task 3.2: Create Translatable Component  | 1.5h   |

### Week 3: Component Updates

| Order | Task                              | Effort |
| ----- | --------------------------------- | ------ |
| 11    | Task 4.1: Update DashboardHeader  | 1.5h   |
| 12    | Task 4.2: Update DashboardSidebar | 2h     |
| 13    | Task 4.3: Update Admin Dashboard  | 3h     |
| 14    | Task 4.4: Update Schools Page     | 4h     |
| 15    | Task 4.5: Update Register Page    | 5h     |

### Week 4: Remaining Pages & Advanced

| Order | Task                                 | Effort |
| ----- | ------------------------------------ | ------ |
| 16    | Task 4.6: Update Other Admin Pages   | 8h     |
| 17    | Task 4.7: Update Server Messages     | 3h     |
| 18    | Task 5.1: Add Pluralization          | 3h     |
| 19    | Task 5.2: Add Date/Number Formatting | 2h     |
| 20    | Task 5.3: Add Interpolation          | 2h     |

### Week 5: Tools, Testing & Docs

| Order | Task                                   | Effort |
| ----- | -------------------------------------- | ------ |
| 21    | Task 5.4: Missing Translations Checker | 2h     |
| 22    | Task 5.5: Translation Export Script    | 2h     |
| 23    | Task 6.1: Create i18n Tests            | 3h     |
| 24    | Task 6.2: Create i18n Documentation    | 2h     |

---

## Total Effort

| Phase                      | Tasks  | Total Time    |
| -------------------------- | ------ | ------------- |
| Phase 1: Infrastructure    | 5      | 13 hours      |
| Phase 2: Translation Files | 4      | 23 hours      |
| Phase 3: UI Components     | 3      | 5.5 hours     |
| Phase 4: Component Updates | 7      | 26.5 hours    |
| Phase 5: Advanced Features | 5      | 11 hours      |
| Phase 6: Testing & Docs    | 2      | 5 hours       |
| **Total**                  | **26** | **~84 hours** |

---

## API Reference

### Main i18n Object

```typescript
interface I18n {
	// State
	language: string; // Current language ('id' | 'en')
	languages: string[]; // Available languages
	translations: Record<string, TranslationSchema>;

	// Methods
	setLanguage(lang: string): void;
	t(key: string, params?: object): string;
	f(date: Date | number, format?: string): string;
	n(value: number, format?: string): string;

	// Utilities
	exists(key: string): boolean;
	addTranslations(lang: string, data: TranslationSchema): void;
}
```

### Translation Key Structure

```
common.action.save
admin.sidebar.dashboard
admin.schools.title
admin.register.step.identity
validation.email.invalid
messages.error.notFound
```

---

## File Changes Summary

### New Files Created:

```
src/lib/i18n/
├── index.ts
├── config.ts
├── loaders/
│   ├── en.ts
│   └── id.ts
├── types.ts
├── utils/
│   ├── interpolate.ts
│   ├── plural.ts
│   └── date.ts
└── detector/
    ├── index.ts
    └── storage.ts

src/lib/components/ui/
├── language-switcher.svelte
└── translatable.svelte

scripts/
├── check-missing-translations.ts
└── export-translations.ts

src/lib/i18n/hooks.ts
```

### Files Modified:

- All files in `src/routes/admin/**`
- All files in `src/lib/components/admin/**`
- Server-side `+page.server.ts` files

---

## Success Criteria

- [ ] i18n infrastructure is set up and working
- [ ] All UI text in admin is translatable
- [ ] Language switcher is accessible and visible
- [ ] Translations work in SSR mode
- [ ] Fallback language works when translation is missing
- [ ] Indonesian translations are complete
- [ ] English translations are complete
- [ ] Pluralization works for both languages
- [ ] Date/number formatting is localized
- [ ] Tests are passing
- [ ] Documentation is complete

---

## Related Documentation

- [Super Admin Dashboard Tasks](super-admin-dashboard-ui-tasks.md)
- [Admin Schools Improvements Tasks](admin-schools-improvements-tasks.md)
- [Admin Register Refactor Tasks](admin-register-refactor-tasks.md)
