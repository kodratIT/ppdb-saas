# Admin Broadcast Page Refactoring Tasks

**Goal:** Refactor and enhance admin broadcast page with comprehensive features for mass WhatsApp messaging, history tracking, templates, and analytics.

**Status:** Ready for Implementation
**Created:** 2026-01-21
**Original Files:**

- `src/routes/admin/broadcast/+page.svelte` (176 lines)
- `src/routes/admin/broadcast/+page.server.ts` (39 lines)

---

## Current State Analysis

### Files in `/src/routes/admin/broadcast/`:

| File              | Lines | Purpose           | Status                      |
| ----------------- | ----- | ----------------- | --------------------------- |
| `+page.svelte`    | 176   | Broadcast form UI | ⚠️ Basic, needs enhancement |
| `+page.server.ts` | 39    | Server actions    | ⚠️ Limited features         |

### Current Features:

- Target audience selection (all, active, inactive)
- WhatsApp message input
- Simple send action
- Success/error feedback

### Existing Related Files:

| File                                       | Purpose                    | Status   |
| ------------------------------------------ | -------------------------- | -------- |
| `src/lib/server/domain/admin/broadcast.ts` | Broadcast logic (55 lines) | ⚠️ Basic |
| `src/lib/server/validators/admin.ts`       | Broadcast schema           | ✅ Good  |
| `src/lib/i18n/loaders/en.ts`               | i18n strings               | ✅ Good  |
| `src/lib/i18n/loaders/id.ts`               | i18n strings               | ✅ Good  |

### Issues Identified:

| Category       | Issue                                  | Severity |
| -------------- | -------------------------------------- | -------- |
| **Features**   | No message template system             | High     |
| **Features**   | No broadcast history/activity log      | High     |
| **Features**   | No message scheduling                  | Medium   |
| **Features**   | No personalization variables           | Medium   |
| **Features**   | No delivery analytics                  | High     |
| **Features**   | No template variables preview          | Medium   |
| **Features**   | No recipient preview                   | Medium   |
| **Features**   | No message status tracking             | Medium   |
| **Features**   | No bulk send from CSV                  | Low      |
| **Features**   | No message drafts                      | Medium   |
| **Features**   | No template categories                 | Low      |
| **Components** | No reusable BroadcastForm component    | Medium   |
| **Components** | No reusable BroadcastHistory component | Medium   |
| **UX**         | No progress indicator during send      | Medium   |
| **UX**         | No confirmation for large sends        | Low      |
| **Security**   | No rate limiting feedback              | Medium   |
| **Security**   | No message approval workflow           | Low      |

---

## Task List

### Phase 1: Create Reusable Components

#### Task 1.1: Create BroadcastForm Component

**File:** `src/lib/components/admin/BroadcastForm.svelte`

**Description:** Extract broadcast form into reusable component with advanced features.

**Features:**

- Target audience selection (all, active, inactive, custom)
- Message editor with template variables
- Character counter
- Template selector dropdown
- Preview panel
- Scheduling option

**Props:**

```typescript
interface Props {
	tenants?: Tenant[];
	templates?: MessageTemplate[];
	presets?: BroadcastPreset[];
	onSend?: (data: BroadcastFormData) => void;
	onSaveTemplate?: (data: { name: string; message: string }) => void;
	onPreview?: (data: BroadcastFormData) => void;
}

interface BroadcastFormData {
	targetType: 'all' | 'active' | 'inactive' | 'custom';
	targetTenantIds?: string[];
	message: string;
	scheduledAt?: Date;
	variables?: Record<string, string>;
}

interface MessageTemplate {
	id: string;
	name: string;
	category: string;
	message: string;
	variables: string[];
}

interface BroadcastPreset {
	id: string;
	name: string;
	targetType: string;
	message: string;
}
```

**UI Requirements:**

