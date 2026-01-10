---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  [
    '/_bmad-output/planning-artifacts/product-brief-ppdb-2025-12-30.md',
    '/_bmad-output/planning-artifacts/research/market-ppdb-saas-indonesia-research-2025-12-30.md',
    '/_bmad-output/analysis/brainstorming-session-2025-12-30.md'
  ]
documentCounts: { briefs: 1, research: 1, brainstorming: 1, projectDocs: 0 }
workflowType: 'prd'
lastStep: 11
---

# Product Requirements Document - ppdb

**Author:** Kodrat
**Date:** 2025-12-30

## Executive Summary

**ppdb** dirancang sebagai platform SaaS Management Admission multi-tenant yang revolusioner bagi ekosistem pendidikan di Indonesia. Fokus utama produk ini adalah menghilangkan hambatan pendaftaran (frictionless) melalui pendekatan "Simplicity-First", yang menggabungkan antarmuka pengguna secepat kilat dengan otomatisasi alur pendaftaran yang cerdas. Platform ini membantu Yayasan Pendidikan meningkatkan konversi calon siswa dan efisiensi operasional tanpa kerumitan infrastruktur tradisional.

### What Makes This Special

- **Adaptive Payment Gates:** Fleksibilitas unik untuk menentukan momen pembayaran (Upfront atau Post-Admission), memungkinkan sekolah menyesuaikan sistem dengan strategi pemasaran mereka.
- **Edge-Powered Velocity:** Penggunaan arsitektur serverless di jaringan global (Edge) memastikan pengalaman pendaftaran < 8 menit dengan respon sub-detik di seluruh Indonesia.
- **Smart Enrollment Automation:** Pengelolaan promosi daftar tunggu (waiting list) secara otomatis dan integrasi WhatsApp proaktif yang menjaga momentum pendaftar hingga tahap daftar ulang.

## Project Classification

**Technical Type:** SaaS B2B
**Domain:** EdTech
**Complexity:** Medium
**Project Context:** Greenfield - new project

Sistem ini akan beroperasi sebagai platform multi-tenant yang melayani berbagai level pengguna (Super Admin Platform, Admin Yayasan/Sekolah, dan Orang Tua) dengan fokus tinggi pada integritas data, privasi (UU PDP), dan keandalan sistem saat beban trafik tinggi (peak registration season).

## Success Criteria

### User Success

- **Parent Self-Sufficiency:** 90% pendaftar berhasil menyelesaikan proses tanpa harus menghubungi _call center_ atau admin sekolah.
- **Admin Relief:** Pengurangan beban kerja manual admin hingga 70% melalui otomatisasi verifikasi dan sistem ranking.
- **Instant Confidence:** 100% pendaftar menerima bukti pendaftaran/pembayaran via WhatsApp dalam waktu kurang dari 60 detik.

### Business Success

- **Tenant Acquisition:** Terakuisisi minimal **20 sekolah/yayasan** aktif dalam 12 bulan pertama.
- **High Retention Rate:** 95% sekolah melakukan perpanjangan langganan untuk periode pendaftaran tahun berikutnya.
- **Revenue Velocity:** Mempersingkat waktu pengumpulan biaya pendaftaran sekolah melalui integrasi payment gateway otomatis.

### Technical Success

- **Zero Overselling:** Akurasi kuota 100%; sistem tidak akan pernah menerima siswa melebihi kapasitas yang ditetapkan.
- **Edge Latency:** Konsistensi respon server < 200ms di seluruh wilayah Indonesia (Uji beban saat pendaftaran serentak).
- **Multi-tenant Integrity:** Nol insiden kebocoran data antar tenant (Yayasan).

### Measurable Outcomes

- **Registration Completion Time (RCT):** Rata-rata waktu pendaftaran orang tua < 8 menit.
- **Conversion Rate:** Minimal 85% dari pendaftar yang mulai mengisi formulir berlanjut hingga tahap pembayaran.

## Product Scope

### Full System (Current Project)

- **Multi-tenant Core:** Dashboard Yayasan & Sekolah dengan RBAC granular.
- **Guided Registration Wizard:** Alur pendaftaran mobile-first yang intuitif.
- **Hybrid Payment Engine:** Dukungan pembayaran online (VA/QRIS) & verifikasi manual.
- **Adaptive Payment Gates:** Pengaturan momen bayar (Awal/Akhir) yang fleksibel.
- **Smart Selection & Ranking:** Mesin perankingan otomatis berdasarkan bobot nilai.
- **WhatsApp Integration:** Notifikasi proaktif dan pengingat (lead recovery).
- **Refund & Withdrawal Flow:** Manajemen pembatalan dan pengembalian dana terintegrasi.
- **Super Admin Portal:** Monitoring kesehatan sistem global dan manajemen tenant pendaftaran.

### Growth Features (Future)

