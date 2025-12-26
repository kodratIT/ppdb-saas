# Prompts untuk Task Frontend PPDB SaaS

File ini berisi prompt siap pakai untuk setiap task frontend. Copy-paste prompt ke AI untuk implementasi.

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
Task: FE-0.1
Description: Create and checkout new branch `feature/ppdb-saas-frontend`

Requirements:
- Create new branch from `main` branch
- Branch name: `feature/ppdb-saas-frontend`
- Switch to the new branch after creation

Output:
- Branch created and checked out successfully
- Show current branch status
```

---

## Task Group 1.0: Setup SvelteKit Project

### Prompt untuk 1.1 - Initialize SvelteKit project with TypeScript

```
Task: FE-1.1
Description: Initialize SvelteKit project with TypeScript

Requirements:
- Create new SvelteKit project using `npm create svelte@latest ppdb-saas-frontend`
- Select options:
  - Which Svelte app template? Skeleton project
  - Add type checking? Yes, using TypeScript
  - Select additional options: ESLint, Prettier, Playwright, Vitest
- Install dependencies after project creation

Output:
- Project initialized in `/ppdb-saas-frontend` directory
- package.json with all dependencies installed
- TypeScript configuration files created
```

### Prompt untuk 1.2 - Configure Tailwind CSS and shadcn-svelte

```
Task: FE-1.2
Description: Configure Tailwind CSS and shadcn-svelte

Requirements:
- Install Tailwind CSS and its dependencies
- Configure tailwind.config.js for SvelteKit
- Setup PostCSS configuration
- Install shadcn-svelte with `npx shadcn-svelte@latest init`
- Configure shadcn components (button, input, card, etc.)

Output:
- Tailwind CSS configured and working
- shadcn-svelte initialized with default theme
- Sample page with Tailwind styles and shadcn components
```

### Prompt untuk 1.3 - Setup ESLint, Prettier, and Svelte Check

```
Task: FE-1.3
Description: Setup ESLint, Prettier, and Svelte Check

Requirements:
- Configure ESLint rules for SvelteKit
- Setup Prettier with opinionated config
- Configure Svelte Check for TypeScript
- Add format and lint scripts to package.json:
  - `npm run format` - run Prettier
  - `npm run lint` - run ESLint
  - `npm run check` - run Svelte Check
- Add pre-commit hook for linting

Output:
- ESLint configured with recommended rules
- Prettier configured with standard formatting
- Scripts working correctly
- Pre-commit hook installed (optional: using husky)
```

### Prompt untuk 1.4 - Create folder structure

```
Task: FE-1.4
Description: Create folder structure (routes, lib, components, stores, types)

Requirements:
Create the following folder structure under `/src`:
- `/routes` - All SvelteKit routes (auto-created)
- `/lib` - Shared utilities
  - `/lib/components` - Reusable components
  - `/lib/stores` - Svelte stores (state management)
  - `/lib/types` - TypeScript type definitions
  - `/lib/utils` - Helper functions
  - `/lib/api` - API client functions
  - `/lib/constants` - App-wide constants
- `/lib/components` subfolders:
  - `/lib/components/ui` - shadcn UI components
  - `/lib/components/dashboard` - Dashboard-specific components
  - `/lib/components/auth` - Auth-related components
  - `/lib/components/forms` - Form components
  - `/lib/components/layout` - Layout components

Output:
- All folders created
- README or comments in key folders explaining purpose
```

---

## Task Group 2.0: Authentication with Clerk

### Prompt untuk 2.1 - Install and configure Clerk SDK for SvelteKit

```
Task: FE-2.1
Description: Install and configure Clerk SDK for SvelteKit

Requirements:
- Install `@clerk/sveltekit` package
- Create `.env` file with Clerk API keys:
  - `VITE_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- Configure Clerk in `svelte.config.js`:
  - Add Clerk adapter
- Create `src/lib/auth.ts` for Clerk utilities:
  - Export `clerkClient` instance
  - Helper functions for auth state
- Test auth connection

Output:
- Clerk SDK installed and configured
- Auth utilities available in `src/lib/auth.ts`
- Connection test successful (check browser console)
```

