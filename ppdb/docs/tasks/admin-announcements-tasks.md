# Admin Announcements Page Refactoring Tasks

**Goal:** Build a comprehensive announcements management system for broadcasting updates to all tenant dashboards, with rich editing, scheduling, targeting, templates, analytics, and full CRUD operations.

**Status:** Ready for Implementation
**Created:** 2026-01-21
**Original File:**

- `src/routes/admin/announcements/+page.svelte` (104 lines - MOCK DATA ONLY)

---

## Current State Analysis

### Current Files in `/src/routes/admin/announcements/`:

| File           | Lines | Purpose                 | Status                  |
| -------------- | ----- | ----------------------- | ----------------------- |
| `+page.svelte` | 104   | Basic UI with mock data | ❌ No server-side logic |

### Current Features (Mock):

- Basic table listing (with mock data)
- Quick draft form on the right
- Published/Draft status badges
- Basic i18n strings

### Issues Identified:

| Category           | Issue                                           | Severity |
| ------------------ | ----------------------------------------------- | -------- |
| **Infrastructure** | No +page.server.ts file                         | Critical |
| **Infrastructure** | No database table for announcements             | Critical |
| **Infrastructure** | No domain logic for announcements               | Critical |
| **Features**       | No Create/Read/Update/Delete functionality      | Critical |
| **Features**       | No rich text editor for content                 | High     |
| **Features**       | No target audience selection                    | High     |
| **Features**       | No scheduling support                           | Medium   |
| **Features**       | No templates system                             | Medium   |
| **Features**       | No analytics/statistics                         | Medium   |
| **Features**       | No search and filtering                         | Medium   |
| **Features**       | No pagination                                   | Medium   |
| **Features**       | No bulk actions                                 | Low      |
| **Features**       | No status workflow (draft → review → published) | Medium   |
| **Features**       | No template categories                          | Low      |
| **Features**       | No scheduled announcements list                 | Medium   |
| **Features**       | No statistics dashboard                         | Medium   |
| **UX**             | No confirmation dialogs                         | Medium   |
| **UX**             | No progress indicators                          | Low      |
| **UX**             | No inline editing                               | Low      |

### Existing i18n Strings:

| Key             | English                                     | Indonesian                                 |
| --------------- | ------------------------------------------- | ------------------------------------------ |
| title           | Announcements                               | Pengumuman                                 |
| subtitle        | Broadcast updates to all tenant dashboards. | Kirim pembaruan ke seluruh dasbor penyewa. |
| newAnnouncement | New Announcement                            | Pengumuman Baru                            |
| history         | History                                     | Riwayat                                    |
| tableTitle      | Title                                       | Judul                                      |
| status          | Status                                      | Status                                     |
| date            | Date                                        | Tanggal                                    |
| action          | Action                                      | Tindakan                                   |
| published       | Published                                   | Diterbitkan                                |
| draft           | Draft                                       | Draf                                       |
| quickDraft      | Quick Draft                                 | Draf Cepat                                 |
| saveDraft       | Save Draft                                  | Simpan Draf                                |
| publish         | Publish                                     | Terbitkan                                  |
| content         | Content                                     | Konten                                     |

---

## Task List

### Phase 1: Database & Infrastructure

#### Task 1.1: Create Announcements Database Schema

**File:** `src/lib/server/db/schema.ts`

**Changes:**

```typescript
// Add announcements table
export const announcements = pgTable('announcements', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	content: text('content').notNull(), // HTML/Markdown content
	contentType: text('content_type').default('html'), // 'html' | 'markdown'
	status: text('status').notNull().default('draft'), // 'draft' | 'scheduled' | 'published' | 'archived'

	// Targeting
	targetType: text('target_type').notNull().default('all'), // 'all' | 'active' | 'inactive' | 'custom'
	targetTenantIds: jsonb('target_tenant_ids').default([]),

	// Scheduling
	publishedAt: timestamp('published_at'),
	scheduledAt: timestamp('scheduled_at'),
	expiresAt: timestamp('expires_at'),

	// Statistics
	viewCount: integer('view_count').default(0),
	clickCount: integer('click_count').default(0),

	// Metadata
	priority: text('priority').default('normal'), // 'low' | 'normal' | 'high' | 'urgent'
	category: text('category'),
	tags: jsonb('tags').default([]),

	// Audit
	createdBy: text('created_by').references(() => users.id),
	updatedBy: text('updated_by').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Add relations
export const announcementsRelations = relations(announcements, ({ one }) => ({
	createdByUser: one(users, {
		fields: [announcements.createdBy],
		references: [users.id]
	}),
	updatedByUser: one(users, {
		fields: [announcements.updatedBy],
		references: [users.id]
	})
}));
```

**Priority:** Critical
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 1.2: Create Announcements Domain Logic

**File:** `src/lib/server/domain/admin/announcements.ts`

**Features:**

- CRUD operations for announcements
- Publishing workflow
- Scheduling logic
- Statistics tracking
- Template support

**Functions:**

