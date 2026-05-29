# 📝 Changelog — PPWL Instagram Clone (Instafy)

Dokumen ini mencatat riwayat perubahan, pembaruan fitur, perbaikan keamanan, optimasi, dan perbaikan bug pada aplikasi Instafy secara kronologis.

---

## [v1.5.0] - 2026-05-30

### 🔒 Security & CORS Hardening (Production deployment)
- **SameSite Cross-Site Cookie Sharing**:
  - Mengubah opsi cookie JWT `sameSite` menjadi `"none"` dan `secure: true` saat di-deploy di production.
  - Memungkinkan pengiriman cookie otentikasi secara aman lintas domain (dari frontend `www.ppwl-a3.my.id` ke backend AWS Lambda Function URL `lambda-url.us-east-1.on.aws`).
  - Menyelesaikan masalah user ter-logout mendadak setelah login sukses (karena error `401 Unauthorized` pada endpoint data).
- **Elysia Route Grouping for Rate Limits**:
  - Memperbaiki penataan plugin `authRateLimit` di backend dengan memasukkannya ke dalam sub-group Elysia khusus (`.group("", (app) => app.use(authRateLimit)...)`).
  - Menyelesaikan runtime error `onBeforeHandle is not a function` pada route login.

### 🎨 Story Editor Canvas Fixes
- **Mobile Touch Event Support**:
  - Menambahkan penanganan event sentuhan (`onTouchStart`, `onTouchMove`, `onTouchEnd`) pada Canvas Editor Cerita.
  - Menyetel style CSS `touchAction: "none"` pada canvas untuk mencegah browser mencegat sentuhan/geseran (seperti scroll halaman) saat menggambar atau memposisikan foto.
  - Menyelesaikan bug di mana foto cerita tidak bisa digeser dan kuas coret tidak responsif pada perangkat layar sentuh/mobile.
- **Rapat Layout Spacing (Mobile Optimization)**:
  - Memangkas jarak berlebih (*empty margins/gap*) antara kanvas foto dan panel kontrol editor di mobile.
  - Mengatur batas tinggi maksimal kanvas menjadi `max-h-[50vh]` di mobile agar panel editor terangkat dan langsung terlihat oleh pengguna tanpa perlu scroll jauh ke bawah.
  - Menambahkan animasi badge status `Editor Aktif` yang berkedip (*pulse*) dan indikator geser dengan ikon yang memantul (*bounce*) sebagai pemandu visual pengguna.

---

## [v1.4.0] - 2026-05-28

### 📊 Code Audit Report & Roadmap Planning
- **Code Audit Report** (`docs/CODE_AUDIT_REPORT.md`):
  - Audit keamanan dan performa menyeluruh terhadap seluruh codebase (Backend ElysiaJS & Frontend React/Vite).
  - **24 temuan** dikategorikan dalam 3 area: Bug & Kerentanan (11), Performa & Algoritma (7), Spaghetti Code (6).
  - Temuan kritis meliputi: race condition pada toggle (like/follow), JWT tanpa expiry time, admin endpoints terbuka tanpa API key, kebocoran password hash, dan N+1 query.
- **Development Roadmap** (`docs/ROADMAP.md`):
  - Rencana kerja 5 fase ke depan (Security Patches → Security Hardening → Performance Optimization → DB Migration → Realtime → Refactoring).

---

## [v1.3.0] - 2026-05-28

### ➕ Added (Ditambahkan)
- **Instafy Story Editor Canvas** (`StoryEditorModal.tsx`):
  - Editor kanvas HTML5 sebelum upload cerita: drag & slider posisi foto, zoom skala, pilihan warna/gradien latar, preset filter dengan live preview, kuas lukis (dengan fitur undo), dan teks kustom 5 gaya font dengan drag-to-reposition.
- **Instafy Post Editor**:
  - Dukungan multi-image carousel, filter preset, aspek rasio kustom (1:1, 4:5, 16:9) di halaman `CreatePostPage.tsx`.
