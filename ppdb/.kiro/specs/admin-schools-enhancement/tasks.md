# Implementation Plan: Admin Schools Enhancement

## Overview

This implementation plan breaks down the Admin Schools Enhancement feature into discrete, manageable tasks. The approach follows a phased strategy: cleanup first, then core features, then enhancements, and finally comprehensive testing. Each task builds incrementally to ensure the system remains functional throughout development.

## Tasks

- [ ] 1. Phase 1: Code Cleanup & Foundation
  - Remove technical debt and establish solid foundation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 1.1 Remove unused component files and fix ESLint warnings
  - Delete `SchoolsStatsCards.svelte`, `SchoolsFilterBar.svelte`, `Pagination.svelte`
  - Add proper keys to each block: `{#each data.tenants.data as tenant (tenant.id)}`
  - Remove ESLint disable comment
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Extract magic numbers to constants file
  - Create `src/lib/constants/admin.ts`
  - Define constants: `PAGINATION_LIMIT`, `POLLING_INTERVAL`, `SEARCH_DEBOUNCE`, `TOAST_DURATION`, `CACHE_TTL`, `TENANT_ID_DISPLAY_LENGTH`
  - Replace all hardcoded values with constants
  - _Requirements: 1.3_

- [x] 1.3 Standardize language to English
  - Review all UI text in main page
  - Ensure consistent English throughout
  - Update button labels, placeholders, and messages
  - _Requirements: 1.4_

- [x] 1.4 Replace arbitrary Tailwind values with design system classes
  - Replace `max-w-[200px]` with semantic class
  - Replace `border-green-200 bg-green-50` with Badge variants
  - Ensure all colors use design tokens
  - _Requirements: 1.5_

- [x] 1.5 Write unit tests for constants and utilities
  - Test constant values are defined
  - Test utility functions (if any created)
  - _Requirements: 9.1_

- [ ] 2. Phase 2: Error Handling & Loading States
  - Implement robust error handling and user feedback
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2.1 Add toast notification system
  - Install/configure toast library (e.g., svelte-sonner)
  - Create toast utility functions in `$lib/utils/toast.ts`
  - Add toast container to layout
  - _Requirements: 3.4_

- [x] 2.2 Implement error handling in server actions
  - Wrap all async operations in try-catch blocks
  - Return structured error responses
  - Create error message mapping in `$lib/constants/errors.ts`
  - _Requirements: 2.1, 2.4_

- [x] 2.3 Add loading skeleton for table
  - Create `TableSkeleton.svelte` component
  - Show skeleton when `navigating.to` is truthy
  - Match skeleton structure to actual table
  - _Requirements: 3.1_

- [x] 2.4 Add loading states to toggle status action
  - Track loading state per tenant ID
  - Disable button and show spinner during operation
  - Show toast on success/error
  - _Requirements: 3.3, 3.4_

- [x] 2.5 Implement retry logic for network errors
  - Create `fetchWithRetry` utility function
  - Add exponential backoff
  - Show retry option in error toast
  - _Requirements: 2.2_

- [x] 2.6 Write unit tests for error handling utilities
  - Test error message mapping
  - Test retry logic with mock failures
  - _Requirements: 9.1_

- [x] 2.7 Write integration tests for server error handling
  - Test API error responses
  - Test validation errors
  - Test authorization errors
  - _Requirements: 9.2_

- [ ] 3. Phase 3: Enhanced Statistics
  - Implement comprehensive statistics dashboard
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 3.1 Extend database queries for enhanced statistics
  - Add query for new schools this month
  - Add query for total revenue calculation
  - Add query for average applications per school
  - Update `listTenantsWithStats` function
  - _Requirements: 4.3, 4.4, 4.5_

- [x] 3.2 Create StatsCards component
  - Build component in `components/StatsCards.svelte`
  - Display 5 metrics: Total, Active, New This Month, Revenue, Avg Applications
  - Add trend indicators where applicable
  - Include loading skeleton state
  - Use KPICard component for consistency
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.3 Implement statistics caching in Cloudflare KV
  - Create cache key strategy
  - Set TTL to 5 minutes
  - Implement cache invalidation on tenant updates
  - _Requirements: 10.4_

- [x] 3.4 Update main page to use new StatsCards
  - Replace existing KPICard instances
  - Pass enhanced stats data
  - Ensure real-time updates via polling
  - _Requirements: 4.6_

- [x] 3.5 Write property test for statistics accuracy
  - **Property 10: Statistics Accuracy**
  - Generate random tenant data
  - Calculate expected statistics
  - Verify displayed values match calculations
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [x] 3.6 Write integration tests for statistics queries
  - Test new schools this month calculation
  - Test revenue aggregation
  - Test average applications calculation
  - _Requirements: 9.2_

