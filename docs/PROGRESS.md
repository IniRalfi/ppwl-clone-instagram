# 📈 Progress Tracker — PPWL Instagram Clone

Dokumen ini melacak target aktif dan rencana pengembangan aplikasi yang akan datang. Seluruh pencapaian rilis sebelumnya telah diarsipkan di [CHANGELOG.md](file:///home/rafli/Programming/PPWL/ppwl-clone-instagram/docs/CHANGELOG.md).

---

## 🛠️ Status Pengembangan Saat Ini

Semua target dari Fase 1 hingga Fase 4 (Migrasi dan Integrasi Fitur Awal) saat ini telah **SELESAI** diintegrasikan secara penuh.

| Kategori      | Target Pekerjaan                                |   Status    |
| :------------ | :---------------------------------------------- | :---------: |
| 🟢 **Fase 1** | Bug Fixes (20 Items)                            | **SELESAI** |
| 🔵 **Fase 2** | Integrasi Tim (Explore, Profil, Stories, Saved) | **SELESAI** |
| 🟡 **Fase 3** | Caching, AWS CDN & Monitoring Dashboard         | **SELESAI** |
| 🔴 **Fase 4** | Integrasi Real-Time & Resolusi Merge Tim        | **SELESAI** |

---

## 🚀 Rencana Pengembangan Berikutnya (Backlog & Future Roadmap)

Berikut adalah to-do list untuk fase pengembangan baru:

### ⚙️ Fase 5: Pembenahan Arsitektur & Refactoring Kode
- [ ] Penataan ulang modul backend (pemisahan logic controller/services dari file router):
  - [x] Refactoring **Auth Module** (`auth.routes.ts`, `auth.schema.ts`, `auth.service.ts`).
  - [x] Refactoring **Comment Module** (`comment.routes.ts`, `comment.schema.ts`, `comment.service.ts`).
  - [x] Refactoring **Post Module** (`post.routes.ts`, `post.schema.ts`, `post.service.ts`).
  - [x] Refactoring **Like Module** (`like.routes.ts`, `like.schema.ts`, `like.service.ts`).
  - [x] Refactoring **Follow Module** (`follow.routes.ts`, `follow.schema.ts`, `follow.service.ts`).
  - [x] Refactoring **Story Module** (`story.routes.ts`, `story.schema.ts`, `story.service.ts`).
  - [x] Refactoring **Data & Monitoring Module** (`data.route.ts`/`service.ts`, `monitoring.routes.ts`/`service.ts`).
  - [x] Refactoring **User Module** (`user.routes.ts`, `user.schema.ts`, `user.service.ts`).
  - [x] Refactoring **Notification Module** (`notification.routes.ts`, `notification.service.ts`).
  - [x] Refactoring **Message Module** (`message.routes.ts`, `message.schema.ts`, `message.service.ts`).
- [x] Penggunaan middleware terpusat untuk error handling dan parsing data yang seragam (`error.plugin.ts`).
- [ ] Refactoring struktur direktori frontend untuk pemisahan components, hooks, services, dan state.

### 🎨 Fase 6: Peningkatan Keindahan UI (Instagram Pixel-Perfect)
- [ ] Penyelarasan styling halaman (jarak padding, ukuran font, border, warna latar charcoal Instagram) agar identik dengan aplikasi Instagram asli.
- [ ] Menyediakan transisi mikro dan loading skeleton yang lebih natural pada setiap perpindahan halaman.
- [ ] Optimalisasi layout responsif untuk kenyamanan akses via Mobile, Tablet, dan Desktop.

### 🔔 Fase 7: Sistem Notifikasi Real-Time Berbasis WebSocket
- [ ] Implementasi server WebSocket di backend ElysiaJS menggunakan `@elysiajs/websocket`.
- [ ] Membuat react hook kustom (`useWebSocket`) di frontend untuk mengelola koneksi real-time.
- [ ] Pengiriman notifikasi aktivitas (Like, Comment, Follow, dan Pesan Baru) secara instan khusus untuk user yang sedang aktif online.
- [ ] Mekanisme penahanan aliran notifikasi (*throttling/buffer*) bagi user tidak aktif agar tidak terjadi lonjakan request ketika mereka baru masuk kembali.

### ⚡ Fase 8: Optimasi Kinerja & Database Query
- [ ] Analisis dan optimasi query kueri Prisma (menggunakan SELECT spesifik, menghindari query n+1 tersembunyi).
- [ ] Penanganan loading handler yang presisi dan ramah pengguna (pesan error yang jelas saat server/koneksi bermasalah).