- **Digital Image OCR:** Ekstraksi data otomatis dari foto KK/Akta untuk mempercepat input.
- **Advanced Predictive Analytics:** Prediksi tren pendaftar tahun mendatang bagi pengurus Yayasan.
- **Custom Marketing Microsite:** Builder halaman depan pendaftaran sekolah yang dapat dikustomisasi.

### Vision (Future)

- **Academic Ecosystem Expansion:** Integrasi penuh ke sistem akademik (SIA), LMS, dan alumni.
- **Government API Sync:** Sinkronisasi real-time dengan portal Dapodik/Kemdikbud.

## User Journeys

### Journey 1: Ibu Maya - Pendaftaran Berbasis Akun yang Presisi

Ibu Maya memulai dengan membuat akun menggunakan nomor WhatsApp dan email. Setelah verifikasi OTP, dia login ke dashboard untuk melengkapi data pendaftaran langkah demi langkah. Adanya akun memastikan data yang dia cicil saat memasak tidak hilang dan dia bisa melanjutkan kapan saja dari perangkat mana pun.

### Journey 2: Admin Sekolah - Konfigurasi Jalur & Kuota Strategis

Sebelum musim pendaftaran dimulai, admin mengatur "Mesin Penerimaan". Dia menetapkan jalur pendaftaran (Afirmasi, Internal, Umum) dan menentukan kuota masing-masing. Sistem memungkinkan admin untuk mengunci kuota agar tidak terjadi pendaftaran berlebih (overselling), memberikan ketenangan pikiran bagi panitia.

### Journey 3: Pak Budi - Verifikasi Digital Terpadu

Admin sekolah memproses verifikasi dokumen melalui antarmuka side-by-side. Dia membandingkan foto dokumen asli dengan data input. Notifikasi WhatsApp otomatis terpicu setiap kali status verifikasi berubah, menjaga agar pendaftar tidak terus-menerus menelpon sekolah untuk bertanya status.

### Journey 4: Ibu Maya - Dashboard Penantian & Pengumuman

Pasca-pendaftaran, Ibu Maya menggunakan akunnya untuk memantau jadwal tes atau wawancara yang diatur oleh sekolah. Puncak perjalanannya adalah melihat pengumuman kelulusan di dashboard-nya yang segera diikuti oleh aktivasi otomatis modul daftar ulang dan tagihan biaya pendidikan.

### Journey 5: Staf Keuangan - Rekonsiliasi Hybrid

Sistem memungkinkan staf keuangan menerima pembayaran tunai di sekolah dan memvalidasinya secara manual di dashboard, sementara pendaftar yang membayar via VA/QRIS tervalidasi secara instan oleh sistem secara otomatis.

### Journey 6: Kodrat (SaaS Super Admin) - Global Health Monitoring

Sebagai pemilik platform, Kodrat memantau performa 20 sekolah yang berjalan serentak dari satu portal pusat. Dia mengelola aktivasi tenant baru dan memastikan integrasi payment gateway serta WhatsApp API berjalan tanpa hambatan di seluruh infrastruktur.

### Journey Requirements Summary

- **Secure Authentication:** Sistem akun dengan OTP dan manajemen sesi yang aman.
- **Admission Configurator:** Manajemen Jalur Pendaftaran (Multichannel) dan Pengaturan Kuota yang ketat.
- **Document Verification UI:** Panel verifikasi efisien dengan pratinjau dokumen langsung.
- **Scheduling & Messaging Hub:** Manajemen informasi jadwal dan penyiaran pengumuman hasil seleksi.
- **Hybrid Finance Engine:** Integrasi otomasi pembayaran digital sekaligus dukungan input manual admin.
- **Multi-tenant Control Center:** Dashboard sentral bagi pemilik platform untuk manajemen pelanggan (Sekolah).

### Journey 7: Ibu Maya - Pengingat di Tengah Kesibukan (Lead Recovery)

Ibu Maya terhenti di tengah pengisian formulir karena kesibukan rumah tangga. Sistem secara otomatis mendeteksi pendaftaran yang belum selesai dan mengirimkan pengingat melalui WhatsApp pada interval yang ditentukan. Ibu Maya kembali masuk ke sistem dan menyelesaikan sisa data tanpa harus mengulang dari awal, memaksimalkan tingkat konversi sekolah.

### Journey 8: Pak Budi - Menangani "Cabut Berkas" (Withdrawal & Refund)

Ketika seorang pendaftar memutuskan untuk membatalkan pendaftaran (misalnya karena diterima di sekolah negeri), Pak Budi memproses pembatalan tersebut melalui sistem. Alurnya mencakup verifikasi alasan, pemrosesan pengembalian dana (refund) jika berlaku, dan secara instan mengembalikan slot kuota yang kosong ke pool pendaftaran jalur terkait.

### Journey 9: Ananda & Ibu Maya - Ritual Daftar Ulang & Invoice Lulus