### Prompt untuk 2.2 - Create auth wrapper component

```
Task: FE-2.2
Description: Create auth wrapper component

Requirements:
Create `src/lib/components/auth/AuthWrapper.svelte`:
- Wrap entire app with Clerk provider
- Check auth state on mount
- Show loading spinner while checking auth
- Redirect to login if not authenticated (for protected routes)
- Handle authentication errors

Create `src/lib/components/auth/ProtectedRoute.svelte`:
- Wrapper component for protected routes
- Redirect unauthenticated users to login
- Store redirect URL for post-login redirect

Output:
- AuthWrapper.svelte component created
- ProtectedRoute.svelte component created
- Both components properly typed with TypeScript
```

### Prompt untuk 2.3 - Implement protected route middleware

```
Task: FE-2.3
Description: Implement protected route middleware

Requirements:
Create `src/routes/+layout.server.ts`:
- Check user authentication
- Load user data (role, permissions)
- Make user data available to all routes

Create `src/lib/middleware/auth.ts`:
- Middleware function to check auth
- Check user roles/permissions
- Redirect logic for unauthorized access

Update `src/hooks.server.ts`:
- Handle auth callbacks
- Protect server routes

Output:
- Auth middleware implemented
- Protected routes working
- Role-based access control working
```

### Prompt untuk 2.4 - Create login/signup pages

```
Task: FE-2.4
Description: Create login/signup pages

Requirements:
Create `src/routes/(auth)/login/+page.svelte`:
- Use Clerk's SignIn component
- Add branding and instructions
- Handle auth state changes

Create `src/routes/(auth)/signup/+page.svelte`:
- Use Clerk's SignUp component
- Add form fields for role selection (admin/parent/student)
- Handle account creation

Create `src/routes/(auth)/+layout.svelte`:
- Layout for auth pages (centered card design)
- Add backlink to home page

Output:
- Login page with Clerk SignIn
- Signup page with role selection
- Responsive design working on mobile
```

### Prompt untuk 2.5 - Implement role-based access control

```
Task: FE-2.5
Description: Implement role-based access control

Requirements:
Create `src/lib/stores/auth.ts`:
- Store for auth state
- Store for user roles
- Store for permissions
- Helper functions: `hasRole()`, `hasPermission()`

Create `src/lib/types/auth.ts`:
- TypeScript types for User, Role, Permission

Update middleware to use roles:
- Role-based route protection
- Permission-based component visibility

Output:
- Auth store created and working
- Role-based access working
- Permission helpers available
```

---

## Task Group 3.0: School Management Dashboard

### Prompt untuk 3.1 - Create dashboard layout and navigation

```
Task: FE-3.1
Description: Create dashboard layout and navigation

Requirements:
Create `src/routes/dashboard/+layout.svelte`:
- Sidebar navigation with menu items
- Top header with user menu and notifications
- Mobile-responsive sidebar (collapsible)
- Active route highlighting

Create navigation menu items:
- Overview (dashboard home)
- Schools (manage schools)
- Registration (view registrations)
- Selection (manage selection)
- Payments (payment management)
- Reports (analytics)
- Settings (config)

Output:
- Dashboard layout with sidebar navigation
- Mobile-responsive design
- Active route highlighting
```

### Prompt untuk 3.2 - Implement school selector (multi-school support)

```
Task: FE-3.2
Description: Implement school selector (multi-school support)

Requirements:
Create `src/lib/components/dashboard/SchoolSelector.svelte`:
- Dropdown to select active school
- Show school name and type (SD/SMP/SMA/SMK)
- Display school quota status
- Handle school switching

Create `src/lib/stores/school.ts`:
- Store for active school
- Store for all accessible schools
- Functions: `setActiveSchool()`, `getActiveSchool()`

Output:
- School selector component created
- School state management working
- Multiple schools can be managed
```

