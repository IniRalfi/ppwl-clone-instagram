# 📝 Changelog — PPWL Instagram Clone

Dokumen ini mencatat riwayat perubahan, pembaruan fitur, optimasi, dan perbaikan bug pada aplikasi secara kronologis.

---

## [v1.2.0] - 2026-05-28
### Added (Ditambahkan)
- **Stories Component (Adella)**:
  - Integrasi komponen baris cerita horizontal (`StoriesRow`) di bagian atas feed halaman utama (`HomePage`).
  - Fitur modal penampil cerita (`StoryViewer`) dengan pemutar otomatis berlatensi 5 detik per cerita.
  - Dukungan navigasi keyboard di penampil cerita (`Escape` untuk menutup, `ArrowRight` untuk maju, `ArrowLeft` untuk mundur).
- **Tab Postingan Disimpan (Bagas)**:
  - Menambahkan tab "Disimpan" (*Saved*) di halaman profil (`ProfilePage`) untuk menampilkan postingan yang di-bookmark.
  - Membatasi visibilitas tab "Disimpan" agar hanya dapat diakses oleh pemilik profil yang bersangkutan (menjaga privasi data user).

### Fixed & Integrated (Diperbaiki & Diintegrasikan)
- **Koneksi Database Riil untuk Bookmark (Bagas)**:
  - Mengintegrasikan tombol bookmark di `PostCard.tsx` dengan API backend (`POST /posts/:id/bookmark`) secara real-time.
  - Menambahkan *loading state* pada bookmark untuk mencegah klik ganda dan inkonsistensi state data.
  - Mengintegrasikan data tab "Disimpan" secara riil melalui pemanggilan API backend (`GET /posts/saved`).
- **Resolusi Konflik Gabungan Tim**:
  - Menyelesaikan konflik merge cabang `adella/stories-feature` and `bagas/saved-posts-tagging` di file `HomePage.tsx`, `PostCard.tsx`, dan `ProfilePage.tsx`.
  - Memperbaiki sintaks array `dummyStories` yang terpotong di `mockData.ts` sehingga aplikasi dapat dikompilasi ulang tanpa error.

---

## [v1.1.0] - 2026-05-27
### Added (Ditambahkan)
- **Sistem Otomatisasi Backup AWS S3**:
  - Membuat skrip backup database PostgreSQL otomatis menggunakan format compressed gzip (`backend/src/scripts/backup.ts`).
  - Menambahkan endpoint REST API `POST /data/backup` untuk memicu backup manual.
  - Mengintegrasikan tombol pemicu backup manual pada halaman dasbor monitoring.
- **Auto-Logout Global**:
  - Menambahkan interceptor HTTP response 401 Unauthorized di frontend (`api.client.ts`).
  - Otomatis membersihkan Zustand store dan localStorage serta mengarahkan ke `/login` jika token JWT kedaluwarsa atau server di-restart/reseed.

### Optimized (Dioptimalkan)
- **Sistem Caching In-Memory Backend**:
  - Membuat modul `MemoryCache` dengan dukungan TTL (*Time-To-Live*) dan pembatalan otomatis berbasis pola (*Pattern Invalidation*).
  - Menerapkan cache pada kueri list postingan (`GET /posts`) dan detail postingan (`GET /posts/:id`) guna menurunkan latensi di bawah 5ms.
  - Menambahkan invalidasi cache otomatis pada mutasi data (membuat postingan, menghapus, like/unlike, komentar, bookmark).
- **Optimasi Indeks PostgreSQL**:
  - Menambahkan indeks (`@@index`) pada Prisma Schema (`schema.prisma`) untuk seluruh kolom foreign key guna mempercepat query JOIN secara instan.
- **Pembersihan & Refaktorisasi Halaman Profil**:
  - Memisahkan komponen modal internal dari `ProfilePage.tsx` menjadi file modul indeks (`EditProfileModal.tsx`, `FollowersModal.tsx`, `FollowingModal.tsx`).