Begitu pengumuman "Lulus" muncul di dashboard, sistem secara otomatis menerbitkan Invoice Pembayaran Daftar Ulang. Ibu Maya memiliki fleksibilitas untuk membayar secara online (VA/QRIS) untuk aktivasi instan atau membayar secara offline di sekolah (cash). Setelah pembayaran divalidasi, sistem menerbitkan "Invoice Paid" digital yang dikirim via WhatsApp dan Dashboard; invoice ini berfungsi sebagai bukti sah dan kartu akses resmi untuk dibawa saat masuk sekolah pertama kali.

### Journey 10: Admin Support - Penyelamat User yang Kesulitan

Admin memiliki alat bantu untuk menangani masalah teknis pendaftar, seperti kesalahan input nomor WhatsApp atau email yang tidak terkirim. Dengan akses kontrol yang aman, admin dapat membantu memperbarui data kontak pendaftar dan mengirim ulang instruksi login secara instan untuk menjamin kelancaran pengalaman pengguna.

### Updated Journey Requirements Summary

- **Lead Recovery Engine & CRM:** Sistem pemantau pendaftaran tertunda dengan integrasi notifikasi WA otomatis.
- **Withdrawal Management System:** Logika pembatalan pendaftaran dengan integritas data kuota dan audit log.
- **Logistics & Enrollment Module:** Manajemen pendataan seragam, buku, dan kelengkapan siswa baru.
- **Account Support Tools:** Fitur bantuan admin untuk manajemen akun dan verifikasi pendaftar manual.

### Journey 11: Ketua Yayasan - Analisa Strategis Lintas Sekolah

Ketua Yayasan memantau performa PPDB di seluruh unit pendidikan (TK hingga SMA) melalui dashboard statistik agregat. Dia dapat mengidentifikasi unit mana yang memiliki tingkat konversi rendah dan segera mengalokasikan sumber daya promosi lebih banyak ke unit tersebut berdasarkan data real-time, memastikan seluruh yayasan mencapai target kuota siswa.

### Journey 12: Kodrat (Super Admin) - Onboarding Sekolah Baru dalam 5 Menit

Sebagai pemilik platform, Kodrat dapat menambahkan Yayasan atau sekolah baru dengan cepat melalui portal Super Admin. Sistem secara otomatis menyiapkan infrastruktur multi-tenant (database isolasi dan subdomain) tanpa perlu intervensi manual kode program, memungkinkan skala bisnis tumbuh secara eksponensial dengan beban kerja minimum.

### Journey 13: Admin Sekolah - Portabilitas Data (Export & Import)

Di akhir musim pendaftaran, admin melakukan ekspor data seluruh siswa yang diterima dalam format Excel untuk diimpor ke aplikasi akademik atau pelaporan Dapodik. Sebaliknya, admin juga dapat melakukan bulk-import data pendaftar lama ke dalam sistem untuk mempercepat proses entri data awal bagi siswa pindahan atau kasus khusus.

### Journey 14: Ibu Maya - Mendaftarkan Anak Kembar (Multi-Child Support)

Ibu Maya menggunakan satu akun untuk mengelola lebih dari satu pendaftaran (misalnya untuk anak kembar atau kakak-adik). Sistem secara cerdas menyimpan data profil orang tua secara permanen, sehingga saat mendaftarkan anak kedua, Ibu Maya hanya perlu mengisi identitas anak sementara data pendukung lainnya terintegrasi secara otomatis.

### Journey 15: Calon Pendaftar - Eksplorasi Tanpa Daftar (Public Visitor)

Sebelum memutuskan untuk mendaftar, pengunjung publik dapat melihat sisa kuota pendaftaran secara real-time pada landing page sekolah. Transparansi informasi ini, termasuk FAQ dan rincian biaya, membangun kepercayaan awal bagi orang tua sebelum mereka memutuskan untuk membuat akun dan memberikan data pribadi.

### Journey 16: Admin Sekolah - Content Management (CMS)

Admin memiliki kendali penuh untuk memperbarui profil sekolah, mengunggah brosur PDF terbaru, dan mengubah spanduk pengumuman di halaman depan portal pendaftaran. Proses manajemen konten yang mandiri ini memastikan informasi yang diterima calon pendaftar selalu relevan dan aktual.

### Journey 17: Ibu Maya - Pengajuan Beasiswa & Potongan Harga

Ibu Maya mengajukan keringanan biaya melalui formulir beasiswa yang terintegrasi. Admin sekolah meninjau bukti prestasi atau keterangan ekonomi yang diunggah dan memberikan diskon biaya pendaftaran. Nominal tagihan pada dashboard Ibu Maya secara otomatis diperbarui, mencerminkan transparansi proses pemberian bantuan sekolah.

### Journey 18: Admin Sekolah - Keamanan & Audit Log

