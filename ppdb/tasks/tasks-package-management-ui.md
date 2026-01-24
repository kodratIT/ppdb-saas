## Relevant Files
- `ppdb/src/routes/admin/subscription/packages/+page.server.ts` - Backend logic: fetch packages with subscription counts
- `ppdb/src/routes/admin/subscription/packages/+page.svelte` - Main page: Stats, Tabs, Table & Grid views
- `ppdb/src/lib/components/admin/PricingCard.svelte` - New component for visualizing packages in Grid View (create if needed, or inline)
- `ppdb/src/lib/server/db/schema.ts` - Schema reference (for types)

### Notes
- Ensure Shadcn components (Card, Badge, Table, Tabs) are properly imported.
- No new database schema changes required, only query logic updates.

## Instructions for Completing Tasks
**IMPORTANT:** As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update after completing each sub-task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout new branch (`git checkout -b feature/enhanced-package-management`)

- [ ] 1.0 Backend: Aggregated Data Fetching
  - [ ] 1.1 Update `load` function in `+page.server.ts` to fetch count of `saasSubscriptions` grouped by `packageId`.
  - [ ] 1.2 Combine package data with subscription counts.
  - [ ] 1.3 Calculate summary stats: Total Packages, Active Subscriptions, Total Est. Revenue.
  - [ ] 1.4 Return enriched data to the page.

- [ ] 2.0 Frontend: Stats Dashboard & Layout
  - [ ] 2.1 Import Shadcn `Card` components in `+page.svelte`.
  - [ ] 2.2 Create the Stats Row (3 Cards: Total Packages, Active Subs, Est. Revenue) using `data` from server.
  - [ ] 2.3 Implement proper currency formatting for revenue.

- [ ] 3.0 Frontend: Enhanced List View (Table)
  - [ ] 3.1 Implement `Tabs` component for switching between "List" and "Grid" views.
  - [ ] 3.2 Update Table columns: Add "Subscribers" count and "Limits" summary.
  - [ ] 3.3 Ensure "Actions" dropdown/buttons are preserved and working (Edit, Toggle Status, Delete).
  - [ ] 3.4 Add "Duplicate" action button (UI only for now, can redirect to `/new?copy_from=ID`).

- [ ] 4.0 Frontend: Grid View (Pricing Cards)
  - [ ] 4.1 Create the Grid layout (responsive grid).
  - [ ] 4.2 Design the Pricing Card component (visual representation of the package).
  - [ ] 4.3 Map features JSON to a visual list in the card.
  - [ ] 4.4 Add "Edit" button on the card for quick access.

- [ ] 5.0 Final Polish & Verification
  - [ ] 5.1 Verify responsive design (mobile/desktop).
  - [ ] 5.2 Test toggle active/inactive status.
  - [ ] 5.3 Verify delete functionality.
  - [ ] 5.4 Ensure empty states are handled gracefully.