```typescript
export interface CreateAnnouncementInput {
	title: string;
	content: string;
	contentType?: 'html' | 'markdown';
	targetType: 'all' | 'active' | 'inactive' | 'custom';
	targetTenantIds?: string[];
	scheduledAt?: Date;
	expiresAt?: Date;
	priority?: 'low' | 'normal' | 'high' | 'urgent';
	category?: string;
	tags?: string[];
	createdBy: string;
}

export interface AnnouncementFilters {
	status?: string;
	targetType?: string;
	category?: string;
	priority?: string;
	search?: string;
	fromDate?: Date;
	toDate?: Date;
	page?: number;
	limit?: number;
}

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement>;

export async function updateAnnouncement(
	id: string,
	input: Partial<CreateAnnouncementInput>,
	updatedBy: string
): Promise<Announcement>;

export async function deleteAnnouncement(id: string): Promise<void>;

export async function publishAnnouncement(id: string): Promise<void>;

export async function archiveAnnouncement(id: string): Promise<void>;

export async function scheduleAnnouncement(id: string, scheduledAt: Date): Promise<void>;

export async function getAnnouncements(
	filters: AnnouncementFilters
): Promise<{ data: Announcement[]; total: number }>;

export async function getAnnouncementById(id: string): Promise<Announcement | null>;

export async function getAnnouncementStats(): Promise<{
	total: number;
	published: number;
	draft: number;
	scheduled: number;
	totalViews: number;
	totalClicks: number;
}>;

export async function recordAnnouncementView(
	announcementId: string,
	tenantId: string
): Promise<void>;

export async function recordAnnouncementClick(
	announcementId: string,
	tenantId: string
): Promise<void>;
```

**Priority:** Critical
**Effort:** 6 hours
**Dependencies:** Task 1.1

---

#### Task 1.3: Create +page.server.ts

**File:** `src/routes/admin/announcements/+page.server.ts`

**Features:**

- Load announcements with pagination
- Load statistics
- Handle CRUD actions
- Handle publish/archive actions
- Handle template actions

**Load Function:**

```typescript
export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = requireSuperAdmin(locals);

	// Parse filters from URL
	const page = parseInt(url.searchParams.get('page') || '1');
	const status = url.searchParams.get('status') || 'all';
	const category = url.searchParams.get('category') || 'all';
	const search = url.searchParams.get('search') || '';

	const { data: announcements, total } = await getAnnouncements({
		status: status !== 'all' ? status : undefined,
		category: category !== 'all' ? category : undefined,
		search,
		page,
		limit: 20
	});

	const stats = await getAnnouncementStats();

	// Get categories for filter
	const categories = await getAnnouncementCategories();

	// Get recent announcements for quick view
	const recentAnnouncements = await getAnnouncements({ limit: 5 });

	return {
		announcements,
		pagination: {
			page,
			total,
			totalPages: Math.ceil(total / 20)
		},
		stats,
		categories,
		filters: { status, category, search }
	};
};
```

**Actions:**

```typescript
export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		// Validate and create announcement
	},

	update: async ({ request, locals }) => {
		// Update announcement
	},

	delete: async ({ request, locals }) => {
		// Delete announcement
	},

	publish: async ({ request, locals }) => {
		// Publish announcement
	},

	archive: async ({ request, locals }) => {
		// Archive announcement
	},

	duplicate: async ({ request, locals }) => {
		// Duplicate announcement
	}
};
```

**Priority:** Critical
**Effort:** 4 hours
**Dependencies:** Task 1.2

---

#### Task 1.4: Create Validation Schema

**File:** `src/lib/server/validators/admin.ts`

**Changes:**

```typescript
export const announcementCreateSchema = z.object({
	title: z.string().min(3).max(200),
	content: z.string().min(10).max(10000),
	contentType: z.enum(['html', 'markdown']).default('html'),
	targetType: z.enum(['all', 'active', 'inactive', 'custom']).default('all'),
	targetTenantIds: z.array(z.string()).optional(),
	scheduledAt: z.string().datetime().optional(),
	expiresAt: z.string().datetime().optional(),
	priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
	category: z.string().max(50).optional(),
	tags: z.array(z.string()).optional()
});

export const announcementUpdateSchema = announcementCreateSchema.partial();

export const announcementFilterSchema = z.object({
	status: z.enum(['all', 'draft', 'scheduled', 'published', 'archived']).default('all'),
	category: z.string().optional(),
	priority: z.enum(['all', 'low', 'normal', 'high', 'urgent']).default('all'),
	search: z.string().optional(),
	page: z.coerce.number().positive().default(1),
	limit: z.coerce.number().positive().max(100).default(20)
});

export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;
export type AnnouncementUpdateInput = z.infer<typeof announcementUpdateSchema>;
export type AnnouncementFilterInput = z.infer<typeof announcementFilterSchema>;
```

**Priority:** High
**Effort:** 1 hour
**Dependencies:** Task 1.1

---

### Phase 2: Create Reusable Components

#### Task 2.1: Create AnnouncementsList Component

