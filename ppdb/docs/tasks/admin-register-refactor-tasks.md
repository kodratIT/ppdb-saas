# Admin Register Page Refactoring Tasks

**Goal:** Refactor admin register page into reusable shadcn components with improved UX/design.

**Status:** ✅ COMPLETED
**Created:** 2026-01-21
**Completed:** 2026-01-21

---

## Current State Analysis

### File Structure:

```
src/routes/admin/register/
├── +page.svelte              (206 lines) - Main page controller
├── +page.server.ts           (149 lines) - Server actions
├── schema.ts                 (70 lines)  - Zod schemas
└── steps/
    ├── StepIdentity.svelte   (249 lines) - School identity form
    ├── StepLocation.svelte   (350 lines) - Location cascade selects
    ├── StepAdmin.svelte      (124 lines) - Admin account form
    └── StepReview.svelte     (166 lines) - Review summary
```

### Current Components Used:

- `Stepper` - Custom component
- `Button`, `Input`, `Label`, `Select` - shadcn/ui
- `RadioGroup`, `RadioGroupItem` - shadcn/ui
- `Alert`, `Card`, `Badge` - shadcn/ui
- `Textarea` - shadcn/ui
- `Confetti` - Custom component

### Issues Identified:

| Category       | Issue                                         | Severity |
| -------------- | --------------------------------------------- | -------- |
| **Components** | Each step has inline handlers (handleXChange) | Medium   |
| **Components** | Location cascade logic in step component      | High     |
| **Components** | No reusable FormField component               | High     |
| **UX**         | No password strength indicator                | Medium   |
| **UX**         | No inline validation feedback                 | Medium   |
| **UX**         | No save draft functionality                   | Medium   |
| **UX**         | No progress bar for form completion           | Low      |
| **UX**         | StepReview uses inline alert styles           | Low      |
| **Features**   | No duplicate school detection                 | Medium   |
| **Features**   | No slug availability check                    | Medium   |
| **Features**   | No NPSN validation API                        | Medium   |

---

## Task List

### Phase 1: Create Reusable Form Components

#### Task 1.1: Create FormField Component

**File:** `src/lib/components/ui/form/form-field.svelte`

**Description:** Create a reusable form field component with label, input, error, and help text.

**Features:**

- Label with optional required indicator
- Error message display
- Help text
- Input slot for any input type
- Consistent styling

**Props:**

```typescript
interface Props {
	label: string;
	required?: boolean;
	error?: string;
	helpText?: string;
	id?: string;
	class?: string;
}
```

**Usage Example:**

```svelte
<FormField label="School Name" required error={errors.name} helpText="Enter full school name">
	<Input bind:value={formData.name} />
</FormField>
```

**Priority:** High
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 1.2: Create PasswordInput Component

**File:** `src/lib/components/ui/form/password-input.svelte`

**Description:** Create password input with visibility toggle and strength indicator.

**Features:**

- Show/hide password toggle
- Password strength meter (visual)
- Strength requirements checklist
- Error display

**Props:**

```typescript
interface Props {
	value: string;
	error?: string;
	onChange?: (value: string) => void;
	showStrength?: boolean;
}
```

**UI Design:**

```
[Password Input] [Eye Icon]

Strength: ████████░░ Strong
- At least 6 characters
- Contains number
- Contains uppercase
```

**Priority:** High
**Effort:** 2.5 hours
**Dependencies:** Task 1.1

---

#### Task 1.3: Create SlugInput Component

**File:** `src/lib/components/ui/form/slug-input.svelte`

**Description:** Create slug input with auto-generate from name and availability check.

**Features:**

- Auto-generate from name prop
- Manual edit option
- Availability check (API)
- Visual feedback (loading, available, taken)
- Prefix display (your-school.ppdb.id)

**Props:**

```typescript
interface Props {
	value: string;
	sourceValue: string; // For auto-generate
	type: 'school' | 'foundation';
	onChange?: (value: string) => void;
	onCheck?: (value: string) => Promise<boolean>;
}
```

**UI Design:**

```
[ Auto-generate toggle ]

[ slug-input ] [.ppdb.id]
      |
      └── Checking availability...
          ✓ Available

Error: This slug is already taken
```

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 1.1

---

#### Task 1.4: Create SelectField Component

**File:** `src/lib/components/ui/form/select-field.svelte`