### Prompt untuk 3.3 - Create school profile configuration page

```
Task: FE-3.3
Description: Create school profile configuration page

Requirements:
Create `src/routes/dashboard/schools/[schoolId]/profile/+page.svelte`:
- Form to edit school information:
  - School name
  - School type (SD/SMP/SMA/SMK)
  - Address
  - Contact info
  - NPSN
  - Accreditation status
- Save button with validation
- Profile picture upload

Create API integration:
- GET /api/schools/[schoolId] to fetch profile
- PUT /api/schools/[schoolId] to update profile

Output:
- School profile form created
- Form validation working
- Save/load functionality working
```

### Prompt untuk 3.4 - Build registration periods management UI

```
Task: FE-3.4
Description: Build registration periods management UI

Requirements:
Create `src/routes/dashboard/schools/[schoolId]/periods/+page.svelte`:
- List of registration periods
- Button to create new period
- Period cards showing:
  - Period name
  - Start/end date
  - Status (draft/open/closed)
  - Registration count
- Edit and delete actions

Create modal/form for creating/editing periods:
- Period name
- Start datetime
- End datetime
- Status (draft/open/closed)
- Paths configuration

Output:
- Registration periods list created
- Create/edit/delete working
- Period cards with all info
```

### Prompt untuk 3.5 - Implement school capacity settings UI

```
Task: FE-3.5
Description: Implement school capacity settings UI

Requirements:
Create `src/routes/dashboard/schools/[schoolId]/capacity/+page.svelte`:
- Input fields for capacity per path:
  - Zonasi
  - Prestasi
  - Afirmasi
  - Mutasi
  - Anak Guru
  - Internal
- Input for quota per school type
- Save button with validation
- Capacity utilization chart (bar chart)

Output:
- Capacity settings form created
- Capacity chart displaying utilization
- Save functionality working
```

---

## Task Group 4.0: Student Registration Flow

### Prompt untuk 4.1 - Create registration form wizard (multi-step)

```
Task: FE-4.1
Description: Create registration form wizard (multi-step)

Requirements:
Create `src/routes/registration/+page.svelte`:
- Multi-step wizard with progress indicator
- Steps:
  1. School selection (max 3 schools)
  2. Student data
  3. Parent/guardian data
  4. Documents upload
  5. Review & submit
- Navigation buttons (Next/Previous/Save Draft)
- Auto-save draft to local storage
- Validation before proceeding

Create wizard state management:
- Track current step
- Store form data
- Validate each step

Output:
- Multi-step wizard created
- Step navigation working
- Progress indicator
- Draft auto-save
```

### Prompt untuk 4.2 - Implement student data input forms

```
Task: FE-4.2
Description: Implement student data input forms

Requirements:
Create `src/lib/components/forms/StudentDataForm.svelte`:
- Form fields:
  - Full name
  - NISN
  - NIK
  - Date of birth
  - Gender
  - Place of birth
  - Address
  - Phone number
  - Email
- Form validation (required fields, format validation)
- Real-time validation feedback

Create `src/lib/types/student.ts`:
- TypeScript interfaces for student data

Output:
- Student data form created
- All fields with validation
- Real-time feedback
```

### Prompt untuk 4.3 - Build parent/guardian information forms

```
Task: FE-4.3
Description: Build parent/guardian information forms

Requirements:
Create `src/lib/components/forms/ParentDataForm.svelte`:
- Form fields for father:
  - Name
  - NIK
  - Phone
  - Email
  - Occupation
- Form fields for mother:
  - Name
  - NIK
  - Phone
  - Email
  - Occupation
- Guardian fields (if applicable)
- Form validation

Create `src/lib/types/parent.ts`:
- TypeScript interfaces for parent data

Output:
- Parent data form created
- All parent fields
- Validation working
```

### Prompt untuk 4.4 - Create document upload component