```svelte
<div class="space-y-6">
	<!-- Target Selection -->
	<div class="space-y-2">
		<Label>Target Audience</Label>
		<SegmentedControl options={['all', 'active', 'inactive', 'custom']} bind:value={targetType} />
		{#if targetType === 'custom'}
			<MultiSelect options={tenantOptions} bind:value={selectedTenantIds} />
		{/if}
	</div>

	<!-- Message Editor -->
	<div class="grid md:grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label>Message Template</Label>
			<Select bind:value={selectedTemplate}>
				<Select.Trigger>Select template...</Select.Trigger>
				<Select.Content>
					{#each templates as template}
						<SelectItem value={template.id}>{template.name}</SelectItem>
					{/each}
				</Select.Content>
			</Select>
		</div>

		<!-- Template Variables -->
		<div class="space-y-2">
			<Label>Insert Variable</Label>
			<div class="flex flex-wrap gap-2">
				{#each availableVariables as variable}
					<Button variant="outline" size="sm" onclick={() => insertVariable(variable)}>
						{`{{${variable}}}`}
					</Button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Message Input -->
	<div class="space-y-2">
		<Label>Message Content</Label>
		<Textarea bind:value={message} rows={8} placeholder="Type your message..." />
		<div class="flex justify-between text-xs text-muted-foreground">
			<span>{characterCount}/2000 characters</span>
			<span>{messageLines} lines</span>
		</div>
	</div>

	<!-- Scheduling -->
	<div class="space-y-2">
		<Label>Schedule (Optional)</Label>
		<Input type="datetime-local" bind:value={scheduledAt} />
	</div>

	<!-- Actions -->
	<div class="flex gap-4">
		<Button onclick={handleSend}>Send Now</Button>
		<Button variant="outline" onclick={handleSaveTemplate}>Save as Template</Button>
		<Button variant="outline" onclick={handlePreview}>Preview</Button>
	</div>
</div>
```

**Priority:** High
**Effort:** 5 hours
**Dependencies:** None

---

#### Task 1.2: Create BroadcastHistory Component

**File:** `src/lib/components/admin/BroadcastHistory.svelte`

**Description:** Display broadcast history with filtering, search, and status tracking.

**Features:**

- List of past broadcasts
- Status badges (sent, scheduled, failed, pending)
- Filtering by date, status, target
- Search functionality
- Pagination
- Re-send option
- Export history

**Props:**

```typescript
interface Props {
	history?: BroadcastRecord[];
	isLoading?: boolean;
	onViewDetails?: (id: string) => void;
	onResend?: (id: string) => void;
	onExport?: (filters: BroadcastFilters) => void;
}

interface BroadcastRecord {
	id: string;
	createdAt: Date;
	targetType: string;
	targetCount: number;
	sentCount: number;
	failedCount: number;
	status: 'sent' | 'scheduled' | 'failed' | 'pending';
	messagePreview: string;
	scheduledAt?: Date;
	sentAt?: Date;
	senderName: string;
}
```

**UI Requirements:**

```svelte
<div class="space-y-4">
	<!-- Filters -->
	<div class="flex gap-4">
		<Select bind:value={statusFilter}>
			<Select.Trigger>All Status</Select.Trigger>
			<Select.Content>
				<SelectItem value="all">All Status</SelectItem>
				<SelectItem value="sent">Sent</SelectItem>
				<SelectItem value="scheduled">Scheduled</SelectItem>
				<SelectItem value="failed">Failed</SelectItem>
			</Select.Content>
		</Select>

		<Input bind:value={searchQuery} placeholder="Search messages..." />

		<Input type="date" bind:value={dateFrom} />
		<Input type="date" bind:value={dateTo} />
	</div>

	<!-- History Table -->
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>Date</TableHead>
				<TableHead>Target</TableHead>
				<TableHead>Message</TableHead>
				<TableHead>Status</TableHead>
				<TableHead>Reach</TableHead>
				<TableHead>Actions</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each history as record}
				<TableRow>
					<TableCell>{formatDate(record.createdAt)}</TableCell>
					<TableCell>{record.targetType}</TableCell>
					<TableCell class="max-w-xs truncate">{record.messagePreview}</TableCell>
					<TableCell>
						<Badge variant={getStatusVariant(record.status)}>
							{record.status}
						</Badge>
					</TableCell>
					<TableCell>
						{record.sentCount}/{record.targetCount}
					</TableCell>
					<TableCell>
						<Button variant="ghost" size="icon" onclick={() => onViewDetails(record.id)}>
							<Eye class="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" onclick={() => onResend(record.id)}>
							<Send class="h-4 w-4" />
						</Button>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>

	<!-- Pagination -->
	<Pagination bind:currentPage bind:totalPages />
</div>
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 1.3: Create BroadcastAnalytics Component

**File:** `src/lib/components/admin/BroadcastAnalytics.svelte`

**Description:** Display analytics and metrics for broadcast performance.

**Features:**

- Total broadcasts count
- Total messages sent
- Success rate percentage
- Average delivery time
- Top performing messages
- Weekly/monthly trends
- Export analytics

**Props:**

```typescript
interface Props {
	analytics?: BroadcastAnalytics;
	dateRange?: { from: Date; to: Date };
}

