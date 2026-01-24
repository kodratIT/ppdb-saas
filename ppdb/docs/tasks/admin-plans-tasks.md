# Admin Plans (SaaS Packages) Page Refactoring Tasks

**Goal:** Build a comprehensive SaaS subscription plans management system with full CRUD operations, feature comparison, pricing tiers, limits management, and analytics.

**Status:** Ready for Implementation
**Created:** 2026-01-21
**Original Files:**

- `src/routes/admin/plans/+page.svelte` (87 lines - mock data only)

---

## Current State Analysis

### Current Files in `/src/routes/admin/plans/`:

| File           | Lines | Purpose                            | Status            |
| -------------- | ----- | ---------------------------------- | ----------------- |
| `+page.svelte` | 87    | Display plans cards with mock data | ❌ Mock data only |

### Existing Database Schema:

**Table:** `saas_packages` (`src/lib/server/db/schema.ts`)

```typescript
export const saasPackages = pgTable('saas_packages', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(), // e.g. "Basic", "Pro"
	slug: text('slug').notNull().unique(), // e.g. "basic"
	description: text('description'),
	priceMonthly: integer('price_monthly').notNull(), // IDR
	priceYearly: integer('price_yearly').notNull(), // IDR
	limits: jsonb('limits').notNull().default({}), // e.g. { max_students: 100 }
	features: jsonb('features').notNull().default([]), // e.g. ["whatsapp_blast", "export"]
	isActive: boolean('is_active').default(true),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});
```

**Related Tables:**

- `saasSubscriptions` - Tenant subscriptions
- `saasInvoices` - Subscription invoices
- `saasSubscriptionStatus` enum - trial, active, past_due, cancelled
- `saasBillingCycle` enum - monthly, yearly

### Existing i18n Strings:

**plans section (English):**
| Key | Value |
|-----|-------|
| title | Subscription Packages |
| subtitle | Manage pricing tiers and features. |
| addNewPlan | Add New Plan |
| mostPopular | Most Popular |
| editPlan | Edit Plan |
| features | Features |
| month | /month |
| custom | Custom |

**packages section (English):**
| Key | Value |
|-----|-------|
| title | SaaS Packages |
| subtitle | Manage subscription packages and pricing. |
| addPackage | Add Package |
| editPackage | Edit Package |
| createPackage | Create Package |
| name | Name |
| slug | Slug |
| priceMonthly | Price (Monthly) |
| priceYearly | Price (Yearly) |
| priceMo | Price (Mo) |
| priceYr | Price (Yr) |
| status | Status |
| active | Active |
| inactive | Inactive |
| description | Description |
| limitsJson | Limits (JSON) |
| featuresJson | Features (JSON) |
| saveChanges | Save changes |

### Issues Identified:

| Category           | Issue                                 | Severity |
| ------------------ | ------------------------------------- | -------- |
| **Infrastructure** | No +page.server.ts file               | Critical |
| **Features**       | No CRUD functionality for plans       | Critical |
| **Features**       | No Create/Edit/Delete actions         | Critical |
| **Features**       | No plan comparison view               | High     |
| **Features**       | No feature limits management          | High     |
| **Features**       | No feature toggle management          | High     |
| **Features**       | No pricing tiers editing              | High     |
| **Features**       | No subscription analytics per plan    | Medium   |
| **Features**       | No plan popularity metrics            | Medium   |
| **Features**       | No plan usage statistics              | Medium   |
| **Features**       | No plan hierarchy (recommended plans) | Low      |
| **Features**       | No plan limits wizard                 | Medium   |
| **Features**       | No feature categories                 | Low      |
| **Features**       | No CSV import/export for plans        | Low      |
| **UX**             | No confirmation dialogs               | Medium   |
| **UX**             | No inline editing                     | Low      |
| **UX**             | No plan preview for tenants           | Medium   |
| **Components**     | No reusable PlanCard component        | Medium   |
| **Components**     | No PlanComparisonTable component      | High     |
| **Components**     | No PlanUsageChart component           | Medium   |

---

## Task List

### Phase 1: Infrastructure

#### Task 1.1: Create +page.server.ts

**File:** `src/routes/admin/plans/+page.server.ts`

**Features:**

- Load all plans with limits and features
- Load subscription statistics per plan
- Load plan usage metrics
- Handle CRUD actions

**Load Function:**

```typescript
export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireSuperAdmin(locals);

	// Load all plans
	const plans = await db.query.saasPackages.findMany({
		orderBy: [asc(saasPackages.priceMonthly)]
	});

	// Load subscription stats per plan
	const planStats = await getPlanStatistics();

	// Load usage metrics
	const usageMetrics = await getPlanUsageMetrics();

	// Load feature list for comparison
	const allFeatures = await getAllAvailableFeatures();

	return {
		plans,
		planStats,
		usageMetrics,
		allFeatures
	};
};
```

**Actions:**

```typescript
export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		// Validate and create plan
	},

	update: async ({ request, locals }) => {
		// Update plan
	},

	delete: async ({ request, locals }) => {
		// Delete plan (with protection if subscriptions exist)
	},

	toggleActive: async ({ request, locals }) => {
		// Toggle plan active status
	},

	reorder: async ({ request, locals }) => {
		// Reorder plan priority/recommendation
	},

	duplicate: async ({ request, locals }) => {
		// Duplicate plan
	}
};
```

