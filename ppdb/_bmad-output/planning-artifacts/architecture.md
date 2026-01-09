---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
workflow_completed: true
inputDocuments:
  - '/Users/kodrat/Public/Source/PPDB-SAAS-V2/ppdb/_bmad-output/planning-artifacts/prd.md'
  - '/Users/kodrat/Public/Source/PPDB-SAAS-V2/ppdb/_bmad-output/planning-artifacts/product-brief-ppdb-2025-12-30.md'
  - '/Users/kodrat/Public/Source/PPDB-SAAS-V2/ppdb/_bmad-output/planning-artifacts/research/market-ppdb-saas-indonesia-research-2025-12-30.md'
  - '/Users/kodrat/Public/Source/PPDB-SAAS-V2/ppdb/_bmad-output/analysis/brainstorming-session-2025-12-30.md'
workflowType: 'architecture'
project_name: 'ppdb'
user_name: 'Kodrat'
date: '2025-12-30T15:05:14+07:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Sistem mencakup manajemen multi-tenant skala besar dengan 31 fungsionalitas utama. Arsitektur harus mengakomodasi workflow pendaftaran yang dapat dicicil (data persistence), sistem persetujuan verifikasi dokumen side-by-side, dan otomatisasi komunikasi via WhatsApp.

**Non-Functional Requirements:**
NFR mendorong arsitektur ke arah serverless-first (Cloudflare Workers) untuk performa Edge. Keamanan adalah prioritas utama dengan enkripsi berlapis sesuai UU PDP dan ketersediaan 99.9% yang menuntut sistem yang sangat resilient. Target beban: minimal 500 pengguna konkuren per tenant secara serentak.

**Scale & Complexity:**

- Primary domain: SaaS B2B / EdTech / FinTech
- Complexity level: High (Enterprise Grade)
- Estimated architectural components: 12+ (Termasuk: Edge Subdomain Resolver, HTTP-based DB Driver, Encryption Engine, Notification Hub, Chaos Integration Test Suite).

### Technical Architecture Strategy (Standar Emas)

- **Edge Routing & Metadata:** Menggunakan Cloudflare KV/Durable Objects untuk isolasi dan resolusi subdomain instan (sub-10ms) tanpa membebani database utama.
- **Connection-less Database Access:** Implementasi Neon Serverless Driver via HTTP untuk menangani konkurensi tinggi tanpa limitasi connection pooling tradisional.
- **Security-First Encription:** Mekanisme Field-Level Encryption (AES-256) untuk data sensitif (NIK/KK) demi kepatuhan UU PDP yang sangat ketat.
- **UX Efficiency:** Strategi "The Slim Bundle" dengan Edge Caching untuk memastikan akses pendaftar di jaringan Edge/3G tetap lancar.

### Technical Constraints & Dependencies

- Backend: Cloudflare Workers (Runtime terbatas, Serverless).
- Database: Neon PostgreSQL (HTTP Driver, PITR support).
- Frontend: SvelteKit (Multi-tenant SSR + Optimistic UI).
- Integrasi: WhatsApp API Gateway, Payment Gateway (Xendit/Midtrans).

### Cross-Cutting Concerns Identified

- **Identity & Access Management:** RBAC granular dengan integrasi audit logging.
- **Tenant Isolation:** Logical separation pada level database didukung metadata routing di Edge.
- **Atomicity under Pressure:** Penanganan Race Condition pada kuota pendaftaran selama lonjakan trafik.

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack Web Application** berbasis arsitektur **Serverless Edge** menggunakan SvelteKit dan Cloudflare Ecosystem.

### Starter Options Considered

1. **SvelteKit Standard + Cloudflare Adapter:** Stabil, namun membutuhkan banyak konfigurasi manual untuk database dan auth.
2. **Specialized Boilerplates:** Mengurangi waktu setup, namun seringkali membawa dependensi yang tidak perlu atau opini yang kaku.
3. **Hybrid SaaS Foundation (SvelteKit + Drizzle + Lucia + KV):** Memberikan keseimbangan terbaik antara keamanan database dan kecepatan akses Edge.