- **Presisi Visual Grid Instagram**:
  - Menyesuaikan rasio gambar feed (`PostCard`) dan placeholder loading (`PostSkeleton`) menjadi rasio standar Instagram **4:5** (`aspect-[4/5]`).
  - Memperbaiki typo merek "Instagaram" menjadi "Instagram" pada navigasi sidebar dan mengecilkan ukuran teks menu menjadi `14px` standard.

- **Penyelesaian 20 Bugs Utama (Migrasi dari bug_report.md)**:
  - **BUG-01 (Keamanan)**: Enkripsi password menggunakan hashing Argon2 (sebelumnya plain text).
  - **BUG-02 (Keamanan)**: Proteksi endpoint sensitif (likes, posts, comments, follow) dengan JWT middleware verifikasi token.
  - **BUG-03 (Keamanan)**: Mengganti token JWT dummy statis dengan implementasi dynamic signing JWT plugin Elysia.
  - **BUG-04 (Performa)**: Mengatasi N+1 query problem di feed utama dengan menyertakan `isLikedByMe` langsung dari endpoint `GET /posts`.
  - **BUG-05 (Performa)**: Mengoptimasi query profil user (`GET /posts?authorId=...`) untuk mengambil post spesifik dari database alih-alih filter memori di frontend.
  - **BUG-06 (UI/UX)**: Menghapus data stats hover card yang hardcoded `"0"` dengan data aslinya.
  - **BUG-07 (DB)**: Sinkronisasi field statistik `postCount` di database saat membuat/menghapus postingan.
  - **BUG-08 (UI/UX)**: Memperbaiki status penanda follow/unfollow di hover card agar tidak bernilai true ketika request gagal.
  - **BUG-09 (Kestabilan)**: Menambahkan blok penanganan error (try-catch) pada endpoint status like.
  - **BUG-10 (UI/UX)**: Memperbaiki format ringkasan pesan notifikasi komentar pendek agar tanda elipsis (`...`) tidak muncul secara berlebihan.
  - **BUG-11 (Kualitas Kode)**: Menyeragamkan seluruh request REST API di frontend agar melewati `apiClient` terpusat dan tidak mencampuradukkan `fetch` langsung.
  - **BUG-12 (Keamanan)**: Menyaring notifikasi (`GET /notifications`) berdasarkan ID pengguna yang sedang masuk.
  - **BUG-13 (Keamanan)**: Menyembunyikan alamat email pengguna lain dari kembalian data publik endpoint `GET /users`.
  - **BUG-14 (Memori)**: Menghindari kebocoran memori (*memory leak*) dengan pembersihan otomatis file Object URL pratinjau unggahan gambar.
  - **BUG-15 (UI/UX)**: Membangun antarmuka pendaftaran (`RegisterPage.tsx`) yang sebelumnya kosong/placeholder.
  - **BUG-16 (Kestabilan)**: Memasang validasi input pada route pembuatan komentar.
  - **BUG-17 (Kualitas Kode)**: Mengganti tipe data bertipe `any` di `PostDetailPage` dengan tipe bawaan TypeScript.
  - **BUG-18 (UI/UX)**: Menambahkan notifikasi toast error saat aksi follow/unfollow pada daftar saran pengguna gagal.
  - **BUG-19 (UI/UX)**: Mengganti pop-up `alert()` mentah bawaan browser ketika mengklik tag postingan dengan navigasi rute profil.
  - **BUG-20 (Kualitas Kode)**: Mengubah tipe properti `postsCount` pada komponen `PostCard` dari `string` menjadi `number`.

---

## [v1.0.0] - 2026-05-26
### Added (Ditambahkan)
- **Halaman Jelajah & Pencarian Langsung (Yasmin)**:
  - Menambahkan fitur pencarian pengguna (*Live Search*) berbasis filter query parameter `?search=...` (case-insensitive) di backend.
  - Membuat grid postingan dinamis pada halaman `ExplorePage` yang terintegrasi dengan API data riil dari database.
