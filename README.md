# 📸 Instafy — Instagram Clone (PPWL)

> Proyek Capstone **Pemrograman Perangkat Web Lanjut (PPWL)** — Clone fitur utama Instagram dengan stack modern dan deployment berbasis cloud.

🌐 **Production Frontend:** [https://www.ppwl-a3.my.id](https://www.ppwl-a3.my.id)

🔗 **Backend API (Lambda):** [https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws](https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws)

📄 **Laporan:** [Google Docs](https://docs.google.com/document/d/1hV_PTNH-kDNz5YgDGbBiWD73-9hstmQboQxHAoMshhQ/edit?usp=sharing)

📋 **Dokumen Terkait:**

- [PRD & Arsitektur](docs/PRD.md)
- [Changelog](docs/CHANGELOG.md)
- [Roadmap](docs/ROADMAP.md)
- [Code Audit Report](docs/CODE_AUDIT_REPORT.md)
- [Kontribusi Tim](docs/CONTRIBUTIONS.md)
- [DB Diagram](docs/DB_DIAGRAM.txt)

---

## 👥 Tim

| Nama                    | NIM | Peran                          |
| ----------------------- | --- | ------------------------------ |
| Rafli Pratama           | —   | Ketua, Tech Lead & Integration |
| Adella Rheina Sweeta    | —   | Frontend & Feed Feature        |
| Rifa Dwinanda Bagaskara | —   | Comment System                 |
| Tan Atira Yasmin        | —   | Post & Interaction Feature     |
| Olivia Naura Fakhradika | —   | Profile & UX Specialist        |
| Salsabila Nur Anisa     | —   | Notification & Mobile Layout   |

---

## 🛠️ Tech Stack

### Frontend

| Teknologi                                                              | Versi | Fungsi                             |
| ---------------------------------------------------------------------- | ----- | ---------------------------------- |
| [Vite](https://vitejs.dev/)                                            | 6.x   | Build tool & dev server            |
| [React](https://react.dev/)                                            | 19.x  | UI framework                       |
| [TypeScript](https://www.typescriptlang.org/)                          | 5.x   | Type safety                        |
| [Tailwind CSS](https://tailwindcss.com/)                               | v4    | Styling utility-first              |
| [Shadcn/UI](https://ui.shadcn.com/) (Radix UI)                         | —     | Komponen UI (Card, Button, Select) |
| [React Router DOM](https://reactrouter.com/)                           | v7    | Client-side routing                |
| [Zustand](https://zustand-demo.pmnd.rs/)                               | 5.x   | State management (auth & tema)     |
| [Sonner](https://sonner.emilkowal.ski/)                                | 2.x   | Toast notification                 |
| [Lucide React](https://lucide.dev/)                                    | 0.545 | Icon library                       |
| [@react-oauth/google](https://github.com/MomenIter/react-oauth-google) | —     | Google OAuth integration           |
| [Pusher JS](https://pusher.com/)                                       | 8.x   | WebSocket realtime notifications   |
| [emoji-picker-react](https://github.com/ealush/emoji-picker-react)     | 4.x   | Emoji picker komentar              |
| [html-to-image](https://github.com/bubkoo/html-to-image)               | 1.11  | Export design system ke PNG        |

### Backend

| Teknologi                                                        | Versi | Fungsi                         |
| ---------------------------------------------------------------- | ----- | ------------------------------ |
| [Bun](https://bun.sh/)                                           | 1.x   | Runtime & package manager      |
| [ElysiaJS](https://elysiajs.com/)                                | 1.x   | Web framework (ringan & cepat) |
| [Prisma ORM](https://www.prisma.io/)                             | 6.x   | Database access & schema       |
| [PostgreSQL](https://www.postgresql.org/)                        | 16    | Database relasional            |
| [Cloudinary](https://cloudinary.com/)                            | 2.x   | Upload & hosting gambar        |
| [@elysiajs/jwt](https://elysiajs.com/plugins/jwt.html)           | —     | JWT authentication             |
| [@elysiajs/cors](https://elysiajs.com/plugins/cors.html)         | —     | CORS headers                   |
| [@elysiajs/swagger](https://elysiajs.com/plugins/swagger.html)   | —     | API documentation (Swagger)    |
| [@aws-sdk/client-s3](https://aws.amazon.com/sdk-for-javascript/) | 3.x   | AWS S3 SDK untuk deployment    |
| [Pusher](https://pusher.com/)                                    | 5.x   | Server-side realtime trigger   |
| [web-push](https://github.com/web-push-libs/web-push)            | 3.x   | Browser push notification      |
| [Nanoid](https://github.com/ai/nanoid)                           | 5.x   | Unique ID generator            |
| [Argon2](https://github.com/ranisalt/node-argon2)                | —     | Password hashing               |

### Infrastructure & Deployment

| Layanan                                      | Fungsi                                    |
| -------------------------------------------- | ----------------------------------------- |
| [AWS Lambda](https://aws.amazon.com/lambda/) | Serverless backend hosting                |
| [AWS S3](https://aws.amazon.com/s3/)         | Storage deployment & backup package       |
| [Neon](https://neon.tech/)                   | Managed PostgreSQL (serverless)           |
| [Cloudflare](https://www.cloudflare.com/)    | CDN, SSL, custom domain (`ppwl-a3.my.id`) |
| [AWS RDS](https://aws.amazon.com/rds/)       | Migrasi dari Neon → RDS PostgreSQL        |

---

## 🏗️ Struktur Proyek

```
ppwl-clone-instagram/
├── frontend/                      # Aplikasi React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Avatar, ThemeToggle, LikeButton
│   │   │   ├── layout/            # MainLayout, Sidebar, BottomNav
│   │   │   ├── post/              # PostCard, PostSkeleton, PostForm
│   │   │   ├── comment/           # CommentItem, CommentForm
│   │   │   ├── story/             # StoriesRow, StoryViewer, StoryEditorModal
│   │   │   ├── notification/      # NotificationDrawer, PushPermissionModal
│   │   │   └── ui/                # Shadcn/UI base components
│   │   ├── pages/                 # HomePage, ProfilePage, PostDetailPage, ...
│   │   ├── services/              # api.client, post.service, like.service, ...
│   │   ├── store/                 # auth.store, theme.store (Zustand)
│   │   └── hooks/                 # usePosts, useInfiniteScroll, useRealtimeNotifications, useWebPush
│   └── public/                    # Favicon, SW, fonts
├── backend/                       # ElysiaJS API + Prisma
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/              # Login, Register, Google OAuth
│   │   │   ├── user/              # Data profil user
│   │   │   ├── post/              # CRUD postingan + upload Cloudinary
│   │   │   ├── like/              # Toggle like & status
│   │   │   ├── comment/           # CRUD komentar + reply + like komentar
│   │   │   ├── follow/            # Follow / unfollow
│   │   │   ├── story/             # CRUD stories + upload
│   │   │   ├── notification/      # List notifikasi + realtime trigger
│   │   │   ├── message/           # Direct message (pusher-based)
│   │   │   ├── monitoring/        # Health check & cache metrics
│   │   │   └── data/              # Endpoint inspeksi DB (dev only)
│   │   ├── config/                # env.ts, cloudinary.ts, pusher.ts
│   │   ├── plugins/               # auth.plugin.ts, error.plugin.ts
│   │   ├── scripts/               # backup.ts (AWS S3 backup otomatis)
│   │   └── lambda.ts              # Entry point AWS Lambda
│   ├── prisma/
│   │   ├── schema.prisma          # Model DB: User, Post, Comment, Like, ...
│   │   └── seed.ts                # Dummy data
│   └── deploy.sh                  # Script deploy ke AWS Lambda
├── shared/                        # @ppwl/shared — tipe bersama FE/BE
│   └── src/
│       ├── types/                 # user.ts, post.ts, comment.ts
│       └── utils/                 # date.ts, format.ts
└── docs/                          # Dokumentasi proyek
```

---

## 🗃️ Database Schema (Prisma)

```
User ─── Post ──── Like
  │         │
  │         ├──── Comment ──── Comment (reply)
  │         │
  │         └──── Bookmark
  │
  ├── Follow (followers)
  ├── Notification
  ├── NotificationSubscription (Web Push)
  ├── Story
  ├── StoryView
  ├── Message
  └── MessageRead
```

**Models:** `User`, `Post`, `Comment`, `Like`, `Bookmark`, `Follow`, `Notification`, `NotificationSubscription`, `Story`, `StoryView`, `Message`, `MessageRead`

📊 Lihat diagram lengkap: [`docs/DB_DIAGRAM.txt`](docs/DB_DIAGRAM.txt)

---

## 🚀 Menjalankan Lokal

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- Database PostgreSQL (atau koneksi ke Neon)

### Setup

```bash
# 1. Clone repo
git clone https://github.com/IniRalfi/ppwl-clone-instagram.git
cd ppwl-clone-instagram

# 2. Install semua dependencies (frontend + backend sekaligus)
bun install

# 3. Setup environment backend
cp backend/.env.example backend/.env
# Edit backend/.env — isi DATABASE_URL dan variabel lainnya

# 4. Setup environment frontend
cp frontend/.env.example frontend/.env.development  # jika ada
# atau buat manual: VITE_API_URL=http://localhost:3000

# 5. Generate Prisma client
cd backend && bun run db:generate

# 6. Jalankan migrasi database
bun run db:migrate

# 7. (Opsional) Isi dummy data
bun run db:seed
```

### Menjalankan Dev Server

```bash
# Dari root folder — jalankan frontend & backend sekaligus
bun dev

# Atau terpisah:
bun run dev:fe   # Frontend → http://localhost:5173
bun run dev:be   # Backend  → http://localhost:3000
```

---

## 📦 Scripts Tersedia

| Perintah               | Fungsi                                 |
| ---------------------- | -------------------------------------- |
| `bun dev`              | Jalankan frontend & backend bersamaan  |
| `bun run dev:fe`       | Jalankan frontend saja                 |
| `bun run dev:be`       | Jalankan backend saja                  |
| `bun run dev:prod`     | Jalankan dengan env production         |
| `bun run build`        | Build semua package (shared + fe + be) |
| `bun run build:fe`     | Build frontend saja                    |
| `bun run build:be`     | Build backend saja (Bun bundle)        |
| `bun run build:shared` | Build shared types paket               |
| `bun run db:generate`  | Generate Prisma client                 |
| `bun run db:migrate`   | Jalankan migrasi database              |
| `bun run db:seed`      | Isi database dengan dummy data         |
| `bun run db:studio`    | Buka Prisma Studio (GUI database)      |

---

## 🌩️ Deploy

### Backend ke Lambda

Script deploy otomatis tersedia di `backend/deploy.sh`. Pastikan AWS CLI sudah terkonfigurasi.

```bash
cd backend
bash deploy.sh
```

Script ini akan otomatis:

1. Build bundle Lambda dengan Bun
2. Zip artifact + Prisma engine
3. Upload ke S3
4. Update Lambda function code
5. Update environment variables dari `.env.production`

### Backup Database

Backup otomatis database PostgreSQL ke AWS S3:

```bash
bun --cwd backend src/scripts/backup.ts
```

Atau via endpoint API: `POST /data/backup` (dilindungi API key).

> ⚠️ **Jangan commit `.env.production`** — file ini sudah di-ignore di `.gitignore`.

---

## ✅ Fitur yang Sudah Berjalan

### Auth & User

- [x] Register & Login (email + password, hashed Argon2)
- [x] Google OAuth
- [x] Halaman profil user + grid postingan
- [x] Edit profil + avatar crop/filter editor
- [x] Follow / Unfollow + suggestions
- [x] Logout global otomatis (401 interceptor)

### Feed & Postingan

- [x] Feed beranda (cursor-based infinite scroll)
- [x] Upload postingan dengan gambar (via Cloudinary)
- [x] Like / Unlike (optimistic update)
- [x] Bookmark / Simpan postingan
- [x] Post Editor (multi-image carousel, filter, crop)
- [x] Halaman explore & pencarian user (live search)
- [x] Caching in-memory (<5ms latensi)

### Komentar

- [x] Komentar & Reply bertingkat
- [x] Infinite scroll komentar (cursor-based)
- [x] Like komentar + notifikasi
- [x] Emoji picker

### Stories

- [x] Stories row di feed
- [x] Story viewer (auto-play 5 detik, navigasi keyboard)
- [x] Story Editor (canvas, filter, draw, teks, gradien)

### Notifikasi & Realtime

- [x] Pusher WebSocket (realtime notifikasi, badge count)
- [x] Web Push API (notifikasi browser saat tab tertutup)
- [x] Push permission modal

### UI/UX

- [x] Dark / Light mode (persisten di localStorage)
- [x] Responsive design (desktop Sidebar + mobile BottomNav)
- [x] Sonner toast notification
- [x] Loading skeleton & error state
- [x] Design system page (`/design-system`)

### Deployment & Infra

- [x] Production di domain custom (`ppwl-a3.my.id`)
- [x] Backend serverless di AWS Lambda
- [x] Auto-backup database ke AWS S3
- [x] Swagger API docs (built-in Elysia)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
FRONTEND_URL="http://localhost:5173"
API_SECRET_KEY="your-secret-key"
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Pusher (realtime)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="ap1"

# Web Push (VAPID)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"

# AWS (backup S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
S3_BACKUP_BUCKET="your-backup-bucket"
```

### Frontend (`frontend/.env.development`)

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_PUSHER_KEY=your-pusher-key
VITE_PUSHER_CLUSTER=ap1
```

### Frontend (`frontend/.env.development`)

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan akademik — **Tugas Besar PPWL**.