**File:** `src/lib/components/admin/AnnouncementsList.svelte`

**Features:**

- Table with pagination
- Search functionality
- Status filter tabs
- Category filter dropdown
- Priority indicator
- Bulk selection
- Bulk actions (publish, archive, delete)

**Props:**

```typescript
interface Props {
	announcements?: Announcement[];
	pagination?: PaginationState;
	filters?: AnnouncementFilters;
	isLoading?: boolean;
	onPageChange?: (page: number) => void;
	onFilterChange?: (filters: AnnouncementFilters) => void;
	onView?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	onPublish?: (id: string) => void;
	onArchive?: (id: string) => void;
	onDuplicate?: (id: string) => void;
	onBulkPublish?: (ids: string[]) => void;
	onBulkArchive?: (ids: string[]) => void;
	onBulkDelete?: (ids: string[]) => void;
}

interface Announcement {
	id: string;
	title: string;
	content: string;
	status: 'draft' | 'scheduled' | 'published' | 'archived';
	priority: 'low' | 'normal' | 'high' | 'urgent';
	category?: string;
	viewCount: number;
	createdAt: Date;
	publishedAt?: Date;
	scheduledAt?: Date;
}
```

**UI Requirements:**

```svelte
<div class="space-y-4">
	<!-- Filters -->
	<div class="flex gap-4">
		<div class="flex-1">
			<Input
				placeholder="Search announcements..."
				bind:value={searchQuery}
				oninput={handleSearch}
			/>
		</div>

		<Select bind:value={statusFilter}>
			<Select.Trigger>All Status</Select.Trigger>
			<Select.Content>
				<SelectItem value="all">All Status</SelectItem>
				<SelectItem value="draft">Draft</SelectItem>
				<SelectItem value="scheduled">Scheduled</SelectItem>
				<SelectItem value="published">Published</SelectItem>
				<SelectItem value="archived">Archived</SelectItem>
			</Select.Content>
		</Select>

		<Select bind:value={categoryFilter}>
			<Select.Trigger>All Categories</Select.Trigger>
			<Select.Content>
				<SelectItem value="all">All Categories</SelectItem>
				{#each categories as category}
					<SelectItem value={category}>{category}</SelectItem>
				{/each}
			</Select.Content>
		</Select>
	</div>

	<!-- Bulk Actions -->
	{#if selectedIds.length > 0}
		<BulkActionBar
			selectedCount={selectedIds.length}
			onPublish={handleBulkPublish}
			onArchive={handleBulkArchive}
			onDelete={handleBulkDelete}
			onClear={handleClearSelection}
		/>
	{/if}

	<!-- Table -->
	<Table>
		<!-- Columns: Checkbox, Title, Status, Priority, Category, Views, Date, Actions -->
	</Table>

	<!-- Pagination -->
	<Pagination bind:currentPage bind:totalPages onPageChange={handlePageChange} />
</div>
```

**Priority:** High
**Effort:** 5 hours
**Dependencies:** None

---

#### Task 2.2: Create AnnouncementForm Component

**File:** `src/lib/components/admin/AnnouncementForm.svelte`

**Features:**

- Rich text editor (HTML/Markdown toggle)
- Title input
- Target audience selection
- Scheduling options (start date, end date/expiry)
- Priority selection
- Category selection
- Tags input
- Preview functionality
- Save as template option

**Props:**

```typescript
interface Props {
	announcement?: Announcement; // For edit mode
	categories?: string[];
	templates?: AnnouncementTemplate[];
	tenants?: Tenant[];
	mode?: 'create' | 'edit' | 'quick';
	onSave?: (data: AnnouncementFormData) => void;
	onCancel?: () => void;
	onPreview?: (data: AnnouncementFormData) => void;
}

interface AnnouncementFormData {
	id?: string;
	title: string;
	content: string;
	contentType: 'html' | 'markdown';
	targetType: 'all' | 'active' | 'inactive' | 'custom';
	targetTenantIds?: string[];
	scheduledAt?: Date;
	expiresAt?: Date;
	priority: 'low' | 'normal' | 'high' | 'urgent';
	category: string;
	tags: string[];
}
```

**UI Requirements:**

