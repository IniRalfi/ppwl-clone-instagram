# 📋 Task: Olivia — Popup Followers/Following & Real Edit Profile [PHASE 2]

> **💡 CARA PAKAI DOKUMEN INI:**
> Salin **seluruh isi dokumen ini** ke chat AI (ChatGPT/Claude/Gemini), lalu ketik:
> _"Mulai dari Langkah 1, buatkan kodenya satu per satu."_
> AI akan langsung paham konteks proyek dan stack-nya tanpa perlu penjelasan tambahan.

---

## 🏗️ Konteks Proyek

Di Phase 2 ini, kamu memegang salah satu revisi krusial dari asdos: **"UI edit belum, popup following/-ers"**. 
Kamu akan merubah statistik mati di halaman Profil (`ProfilePage.tsx`) menjadi interaktif. Ketika jumlah pengikut/mengikuti diklik, akan muncul modal pop-up daftar akun. Begitu juga tombol Edit Profil, kini harus bisa membuka form edit data diri.

- **Stack:** Bun · React + Vite · TypeScript · Tailwind CSS v4 · React Router DOM
- **Kamu cukup fokus ke folder:** `frontend/src/`
- **Backend (ElysiaJS) & Database:** Sedang dikerjakan oleh Rafli. Kamu akan menggunakan **Dummy Data** yang diisolasi di file terpisah agar bisa mendesain UI & logikanya secara mandiri terlebih dahulu.

---

## 🎨 Design System — WAJIB Diikuti

Gunakan variabel warna kustom Instagram yang sudah ada di proyek untuk menjaga konsistensi *dark mode*:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background modal / panel |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol aktif / konfirmasi) |
| `border-neutral-800`| abu-abu gelap | Border modal / garis pemisah |

---

## 📁 File yang Kamu Kerjakan / Buat Baru

Kamu akan mengedit halaman profil dan menaruh semua data mock di file terpisah:

```
frontend/src/
├── pages/
│   └── ProfilePage.tsx                 ← Edit: Integrasikan modal Edit Profil & modal Followers/Following
└── lib/
    └── mockData.ts                     ← Edit: Tambahkan dummy data list followers/following di sini
```

---

## 📂 Pemisahan File Dummy Data (Saran Arsitektur Bersih)

Agar komponen halaman UI tetap bersih dari data statis yang sangat panjang, kamu harus menyatukan semua data dummy di file `frontend/src/lib/mockData.ts` (file yang sama dengan milik Adella & Yasmin).

Buka (atau buat jika belum ada) file `frontend/src/lib/mockData.ts` dan tambahkan data di bawah ini:

```typescript
export interface FollowUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowingBack: boolean; // Menentukan teks tombol (Ikuti / Mengikuti)
}

// Dummy data pengikut (Followers):
export const dummyFollowers: FollowUser[] = [
  { id: "f-1", username: "adella_n", name: "Adella Nur", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", isFollowingBack: true },
  { id: "f-2", username: "yasmin_s", name: "Yasmin Salsabila", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", isFollowingBack: false }
];

// Dummy data yang diikuti (Following):
export const dummyFollowing: FollowUser[] = [
  { id: "f-1", username: "adella_n", name: "Adella Nur", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", isFollowingBack: true },
  { id: "f-3", username: "bagaskara_s", name: "Bagaskara", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", isFollowingBack: true }
];
```