Dalam kasus sengketa pendaftaran, admin yayasan dapat memeriksa Audit Log untuk melihat sejarah perubahan data. Sistem mencatat siapa yang melakukan perubahan nilai, kapan, dan alasannya. Fitur ini menjamin integritas proses seleksi dan mencegah peluang terjadinya manipulasi data pendaftaran.

### Journey 19: Kodrat (Super Admin) - Financial Settlement (Payout)

Kodrat mengelola arus kas dari payment gateway untuk didistribusikan ke sekolah-sekolah terkait. Portal Super Admin menampilkan rincian dana yang masuk, potongan biaya admin platform, dan memfasilitasi proses penarikan dana (payout) ke rekening bank sekolah dengan laporan keuangan yang komprehensif.

### Journey 20: Orang Tua (Waiting List) - Promosi Otomatis

Seorang pendaftar di daftar tunggu secara otomatis naik menjadi status "Diterima" ketika ada pendaftar di atasnya yang melakukan pembatalan berkas. Sistem mengirimkan pengumuman otomatis via WhatsApp, memberikan peluang kedua yang adil bagi pendaftar cadangan tanpa campur tangan manual panitia.

### Journey 21: Admin Sekolah - Pengumuman Massal (Broadcasting)

Pada hari pengumuman, admin melakukan siaran pesan (broadcast) kelulusan secara massal kepada ratusan pendaftar dengan satu klik. Pesan terpersonalisasi dikirimkan melalui WhatsApp, menuntun pendaftar untuk segera melihat dashboard dan melakukan proses daftar ulang.

### Journey 22: Siklus Revisi & Perbaikan Data

Jika terdapat dokumen yang kurang jelas, admin memberikannya status "Butuh Revisi". Pendaftar menerima instruksi spesifik bagian mana yang harus diperbaiki. Pendaftar hanya perlu mengunggah ulang dokumen yang ditolak tanpa harus mengulang proses pendaftaran, menghemat waktu bagi kedua belah pihak.

### Journey 23: Yayasan & Kodrat - Langganan Tahunan (SaaS Renewal)

Menjelang akhir tahun ajaran, sistem mengirimkan notifikasi penagihan biaya langganan platform kepada Yayasan. Setelah pembayaran lunas, sistem secara otomatis memperpanjang masa aktif tenant untuk musim pendaftaran tahun berikutnya, menjamin kelangsungan bisnis SaaS secara berkelanjutan.

### Journey 24: Penguji/Guru - Input Nilai & Catatan Wawancara

Para guru atau penguji yang bertugas dalam tahap seleksi memiliki akses khusus sebagai Interviewer. Mereka dapat melihat daftar pendaftar yang dijadwalkan untuk wawancara dan menginput skor serta catatan kualitatif secara real-time. Data ini kemudian menjadi variabel penting dalam perhitungan ranking otomatis oleh sistem seleksi.

### Journey 25: Petugas Survey - Verifikasi Lapangan (Home Visit)

Untuk memastikan ketepatan sasaran pada jalur pendaftaran beasiswa atau afirmasi, petugas sekolah melakukan survei lapangan. Dengan akses mobile, petugas dapat mengunggah bukti dokumentasi kondisi rumah dan laporan hasil survei langsung ke dalam folder digital pendaftar, memudahkan panitia seleksi dalam pengambilan keputusan akhir.

### Journey 26: Pendaftar & Sekolah - Kepatuhan Privasi Data (UU PDP)

Untuk memenuhi regulasi perlindungan data pribadi, pendaftar memiliki hak untuk meminta penghapusan atau anonimisasi data sensitif setelah proses seleksi berakhir. Admin sekolah atau Super Admin mengelola permintaan ini melalui fitur retensi data, memastikan dokumen identitas yang tidak lagi diperlukan dihapus secara otomatis namun tetap mempertahankan data statistik agregat untuk kebutuhan laporan institusi.

### Final Journey Requirements Summary

- **Role-specific Interviewer Portal:** Dashboard input penilaian bagi staf penguji/guru.
- **Field Verification Toolkit:** Modul pendataan survei lapangan terintegrasi untuk jalur khusus.
- **Data Retention & Privacy Manager:** Mekanisme pembersihan data otomatis dan manajemen privasi sesuai regulasi UU PDP.

### Journey 27: Wali Siswa Asing - Manajemen Paspor & KITAS (Global Admission)

Untuk melayani sekolah dengan standar internasional, sistem menyediakan alur pendaftaran bagi warga negara asing yang tidak memiliki NIK/KK. Pendaftar dapat mengunggah dokumen paspor, KITAS, serta dokumen penyetaraan pendidikan. Sistem secara otomatis memberikan klasifikasi "International Student" untuk memudahkan pelaporan khusus ke pihak berwenang.

### Journey 28: Staf Admin - Pelaporan & Validasi Pemerintah (Dapodik Ready)