```
Task: FE-4.4
Description: Create document upload component

Requirements:
Create `src/lib/components/forms/DocumentUpload.svelte`:
- Upload fields for required documents:
  - Birth certificate (Akta Kelahiran)
  - Family card (Kartu Keluarga)
  - Report card (Rapor)
  - Student ID (KIP/PKH if applicable)
- File validation (type, size)
- Upload progress indicator
- Preview uploaded files
- Delete uploaded files

Output:
- Document upload component created
- File type and size validation
- Upload progress
- File preview and delete
```

### Prompt untuk 4.5 - Implement school selection (max 3 schools)

```
Task: FE-4.5
Description: Implement school selection (max 3 schools)

Requirements:
Create `src/lib/components/forms/SchoolSelection.svelte`:
- Search for schools by name/NPSN
- School cards showing:
  - School name
  - Type (SD/SMP/SMA/SMK)
  - Address
  - Available quota
- Multi-select with max 3 schools
- Priority ordering (drag and drop)
- Validation: max 1 public (negeri) school
- Show distance from home address (calculate based on address)

Output:
- School selection component created
- Max 3 schools enforced
- Max 1 public school enforced
- Priority ordering working
```

### Prompt untuk 4.6 - Add validation for registration rules

```
Task: FE-4.6
Description: Add validation for registration rules

Requirements:
Implement validation rules:
- Student must be within age range for school type
- Student NISN required
- Parent NIK required
- All required documents uploaded
- Max 3 schools selected
- Max 1 public (negeri) school
- Within registration period dates

Create `src/lib/utils/validation.ts`:
- Validation functions for each rule
- Helper: `validateRegistration(data)` returns errors array

Integrate validation into wizard:
- Block navigation if validation fails
- Show error messages
- Highlight invalid fields

Output:
- Validation rules implemented
- Validation utilities created
- Integrated into wizard
```

---

## Task Group 5.0: Verification and Selection Dashboard

### Prompt untuk 5.1 - Create registration list with filters

```
Task: FE-5.1
Description: Create registration list with filters

Requirements:
Create `src/routes/dashboard/selection/registrations/+page.svelte`:
- Data table/list of registrations
- Filters:
  - School
  - Registration path
  - Status (pending/verified/rejected/selected)
  - Date range
- Search by name/NISN
- Pagination
- Sort options

Output:
- Registration list created
- All filters working
- Pagination working
- Sort functionality
```

### Prompt untuk 5.2 - Implement document review interface

```
Task: FE-5.2
Description: Implement document review interface

Requirements:
Create `src/lib/components/dashboard/DocumentReview.svelte`:
- Show all uploaded documents for a student
- Document viewer (preview PDF/images)
- Review actions:
  - Approve document
  - Reject document (with reason)
  - Request additional documents
- Show document status (verified/rejected/pending)

Output:
- Document review component created
- Document preview working
- Approve/reject actions
```

### Prompt untuk 5.3 - Build selection status indicators

```
Task: FE-5.3
Description: Build selection status indicators

Requirements:
Create status badges for:
- Pending verification
- Verified
- Rejected
- Selected
- Not selected
- Waitlist

Color coding:
- Green: Selected
- Blue: Verified
- Yellow: Pending
- Red: Rejected
- Gray: Waitlist

Output:
- Status badge components created
- Color coding applied
- Used across dashboard
```

### Prompt untuk 5.4 - Create selection results display

```
Task: FE-5.4
Description: Create selection results display

Requirements:
Create `src/routes/dashboard/selection/results/+page.svelte`:
- List of selected students
- Student cards showing:
  - Name
  - Selected school
  - Selection path
  - Selection score (if applicable)
- Filter by school and path
- Export results (PDF, Excel)
- Print functionality

Output:
- Selection results page created
- Student cards with all info
- Filters working
- Export functionality
```

### Prompt untuk 5.5 - Implement selection path visualization