**Description:** Wrapper for Select with consistent FormField styling.

**Features:**

- Label with required indicator
- Error display
- Loading state
- Placeholder customization
- Clear button option

**Props:**

```typescript
interface Props {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	placeholder?: string;
	required?: boolean;
	error?: string;
	loading?: boolean;
	onChange?: (value: string) => void;
}
```

**Priority:** High
**Effort:** 1.5 hours
**Dependencies:** Task 1.1

---

#### Task 1.5: Create RadioCardGroup Component

**File:** `src/lib/components/ui/form/radio-card-group.svelte`

**Description:** Radio group with card-style selection for options like institution type.

**Features:**

- Card-style radio buttons
- Icon support per option
- Selected state styling
- Hover effects
- Description support per option

**Props:**

```typescript
interface Props {
	value: string;
	options: {
		value: string;
		label: string;
		description?: string;
		icon?: Component;
	}[];
	onChange?: (value: string) => void;
}
```

**UI Design:**

```
┌─────────────────────┐  ┌─────────────────────┐
│  ○ Sekolah Satuan   │  │  ○ Yayasan          │
│  Single school      │  │  Foundation        │
└─────────────────────┘  └─────────────────────┘
```

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 1.1

---

### Phase 2: Create Location Components

#### Task 2.1: Create LocationCascade Component

**File:** `src/lib/components/ui/form/location-cascade.svelte`

**Description:** Extract location cascading selects into reusable component.

**Features:**

- Province → City → District → Village cascade
- Loading states per level
- Error display per field
- Back-fill from saved data
- Clear dependent on parent change

**Props:**

```typescript
interface Props {
	value: {
		province: string;
		city: string;
		district: string;
		village: string;
		address: string;
		postalCode: string;
	};
	errors?: Record<string, string[]>;
	onChange?: (value: LocationFormData) => void;
}

interface LocationFormData {
	province: string;
	provinceId: string;
	city: string;
	cityId: string;
	district: string;
	districtId: string;
	village: string;
	villageId: string;
	address: string;
	postalCode: string;
}
```

**Priority:** High
**Effort:** 4 hours
**Dependencies:** Task 1.4

---

#### Task 2.2: Create AddressField Component

**File:** `src/lib/components/ui/form/address-field.svelte`

**Description:** Combined address and postal code field.

**Features:**

- Address textarea
- Postal code input
- Inline layout option
- Validation

**Props:**

```typescript
interface Props {
	address: string;
	postalCode: string;
	errorAddress?: string;
	errorPostalCode?: string;
	onChange?: (data: { address: string; postalCode: string }) => void;
}
```

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** Task 1.1

---

### Phase 3: Create Admin Account Components

#### Task 3.1: Create AdminAccountForm Component

**File:** `src/lib/components/ui/form/admin-account-form.svelte`

**Description:** Extract admin account form into reusable component.

**Features:**

- Name input
- Email with validation
- Password with strength
- WhatsApp with format hint
- Consistent error handling

**Props:**

```typescript
interface Props {
	data: {
		adminName: string;
		email: string;
		password: string;
		whatsapp: string;
	};
	errors?: Record<string, string[]>;
	onChange?: (data: AdminFormData) => void;
}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 1.1, 1.2

---

#### Task 3.2: Create EmailInput Component

**File:** `src/lib/components/ui/form/email-input.svelte`

**Description:** Email input with validation and availability check.

**Features:**

- Email format validation
- Async availability check
- Loading state
- Error display

**Props:**

```typescript
interface Props {
	value: string;
	excludeId?: string; // For checking duplicate excluding current
	error?: string;
	onChange?: (value: string) => void;
	onCheck?: (value: string) => Promise<boolean>;
}
```

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** Task 1.1

---

#### Task 3.3: Create WhatsAppInput Component

**File:** `src/lib/components/ui/form/whatsapp-input.svelte`

**Description:** WhatsApp input with country code and format validation.

**Features:**

- Country code selector
- Format validation
- Link to WhatsApp Web
- Example display

**Props:**

```typescript
interface Props {
	value: string;
	error?: string;
	onChange?: (value: string) => void;
}
```

**Priority:** Medium
**Effort:** 1.5 hours
**Dependencies:** Task 1.1

---

### Phase 4: Create Review & Summary Components

#### Task 4.1: Create ReviewCard Component

**File:** `src/lib/components/ui/review-card.svelte`

**Description:** Reusable review card for displaying form summary.

**Features:**

- Title and description
- Grid layout for fields
- Edit button per section
- Badge support
- Alert/notice section

**Props:**

```typescript
interface Props {
	title: string;
	editable?: boolean;
	onEdit?: () => void;
	children: Snippet;
}