Pasca pendaftaran selesai, admin sekolah menggunakan modul ekspor data untuk menghasilkan file laporan yang sesuai dengan skema Dapodik (Data Pokok Pendidikan). Hal ini memastikan sekolah dapat melakukan sinkronisasi data siswa baru ke sistem pemerintah dengan cepat, akurat, dan tanpa perlu input data berulang kali.

### Journey 29: Vendor Seragam & Buku - Efisiensi Logistik (Vendor Logistics)

Pihak ketiga atau vendor yang bekerja sama dengan sekolah diberikan akses terbatas ke dashboard distribusi logistik. Vendor dapat memantau pesanan seragam (berdasarkan ukuran baju pendaftar) dan paket buku yang telah dibayar secara real-time, memungkinkan proses pengemasan dan pengiriman yang lebih cepat dan terorganisir dengan baik.

### Journey 30: Developer & Ops (Team Kodrat) - Resilience under Pressure

Di balik layar, tim infrastruktur memantau kesehatan sistem melalui dashboard telemetri global. Saat terjadi lonjakan pendaftaran serentak pada 20 sekolah, sistem melakukan penskalaan otomatis (auto-scaling) pada layer Edge. Tim teknis dapat melakukan intervensi performa secara real-time untuk menjamin ketersediaan layanan 99.9% dan keamanan transaksi pendaftar.

### Final & Complete Journey Requirements Summary

- **International Admission Module:** Dukungan penuh untuk identitas asing dan dokumen internasional.
- **Regulatory Reporting Tools:** Standarisasi ekspor data untuk kepatuhan institusi pemerintah (Dapodik).
- **Logistics & Vendor Management:** Ekosistem manajemen pesanan atribut sekolah bagi mitra vendor.
- **Advanced Telemetry & DevOps Dashboard:** Infrastruktur monitoring dan skalabilitas tingkat tinggi bagi pemilik platform.

### Journey 31: Ibu Maya - Pemulihan Akun (Account Recovery)

Ibu Maya kehilangan akses ke password-nya atau mengganti perangkat baru. Dia menggunakan fitur "Lupa Password" di halaman login. Sistem mengirimkan tautan reset yang aman melalui email atau nomor WhatsApp terdaftar. Setelah memverifikasi identitasnya, Ibu Maya berhasil memulihkan akses ke akun pendaftarannya tanpa harus membuat data dari awal, menjaga kontinuitas proses pendaftaran.

### Journey 32: Tim IT (Kodrat) - Pemulihan Bencana (Disaster Recovery)

Dalam skenario kegagalan infrastruktur kritis, Kodrat sebagai pemilik platform mengeksekusi protokol Disaster Recovery. Memanfaatkan kemampuan point-in-time recovery dari database (seperti Neon), sistem dikembalikan ke kondisi stabil terakhir sebelum kegagalan. Seluruh data pendaftar dari 20 sekolah tetap utuh, memastikan kepercayaan tenant terhadap reliabilitas platform tetap terjaga.

### Final Technical Journey Requirements Summary

- **Secure Account Recovery Service:** Layanan pemulihan akses akun berbasis multi-channel (Email/WA).
- **Point-in-Time Recovery (PITR):** Infrastruktur database dengan kemampuan pemulihan data otomatis ke titik waktu tertentu.
- **Failover & Zero Data Loss Strategy:** Protokol teknis untuk menjamin ketersediaan data selama gangguan sistem.

## Domain-Specific Requirements

### EdTech & Privacy Compliance Overview

Penerimaan Peserta Didik Baru (PPDB) melibatkan pengolahan data pribadi yang masif dan krusial. Sistem harus menjamin bahwa data calon siswa dan orang tua terlindungi sesuai regulasi nasional sambil tetap menyediakan kemudahan akses data untuk kebutuhan administratif sekolah.

### Key Domain Concerns

- **Data Privacy (UU PDP No. 27/2022):** Pengelolaan data identitas (NIK/KK) wajib terenkripsi pada saat istirahat (at rest) maupun saat dikirim (in transit).
- **Government Data Standards:** Keselarasan atribut data pendaftar dengan standar sistem Dapodik (Data Pokok Pendidikan).
- **Financial Integrity & Reconciliation:** Akurasi pencatatan keuangan antara Payment Gateway dengan status pembayaran di dashboard sekolah.
- **Strict Tenant Isolation:** Memastikan data antar sekolah/yayasan tidak bocor dan terisolasi secara logis pada level database.

### Compliance Requirements

- **Explicit User Consent:** Penyertaan mekanisme persetujuan (consent) sebelum pengambilan data pribadi pendaftar.
- **Audit Logging for Sensitive Data:** Pencatatan setiap akses atau perubahan pada data sensitif siswa oleh admin.
- **Secure File Storage:** Penyimpanan dokumen (Scan KK/Akta) menggunakan proteksi akses yang hanya bisa dibuka oleh pihak berwenang (Admin Sekolah terkait).

### Industry Standards & Best Practices