interface BroadcastAnalytics {
	totalBroadcasts: number;
	totalMessagesSent: number;
	totalMessagesFailed: number;
	successRate: number;
	averageDeliveryTime: number;
	topMessages: { message: string; sentCount: number }[];
	dailyStats: { date: string; sent: number; failed: number }[];
	topTargets: { tenant: string; receivedCount: number }[];
}
```

**UI Requirements:**

```svelte
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle class="text-sm font-medium">Total Broadcasts</CardTitle>
			<Send class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{analytics.totalBroadcasts}</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle class="text-sm font-medium">Messages Sent</CardTitle>
			<CheckCircle class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{analytics.totalMessagesSent}</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle class="text-sm font-medium">Success Rate</CardTitle>
			<TrendingUp class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{analytics.successRate}%</div>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle class="text-sm font-medium">Failed</CardTitle>
			<AlertCircle class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-destructive">{analytics.totalMessagesFailed}</div>
		</CardContent>
	</Card>
</div>

<!-- Charts -->
<div class="grid gap-4 lg:grid-cols-2">
	<Card>
		<CardHeader>
			<CardTitle>Daily Trends</CardTitle>
		</CardHeader>
		<CardContent>
			<LineChart data={analytics.dailyStats} />
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Top Messages</CardTitle>
		</CardHeader>
		<CardContent>
			<BarChart data={analytics.topMessages} />
		</CardContent>
	</Card>
</div>
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 1.4: Create MessageTemplateManager Component

**File:** `src/lib/components/admin/MessageTemplateManager.svelte`

**Description:** CRUD interface for message templates.

**Features:**

- List all templates
- Create new template
- Edit existing template
- Delete template
- Category organization
- Template preview
- Import/export templates

**Props:**

```typescript
interface Props {
	templates?: MessageTemplate[];
	categories?: string[];
	onSave?: (template: MessageTemplate) => void;
	onDelete?: (id: string) => void;
	onImport?: (templates: MessageTemplate[]) => void;
	onExport?: () => void;
}

interface MessageTemplate {
	id: string;
	name: string;
	category: string;
	message: string;
	variables: string[];
	createdAt: Date;
	updatedAt: Date;
	usageCount: number;
}
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 1.1

---

#### Task 1.5: Create RecipientPreview Component

**File:** `src/lib/components/admin/RecipientPreview.svelte`

**Description:** Preview recipients before sending broadcast.

**Features:**

- List of recipients (with pagination)
- Recipient count
- Recipient details (name, tenant, phone)
- Export recipient list
- Remove individual recipients

**Props:**

```typescript
interface Props {
	recipients?: Recipient[];
	totalCount: number;
	isLoading?: boolean;
	onRemove?: (id: string) => void;
	onExport?: () => void;
}

interface Recipient {
	id: string;
	name: string;
	tenantName: string;
	phone: string;
	email?: string;
}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 1.1

---

#### Task 1.6: Create MessagePreviewModal Component

**File:** `src/lib/components/admin/MessagePreviewModal.svelte`

**Description:** Preview how message will appear on WhatsApp.

**Features:**

- WhatsApp-style preview
- Variable substitution preview
- Character count warning
- Send test message option
- Copy message

**Props:**

```typescript
interface Props {
	message: string;
	variables?: Record<string, string>;
	open?: boolean;
	onSendTest?: (phone: string) => void;
	onClose?: () => void;
}
```

**UI Requirements:**

```svelte
<!-- WhatsApp-style preview -->
<div class="bg-[#e5ded8] rounded-lg p-4 max-w-md">
	<div class="bg-[#dcf8c6] rounded-lg p-3 max-w-[80%] ml-auto">
		<p class="whitespace-pre-wrap">{processedMessage}</p>
		<span class="text-xs text-gray-500 block text-right mt-1">
			{formatTime(new Date())}
		</span>
	</div>
</div>
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 1.1

---

### Phase 2: Enhance Server-Side

#### Task 2.1: Enhance Broadcast Domain Logic

**File:** `src/lib/server/domain/admin/broadcast.ts`

**Changes:**

- Add template system support
- Add scheduling support
- Add message queue for scheduled broadcasts
- Add delivery tracking
- Add rate limiting
- Add concurrency control

**New Functions:**

```typescript
export async function createBroadcast(options: {
	targetTenantIds: string[];
	message: string;
	scheduledAt?: Date;
	senderId: string;
	templateId?: string;
	variables?: Record<string, string>;
}): Promise<BroadcastRecord>;

