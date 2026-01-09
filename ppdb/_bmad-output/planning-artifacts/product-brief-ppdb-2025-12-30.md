---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  [
    '/_bmad-output/analysis/brainstorming-session-2025-12-30.md',
    '/_bmad-output/planning-artifacts/research/market-ppdb-saas-indonesia-research-2025-12-30.md'
  ]
date: '2025-12-30'
author: 'Kodrat'
workflow_completed: true
---

# Product Brief: ppdb

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**ppdb** adalah platform _multi-tenant Admission Management_ yang mengusung prinsip **"Simplicity-First"**. Dirancang untuk menghilangkan hambatan digital bagi keluarga di Indonesia, platform ini menggabungkan desain antarmuka yang sangat intuitif dengan arsitektur _Edge Computing_ (Cloudflare + Neon) yang super cepat. Tujuannya adalah memastikan setiap sekolah swasta dapat memberikan pengalaman pendaftaran yang bebas stres, meningkatkan kepercayaan orang tua, dan memaksimalkan jumlah siswa baru dengan beban administrasi minimum.

---

## Core Vision

### Problem Statement

Proses pendaftaran sekolah di Indonesia seringkali menjadi pengalaman yang menegangkan dan membingungkan bagi orang tua. Formulir digital yang rumit, instruksi yang tidak jelas, dan sistem yang sering _error/slow_ menciptakan "tembok digital" yang menyebabkan orang tua mengurungkan niat mendaftar. Dari sisi sekolah, antarmuka administrasi yang kaku membuat verifikasi data menjadi pekerjaan yang membosankan dan rentan kesalahan.

### Problem Impact

- **Applicant Loss:** Calon siswa potensial hilang di tengah jalan karena frustrasi dengan sistem.
- **Support Overhead:** Sekolah dibanjiri pertanyaan teknis dari orang tua yang bingung cara mendaftar.
- **Data Pollution:** User yang bingung cenderung mengisi data asal-asalan, menambah beban koreksi manual admin.

### Why Existing Solutions Fall Short

Kebanyakan sistem saat ini dibuat oleh engineer untuk engineer, bukan untuk pengguna akhir. UI yang kaku, penggunaan bahasa teknis/administratif yang berat, dan tidak adanya panduan langkah-demi-langkah membuat pendaftaran terasa seperti tugas birokrasi yang membebani. Arsitektur lama juga gagal memberikan respon instan yang diharapkan pengguna mobile modern.

### Proposed Solution

Platform PPDB yang **terpandu (guided)** dan **mobile-optimized**, di mana teknologi bekerja secara "tak terlihat" untuk memudahkan pengguna. Flow pendaftaran dirancang se-linear mungkin, dilengkapi dengan otomatisasi validasi dan notifikasi WhatsApp untuk setiap langkah, sehingga pendaftaran terasa semudah berkirim pesan di media sosial.

### Key Differentiators

- **Frictionless UI/UX:** Alur pendaftaran yang dirancang secara psikologis untuk mengurangi kecemasan dan kebingungan pengguna (Step-by-step wizard).
- **Invisible Tech Performance:** Menggunakan global edge network (Cloudflare Workers) untuk respon instan sub-detik tanpa loading yang terlihat.
- **Guided Automation:** Fitur notifikasi WA otomatis yang bersifat membantu (nurturing), memastikan orang tua selalu tahu apa langkah selanjutnya.

## Target Users

### Primary Users

#### 1. Ibu Maya (The Apprehensive Parent)

- **Role:** Parent of a prospective student (TK/SD/SMP/SMA).
- **Context:** Age 25-45, heavily relies on her smartphone (WA, Instagram, Facebook). Has limited time and an average to high level of digital literacy, but is impatient with complex interfaces.
- **Motivations:** Wants the best for her child; values speed, transparency, and a sense of "prestige" from the school.
- **Problem Experience:** Finds traditional forms confusing and fears missing deadlines or making mistakes that could jeopardize her child's admission.
- **Success Vision:** A "guided" registration process that feels as easy as chatting, with instant confirmation via WhatsApp.

#### 2. Pak Budi (The Overwhelmed School Admin)

- **Role:** Admission Committee Member / School Admin.
- **Context:** Age 30-50, works in the school office, burdened by hundreds of manual document verifications.
- **Motivations:** Accuracy, efficiency, and reducing the volume of repetitive phone calls/messages from parents.
- **Problem Experience:** Data entry errors, "data fatigue" from checking blurry document uploads, and manually calculating quotas and rankings.
- **Success Vision:** A clean, high-performance dashboard with automated data validation and "one-click" ranking reports.

### Secondary Users

#### 1. Ketua Yayasan (The Strategic Decision Maker)

- **Role:** Foundation Head / Director of Education.
- **Context:** Age 50+, results-oriented, focuses on the "Big Picture" and school growth.
- **Motivations:** Achieving enrollment targets, financial health of the foundation, and maintaining a tech-forward reputation.
- **Success Vision:** A mobile-friendly "CEO Dashboard" showing real-time conversion rates and registration revenue across all school units.