interface FieldProps {
	label: string;
	value: string | number | undefined;
	badge?: { label: string; variant: string };
	editable?: boolean;
	onEdit?: () => void;
}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** None

---

#### Task 4.2: Create FormSummary Component

**File:** `src/lib/components/ui/form/form-summary.svelte`

**Description:** Complete form summary with all sections and progress indicator.

**Features:**

- Progress bar
- Section breakdown
- Edit navigation
- Completion checklist
- Before submit notice

**Props:**

```typescript
interface Props {
	formData: RegistrationFormData;
	currentStep: number;
	completedSections: number[];
	onEditSection: (section: number) => void;
}
```

**Priority:** Medium
**Effort:** 2 hours
**Dependencies:** Task 4.1

---

### Phase 5: Refactor Step Components

#### Task 5.1: Refactor StepIdentity

**File:** `src/routes/admin/register/steps/StepIdentity.svelte`

**Description:** Refactor to use new form components.

**Changes:**

```svelte
<!-- Before -->
<div class="space-y-2">
	<Label for="name">School Name *</Label>
	<Input id="name" ... />
	{#if errors.name}<p class="text-sm text-destructive">{errors.name[0]}</p>{/if}
</div>

<!-- After -->
<FormField label="School Name" required error={errors.name}>
	<Input bind:value={formData.name} />
</FormField>
```

**Additional Improvements:**

- Use SlugInput instead of manual slug handling
- Use RadioCardGroup for institution type
- Use SelectField for level
- Add NPSN availability check

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 1.1, 1.3, 1.5

---

#### Task 5.2: Refactor StepLocation

**File:** `src/routes/admin/register/steps/StepLocation.svelte`

**Description:** Refactor to use LocationCascade component.

**Changes:**

```svelte
<!-- Before -->
<Select value={selectedProvinceId} onValueChange={handleProvinceChange} ...>
	{#each provinces as province}
		<SelectItem value={province.id}>{province.name}</SelectItem>
	{/each}
</Select>

<!-- After -->
<LocationCascade bind:value={locationData} {errors} />
```

**Additional Improvements:**

- Remove inline cascade logic
- Add loading skeletons
- Better error handling

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 2.1

---

#### Task 5.3: Refactor StepAdmin

**File:** `src/routes/admin/register/steps/StepAdmin.svelte`

**Description:** Refactor to use AdminAccountForm and new components.

**Changes:**

```svelte
<!-- Before -->
<div class="space-y-2">
	<Label for="adminName">Admin Full Name *</Label>
	<Input id="adminName" ... />
</div>

<!-- After -->
<AdminAccountForm bind:data={adminData} {errors} onChange={handleUpdate} />
```

**Priority:** High
**Effort:** 1.5 hours
**Dependencies:** Task 3.1

---

#### Task 5.4: Refactor StepReview

**File:** `src/routes/admin/register/steps/StepReview.svelte`

**Description:** Refactor to use ReviewCard components.

**Changes:**

```svelte
<!-- Before -->
<Card>
	<CardHeader>
		<CardTitle class="text-base">School Identity</CardTitle>
	</CardHeader>
	<CardContent>...</CardContent>
</Card>

<!-- After -->
<ReviewCard title="School Identity" editable onEdit={() => gotoStep(1)}>
	<ReviewField label="Type" value={typeLabel} />
	<ReviewField label="Name" value={formData.name} />
</ReviewCard>
```

**Additional Improvements:**

- Add before-submit notice as Alert component
- Add navigation to edit sections
- Better formatting

**Priority:** High
**Effort:** 2 hours
**Dependencies:** Task 4.1

---

### Phase 6: Main Page Improvements

#### Task 6.1: Refactor Main Register Page

**File:** `src/routes/admin/register/+page.svelte`

**Description:** Improve main page layout and state management.

**Changes:**

- Use Card component for container
- Improve header styling
- Better progress indication
- Add save draft functionality
- Add keyboard navigation

