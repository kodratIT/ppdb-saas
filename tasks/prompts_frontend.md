# Prompts untuk Task Frontend PPDB SaaS (UI First Approach)

File ini berisi prompt siap pakai untuk setiap task frontend. Pendekatan yang digunakan adalah **"UI First, Logic Later"**. Kita akan membangun antarmuka pengguna (UI) terlebih dahulu dengan *mock data*, baru kemudian menghubungkannya dengan backend/Firebase di fase terakhir.

---

## Cara Menggunakan

1. **Pilih Task ID**: Mulai dari 1.0 dan lanjut berurutan.
2. **Copy Prompt**: Copy seluruh blok kode prompt.
3. **Execute**: Paste ke AI Agent.
4. **Review**: Pastikan UI sesuai requirement sebelum lanjut.

---

## Phase 1: Setup & Foundation

### Prompt untuk 1.1 - Initialize Project & Basic Setup

```text
Task: FE-1.1
Description: Initialize SvelteKit project with TypeScript, Tailwind, and shadcn-svelte.

Requirements:
1. Initialize SvelteKit project `npm create svelte@latest .` (Skeleton, TypeScript, ESLint, Prettier).
2. Install & Configure Tailwind CSS.
3. Initialize shadcn-svelte `npx shadcn-svelte@latest init` (Default theme, Slate color).
4. Install core dependencies: `lucide-svelte` (icons), `clsx`, `tailwind-merge`.
5. Verify setup by running `npm run dev` and ensuring the welcome page loads with Tailwind styles.

Output:
- Project structure initialized.
- `package.json` updated.
- Tailwind & shadcn configured.
```

### Prompt untuk 1.2 - Folder Structure & Layouting

```text
Task: FE-1.2
Description: Create folder structure and base layouts.

Requirements:
1. Create folder structure:
   - `src/lib/components/ui` (shadcn components)
   - `src/lib/components/layout` (Navbar, Sidebar, Footer)
   - `src/lib/types` (TypeScript definitions)
   - `src/lib/stores` (State management)
   - `src/lib/mock` (For mock data)
2. Create `src/routes/+layout.svelte` (Root layout).
3. Implement a responsive `Navbar.svelte` and `Footer.svelte` in `src/lib/components/layout`.
   - Navbar should have links: Home, Cari Sekolah, Informasi, Login.
4. Add basic mobile responsive menu (hamburger) for Navbar.

Output:
- Directory structure created.
- Base layout implemented.
- Responsive Navbar & Footer visible on home page.
```

---

## Phase 2: Public Pages (UI Only)

### Prompt untuk 2.1 - Landing Page UI

```text
Task: FE-2.1
Description: Create the Landing Page UI.

Requirements:
1. Edit `src/routes/+page.svelte`.
2. Create sections:
   - **Hero Section**: Title, Subtitle, "Daftar Sekarang" CTA Button, Illustration/Image placeholder.
   - **Features Section**: Grid layout showing key features (Online Registration, Real-time Selection, etc.).
   - **Alur PPDB Section**: Step-by-step visual guide (Timeline).
   - **Statistik Singkat**: Counter for Registered Students, Schools, Quota (Use static numbers).
3. Use shadcn components (Button, Card) and Tailwind for styling.
4. Ensure fully responsive on mobile.

Output:
- Modern Landing Page UI implemented.
```

### Prompt untuk 2.2 - Search School & Detail UI

```text
Task: FE-2.2
Description: Create School Search and Detail pages (UI only).

Requirements:
1. Create `src/lib/mock/schools.ts` with dummy data (array of schools: name, address, jenjang, image).
2. Create `src/routes/sekolah/+page.svelte`:
   - Search Bar & Filter (Jenjang: SD/SMP/SMA).
   - Grid list of School Cards (Image, Name, Address, "Lihat Detail" button).
   - Implement client-side filtering using the mock data.
3. Create `src/routes/sekolah/[id]/+page.svelte`:
   - School Header (Banner, Logo, Name).
   - Tabs: Profil, Kuota/Jalur, Kontak.
   - "Daftar di Sekolah Ini" CTA Button.
4. Ensure the detail page displays data from the mock based on ID.

Output:
- Search page with working mock filter.
- School detail page UI.
```

---

## Phase 3: Authentication Pages (UI Only)

### Prompt untuk 3.1 - Login & Forgot Password UI