- **Dasbor Pemantauan Layanan (Monitoring Page)**:
  - Membuat dasbor status kesehatan server, latency koneksi database PostgreSQL, AWS S3 bucket, dan Cloudinary API.

---

## [v1.3.0] - 2026-05-28

### Added (Ditambahkan)

- **Instafy Story Editor** (`StoryEditorModal.tsx`):
  - Editor kanvas HTML5 sebelum upload cerita: drag & slider posisi foto, zoom skala, pilihan warna/gradien latar, preset filter dengan live preview, kuas lukis (undo support), dan teks kustom 5 gaya font dengan drag-to-reposition.
- **Instafy Post Editor** (canvas di `CreatePostPage.tsx`):
  - Multi-image carousel, filter preset, aspek rasio kustom (1:1, 4:5, 16:9).
- **Profile Image Editor Modal** (`ProfileImageEditorModal.tsx`):
  - Crop, zoom, dan filter preset untuk foto profil.
- **Emoji Picker Komentar**:
  - Integrasi `emoji-picker-react` dengan tema gelap/terang otomatis.
- **Infinite Scroll Komentar**:
  - Cursor-based infinite scroll di `PostDetailPage`.
- **Comment Likes**:
  - Like komentar dengan trigger notifikasi dan update UI realtime.
- **Code Audit Report** (`docs/CODE_AUDIT_REPORT.md`):
  - Dokumentasi 29 temuan dari 4 putaran audit keamanan & performa.
- **Roadmap Pengembangan** (`docs/ROADMAP.md`):
  - Rencana kerja 5 fase ke depan (Security → Performance → DB Migration → Realtime → Refactor).

### Optimized (Dioptimalkan)

- **Backend Caching In-Memory (`MemoryCache`)**:
  - Cache aktif pada `GET /posts` dan `GET /posts/:id` → latensi <5ms.
  - Pattern-based invalidation: feed cache dan single post cache diinvalidasi terpisah.
  - Endpoint monitoring: `GET /data/cache/metrics`, `POST /data/cache/reset`, `POST /data/cache/clear`.
- **Optimasi Indeks PostgreSQL**:
  - `@@index` pada seluruh kolom foreign key di `schema.prisma` untuk mempercepat JOIN.
- **Granular Cache Invalidation**:
  - Auto-invalidate pada setiap mutasi data (post, like, komentar, bookmark).

### Fixed & Refactored (Diperbaiki & Direfaktor)

- **Auto-Logout Global (401 Interceptor)** di `api.client.ts`.
- **Refactoring seluruh modul backend** (Auth, Comment, Post, Like, Follow, Story, Data, Monitoring, User, Notification, Message) — pemisahan routes/schema/service.
- **Middleware terpusat** `error.plugin.ts` untuk error handling seragam.
- **Refactoring struktur frontend** — pemisahan components, hooks, services, state.
- **UI Alignment Instagram**:
  - PostCard dan PostSkeleton menggunakan rasio standar **4:5** (`aspect-[4/5]`).
  - Font sidebar `14px`, spacing dan padding diperbaiki.
- **Navigasi Cerita Lintas Akun** dengan preview tetangga antar-akun.
- **Suggestions API** limit 5 → 30 untuk modal *See All*.
- **Share Modal** — user yang di-follow diprioritaskan, tombol jadi "Terkirim" setelah diklik.
- **Options Menu Postingan** — menu berbeda untuk pemilik vs bukan pemilik post.
- **Comment Author Clickable** — klik nama penulis navigasi ke profil.
- **Tombol Log Out di Sidebar** menggantikan tombol Switch yang tidak fungsional.
- **Ikon Interaksi 2x Lebih Besar** (`h-11 w-11`, SVG 36px).