export async function scheduleBroadcast(id: string, scheduledAt: Date): Promise<void>;

export async function cancelBroadcast(id: string): Promise<void>;

export async function getBroadcastHistory(filters: {
	from?: Date;
	to?: Date;
	status?: string;
	limit?: number;
	offset?: number;
}): Promise<BroadcastRecord[]>;

export async function getBroadcastAnalytics(filters: {
	from?: Date;
	to?: Date;
}): Promise<BroadcastAnalytics>;

export async function resendBroadcast(id: string): Promise<BroadcastResult>;
```

**Priority:** High
**Effort:** 6 hours
**Dependencies:** None

---

#### Task 2.2: Add Broadcast Validation Schema

**File:** `src/lib/server/validators/admin.ts`

**Changes:**

```typescript
export const broadcastCreateSchema = z.object({
	targetType: z.enum(['all', 'active', 'inactive', 'custom']),
	targetTenantIds: z.array(z.string()).optional(),
	message: z.string().min(10).max(2000),
	scheduledAt: z.string().datetime().optional(),
	templateId: z.string().optional(),
	variables: z.record(z.string()).optional()
});

export const broadcastTemplateSchema = z.object({
	name: z.string().min(3).max(100),
	category: z.string().max(50),
	message: z.string().min(10).max(2000),
	variables: z.array(z.string())
});

export type BroadcastCreateInput = z.infer<typeof broadcastCreateSchema>;
export type BroadcastTemplateInput = z.infer<typeof broadcastTemplateSchema>;
```

**Priority:** High
**Effort:** 1 hour
**Dependencies:** None

---

#### Task 2.3: Add Broadcast API Endpoints

**File:** `src/routes/admin/api/broadcast/+server.ts`

**New Endpoints:**

- `GET /api/broadcast/history` - Get broadcast history
- `GET /api/broadcast/analytics` - Get analytics
- `GET /api/broadcast/templates` - Get templates
- `POST /api/broadcast/templates` - Create template
- `PUT /api/broadcast/templates/:id` - Update template
- `DELETE /api/broadcast/templates/:id` - Delete template
- `GET /api/broadcast/recipients` - Get `POST /api recipient list
-/broadcast/cancel/:id` - Cancel scheduled broadcast
- `POST /api/broadcast/resend/:id` - Resend broadcast

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 2.1, 2.2

---

#### Task 2.4: Add Scheduled Broadcast Worker

**File:** `src/lib/server/jobs/scheduled-broadcast.ts`

**Features:**

- Check for scheduled broadcasts
- Send messages at scheduled time
- Retry failed sends
- Notify admin of results

**Implementation:**

```typescript
// Run every minute
export async function processScheduledBroadcasts() {
	const now = new Date();

	// Get broadcasts scheduled for now
	const broadcasts = await getScheduledBroadcasts(now);

	for (const broadcast of broadcasts) {
		try {
			await broadcastToAdmins({
				tenantIds: broadcast.targetTenantIds,
				message: broadcast.message
			});

			await updateBroadcastStatus(broadcast.id, 'sent');
		} catch (error) {
			await updateBroadcastStatus(broadcast.id, 'failed');
		}
	}
}
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 2.1

---

### Phase 3: Refactor Main Page

#### Task 3.1: Refactor +page.svelte

**File:** `src/routes/admin/broadcast/+page.svelte`

**Changes:**

```svelte
<!-- Before: 176 lines -->
<script>
  // Basic form
</script>

<template>
  <!-- Simple form and info cards -->
</template>

<!-- After: ~150 lines with tabs -->
<script>
  import BroadcastForm from '$lib/components/admin/BroadcastForm.svelte';
  import BroadcastHistory from '$lib/components/admin/BroadcastHistory.svelte';
  import BroadcastAnalytics from '$lib/components/admin/BroadcastAnalytics.svelte';
  import MessageTemplateManager from '$lib/components/admin/MessageTemplateManager.svelte';
  import { i18n } from '$lib/i18n';

  let activeTab = $state<'compose' | 'history' | 'analytics' | 'templates'>('compose');
</script>

<div class="container mx-auto py-10 max-w-6xl space-y-6">
  <PageHeader
    title={$i18n.t('admin.broadcast.title')}
    description={$i18n.t('admin.broadcast.subtitle')}
  />

  <!-- Tabs -->
  <Tabs bind:value={activeTab}>
    <Tabs.List>
      <Tabs.Trigger value="compose">Compose</Tabs.Trigger>
      <Tabs.Trigger value="history">History</Tabs.Trigger>
      <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
      <Tabs.Trigger value="templates">Templates</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="compose">
      <BroadcastForm
        tenants={data.tenants}
        templates={data.templates}
        onSend={handleSend}
        onSaveTemplate={handleSaveTemplate}
        onPreview={handlePreview}
      />
    </Tabs.Content>

    <Tabs.Content value="history">
      <BroadcastHistory
        history={data.history}
        onViewDetails={handleViewDetails}
        onResend={handleResend}
      />
    </Tabs.Content>

    <Tabs.Content value="analytics">
      <BroadcastAnalytics
        analytics={data.analytics}
      />
    </Tabs.Content>

    <Tabs.Content value="templates">
      <MessageTemplateManager
        templates={data.templates}
        onSave={handleSaveTemplate}
        onDelete={handleDeleteTemplate}
      />
    </Tabs.Content>
  </Tabs>
</div>
```

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 1.1, 1.2, 1.3, 1.4