#### 2. SaaS Super Admin (The Platform Owner/Programmer)

- **Role:** System Developer / Platform Administrator.
- **Context:** The programmer or owner of the PPDB SaaS platform.
- **Motivations:** Platform stability, scalability, multi-tenant integrity, and recurring revenue from school subscriptions.
- **Success Vision:** A global management portal where they can spin up new tenants (Yayasan) in minutes, monitor global system health, and manage billing for all participating schools.

### User Journey (Persona: Ibu Maya)

1. **Discovery:** Sees a school promotion on social media or receives a link in a WhatsApp group.
2. **Onboarding:** Clicks the link, lands on a fast-loading page, and follows a step-by-step "Wizard" that guides her through basic data entry.
3. **Core Interaction:** Uses her phone camera to photograph documents; the system auto-compresses and uploads them instantly.
4. **The "Aha!" Moment:** Receives an instant WhatsApp notification with a payment Virtual Account (VA) link immediately after filling out the form.
5. **Success:** Gets a digital "Kartu Pendaftaran" via WA once the payment is verified by the system automatically.

## Success Metrics

Prinsip utama keberhasilan **ppdb** adalah meminimalkan waktu tunggu dan hambatan administratif bagi seluruh pemangku kepentingan, mendorong kepuasan maksimal melalui kecepatan dan efisiensi.

### Business Objectives

- **Extreme Operational Efficiency:** Mengurangi waktu pemrosesan data pendaftaran oleh staf sekolah hingga 70% melalui otomatisasi dan antarmuka terintegrasi.
- **Market Leadership in Performance:** Memposisikan diri sebagai solusi PPDB tercepat dan paling reliabel di pasar Indonesia.
- **Improved Cash Flow Velocity:** Mempersingkat waktu dari minat awal hingga penyelesaian pembayaran pendaftaran untuk mendukung stabilitas keuangan sekolah.

### Key Performance Indicators

- **Registration Completion Time (RCT):** Target < 8 menit bagi orang tua pendaftar untuk menyelesaikan seluruh proses dari awal hingga mendapatkan nomor pendaftaran.
- **Notification Lead Time (NLT):** Target < 1 menit untuk pengiriman notifikasi WhatsApp setelah status pendaftaran atau pembayaran berubah.
- **Admin Verification Speed (AVS):** Target < 2 menit per siswa untuk proses verifikasi dokumen tingkat admin melalui dashboard yang telah dioptimasi.
- **Edge Response Latency:** Target < 200ms untuk semua interaksi API di sisi frontend melalui pemanfaatan maksimal Cloudflare Edge.

## Full Project Scope

Sesuai arahan strategis, proyek ini akan dikembangkan sebagai platform PPDB komprehensif (Full System) untuk memenuhi seluruh kebutuhan operasional Yayasan Pendidikan di Indonesia tanpa batasan MVP.

### Core Features

- **Advanced Multi-tenant Architecture:** Manajemen terpusat untuk Yayasan dengan isolasi data yang kuat antar unit sekolah (TK, SD, SMP, SMA).
- **End-to-End Registration Wizard:** Antarmuka pendaftaran terpandu dengan validasi real-time dan manajemen dokumen cerdas.
- **Hybrid Payment Engine:** Fleksibilitas metode pembayaran bagi siswa; mendukung otomatisasi via payment gateway (VA/QRIS) maupun pembayaran manual langsung ke sekolah dengan verifikasi admin.
- **SaaS Billing & Subscription Management:** Sistem penagihan bagi Yayasan/Sekolah untuk penggunaan platform, mendukung model biaya per pendaftaran atau langganan tahunan melalui portal Super Admin.
- **Strategic Admin & Executive Dashboard:** Pelaporan real-time, ekspor data, dan analitik konversi pendaftaran untuk pengambilan keputusan tingkat Yayasan.

### Implementation Boundaries

Seluruh fitur inti yang disebutkan di atas akan diimplementasikan dalam satu siklus pengembangan utama untuk memastikan kesiapan pasar yang maksimal.

### Success Criteria (Full Launch)

- **Platform Reliability:** Sistem sanggup menangani pendaftaran serentak tanpa degradasi performa (High-concurrency tested).
- **User Satisfaction:** Rata-rata waktu pendaftaran orang tua tetap di bawah 8 menit meskipun dengan alur data yang lengkap.
- **Financial Accuracy:** 100% akurasi dalam pencatatan pembayaran dan alokasi kuota siswa.

### Future Vision

- **LMS/Academic Integration:** Integrasi tahap lanjut untuk migrasi data siswa baru ke sistem akademik sekolah.
- **Advanced Predictive Analytics:** Pemanfaatan data pendaftaran untuk memprediksi tren minat sekolah di masa mendatang.
- **Government Data Sync:** Integrasi API dengan sistem Dapodik/Kemdikbud jika tersedia akses secara legal.

## Advanced Enterprise Features

Untuk memastikan posisi pasar sebagai pemimpin teknologi, proyek ini menyertakan fitur tingkat tinggi yang mendukung operasional skala besar dan profesionalisme yayasan.

