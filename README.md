# 📸 Instagram Clone — PPWL

> Proyek Capstone **Pemrograman Perangkat Web Lanjut (PPWL)** — Clone fitur utama Instagram dengan stack modern dan deployment berbasis cloud.

🌐 **Production Frontend:** [https://www.ppwl-a3.my.id](https://www.ppwl-a3.my.id)

🔗 **Backend API (Lambda):** [https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws](https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws)

👤 **Cek Data Users:** [`/data/users?key=rahasia`](https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws/data/users?key=rahasia)

❤️ **Cek Data Posts:** [`/data/posts?key=rahasia`](https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws/data/posts?key=rahasia)

📄 **Laporan:** [Google Docs](https://docs.google.com/document/d/1hV_PTNH-kDNz5YgDGbBiWD73-9hstmQboQxHAoMshhQ/edit?usp=sharing)

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

| Teknologi                                              | Versi | Fungsi                          |
| ------------------------------------------------------ | ----- | ------------------------------- |
| [Vite](https://vitejs.dev/)                            | 6.x   | Build tool & dev server         |
| [React](https://react.dev/)                            | 19.x  | UI framework                    |
| [TypeScript](https://www.typescriptlang.org/)          | 5.x   | Type safety                     |
| [Tailwind CSS](https://tailwindcss.com/)               | v4    | Styling utility-first           |
| [Shadcn/UI](https://ui.shadcn.com/)                    | —     | Komponen UI (Card, Button, dll) |
| [React Router DOM](https://reactrouter.com/)           | v7    | Client-side routing             |
| [Zustand](https://zustand-demo.pmnd.rs/)               | —     | State management (auth & tema)  |
| [Sonner](https://sonner.emilkowal.ski/)                | —     | Toast notification              |
| [Lucide React](https://lucide.dev/)                    | —     | Icon library                    |
| [Google OAuth](https://developers.google.com/identity) | —     | Autentikasi via Google          |

### Backend

| Teknologi                                 | Versi | Fungsi                         |
| ----------------------------------------- | ----- | ------------------------------ |
| [Bun](https://bun.sh/)                    | 1.x   | Runtime & package manager      |
| [ElysiaJS](https://elysiajs.com/)         | 1.x   | Web framework (ringan & cepat) |
| [Prisma ORM](https://www.prisma.io/)      | 6.x   | Database access & schema       |
| [PostgreSQL](https://www.postgresql.org/) | —     | Database relasional            |
| [Cloudinary](https://cloudinary.com/)     | —     | Upload & hosting gambar        |

### Infrastructure & Deployment

| Layanan                                      | Fungsi                          |
| -------------------------------------------- | ------------------------------- |
| [AWS Lambda](https://aws.amazon.com/lambda/) | Serverless backend hosting      |
| [AWS S3](https://aws.amazon.com/s3/)         | Storage deployment package      |
| [Neon](https://neon.tech/)                   | Managed PostgreSQL (serverless) |
| [Cloudflare](https://www.cloudflare.com/)    | CDN, SSL, custom domain         |

---

## 🏗️ Struktur Proyek

```
ppwl-clone-instagram/
├── frontend/                  # Aplikasi React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Avatar, ThemeToggle, LikeButton
│   │   │   ├── layout/        # MainLayout, Sidebar, BottomNav
│   │   │   ├── post/          # PostCard
│   │   │   ├── comment/       # CommentItem, CommentForm
│   │   │   └── ui/            # Shadcn/UI base components
│   │   ├── pages/             # HomePage, ProfilePage, PostDetailPage, ...
│   │   ├── services/          # api.client, post.service, like.service, ...
│   │   ├── store/             # auth.store, theme.store (Zustand)
│   │   └── hooks/             # usePosts
│   └── public/
├── backend/                   # ElysiaJS API + Prisma
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Login, Register, Google OAuth
│   │   │   ├── post/          # CRUD postingan + upload Cloudinary
│   │   │   ├── like/          # Toggle like & status
│   │   │   ├── comment/       # CRUD komentar + reply
│   │   │   ├── notification/  # List notifikasi user
│   │   │   ├── user/          # Data profil user
│   │   │   └── data/          # Endpoint inspeksi DB (dev only)
│   │   ├── config/            # env.ts, cloudinary.ts
│   │   └── lambda.ts          # Entry point AWS Lambda
│   ├── prisma/
│   │   ├── schema.prisma      # Model DB: User, Post, Comment, Like, ...
│   │   └── seed.ts            # Dummy data
│   └── deploy.sh              # Script deploy ke AWS Lambda
└── docs/                      # Dokumen task per anggota tim
```

---

## 🗃️ Database Schema

```
User ─── Post ──── Like
  │         │
  │         └──── Comment ──── Comment (reply)
  │
  └── Notification
```

**Models:** `User`, `Post`, `Comment`, `Like`, `Notification`

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

| Perintah              | Fungsi                                |
| --------------------- | ------------------------------------- |
| `bun dev`             | Jalankan frontend & backend bersamaan |
| `bun run dev:fe`      | Jalankan frontend saja                |
| `bun run dev:be`      | Jalankan backend saja                 |
| `bun run build`       | Build semua package                   |
| `bun run db:generate` | Generate Prisma client                |
| `bun run db:migrate`  | Jalankan migrasi database             |
| `bun run db:seed`     | Isi database dengan dummy data        |
| `bun run db:studio`   | Buka Prisma Studio (GUI database)     |

---

## 🌩️ Deploy Backend ke Lambda

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

> ⚠️ **Jangan commit `.env.production`** — file ini sudah di-ignore di `.gitignore`.

---

## ✅ Fitur yang Sudah Berjalan

- [x] Autentikasi (Register, Login, **Google OAuth**)
- [x] Feed beranda — menampilkan postingan semua user
- [x] Upload postingan dengan gambar (via Cloudinary)
- [x] Like / Unlike postingan (real-time optimistic update)
- [x] Komentar & Reply bertingkat
- [x] Halaman profil user + grid postingan
- [x] Halaman notifikasi
- [x] Dark / Light mode (persisten di localStorage)
- [x] Responsive design (desktop Sidebar + mobile BottomNav)
- [x] Deployment production di domain custom (`ppwl-a3.my.id`)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
PORT=3000
FRONTEND_URL="http://localhost:5173"
API_SECRET_KEY="your-secret-key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Frontend (`frontend/.env.development`)

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan akademik — **Tugas Besar PPWL**.