```text
Task: FE-3.1
Description: Create Login and Forgot Password UI.

Requirements:
1. Create `src/routes/(auth)/login/+page.svelte`:
   - Card centered layout.
   - Form: Email, Password.
   - "Masuk" Button.
   - "Lupa Password?" link and "Daftar Akun" link.
   - "Sign in with Google" button (Visual only).
2. Create `src/routes/(auth)/forgot-password/+page.svelte`:
   - Form: Email.
   - "Kirim Link Reset" Button.
   - Back to Login link.
3. Use `zod` for form validation schema (client-side only for now).

Output:
- Login page UI.
- Forgot Password page UI.
- Form validation visual feedback (red borders, error text).
```

### Prompt untuk 3.2 - Registration Page UI (Multi-Tenant Aware)

```text
Task: FE-3.2
Description: Create Registration UI with Tenant logic.

Requirements:
1. Create `src/routes/(auth)/register/+page.svelte`.
2. **Tenant UI Logic**:
   - Add a "Mock Domain Switcher" (dev only) to toggle between "Portal Yayasan" and "School Domain".
   - **Scenario A (Portal Yayasan)**: Show Dropdown to select "Jenjang" and "Sekolah Tujuan" FIRST.
   - **Scenario B (School Domain)**: Show "Mendaftar ke: SMA Negeri 1 Contoh" (Locked/Readonly).
3. Form Fields:
   - Full Name, Email, Password, Confirm Password, Phone Number.
4. "Daftar Sekarang" Button.
5. Link to Login.

Output:
- Registration page UI handling both tenant scenarios visually.
```

---

## Phase 4: Student Portal (UI Only)

### Prompt untuk 4.1 - Student Dashboard Layout

```text
Task: FE-4.1
Description: Create Student Dashboard Layout.

Requirements:
1. Create `src/routes/student/+layout.svelte`.
2. Sidebar Navigation: Dashboard, Biodata, Dokumen, Status Seleksi, Pembayaran.
3. Topbar: User Profile Dropdown, Notifications.
4. Mobile: Sidebar becomes a drawer/sheet.
5. Create `src/routes/student/dashboard/+page.svelte`:
   - Welcome message.
   - Application Status Card (Step progress: Draft -> Verified -> Selection -> Accepted).
   - Announcements widget.

Output:
- Student portal layout with responsive sidebar.
- Dashboard home UI.
```

### Prompt untuk 4.2 - Registration Wizard (The Core Flow)

```text
Task: FE-4.2
Description: Create the Multi-step Registration Form Wizard.

Requirements:
1. Create `src/routes/student/application/+page.svelte`.
2. Implement a Step Indicator (Stepper):
   - Step 1: Pilih Jalur (Zonasi/Prestasi/etc).
   - Step 2: Biodata Siswa.
   - Step 3: Data Orang Tua.
   - Step 4: Data Nilai/Prestasi (Conditional based on Step 1).
   - Step 5: Review & Submit.
3. Implement the Form UI for each step (use shadcn Input, Select, DatePicker).
4. Add "Next" and "Previous" buttons.
5. Use a local Svelte store to hold the form state temporarily.

Output:
- Functional multi-step form wizard (UI navigation only).
```

### Prompt untuk 4.3 - Document Upload UI

```text
Task: FE-4.3
Description: Create Document Upload UI.

Requirements:
1. Create `src/routes/student/documents/+page.svelte` (or integrate as Step in Wizard).
2. List required documents (KK, Akta, Rapor, Foto).
3. Create an `UploadField` component:
   - Drag & Drop zone.
   - File preview (name, size).
   - Progress bar (mock animation).
   - Delete/Remove button.
   - Status badge (Uploaded, Empty, Verified, Rejected).

Output:
- Document upload interface.
```

### Prompt untuk 4.4 - Payment UI (Post-Acceptance)

```text
Task: FE-4.4
Description: Create Payment UI for Accepted Students.

Requirements:
1. Create `src/routes/student/payment/+page.svelte`.
2. **Access Logic UI**: Show a "Locked" state placeholder if status is NOT "Accepted".
3. **Accepted State UI**:
   - Invoice Card: Total Amount, Due Date, Breakdown.
   - "Bayar Sekarang" Button.
   - Payment Method Selector (Virtual Account, QRIS, Retail).
   - Payment History Table.
4. Create a mock "Payment Success" page.

Output:
- Payment page with Locked vs Unlocked states.
```

---

## Phase 5: Admin Portal (UI Only)

### Prompt untuk 5.1 - Admin Dashboard Layout