```
Task: FE-5.5
Description: Implement selection path visualization

Requirements:
Create `src/lib/components/dashboard/SelectionPathVisualizer.svelte`:
- Show selection paths flow:
  - Zonasi → Verification → Selection → Result
  - Prestasi → Verification → Score Calculation → Selection → Result
  - Afirmasi → Verification → Priority Check → Selection → Result
  - Mutasi → Verification → Document Check → Selection → Result
  - Anak Guru → Verification → Parent Check → Selection → Result
  - Internal → Verification → Selection → Result
- Show current status for each path
- Color-coded stages

Output:
- Path visualization component created
- All 6 paths displayed
- Current status shown
```

---

## Task Group 6.0: Payment Integration UI

### Prompt untuk 6.1 - Create payment selection interface

```
Task: FE-6.1
Description: Create payment selection interface

Requirements:
Create `src/lib/components/forms/PaymentMethodSelector.svelte`:
- Payment method selection:
  - Midtrans (QRIS, Credit Card, Bank Transfer)
  - Xendit (QRIS, Credit Card, Bank Transfer)
- Show payment method logos
- Display fees for each method
- Payment method details (description)

Output:
- Payment selector component created
- Payment methods displayed
- Fees shown
```

### Prompt untuk 6.2 - Build payment status tracking

```
Task: FE-6.2
Description: Build payment status tracking

Requirements:
Create `src/lib/components/dashboard/PaymentStatus.svelte`:
- Show payment status:
  - Pending
  - Processing
  - Success
  - Failed
- Status badges with color coding
- Payment details:
  - Amount
  - Method
  - Transaction ID
  - Timestamp
- Retry button for failed payments

Output:
- Payment status component created
- All statuses shown
- Color-coded badges
- Retry button
```

### Prompt untuk 6.3 - Implement payment receipt display

```
Task: FE-6.3
Description: Implement payment receipt display

Requirements:
Create `src/lib/components/dashboard/PaymentReceipt.svelte`:
- Show payment receipt:
  - Transaction ID
  - Date/time
  - Amount
  - Payment method
  - School name
  - Student name
  - Payment status
- Download receipt button (PDF)
- Print receipt button

Output:
- Payment receipt component created
- All payment details shown
- Download/Print functionality
```

### Prompt untuk 6.4 - Create payment history view

```
Task: FE-6.4
Description: Create payment history view

Requirements:
Create `src/routes/dashboard/payments/history/+page.svelte`:
- List of all payments
- Filters:
  - Date range
  - Status
  - Payment method
- Search by transaction ID
- Sort options
- Payment cards with:
  - Date
  - Amount
  - Status
  - School
  - Receipt button

Output:
- Payment history page created
- Filters working
- Search working
- Sort functionality
```

---

## Task Group 7.0: Public-Facing Pages

### Prompt untuk 7.1 - Create public school information pages

```
Task: FE-7.1
Description: Create public school information pages

Requirements:
Create `src/routes/schools/[schoolId]/+page.svelte`:
- School information:
  - Name
  - Type (SD/SMP/SMA/SMK)
  - Address
  - Contact info
  - Accreditation
  - Capacity
- Registration info:
  - Current period
  - Registration dates
  - Available quota
- School facilities
- School achievements

Output:
- Public school info page created
- All school info displayed
- Registration info shown
```

### Prompt untuk 7.2 - Build registration instruction pages

```
Task: FE-7.2
Description: Build registration instruction pages

Requirements:
Create `src/routes/registration/instruction/+page.svelte`:
- Step-by-step registration instructions
- Registration paths explanation:
  - Zonasi requirements
  - Prestasi requirements
  - Afirmasi requirements
  - Mutasi requirements
  - Anak Guru requirements
  - Internal requirements
- Required documents list
- Timeline for each path

Output:
- Instruction page created
- All paths explained
- Requirements listed
- Timeline shown
```

### Prompt untuk 7.3 - Implement public FAQ section

```
Task: FE-7.3
Description: Implement public FAQ section

Requirements:
Create `src/routes/faq/+page.svelte`:
- FAQ accordion component
- FAQ categories:
  - General questions
  - Registration process
  - Documents
  - Selection process
  - Payment
- Search functionality
- Collapsible sections

Output:
- FAQ page created
- Accordion working
- Categories working
- Search functionality
```

