# 📋 Task: Yasmin — Explore Grid & Live Search (Pencarian Akun) [PHASE 2]

> **💡 CARA PAKAI DOKUMEN INI:**
> Salin **seluruh isi dokumen ini** ke chat AI (ChatGPT/Claude/Gemini), lalu ketik:
> _"Mulai dari Langkah 1, buatkan kodenya satu per satu."_
> AI akan langsung paham konteks proyek dan stack-nya tanpa perlu penjelasan tambahan.

---

## 🏗️ Konteks Proyek

Di Phase 2 ini, kamu memegang fitur **Explore Page & Live Search (Pencarian Akun)**. Fitur ini sangat penting karena menu pencarian di navigasi Sidebar/BottomNav saat ini belum mengarah ke halaman aktif. Kamu akan menyatukan halaman pencarian dan eksplorasi konten di satu tempat!

- **Stack:** Bun · React + Vite · TypeScript · Tailwind CSS v4 · React Router DOM
- **Kamu cukup fokus ke folder:** `frontend/src/`
- **Backend (ElysiaJS):** Sudah siap di cloud. Kamu akan memanfaatkan endpoint yang sudah ada (`/users` untuk pencarian akun dan `/posts` untuk explore grid).

---

## 🎨 Design System — WAJIB Diikuti

Gunakan variabel warna kustom Instagram yang sudah ada di proyek untuk menjaga konsistensi *dark mode*:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background card / input pencarian |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol aktif) |
| `border-neutral-800`| abu-abu gelap | Border garis pemisah |

---

## 📁 File yang Kamu Kerjakan / Buat Baru

Kamu akan membuat halaman baru dan memperbarui navigasi:

```
frontend/src/
├── pages/
│   └── ExplorePage.tsx                 ← Bikin Baru: Halaman pencarian & grid explore
├── App.tsx                             ← Edit: Tambahkan route /explore
└── components/
    └── layout/
        ├── Sidebar.tsx                 ← Edit: Arahkan menu Search ke /explore
        └── BottomNav.tsx               ← Edit: Arahkan menu Search ke /explore
```

---

## 🔗 Tipe Data (Salin Langsung)

Gunakan tipe data ini untuk mencocokkan respon API dari backend:

```typescript
export interface SearchUserResult {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface ExplorePost {
  id: string;
  imageUrl: string | null;
  content: string;
  _count: {
    likes: number;
    comments: number;
  };
}
```

---

## 📂 Pemisahan File Dummy Data (Saran Arsitektur Bersih)

Agar kode halaman UI-mu tidak penuh dengan tumpukan data teks statis (hardcoded), **sangat disarankan** untuk memisahkan data dummy ke file tersendiri di `frontend/src/lib/mockData.ts`. 

Buat file baru bernama `frontend/src/lib/mockData.ts` dan isi dengan data di bawah ini:

```typescript
import { SearchUserResult, ExplorePost } from "../pages/ExplorePage";

// Dummy data untuk simulasi Live Search:
export const dummySearchUsers: SearchUserResult[] = [
  {
    id: "user-1",
    username: "adella_n",
    name: "Adella Nur",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    bio: "UI Designer & Coffee Lover ☕"
  },
  {
    id: "user-2",
    username: "olivia_naura",
    name: "Olivia Naura",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    bio: "Vite + React enthusiast 💻"
  },
  {
    id: "user-3",
    username: "bagaskara_s",
    name: "Bagaskara",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    bio: "System Analyst in the making 🚀"
  }
];

// Dummy data untuk Explore Grid:
export const dummyExplorePosts: ExplorePost[] = [
  { id: "e-1", imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=500", content: "Beautiful Nature", _count: { likes: 120, comments: 14 } },
  { id: "e-2", imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500", content: "Green fields", _count: { likes: 98, comments: 8 } },
  { id: "e-3", imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500", content: "Forest walkthrough", _count: { likes: 256, comments: 45 } },
  { id: "e-4", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500", content: "Foggy mountains", _count: { likes: 310, comments: 89 } },
  { id: "e-5", imageUrl: "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=500", content: "Sunset Valley", _count: { likes: 184, comments: 23 } },
  { id: "e-6", imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500", content: "Mountain hiker", _count: { likes: 512, comments: 72 } }
];
```

Kamu tinggal meng-import data ini di halaman `ExplorePage.tsx` seperti ini:
```typescript
import { dummySearchUsers, dummyExplorePosts } from "../lib/mockData";
```

---