### Selected Starter: Hybrid SaaS Foundation (SvelteKit + Drizzle + Lucia)

**Rationale for Selection:**
Memadukan **Lucia Auth** (sebagai _source of truth_ sesi di database Neon) dengan **Cloudflare KV** (sebagai _caching layer_ performa tinggi) untuk mencapai keamanan standar enterprise namun tetap mempertahankan latensi sub-detik di Edge. Penggunaan **Drizzle ORM** memastikan tipe data yang ketat dan efisiensi query lewat koneksi HTTP Neon.

**Initialization Command:**

```bash
# Inisialisasi SvelteKit dengan TypeScript dan Tailwind
npx -y create-svelte@latest .

# Instalasi dependensi inti
npm install drizzle-orm @neondatabase/serverless lucia @lucia-auth/adapter-drizzle zod
npm install -D drizzle-kit
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** TypeScript 5.x pada Cloudflare Workers Runtime.
- **Styling Solution:** Tailwind CSS untuk efisiensi desain responsif.
- **Data Layer:** Drizzle ORM dengan skema yang diatur untuk mendukung Isolasi Tenant.
- **Validation:** Zod sebagai standar validasi data lintas layer (client & server).
- **Authentication Caching:** Implementasi middleware untuk sinkronisasi sesi database ke Cloudflare KV guna optimasi performa _read-heavy_.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- **Tenant Isolation:** Row-Level Security (RLS) pada PostgreSQL (Neon). Memberikan isolasi data yang tak tertembus di level database, mencegah kebocoran data antar sekolah secara sistemik.
- **Database Driver:** Neon Serverless Driver (v1.0.0+) via HTTP. Dioptimalkan sepenuhnya untuk konkurensi tinggi di Cloudflare Workers.
- **Authentication:** Custom Auth Logic (berbasis panduan Lucia v3) dengan session storage di Neon + Caching di Cloudflare KV.

**Important Decisions (Shape Architecture):**

- **Data Encryption:** Field-level encryption (AES-256-GCM) menggunakan Web Crypto API. NIK dan KK dienkripsi sebelum masuk ke database.
- **ORM:** Drizzle ORM (v0.45+) untuk manajemen skema dan query type-safe.

### Data Architecture

- **Database:** Neon PostgreSQL (Serverless).
- **Isolation Pattern:** Postgres Row-Level Security (RLS). Setiap kueri otomatis difilter berdasarkan `tenant_id` dari session pendaftar/admin.
- **Caching Strategy:** Middleware-based Session Caching pada Cloudflare KV untuk mengurangi beban kueri session ke database utama.

### Authentication & Security

- **Modern Auth Implementation:** Custom session management mengikuti prinsip Lucia, menjamin kontrol penuh atas siklus hidup sesi SaaS.
- **Secret Management:** Kunci enkripsi dan API Keys disimpan secara aman di Cloudflare Secrets (Environment Variables).
- **Validation Strategy:** Zod (v3.23+) digunakan secara ketat untuk sinkronisasi validasi pendaftar antara frontend (UX) dan backend (Domain).

### API & Communication Patterns

- **Primary Pattern:** SvelteKit Form Actions & Load Functions. Mengurangi kompleksitas API eksternal dan meningkatkan performa SSR.
- **Integration Endpoints:** REST API khusus untuk integrasi vendor logistik dan ekspor Dapodik di masa depan.

### Infrastructure & Deployment

- **Platform:** Cloudflare Pages & Workers.
- **CI/CD:** GitHub Actions terintegrasi dengan Wrangler CLI untuk deployment otomatis ke lingkungan Preview dan Production.
- **Monitoring:** Cloudflare Observatory & Telemetry log ke Cloudflare D1/R2 untuk audit data sensitif.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

Telah diidentifikasi 5 kategori pola utama untuk memastikan konsistensi pengembangan lintas developer dan asisten AI, dengan pendekatan "Pragmatic Domain" untuk menyeimbangkan kualitas kode dan kecepatan rilis.

### Naming Patterns

- **Database:** Tabel menggunakan `snake_case` dan bentuk jamak/plural (contoh: `students`, `enrollment_paths`). Kolom menggunakan `snake_case`.
- **API/Routes:** URL menggunakan `kebab-case` (contoh: `/api/v1/auth/verify-otp`).
- **Code:** Komponen Svelte menggunakan `PascalCase` (contoh: `RegistrationForm.svelte`). Fungsi dan variabel menggunakan `camelCase`.

### Structure Patterns (Pragmatic Domain Approach)

- **Shared UI Components:** Disimpan di `$lib/components/ui/` (base components) dan `$lib/components/shared/` (feature shared).
- **Core Domain Logic:** Logika bisnis kompleks (kalkulasi ranking, skema pembayaran, aturan kuota) wajib diisolasi di `$lib/server/domain/`.
- **Lightweight Actions:** CRUD sederhana diizinkan langsung di dalam SvelteKit Form Actions untuk efisiensi pengembangan.

### Format Patterns

- **API Response:** Format standar `{ success: boolean, data?: any, error?: string }`.
- **Data Exchange:** Menggunakan **ISO 8601 UTC** untuk semua pertukaran data tanggal dan waktu.
- **Validation:** Skema **Zod** didefinisikan secara terpusat di `$lib/schema/` untuk validasi sisi client dan server secara sinkron.

### Process & Safety Rules (Amelia's Rules)

- **Mutation Safety:** Dilarang keras melakukan mutasi data (create/update/delete) di dalam fungsi `load`. Seluruh mutasi wajib melalui SvelteKit **Form Actions**.
- **Error Handling:** Menggunakan `fail()` untuk kesalahan input pengguna dan `error()` murni untuk isu kegagalan sistemik (500).

### Enforcement Guidelines

**Seluruh agen AI dan pengembang wajib:**

1. Menggunakan skema Zod sebelum memproses data input dari pendaftar.
2. Memastikan setiap kueri database mematuhi batasan **tenant_id** (Isolasi Tenant).
3. Mendokumentasikan logika domain yang kompleks di dalam folder domain terkait.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
ppdb/
├── .github/workflows/          # CI/CD (GitHub Actions)
├── drizzle/                    # Database migrations & seeds
│   └── migrations/             # SQL files untuk Neon RLS
├── src/
│   ├── app.d.ts                # TypeScript Global Definitions
│   ├── hooks.server.ts         # Middleware (Auth & Tenant Orchestrator)
│   ├── lib/
│   │   ├── components/         # Svelte Components
│   │   │   ├── ui/             # Shadcn-like base components (PascalCase)
│   │   │   └── shared/         # Multi-tenant context components
│   │   ├── server/
│   │   │   ├── db/             # Drizzle client & schema exports
│   │   │   ├── domain/         # COMPLEX LOGIC (Ranking, Payment rules)
│   │   │   ├── tenant/         # Tenant resolution & context logic (Winston's Rule)
│   │   │   └── infra/          # External APIs (WhatsApp, Payment Gateway Proxy)
│   │   ├── schema/             # Shared Zod Schemas (Single source of truth)
│   │   └── utils/              # Helper functions (Currency, Date, Crypto)
│   ├── routes/                 # SvelteKit App Router
│   │   ├── (admin)/            # Admin Sekolah Group (Dashboard)
│   │   ├── (pendaftar)/        # Pendaftaran Group
│   │   │   └── register/
│   │   │       └── _components/ # Local route components (Amelia's Rule)
│   │   ├── (super-admin)/      # SaaS Owner Console
│   │   └── api/                # Internal & Vendor Endpoints
│   └── static/                 # Static assets
├── tests/                      # Testing Suite
│   ├── e2e/                    # Playwright (User Journeys)
│   └── unit/                   # Vitest (Domain Logic)
├── wrangler.jsonc              # Cloudflare Configuration
└── package.json
```