**New Features:**

```svelte
<div class="max-w-4xl mx-auto">
	<PageHeader title="Register New School" description="..." />

	<Progress value={progress} />

	<Card>
		<CardHeader>
			<Stepper ... />
		</CardHeader>
		<CardContent>
			{#if currentStep === 1}
				<StepIdentity ... />
			{/if}
		</CardContent>
		<CardFooter>
			<Button variant="outline" onclick={saveDraft}>Save Draft</Button>
			<Button onclick={nextStep}>Next</Button>
		</CardFooter>
	</Card>
</div>
```

**Priority:** High
**Effort:** 3 hours
**Dependencies:** Task 5.1-5.4

---

#### Task 6.2: Add Save Draft Functionality

**File:** `src/routes/admin/register/+page.svelte` + server

**Description:** Add ability to save draft and resume later.

**Features:**

- Save to localStorage
- Save to server (optional)
- Load draft on page visit
- Clear draft on submit
- Draft timestamp display

**API Endpoints (new):**

- `?/saveDraft` - Save current form state
- `?/loadDraft` - Load saved draft

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** Task 6.1

---

#### Task 6.3: Add Form Progress Indicator

**File:** `src/routes/admin/register/+page.svelte`

**Description:** Add visual progress indicator for form completion.

**Features:**

- Progress bar (0-100%)
- Section completion checkmarks
- Estimated time remaining
- Completion percentage

**UI Design:**

```
Progress: ████████░░░░░░░░░░░░ 60%

✓ Identity
✓ Location
○ Admin Account
○ Review
```

**Priority:** Low
**Effort:** 1.5 hours
**Dependencies:** None

---

### Phase 7: New Features

#### Task 7.1: Add Duplicate Detection

**File:** `src/routes/admin/register/+page.server.ts` + client

**Description:** Check for duplicate school names and slugs.

**Features:**

- Real-time check as user types
- Visual warning if duplicate found
- Suggest alternative slugs
- Allow override with confirmation

**Server Action:**

```typescript
checkDuplicate: async ({ request }) => {
  const { field, value } = await request.json();
  // Check database for duplicates
  return { exists: boolean; suggestions?: string[] };
}
```

**Priority:** Medium
**Effort:** 3 hours
**Dependencies:** None

---

#### Task 7.2: Add NPSN Validation API

**File:** `src/lib/server/domain/admin/npsn.ts`

**Description:** Add NPSN validation against Kemdikbud API (or mock).

**Features:**

- Validate NPSN format
- Check if NPSN exists and is active
- Get school details from NPSN
- Auto-fill school name from NPSN

**Priority:** Medium
**Effort:** 4 hours
**Dependencies:** None

---

#### Task 7.3: Add Keyboard Shortcuts

**File:** `src/routes/admin/register/+page.svelte`

**Description:** Add keyboard navigation shortcuts.

**Shortcuts:**

- `Ctrl+Enter` - Next step
- `Ctrl+Shift+Enter` - Submit
- `Ctrl+S` - Save draft
- `Arrow Left/Right` - Navigate steps
- `Esc` - Cancel/Go back

**Priority:** Low
**Effort:** 1.5 hours
**Dependencies:** Task 6.1

---

## Implementation Order

### Week 1: Core Form Components

| Order | Task                     | Effort |
| ----- | ------------------------ | ------ |
| 1     | Task 1.1: FormField      | 2h     |
| 2     | Task 1.2: PasswordInput  | 2.5h   |
| 3     | Task 1.3: SlugInput      | 3h     |
| 4     | Task 1.4: SelectField    | 1.5h   |
| 5     | Task 1.5: RadioCardGroup | 2h     |

### Week 2: Location & Admin Components

| Order | Task                       | Effort |
| ----- | -------------------------- | ------ |
| 6     | Task 2.1: LocationCascade  | 4h     |
| 7     | Task 2.2: AddressField     | 1.5h   |
| 8     | Task 3.1: AdminAccountForm | 2h     |
| 9     | Task 3.2: EmailInput       | 1.5h   |
| 10    | Task 3.3: WhatsAppInput    | 1.5h   |

### Week 3: Review & Refactor Steps

