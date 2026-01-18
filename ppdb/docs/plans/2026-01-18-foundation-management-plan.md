# Foundation Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mengubah struktur tenant menjadi model Yayasan yang mendukung banyak Unit (TK/SD/SMP/SMA) dengan pendaftaran satu pintu dan manajemen terpusat.

**Architecture:** Menambahkan tabel `units` sebagai sub-entitas dari `tenants`. Memigrasikan relasi `admission_paths` dan `applications` agar merujuk ke `unit_id` melalui foreign key baru, dengan tetap menjaga kompatibilitas ke belakang (backwards compatibility).

**Tech Stack:** SvelteKit 5, Drizzle ORM, PostgreSQL, Tailwind CSS, Shadcn/UI.

---

### Task 1: Database Schema Migration - Unit Table

**Files:**

- Modify: `ppdb/src/lib/server/db/schema.ts`

**Step 1: Update Drizzle Schema**
Tambahkan definisi tabel `units` dan perbarui relasi pada tabel `tenants`, `admission_paths`, dan `applications`.

**Step 2: Generate Migration**
Run: `npm run db:generate`

**Step 3: Apply Migration**
Run: `npm run db:push`

**Step 4: Commit**

```bash
git add src/lib/server/db/schema.ts
git commit -m "db: add units table and update relations for foundation support"
```

---

### Task 2: Domain Logic - Unit Creation & Default Unit for Existing Schools

**Files:**

- Modify: `ppdb/src/lib/server/domain/admin/index.ts`
- Create: `ppdb/src/lib/server/domain/admin/units.ts` (if needed)

**Step 1: Update createTenant function**
Modifikasi `createTenant` di `src/lib/server/domain/admin/index.ts` untuk menyisipkan data ke tabel `units` secara otomatis.

**Step 2: Commit**

```bash
git add src/lib/server/domain/admin/index.ts
git commit -m "feat(domain): auto-create default unit during tenant creation"
```

---

### Task 3: UI - Landing Page Unit Selection

**Files:**

- Create: `ppdb/src/routes/(public)/[slug]/+page.svelte`

**Step 1: Implement Unit Selection UI**
Buat halaman yang menampilkan daftar unit yang tersedia berdasarkan `tenant_id`.

**Step 2: Commit**

```bash
git add src/routes/(public)/[slug]/+page.svelte
git commit -m "feat(ui): implement public unit selection landing page"
```

---

### Task 4: Registration Wizard - Unit Context Awareness

**Files:**

- Modify: `ppdb/src/routes/(public)/[slug]/register/+page.svelte`

**Step 1: Pass unit_id to Wizard**
Ambil `unit_id` dari URL query params dan simpan ke `formData`.

**Step 2: Filter Admission Paths by Unit**
Pastikan pilihan jalur pendaftaran hanya menampilkan jalur yang memiliki `unit_id` yang sesuai.

**Step 3: Commit**

```bash
git add src/routes/(public)/[slug]/register/+page.svelte
git commit -m "feat(register): make wizard aware of selected unit context"
```

---

### Task 5: Admin Dashboard - Multi-Unit Reporting

**Files:**

- Modify: `ppdb/src/lib/server/domain/admin/index.ts`

**Step 1: Update Dashboard Stats Logic**
Ubah query agregasi untuk mendukung pengelompokan (grouping) per unit.

**Step 2: Commit**

```bash
git add src/lib/server/domain/admin/index.ts
git commit -m "feat(admin): support multi-unit stats in dashboard"
```
