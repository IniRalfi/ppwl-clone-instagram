# 📋 Task: Bagas — Sistem Bookmark / Simpan Postingan (Saved Tab) [PHASE 2]

> **💡 CARA PAKAI DOKUMEN INI:**
> Salin **seluruh isi dokumen ini** ke chat AI (ChatGPT/Claude/Gemini), lalu ketik:
> _"Mulai dari Langkah 1, buatkan kodenya satu per satu."_
> AI akan langsung paham konteks proyek dan stack-nya tanpa perlu penjelasan tambahan.

---

## 🏗️ Konteks Proyek

Di Phase 2 ini, kamu memegang fitur **Sistem Bookmark / Simpan Postingan (Saved Tab)**. 
Saat ini, tombol Bookmark (ikon pita di kanan bawah kartu postingan) hanyalah tombol hiasan statis. Kamu akan membuat tombol tersebut interaktif. Postingan yang telah di-bookmark oleh user akan terkumpul dan ditampilkan di tab khusus bernama **"Disimpan" (Saved)** di halaman Profil.

- **Stack:** Bun · React + Vite · TypeScript · Tailwind CSS v4 · React Router DOM
- **Kamu cukup fokus ke folder:** `frontend/src/`
- **Backend (ElysiaJS):** Sedang diintegrasikan oleh Rafli. Kamu akan menggunakan **Dummy Data** yang diletakkan di file terpisah agar bisa mendesain UI & logikanya secara mandiri terlebih dahulu.

---

## 🎨 Design System — WAJIB Diikuti

Gunakan variabel warna kustom Instagram yang sudah ada di proyek untuk menjaga konsistensi *dark mode*:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background grid / panel |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol aktif) |
| `border-neutral-800`| abu-abu gelap | Border garis pemisah |

---

## 📁 File yang Kamu Kerjakan / Buat Baru

Kamu akan mengedit komponen kartu postingan, membuat file dummy, dan berkolaborasi dengan Olivia untuk menambahkan tab di halaman Profil:

```
frontend/src/
├── components/
│   └── post/
│       └── PostCard.tsx                ← Edit: Hubungkan tombol Bookmark agar interaktif
├── pages/
│   └── ProfilePage.tsx                 ← Edit (Kolaborasi dengan Olivia): Tambahkan Tab "Disimpan"
└── lib/
    └── mockData.ts             ---

## 📂 Pemisahan File Dummy Data (Saran Arsitektur Bersih)

Agar komponen halaman UI tetap bersih dari data statis yang sangat panjang, kamu harus menyatukan semua data dummy di file `frontend/src/lib/mockData.ts` (file yang sama dengan milik Adella, Yasmin, & Olivia).

Buka (atau buat jika belum ada) file `frontend/src/lib/mockData.ts` dan tambahkan data di bawah ini:

```typescript
export interface PostTag {
  username: string;
  x: number; // Persentase dari kiri gambar (0-100)
  y: number; // Persentase dari atas gambar (0-100)
}

export interface SavedPost {
  id: string;
  imageUrl: string | null;
  content: string;
  tags?: PostTag[]; // Data tag akun teman di dalam foto
  _count: {
    likes: number;
    comments: number;
  };
}

// Dummy data postingan yang disimpan (Saved Posts) lengkap dengan tag teman:
export const dummySavedPosts: SavedPost[] = [
  { 
    id: "e-3", 
    imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500", 
    content: "Forest walkthrough with friends!", 
    tags: [
      { username: "adella_n", x: 45, y: 60 },
      { username: "olivia_naura", x: 70, y: 40 }
    ],
    _count: { likes: 256, comments: 45 } 
  },
  { 
    id: "e-5", 
    imageUrl: "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=500", 
    content: "Sunset Valley", 
    tags: [
      { username: "yasmin_s", x: 30, y: 55 }
    ],
    _count: { likes: 184, comments: 23 } 
  }
];
```

Kamu tinggal meng-import data ini di halaman `ProfilePage.tsx`:
```typescript
import { dummySavedPosts } from "../lib/mockData";
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### 1️⃣ LANGKAH 1 — Membuat Tombol Bookmark di `PostCard.tsx` Interaktif
Tombol pita bookmark di sudut kanan bawah setiap postingan harus bisa merubah state ketika diklik.

* **Spesifikasi UI:**
  * Buka `frontend/src/components/post/PostCard.tsx`.
  * Tambahkan state `isBookmarked` (boolean).
  * Pada tombol Bookmark (ikon pita dari `lucide-react` / svg):
    * Jika `isBookmarked === true`, ubah warna ikon menjadi penuh (fill berwarna putih/teks utama).
    * Jika `isBookmarked === false`, biarkan ikon hanya berupa garis luar (stroke).
  * Tambahkan animasi micro-scale saat ikon ditekan (`active:scale-95`).

---

### 2️⃣ LANGKAH 2 — Membuat Sistem Tab Navigation di `ProfilePage.tsx`
Memecah tampilan bawah halaman Profil menjadi dua tab: "POSTINGAN" dan "DISIMPAN".

