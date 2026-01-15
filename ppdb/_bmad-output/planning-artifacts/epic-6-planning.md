# Epic 6: Proactive Communication & Engagement (BMAD Party Mode)

## 🎯 Objective
Mengubah sistem PPDB dari "pasif" menjadi **"proaktif"**. Sistem tidak hanya menunggu orang tua login, tetapi aktif menjangkau mereka melalui WhatsApp untuk update status, pengumuman penting, dan promosi kuota.

## 🎭 Stories Breakdown

### 1. Story 6.1: Automated Status Notifications (✅ Partially Done)
**"The Personal Assistant"**
*   **Goal:** Memberi tahu orang tua secara instan saat status pendaftaran berubah.
*   **Current State:** Sudah diimplementasikan untuk Payment (Invoice Created, Paid, Failed).
*   **Missing Parts:**
    *   Notifikasi saat dokumen diverifikasi (Verified/Rejected).
    *   Notifikasi saat hasil seleksi diumumkan (Accepted/Waitlisted/Rejected).
*   **Implementation Plan:**
    *   Hook ke dalam `verificationAction` (saat admin klik Approve/Reject dokumen).
    *   Hook ke dalam `rankingEngine` (saat finalisasi seleksi).

### 2. Story 6.2: Broadcast Messaging
**"The Megaphone"**
*   **Goal:** Admin dapat mengirim pesan massal ke segmen audiens tertentu.
*   **UI Components:**
    *   `BroadcastPage`: Form untuk menulis pesan & filter audiens.
    *   `AudienceFilter`: Dropdown (All, Pending Payment, Verified, Accepted, Waitlisted).
    *   `MessagePreview`: Preview pesan WA sebelum dikirim.
*   **Backend Logic:**
    *   Query users based on filter.
    *   Queueing system (agar tidak kena blokir WA karena spamming). Gunakan `p-limit` atau delay sederhana.
    *   Log history broadcast.

### 3. Story 6.3: Automated Waitlist Promotion
**"The Auto-Filler"**
*   **Goal:** Mengisi slot kosong secara otomatis dari daftar tunggu.
*   **Trigger:** Saat kandidat "Accepted" berubah jadi "Withdrawn" atau "Expired" (tidak daftar ulang).
*   **Logic:**
    *   Cari kandidat `rank: 1` di `status: waitlisted` pada jalur yang sama.
    *   Ubah status kandidat tersebut jadi `status: offered`.
    *   Kirim WA: "Selamat! Slot tersedia untuk Anda. Konfirmasi dalam 24 jam."
    *   Set timer expired 24 jam (Cron job/Scheduled task).

## 🛠 Technical Architecture

### Database Schema Updates
Perlu tabel baru untuk tracking broadcast:

```typescript
export const broadcasts = pgTable('broadcasts', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    senderId: uuid('sender_id').references(() => users.id),
    targetSegment: text('target_segment'), // 'all', 'pending_payment', etc.
    messageTemplate: text('message_template'),
    sentCount: integer('sent_count').default(0),
    failedCount: integer('failed_count').default(0),
    createdAt: timestamp('created_at').defaultNow()
});
```

### WAHA Integration
*   Reuse `sendWhatsappMessage` helper yang sudah dibuat di Epic 5.
*   Tambahkan error handling yang lebih robust untuk mass sending (rate limiting).

## 🚀 Execution Steps (Party Mode)

1.  **Step 1: Broadcast UI & Backend (Story 6.2)**
    *   Bikin halaman `/admin/broadcast`.
    *   Bikin API action untuk fetch users & send messages.
    *   **Verification:** Kirim broadcast ke 3 user dummy.

2.  **Step 2: Complete Auto-Notifications (Story 6.1)**
    *   Tambahkan trigger notifikasi di halaman Verifikasi Dokumen.
    *   Tambahkan trigger notifikasi di halaman Seleksi.
    *   **Verification:** Admin reject dokumen -> User dapat WA.

3.  **Step 3: Waitlist Engine (Story 6.3)**
    *   Bikin logic promosi otomatis.
    *   **Verification:** Simulasikan user mundur, user waitlist otomatis naik.

## 📝 User Confirmation
Kita mulai dari **Step 1: Broadcast Messaging**?
