# 📈 Progress Tracker — PPWL Instagram Clone

Dokumen ini digunakan untuk melacak kemajuan pengerjaan fitur, optimalisasi infrastruktur, dan perbaikan bug secara terstruktur.

---

## 🛠️ Ringkasan Status Utama

| Kategori | Target Pekerjaan | Estimasi Kompleksitas | Status |
| :--- | :--- | :---: | :---: |
| 🟢 **Bug Fix** | Menyelesaikan 20 Bug di `bug_report.md` | Sedang | **SELESAI** (100%) |
| 🔵 **Phase 2** | Integrasi Backend & DB untuk Fitur Tim | Tinggi | **SELESAI** (100%) |
| 🟡 **Infrastruktur**| Optimasi AWS, S3 Bucket CDN, & DB Production | Tinggi | **SELESAI** (90%) |
| 🟣 **Frontend** | Poles UX, Animasi, & Detail Styling | Rendah | **SELESAI** (100%) |

---

## 📋 Detail To-Do List Pekerjaan

### 🟢 Fase 1: Perbaikan Bug (Done)
- [x] BUG-01 s.d. BUG-20: Selesai di-commit secara rapi dan berhasil dikompilasi.

### 🔵 Fase 2: Integrasi Backend Tim (Sedang Berjalan)
- [x] **Adella (Stories):**
  - [x] Tambah model `Story` di `schema.prisma`.
  - [x] Jalankan `prisma db push`.
  - [x] Buat rute `POST /stories` (Upload gambar & simpan masa aktif 24 jam).
  - [x] Buat rute `GET /stories` (Mengambil & mengelompokkan active stories per user).
- [x] **Yasmin (Explore & Live Search):**
  - [x] Tambahkan filter parameter query `?search=...` di `GET /users` (pencarian case-insensitive pada kolom `name` dan `username`).
  - [x] Integrasikan halaman `ExplorePage` dengan live API `/users?search=` dan grid postingan riil `/posts` dari database.
- [x] **Bagas (Bookmark / Saved Post):**
  - [x] Tambahkan model `Bookmark` / `SavedPost` di `schema.prisma`.
  - [x] Jalankan `prisma db push`.
  - [x] Buat rute `POST /posts/:id/bookmark` (Toggle simpan/batal simpan postingan).
  - [x] Buat rute `GET /posts/saved` (Mengambil semua postingan yang di-bookmark oleh user aktif).
- [x] **Olivia (Edit Profile & Followers List):**
  - [x] Buat rute `GET /follow/followers/:userId` (Mengambil daftar lengkap user pengikut).
  - [x] Buat rute `GET /follow/following/:userId` (Mengambil daftar lengkap user yang diikuti).
  - [x] Buat rute `PUT /users/profile` (Update profil: `name`, `bio`, dan `avatarUrl`).
  - [x] Buat rute dinamis `/profile/:username?` untuk melihat profil pengguna lain secara interaktif dengan tombol follow/following.
- [x] **Salsabila (Direct Message Chat):**
  - [x] Tambahkan model `Message` dan `ChatRoom` di `schema.prisma` untuk menyimpan chat.
  - [x] Jalankan `prisma db push`.
  - [x] Buat rute `GET /messages/rooms` (Mengambil daftar obrolan aktif beserta info pesan terakhir).
  - [x] Buat rute `GET /messages/:roomId` (Mengambil riwayat obrolan lengkap).
  - [x] Buat rute `POST /messages` (Kirim pesan baru ke user lain).

### 🟡 Fase 3: Infrastruktur & AWS CDN
- [x] Buat S3 Bucket di AWS dan konfigurasi SDK S3 di backend.
- [x] Buat fallback service: Gunakan S3 sebagai CDN utama, dan jika gagal otomatis fallback menggunakan Cloudinary.
- [x] Sederhanakan database production ke satu instance Neon PostgreSQL utama yang solid dan cepat (membersihkan konfigurasi dual database active-active).
- [x] Buat halaman Live Service Monitoring Dashboard di frontend untuk memantau status kesehatan database, S3, dan Cloudinary secara real-time.
- [ ] Buat skrip otomatisasi cron backup berkala database ke storage S3.

### 🟣 Fase 4: Poles Frontend & UX
- [x] Implementasikan loading skeleton di feed utama dan profil saat fetching data.
- [x] Tambahkan animasi mikro transisi hover pada tombol interaksi postingan.
- [x] Terapkan debounce pencarian 300ms dan debounce hover stats 250ms untuk mencegah overloading koneksi database.