### Architectural Boundaries

**Middleware Gateway:**
`hooks.server.ts` bertindak sebagai _orchestrator_. Logika deteksi tenant didelegasikan ke `$lib/server/tenant/` untuk menjaga kode tetap modular.

**Infrastructure Abstraction:**
Seluruh komunikasi pihak ketiga (Xendit, WhatsApp API) wajib melalui `$lib/server/infra/`. Ini menjamin sistem tetap berjalan meskipun vendor diganti di masa depan.

**Component Locality:**
Komponen yang hanya relevan untuk satu halaman rute tertentu diperbolehkan berada di dalam folder `_components/` lokal pada rute tersebut untuk menjaga kebersihan folder `$lib/components/`.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**

- **Tenant & Registration Config:** `src/lib/server/tenant/` & `src/routes/(admin)/settings/`
- **Dynamic Form Handling:** `src/lib/schema/` & `src/routes/(pendaftar)/register/`
- **Ranking & Selection:** `src/lib/server/domain/ranking/`
- **Payment & Finance:** `src/lib/server/domain/finance/` & `src/lib/server/infra/payment/`

**Cross-Cutting Concerns:**

- **Authentication:** `src/lib/server/auth.ts` & `src/hooks.server.ts`
- **Tenant Isolation:** `src/lib/server/db/schema.ts` (RLS definitions)
- **Data Privacy:** `src/lib/utils/crypto.ts` & `src/lib/schema/` (Encryption triggers)