---

#### Task 3.2: Update +page.server.ts

**File:** `src/routes/admin/broadcast/+page.server.ts`

**Changes:**

```typescript
export const load: PageServerLoad = async ({ locals }) => {
	// Load tenants
	const tenants = await db.select().from(tenants);

	// Load templates
	const templates = await db.query.messageTemplates.findMany({
		orderBy: [desc(messageTemplates.name)]
	});

	// Load recent history
	const history = await getBroadcastHistory({ limit: 20 });

	// Load analytics
	const analytics = await getBroadcastAnalytics({ from: subDays(new Date(), 30) });

	return {
		tenants,
		templates,
		history,
		analytics
	};
};

export const actions: Actions = {
	send: async ({ request, locals }) => {
		const data = await request.formData();
		const validated = broadcastCreateSchema.parse({
			target: data.get('target'),
			message: data.get('message'),
			scheduledAt: data.get('scheduledAt')
		});

		// Send or schedule broadcast
		const result = await createBroadcast({
			...validated,
			senderId: auth.userId
		});

		return { success: true, broadcastId: result.id };
	},

	saveTemplate: async ({ request, locals }) => {
		const data = await request.formData();
		const validated = broadcastTemplateSchema.parse({
			name: data.get('name'),
			category: data.get('category'),
			message: data.get('message')
		});

		await saveMessageTemplate(validated);
		return { success: true };
	},

	cancel: async ({ request, locals }) => {
		const id = (await request.formData()).get('id');
		await cancelBroadcast(id);
		return { success: true };
	},

	resend: async ({ request, locals }) => {
		const id = (await request.formData()).get('id');
		await resendBroadcast(id);
		return { success: true };
	}
};
```

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 2.1, 2.2, 2.3

---

### Phase 4: Add New Features

#### Task 4.1: Add Template Variables System

**Files:** Multiple

**Features:**

- Pre-defined variables: `{{school_name}}`, `{{admin_name}}`, `{{date}}`, `{{time}}`
- Custom variables support
- Variable autocomplete
- Variable validation

**Implementation:**

```typescript
// Variable patterns
const variablePatterns = [
	{ name: 'school_name', description: 'Tenant school name' },
	{ name: 'admin_name', description: 'Admin user name' },
	{ name: 'date', description: 'Current date' },
	{ name: 'time', description: 'Current time' },
	{ name: 'platform_url', description: 'PPDB platform URL' }
];

// Extract variables from message
export function extractVariables(message: string): string[] {
	const matches = message.match(/\{\{(\w+)\}\}/g);
	return matches?.map((m) => m.slice(2, -2)) || [];
}

// Replace variables
export function replaceVariables(message: string, values: Record<string, string>): string {
	return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
		return values[key] || match;
	});
}
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 1.1

---

#### Task 4.2: Add Message Scheduling

**Files:** Multiple

**Features:**

- Schedule broadcast for future date/time
- View scheduled broadcasts
- Cancel scheduled broadcasts
- Edit scheduled broadcasts
- Scheduling confirmation

**UI:**

```svelte
<div class="space-y-2">
	<Label>Schedule Send</Label>
	<div class="flex gap-4">
		<Button
			variant={!scheduledAt ? 'default' : 'outline'}
			onclick={() => (scheduledAt = undefined)}
		>
			Send Now
		</Button>
		<Button
			variant={scheduledAt ? 'default' : 'outline'}
			onclick={() => (showSchedulePicker = true)}
		>
			Schedule
		</Button>
	</div>

	{#if scheduledAt}
		<p class="text-sm text-muted-foreground">
			Scheduled for: {formatDateTime(scheduledAt)}
			<Button variant="link" size="sm" onclick={() => (scheduledAt = undefined)}>Cancel</Button>
		</p>
	{/if}
</div>
```

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** Task 2.4

---

#### Task 4.3: Add Broadcast Templates Database

**File:** `src/lib/server/db/schema.ts`

**Changes:**

```typescript
export const messageTemplates = pgTable('message_templates', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	category: text('category').notNull(),
	message: text('message').notNull(),
	variables: jsonb('variables').default([]),
	createdBy: text('created_by').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
	usageCount: integer('usage_count').default(0)
});
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 4.4: Add CSV Import for Recipients

