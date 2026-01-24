# Design Plan: Advanced SaaS Package Editor (Create & Edit)

## 1. Overview
Build a robust, safe, and flexible Package Editor for Super Admins. This form handles both creating new packages and safely editing existing ones, implementing "Grandfathering" logic for price changes and validation for limit reductions.

## 2. Core Features

### A. Hybrid Feature Editor
- **Standard Features (Dictionary):** Pre-defined list of common SaaS limitations.
  - `max_students` (Number)
  - `max_storage` (Number, GB)
  - `whatsapp_blast` (Boolean)
  - `custom_domain` (Boolean)
  - `priority_support` (Boolean)
  - `white_label` (Boolean)
- **Custom Features:** Dynamic key-value pair input for ad-hoc features not in the dictionary.

### B. Pricing & Currency
- Input for Monthly Price and Yearly Price.
- Currency selection (UI ready, backend defaults to IDR).
- Auto-calculate hint: Show discount percentage when Yearly Price < 12 * Monthly.

### C. Safety & Grandfathering
- **Versioning Logic:**
  - If editing a package with `subscriberCount > 0` AND changing `price` or `critical limits`:
  - Show warning modal: "This package has active subscribers."
  - Options:
    1. **"Create New Version" (Recommended):** Archives current package (isActive=false), creates new one with updates. Old users stay on old package.
    2. **"Update Existing" (Dangerous):** Force update (only enabled for trivial changes like name/desc).

### D. Validation (Usage Check)
- When reducing limits (e.g., Max Students 100 -> 50), backend must ideally check if any active tenant exceeds the new limit.
- *Phase 1 Implementation:* Warning banner "Reducing limits may affect existing tenants. Ensure you have verified usage."

## 3. UI/UX Design (`/admin/subscription/packages/[id]`)

### Layout
- **Header:** Title "Edit Package: [Name]", Status Badge, "Save Changes" button.
- **Two-Column Grid:**
  - **Left Panel (Basics):** Name, Slug (auto-gen from name), Description, Pricing (Monthly/Yearly), Currency.
  - **Right Panel (Capabilities):**
    - **Limits Section:** Inputs for numeric limits.
    - **Features Section:** Checkboxes for boolean features.
    - **Custom JSON Section:** Collapsible "Advanced" area for raw JSON or key-value pairs.

### Components
- `Switch` for Boolean features.
- `Input` type number for limits.
- `Label` with tooltips explaining features.
- `Alert` for warnings (Active Subscribers detected).

## 4. Technical Implementation

### Data Structure (Feature Dictionary)
```typescript
export const FEATURE_DICT = {
  limits: [
    { key: 'max_students', label: 'Max Students', type: 'number', suffix: 'students' },
    { key: 'max_users', label: 'Max Staff/Users', type: 'number', suffix: 'users' }
  ],
  features: [
    { key: 'whatsapp_blast', label: 'WhatsApp Broadcasting', type: 'boolean' },
    { key: 'custom_domain', label: 'Custom Domain', type: 'boolean' },
    { key: 'white_label', label: 'Remove Branding', type: 'boolean' }
  ]
}
```

### Backend Actions (`+page.server.ts`)
- **Action `save`:**
  - Parse form data.
  - Check for `id` (Edit vs Create).
  - If Edit:
    - Check usage stats.
    - If critical change detected & user opted for "Version":
      - Transaction: Archive Old -> Insert New.
    - Else: Update.
  - If Create: Insert.

## 5. Migration/Duplicate Support
- Handle `url.searchParams.get('copy_from')`.
- If present, load data from that ID but clear the `id` and append `(Copy)` to name.