- [ ] 4. Phase 4: Bulk Operations
  - Implement multi-select and bulk actions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 4.1 Create SchoolsTable component with selection
  - Extract table from main page to `components/SchoolsTable.svelte`
  - Add checkbox column for row selection
  - Add "Select All" checkbox in header
  - Emit selection events to parent
  - _Requirements: 5.1, 5.2_

- [x] 4.2 Implement selection state management
  - Add `selectedIds` state array in main page
  - Implement `handleSelect` function
  - Implement `handleSelectAll` function
  - Ensure selection persists during re-renders
  - _Requirements: 5.1, 5.2_

- [x] 4.3 Create BulkActionToolbar component
  - Build component in `components/BulkActionToolbar.svelte`
  - Show selected count
  - Add Activate and Deactivate buttons
  - Add Clear Selection button
  - Position fixed at bottom (mobile) or below header (desktop)
  - _Requirements: 5.3_

- [x] 4.4 Implement bulk status update server action
  - Create `bulkUpdateStatus` action in `+page.server.ts`
  - Process array of tenant IDs
  - Handle partial failures gracefully
  - Return detailed result summary
  - Create audit log entries for each change
  - _Requirements: 5.4, 5.5, 5.6, 5.7_

- [x] 4.5 Add confirmation dialog for bulk actions
  - Create reusable confirmation dialog component
  - Show count of affected schools
  - Require explicit confirmation for deactivation
  - _Requirements: 5.4, 5.5_

- [x] 4.6 Implement bulk operation result display
  - Show success count in toast
  - Show failure count and details if any
  - Provide option to view detailed error list
  - Clear selection after successful operation
  - _Requirements: 5.6, 5.7_

- [x] 4.7 Write property test for selection consistency
  - **Property 1: Selection Consistency**
  - Generate random selection states
  - Verify "Select All" reflects actual state
  - Verify selection persists across re-renders
  - **Validates: Requirements 5.1, 5.2**

- [x] 4.8 Write property test for bulk operation atomicity
  - **Property 3: Bulk Operation Atomicity**
  - Generate random tenant sets with some invalid IDs
  - Verify partial failures are handled
  - Verify detailed summary is returned
  - **Validates: Requirements 5.6, 5.7**

- [x] 4.9 Write integration tests for bulk operations
  - Test bulk activation of multiple tenants
  - Test bulk deactivation of multiple tenants
  - Test partial failure scenarios
  - Test audit log creation
  - _Requirements: 9.2_

- [x] 4.10 Write E2E test for bulk activation workflow
  - Navigate to schools page
  - Select multiple schools
  - Click bulk activate
  - Confirm action
  - Verify success toast
  - Verify status badges updated
  - _Requirements: 9.3_

- [ ] 5. Phase 5: Export Functionality
  - Implement CSV export with filtering
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 5.1 Create CSV generation utility
  - Create `generateSchoolsCSV` function in `$lib/utils/export.ts`
  - Define CSV columns: Name, Slug, Status, Applications, Paid Invoices, Created Date, Subdomain
  - Handle special characters and escaping
  - Format dates consistently
  - _Requirements: 6.3_

- [x] 5.2 Create export server action
  - Add `exportSchools` action in `+page.server.ts`
  - Fetch schools matching current filters
  - Generate CSV using utility function
  - Return CSV as downloadable response
  - Log export action to audit trail
  - _Requirements: 6.2, 6.4, 6.7_

- [x] 5.3 Create ExportButton component
  - Build component in `components/ExportButton.svelte`
  - Show loading spinner during export
  - Disable button while processing
  - Trigger browser download on completion
  - Show error toast if export fails
  - _Requirements: 6.1, 6.5, 6.6_

- [x] 5.4 Add export button to page header
  - Position next to "Add New School" button
  - Pass current filter state to component
  - Ensure responsive layout
  - _Requirements: 6.1_

- [x] 5.5 Write property test for export data completeness
  - **Property 4: Export Data Completeness**
  - Generate random tenant data and filters
  - Export with filters applied
  - Verify CSV contains exactly matching schools
  - Verify all required columns present
  - **Validates: Requirements 6.2, 6.3, 6.4**

- [x] 5.6 Write unit tests for CSV generation
  - Test CSV formatting
  - Test special character escaping
  - Test date formatting
  - Test empty dataset handling
  - _Requirements: 9.1_

- [x] 5.7 Write integration test for export action
  - Test export with no filters
  - Test export with search filter
  - Test export with status filter
  - Test audit log creation
  - _Requirements: 9.2_

