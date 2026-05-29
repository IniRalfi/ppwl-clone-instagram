# Progress: Investigasi & Perbaikan WebSocket/Pusher Production

## 📊 Status Perbaikan
- [x] **Phase 1: Discovery / Analisis Akar Masalah**
  - Menganalisis file `.env.production` pada backend & frontend.
  - Membandingkan git commits antara branch `dev` dan `main`.
  - Memverifikasi logs trigger Pusher pada AWS Lambda CloudWatch.
- [x] **Phase 2: Backend Log Integration & Deploy**
  - Menambahkan log detail pada `notification.service.ts` untuk memantau pemanggilan `pusher.trigger`.
  - Menambahkan environment variables Web Push (`WEB_PUSH_*`) pada script `deploy.sh`.
  - Melakukan build dan deploy ulang backend ke AWS Lambda (`200 OK` via `/health`).
- [x] **Phase 3: Frontend Build & Sync ke S3**
  - Membangun (build) frontend versi terbaru dari branch `dev` secara lokal.
  - Mengunggah (sync) asset statis terbaru ke bucket S3 `ppwl-instagram-fe-team-3` tanpa menghapus file backend/backup.
- [ ] **Phase 4: CloudFront Invalidation & Testing**
  - Membersihkan cache CloudFront agar menggunakan `index.html` terbaru.
  - Melakukan uji coba pengiriman realtime notification di production.