### 1. Robust RBAC & Security

- **Multi-tenant Level 0 Admin (SaaS Super Admin):** Hak akses tertinggi untuk mengelola platform secara keseluruhan, termasuk manajemen tenant (Yayasan), monitoring kesehatan sistem global, dan konfigurasi master provider (Payment/WA).
- **Granular Permissions (Tenant Level):** Pemisahan hak akses antara Yayasan (Owner), Sekolah (Principal), Panitia (Editor), dan Finance (Viewer).
- **Full Audit Trail:** Log aktivitas sistem yang mencatat setiap perubahan data sensitif oleh staf sekolah untuk menjamin integritas seleksi.
- **Secure Tenant Routing:** Isolasi data aman berbasis subdomain yang memastikan privasi antar unit sekolah tetap terjaga.

### 2. Selection & Exam Infrastructure

- **Lightweight Online Exam (CBT):** Modul tes seleksi daring yang dioptimalkan untuk perangkat mobile dengan latensi rendah.
- **Automated Weighing & Ranking:** Mesin seleksi otomatis yang menghitung skor akhir berdasarkan bobot kustom (Tes, Prestasi, Afirmasi).
- **Dynamic Waiting List Management:** Otomatisasi promosi pendaftar dari daftar tunggu (waiting list) ketika tersedia slot kosong, lengkap dengan notifikasi WA instan.

### 3. Operational & Logistics Integration

- **Digital Enrollment Workflow:** Alur daftar ulang digital yang otomatis aktif bagi pendaftar yang dinyatakan lulus seleksi.
- **Logistics Data Collection:** Modul pengumpulan data kebutuhan seragam, buku, dan atribut sekolah lainnya saat proses finalisasi pendaftaran.
- **Smart Lead Recovery:** Sistem pelacakan pendaftar yang "macet" (incomplete) dengan pengingat WhatsApp proaktif untuk meningkatkan konversi.

### 4. Data & Compliance

- **Foundation-level Reporting:** Laporan agregat untuk pengurus Yayasan guna memantau kinerja penerimaan di seluruh unit sekolah.
- **High-Density Document Storage:** Sistem pengarsipan dokumen persyaratan (KK, Akta, Rapor) yang efisien dan mudah diunduh untuk kebutuhan verifikasi.

### 5. SaaS Billing & Hybrid Payments

- **B2B Billing Portal:** Dashboard khusus Super Admin untuk mengatur invoice langganan ke tiap Yayasan, memantau status pembayaran SaaS, dan manajemen limit pendaftar.
- **Manual Payment Verification Flow:** Antarmuka khusus untuk admin sekolah untuk mengunggah bukti bayar (jika siswa bayar cash di sekolah) dan memvalidasi pendaftaran secara manual tanpa melewati payment gateway online.
- **Online Payment Automation:** Integrasi Midtrans/Xendit untuk rekonsiliasi instan bagi siswa yang memilih metode pembayaran digital.
- **Refund & Withdrawal Management:** Fitur manajemen pembatalan pendaftaran (cabut berkas) yang mencakup alur pengajuan oleh orang tua, persetujuan admin sekolah, pelacakan pengembalian dana, serta pengembalian kuota siswa secara otomatis ke sistem seleksi.

## Adaptive Payment Architectures

Untuk mengakomodasi berbagai strategi pemasaran dan kebijakan operasional sekolah yang berbeda, platform **ppdb** menerapkan arsitektur aliran pembayaran yang sangat fleksibel.

### 1. Payment Trigger Configuration

Admin sekolah memiliki kendali penuh untuk menentukan kapan pembayaran dilakukan dalam siklus pendaftaran:

- **Upfront (Admission Fee):** Pembayaran di awal sebagai prasyarat untuk mengirimkan formulir pendaftaran. Efektif untuk memfilter pendaftar yang serius.
- **Downstream (Re-registration Fee):** Pembayaran hanya dipicu setelah pendaftar dinyatakan "Lulus Seleksi". Fokus pada volume pendaftar di awal dan mengamankan konversi di akhir.
- **Multi-stage Payments:** Kemampuan untuk membagi tagihan menjadi beberapa tahap (misalnya: Biaya Formulir -> Biaya Tes -> Biaya Masuk/Daftar Ulang).

### 2. Dynamic Registration Journey

Sistem secara otomatis menyesuaikan antarmuka pendaftar (Progress Wizard) berdasarkan konfigurasi trigger yang aktif:

- Penyesuaian otomatis langkah "Payment" dalam wizard (di awal, di tengah, atau di akhir).
- Pemicu otomatis notifikasi invoice WhatsApp pada momen yang tepat sesuai strategi sekolah.
- Manajemen status pendaftaran yang dinamis (e.g., "Verified, Pending Payment for Enrollment").

### 3. Installment Support (Optional)

Arsitektur mendukung kemungkinan pembayaran secara bertahap atau cicilan untuk biaya masuk yang besar, memungkinkan sekolah memberikan skema bantuan finansial yang lebih fleksibel bagi orang tua.
