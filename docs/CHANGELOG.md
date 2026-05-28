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

### Fixed (Diperbaiki)
- **Penyelesaian 20 Bugs Utama (`bug_report.md`)**:
  - Memperbaiki penumpukan skeleton ganda pada hover profil card dengan optimasi parameter status loading.
  - Memperbaiki penataan pohon komentar bersarang (*nested comment tree*) di frontend.
  - Menambahkan pencegahan database pool exhaustion menggunakan debouncing hover stats.

---

## [v1.0.0] - 2026-05-26
### Added (Ditambahkan)
- **Halaman Jelajah & Pencarian Langsung (Yasmin)**:
  - Menambahkan fitur pencarian pengguna (*Live Search*) berbasis filter query parameter `?search=...` (case-insensitive) di backend.
  - Membuat grid postingan dinamis pada halaman `ExplorePage` yang terintegrasi dengan API data riil dari database.
- **Dasbor Pemantauan Layanan (Monitoring Page)**:
  - Membuat dasbor status kesehatan server, latency koneksi database PostgreSQL, AWS S3 bucket, dan Cloudinary API.