Kamu tinggal meng-import data ini di halaman `ProfilePage.tsx`:
```typescript
import { dummyFollowers, dummyFollowing } from "../lib/mockData";
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### 1️⃣ LANGKAH 1 — Membuat Modal Popup "Followers & Following"
Modal popup cantik yang muncul di tengah layar ketika angka statistik profil diklik.

* **Spesifikasi UI:**
  * Di `ProfilePage.tsx`, buat area statistik pengikut dan mengikuti menjadi tombol yang bisa diklik (`cursor-pointer`).
  * Buat modal overlay (`fixed inset-0 z-50 bg-black/60 flex items-center justify-center`) yang berisi box kecil (`w-full max-w-[400px] bg-ig-secondary-bg border border-neutral-800 rounded-xl overflow-hidden`).
  * **Header Modal:** Menampilkan judul ("Pengikut" atau "Mengikuti") dengan tombol tutup `X` di sebelah kanan.
  * **Body Modal:** Render horizontal list berisi avatar (`Avatar` component), username, nama lengkap, dan di sebelah kanan terdapat tombol interaktif **"Hapus"** (untuk Followers) atau **"Mengikuti/Ikuti"** (untuk Following).

---

### 2️⃣ LANGKAH 2 — Membuat Modal Popup "Edit Profil"
Modal yang muncul ketika tombol "Edit Profil" diklik.

* **Spesifikasi UI:**
  * Buat modal overlay yang memuat form edit data diri.
  * **Form Inputs:**
    1. **Nama Lengkap** (`name`)
    2. **Username** (`username`)
    3. **Bio** (`bio`)
    4. **Foto Profil / Avatar URL** (berupa input text sederhana sementara untuk mengganti URL gambar avatar).
  * **Aksi Form:**
    * Tombol **Batal** untuk menutup modal tanpa menyimpan.
    * Tombol **Simpan** untuk menyimpan data ke State lokal (atau panggil fungsi update jika nanti backend sudah siap).
    * *Tips:* Saat diklik Simpan, kamu bisa mengupdate state lokal atau jika ingin lebih keren, update data user di `useAuthStore` secara dinamis agar seluruh aplikasi ikut berubah!

---

### 3️⃣ LANGKAH 3 — Pasang Logika State Modal di `ProfilePage.tsx`
Menggabungkan semua modal ke dalam siklus rendering halaman Profil.

* **Spesifikasi:**
  * Buka `frontend/src/pages/ProfilePage.tsx`.
  * Tambahkan 3 state baru untuk mengontrol kemunculan modal:
    * `isEditModalOpen` (boolean)
    * `isFollowersModalOpen` (boolean)
    * `isFollowingModalOpen` (boolean)
  * Render modal-modal tersebut secara kondisional di bagian bawah JSX:
    ```tsx
    {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}
    {isFollowersModalOpen && <FollowersModal onClose={() => setIsFollowersModalOpen(false)} />}
    {isFollowingModalOpen && <FollowingModal onClose={() => setIsFollowingModalOpen(false)} />}
    ```

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding
```bash
git checkout dev
git pull origin dev
git checkout -b olivia/profile-modals
```

### 2. Commit setiap selesai langkah kerja
```bash
git add .
git commit -m "feat(profile): add Followers and Following list popups"
# Setelah modal edit profil selesai:
git commit -m "feat(profile): add functional Edit Profile modal"
```

### 3. Push ke branch & Buat Pull Request
```bash
git push origin olivia/profile-modals
```
* Buka **GitHub**, buat **Pull Request (PR)** dari branch `olivia/profile-modals` mengarah ke branch **`dev`**.
* Beri judul PR: `feat: Edit Profile & Followers Popups (Olivia)` lalu kabari Rafli di grup.

---

## ✅ Cara Menguji Fitur secara Mandiri

1. Jalankan `bun dev` di terminal frontend.
2. Masuk ke halaman **Profil** (`/profile`).
3. **Uji Coba Modal Followers:**
   * Klik teks atau angka "pengikut". Modal daftar pengikut harus muncul di tengah layar menampilkan list user.
   * Klik tombol `X` atau klik area gelap luar modal, modal harus langsung menutup.
4. **Uji Coba Modal Following:**
   * Klik teks "mengikuti". Modal harus muncul berisi daftar orang yang kamu ikuti.
5. **Uji Coba Edit Profil:**
   * Klik tombol **Edit Profil**. Modal form edit harus terbuka.
   * Ubah nama lengkap dan tulis bio baru, lalu klik **Simpan**.
   * Modal harus menutup dan data Nama serta Bio di halaman Profil harus langsung berubah saat itu juga!
