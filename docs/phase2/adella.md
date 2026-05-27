# 📋 Task: Adella — Instagram Stories (Fitur Cerita) [PHASE 2]

> **💡 CARA PAKAI DOKUMEN INI:**
> Salin **seluruh isi dokumen ini** ke chat AI (ChatGPT/Claude/Gemini), lalu ketik:
> _"Mulai dari Langkah 1, buatkan kodenya satu per satu."_
> AI akan langsung paham konteks proyek dan stack-nya tanpa perlu penjelasan tambahan.

---

## 🏗️ Konteks Proyek

Di Phase 2 ini, kamu akan menambahkan fitur **Instagram Stories (Fitur Cerita)** di bagian paling atas halaman Beranda (*Home Feed*). 
Stories ini akan tampil sebagai barisan avatar melingkar yang bisa di-scroll horizontal. Jika diklik, akan memunculkan *modal viewer* ber-timer 5 detik.

- **Stack:** Bun · React + Vite · TypeScript · Tailwind CSS v4 · React Router DOM
- **Kamu cukup fokus ke folder:** `frontend/src/`
- **Backend (ElysiaJS) & Database:** Sedang diintegrasikan oleh Rafli. Kamu akan menggunakan **Dummy Data** yang sudah disediakan di dokumen ini terlebih dahulu agar bisa langsung mendesain UI & logikanya secara mandiri.

---

## 🎨 Design System — WAJIB Diikuti

Gunakan variabel warna kustom Instagram yang sudah ada di proyek untuk menjaga konsistensi *dark mode*:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background card / popup |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol aktif) |
| `border-neutral-800`| abu-abu gelap | Border garis pemisah |

---

## 📁 File yang Kamu Kerjakan / Buat Baru

Kamu akan membuat folder baru khusus untuk komponen cerita dan mengedit beranda:

```
frontend/src/
├── pages/
│   └── HomePage.tsx                    ← Edit: panggil StoriesRow di atas feed
└── components/
    └── story/                          ← Bikin folder baru ini!
        ├── StoriesRow.tsx              ← Bikin Baru: barisan avatar horizontal
        └── StoryViewer.tsx             ← Bikin Baru: modal pemutar cerita & timer 5s
```

---

---

## 📂 Pemisahan File Dummy Data (Saran Arsitektur Bersih)

Agar kode komponen UI-mu tidak kotor dengan barisan array data yang sangat panjang, **sangat disarankan** untuk meletakkan semua data dummy ke file tersendiri di `frontend/src/lib/mockData.ts` (satu file yang sama dengan milik Yasmin).

Buat (atau edit jika sudah ada) file bernama `frontend/src/lib/mockData.ts` dan tambahkan data di bawah ini:

```typescript
import { UserStoryGroup } from "../components/story/StoriesRow";

export const dummyStories: UserStoryGroup[] = [
  {
    userId: "user-1",
    username: "adella_n",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    hasUnread: true,
    stories: [
      { id: "s-1", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", createdAt: "2026-05-27T10:00:00Z" },
      { id: "s-2", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800", createdAt: "2026-05-27T11:00:00Z" }
    ]
  },
  {
    userId: "user-2",
    username: "yasmin_s",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    hasUnread: true,
    stories: [
      { id: "s-3", imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800", createdAt: "2026-05-27T09:30:00Z" }
    ]
  },
  {
    userId: "user-3",
    username: "olivia_naura",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    hasUnread: false, // Sudah dibaca (lingkaran abu-abu)
    stories: [
      { id: "s-4", imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800", createdAt: "2026-05-27T08:00:00Z" }
    ]
  }
];
```

Kamu tinggal meng-import data ini di halaman `StoriesRow.tsx` seperti ini:
```typescript
import { dummyStories } from "../../lib/mockData";
```

---

## 🔗 Tipe Data (Salin Langsung)

Gunakan tipe data ini untuk mencocokkan struktur data di masa mendatang:

```typescript
export interface ActiveStory {
  id: string;
  imageUrl: string;      // Gambar slide cerita
  createdAt: string;
}

export interface UserStoryGroup {
  userId: string;
  username: string;
  avatarUrl: string;
  hasUnread: boolean;    // Jika true, avatar dilingkari warna gradasi merah-kuning
  stories: ActiveStory[]; // Satu user bisa mengunggah banyak slide story
}
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### 1️⃣ LANGKAH 1 — Membuat Komponen `StoriesRow.tsx`
Komponen ini menampilkan daftar avatar melingkar secara horizontal di atas feed.

* **Spesifikasi Tambahan (Fitur Buat Story):**
  * Baris paling pertama (ujung kiri) **wajib berupa Avatar diri sendiri** (mengambil data user yang sedang login dari `useAuthStore` milik Rafli).
  * Di pojok kanan bawah avatar diri sendiri tersebut, beri **lingkaran biru kecil berisi tanda tambah (+)** khas Instagram untuk menambahkan cerita baru.
  * Ketika avatar diri sendiri dengan tanda "+" ini diklik, sementara munculkan popup Alert: *"Fitur Tambah Cerita Baru akan hadir di Phase 3!"*.
  
* **Spesifikasi Barisan Cerita Lainnya:**
  * Render horizontal list dari `dummyStories` yang bisa di-scroll, sembunyikan scrollbar bawaan browser (`scrollbar-none`).
  * Jika user memiliki story baru (`hasUnread === true`), beri border lingkaran gradasi warna khas Instagram: `bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]`.
  * Jika sudah dibaca (`hasUnread === false`), beri border abu-abu tipis biasa.
  * Ketika salah satu avatar teman diklik, picu state untuk membuka `<StoryViewer />` dengan mengirim data kelompok cerita user tersebut.

---

### 2️⃣ LANGKAH 2 — Membuat Komponen `StoryViewer.tsx` (Modal dengan Timer)
Komponen modal popup fullscreen untuk memutar isi cerita.

* **Spesifikasi:**
  * Menggunakan overlay gelap di seluruh layar (`fixed inset-0 z-50 bg-black/95`).
  * **Progress Bar (Timer 5 Detik):** Di bagian atas, buat garis loading tipis berwarna abu-abu yang terisi penuh warna putih selama 5 detik menggunakan state interval / CSS transition.
  * **Navigasi Otomatis & Manual:**
    * Jika timer 5 detik habis, otomatis pindah ke slide cerita berikutnya milik user tersebut. Jika cerita user tersebut habis, tutup modal.
    * Sediakan tombol panah kiri dan kanan (atau area tap kiri & kanan) untuk berpindah slide secara manual.
    * Sediakan tombol `X` (Close) di pojok kanan atas untuk keluar dari mode viewer kapan saja.
  * **Header:** Menampilkan avatar, username, dan teks penunjuk waktu cerita di atas slide.

---

### 3️⃣ LANGKAH 3 — Integrasi di `HomePage.tsx`
Menggabungkan barisan cerita di halaman depan.

* **Spesifikasi:**
  * Edit `frontend/src/pages/HomePage.tsx`.
  * Letakkan komponen `<StoriesRow />` tepat di atas deretan kartu postingan (`posts.map(...)`) di dalam kolom kiri agar posisinya sejajar dan rapi.
  * Pastikan ada margin bawah yang cukup (`mb-6`) agar cerita dan feed postingan tidak menempel rapat.

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding (ambil kode terbaru Rafli)
```bash
git checkout dev
git pull origin dev
git checkout -b adella/stories-feature
```

### 2. Commit setiap selesai langkah kerja
```bash
git add .
git commit -m "feat(story): add StoriesRow horizontal component"
# Setelah modal viewer selesai:
git commit -m "feat(story): add StoryViewer with 5s progress bar timer"
```

### 3. Push ke GitHub & Buat Pull Request
```bash
git push origin adella/stories-feature
```
* Buka **GitHub**, buat **Pull Request (PR)** dari branch `adella/stories-feature` mengarah ke branch **`dev`** (bukan `main`!).
* Beri judul PR: `feat: Instagram Stories Component (Adella)` lalu kabari Rafli di grup.

---

## ✅ Cara Menguji Fitur secara Mandiri

1. Jalankan `bun dev` di terminal frontend.
2. Lingkaran profil stories harus muncul berderet horizontal di atas feed postingan.
3. Coba **klik lingkaran profil** milik salah satu user.
4. **Yang harus terjadi:**
   * Modal pemutar cerita berwarna hitam muncul menutupi layar.
   * Garis loading putih di atas layar bergerak penuh dari kiri ke kanan.
   * Setelah 5 detik, gambar otomatis berganti ke slide berikutnya atau modal tertutup jika cerita habis.
   * Tombol `X` berhasil menutup modal seketika.