## 🌐 API Asli yang Akan Digunakan Nanti (Saat Integrasi)

Ketika pengerjaan UI mandiri selesai, kamu tinggal mengganti data dummy di atas dengan fetch API asli dari database cloud yang dikelola Rafli:

1. **Ambil semua pengguna untuk pencarian:**
   * **Endpoint:** `GET {VITE_API_URL}/users`
   * **Response:** `{ data: SearchUserResult[] }`
2. **Ambil postingan explore:**
   * **Endpoint:** `GET {VITE_API_URL}/posts`
   * **Response:** `{ data: ExplorePost[] }`

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### 1️⃣ LANGKAH 1 — Membuat Halaman `ExplorePage.tsx`
Halaman ini memiliki dua kondisi tampilan utama:
1. **Kondisi A (Default - Query Kosong):** Menampilkan kotak pencarian di atas, dan di bawahnya terdapat **Explore Grid** (grid 3-kolom berisi foto-foto postingan acak dari database).
2. **Kondisi B (Sedang Mengetik):** Ketika kolom pencarian diisi, Explore Grid di bawahnya hilang dan digantikan oleh **Live Search Results List** (daftar akun yang nama/usernamenya cocok secara real-time).

* **Spesifikasi UI:**
  * **Search Bar:** Input pencarian di bagian atas dengan ikon kaca pembesar (`Search` dari `lucide-react`) dan tombol hapus teks `X` jika input tidak kosong.
  * **Explore Grid Layout:** Render postingan dengan layout `grid-cols-3` dan efek hover (ketika di-hover, muncul overlay transparan hitam dengan ikon ❤️ dan 💬, mirip seperti di halaman Profil).
  * **Search Results:** Menampilkan baris user berisi avatar (`Avatar` reusable component), username, dan nama lengkap. Jika diklik, sementara bisa arahkan ke `/profile` atau memunculkan notifikasi pop-up.

---

### 2️⃣ LANGKAH 2 — Daftarkan Route Baru di `App.tsx`
Hubungkan halaman baru buatanmu ke sistem navigasi aplikasi.

* **Spesifikasi:**
  * Buka `frontend/src/App.tsx`.
  * Import `ExplorePage` di bagian atas.
  * Tambahkan rute baru di dalam `Routes` di bawah `HomePage`:
    ```tsx
    <Route path="/explore" element={
      <ProtectedRoute>
        <MainLayout>
          <ExplorePage />
        </MainLayout>
      </ProtectedRoute>
    } />
    ```

---

### 3️⃣ LANGKAH 3 — Edit Navigasi (Sidebar & BottomNav)
Memastikan tombol kaca pembesar (Search) mengarah ke halaman buatanmu.

* **Spesifikasi:**
  * Buka `frontend/src/components/layout/Sidebar.tsx` dan `BottomNav.tsx`.
  * Cari item menu pencarian (Search / Kaca Pembesar) yang saat ini mungkin berupa tombol biasa atau memiliki tautan kosong.
  * Ubah navigasinya menggunakan `<Link to="/explore">` atau `navigate('/explore')`.

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding
```bash
git checkout dev
git pull origin dev
git checkout -b yasmin/explore-search
```

### 2. Commit setiap selesai langkah kerja
```bash
git add .
git commit -m "feat(explore): create ExplorePage layout with explore grid"
# Setelah fitur pencarian berfungsi:
git commit -m "feat(search): implement live search filtering for users"
```

### 3. Push ke branch & Buat Pull Request
```bash
git push origin yasmin/explore-search
```
* Buka **GitHub**, buat **Pull Request (PR)** dari branch `yasmin/explore-search` mengarah ke branch **`dev`**.
* Beri judul PR: `feat: Explore Page & Live Search (Yasmin)` lalu kabari Rafli di grup.

---

## ✅ Cara Menguji Fitur secara Mandiri

1. Jalankan `bun dev` di terminal frontend.
2. Klik ikon **Search** di Sidebar kiri atau BottomNav bawah. Layar harus berpindah ke `/explore`.
3. Kamu harus melihat grid foto-foto postingan acak (Explore Grid) di halaman tersebut.
4. **Uji Fitur Pencarian:**
   * Ketik nama akun temanmu (misalnya "adella" atau "olivia") di kolom pencarian.
   * Explore Grid harus langsung menghilang dan digantikan oleh daftar profil akun yang cocok.
   * Klik tombol `X` di kolom pencarian untuk meriset query, daftar pencarian harus hilang, dan Explore Grid harus muncul kembali.