**Priority:** Critical
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 1.2: Create Plans Domain Logic

**File:** `src/lib/server/domain/admin/plans.ts`

**Features:**

- CRUD operations for plans
- Plan statistics calculations
- Feature management
- Limits validation
- Plan comparison

**Functions:**

```typescript
export interface CreatePlanInput {
	name: string;
	slug: string;
	description?: string;
	priceMonthly: number;
	priceYearly: number;
	limits: PlanLimits;
	features: string[];
	isActive?: boolean;
}

export interface PlanLimits {
	maxStudents?: number;
	maxAdmins?: number;
	maxDocumentsPerStudent?: number;
	storageGb?: number;
	whatsappBlastCredits?: number;
	customDomains?: boolean;
	advancedAnalytics?: boolean;
	prioritySupport?: boolean;
	sla?: string; // e.g. "99.9%"
	apiAccess?: boolean;
	whiteLabel?: boolean;
	// Add more limits as needed
}

export interface PlanStats {
	planId: string;
	totalSubscriptions: number;
	activeSubscriptions: number;
	trialSubscriptions: number;
	pastDueSubscriptions: number;
	totalRevenue: number;
	mrr: number; // Monthly Recurring Revenue
	arr: number; // Annual Recurring Revenue
}

export async function createPlan(input: CreatePlanInput, createdBy: string): Promise<SaasPackage>;

export async function updatePlan(
	id: string,
	input: Partial<CreatePlanInput>,
	updatedBy: string
): Promise<SaasPackage>;

export async function deletePlan(id: string): Promise<void>;

export async function getPlans(filters?: {
	isActive?: boolean;
	minPrice?: number;
	maxPrice?: number;
}): Promise<SaasPackage[]>;

export async function getPlanById(id: string): Promise<SaasPackage | null>;

export async function getPlanBySlug(slug: string): Promise<SaasPackage | null>;

export async function getPlanStatistics(): Promise<PlanStats[]>;

export async function getPlanUsageMetrics(): Promise<{
	totalStudents: number;
	totalAdmins: number;
	storageUsed: number;
	whatsappCreditsUsed: number;
}>;

export async function getAllAvailableFeatures(): Promise<Feature[]>;

export async function validatePlanLimits(
	planId: string,
	usage: PlanUsage
): Promise<{
	isValid: boolean;
	exceededLimits: string[];
}>;

export async function comparePlans(planIds: string[]): Promise<PlanComparison>;

export async function duplicatePlan(id: string, newName: string): Promise<SaasPackage>;
```

**Priority:** Critical
**Effort:** 6 hours
**Dependencies:** None

---

#### Task 1.3: Create Validation Schema

**File:** `src/lib/server/validators/admin.ts`

**Changes:**

```typescript
export const planLimitsSchema = z.object({
	maxStudents: z.number().positive().optional(),
	maxAdmins: z.number().positive().optional(),
	maxDocumentsPerStudent: z.number().positive().optional(),
	storageGb: z.number().positive().optional(),
	whatsappBlastCredits: z.number().int().positive().optional(),
	customDomains: z.boolean().optional(),
	advancedAnalytics: z.boolean().optional(),
	prioritySupport: z.boolean().optional(),
	sla: z.string().optional(),
	apiAccess: z.boolean().optional(),
	whiteLabel: z.boolean().optional()
});

export const planCreateSchema = z.object({
	name: z.string().min(2).max(100),
	slug: z
		.string()
		.min(2)
		.max(50)
		.regex(/^[a-z0-9-]+$/),
	description: z.string().max(500).optional(),
	priceMonthly: z.number().int().positive(),
	priceYearly: z.number().int().positive(),
	limits: planLimitsSchema,
	features: z.array(z.string()),
	isActive: z.boolean().default(true)
});

export const planUpdateSchema = planCreateSchema.partial();

export type PlanCreateInput = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;
export type PlanLimitsInput = z.infer<typeof planLimitsSchema>;
```

**Priority:** High
**Effort:** 1 hour
**Dependencies:** None

---

### Phase 2: Create Reusable Components

#### Task 2.1: Create PlanCard Component

**File:** `src/lib/components/admin/PlanCard.svelte`

**Features:**

- Display plan name, price, description
- Show features list
- Highlight popular plan
- Show subscription count
- Edit/Duplicate/Delete actions
- Toggle active status

**Props:**

```typescript
interface Props {
	plan: Plan;
	stats?: PlanStats;
	isPopular?: boolean;
	comparisonMode?: boolean;
	selected?: boolean;
	onSelect?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	onDuplicate?: (id: string) => void;
	onToggleActive?: (id: string) => void;
}

interface Plan {
	id: string;
	name: string;
	slug: string;
	description?: string;
	priceMonthly: number;
	priceYearly: number;
	limits: PlanLimits;
	features: string[];
	isActive: boolean;
	createdAt: Date;
}
```

**UI Requirements:**