- **Dapodik Mapping:** Struktur field formulir pendaftaran yang 100% kompatibel dengan atribut migrasi Dapodik.
- **Mobile-First Accessibility:** Optimalisasi antarmuka untuk bandwidth rendah guna menjangkau orang tua dengan keterbatasan infrastruktur internet.
- **Standardized Payment Reconciliation:** Laporan keuangan yang dapat diunduh (auditable) untuk kebutuhan pelaporan internal Yayasan.

### Implementation Considerations

- Pemanfaatan arsitektur Edge (Cloudflare Workers) untuk menjamin latensi rendah dan proteksi terhadap serangan DDoS selama periode puncak pendaftaran.
- Implementasi Database-per-tenant atau Row-level Security untuk manajemen privasi data yang kokoh.

## Innovation & Novel Patterns

### Detected Innovation Areas

- **Adaptive Payment Triggers:** Inovasi pada alur pendaftaran yang memungkinkan sekolah mengubah "gerbang pembayaran" secara dinamis (di awal, di tengah, atau saat daftar ulang) tanpa mengubah struktur sistem. Ini menantang model pendaftaran kaku yang ada di pasar saat ini.
- **Autonomous Enrollment Operations:** Sistem promosi daftar tunggu (waiting list) otomatis berdasarkan logika sistem, menghilangkan keterlambatan dan potensi subjektivitas manusia dalam pengisian slot kosong.
- **Edge-first Infrastructure:** Pemanfaatan arsitektur serverless (Cloudflare Workers) untuk menjamin latensi rendah dan kemampuan menangani lonjakan trafik masif secara instan, sangat relevan untuk koneksi internet di berbagai wilayah Indonesia.

### Market Context & Competitive Landscape

- Berbeda dengan sistem PPDB tradisional yang monolitik dan berat, **ppdb** memposisikan diri sebagai "High-Performance SaaS" yang mengutamakan kecepatan pendaftaran bagi orang tua dan fleksibilitas bisnis bagi sekolah.
- Belum ada solusi SaaS lokal yang mengintegrasikan otomasi notifikasi WhatsApp proaktif dengan arsitektur basis data terdistribusi (Edge) secara penuh.

### Validation Approach

- **A/B Testing on Flows:** Melakukan pengujian pada beberapa tenant sekolah untuk melihat mana yang memiliki tingkat konversi pendaftar lebih tinggi: bayar di awal atau bayar di akhir.
- **Edge Performance Benchmarking:** Melakukan load-testing pada kondisi jaringan simulasi 3G/4G untuk memastikan kecepatan < 8 menit tetap tercapai.

### Risk Mitigation

- **Waitlist Fallback:** Implementasi batas waktu konfirmasi otomatis (misal: 24 jam) bagi siswa yang dipromosikan dari daftar tunggu sebelum slot dialihkan ke urutan berikutnya.
- **Consistency Management:** Penggunaan mekanisme transaksi atomik pada database (Neon) untuk menjamin tidak ada data kuota yang korup saat pendaftaran serentak terjadi.

## SaaS B2B Specific Requirements

### Project-Type Overview

Sebagai platform SaaS B2B, **ppdb** dirancang untuk skalabilitas dan kemudahan administrasi bagi banyak sekolah di bawah satu manajemen pusat (Yayasan) maupun sekolah mandiri. Model bisnis berbasis langganan tahunan (flat rate) memberikan kejelasan biaya bagi sekolah.

### Technical Architecture Considerations

- **Independent Subdomain Resolution:** Setiap tenant memiliki akses melalui subdomain unik (contoh: `sekolah-abc.ppdb.id`). Sistem harus menangani resolusi subdomain pada level Edge (Cloudflare) untuk mengarahkan pengguna ke context database tenant yang benar secara instan.
- **Strict Tenant Data Isolation:** Implementasi isolasi data menggunakan mekanisme Row-Level Security (RLS) atau skema terpisah pada Neon PostgreSQL untuk menjamin keamanan dan privasi data antar sekolah.

### Tenant & Access Model

- **Subscription Model:** Flat rate per tahun. Manajemen siklus hidup tenant (aktivasi, suspensi, perpanjangan) dikelola terpusat melalui portal SaaS Super Admin.
- **RBAC Matrix (Role-Based Access Control):**
  - **SaaS Super Admin:** Akses penuh sistem global, manajemen infrastruktur, dan penagihan (billing).
  - **Admin Yayasan:** Pemantauan statistik dan laporan pendaftaran lintas unit sekolah dalam satu organisasi.
  - **Admin Sekolah:** Otoritas penuh atas pengaturan jalur, kuota, dan operasional pendaftaran satu unit sekolah.
  - **Staf Pendaftaran:** Fokus pada manajemen data pendaftar, edit data, dan verifikasi dokumen.
  - **Penguji:** Akses terbatas untuk input nilai seleksi dan catatan hasil wawancara.
  - **Orang Tua/Siswa:** Akses portal pendaftaran, pengisian formulir, dan monitoring status kelulusan.