| Order | Task                            | Effort |
| ----- | ------------------------------- | ------ |
| 11    | Task 4.1: ReviewCard            | 2h     |
| 12    | Task 4.2: FormSummary           | 2h     |
| 13    | Task 5.1: Refactor StepIdentity | 3h     |
| 14    | Task 5.2: Refactor StepLocation | 2h     |

### Week 4: Refactor & Polish

| Order | Task                          | Effort |
| ----- | ----------------------------- | ------ |
| 15    | Task 5.3: Refactor StepAdmin  | 1.5h   |
| 16    | Task 5.4: Refactor StepReview | 2h     |
| 17    | Task 6.1: Refactor Main Page  | 3h     |
| 18    | Task 6.2: Save Draft          | 4h     |

### Week 5: Features & Polish

| Order | Task                          | Effort |
| ----- | ----------------------------- | ------ |
| 19    | Task 6.3: Progress Indicator  | 1.5h   |
| 20    | Task 7.1: Duplicate Detection | 3h     |
| 21    | Task 7.2: NPSN Validation     | 4h     |
| 22    | Task 7.3: Keyboard Shortcuts  | 1.5h   |

---

## Total Effort

| Phase                        | Tasks  | Total Time      |
| ---------------------------- | ------ | --------------- |
| Phase 1: Form Components     | 5      | 11 hours        |
| Phase 2: Location Components | 2      | 5.5 hours       |
| Phase 3: Admin Components    | 3      | 5 hours         |
| Phase 4: Review Components   | 2      | 4 hours         |
| Phase 5: Refactor Steps      | 4      | 8.5 hours       |
| Phase 6: Main Page           | 3      | 8.5 hours       |
| Phase 7: New Features        | 3      | 9 hours         |
| **Total**                    | **22** | **~51.5 hours** |

---

## Component Library Structure (New)

```
src/lib/components/ui/
├── form/
│   ├── index.ts
│   ├── form-field.svelte           # Task 1.1
│   ├── password-input.svelte       # Task 1.2
│   ├── slug-input.svelte           # Task 1.3
│   ├── select-field.svelte         # Task 1.4
│   ├── radio-card-group.svelte     # Task 1.5
│   ├── location-cascade.svelte     # Task 2.1
│   ├── address-field.svelte        # Task 2.2
│   ├── admin-account-form.svelte   # Task 3.1
│   ├── email-input.svelte          # Task 3.2
│   └── whatsapp-input.svelte       # Task 3.3
├── review/
│   ├── index.ts
│   ├── review-card.svelte          # Task 4.1
│   └── form-summary.svelte         # Task 4.2
```

---

## Success Criteria

- [x] All form fields use reusable FormField component
- [x] Location cascade logic is encapsulated
- [x] Password input has strength indicator
- [x] Slug input has availability check
- [x] Save draft functionality works
- [x] Progress indicator shows completion
- [x] Keyboard navigation is complete
- [x] No inline styles in step components
- [x] All validation is consistent

---

## Related Files

**Modified:**

- `src/routes/admin/register/+page.svelte`
- `src/routes/admin/register/+page.server.ts`
- `src/routes/admin/register/steps/StepIdentity.svelte`
- `src/routes/admin/register/steps/StepLocation.svelte`
- `src/routes/admin/register/steps/StepAdmin.svelte`
- `src/routes/admin/register/steps/StepReview.svelte`

**Created:**

- `src/lib/components/ui/form/form-field.svelte`
- `src/lib/components/ui/form/password-input.svelte`
- `src/lib/components/ui/form/slug-input.svelte`
- `src/lib/components/ui/form/select-field.svelte`
- `src/lib/components/ui/form/radio-card-group.svelte`
- `src/lib/components/ui/form/location-cascade.svelte`
- `src/lib/components/ui/form/address-field.svelte`
- `src/lib/components/ui/form/admin-account-form.svelte`
- `src/lib/components/ui/form/email-input.svelte`
- `src/lib/components/ui/form/whatsapp-input.svelte`
- `src/lib/components/ui/review/review-card.svelte`
- `src/lib/components/ui/review/form-summary.svelte`

**Deleted:**

- `src/routes/admin/register/steps/StepIdentity.svelte` (replaced with refactored)
- `src/routes/admin/register/steps/StepLocation.svelte` (replaced with refactored)
- `src/routes/admin/register/steps/StepAdmin.svelte` (replaced with refactored)
- `src/routes/admin/register/steps/StepReview.svelte` (replaced with refactored)
