# 📝 Instafy Clone Instagram - Progress Tracker

Dokumen ini melacak setiap fase pengembangan untuk rebranding dan penyempurnaan UI/UX Instafy.

---

## 🛠️ STATUS FASE PENGEMBANGAN

### 1. Fase Design 🎨
- [x] Rebranding nama dari **Instagram** ke **Instafy**.
- [x] Skema warna flat murni: `#000000` untuk Mode Gelap dan `#ffffff` untuk Mode Terang.
- [x] Ikon aksi postingan khas Instagram yang presisi dan estetis.
- [x] Desain transparan untuk Stories dan Post Card.

### 2. Fase Skeleton 💀
- [x] Tata letak Sidebar Desktop diposisikan secara melayang di tengah tinggi layar.
- [x] Wadah StoryViewer berukuran penuh pada layar desktop (`h-[92vh]`).
- [x] Wadah Modal Suggested Users diperbesar ke `max-w-[480px] h-[600px]`.

### 3. Fase Core Logic 🧠
- [x] **Navigasi Cerita Lintas Akun**: Transisi otomatis ke cerita milik pengguna berikutnya ketika mencapai slide terakhir. Pratinjau visual cerita tetangga (kiri/kanan) hanya ditampilkan ketika berpindah antar-akun (beda akun) dan dinonaktifkan jika masih di dalam satu akun yang sama.
- [x] **Saran Pengguna (Suggestions) Tanpa Batas**: Mengubah pengambilan endpoint backend dari limit 5 menjadi 30 agar dapat memuat seluruh daftar rekomendasi di modal *See All*.
- [x] **Pop-up Share Postingan**: Menampilkan daftar pengguna yang diprioritaskan berdasarkan status "Mengikuti" terlebih dahulu, diikuti dengan tombol salin tautan postingan.
- [x] **Menu Titik Tiga (Options Menu)**:
  - Postingan Sendiri: Opsi Hapus Postingan & Edit Caption.
  - Postingan Orang Lain: Opsi Batal Mengikuti, Share, Salin Tautan.
- [x] **Edit Caption secara Inline**: Memungkinkan pengubahan konten teks caption secara langsung di Post Card tanpa reload halaman.
- [x] **Peningkatan Navigasi Suggestions**: Klik pada nama/avatar pengguna di area saran pengguna langsung mengarahkan ke halaman profilnya.
- [x] **Tombol Switch & Log Out**: Mengubah tombol 'Switch' yang tidak fungsional di sidebar suggestions menjadi tombol 'Log Out' yang fungsional untuk memudahkan pergantian akun.
- [x] **Pembesaran Ikon Interaksi Postingan**: Membesarkan ukuran tombol interaksi (Like, Comment, Share, Save) di Post Card sebanyak 2x lipat (`h-11 w-11` dengan SVG `36px`) agar lebih menonjol di desktop.
- [x] **Instafy Story Editor & Post Editor**: Menyediakan modal editor kanvas HTML5 sebelum mengunggah cerita dan postingan baru. Mendukung aspek rasio kustom (1:1, 4:5, 16:9 untuk postingan), pergeseran posisi foto (drag & slider), zoom skala, pilihan warna/gradien latar belakang, preset filter dengan **live preview thumbnail gambar**, kuas lukis, serta teks kustom.
- [x] **Emoji Picker Komentar**: Mengintegrasikan pustaka `emoji-picker-react` di sebelah kolom masukan komentar dengan fitur pencarian emoji dan adaptasi tema gelap/terang secara otomatis.

### 4. Fase Edge Cases 🔍
- [x] Penanganan tombol "Kirim" pada share modal agar berubah status menjadi "Terkirim" saat ditekan untuk mencegah pengiriman berulang.
- [x] Sinkronisasi status Follow pembuat postingan secara dinamis saat halaman pertama kali dimuat.
- [x] Validasi sintaksis TypeScript di sisi frontend dan backend.

### 5. Fase Testing & Verification 🧪
- [x] Verifikasi build TypeScript (`tsc --noEmit`) berhasil tanpa error pada frontend.
- [x] Uji coba server lokal berjalan dengan baik di port default.
