# 🗺️ ROADMAP — ppwl-clone-instagram (Instafy)

> **Diperbarui:** 2026-05-28
> **Berdasarkan:** CODE_AUDIT_REPORT.md (29 temuan) + riwayat pengembangan di CHANGELOG.md
> **Status:** 🔴 Belum dimulai · 🟡 Dalam progress · ✅ Selesai

---

## ✅ Sudah Selesai (Lihat CHANGELOG untuk detail)

Semua pekerjaan di bawah sudah selesai dan telah diarsipkan di `CHANGELOG.md`:

- ✅ Seluruh refactoring modul backend (Auth, Comment, Post, Like, Follow, Story, Notification, dll)
- ✅ Caching in-memory (`MemoryCache`) + pattern invalidation + cache metrics endpoint
- ✅ Optimasi indeks PostgreSQL (`@@index` pada semua foreign key)
- ✅ Story Editor (canvas, filter, draw, text overlay)
- ✅ Post Editor (canvas, multi-image carousel, crop, filter)
- ✅ Profile Image Editor (crop, zoom, filter)
- ✅ Emoji Picker komentar
- ✅ Comment Likes + notifikasi
- ✅ Infinite scroll komentar (cursor-based)
- ✅ Auto-Logout 401 interceptor
- ✅ UI alignment (rasio 4:5, font sidebar, spacing)
- ✅ Navigasi cerita lintas akun + preview tetangga
- ✅ Share modal dengan prioritas following
- ✅ Options menu postingan (pemilik vs bukan pemilik)

---

## 🚨 FASE 0 — Darurat (Lakukan Sekarang!)

> Harus diselesaikan **sebelum** lanjut ke fitur apapun.

| Status | Task                                                                    | File Target            | Estimasi |
| ------ | ----------------------------------------------------------------------- | ---------------------- | -------- |
| ✅     | Pastikan `backend/.env.production` ada di `.gitignore`                  | `.gitignore`           | 5 menit  |
| ✅     | Tambahkan `.use(authPlugin)` ke `monitoring.routes.ts`                  | `monitoring.routes.ts` | 15 menit |
| ✅     | Filter `passwordHash` dari `backup.ts` (gunakan `select` Prisma)        | `backup.ts`            | 10 menit |
| ✅     | Hapus default value `"ok"` dari `data.route.ts` + tambahkan auth proper | `data.route.ts`        | 20 menit |

---

## 🔐 FASE 1 — Security Hardening

| Status | ID          | Task                                                                           | File Target                                               | Estimasi |
| ------ | ----------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- | -------- |
| ✅     | BUG-01      | Fix race condition like/follow/bookmark (Prisma upsert / try-catch P2002)      | `like.service.ts`, `follow.service.ts`, `post.service.ts` | 2 jam    |
| ✅     | BUG-02      | Tambahkan `exp: "7d"` ke JWT config                                            | `auth.plugin.ts`                                          | 15 menit |
| ✅     | BUG-03 & 09 | Ganti AdminRoute hardcoded → RBAC via field `role` di DB                       | `App.tsx`, `Sidebar.tsx`, `schema.prisma`                 | 3 jam    |
| ✅     | BUG-04      | Sanitasi error response — jangan ekspos error Prisma mentah ke client          | Semua `*.routes.ts`                                       | 1 jam    |
| ✅     | BUG-10      | Tambahkan field `senderId` di model `Notification` → hapus string-split logic  | `notification.service.ts`, `schema.prisma`                | 1.5 jam  |
| ✅     | BUG-11      | Tambahkan auth + `take: 20` + wajibkan `search` min 2 karakter di `GET /users` | `user.routes.ts`, `user.service.ts`                       | 30 menit |
| ✅     | BUG-06      | Fix username Google OAuth — ganti `Math.random() * 1000` dengan `nanoid`       | `auth.service.ts`                                         | 20 menit |

---

## ⚡ FASE 2 — Performance Optimization