```svelte
<Card.Root
	class={`relative flex flex-col ${plan.isActive ? '' : 'opacity-60'} ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}
>
	{#if isPopular}
		<div
			class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white"
		>
			Most Popular
		</div>
	{/if}

	{#if !plan.isActive}
		<div class="absolute inset-0 bg-muted/50 flex items-center justify-center">
			<Badge variant="secondary">Inactive</Badge>
		</div>
	{/if}

	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title class="text-xl">{plan.name}</Card.Title>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<Button variant="ghost" size="icon">
						<MoreHorizontal class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Item onclick={() => onEdit?.(plan.id)}>
						<Pencil class="h-4 w-4 mr-2" /> Edit
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onDuplicate?.(plan.id)}>
						<Copy class="h-4 w-4 mr-2" /> Duplicate
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onToggleActive?.(plan.id)}>
						{plan.isActive ? 'Deactivate' : 'Activate'}
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="text-destructive" onclick={() => onDelete?.(plan.id)}>
						<Trash2 class="h-4 w-4 mr-2" /> Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<div class="mt-2 flex items-baseline gap-1">
			<span class="text-3xl font-bold">
				{formatCurrency(plan.priceMonthly)}
			</span>
			<span class="text-sm text-muted-foreground">/month</span>
		</div>

		{#if plan.priceYearly > 0}
			<p class="text-xs text-muted-foreground">
				{formatCurrency(plan.priceYearly)}/year (save {calculateSavings(plan)}%)
			</p>
		{/if}
	</Card.Header>

	<Card.Content class="flex-1">
		{#if plan.description}
			<p class="text-sm text-muted-foreground mb-4">{plan.description}</p>
		{/if}

		{#if stats}
			<div class="grid grid-cols-2 gap-2 mb-4 text-xs">
				<div class="bg-muted rounded p-2">
					<p class="text-muted-foreground">Subscriptions</p>
					<p class="font-medium">{stats.totalSubscriptions}</p>
				</div>
				<div class="bg-muted rounded p-2">
					<p class="text-muted-foreground">MRR</p>
					<p class="font-medium">{formatCurrency(stats.mrr)}</p>
				</div>
			</div>
		{/if}

		<ul class="space-y-2">
			{#each plan.features.slice(0, 5) as feature}
				<li class="flex items-center gap-2 text-sm">
					<Check class="h-4 w-4 text-green-500" />
					{feature}
				</li>
			{/each}
			{#if plan.features.length > 5}
				<li class="text-xs text-muted-foreground">
					+{plan.features.length - 5} more features
				</li>
			{/if}
		</ul>
	</Card.Content>

	<Card.Footer>
		<Button
			variant={isPopular ? 'default' : 'outline'}
			class="w-full"
			onclick={() => onEdit?.(plan.id)}
		>
			Edit Plan
		</Button>
	</Card.Footer>
</Card.Root>
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 2.2: Create PlanComparisonTable Component

**File:** `src/lib/components/admin/PlanComparisonTable.svelte`

**Features:**

- Side-by-side plan comparison
- Feature matrix with checkmarks/crosses
- Highlight differences
- Filter by feature
- Export comparison as PDF

**Props:**

```typescript
interface Props {
	plans: Plan[];
	features: Feature[];
	selectedPlanIds?: string[];
	onSelectPlan?: (id: string) => void;
	onExport?: (format: 'pdf' | 'csv') => void;
}

interface Feature {
	key: string;
	name: string;
	category: string;
	description?: string;
}
```

**UI Requirements:**

```svelte
<div class="space-y-4">
	<!-- Feature Filter -->
	<div class="flex gap-2 flex-wrap">
		<Button variant="outline" size="sm" onclick={() => (showAllFeatures = true)}>
			All Features
		</Button>
		{#each featureCategories as category}
			<Button
				variant={selectedCategory === category ? 'default' : 'outline'}
				size="sm"
				onclick={() => (selectedCategory = category)}
			>
				{category}
			</Button>
		{/each}
	</div>

	<!-- Comparison Table -->
	<div class="overflow-x-auto">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="w-48">Feature</TableHead>
					{#each plans as plan}
						<TableHead class="text-center min-w-[200px]">
							<div class="flex flex-col items-center">
								<span class="text-lg font-bold">{plan.name}</span>
								<span class="text-sm text-muted-foreground">
									{formatCurrency(plan.priceMonthly)}/mo
								</span>
							</div>
						</TableHead>
					{/each}
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filteredFeatures as feature}
					<TableRow>
						<TableCell>
							<div class="flex flex-col">
								<span class="font-medium">{feature.name}</span>
								{#if feature.description}
									<span class="text-xs text-muted-foreground">{feature.description}</span>
								{/if}
							</div>
						</TableCell>
						{#each plans as plan}
							<TableCell class="text-center">
								{#if hasFeature(plan, feature.key)}
									<Check class="h-5 w-5 text-green-500 mx-auto" />
								{:else}
									<X class="h-5 w-5 text-muted-foreground mx-auto" />
								{/if}
							</TableCell>
						{/each}
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>

	<!-- Export Actions -->
	<div class="flex justify-end gap-2">
		<Button variant="outline" onclick={() => onExport?.('csv')}>
			<Download class="h-4 w-4 mr-2" />
			Export CSV
		</Button>
		<Button variant="outline" onclick={() => onExport?.('pdf')}>
			<FileText class="h-4 w-4 mr-2" />
			Export PDF
		</Button>
	</div>
</div>
```

**Priority:** High
**Effort:** 5 hours
**Dependencies:** Task 2.1

---

#### Task 2.3: Create PlanForm Component

**File:** `src/lib/components/admin/PlanForm.svelte`

**Features:**

- Create/Edit plan form
- Pricing input (monthly/yearly)
- Limits configuration (sliders, toggles)
- Features selection
- Feature limits input
- Save as draft or publish

**Props:**

```typescript
interface Props {
	plan?: Plan; // For edit mode
	allFeatures?: string[];
	onSave?: (data: PlanFormData) => void;
	onCancel?: () => void;
	onPreview?: (data: PlanFormData) => void;
}

interface PlanFormData {
	id?: string;
	name: string;
	slug: string;
	description: string;
	priceMonthly: number;
	priceYearly: number;
	limits: PlanLimits;
	features: string[];
	isActive: boolean;
}
```

**UI Requirements:**

```svelte
<form class="space-y-8">
	<!-- Basic Info -->
	<div class="grid md:grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label>Plan Name *</Label>
			<Input bind:value={formData.name} placeholder="e.g., Pro" />
		</div>
		<div class="space-y-2">
			<Label>Slug *</Label>
			<Input bind:value={formData.slug} placeholder="e.g., pro" />
		</div>
	</div>

	<div class="space-y-2">
		<Label>Description</Label>
		<Textarea
			bind:value={formData.description}
			placeholder="Brief description of the plan..."
			rows={3}
		/>
	</div>

	<!-- Pricing -->
	<div class="space-y-4">
		<h3 class="text-lg font-semibold">Pricing</h3>
		<div class="grid md:grid-cols-2 gap-4">
			<div class="space-y-2">
				<Label>Monthly Price (IDR) *</Label>
				<Input type="number" bind:value={formData.priceMonthly} />
			</div>
			<div class="space-y-2">
				<Label>Yearly Price (IDR) *</Label>
				<Input type="number" bind:value={formData.priceYearly} />
			</div>
		</div>
		{#if formData.priceMonthly > 0 && formData.priceYearly > 0}
			<p class="text-sm text-muted-foreground">
				Yearly savings: {calculateSavingsPercentage()}%
			</p>
		{/if}
	</div>

	<!-- Limits -->
	<div class="space-y-4">
		<h3 class="text-lg font-semibold">Limits & Quotas</h3>
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div class="space-y-2">
				<Label>Max Students</Label>
				<Input type="number" bind:value={formData.limits.maxStudents} />
				<p class="text-xs text-muted-foreground">Leave empty for unlimited</p>
			</div>
			<div class="space-y-2">
				<Label>Max Admins</Label>
				<Input type="number" bind:value={formData.limits.maxAdmins} />
			</div>
			<div class="space-y-2">
				<Label>Storage (GB)</Label>
				<Input type="number" bind:value={formData.limits.storageGb} />
			</div>
			<div class="space-y-2">
				<Label>WhatsApp Credits</Label>
				<Input type="number" bind:value={formData.limits.whatsappBlastCredits} />
			</div>
			<div class="space-y-2">
				<Label>Docs per Student</Label>
				<Input type="number" bind:value={formData.limits.maxDocumentsPerStudent} />
			</div>
			<div class="space-y-2">
				<Label>SLA</Label>
				<Input bind:value={formData.limits.sla} placeholder="e.g., 99.9%" />
			</div>
		</div>

		<!-- Boolean Toggles -->
		<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="flex items-center gap-2">
				<Switch bind:checked={formData.limits.customDomains} />
				<Label>Custom Domains</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={formData.limits.advancedAnalytics} />
				<Label>Advanced Analytics</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={formData.limits.prioritySupport} />
				<Label>Priority Support</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={formData.limits.apiAccess} />
				<Label>API Access</Label>
			</div>
			<div class="flex items-center gap-2">
				<Switch bind:checked={formData.limits.whiteLabel} />
				<Label>White Label</Label>
			</div>
		</div>
	</div>

	<!-- Features -->
	<div class="space-y-4">
		<h3 class="text-lg font-semibold">Features</h3>
		<div class="flex flex-wrap gap-2">
			{#each allFeatures as feature}
				<Badge
					variant={formData.features.includes(feature) ? 'default' : 'outline'}
					class="cursor-pointer"
					onclick={() => toggleFeature(feature)}
				>
					{feature}
				</Badge>
			{/each}
		</div>
		<div class="flex gap-2">
			<Input bind:value={newFeature} placeholder="Add custom feature..." />
			<Button variant="outline" onclick={addCustomFeature}>Add</Button>
		</div>
	</div>

	<!-- Actions -->
	<div class="flex justify-end gap-4 pt-4 border-t">
		<Button variant="outline" onclick={handlePreview}>Preview</Button>
		<Button variant="outline" onclick={handleSaveDraft}>Save as Draft</Button>
		<Button onclick={handleSave}>
			{plan ? 'Update Plan' : 'Create Plan'}
		</Button>
	</div>
</form>
```

**Priority:** High
**Effort:** 6 hours
**Dependencies:** None

---

#### Task 2.4: Create PlanAnalytics Component

**File:** `src/lib/components/admin/PlanAnalytics.svelte`

**Features:**

- MRR/ARR by plan
- Subscription distribution chart
- Plan popularity ranking
- Revenue trend
- Churn analysis per plan

**Props:**

```typescript
interface Props {
	analytics?: {
		totalMrr: number;
		totalArr: number;
		totalSubscriptions: number;
		planStats: PlanStats[];
		revenueByMonth: { month: string; plan: string; revenue: number }[];
		subscriptionTrend: { date: string; count: number }[];
	};
	onExport?: (format: 'csv' | 'pdf') => void;
}
```

**UI Requirements:**

```svelte
<div class="space-y-6">
	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Total MRR</CardTitle>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(analytics.totalMrr)}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Total ARR</CardTitle>
				<Banknote class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(analytics.totalArr)}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Total Subscriptions</CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{analytics.totalSubscriptions}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between">
				<CardTitle class="text-sm font-medium">Avg. Revenue/Plan</CardTitle>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">
					{formatCurrency(analytics.totalMrr / analytics.planStats.length)}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Charts -->
	<div class="grid gap-4 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Revenue by Plan</CardTitle>
			</CardHeader>
			<CardContent>
				<BarChart data={analytics.planStats} xKey="planName" yKey="mrr" />
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Subscription Distribution</CardTitle>
			</CardHeader>
			<CardContent>
				<PieChart data={analytics.planStats} labelKey="planName" valueKey="totalSubscriptions" />
			</CardContent>
		</Card>
	</div>

	<!-- Plan Rankings -->
	<Card>
		<CardHeader>
			<CardTitle>Plan Performance Rankings</CardTitle>
		</CardHeader>
		<CardContent>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Plan</TableHead>
						<TableHead>Subscriptions</TableHead>
						<TableHead>MRR</TableHead>
						<TableHead>ARR</TableHead>
						<TableHead>Churn Rate</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each rankedPlans as plan, i}
						<TableRow>
							<TableCell class="font-medium">
								<Badge variant={i === 0 ? 'default' : 'outline'}>#{i + 1}</Badge>
								{plan.name}
							</TableCell>
							<TableCell>{plan.totalSubscriptions}</TableCell>
							<TableCell>{formatCurrency(plan.mrr)}</TableCell>
							<TableCell>{formatCurrency(plan.arr)}</TableCell>
							<TableCell class={plan.churnRate > 5 ? 'text-red-500' : 'text-green-500'}>
								{plan.churnRate}%
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</CardContent>
	</Card>
</div>
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 2.5: Create PlanLimitsManager Component

**File:** `src/lib/components/admin/PlanLimitsManager.svelte`

**Features:**

- Visual limits configuration
- Sliders for numeric limits
- Toggles for boolean limits
- Preset templates
- Bulk apply limits

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 2.3

---

#### Task 2.6: Create FeatureManager Component

**File:** `src/lib/components/admin/FeatureManager.svelte`

**Features:**

- CRUD for available features
- Feature categories
- Feature descriptions
- Import/export features
- Feature usage tracking

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** None

---

### Phase 3: Create API Endpoints

#### Task 3.1: Create Plans API

**File:** `src/routes/admin/api/plans/+server.ts`

**Endpoints:**

```typescript
// GET /api/plans - List all plans
// GET /api/plans/:id - Get single plan
// GET /api/plans/:id/stats - Get plan statistics
// POST /api/plans - Create plan
// PUT /api/plans/:id - Update plan
// DELETE /api/plans/:id - Delete plan
// POST /api/plans/:id/toggle - Toggle active status
// POST /api/plans/:id/duplicate - Duplicate plan
```

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 1.2

---

#### Task 3.2: Create Plans Analytics API

**File:** `src/routes/admin/api/plans/analytics/+server.ts`

**Endpoints:**

```typescript
// GET /api/plans/analytics - Get all analytics
// GET /api/plans/analytics/summary - Get summary stats
// GET /api/plans/analytics/mrr - Get MRR breakdown
// GET /api/plans/analytics/trends - Get trends data
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.4

---

#### Task 3.3: Create Features API

**File:** `src/routes/admin/api/plans/features/+server.ts`

**Endpoints:**

```typescript
// GET /api/plans/features - List all features
// POST /api/plans/features - Create feature
// PUT /api/plans/features/:id - Update feature
// DELETE /api/plans/features/:id - Delete feature
// POST /api/plans/features/import - Import features
// GET /api/plans/features/export - Export features
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.6

---

### Phase 4: Refactor Main Page

#### Task 4.1: Refactor +page.svelte

**File:** `src/routes/admin/plans/+page.svelte`

**Changes:**

```svelte
<script lang="ts">
	import PlanCard from '$lib/components/admin/PlanCard.svelte';
	import PlanForm from '$lib/components/admin/PlanForm.svelte';
	import PlanComparisonTable from '$lib/components/admin/PlanComparisonTable.svelte';
	import PlanAnalytics from '$lib/components/admin/PlanAnalytics.svelte';
	import FeatureManager from '$lib/components/admin/FeatureManager.svelte';
	import PlanLimitsManager from '$lib/components/admin/PlanLimitsManager.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { i18n } from '$lib/i18n';

	let activeTab = $state<'plans' | 'comparison' | 'analytics' | 'features' | 'limits'>('plans');
	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let selectedPlan = $state<Plan | null>(null);
	let viewMode = $state<'cards' | 'table'>('cards');
</script>

<div class="container mx-auto py-10 max-w-6xl space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">
				{i18n.t('admin.plans.title')}
			</h1>
			<p class="text-muted-foreground mt-1">
				{i18n.t('admin.plans.subtitle')}
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => (showCreateDialog = true)}>
				<Plus class="h-4 w-4 mr-2" />
				{i18n.t('admin.plans.addNewPlan')}
			</Button>
		</div>
	</div>

	<!-- Tabs -->
	<Tabs bind:value={activeTab}>
		<Tabs.List>
			<Tabs.Trigger value="plans">Plans</Tabs.Trigger>
			<Tabs.Trigger value="comparison">Comparison</Tabs.Trigger>
			<Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
			<Tabs.Trigger value="features">Features</Tabs.Trigger>
			<Tabs.Trigger value="limits">Limits</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="plans">
			<div class="flex justify-end mb-4">
				<div class="flex gap-1 border rounded-lg p-1">
					<Button
						variant={viewMode === 'cards' ? 'default' : 'ghost'}
						size="icon"
						onclick={() => (viewMode = 'cards')}
					>
						<LayoutGrid class="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === 'table' ? 'default' : 'ghost'}
						size="icon"
						onclick={() => (viewMode = 'table')}
					>
						<List class="h-4 w-4" />
					</Button>
				</div>
			</div>

			{#if viewMode === 'cards'}
				<div class="grid gap-6 md:grid-cols-3">
					{#each data.plans as plan}
						<PlanCard
							{plan}
							stats={data.planStats.find((s) => s.planId === plan.id)}
							isPopular={plan.name === 'Pro'}
							onEdit={(id) => {
								selectedPlan = data.plans.find((p) => p.id === id) || null;
								showEditDialog = true;
							}}
							onDelete={handleDelete}
							onDuplicate={handleDuplicate}
							onToggleActive={handleToggleActive}
						/>
					{/each}

					<!-- Add Plan Card -->
					<Card.Root
						class="flex flex-col items-center justify-center border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
						onclick={() => (showCreateDialog = true)}
					>
						<Card.Content class="flex flex-col items-center justify-center py-8">
							<Plus class="h-8 w-8 text-muted-foreground mb-2" />
							<p class="text-sm text-muted-foreground">Add New Plan</p>
						</Card.Content>
					</Card.Root>
				</div>
			{:else}
				<!-- Table view -->
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Plan</TableHead>
							<TableHead>Price (Monthly)</TableHead>
							<TableHead>Price (Yearly)</TableHead>
							<TableHead>Features</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Subscriptions</TableHead>
							<TableHead>MRR</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.plans as plan}
							<TableRow>
								<TableCell class="font-medium">{plan.name}</TableCell>
								<TableCell>{formatCurrency(plan.priceMonthly)}</TableCell>
								<TableCell>{formatCurrency(plan.priceYearly)}</TableCell>
								<TableCell>{plan.features.length}</TableCell>
								<TableCell>
									<Badge variant={plan.isActive ? 'success' : 'secondary'}>
										{plan.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</TableCell>
								<TableCell>{getPlanStat(plan.id, 'totalSubscriptions')}</TableCell>
								<TableCell>{formatCurrency(getPlanStat(plan.id, 'mrr'))}</TableCell>
								<TableCell>
									<Button variant="ghost" size="sm" onclick={() => handleEdit(plan)}>Edit</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="comparison">
			<PlanComparisonTable
				plans={data.plans}
				features={data.allFeatures}
				onExport={handleExportComparison}
			/>
		</Tabs.Content>

		<Tabs.Content value="analytics">
			<PlanAnalytics analytics={data.analytics} onExport={handleExportAnalytics} />
		</Tabs.Content>

		<Tabs.Content value="features">
			<FeatureManager
				features={data.allFeatures}
				onSave={handleSaveFeature}
				onDelete={handleDeleteFeature}
			/>
		</Tabs.Content>

		<Tabs.Content value="limits">
			<PlanLimitsManager plans={data.plans} onSave={handleSaveLimits} />
		</Tabs.Content>
	</Tabs>
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={showCreateDialog}>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{i18n.t('admin.plans.addNewPlan')}</Dialog.Title>
		</Dialog.Header>
		<PlanForm
			allFeatures={data.allFeatures}
			onSave={handleCreate}
			onCancel={() => (showCreateDialog = false)}
			onPreview={handlePreview}
		/>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content class="max-w-3xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>{i18n.t('admin.plans.editPlan')}</Dialog.Title>
		</Dialog.Header>
		<PlanForm
			plan={selectedPlan}
			allFeatures={data.allFeatures}
			onSave={handleUpdate}
			onCancel={() => {
				showEditDialog = false;
				selectedPlan = null;
			}}
		/>
	</Dialog.Content>
</Dialog.Root>
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

---

### Phase 5: Add New Features

#### Task 5.1: Add Plan Presets/Wizard

**Files:** Multiple

**Features:**

- Pre-configured plan templates (Startup, Business, Enterprise)
- One-click apply template
- Customize template

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** Task 2.3

---

#### Task 5.2: Add Plan Hierarchy

**Files:** Database schema, domain logic

**Features:**

- Recommended plan ordering
- Upgrade paths
- Highlighted differences when upgrading

**Database:**

```typescript
// Add to saas_packages table
sortOrder: integer('sort_order').default(0),
recommendedFor: text('recommended_for').array().default([]), // e.g. ["startup", "growing"]
```

**Priority:** Low
**Effort:** 3 hours
**Dependencies:** Task 1.2

---

#### Task 5.3: Add Plan Preview

**Files:** Multiple

**Features:**

- Show how plans appear to tenants
- Public-facing plan card preview
- Feature comparison preview

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** Task 2.1

---

#### Task 5.4: Add Feature Usage Tracking

**Files:** Database, domain logic

**Features:**

- Track feature usage per tenant
- Alert when approaching limits
- Feature utilization metrics

**Database:**

```typescript
export const featureUsage = pgTable('feature_usage', {
	id: uuid('id').defaultRandom().primaryKey(),
	tenantId: uuid('tenant_id')
		.references(() => tenants.id)
		.notNull(),
	planId: uuid('plan_id')
		.references(() => saasPackages.id)
		.notNull(),
	feature: text('feature').notNull(),
	usedAt: timestamp('used_at').defaultNow(),
	metadata: jsonb('metadata').default({})
});
```

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 5.5: Add Plan Migration Tools

**Files:** Domain logic, API

**Features:**

- Bulk migrate tenants between plans
- Prorated pricing calculation
- Migration history

**Priority:** Low
**Effort:** 3 hours
**Dependencies:** Task 1.2

---

#### Task 5.6: Add CSV Import/Export

**Files:** API, components

**Features:**

- Export plans to CSV
- Import plans from CSV
- Validation on import

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** Task 3.1

---

### Phase 6: UX Improvements

#### Task 6.1: Add Confirmation Dialogs

**Files:** All plan components

**Features:**

- Delete confirmation (with subscription count warning)
- Deactivate confirmation (with active subscriptions warning)
- Unsaved changes dialog

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 2.1, 2.3

---

#### Task 6.2: Add Toast Notifications

**Files:** All plan components

**Features:**

- Success toasts for all actions
- Error toasts with details
- Warning toasts for deactivation

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 6.3: Add Loading States

**Files:** All plan components

**Features:**

- Skeleton loaders
- Spinners for actions
- Disabled states during loading

**Priority:** Low
**Effort:** 1.5 hours
**Dependencies:** None

---

#### Task 6.4: Add Empty States

**Files:** Plan list, comparison, analytics

**Features:**

- Empty state for no plans
- Empty state for no analytics
- Call-to-action in empty states

**Priority:** Low
**Effort:** 1 hour
**Dependencies:** Task 2.1, 2.4

---

### Phase 7: Testing & Documentation

#### Task 7.1: Create Unit Tests

**Files:**

- `src/lib/server/domain/admin/plans.test.ts`
- `src/lib/components/admin/PlanCard.test.ts`
- `src/lib/components/admin/PlanForm.test.ts`

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

**File:** `/docs/admin-plans-guide.md`

**Content:**

- How to create a plan
- How to configure limits
- How to use comparison view
- Understanding analytics
- Best practices
- FAQ

**Priority:** Low
**Effort:** 2 hours
**Dependencies:** All previous tasks

---

## Implementation Order

### Week 1: Infrastructure & Core Components

| Order | Task                        | Effort |
| ----- | --------------------------- | ------ |
| 1     | Task 1.1: +page.server.ts   | 4h     |
| 2     | Task 1.2: Domain Logic      | 6h     |
| 3     | Task 1.3: Validation Schema | 1h     |
| 4     | Task 2.1: PlanCard          | 4h     |
| 5     | Task 2.3: PlanForm          | 6h     |

### Week 2: More Components & API

| Order | Task                          | Effort |
| ----- | ----------------------------- | ------ |
| 6     | Task 2.2: PlanComparisonTable | 5h     |
| 7     | Task 2.4: PlanAnalytics       | 4h     |
| 8     | Task 2.5: PlanLimitsManager   | 3h     |
| 9     | Task 2.6: FeatureManager      | 3h     |
| 10    | Task 3.1: Plans API           | 3h     |

### Week 3: Refactor & Features

| Order | Task                            | Effort |
| ----- | ------------------------------- | ------ |
| 11    | Task 3.2: Analytics API         | 2h     |
| 12    | Task 3.3: Features API          | 2h     |
| 13    | Task 4.1: Refactor +page.svelte | 4h     |
| 14    | Task 5.1: Plan Presets          | 2h     |
| 15    | Task 5.2: Plan Hierarchy        | 3h     |
| 16    | Task 5.3: Plan Preview          | 3h     |

### Week 4: Advanced Features & Polish

| Order | Task                             | Effort |
| ----- | -------------------------------- | ------ |
| 17    | Task 5.4: Feature Usage Tracking | 4h     |
| 18    | Task 5.5: Plan Migration Tools   | 3h     |
| 19    | Task 5.6: CSV Import/Export      | 2h     |
| 20    | Task 6.1: Confirmation Dialogs   | 2h     |
| 21    | Task 6.2: Toast Notifications    | 1.5h   |
| 22    | Task 6.3: Loading States         | 1.5h   |
| 23    | Task 6.4: Empty States           | 1h     |

### Week 5: Testing & Docs

| Order | Task                        | Effort |
| ----- | --------------------------- | ------ |
| 24    | Task 7.1: Unit Tests        | 4h     |
| 25    | Task 7.2: Integration Tests | 3h     |
| 26    | Task 7.3: User Guide        | 2h     |

---

## Total Effort

| Phase                   | Tasks  | Total Time    |
| ----------------------- | ------ | ------------- |
| Phase 1: Infrastructure | 3      | 11 hours      |
| Phase 2: Components     | 6      | 25 hours      |
| Phase 3: API            | 3      | 7 hours       |
| Phase 4: Refactor       | 1      | 4 hours       |
| Phase 5: New Features   | 6      | 17 hours      |
| Phase 6: UX             | 4      | 6 hours       |
| Phase 7: Testing & Docs | 3      | 9 hours       |
| **Total**               | **26** | **~79 hours** |

---

## New Component Structure

```
src/lib/components/admin/
├── PlanCard.svelte                    # Task 2.1
├── PlanForm.svelte                    # Task 2.3
├── PlanComparisonTable.svelte         # Task 2.2
├── PlanAnalytics.svelte               # Task 2.4
├── PlanLimitsManager.svelte           # Task 2.5
└── FeatureManager.svelte              # Task 2.6

src/lib/server/domain/admin/
├── plans.ts                           # Task 1.2
└── plan-templates.ts                  # Task 5.1

src/routes/admin/api/plans/
├── +server.ts                         # Task 3.1
├── analytics/+server.ts               # Task 3.2
└── features/+server.ts                # Task 3.3
```

---

## API Reference

### Plan Interface

```typescript
interface Plan {
	id: string;
	name: string;
	slug: string;
	description?: string;
	priceMonthly: number;
	priceYearly: number;
	limits: PlanLimits;
	features: string[];
	isActive: boolean;
	sortOrder: number;
	recommendedFor: string[];
	createdAt: Date;
	updatedAt: Date;
}

interface PlanLimits {
	maxStudents?: number;
	maxAdmins?: number;
	maxDocumentsPerStudent?: number;
	storageGb?: number;
	whatsappBlastCredits?: number;
	customDomains?: boolean;
	advancedAnalytics?: boolean;
	prioritySupport?: boolean;
	sla?: string;
	apiAccess?: boolean;
	whiteLabel?: boolean;
}

interface PlanStats {
	planId: string;
	planName: string;
	totalSubscriptions: number;
	activeSubscriptions: number;
	trialSubscriptions: number;
	pastDueSubscriptions: number;
	mrr: number;
	arr: number;
	churnRate: number;
}
```

---

## Success Criteria

- [ ] Plans page has full CRUD functionality
- [ ] Plan cards display all relevant information
- [ ] Plan comparison table works correctly
- [ ] Plan analytics show correct MRR/ARR
- [ ] Feature management is functional
- [ ] Limits configuration works
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

- `src/lib/server/db/schema.ts` (add columns)
- `src/lib/server/validators/admin.ts`
- `src/routes/admin/plans/+page.svelte`

### Files Created:

- `src/lib/server/domain/admin/plans.ts`
- `src/routes/admin/plans/+page.server.ts`
- `src/routes/admin/api/plans/+server.ts`
- `src/routes/admin/api/plans/analytics/+server.ts`
- `src/routes/admin/api/plans/features/+server.ts`
- `src/lib/components/admin/PlanCard.svelte`
- `src/lib/components/admin/PlanForm.svelte`
- `src/lib/components/admin/PlanComparisonTable.svelte`
- `src/lib/components/admin/PlanAnalytics.svelte`
- `src/lib/components/admin/PlanLimitsManager.svelte`
- `src/lib/components/admin/FeatureManager.svelte`

### Files Deleted:

- None

---

## Related Documentation

- [Super Admin Dashboard Tasks](super-admin-dashboard-ui-tasks.md)
- [Admin Broadcast Tasks](admin-broadcast-tasks.md)
- [Admin Announcements Tasks](admin-announcements-tasks.md)
- [Admin Schools Improvements Tasks](admin-schools-improvements-tasks.md)
- [Super Admin i18n Tasks](super-admin-i18n-tasks.md)