- [ ] 6. Phase 6: Quick Preview Modal
  - Implement school details modal
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 6.1 Create ActivityTimeline component
  - Build component in `components/ActivityTimeline.svelte`
  - Display chronological list of actions
  - Show action type, actor, timestamp
  - Format timestamps as relative ("2 hours ago")
  - Add icons for different action types
  - _Requirements: 11.2, 11.3, 11.4_

- [x] 6.2 Create server endpoint for tenant details
  - Add `getTenantDetails` function in domain layer
  - Fetch tenant profile, stats, and activity timeline
  - Implement caching (5 minutes TTL)
  - _Requirements: 7.2, 7.3, 7.4_

- [x] 6.3 Create QuickPreviewModal component
  - Build component in `components/QuickPreviewModal.svelte`
  - Implement modal using Shadcn Dialog
  - Add header with school name, logo, status
  - Add stats section
  - Add profile section
  - Integrate ActivityTimeline component
  - Add quick action buttons
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6.4 Implement modal open/close logic
  - Add modal state to main page
  - Handle click on school name to open modal
  - Handle ESC key to close
  - Handle click outside to close
  - Fetch data on modal open
  - _Requirements: 7.1, 7.6_

- [x] 6.5 Ensure keyboard navigation in modal
  - Tab through all interactive elements
  - Focus trap within modal
  - Return focus to trigger on close
  - _Requirements: 7.7_

- [x] 6.6 Write E2E test for quick preview
  - Click school name
  - Verify modal opens
  - Verify data displayed
  - Test keyboard navigation
  - Test ESC to close
  - _Requirements: 9.3_

- [ ] 7. Phase 7: Advanced Filtering
  - Implement comprehensive filtering system
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 7.1 Create FilterBar component
  - Build component in `components/FilterBar.svelte`
  - Add status dropdown
  - Add date range picker
  - Add application count range slider
  - Add payment status filter
  - Display active filters as chips
  - Add "Clear All" button
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 7.2 Implement filter state management
  - Define FilterState interface
  - Sync filter state with URL parameters
  - Implement filter change handlers
  - Implement clear all filters
  - _Requirements: 12.7_

- [x] 7.3 Update server load function for advanced filters
  - Parse all filter parameters from URL
  - Build dynamic database query
  - Apply filters to tenant list query
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [x] 7.4 Add FilterBar to main page
  - Position below stats cards
  - Pass current filter state
  - Handle filter change events
  - _Requirements: 12.1_

- [x] 7.5 Write property test for filter URL synchronization
  - **Property 2: Filter URL Synchronization**
  - Generate random filter states
  - Convert to URL and back
  - Verify exact match
  - **Validates: Requirements 12.7**

- [x] 7.6 Write integration tests for filter queries
  - Test status filter
  - Test date range filter
  - Test application count filter
  - Test combined filters
  - _Requirements: 9.2_

- [x] 7.7 Write E2E test for filtering workflow
  - Apply status filter
  - Verify results updated
  - Apply date range filter
  - Verify URL updated
  - Clear all filters
  - Verify reset to default
  - _Requirements: 9.3_

- [ ] 8. Phase 8: Accessibility Improvements
  - Ensure WCAG AA compliance
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 8.1 Add ARIA labels to form inputs
  - Add aria-label to search input
  - Add aria-label to filter dropdown
  - Add aria-label to all icon buttons
  - _Requirements: 8.1, 8.2_

- [x] 8.2 Implement ARIA live regions
  - Add aria-live="polite" to stats cards
  - Add aria-live="assertive" to error messages
  - Add role="status" to loading indicators
  - _Requirements: 8.3_

- [x] 8.3 Ensure keyboard accessibility
  - Test tab navigation through all elements
  - Ensure Enter key activates buttons
  - Ensure Space key toggles checkboxes
  - Test modal keyboard navigation
  - _Requirements: 8.4_

- [x] 8.4 Verify color contrast ratios
  - Audit all text/background combinations
  - Ensure minimum 4.5:1 for normal text
  - Ensure minimum 3:1 for large text
  - Fix any violations
  - _Requirements: 8.5_

- [x] 8.5 Add visible focus indicators
  - Ensure all interactive elements have focus styles
  - Use consistent focus ring style
  - Test focus visibility on all backgrounds
  - _Requirements: 8.6_

- [x] 8.6 Use semantic HTML elements
  - Verify proper heading hierarchy
  - Use <button> for actions, <a> for navigation
  - Use <table> with proper structure
  - _Requirements: 8.7_

- [x] 8.7 Write accessibility tests with axe-core
  - Test main page for violations
  - Test modal for violations
  - Test bulk action toolbar for violations
  - Ensure zero violations
  - _Requirements: 9.4_