- **Profile Image Editor Modal**:
  - Fitur Crop, zoom, dan filter preset untuk memperbarui foto profil.
- **Komentar & Feed Improvements**:
  - Emoji picker komentar terintegrasi (`emoji-picker-react`) dengan tema gelap/terang otomatis.
  - Infinite scroll komentar berbasis cursor-pagination di halaman detail postingan.
  - Fitur menyukai komentar (*comment likes*) disertai dengan trigger notifikasi realtime.

---

## [v1.2.0] - 2026-05-28

### ➕ Added (Ditambahkan)
- **Stories Row Component**:
  - Komponen baris cerita horizontal (`StoriesRow`) di bagian atas feed halaman utama.
  - Fitur modal penampil cerita (`StoryViewer`) dengan pemutar otomatis berdurasi 5 detik per cerita serta navigasi tombol keyboard (`Escape`, `ArrowRight`, `ArrowLeft`).
- **Tab Postingan Disimpan (Saved Tab)**:
  - Tab "Disimpan" (_Saved_) di profil user untuk melihat postingan yang telah di-bookmark. Dibatasi secara privat hanya untuk pemilik akun sendiri.

### 🔧 Fixed & Integrated
- **Bookmark API Integration**:
  - Sinkronisasi tombol bookmark di `PostCard.tsx` dengan database (`POST /posts/:id/bookmark`) secara real-time beserta status loading preventif.
- **Tim Merge & Kestabilan**:
  - Menyelesaikan konflik merge cabang antar anggota tim di `HomePage.tsx` dan `ProfilePage.tsx` serta memperbaiki tipe data yang rusak di `mockData.ts`.

---

## [v1.1.0] - 2026-05-27

### ➕ Added (Ditambahkan)
- **AWS S3 Database Backup Automation**:
  - Skrip backup database PostgreSQL otomatis terkompresi gzip (`backend/src/scripts/backup.ts`) ke bucket AWS S3.
  - Menambahkan endpoint REST API `POST /data/backup` dilindungi API key untuk memicu backup manual.
- **Auto-Logout Global**:
  - Menambahkan interceptor HTTP response 401 Unauthorized di frontend (`api.client.ts`) untuk menghapus session store dan redirect ke `/login` jika token kedaluwarsa.

### 🔧 20 Major Bug Fixes
- **BUG-01 (Security)**: Hashing password dengan `bcryptjs` (menggantikan penyimpanan plain text).
- **BUG-02 (Security)**: Proteksi JWT verifikasi token pada endpoint sensitif (likes, posts, comments, follow).
- **BUG-03 (Security)**: Mengganti token JWT dummy statis dengan plugin dynamic signing JWT Elysia.
- **BUG-04 (Performance)**: Mengatasi N+1 query problem di feed utama dengan menyertakan `isLikedByMe` langsung dari endpoint `GET /posts`.
- **BUG-05 (Performance)**: Query profil user mengambil post spesifik langsung dari database alih-alih filter memori di frontend.
- **BUG-07 (DB)**: Sinkronisasi otomatis field statistik `postCount` di database saat membuat/menghapus postingan.
- **BUG-12 (Security)**: Menyaring kembalian notifikasi (`GET /notifications`) berdasarkan ID pengguna yang sedang masuk.
- **BUG-13 (Security)**: Menyembunyikan alamat email pengguna lain dari data publik endpoint `GET /users`.
- **BUG-15 (UI/UX)**: Membangun antarmuka pendaftaran (`RegisterPage.tsx`) yang sebelumnya kosong.

---

## [v1.0.0] - 2026-05-26

### ➕ Added (Ditambahkan)
- **Live Search & Explore Grid**:
  - Fitur pencarian pengguna berbasis query parameter `?search=...` (case-insensitive) di backend.
  - Grid postingan dinamis pada halaman `ExplorePage` terintegrasi database riil.
- **Dasbor Monitoring**:
  - Halaman monitoring status kesehatan server, latency database PostgreSQL, S3 bucket, dan Cloudinary API.