```svelte
<form class="space-y-6">
	<!-- Title -->
	<div class="space-y-2">
		<Label>Title *</Label>
		<Input bind:value={formData.title} placeholder="Enter announcement title..." maxlength={200} />
		<p class="text-xs text-muted-foreground">
			{formData.title.length}/200 characters
		</p>
	</div>

	<!-- Content Editor -->
	<div class="space-y-2">
		<Label>Content *</Label>
		<div class="flex gap-2 mb-2">
			<Button
				variant={contentType === 'html' ? 'default' : 'outline'}
				onclick={() => (contentType = 'html')}
			>
				HTML
			</Button>
			<Button
				variant={contentType === 'markdown' ? 'default' : 'outline'}
				onclick={() => (contentType = 'markdown')}
			>
				Markdown
			</Button>
		</div>

		{#if contentType === 'html'}
			<RichTextEditor bind:value={formData.content} />
		{:else}
			<Textarea
				bind:value={formData.content}
				placeholder="Write your announcement in Markdown..."
				rows={15}
				class="font-mono"
			/>
		{/if}
	</div>

	<!-- Target Audience -->
	<div class="space-y-2">
		<Label>Target Audience *</Label>
		<SegmentedControl
			options={[
				{ value: 'all', label: 'All Tenants' },
				{ value: 'active', label: 'Active Tenants Only' },
				{ value: 'inactive', label: 'Inactive Tenants Only' },
				{ value: 'custom', label: 'Custom Selection' }
			]}
			bind:value={formData.targetType}
		/>
		{#if formData.targetType === 'custom'}
			<MultiSelect
				options={tenantOptions}
				bind:value={formData.targetTenantIds}
				placeholder="Select tenants..."
			/>
		{/if}
	</div>

	<!-- Scheduling -->
	<div class="grid md:grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label>Publish Date (Optional)</Label>
			<Input type="datetime-local" bind:value={formData.scheduledAt} />
		</div>
		<div class="space-y-2">
			<Label>Expiration Date (Optional)</Label>
			<Input type="datetime-local" bind:value={formData.expiresAt} />
		</div>
	</div>

	<!-- Priority & Category -->
	<div class="grid md:grid-cols-3 gap-4">
		<div class="space-y-2">
			<Label>Priority</Label>
			<Select bind:value={formData.priority}>
				<Select.Trigger>
					<Badge variant={getPriorityVariant(formData.priority)}>
						{formData.priority}
					</Badge>
				</Select.Trigger>
				<Select.Content>
					<SelectItem value="low">Low</SelectItem>
					<SelectItem value="normal">Normal</SelectItem>
					<SelectItem value="high">High</SelectItem>
					<SelectItem value="urgent">Urgent</SelectItem>
				</Select.Content>
			</Select>
		</div>

		<div class="space-y-2">
			<Label>Category</Label>
			<Select bind:value={formData.category}>
				<Select.Trigger>Select category...</Select.Trigger>
				<Select.Content>
					{#each categories as category}
						<SelectItem value={category}>{category}</SelectItem>
					{/each}
				</Select.Content>
			</Select>
		</div>

		<div class="space-y-2">
			<Label>Tags</Label>
			<Input
				bind:value={tagInput}
				placeholder="Add tags (comma separated)..."
				onkeydown={handleTagInput}
			/>
			<div class="flex flex-wrap gap-2">
				{#each formData.tags as tag}
					<Badge variant="secondary">
						{tag}
						<button onclick={() => removeTag(tag)}>×</button>
					</Badge>
				{/each}
			</div>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex justify-end gap-4 pt-4 border-t">
		<Button variant="outline" onclick={handlePreview}>Preview</Button>
		<Button variant="outline" onclick={handleSaveTemplate}>Save as Template</Button>
		<Button variant="outline" onclick={handleSaveDraft}>Save as Draft</Button>
		<Button onclick={handlePublish}>
			{formData.scheduledAt ? 'Schedule' : 'Publish'}
		</Button>
	</div>
</form>
```

**Priority:** High
**Effort:** 6 hours
**Dependencies:** None

---

#### Task 2.3: Create AnnouncementDetail Component

**File:** `src/lib/components/admin/AnnouncementDetail.svelte`

**Features:**

- Full announcement view
- Statistics display (views, clicks)
- Status timeline
- Target audience info
- Edit/Duplicate buttons
- Archive/Delete buttons

**Props:**

```typescript
interface Props {
	announcement: Announcement;
	statistics?: {
		views: number;
		clicks: number;
		uniqueViews: number;
		clickRate: number;
	};
	onEdit?: (id: string) => void;
	onDuplicate?: (id: string) => void;
	onArchive?: (id: string) => void;
	onDelete?: (id: string) => void;
	onRestore?: (id: string) => void;
}
```

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 2.2

---

#### Task 2.4: Create AnnouncementAnalytics Component

**File:** `src/lib/components/admin/AnnouncementAnalytics.svelte`

**Features:**

- Overview statistics cards
- Views over time chart
- Clicks over time chart
- Top performing announcements
- Engagement metrics
- Export report

**Props:**

```typescript
interface Props {
	stats?: {
		total: number;
		published: number;
		draft: number;
		scheduled: number;
		totalViews: number;
		totalClicks: number;
		avgViewRate: number;
		avgClickRate: number;
	};
	topAnnouncements?: {
		id: string;
		title: string;
		views: number;
		clicks: number;
	}[];
	dailyStats?: {
		date: string;
		views: number;
		clicks: number;
	}[];
	dateRange?: { from: Date; to: Date };
	onDateRangeChange?: (range: { from: Date; to: Date }) => void;
	onExport?: (format: 'csv' | 'pdf' | 'xlsx') => void;
}
```

**UI Requirements:**