- [x] 8.8 Write E2E keyboard navigation test
  - Navigate entire page using only keyboard
  - Verify all actions accessible
  - Verify focus management
  - _Requirements: 9.3_

- [ ] 9. Phase 9: Performance Optimization
  - Optimize for speed and efficiency
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 9.1 Implement search debouncing
  - Use SEARCH_DEBOUNCE constant (300ms)
  - Clear timeout on component unmount
  - _Requirements: 10.1_

- [x] 9.2 Add cleanup for timers and intervals
  - Add cleanup in $effect for polling interval
  - Add cleanup in $effect for search debounce
  - Verify no memory leaks
  - _Requirements: 10.2_

- [x] 9.3 Implement virtual scrolling for large datasets
  - Install virtual scrolling library (e.g., svelte-virtual)
  - Apply to table when >100 rows
  - Test performance with 1000+ rows
  - _Requirements: 10.3_

- [x] 9.4 Implement statistics caching
  - Cache stats in Cloudflare KV
  - Set 5-minute TTL
  - Invalidate on tenant updates
  - _Requirements: 10.4_

- [x] 9.5 Lazy load modal content
  - Fetch tenant details only when modal opens
  - Show loading skeleton while fetching
  - Cache result for 5 minutes
  - _Requirements: 10.5_

- [x] 9.6 Run Lighthouse audit
  - Test performance score
  - Test accessibility score
  - Test best practices score
  - Fix any issues to achieve >90 scores
  - _Requirements: 10.6_

- [ ] 10. Phase 10: Audit Trail Implementation
  - Implement comprehensive activity logging
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 10.1 Create audit log database schema
  - Define audit_logs table
  - Add columns: id, tenant_id, action, actor_id, timestamp, details
  - Add indexes for efficient querying
  - Create migration
  - _Requirements: 11.5_

- [x] 10.2 Implement audit log creation functions
  - Create `createAuditLog` function in domain layer
  - Log all status changes
  - Log bulk operations
  - Log exports
  - Ensure immutability (no update/delete)
  - _Requirements: 11.5_

- [x] 10.3 Update all server actions to create audit logs
  - Add audit logging to toggleStatus action
  - Add audit logging to bulkUpdateStatus action
  - Add audit logging to exportSchools action
  - _Requirements: 11.5_

- [x] 10.4 Implement audit log query functions
  - Create `getAuditLogs` function
  - Support filtering by tenant_id
  - Support filtering by action type
  - Support pagination
  - _Requirements: 11.6_

- [x] 10.5 Display last activity in table
  - Add "Last Activity" column to table
  - Show relative timestamp
  - Show action type
  - _Requirements: 11.1_

- [x] 10.6 Integrate audit logs in QuickPreviewModal
  - Fetch audit logs for tenant
  - Pass to ActivityTimeline component
  - Display last 10 actions
  - _Requirements: 11.2, 11.3, 11.4_

- [x] 10.7 Write property test for audit trail immutability
  - **Property 9: Audit Trail Immutability**
  - Perform status changes
  - Verify audit logs created
  - Attempt to modify/delete via UI
  - Verify operations fail
  - **Validates: Requirements 11.5**

- [x] 10.8 Write integration tests for audit logging
  - Test audit log creation on status change
  - Test audit log creation on bulk operation
  - Test audit log query functions
  - Test immutability constraints
  - _Requirements: 9.2_

- [ ] 11. Final Integration & Testing
  - Ensure all components work together seamlessly
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11.1 Integration testing checkpoint
  - Run all integration tests
  - Fix any failures
  - Ensure >80% code coverage
  - _Requirements: 9.2, 9.5_

- [x] 11.2 E2E testing checkpoint
  - Run all E2E tests
  - Test complete user workflows
  - Test error scenarios
  - Fix any failures
  - _Requirements: 9.3_

- [x] 11.3 Property-based testing checkpoint
  - Run all property tests
  - Ensure 100 iterations per test
  - Fix any failures
  - _Requirements: 9.1_

- [x] 11.4 Accessibility testing checkpoint
  - Run axe-core tests
  - Manual keyboard navigation testing
  - Screen reader testing
  - Fix any violations
  - _Requirements: 9.4_

- [x] 11.5 Performance testing checkpoint
  - Run Lighthouse audits
  - Test with large datasets (1000+ schools)
  - Test on slow network (3G simulation)
  - Optimize as needed
  - _Requirements: 10.6_

- [x] 11.6 Final manual QA
  - Test all features end-to-end
  - Test error scenarios
  - Test edge cases
  - Verify all requirements met
  - _Requirements: All_

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate server-side logic and database interactions
- E2E tests validate complete user workflows
- Accessibility tests ensure WCAG AA compliance