```text
Task: FE-5.1
Description: Create Admin Dashboard Layout.

Requirements:
1. Create `src/routes/admin/+layout.svelte`.
2. Distinct color theme from Student Portal (e.g., darker sidebar).
3. Sidebar: Dashboard, Verifikasi, Seleksi, Keuangan, Pengaturan, Laporan.
4. Create `src/routes/admin/dashboard/+page.svelte`:
   - Stats Cards (Total Pendaftar, Menunggu Verifikasi, Diterima).
   - Recent Activities list.
   - Registration Path Chart (Placeholder).

Output:
- Admin portal layout.
- Admin dashboard overview UI.
```

### Prompt untuk 5.2 - Verification Interface

```text
Task: FE-5.2
Description: Create Document Verification UI.

Requirements:
1. Create `src/routes/admin/verification/+page.svelte`:
   - Data Table of Applicants (Name, Path, Status).
   - Filters (Pending, Verified, Rejected).
2. Create `src/routes/admin/verification/[id]/+page.svelte` (Detail View):
   - Split view: Student Data (Left) vs Document Preview (Right).
   - Action Buttons: "Verifikasi", "Minta Revisi" (with comment modal), "Tolak".
   - Document list with "Valid/Invalid" toggle for each file.

Output:
- Verification list and detail interface.
```

### Prompt untuk 5.3 - Selection & Announcement UI

```text
Task: FE-5.3
Description: Create Selection Management UI.

Requirements:
1. Create `src/routes/admin/selection/+page.svelte`.
2. Tab View:
   - **Ranking**: Table showing students ranked by score/distance (Simulated).
   - **Quota**: Progress bars showing quota usage per path.
3. Action Bar: "Run Auto-Selection", "Publish Announcement".
4. Result View: List of Accepted vs Rejected students.

Output:
- Selection management UI.
```

---

## Phase 6: Data Integration (The "Wiring")

**NOTE:** Kerjakan fase ini HANYA setelah UI di atas disetujui dan selesai.

### Prompt untuk 6.1 - Setup Firebase & API Client

```text
Task: FE-6.1
Description: Configure Firebase and Axios/Fetch wrapper.

Requirements:
1. Install `firebase`.
2. Create `src/lib/firebase.ts` and initialize app using environment variables.
3. Create `src/lib/api.ts`:
   - Setup Axios instance with Interceptor.
   - Handle ID Token attachment from Firebase Auth.
4. Create `src/lib/stores/auth.ts`:
   - Implement `user` store.
   - Handle `onAuthStateChanged` to sync Firebase user to local store.

Output:
- Firebase initialized.
- Auth store ready.
- API client configured.
```

### Prompt untuk 6.2 - Integrate Auth Flows

```text
Task: FE-6.2
Description: Connect Login and Register UI to Firebase.

Requirements:
1. Update `src/routes/(auth)/login/+page.svelte`:
   - Call `signInWithEmailAndPassword`.
   - Handle errors (show toast).
   - Redirect to Dashboard on success.
2. Update `src/routes/(auth)/register/+page.svelte`:
   - Call `createUserWithEmailAndPassword`.
   - Call Backend API to create User Profile in Postgres (via API Client).
   - Handle Tenant logic (send `school_id` to backend).
3. Implement Protected Route (redirect if not logged in).

Output:
- Functional Login & Register.
- Protected routes active.
```

### Prompt untuk 6.3 - Integrate Student Registration

```text
Task: FE-6.3
Description: Connect Registration Wizard to Backend.

Requirements:
1. Create API calls for:
   - `GET /periods/active` (Get Jalur & Quota).
   - `POST /registrations` (Submit data).
   - `POST /uploads` (Upload documents).
2. Update `src/routes/student/application/+page.svelte`:
   - Fetch real data for Step 1.
   - Submit form payload to Backend.
   - Upload files to Cloudflare R2 (via Backend presigned URL or direct).
3. Handle loading states and error messages.

Output:
- Real registration flow working.
- Data saved to database.
```

### Prompt untuk 6.4 - Integrate Admin Verification

```text
Task: FE-6.4
Description: Connect Admin Verification UI to Backend.

Requirements:
1. Create API calls:
   - `GET /registrations?status=SUBMITTED`.
   - `POST /registrations/{id}/verify`.
   - `POST /registrations/{id}/reject`.
2. Update `src/routes/admin/verification` pages.
3. Implement real-time list update (or refetch) after action.

Output:
- Admin can verify real applicants.
```