* **Spesifikasi UI (Bekerjasama dengan Olivia):**
  * Buka `frontend/src/pages/ProfilePage.tsx`.
  * Di atas grid postingan, tambahkan bar navigasi tab berisi dua tombol:
    1. 📱 **POSTINGAN** (menampilkan grid postingan milik sendiri).
    2. 🔖 **DISIMPAN** (menampilkan grid postingan yang di-bookmark).
  * Gunakan state `activeTab` ("posts" | "saved") untuk mengatur tab mana yang aktif.
  * Beri efek garis bawah putih tebal pada tombol tab yang sedang aktif untuk memperjelas visual user (persis seperti IG asli).

---

### 3️⃣ LANGKAH 3 — Render Grid Postingan "Disimpan"
Menampilkan postingan yang di-bookmark saat tab "Disimpan" aktif.

* **Spesifikasi:**
  * Ketika `activeTab === "saved"`, sembunyikan postingan milik sendiri dan render grid 3-kolom baru menggunakan data `dummySavedPosts`.
  * Terapkan style grid dan hover overlay yang sama (ikon ❤️ dan 💬 saat kursor di atas gambar) agar visualnya konsisten dengan tab Postingan utama.
  * Jika daftar `dummySavedPosts` kosong, tampilkan *Empty State* yang cantik: ikon Bookmark besar, judul *"Simpan Postingan"*, dan deskripsi *"Simpan foto yang ingin kamu lihat lagi. Tidak ada yang akan diberi tahu."*

---

### 4️⃣ LANGKAH 4 — Membuat Fitur Tandai Teman (Photo Tagging)
Ketika gambar postingan diklik sekali, tag berupa nama teman akan muncul mengambang di atas gambar di titik koordinat persis yang ditentukan. Klik lagi untuk menyembunyikannya.

* **Spesifikasi UI:**
  * Buka `frontend/src/components/post/PostCard.tsx`.
  * Bungkus elemen `<img>` postingan di dalam kontainer `relative overflow-hidden cursor-pointer`.
  * Tambahkan state `showTags` (boolean, default `false`).
  * Pasang *click event* pada kontainer gambar agar ketika diklik memicu `setShowTags(!showTags)`.
  * **Rendering Tag Tooltip:**
    * Jika `showTags === true` dan data `tags` tersedia, lakukan *mapping* untuk merender tag melayang absolut di atas gambar:
      ```tsx
      <div 
        style={{ left: `${tag.x}%`, top: `${tag.y}%` }} 
        className="absolute -translate-x-1/2 -translate-y-1/2 bg-black/85 text-white text-xs px-2.5 py-1.5 rounded-md font-semibold pointer-events-none transition-opacity duration-200"
      >
        @{tag.username}
      </div>
      ```
    * Di pojok kiri bawah gambar postingan, tambahkan pula tombol kecil lingkaran hitam transparan bergambar ikon tag orang (`User` dari `lucide-react`) sebagai indikator penunjuk bahwa foto tersebut memiliki tag tersembunyi.

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding
```bash
git checkout dev
git pull origin dev
git checkout -b bagas/saved-posts-tagging
```

### 2. Commit setiap selesai langkah kerja
```bash
git add .
git commit -m "feat(bookmark): make PostCard bookmark button interactive"
git commit -m "feat(tagging): implement click-to-show photo tagging tooltips"
# Setelah sistem tab & saved grid selesai:
git commit -m "feat(profile): implement Saved tab with bookmarks grid"
```

### 3. Push ke branch & Buat Pull Request
```bash
git push origin bagas/saved-posts-tagging
```
* Buka **GitHub**, buat **Pull Request (PR)** dari branch `bagas/saved-posts-tagging` mengarah ke branch **`dev`**.
* Beri judul PR: `feat: Bookmarks, Profile Saved Tab & Photo Tagging (Bagas)` lalu kabari Rafli di grup.

---

## ✅ Cara Menguji Fitur secara Mandiri

1. Jalankan `bun dev` di terminal frontend.
2. Buka beranda, coba klik tombol **Bookmark** di postingan mana saja. Ikon pita harus berubah warna menjadi padat (*filled*).
3. **Uji Coba Photo Tagging:**
   * Klik sekali pada gambar postingan yang memiliki tag (misalnya postingan dengan isi *"Forest walkthrough"*).
   * **Yang harus terjadi:** Tooltip hitam berisi nama akun (seperti `@adella_n` dan `@olivia_naura`) harus muncul tepat di atas posisi orang tersebut di foto.
   * Klik gambar sekali lagi, tooltip harus menghilang secara instan.
4. Masuk ke halaman **Profil** (`/profile`).
5. Kamu harus melihat ada dua tab di atas grid postingan: **POSTINGAN** dan **DISIMPAN**.
6. Klik tab **DISIMPAN**:
   * Grid harus berubah menampilkan daftar postingan dummy yang tersimpan (`dummySavedPosts`).
   * Grid postingan milikmu sendiri harus disembunyikan.
7. Klik tab **POSTINGAN** kembali, tampilan harus kembali normal menampilkan postingan milikmu sendiri.