### Prompt untuk 7.4 - Create announcement/news section

```
Task: FE-7.4
Description: Create announcement/news section

Requirements:
Create `src/routes/announcements/+page.svelte`:
- List of announcements/news
- News cards showing:
  - Title
  - Date
  - Category
  - Summary
  - Read more button
- Filter by category
- Search by keywords
- Pagination

Create announcement detail page:
- Full announcement content
- Related announcements

Output:
- Announcements page created
- News cards with info
- Filters and search working
- Detail page working
```

---

## Task Group 8.0: Reporting and Analytics

### Prompt untuk 8.1 - Create registration statistics dashboard

```
Task: FE-8.1
Description: Create registration statistics dashboard

Requirements:
Create `src/routes/dashboard/analytics/+page.svelte`:
- Key metrics:
  - Total registrations
  - Verified registrations
  - Selected students
  - Pending verification
  - Rejected registrations
- Charts:
  - Registrations over time (line chart)
  - Registrations by path (bar chart)
  - Registrations by school (pie chart)
- Date range filter

Output:
- Analytics dashboard created
- All metrics displayed
- Charts working
```

### Prompt untuk 8.2 - Implement capacity utilization charts

```
Task: FE-8.2
Description: Implement capacity utilization charts

Requirements:
Add capacity charts to analytics dashboard:
- Bar chart for each school:
  - Total capacity
  - Used quota
  - Available quota
- Capacity percentage
- Color coding:
  - Green: < 70%
  - Yellow: 70-90%
  - Red: > 90%

Output:
- Capacity charts added
- Visualization working
- Color coding applied
```

### Prompt untuk 8.3 - Build applicant demographic reports

```
Task: FE-8.3
Description: Build applicant demographic reports

Requirements:
Create demographic reports:
- Gender distribution (pie chart)
- Age distribution (bar chart)
- Registration path distribution (bar chart)
- Geographic distribution (map or chart)
- School type preference (bar chart)

Add filters:
- By school
- By period
- By path

Output:
- Demographic reports created
- All charts working
- Filters working
```

### Prompt untuk 8.4 - Create export functionality

```
Task: FE-8.4
Description: Create export functionality

Requirements:
Create export component for reports:
- Export to Excel (.xlsx)
- Export to PDF
- Export to CSV
- Select date range
- Select report type:
  - Registration list
  - Selection results
  - Payment history
  - Analytics summary

Output:
- Export component created
- All export formats working
- Report types selectable
```

---

## Task Group 9.0: Responsive Design and Accessibility

### Prompt untuk 9.1 - Ensure mobile responsiveness for all pages

```
Task: FE-9.1
Description: Ensure mobile responsiveness for all pages

Requirements:
- Test all pages on mobile devices (breakpoints: 320px, 375px, 768px)
- Fix layout issues:
  - Tables become scrollable or card-based
  - Forms stack vertically
  - Sidebar becomes drawer
  - Charts resize appropriately
- Test on iPhone, iPad, Android devices

Output:
- All pages mobile-responsive
- No layout issues on mobile
- Touch-friendly
```

### Prompt untuk 9.2 - Implement keyboard navigation

```
Task: FE-9.2
Description: Implement keyboard navigation

Requirements:
- Ensure all interactive elements are keyboard accessible:
  - Tab order follows logical flow
  - Focus indicators visible
  - Skip navigation link
  - Keyboard shortcuts (optional):
    - Tab: Next element
    - Shift+Tab: Previous element
    - Enter/Space: Activate
    - Escape: Close modals
- Test keyboard navigation

Output:
- Keyboard navigation working
- Focus indicators visible
- Skip link implemented
```

### Prompt untuk 9.3 - Add ARIA labels and roles