## Architecture Validation Results

### Coherence Validation ✅

- **Decision Compatibility:** SvelteKit + Cloudflare Workers + Neon (HTTP) terbukti kompatibel untuk latensi rendah. Pilihan Drizzle ORM memastikan integrasi tipe data yang sinkron dari database hingga UI.
- **Pattern Consistency:** Aturan penamaan dan struktur folder mendukung keputusan teknis (RLS, Caching).
- **Structure Alignment:** Folder `src/lib/server/tenant/` dan `_components/` lokal memperkuat batasan arsitektur (boundaries) yang bersih.

### Requirements Coverage Validation ✅

- **Multi-tenancy:** Terjamin melalui Postgres RLS dan arsitektur subdomain resolver di level Edge.
- **Data Privacy (UU PDP):** Terpenuhi melalui Field-Level Encryption (AES-256) menggunakan Web Crypto API pada kolom sensitif.
- **High Concurrency:** Didukung oleh Neon HTTP Driver dan Caching Layer pada Cloudflare KV untuk penanganan 500+ pendaftar simultan.
- **Multi-channel OTP:** Mendukung pengiriman kode melalui WhatsApp dan Email dengan sistem fallback otomatis sesuai preferensi tenant.

### Implementation Readiness Validation ✅

- **Decision Completeness:** Seluruh keputusan kritis (Auth, DB, Encryption, Comms) telah didokumentasikan dengan rincian teknis.
- **Structure Completeness:** Peta direktori sudah mencakup folder infrastruktur komunikasi yang terisolasi.
- **Pattern Completeness:** Aturan 'Pragmatic Domain' dan 'Mutation Safety' memberikan panduan jelas bagi AI agents.

### Gap Analysis Results

- **Penajaman (Penting):** Implementasi _Rate Limiting_ lintas kanal untuk OTP (mencegah penyalahgunaan biaya WA) wajib dilakukan di level middleware menggunakan Cloudflare KV dengan TTL singkat.
- **Penyempurnaan (Opsional):** Integrasi `drizzle-kit` dalam CI/CD untuk manajemen migrasi RLS secara otomatis.

### Architecture Completeness Checklist

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented with versions
- [x] Multi-channel OTP strategy defined
- [x] Naming & Structure patterns established
- [x] Complete directory structure defined
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION  
**Confidence Level:** HIGH

**Key Strengths:**

- Isolasi tenant level database (RLS).
- Performa Edge-first dengan caching hibrida.
- Fleksibilitas vendor (Swap-ability) pada modul komunikasi dan pembayaran.

### Implementation Handoff

**AI Agent Guidelines:**

- Gunakan skema Zod dari `$lib/schema/` untuk semua validasi.
- Pastikan kueri Drizzle selalu menyertakan filter `tenant_id` (diperkuat oleh RLS).
- Simpan logika hitung ranking atau keuangan di `$lib/server/domain/`.

**First Implementation Priority:**

```bash
npx -y create-svelte@latest .
npm install drizzle-orm @neondatabase/serverless zod
```