| Status | ID      | Task                                                                                | File Target                                         | Estimasi |
| ------ | ------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- | -------- |
| ✅     | PERF-01 | Cache `getCurrentUser()` di memory (TTL 30 detik) pakai `localCache` yang sudah ada | `auth.plugin.ts`                                    | 1 jam    |
| ✅     | PERF-07 | Refactor `getNotificationsForUser` — hapus N+1 loop, batch query `findMany` + `in`  | `notification.service.ts`                           | 2 jam    |
| ✅     | PERF-06 | Bungkus `postCount`/`commentCount` increment dengan `db.$transaction`               | `post.service.ts`, `comment.service.ts`             | 30 menit |
| ✅     | PERF-02 | Ganti 2-query `getSuggestions` menjadi 1 Prisma subquery relation filter            | `follow.service.ts`                                 | 1 jam    |
| ✅     | PERF-04 | Tambahkan `useMemo` di `buildCommentTree`                                           | `PostDetailPage.tsx`                                | 20 menit |
| ✅     | PERF-05 | Implementasi cursor-based pagination di feed `GET /posts`                           | `post.routes.ts`, `post.service.ts`, `HomePage.tsx` | 3 jam    |
| ✅     | BUG-07  | Fix double API call setelah submit komentar (gunakan response POST langsung)        | `PostDetailPage.tsx`                                | 30 menit |

---

## 🗄️ FASE 3 — Migrasi Database (Neon → AWS RDS)

> Pindah dari Neon PostgreSQL (serverless, cold start 500ms–3s) ke AWS RDS PostgreSQL (always-on, latensi 1–5ms).

### Estimasi Biaya RDS

```
db.t3.micro PostgreSQL:  ~$15/bulan
Storage 20 GB gp2:       ~$2.30/bulan
Total:                   ~$17/bulan
AWS Credit $100:         ≈ 5-6 bulan gratis
```

### Langkah Migrasi

| Status | Task                                     | Detail                                                              |
| ------ | ---------------------------------------- | ------------------------------------------------------------------- |
| 🔴     | Buat RDS instance                        | Region: `us-east-1`, engine: PostgreSQL 16, instance: `db.t3.micro` |
| 🔴     | Setup Security Group                     | Izinkan koneksi dari Lambda (by security group atau VPC)            |
| 🔴     | Export data dari Neon                    | `pg_dump "neon-url" -Fc > backup.dump`                              |
| 🔴     | Import ke RDS                            | `pg_restore -d "rds-url" backup.dump`                               |
| 🔴     | Jalankan `prisma migrate deploy` di RDS  | Sync schema                                                         |
| 🔴     | Update `DATABASE_URL` di Lambda env vars | Ganti ke RDS connection string                                      |
| 🔴     | Test semua endpoint kritis               | Auth, post, follow, notification                                    |
| 🔴     | Hapus Neon instance                      | Setelah yakin RDS stabil 1-2 hari                                   |

---

## 🔔 FASE 4 — Real-time Notifications

> Notifikasi realtime tanpa refresh + browser push notification (muncul walaupun tab tertutup).
> Implementasi kode sudah aman untuk local: Pusher/Web Push akan nonaktif otomatis jika env key belum diisi.

### Arsitektur: Pusher + Web Push API

```
User A like postingan User B
         ↓
  ElysiaJS (Lambda)
    1. Simpan notifikasi ke DB (sudah ada)
    2. pusher.trigger("private-user-{B_id}", "new-notif", data)
         ↓
  Pusher WebSocket Server (gratis s.d. 100 concurrent, 200k msg/hari)
         ↓
  React client User B (subscribe ke channel "private-user-{B_id}")
         ↓
  useRealtimeNotifications hook → update badge + tampilkan toast
         ↓
  (Jika tab di background) Web Push API → OS notification
```

### Backend

| Status | Task                                                                         | File Target                                                  | Estimasi |
| ------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------ | -------- |
| ✅     | Daftar akun Pusher free tier → dapat APP_ID, KEY, SECRET, CLUSTER            | —                                                            | 10 menit |
| ✅     | Install `pusher` di backend + buat `config/pusher.ts`                        | `backend/package.json`                                       | 20 menit |
| ✅     | Tambahkan `pusher.trigger()` di setiap service yang create notifikasi        | `like.service.ts`, `follow.service.ts`, `comment.service.ts` | 1 jam    |
| ✅     | Generate VAPID keys: `npx web-push generate-vapid-keys`                      | —                                                            | 5 menit  |
| ✅     | Buat endpoint `POST /notifications/subscribe` untuk simpan push subscription | `notification.routes.ts`, `schema.prisma`                    | 1 jam    |
| ✅     | Implement Web Push trigger saat notifikasi dibuat                            | `notification.service.ts`                                    | 1 jam    |

