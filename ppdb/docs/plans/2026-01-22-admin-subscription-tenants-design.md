# Admin Subscription Tenants Rebuild (Incremental)

Tanggal: 2026-01-22
Status: Draft

## Ringkasan

Dokumen ini mendesain ulang implementasi (incremental rebuild) untuk manajemen tenant subscription di admin, dengan mempertahankan pola UI dan domain yang sudah ada. Fokus pada konsistensi alur data, aksi admin (update/cancel/extend), dan validasi yang jelas tanpa perubahan schema atau desain visual.

## Tujuan

- Menyelaraskan alur list dan detail tenant untuk manajemen subscription.
- Menjamin aksi update/cancel/extend bekerja konsisten via server actions.
- Memperbaiki kejelasan validasi input dan feedback UI.

## Non-Goals

- Tidak mengubah schema database atau menambah tabel baru.
- Tidak melakukan redesign UI atau mengganti komponen dasar.
- Tidak menambah dependency baru.

## Arsitektur & Alur Data

- List page: `src/routes/admin/subscription/tenants/+page.server.ts`
  - Load: `getTenants({ page, limit, search, status, packageId })` + paket aktif.
  - Query params: `search`, `status`, `packageId`, `page`.
- Detail page: `src/routes/admin/subscription/tenants/[tenantId]/+page.server.ts`
  - Load: `getTenantDetails(tenantId)` + paket aktif.
- Domain: `src/lib/server/domain/admin/tenants.ts`
  - `getTenants`, `getTenantDetails`, `cancelSubscription`, `extendTrial`.
- Form actions (SvelteKit): `updateSubscription`, `cancelSubscription`, `extendTrial`.
- UI memakai `use:enhance` + toast untuk feedback success/fail.

## UI/UX

### List Tenant

- Tetap gunakan layout dan komponen yang ada (Table, Select, Dialog).
- Filter: search, status, package.
- Aksi di list tetap fokus pada “Manage Subscription” dan “View Detail”.
- Aksi cancel/extend diarahkan ke detail page untuk mengurangi risiko salah konteks.

### Detail Tenant

- Header menampilkan nama/slug dan tombol aksi:
  - Extend Trial: hanya saat status trial.
  - Cancel Subscription: hanya saat status bukan cancelled.
  - Manage Subscription: selalu tersedia.
- Panel ringkasan subscription dan usage tetap.
- Tabel invoice history tetap.

## Aksi & Validasi

### updateSubscription

- Wajib: tenantId, packageId, billingCycle, status, currentPeriodEnd.
- currentPeriodEnd di-parse ke Date.

### cancelSubscription

- Wajib: tenantId.
- Set status `cancelled`, autoRenew `false`.

### extendTrial

- Wajib: tenantId, days.
- Days valid: 7, 14, 30 (UI radio).

## Error Handling

- Server action gunakan `fail(400|500)`.
- UI menampilkan toast error generik (tanpa detail internal).
- Detail page menggunakan `error(404)` jika tenant tidak ditemukan.

## Testing & Verifikasi

- Jalankan perintah verifikasi yang tersedia di repo (contoh: `npm run check` atau `npm run build`).
- Verifikasi manual:
  - Filter + pagination bekerja.
  - Manage subscription update sukses.
  - Extend trial menambah tanggal.
  - Cancel subscription mengubah status dan autoRenew.

## Catatan Implementasi

- Pertahankan i18n key yang sudah ada.
- Jangan menambah dependency baru.
- Hindari perubahan visual; hanya konsistensi perilaku dan validasi.