```svelte
<div class="space-y-6">
	<!-- Stats Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Total Announcements</CardTitle>
				<FileText class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.total}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Total Views</CardTitle>
				<Eye class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.totalViews}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Total Clicks</CardTitle>
				<MousePointerClick class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.totalClicks}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Avg. Click Rate</CardTitle>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{stats.avgClickRate}%</div>
			</CardContent>
		</Card>
	</div>

	<!-- Charts -->
	<div class="grid gap-4 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Views Over Time</CardTitle>
			</CardHeader>
			<CardContent>
				<LineChart data={dailyStats} xKey="date" yKey="views" />
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Engagement Metrics</CardTitle>
			</CardHeader>
			<CardContent>
				<BarChart data={topAnnouncements} xKey="title" yKeys={['views', 'clicks']} />
			</CardContent>
		</Card>
	</div>
</div>
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 2.5: Create AnnouncementTemplateManager Component

**File:** `src/lib/components/admin/AnnouncementTemplateManager.svelte`

**Features:**

- List templates with categories
- Create/Edit/Delete templates
- Use template to create announcement
- Template preview
- Import/Export templates

**Props:**

```typescript
interface Props {
	templates?: AnnouncementTemplate[];
	categories?: string[];
	onSave?: (template: AnnouncementTemplate) => void;
	onDelete?: (id: string) => void;
	onUse?: (template: AnnouncementTemplate) => void;
	onImport?: (templates: AnnouncementTemplate[]) => void;
	onExport?: () => void;
}

interface AnnouncementTemplate {
	id: string;
	name: string;
	category: string;
	title: string;
	content: string;
	contentType: 'html' | 'markdown';
	priority: string;
	usageCount: number;
	createdAt: Date;
}
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 2.2

---

#### Task 2.6: Create AnnouncementCard Component

**File:** `src/lib/components/admin/AnnouncementCard.svelte`

**Features:**

- Compact card view for dashboard
- Preview in list
- Quick actions
- Status and priority badges

**Props:**

```typescript
interface Props {
	announcement: Announcement;
	variant?: 'compact' | 'full';
	showActions?: boolean;
	onClick?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.3

---

#### Task 2.7: Create QuickDraft Component

**File:** `src/lib/components/admin/QuickDraft.svelte`

**Features:**

- Compact form for quick announcements
- Title and content inputs
- Quick save options
- Recent drafts list

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.2

---

### Phase 3: Create API Endpoints

#### Task 3.1: Create Announcements API

**File:** `src/routes/admin/api/announcements/+server.ts`

**Endpoints:**

```typescript
// GET /api/announcements - List announcements with filters
// GET /api/announcements/:id - Get single announcement
// POST /api/announcements - Create announcement
// PUT /api/announcements/:id - Update announcement
// DELETE /api/announcements/:id - Delete announcement
// POST /api/announcements/:id/publish - Publish
// POST /api/announcements/:id/archive - Archive
// POST /api/announcements/:id/duplicate - Duplicate
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 1.2, 1.3

---

#### Task 3.2: Create Announcements Templates API

**File:** `src/routes/admin/api/announcements/templates/+server.ts`

**Endpoints:**

```typescript
// GET /api/announcements/templates - List templates
// POST /api/announcements/templates - Create template
// PUT /api/announcements/templates/:id - Update template
// DELETE /api/announcements/templates/:id - Delete template
// POST /api/announcements/templates/import - Import templates
// GET /api/announcements/templates/export - Export templates
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 2.5

---

#### Task 3.3: Create Announcements Analytics API

**File:** `src/routes/admin/api/announcements/analytics/+server.ts`

**Endpoints:**

```typescript
// GET /api/announcements/analytics - Get analytics overview
// GET /api/announcements/analytics/:id - Get single announcement stats
// GET /api/announcements/analytics/export - Export analytics
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.4

---

### Phase 4: Refactor Main Page

#### Task 4.1: Refactor +page.svelte

**File:** `src/routes/admin/announcements/+page.svelte`

**Changes:**

