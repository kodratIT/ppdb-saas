# Design Plan: Advanced SaaS Package Management

## 1. Overview
Enhance the SaaS Package Management page (`/admin/subscription/packages`) to provide better insights, control, and visualization for Super Admins. The goal is to move beyond a simple data table to a product management dashboard that helps Admins understand package performance and visualize how packages appear to end-users.

## 2. Backend Changes (`+page.server.ts`)
We need to enrich the package data with usage statistics.

### Data Fetching Strategy
- **Current:** Simple `findMany` on `saasPackages`.
- **New:**
  - Execute aggregation query on `saasSubscriptions` to count active subscriptions per `packageId`.
  - Join/Map this count to the package list.
  - Calculate high-level summary stats:
    - `totalPackages`: Count of all packages.
    - `activeSubscriptions`: Sum of all active subscriptions across all packages.
    - `totalRevenueMonthly`: Simple estimation (Sum of `priceMonthly * subscriberCount` for each package).

## 3. Frontend UI/UX (`+page.svelte`)

### A. Summary Stats Area (Top)
A row of 3 cards providing instant context:
1.  **Total Packages** (Icon: Package)
2.  **Active Subscribers** (Icon: Users)
3.  **Est. Monthly Revenue** (Icon: Banknote/CreditCard) - *Computed purely for visual estimate*

### B. View Mode Switcher
A simple Tabs/Toggle control to switch between:
1.  **List View (Table):** Dense, data-rich, good for management.
2.  **Grid View (Pricing Cards):** Visual, mimicking the end-user pricing page.

### C. Enhanced List View (Table)
Columns:
- **Package Info:** Name + Badge (Active/Inactive) + Slug (small)
- **Price:** Monthly / Yearly (formatted IDR)
- **Features/Limits:** A condensed summary column (e.g., "Max 100 Students, 5 Features")
- **Subscribers:** The count from backend (e.g., "12 Active")
- **Actions:** Edit, Duplicate (New), Delete

### D. Enhanced Grid View (Pricing Cards)
Render actual "Pricing Cards" used in marketing pages:
- Header: Name & Price
- Body: List of features (checked items)
- Footer: "Subscribe" button (disabled/preview mode) & Subscriber count badge.

## 4. Technical Implementation Details

### Components to Use (Shadcn/Svelte)
- `Card`, `CardHeader`, `CardContent`, `CardFooter` (for Stats & Grid items)
- `Table`, `TableBody`, `TableCell`, `TableHead` (for List view)
- `Badge` (for Status and Limits)
- `Tabs`, `TabsList`, `TabsTrigger` (for View switching)
- `Button` (Ghost variants for actions)
- `DropdownMenu` (for Row Actions: Edit, Duplicate, Delete)

### Iconography (Lucide-Svelte)
- `Package`, `Users`, `CreditCard`, `MoreVertical`, `Copy`, `Edit`, `Trash`, `Check`, `X`

## 5. Future Considerations (Out of Scope for now)
- Drag-and-drop ordering.
- Detailed "Feature Editor" form (will be handled in the `/new` or `/[id]` page task).