### Frontend

| Status | Task                                                                          | File Target                             | Estimasi |
| ------ | ----------------------------------------------------------------------------- | --------------------------------------- | -------- |
| ✅     | Install `pusher-js` di frontend                                               | `frontend/package.json`                 | 5 menit  |
| ✅     | Buat `useRealtimeNotifications.ts` hook                                       | `frontend/src/hooks/`                   | 2 jam    |
| ✅     | Update `NotificationDrawer` — append notif baru realtime ke state             | `NotificationDrawer.tsx`                | 1 jam    |
| ✅     | Update badge count notifikasi di Sidebar secara realtime                      | `Sidebar.tsx`                           | 30 menit |
| ✅     | Buat `useWebPush.ts` hook — minta izin browser + kirim subscription ke server | `frontend/src/hooks/`                   | 1.5 jam  |
| ✅     | Buat `PushPermissionModal.tsx` — UI prompt "Aktifkan Notifikasi?"             | `frontend/src/components/notification/` | 1 jam    |
| ✅     | Buat `public/sw.js` (Service Worker) untuk handle background push             | `frontend/public/`                      | 2 jam    |

---

## 🍝 FASE 5 — Refactoring (Technical Debt)

| Status | ID          | Task                                                                                                                                                                          | File Target                     | Estimasi |
| ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------- |
| 🔴     | REFACTOR-01 | Pecah `CreatePostPage.tsx` (988 baris) menjadi 8 komponen terpisah                                                                                                            | `CreatePostPage.tsx`            | 4 jam    |
| 🔴     | REFACTOR-07 | Pecah `PostCard.tsx` (1013 baris, 20 state) menjadi 7 komponen                                                                                                                | `PostCard.tsx`                  | 5 jam    |
| 🔴     | REFACTOR-02 | Pindahkan semua interface `Post` ke `shared/src/types/post.ts`                                                                                                                | Semua pages                     | 1 jam    |
| 🔴     | REFACTOR-03 | Buat `PostGrid.tsx` reusable untuk `ProfilePage`                                                                                                                              | `ProfilePage.tsx`               | 1 jam    |
| 🔴     | REFACTOR-04 | Buat middleware `requireAuth` yang reusable                                                                                                                                   | `backend/src/plugins/`          | 1 jam    |
| 🔴     | REFACTOR-05 | Ganti `getToken()` langsung baca localStorage → `useAuthStore.getState()`                                                                                                     | `api.client.ts`                 | 20 menit |
| 🔴     | BUG-14      | Hapus fake `sharesCount` (random hash) atau buat tabel `Share` di DB                                                                                                          | `PostCard.tsx`, `schema.prisma` | 1 jam    |
| 🔴     | UX-01       | Loading handler presisi — tambahkan skeleton/spinner pada setiap async state, dan tampilkan pesan error yang jelas saat koneksi/server bermasalah (bukan hanya console.error) | Semua pages & komponen          | 3 jam    |

---

## 📊 Ringkasan Estimasi

| Fase      | Deskripsi                 | Estimasi    |
| --------- | ------------------------- | ----------- |
| Fase 0    | Darurat (keamanan kritis) | ~50 menit   |
| Fase 1    | Security Hardening        | ~8 jam      |
| Fase 2    | Performance               | ~8 jam      |
| Fase 3    | Migrasi DB                | ~4 jam      |
| Fase 4    | Realtime Notifications    | ~12 jam     |
| Fase 5    | Refactoring + UX Polish   | ~17 jam     |
| **Total** |                           | **~50 jam** |

---

> **Urutan yang disarankan:** Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
>
> Kerjakan **PERF-01** (cache `getCurrentUser`) lebih awal dari fase 2 — efeknya paling besar pada beban DB, apapun database yang dipakai.