### Implementation Considerations

- **Core Integrations:** Fokus pada stabilitas dua layanan kritis:
  - **WhatsApp Gateway:** Sebagai kanal komunikasi utama untuk OTP, notifikasi status, dan reminder.
  - **Payment Gateway:** Sebagai mesin otomatisasi keuangan sekolah untuk berbagai metode pembayaran (VA, E-Wallet, QRIS).
- **Scale-on-Demand:** Arsitektur yang memungkinkan penambahan sekolah baru dalam waktu singkat dengan otomatisasi konfigurasi subdomain dan database.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Revenue-First MVP. Fokus pada penyediaan fitur esensial yang memberikan nilai bisnis langsung bagi sekolah (manajemen pendaftaran dan pembayaran otomatis) agar dapat segera menghasilkan pendapatan dari biaya langganan flat tahunan.
**Resource Requirements:** Tim pengembang full-stack dengan keahlian di SvelteKit, Cloudflare Workers, dan manajemen database multi-tenant.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Journey 1: Pendaftaran akun & verifikasi OTP.
- Journey 2: Konfigurasi Jalur & Kuota oleh Admin.
- Journey 3: Verifikasi dokumen digital.
- Journey 4: Dashboard pengumuman hasil.
- Journey 5: Pembayaran hybrid (Online/Cash).
- Journey 6: Monitoring Super Admin.

**Must-Have Capabilities:**

- Multi-tenancy dengan isolasi data dan resolusi subdomain.
- Sistem autentikasi berbasis akun (WhatsApp/Email OTP).
- Formulir pendaftaran dinamis yang persistens.
- Engine pengelolaan kuota dan jalur pendaftaran (Internal, Afirmasi, Umum).
- Integrasi Payment Gateway (VA, QRIS, E-Wallet).
- Dashboard administrasi untuk verifikasi dan pelaporan keuangan sederhana.

### Post-MVP Features

**Phase 2 (Growth - Optimasi Operasional):**

- Lead Recovery Engine (Otomatisasi pengingat WA).
- Status Waiting List otomatis.
- Portal Penguji/Guru untuk penilaian wawancara/tes.
- Modul Ekspor Data standar Dapodik.
- Manajemen Pembatalan (Withdrawal) & Refund.
- Alat bantu Admin Support untuk manajemen akun pengguna.

**Phase 3 (Expansion - Advanced Features):**

- Modul Survei Lapangan via Mobile.
- Analitik Strategis Lintas Unit untuk Yayasan.
- Integrasi Vendor Seragam & Buku (Manajemen Logistik).
- Kepatuhan Privasi Data (Auto-Cleanup dokumen sesuai UU PDP).
- Dukungan pendaftaran siswa internasional (Paspor/KITAS).

### Risk Mitigation Strategy

**Technical Risks:** Kompleksitas multi-tenancy pada arsitektur Edge. Mitigasi: Implementasi isolasi data yang ketat pada level database dan pengujian menyeluruh pada resolusi subdomain sebelum peluncuran.
**Market Risks:** Tantangan adopsi oleh sekolah tradisional. Mitigasi: Fokus pada UI yang sangat simpel dan proses onboarding yang dipandu untuk admin sekolah.
**Resource Risks:** Ketergantungan pada infrastruktur Cloudflare. Mitigasi: Menyiapkan dokumentasi arsitektur yang solid dan memastikan redundansi data melalui fitur point-in-time recovery pada Neon PostgreSQL.

## Functional Requirements

### 1. Tenant & System Management (Super Admin Platform)

- **FR1:** Super Admin dapat mendaftarkan Yayasan/Sekolah baru ke dalam platform.
- **FR2:** Super Admin dapat mengaktifkan, menonaktifkan, atau memperpanjang masa aktif tenant (Sekolah).
- **FR3:** Super Admin dapat memantau kesehatan infrastruktur dan log aktivitas global.
- **FR4:** Super Admin dapat mengelola penarikan dana (payout) ke rekening sekolah.
- **FR30:** Super Admin dapat mengelola definisi Roles dan matriks Permissions secara global maupun spesifik tenant.
- **FR31:** Super Admin dapat mengakses laporan eksekutif terkait pertumbuhan platform, performa pendaftaran sekolah, dan ringkasan keuangan global.

### 2. School Administration & Configuration

- **FR5:** Admin Sekolah dapat mengonfigurasi jalur pendaftaran (Afirmasi, Internal, dsb).
- **FR6:** Admin Sekolah dapat menetapkan kuota pendaftar per jalur secara ketat.
- **FR7:** Admin Sekolah dapat mengatur biaya pendaftaran dan momen penagihannya (Upfront/Post).
- **FR8:** Admin Sekolah dapat mengubah konten profil sekolah, brosur, dan banner pengumuman.
- **FR9:** Admin Sekolah dapat mengekspor data pendaftar sesuai format standar (Excel/Dapodik).

