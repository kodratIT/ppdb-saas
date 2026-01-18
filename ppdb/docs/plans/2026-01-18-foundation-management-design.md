# Design Document: Foundation Management (Manajemen Yayasan)

**Date:** 2026-01-18  
**Status:** Validated  
**Author:** opencode

## 1. Executive Summary

Fitur **Manajemen Yayasan** dirancang untuk mendukung institusi pendidikan yang memiliki beberapa unit (jenjang) di bawah satu naungan hukum (Yayasan). Sistem ini memungkinkan pengelolaan terpusat oleh satu admin, pendaftaran satu pintu untuk orang tua, namun tetap memberikan fleksibilitas konfigurasi syarat pendaftaran yang berbeda untuk setiap jenjang (TK, SD, SMP, SMA).

## 2. Goals & Success Criteria

- **Efficiency:** 1 Admin dapat mengelola seluruh unit yayasan dalam satu dashboard tanpa login-logout.
- **Branding:** Orang tua mengakses melalui satu link utama yayasan.
- **Flexibility:** Syarat pendaftaran (custom fields) dan biaya dapat dibedakan per unit.
- **Accountability:** Pembayaran masuk ke satu rekening pusat namun memiliki label (tagging) per unit untuk pelaporan.

## 3. Architecture: "Super Tenant" Model

Sistem akan beralih dari model _Single School Tenant_ ke _Foundation Tenant_ dengan sub-unit.

### 3.1 Database Schema Changes (Proposed)

- **Table `tenants`:** Mewakili level Yayasan.
- **Table `units` (New):**
  - `id`: UUID (Primary Key)
  - `tenant_id`: UUID (FK to tenants)
  - `name`: Text (e.g., "SD Mutiara")
  - `level`: Enum ('TK', 'SD', 'SMP', 'SMA', 'SMK', 'Universitas')
  - `config`: JSONB (Logo unit, Akreditasi, Deskripsi khusus)
- **Table `admission_paths`:** Menambahkan kolom `unit_id` (FK to units).
- **Table `applications`:** Menambahkan kolom `unit_id` (FK to units) untuk klasifikasi data pendaftar.
- **Table `invoices`:** Menambahkan kolom `unit_id` untuk penandaan sumber dana.

## 4. User Experience (UX) Flow

### 4.1 Pendaftar (Single Entry)

1. **Entry:** Orang tua mengunjungi `yayasan-abc.ppdb.id`.
2. **Selection:** Halaman landing menampilkan kartu pilihan unit (TK, SD, SMP, SMA).
3. **Context:** Setelah unit dipilih, sistem memuat `unit_id` ke dalam session/state pendaftaran.
4. **Dynamic Wizard:**
   - Step 1 (Jalur): Hanya menampilkan jalur milik unit terpilih.
   - Step 2 (Form): Menampilkan custom fields yang relevan dengan jenjang tersebut.
   - Step 3 (Review): Konfirmasi detail unit sekolah tujuan.

### 4.2 Admin (Unified Dashboard)

- **Global Dashboard:** Statistik agregat seluruh yayasan di halaman utama.
- **Filtered Verification:** Satu tabel verifikasi besar dengan filter cepat berdasarkan unit (Dropdown: "Semua Unit", "TK", "SD", dst).
- **Tagged Finance:** Laporan pendapatan yang dapat dikelompokkan per unit meskipun uang masuk ke satu rekening VA/QRIS.

## 5. Technical Implementation Notes

- **Subdomain Routing:** Tetap menggunakan subdomain yayasan. Routing internal menggunakan parameter atau state manager (Svelte Store) untuk menjaga konteks unit.
- **Backward Compatibility:** Pastikan sekolah yang tidak memiliki yayasan tetap berfungsi sebagai "Single Unit" secara default.
- **RBAC:** Menambahkan role `foundation_admin` yang memiliki akses ke seluruh unit di bawah tenant tersebut.

## 6. Security & Isolation

- **RLS (Row Level Security):** Tetap berbasis `tenant_id` (Yayasan) untuk isolasi antar yayasan yang berbeda.
- **Unit Isolation:** Di dalam satu yayasan, data bersifat shared untuk admin yayasan, namun dipisahkan secara visual dan logis melalui `unit_id`.