**Files:** Multiple

**Features:**

- Upload CSV with phone numbers
- Validate phone numbers
- Preview imported contacts
- Add to recipient list

**UI:**

```svelte
<div class="space-y-4">
	<Label>Import Recipients from CSV</Label>
	<Input type="file" accept=".csv" onchange={handleFileUpload} />

	{#if importedContacts.length > 0}
		<p>{importedContacts.length} contacts imported</p>
		<Table>
			<TableBody>
				{#each importedContacts.slice(0, 10) as contact}
					<TableRow>
						<TableCell>{contact.name}</TableCell>
						<TableCell>{contact.phone}</TableCell>
						<TableCell>
							<Badge variant={contact.valid ? 'success' : 'destructive'}>
								{contact.valid ? 'Valid' : 'Invalid'}
							</Badge>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/if}
</div>
```

**Priority:** Low
**Effort:** 3 hours
**Dependencies:** Task 1.5

---

#### Task 4.5: Add Delivery Status Tracking

**Files:** Multiple

**Features:**

- Track individual message status
- Show failed recipients
- Retry failed messages
- Export failed list

**Database:**

```typescript
export const broadcastDeliveries = pgTable('broadcast_deliveries', {
  id: text('id').primaryKey(),
  broadcastId: text('broadcast_id').references(() => broadcasts.id),
  recipientPhone: text('recipient_phone').notNull(),
  status: enum('status', ['pending', 'sent', 'delivered', 'failed']),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  errorMessage: text('error_message')
});
```

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** Task 2.1

---

#### Task 4.6: Add Message Approval Workflow

**Files:** Multiple

**Features:**

- Draft messages before sending
- Approval queue for super admins
- Approve/reject messages
- Notification for approvals

**Priority:** Low
**Effort:** 5 hours
**Dependencies:** None

---

### Phase 5: UX Improvements

#### Task 5.1: Add Send Progress Indicator

**Files:** `BroadcastForm.svelte`, server actions

**Features:**

- Progress bar during send
- Real-time status updates
- Estimated time remaining
- Pause/cancel option for large sends

**UI:**

```svelte
{#if isSending}
	<Card>
		<CardHeader>
			<CardTitle>Sending Broadcast...</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<Progress value={progress} />
			<p class="text-sm text-muted-foreground">
				{sentCount} of {totalCount} messages sent ({Math.round(progress)}%)
			</p>
			<p class="text-xs text-muted-foreground">
				Estimated time remaining: {estimatedTime}
			</p>
			<Button variant="destructive" onclick={handleCancel}>Cancel Broadcast</Button>
		</CardContent>
	</Card>
{/if}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 1.1

---

#### Task 5.2: Add Confirmation for Large Sends

**Files:** `BroadcastForm.svelte`

**Features:**

- Modal confirmation for large recipient counts
- Show estimated cost/time
- Require confirmation before send

**UI:**

```svelte
{#if showConfirmation}
	<AlertDialog.Root open={showConfirmation}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Confirm Broadcast</AlertDialog.Title>
				<AlertDialog.Description>
					You are about to send a message to {recipientCount} recipients.

					<div class="mt-4 p-4 bg-muted rounded-lg">
						<p><strong>Estimated Time:</strong> {estimatedTime}</p>
						<p><strong>Estimated Cost:</strong> {estimatedCost}</p>
					</div>
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={() => (showConfirmation = false)}>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action onclick={handleConfirmSend}>Send Broadcast</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
```

**Priority:** Low
**Effort:** 1.5 hours
**Dependencies:** Task 1.1

---

#### Task 5.3: Add Toast Notifications

**Files:** Multiple

**Features:**

- Success toast on send
- Error toast on failure
- Progress notifications
- Scheduled broadcast confirmation

**Priority:** Medium
**Effort:** 1 hour
**Dependencies:** None

---

#### Task 5.4: Add Keyboard Shortcuts

**Files:** `BroadcastForm.svelte`

**Features:**

- `Ctrl+Enter` - Send
- `Ctrl+S` - Save as template
- `Ctrl+P` - Preview
- `Esc` - Close modal

**Priority:** Low
**Effort:** 1 hour
**Dependencies:** Task 1.1

---

### Phase 6: Security & Performance

#### Task 6.1: Add Rate Limiting

**Files:** `broadcast.ts`, API endpoints

**Features:**

- Limit broadcasts per day
- Limit recipients per broadcast
- Cooldown period between broadcasts
- Rate limit headers

**Implementation:**

```typescript
const BROADCAST_LIMITS = {
	maxPerDay: 10,
	maxRecipientsPerBroadcast: 1000,
	cooldownMinutes: 30
};

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
	const todayBroadcasts = await countBroadcastsToday(userId);

	if (todayBroadcasts >= BROADCAST_LIMITS.maxPerDay) {
		return { allowed: false, message: 'Daily limit reached' };
	}

	return { allowed: true };
}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 6.2: Add Message Content Validation