```
Task: FE-9.3
Description: Add ARIA labels and roles

Requirements:
Add ARIA attributes to all components:
- Buttons with icon-only: `aria-label`
- Form inputs: `aria-label`, `aria-required`, `aria-invalid`
- Status messages: `role="status"`, `aria-live="polite"`
- Navigation: `role="navigation"`, `aria-label="Main navigation"`
- Modals: `role="dialog"`, `aria-modal="true"`
- Alerts: `role="alert"`, `aria-live="assertive"`

Output:
- ARIA labels added to all components
- Roles properly defined
- Screen reader friendly
```

### Prompt untuk 9.4 - Test with screen readers

```
Task: FE-9.4
Description: Test with screen readers

Requirements:
- Test with NVDA (Windows) or VoiceOver (Mac)
- Navigate all pages with screen reader
- Verify:
  - All content is announced
  - Navigation is understandable
  - Forms are accessible
  - Errors are announced
  - Dynamic content updates are announced

Output:
- Screen reader tested
- All issues fixed
- Accessibility compliant (WCAG 2.1 AA)
```

---

## Task Group 10.0: Error Handling and Loading States

### Prompt untuk 10.1 - Create error boundary components

```
Task: FE-10.1
Description: Create error boundary components

Requirements:
Create `src/lib/components/layout/ErrorBoundary.svelte`:
- Catch JavaScript errors
- Show user-friendly error message
- Provide "Retry" button
- Provide "Go to Home" button
- Log errors to error tracking service

Create `src/routes/+error.svelte`:
- Global error page for route errors

Output:
- Error boundary component created
- Global error page created
- User-friendly error messages
```

### Prompt untuk 10.2 - Implement loading skeletons

```
Task: FE-10.2
Description: Implement loading skeletons

Requirements:
Create skeleton components for:
- Data tables
- Cards
- Forms
- Dashboard widgets
- Lists

Skeleton loading should:
- Match content layout
- Show shimmer animation
- Be reusable across components

Output:
- Skeleton components created
- Shimmer animation
- Used across app
```

### Prompt untuk 10.3 - Add toast notifications

```
Task: FE-10.3
Description: Add toast notifications

Requirements:
Create `src/lib/components/ui/Toast.svelte`:
- Toast notification system
- Types: success, error, warning, info
- Position: top-right or bottom-right
- Auto-dismiss after N seconds
- Manual dismiss button
- Multiple toasts queue

Create toast store:
- `showToast(message, type, duration)`

Integrate into forms:
- Success messages after save
- Error messages on failure
- Warning messages

Output:
- Toast component created
- All toast types working
- Auto-dismiss working
```

### Prompt untuk 10.4 - Build offline indicator

```
Task: FE-10.4
Description: Build offline indicator

Requirements:
Create offline indicator component:
- Detect online/offline status
- Show "You are offline" banner when offline
- Hide when online
- Use `navigator.onLine` and `window.addEventListener('online'/'offline')`

Position: Top of page, sticky

Output:
- Offline indicator created
- Detects connection status
- Shows/hides appropriately
```

---

## Tips Menggunakan Prompt Ini

1. **Copy-paste langsung** - Copy seluruh prompt task yang ingin dikerjakan
2. **Bekerja berurutan** - Selesaikan task dalam urutan nomor
3. **Update progress** - Check task di `task_frontend.md` setelah selesai
4. **Test setelah selesai** - Run `npm run lint`, `npm run test` setelah task selesai
5. **Commit frequently** - Commit per task dengan pesan yang jelas

## Contoh Menggunakan Prompt

```
User: Tolong kerjakan task FE-1.1

AI: [Copy prompt FE-1.1 dan implement]
```

---

## Notes

- Semua prompt sudah sesuai dengan TDD dan architecture decisions
- Gunakan shadcn-svelte components untuk UI
- Follow coding conventions di `.context.md`
- Pastikan TypeScript tidak ada error
```

Output:
- All prompts created for frontend tasks
- 40+ detailed prompts ready to use
- Organized by task group
- Copy-paste ready