### 3. User Management & Authentication

- **FR10:** Pendaftar dapat membuat akun menggunakan WhatsApp atau Email dengan verifikasi OTP.
- **FR11:** Pengguna dapat melakukan pemulihan akun (reset password/akses).
- **FR12:** Sistem memberikan hak akses berbeda (RBAC) bagi Admin Yayasan, Sekolah, Keuangan, Penguji, dan Orang Tua.

### 4. Registration & Data Collection

- **FR13:** Pendaftar dapat mengisi formulir pendaftaran secara bertahap (cicil data).
- **FR14:** Pendaftar dapat mendaftarkan lebih dari satu anak menggunakan satu akun utama.
- **FR15:** Pendaftar dapat mengunggah dokumen pendukung (KK, Akta, Paspor, KITAS).
- **FR16:** Sistem secara otomatis mendeteksi dan memberi pengingat pada pendaftaran yang tidak lengkap (Lead Recovery).

### 5. Verification & Selection Process

- **FR17:** Admin dapat melakukan verifikasi dokumen pendaftar secara side-by-side.
- **FR18:** Penguji dapat menginput nilai tes/wawancara dan catatan kualitatif pendaftar.
- **FR19:** Petugas Lapangan dapat mengunggah laporan hasil survei rumah pendaftar (Home Visit).
- **FR20:** Sistem secara otomatis melakukan perankingan pendaftar berdasarkan bobot kriteria yang ditetapkan sekolah.

### 6. Communication & Notifications

- **FR21:** Sistem mengirimkan notifikasi status pendaftaran secara otomatis via WhatsApp dan Email.
- **FR22:** Admin dapat mengirimkan pesan massal (broadcast) kepada segmen pendaftar tertentu.
- **FR23:** Sistem secara otomatis mempromosikan pendaftar dari daftar tunggu jika tersedia slot kosong.

### 7. Finance & Payments

- **FR24:** Pendaftar dapat melakukan pembayaran biaya pendaftaran dan daftar ulang secara online (VA/QRIS).
- **FR25:** Admin Keuangan dapat memvalidasi pembayaran tunai manual secara langsung di dashboard.
- **FR26:** Sistem menerbitkan bukti bayar (invoice lunas) secara otomatis setelah dana tervalidasi.

### 8. Privacy & Data Integrity

- **FR27:** Pengguna dapat memberikan persetujuan (consent) eksplisit atas penggunaan data pribadi.
- **FR28:** Sistem mencatat setiap perubahan data sensitif dalam log audit yang tidak dapat dihapus.
- **FR29:** Pengguna dapat mengajukan permintaan penghapusan atau anonimisasi data sesuai UU PDP.

## Non-Functional Requirements

### Performance

- **NFR1:** Laman pendaftaran harus memiliki waktu muat (Largest Contentful Paint) kurang dari 2.5 detik pada koneksi 4G standar.
- **NFR2:** Setiap interaksi pengguna (simpan data, verifikasi OTP) harus memberikan respon visual dalam waktu kurang dari 200ms melalui arsitektur Edge.
- **NFR3:** Sistem harus mampu menangani minimal 500 pengguna konkuren secara serentak tanpa penurunan performa yang signifikan pada satu tenant sekolah.

### Security & Privacy

- **NFR4:** Seluruh data identitas sensitif (NIK, KK) wajib dienkripsi menggunakan standar AES-256 saat disimpan (at rest).
- **NFR5:** Seluruh komunikasi data wajib menggunakan enkripsi TLS 1.3 dalam perjalanan (in transit).
- **NFR6:** Implementasi Rate Limiting yang ketat pada endpoint sensitif (seperti OTP dan Login) untuk mencegah serangan Brute Force.

### Scalability & Availability

- **NFR7:** Menjamin ketersediaan layanan (Uptime) minimal 99.9% selama periode kritis pendaftaran (Maret - Juli).
- **NFR8:** Infrastruktur multi-tenant harus mendukung provisi otomatis hingga 100 tenant sekolah baru tanpa gangguan pada tenant yang sudah ada.
- **NFR9:** Backup database harian dengan kemampuan Point-In-Time Recovery (PITR) hingga 30 hari ke belakang.

### Accessibility & Compatibility

- **NFR10:** Antarmuka pengguna wajib responsif dan ramah seluler, mendukung peramban mobile populer pada layar minimal 360px.
- **NFR11:** Desain sistem yang ringan untuk memastikan fungsionalitas inti tetap berjalan lancar pada kondisi jaringan seluler rendah (Edge/3G).

### Integration & Compliance

- **NFR12:** Penyediaan log audit yang tidak dapat diubah (immutable) untuk setiap transaksi keuangan dan akses data pendaftar.
- **NFR13:** Format ekspor data harus mematuhi skema atribut yang kompatibel dengan standar migrasi database Dapodik Nasional.