```svelte
<script lang="ts">
	import AnnouncementsList from '$lib/components/admin/AnnouncementsList.svelte';
	import AnnouncementForm from '$lib/components/admin/AnnouncementForm.svelte';
	import AnnouncementDetail from '$lib/components/admin/AnnouncementDetail.svelte';
	import AnnouncementAnalytics from '$lib/components/admin/AnnouncementAnalytics.svelte';
	import AnnouncementTemplateManager from '$lib/components/admin/AnnouncementTemplateManager.svelte';
	import QuickDraft from '$lib/components/admin/QuickDraft.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import { i18n } from '$lib/i18n';

	let activeTab = $state<'list' | 'analytics' | 'templates'>('list');
	let showCreateDialog = $state(false);
	let showDetailPanel = $state(false);
	let selectedAnnouncement = $state<Announcement | null>(null);
	let viewMode = $state<'table' | 'cards'>('table');
</script>

<div class="container mx-auto py-10 max-w-6xl space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">
				{i18n.t('admin.announcements.title')}
			</h1>
			<p class="text-muted-foreground mt-1">
				{i18n.t('admin.announcements.subtitle')}
			</p>
		</div>
		<Button onclick={() => (showCreateDialog = true)}>
			<Plus class="h-4 w-4 mr-2" />
			{i18n.t('admin.announcements.newAnnouncement')}
		</Button>
	</div>

	<!-- Tabs -->
	<Tabs bind:value={activeTab}>
		<Tabs.List>
			<Tabs.Trigger value="list">Announcements</Tabs.Trigger>
			<Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
			<Tabs.Trigger value="templates">Templates</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="list">
			<div class="grid gap-6 lg:grid-cols-4">
				<!-- Main List -->
				<div class="lg:col-span-3">
					<AnnouncementsList
						announcements={data.announcements}
						pagination={data.pagination}
						filters={data.filters}
						onView={handleView}
						onEdit={handleEdit}
						onDelete={handleDelete}
						onPublish={handlePublish}
					/>
				</div>

				<!-- Quick Draft Sidebar -->
				<div>
					<QuickDraft onSave={handleQuickSave} recentDrafts={data.recentDrafts} />
				</div>
			</div>
		</Tabs.Content>

		<Tabs.Content value="analytics">
			<AnnouncementAnalytics
				stats={data.stats}
				topAnnouncements={data.topAnnouncements}
				dailyStats={data.dailyStats}
				onExport={handleExportAnalytics}
			/>
		</Tabs.Content>

		<Tabs.Content value="templates">
			<AnnouncementTemplateManager
				templates={data.templates}
				categories={data.categories}
				onSave={handleSaveTemplate}
				onDelete={handleDeleteTemplate}
				onUse={handleUseTemplate}
			/>
		</Tabs.Content>
	</Tabs>
</div>

<!-- Create/Edit Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>
				{selectedAnnouncement
					? i18n.t('admin.announcements.editAnnouncement')
					: i18n.t('admin.announcements.newAnnouncement')}
			</Dialog.Title>
		</Dialog.Header>
		<AnnouncementForm
			announcement={selectedAnnouncement}
			categories={data.categories}
			templates={data.templates}
			tenants={data.tenants}
			onSave={handleSave}
			onCancel={() => {
				showCreateDialog = false;
				selectedAnnouncement = null;
			}}
			onPreview={handlePreview}
		/>
	</Dialog.Content>
</Dialog.Root>

<!-- Detail Panel -->
{#if showDetailPanel && selectedAnnouncement}
	<AnnouncementDetail
		announcement={selectedAnnouncement}
		statistics={selectedAnnouncementStats}
		onEdit={handleEdit}
		onDuplicate={handleDuplicate}
		onArchive={handleArchive}
		onDelete={handleDelete}
		onClose={() => {
			showDetailPanel = false;
			selectedAnnouncement = null;
		}}
	/>
{/if}
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 2.1, 2.2, 2.3, 2.4, 2.5, 2.7

---

### Phase 5: Add New Features

#### Task 5.1: Add Rich Text Editor

**Files:** Multiple

**Features:**

- HTML editor support (using Quill, TinyMCE, or Tiptap)
- Image upload
- Link insertion
- Text formatting
- Code block support

**Implementation Options:**

1. Use `@tailwindcss/typography` for Markdown preview
2. Integrate Tiptap editor
3. Or use a simple textarea with Markdown support

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 2.2

---

#### Task 5.2: Add Scheduled Announcements

**Files:** Multiple

**Features:**

- Schedule announcement for future date
- List upcoming scheduled announcements
- Cancel scheduled announcements
- Edit scheduled announcements

**UI:**

```svelte
<div class="space-y-4">
	<h3 class="text-lg font-semibold">Scheduled Announcements</h3>

	{#if scheduledAnnouncements.length > 0}
		<div class="space-y-2">
			{#each scheduledAnnouncements as announcement}
				<Card>
					<CardContent class="flex items-center justify-between p-4">
						<div>
							<p class="font-medium">{announcement.title}</p>
							<p class="text-sm text-muted-foreground">
								Scheduled for: {formatDateTime(announcement.scheduledAt)}
							</p>
						</div>
						<div class="flex gap-2">
							<Button variant="outline" size="sm" onclick={() => editScheduled(announcement)}>
								Edit
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onclick={() => cancelScheduled(announcement.id)}
							>
								Cancel
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<p class="text-muted-foreground">No scheduled announcements.</p>
	{/if}
</div>
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 1.2, 1.3

---

#### Task 5.3: Add Announcement Categories

**Files:** Multiple

**Features:**

- CRUD for categories
- Category filter
- Category color coding
- Category statistics

**Database:**

```typescript
export const announcementCategories = pgTable('announcement_categories', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	color: text('color').default('#3b82f6'),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow()
});
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** None

---

#### Task 5.4: Add Announcement Tags

**Files:** Multiple

**Features:**

- Tag management
- Tag filtering
- Tag cloud
- Popular tags

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 5.5: Add Priority Levels

**Files:** Multiple

**Features:**

- Visual priority indicators (colors, icons)
- Priority filtering
- Priority-based sorting
- Urgent notifications

**UI:**

```svelte
<Badge
	variant={announcement.priority === 'urgent'
		? 'destructive'
		: announcement.priority === 'high'
			? 'default'
			: announcement.priority === 'low'
				? 'secondary'
				: 'outline'}
>
	{#if announcement.priority === 'urgent'}
		<AlertTriangle class="h-3 w-3 mr-1" />
	{/if}
	{announcement.priority}
</Badge>
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.2

---

#### Task 5.6: Add Status Workflow

**Files:** Multiple

**Features:**

- Draft → Review → Published workflow (optional)
- Status transitions with validation
- Status history/audit trail
- Auto-publish on schedule

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** Task 1.2

---

### Phase 6: UX Improvements

#### Task 6.1: Add Confirmation Dialogs

**Files:** All announcement components

**Features:**

- Delete confirmation
- Archive confirmation
- Bulk delete confirmation
- Unsaved changes dialog

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.1, 2.2

---

#### Task 6.2: Add Toast Notifications

**Files:** All announcement components

**Features:**

- Success toasts for all actions
- Error toasts with retry option
- Info toasts for scheduled items
- Notification center for announcements

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 6.3: Add Loading States

**Files:** All announcement components

**Features:**

- Skeleton loaders
- Spinners for actions
- Progress indicators
- Disabled states

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 6.4: Add Empty States

**Files:** All announcement components

**Features:**

- Empty state for list
- Empty state for templates
- Empty state for search results
- Call-to-action in empty states

**Priority:** Low
**Effort:** 1 hour
**Dependencies:** Task 2.1

---

#### Task 6.5: Add Keyboard Shortcuts

**Files:** `AnnouncementForm.svelte`, main page

**Features:**

- `Ctrl+N` - New announcement
- `Ctrl+S` - Save draft
- `Ctrl+Enter` - Publish
- `Ctrl+P` - Preview
- `Esc` - Close dialog

**Priority:** Low
**Effort:** 1 hour
**Dependencies:** Task 2.2

---

### Phase 7: Testing & Documentation

#### Task 7.1: Create Unit Tests

**Files:**

- `src/lib/server/domain/admin/announcements.test.ts`
- `src/lib/components/admin/AnnouncementsList.test.ts`
- `src/lib/components/admin/AnnouncementForm.test.ts`

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** All previous tasks

---

#### Task 7.2: Create Integration Tests

**Files:** API endpoint tests

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 3.1, 3.2, 3.3

---

#### Task 7.3: Create User Guide

**File:** `/docs/admin-announcements-guide.md`

**Content:**

- How to create announcements
- How to use templates
- How to schedule announcements
- Understanding analytics
- Best practices
- FAQ

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** All previous tasks

---

## Implementation Order

### Week 1: Infrastructure & Components

| Order | Task                        | Effort |
| ----- | --------------------------- | ------ |
| 1     | Task 1.1: Database Schema   | 2h     |
| 2     | Task 1.2: Domain Logic      | 6h     |
| 3     | Task 1.3: +page.server.ts   | 4h     |
| 4     | Task 1.4: Validation Schema | 1h     |
| 5     | Task 2.1: AnnouncementsList | 5h     |
| 6     | Task 2.2: AnnouncementForm  | 6h     |

### Week 2: More Components & API

| Order | Task                            | Effort |
| ----- | ------------------------------- | ------ |
| 7     | Task 2.3: AnnouncementDetail    | 3h     |
| 8     | Task 2.4: AnnouncementAnalytics | 4h     |
| 9     | Task 2.5: TemplateManager       | 3h     |
| 10    | Task 2.6: AnnouncementCard      | 2h     |
| 11    | Task 2.7: QuickDraft            | 2h     |
| 12    | Task 3.1: Announcements API     | 4h     |

### Week 3: Refactor & Features

| Order | Task                              | Effort |
| ----- | --------------------------------- | ------ |
| 13    | Task 3.2: Templates API           | 3h     |
| 14    | Task 3.3: Analytics API           | 2h     |
| 15    | Task 4.1: Refactor +page.svelte   | 4h     |
| 16    | Task 5.1: Rich Text Editor        | 4h     |
| 17    | Task 5.2: Scheduled Announcements | 3h     |
| 18    | Task 5.3: Categories              | 3h     |

### Week 4: Polish & Extras

| Order | Task                           | Effort |
| ----- | ------------------------------ | ------ |
| 19    | Task 5.4: Tags                 | 2h     |
| 20    | Task 5.5: Priority Levels      | 2h     |
| 21    | Task 5.6: Status Workflow      | 4h     |
| 22    | Task 6.1: Confirmation Dialogs | 2h     |
| 23    | Task 6.2: Toast Notifications  | 1.5h   |
| 24    | Task 6.3: Loading States       | 2h     |
| 25    | Task 6.4: Empty States         | 1h     |
| 26    | Task 6.5: Keyboard Shortcuts   | 1h     |

### Week 5: Testing & Docs

| Order | Task                        | Effort |
| ----- | --------------------------- | ------ |
| 27    | Task 7.1: Unit Tests        | 4h     |
| 28    | Task 7.2: Integration Tests | 3h     |
| 29    | Task 7.3: User Guide        | 2h     |

---

## Total Effort

| Phase                   | Tasks  | Total Time      |
| ----------------------- | ------ | --------------- |
| Phase 1: Infrastructure | 4      | 13 hours        |
| Phase 2: Components     | 7      | 25 hours        |
| Phase 3: API            | 3      | 9 hours         |
| Phase 4: Refactor       | 1      | 4 hours         |
| Phase 5: New Features   | 6      | 18 hours        |
| Phase 6: UX             | 5      | 9.5 hours       |
| Phase 7: Testing & Docs | 3      | 9 hours         |
| **Total**               | **29** | **~87.5 hours** |

---

## New Component Structure

```
src/lib/components/admin/
├── AnnouncementsList.svelte         # Task 2.1
├── AnnouncementForm.svelte          # Task 2.2
├── AnnouncementDetail.svelte        # Task 2.3
├── AnnouncementAnalytics.svelte     # Task 2.4
├── AnnouncementTemplateManager.svelte # Task 2.5
├── AnnouncementCard.svelte          # Task 2.6
└── QuickDraft.svelte                # Task 2.7

src/lib/server/domain/admin/
├── announcements.ts                 # Task 1.2
└── announcement-templates.ts        # New (for templates)

src/lib/server/jobs/
└── scheduled-announcements.ts       # Task 5.2

src/routes/admin/api/announcements/
├── +server.ts                       # Task 3.1
├── templates/
│   └── +server.ts                   # Task 3.2
└── analytics/
    └── +server.ts                   # Task 3.3
```

---

## API Reference

### Announcement Interface

```typescript
interface Announcement {
	id: string;
	title: string;
	content: string;
	contentType: 'html' | 'markdown';
	status: 'draft' | 'scheduled' | 'published' | 'archived';
	targetType: 'all' | 'active' | 'inactive' | 'custom';
	targetTenantIds: string[];
	priority: 'low' | 'normal' | 'high' | 'urgent';
	category?: string;
	tags: string[];
	viewCount: number;
	clickCount: number;
	scheduledAt?: Date;
	publishedAt?: Date;
	expiresAt?: Date;
	createdBy: string;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
}
```

### AnnouncementFormData Interface

```typescript
interface AnnouncementFormData {
	id?: string;
	title: string;
	content: string;
	contentType: 'html' | 'markdown';
	targetType: 'all' | 'active' | 'inactive' | 'custom';
	targetTenantIds?: string[];
	scheduledAt?: Date;
	expiresAt?: Date;
	priority: 'low' | 'normal' | 'high' | 'urgent';
	category: string;
	tags: string[];
}
```

---

## Success Criteria

- [ ] Announcements page has full CRUD functionality
- [ ] Announcements can be scheduled for future publication
- [ ] Rich text editor works for content creation
- [ ] Target audience selection works
- [ ] Templates system is functional
- [ ] Analytics dashboard shows correct statistics
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] TypeScript types proper (no `any` where possible)
- [ ] Accessibility: proper aria-labels, focus management
- [ ] Confirmation dialogs prevent accidental actions
- [ ] Toast notifications provide feedback
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] User guide is complete

---

## Files Changed Summary

### Files Modified:

- `src/lib/server/db/schema.ts`
- `src/lib/server/validators/admin.ts`
- `src/routes/admin/announcements/+page.svelte`

### Files Created:

- `src/lib/server/domain/admin/announcements.ts`
- `src/lib/server/domain/admin/announcement-templates.ts`
- `src/lib/server/jobs/scheduled-announcements.ts`
- `src/routes/admin/announcements/+page.server.ts`
- `src/routes/admin/api/announcements/+server.ts`
- `src/routes/admin/api/announcements/templates/+server.ts`
- `src/routes/admin/api/announcements/analytics/+server.ts`
- `src/lib/components/admin/AnnouncementsList.svelte`
- `src/lib/components/admin/AnnouncementForm.svelte`
- `src/lib/components/admin/AnnouncementDetail.svelte`
- `src/lib/components/admin/AnnouncementAnalytics.svelte`
- `src/lib/components/admin/AnnouncementTemplateManager.svelte`
- `src/lib/components/admin/AnnouncementCard.svelte`
- `src/lib/components/admin/QuickDraft.svelte`

### Files Deleted:

- None

---

## Related Documentation

- [Super Admin Dashboard Tasks](super-admin-dashboard-ui-tasks.md)
- [Admin Broadcast Tasks](admin-broadcast-tasks.md)
- [Admin Schools Improvements Tasks](admin-schools-improvements-tasks.md)
- [Admin Units Refactor Tasks](admin-units-refactor-tasks.md)
- [Super Admin i18n Tasks](super-admin-i18n-tasks.md)
