# 📋 Task: Salsabila — Direct Message (DM) Mini / Chat Room [PHASE 2]

> **💡 CARA PAKAI DOKUMEN INI:**
> Salin **seluruh isi dokumen ini** ke chat AI (ChatGPT/Claude/Gemini), lalu ketik:
> _"Mulai dari Langkah 1, buatkan kodenya satu per satu."_
> AI akan langsung paham konteks proyek dan stack-nya tanpa perlu penjelasan tambahan.

---

## 🏗️ Konteks Proyek

Di Phase 2 ini, kamu memegang salah satu fitur paling prestisius di Instagram clone kita: **Direct Message (DM) Mini / Chat Room**!
Kamu akan merakit ruang obrolan langsung antar user. Karena ini adalah platform sosial, fitur bertukar pesan akan membuat project kita terlihat sangat canggih dan fungsional di hadapan dosen penguji.

- **Stack:** Bun · React + Vite · TypeScript · Tailwind CSS v4 · React Router DOM
- **Kamu cukup fokus ke folder:** `frontend/src/`
- **Backend (ElysiaJS):** Sedang diintegrasikan oleh Rafli. Kamu akan menggunakan **Dummy Data** yang diisolasi di file terpisah agar bisa mendesain UI & logikanya secara mandiri terlebih dahulu.

---

## 🎨 Design System — WAJIB Diikuti

Gunakan variabel warna kustom Instagram yang sudah ada di proyek untuk menjaga konsistensi *dark mode*:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background panel samping chat / kolom kiri |
| `bg-ig-chat-out` | `rgb(0, 149, 246)` | Bubble chat pengirim (biru IG) |
| `bg-ig-chat-in` | `rgb(38, 38, 38)` | Bubble chat penerima (abu-abu gelap) |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `border-neutral-800`| abu-abu gelap | Border garis pemisah / pembagi |

---

## 📁 File yang Kamu Kerjakan / Buat Baru

Kamu akan membuat halaman chat baru, mendaftarkan rute, dan menaruh data mock di file terpisah:

```
frontend/src/
├── pages/
│   └── DirectPage.tsx                  ← Bikin Baru: Halaman utama Direct Message / Chat Room
├── App.tsx                             ← Edit: Tambahkan route /direct/inbox
├── components/layout/
│   ├── Sidebar.tsx                     ← Edit: Tambahkan ikon "Pesan" (DM) mengarah ke /direct/inbox
│   └── BottomNav.tsx                   ← Edit: Tambahkan ikon "Pesan" (DM) mengarah ke /direct/inbox
└── lib/
    └── mockData.ts                     ← Edit: Tambahkan data list chat & pesan dummy
```

---

## 📂 Pemisahan File Dummy Data (Saran Arsitektur Bersih)

Agar komponen halaman UI tetap bersih dari data statis yang sangat panjang, kamu harus menyatukan semua data dummy di file `frontend/src/lib/mockData.ts` (file yang sama dengan milik Adella, Yasmin, Olivia, & Bagas).

Buka (atau buat jika belum ada) file `frontend/src/lib/mockData.ts` dan tambahkan data di bawah ini:

```typescript
export interface ChatRoom {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  lastMessage: string;
  lastMessageTime: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // Cocokkan dengan currentUser.id untuk menentukan bubble kiri/kanan
  text: string;
  createdAt: string;
}

// Dummy daftar room obrolan aktif (sidebar kiri chat):
export const dummyChatRooms: ChatRoom[] = [
  { id: "c-1", username: "adella_n", name: "Adella Nur", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", lastMessage: "Kerjaan stories udah beres nih!", lastMessageTime: "14.30" },
  { id: "c-2", username: "yasmin_s", name: "Yasmin Salsabila", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", lastMessage: "Udah cek explore grid baru belum?", lastMessageTime: "Kemarin" },
  { id: "c-3", username: "bagaskara_s", name: "Bagaskara", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", lastMessage: "P", lastMessageTime: "3 hari lalu" }
];

// Dummy pesan di dalam obrolan aktif (Adella Nur):
export const dummyMessages: ChatMessage[] = [
  { id: "m-1", senderId: "other", text: "Halo Rafli! Gimana kabar project capstone kita?", createdAt: "2026-05-27T07:00:00.000Z" },
  { id: "m-2", senderId: "user-current", text: "Halo Adel! Lancar kok, ini backend lagi aku integrasiin.", createdAt: "2026-05-27T07:02:00.000Z" },
  { id: "m-3", senderId: "other", text: "Mantap! Kerjaan stories udah beres nih!", createdAt: "2026-05-27T07:05:00.000Z" }
];
```