**Files:** Server actions, validators

**Features:**

- Block prohibited keywords
- Profanity filter
- Link validation
- Phone number format validation

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 6.3: Add Caching for Analytics

**Files:** API endpoints

**Features:**

- Cache analytics data
- Invalidate cache on new broadcast
- Set appropriate cache headers

**Priority:** Low
**Effort:** 1 hour
**Dependencies:** Task 2.3

---

### Phase 7: Testing & Documentation

#### Task 7.1: Create Unit Tests

**Files:**

- `src/lib/components/admin/BroadcastForm.test.ts`
- `src/lib/components/admin/BroadcastHistory.test.ts`
- `src/lib/server/domain/admin/broadcast.test.ts`

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** All previous tasks

---

#### Task 7.2: Create Integration Tests

**Files:** Tests for API endpoints

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 2.3

---

#### Task 7.3: Create User Guide

**File:** `/docs/admin-broadcast-guide.md`

**Content:**

- How to compose a broadcast
- How to use templates
- How to schedule broadcasts
- How to view analytics
- Best practices
- FAQ

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** All previous tasks

---

## Implementation Order

### Week 1: Core Components

| Order | Task                         | Effort |
| ----- | ---------------------------- | ------ |
| 1     | Task 1.1: BroadcastForm      | 5h     |
| 2     | Task 1.2: BroadcastHistory   | 4h     |
| 3     | Task 1.3: BroadcastAnalytics | 4h     |
| 4     | Task 2.2: Validation Schema  | 1h     |

### Week 2: Server & API

| Order | Task                           | Effort |
| ----- | ------------------------------ | ------ |
| 5     | Task 2.1: Enhance Domain Logic | 6h     |
| 6     | Task 2.3: API Endpoints        | 4h     |
| 7     | Task 2.4: Scheduled Worker     | 3h     |
| 8     | Task 1.4: TemplateManager      | 3h     |

### Week 3: Refactor & Features

| Order | Task                          | Effort |
| ----- | ----------------------------- | ------ |
| 9     | Task 3.1: Refactor Page       | 3h     |
| 10    | Task 3.2: Update Server       | 3h     |
| 11    | Task 4.1: Template Variables  | 3h     |
| 12    | Task 4.2: Message Scheduling  | 4h     |
| 13    | Task 1.5: RecipientPreview    | 2h     |
| 14    | Task 1.6: MessagePreviewModal | 2h     |

### Week 4: Polish & Security

| Order | Task                          | Effort |
| ----- | ----------------------------- | ------ |
| 15    | Task 4.3: Templates DB        | 2h     |
| 16    | Task 4.4: CSV Import          | 3h     |
| 17    | Task 4.5: Delivery Tracking   | 4h     |
| 18    | Task 5.1: Progress Indicator  | 2h     |
| 19    | Task 5.2: Confirmation Modal  | 1.5h   |
| 20    | Task 5.3: Toast Notifications | 1h     |
| 21    | Task 5.4: Keyboard Shortcuts  | 1h     |
| 22    | Task 6.1: Rate Limiting       | 2h     |
| 23    | Task 6.2: Content Validation  | 2h     |
| 24    | Task 6.3: Caching             | 1h     |

### Week 5: Testing & Docs

| Order | Task                        | Effort |
| ----- | --------------------------- | ------ |
| 25    | Task 7.1: Unit Tests        | 4h     |
| 26    | Task 7.2: Integration Tests | 3h     |
| 27    | Task 7.3: User Guide        | 2h     |

