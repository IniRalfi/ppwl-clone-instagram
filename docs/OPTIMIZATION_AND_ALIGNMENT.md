# ⚡ Optimization & UI Alignment Report

Dokumen ini mendokumentasikan implementasi mekanisme caching backend, perbaikan alur sesi autentikasi, serta penyelarasan desain antarmuka (UI/UX) agar sesuai dengan standar Instagram Web asli.

---

## 🚀 1. Backend Caching System (In-Memory)

Untuk mengurangi latensi pemuatan data dari database Neon PostgreSQL, kami menerapkan **In-Memory Caching** menggunakan utilitas `MemoryCache` di backend (`backend/src/utils/cache.ts`).

### Mekanisme Kerja:
1. **Pemeriksaan Cache (Read)**: Setiap kali ada request ke `GET /posts` (feed utama) atau `GET /posts/:id` (detail postingan), server pertama-tama akan memeriksa apakah data dengan kunci unik (contoh: `posts:feed:all:limit:none:user:xxx`) telah tersimpan di RAM. Jika ada, data dikembalikan langsung (**latensi <5ms**).
2. **Time-To-Live (TTL)**: Data cache berumur pendek (10-15 detik) untuk mencegah data menjadi terlalu basi.
3. **Invalidasi Cache (Write/Mutation)**: Agar feed selalu akurat, cache akan segera dihapus jika terjadi mutasi data berikut:
   - Pembuatan postingan baru (`POST /posts`)
   - Penghapusan postingan (`DELETE /posts/:id`)
   - Like atau Unlike postingan (`POST /likes/:postId`)
   - Penulisan komentar baru (`POST /comments`)
   - Penyimpanan bookmark postingan (`POST /posts/:id/bookmark`)

---

## 🔒 2. Mekanisme Auto-Logout Global (401 Interceptor)

Sebelumnya, jika server di-restart atau database di-reseed, token yang tersimpan di browser pengguna menjadi tidak valid lagi. Namun, karena state login disimpan di LocalStorage frontend (`auth-storage`), pengguna tetap melihat antarmuka seolah-olah mereka login (meskipun semua request API gagal dengan error 401).

### Solusi:
Kami menambahkan pencegat (*interceptor*) status HTTP 401 secara global di `api.client.ts`:
```typescript
if (!res.ok) {
  if (res.status === 401) {
    useAuthStore.getState().logout();
  }
  // ... throw error
}
```
Ketika server mendeteksi token tidak valid dan merespon dengan `401 Unauthorized`, frontend secara otomatis akan menghapus state LocalStorage dan mengembalikan pengguna secara paksa ke halaman `/login`.

---

## 🎨 3. Penyelarasan UI dengan Standar Instagram Web

Kami melakukan penyelarasan visual tingkat lanjut pada frontend agar layout terasa lebih premium dan presisi:

### A. Sidebar Navigation
- **Koreksi Typo Brand**: Mengubah tulisan logo dari `Instagaram` menjadi `Instagram`.
- **Ukuran Font**: Mengurangi ukuran teks item menu navigasi dari `15px` menjadi `14px` (`text-[14px]`) untuk tampilan yang lebih ramping dan sesuai dengan pedoman visual Meta.
- **Tata Letak**: Mengatur jarak margin (`gap-1.5`) dan padding (`py-2.5 my-1`) yang lebih rapat untuk kenyamanan visual yang lebih baik.

### B. Post Card & Media Ratio
- **Aspek Rasio 4:5**: Mengubah kontainer gambar postingan di `PostCard.tsx` dari aspek rasio dinamis/persegi (`aspect-square`) menjadi rasio **4:5** (`aspect-[4/5]`) standar Instagram Feed.
- **Fitting Gambar**: Menggunakan `object-cover` agar gambar memenuhi seluruh kontainer 4:5 dengan mulus tanpa adanya bar hitam (*black bars*) di samping atau atas bawah.
- **Sinkronisasi Skeleton Loading**: Menyelaraskan `PostSkeleton` di `Skeleton.tsx` agar menggunakan placeholder gambar berasio **4:5** (`aspect-[4/5]`) untuk mencegah terjadinya lonjakan tata letak (*layout shifts*) saat data selesai dimuat.