Kamu tinggal meng-import data ini di halaman `DirectPage.tsx`:
```typescript
import { dummyChatRooms, dummyMessages } from "../lib/mockData";
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### 1️⃣ LANGKAH 1 — Membuat Halaman `DirectPage.tsx`
Halaman ini menggunakan layout 2-kolom yang sangat responsif:
* **Kolom Kiri (Daftar Chat):** Menampilkan daftar user yang sedang aktif mengobrol dengan kita (`dummyChatRooms`) lengkap dengan foto profil, nama, pesan terakhir, dan jam pesan.
* **Kolom Kanan (Ruang Obrolan):** Menampilkan nama user di header, area percakapan (`dummyMessages`), dan input pengiriman pesan di bagian bawah.

* **Spesifikasi UI Percakapan:**
  * Area chat harus bisa di-scroll secara independen.
  * **Bubble Chat:** 
    * Jika `senderId === user.id` (pengirim adalah kita) → letakkan di sebelah kanan, warna bubble biru `bg-ig-primary text-white`.
    * Jika `senderId !== user.id` (pengirim adalah teman) → letakkan di sebelah kiri, warna bubble abu-abu `bg-ig-chat-in text-ig-text`.
  * **Input Pesan:** Di bagian bawah, buat input teks yang ketika ditekan Enter (atau tombol "Kirim" diklik), pesan baru akan otomatis ter-render secara lokal di layar.

---

### 2️⃣ LANGKAH 2 — Daftarkan Route Baru di `App.tsx`
Menghubungkan halaman baru buatanmu ke sistem routing aplikasi.

* **Spesifikasi:**
  * Buka `frontend/src/App.tsx`.
  * Import `DirectPage` di bagian atas.
  * Tambahkan rute baru di bawah `/explore`:
    ```tsx
    <Route path="/direct/inbox" element={
      <ProtectedRoute>
        <MainLayout>
          <DirectPage />
        </MainLayout>
      </ProtectedRoute>
    } />
    ```

---

### 3️⃣ LANGKAH 3 — Tambahkan Menu Pesan di Sidebar & BottomNav
Tambahkan menu Direct Message (DM) agar user bisa beralih ke halaman chat dengan mudah.

* **Spesifikasi:**
  * Buka `frontend/src/components/layout/Sidebar.tsx` dan `BottomNav.tsx`.
  * Tambahkan ikon **Pesan** (ikon pesawat kertas atau balon chat `Send` / `MessageCircle` dari `lucide-react`) di daftar menu navigasi.
  * Arahkan link navigasinya menuju `/direct/inbox`.

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding
```bash
git checkout dev
git pull origin dev
git checkout -b asa/direct-message
```

### 2. Commit setiap selesai langkah kerja
```bash
git add .
git commit -m "feat(direct): create DirectPage split layout structure"
# Setelah fitur input pesan & bubble chat selesai:
git commit -m "feat(direct): implement local chat sending state"
```

### 3. Push ke branch & Buat Pull Request
```bash
git push origin asa/direct-message
```
* Buka **GitHub**, buat **Pull Request (PR)** dari branch `asa/direct-message` mengarah ke branch **`dev`**.
* Beri judul PR: `feat: Direct Message & Chat Room (Salsabila)` lalu kabari Rafli di grup.

---

## ✅ Cara Menguji Fitur secara Mandiri

1. Jalankan `bun dev` di terminal frontend.
2. Klik ikon **Pesan (DM)** baru yang ada di Sidebar kiri atau BottomNav bawah. Halaman harus berpindah ke `/direct/inbox`.
3. Kamu harus melihat daftar chat di kolom kiri dan ruang percakapan aktif di kolom kanan.
4. **Uji Coba Pengiriman Pesan:**
   * Ketik pesan baru di kolom input bawah (misal: *"Halo Adella!"*).
   * Tekan tombol **Enter** atau klik tombol **Kirim**.
   * Bubble chat berwarna biru harus muncul seketika di kolom kanan bagian bawah berisi pesan yang baru kamu ketik!