---

## Total Effort

| Phase                        | Tasks  | Total Time      |
| ---------------------------- | ------ | --------------- |
| Phase 1: Components          | 6      | 20 hours        |
| Phase 2: Server              | 4      | 14 hours        |
| Phase 3: Refactor & Features | 6      | 19 hours        |
| Phase 4: New Features        | 6      | 21 hours        |
| Phase 5: UX                  | 4      | 5.5 hours       |
| Phase 6: Security            | 3      | 5 hours         |
| Phase 7: Testing & Docs      | 3      | 9 hours         |
| **Total**                    | **32** | **~93.5 hours** |

---

## New Component Structure

```
src/lib/components/admin/
├── BroadcastForm.svelte              # Task 1.1
├── BroadcastHistory.svelte           # Task 1.2
├── BroadcastAnalytics.svelte         # Task 1.3
├── MessageTemplateManager.svelte     # Task 1.4
├── RecipientPreview.svelte           # Task 1.5
└── MessagePreviewModal.svelte        # Task 1.6

src/lib/server/domain/admin/
├── broadcast.ts                      # Enhanced Task 2.1
└── broadcast-templates.ts            # New Task 4.3

src/lib/server/jobs/
└── scheduled-broadcast.ts            # Task 2.4

src/routes/admin/api/broadcast/
└── +server.ts                        # Task 2.3
```

---

## API Reference

### BroadcastFormData

```typescript
interface BroadcastFormData {
	targetType: 'all' | 'active' | 'inactive' | 'custom';
	targetTenantIds?: string[];
	message: string;
	scheduledAt?: Date;
	templateId?: string;
	variables?: Record<string, string>;
}
```

### BroadcastRecord

```typescript
interface BroadcastRecord {
	id: string;
	targetType: string;
	targetTenantIds: string[];
	message: string;
	status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
	sentCount: number;
	failedCount: number;
	scheduledAt?: Date;
	sentAt?: Date;
	createdAt: Date;
	senderId: string;
	templateId?: string;
}
```

### MessageTemplate

```typescript
interface MessageTemplate {
	id: string;
	name: string;
	category: string;
	message: string;
	variables: string[];
	usageCount: number;
	createdAt: Date;
	updatedAt: Date;
	createdBy: string;
}
```

---

## Success Criteria

- [ ] Broadcast page uses tabs for Compose/History/Analytics/Templates
- [ ] BroadcastForm component handles all compose scenarios
- [ ] BroadcastHistory shows all past broadcasts with filtering
- [ ] BroadcastAnalytics displays performance metrics
- [ ] MessageTemplateManager allows CRUD for templates
- [ ] Template variables work correctly
- [ ] Message scheduling works
- [ ] Progress indicator shows during send
- [ ] Confirmation modal for large sends
- [ ] All text uses i18n keys (no hardcoded strings)
- [ ] TypeScript types proper (no `any` where possible)
- [ ] Accessibility: proper aria-labels, focus management
- [ ] Rate limiting prevents abuse
- [ ] Unit tests pass
- [ ] Integration tests pass

---

## Files Changed Summary

### Files Modified:

- `src/routes/admin/broadcast/+page.svelte`
- `src/routes/admin/broadcast/+page.server.ts`
- `src/lib/server/domain/admin/broadcast.ts`
- `src/lib/server/validators/admin.ts`

### Files Created:

- `src/lib/components/admin/BroadcastForm.svelte`
- `src/lib/components/admin/BroadcastHistory.svelte`
- `src/lib/components/admin/BroadcastAnalytics.svelte`
- `src/lib/components/admin/MessageTemplateManager.svelte`
- `src/lib/components/admin/RecipientPreview.svelte`
- `src/lib/components/admin/MessagePreviewModal.svelte`
- `src/lib/server/domain/admin/broadcast-templates.ts`
- `src/lib/server/jobs/scheduled-broadcast.ts`
- `src/routes/admin/api/broadcast/+server.ts`
- `src/lib/server/db/schema.ts` (add message_templates table)

### Files Deleted:

- None

---

## Related Documentation

- [Super Admin Dashboard Tasks](super-admin-dashboard-ui-tasks.md)
- [Admin Schools Improvements Tasks](admin-schools-improvements-tasks.md)
- [Admin Units Refactor Tasks](admin-units-refactor-tasks.md)
- [Super Admin i18n Tasks](super-admin-i18n-tasks.md)
