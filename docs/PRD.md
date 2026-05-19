# 📐 Rencana Arsitektur: Clone Instagram — PPWL

> **Tim:** Rafli Pratama (Ketua), Adella Rheina Sweeta, Rifa Dwinanda Bagaskara, Tan Atira Yasmin, Olivia Naura Fakhradika, Salsabila Nur Anisa
> **Stack:** Bun Monorepo · Vite+React · ElysiaJS · Prisma ORM · PostgreSQL (AWS RDS) · AWS S3/Lambda/Vercel

---

## 1. Jawaban Cepat

| Pertanyaan                  | Jawaban                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Pakai Vite?                 | **YA, HARUS.** Brief dosen eksplisit minta Vite. Frontend sekarang pakai Bun native bundler (bukan Vite). Perlu migrasi. |
| Monorepo root package.json? | **YA.** Pakai Bun workspaces agar bisa `bun run dev:fe`, `bun run dev:be`, dll.                                          |
| Git aman push ke GitHub?    | **YA**, cukup commit seluruh struktur folder (termasuk yang kosong dengan `.gitkeep`).                                   |

---

## 2. Struktur Folder Monorepo Lengkap

```
ppwl-clone-instagram/
│
├── package.json                  ← ROOT: workspace & script dev/build global
├── bun.lock                      ← Lockfile tunggal untuk seluruh workspace
├── .gitignore                    ← Root gitignore
├── .env.example                  ← Template env yang aman dicommit
├── README.md
│
├── public/                       ← Aset statis global (font dll)
│   └── font/
│       ├── instagram-sans-consended-regular.ttf
│       ├── instagram-sans-consended.ttf
│       └── instagram-sans-consesded-bold.ttf
│
├── shared/                       ← PACKAGE: @ppwl/shared
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts              ← Re-export semua
│       ├── types/
│       │   ├── user.ts
│       │   ├── post.ts
│       │   ├── comment.ts
│       │   └── notification.ts
│       └── utils/
│           ├── date.ts
│           └── format.ts
│
├── backend/                      ← PACKAGE: @ppwl/backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                      ← JANGAN DICOMMIT
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts              ← Entry point Elysia
│       ├── config/
│       │   ├── env.ts            ← Validasi env vars
│       │   └── cors.ts
│       ├── db/
│       │   └── client.ts         ← Prisma client singleton
│       ├── plugins/
│       │   └── auth.plugin.ts    ← JWT / Session Elysia plugin
│       ├── modules/              ← Fitur dipecah per modul (SOLID)
│       │   ├── auth/
│       │   │   ├── auth.routes.ts
│       │   │   ├── auth.service.ts
│       │   │   └── auth.schema.ts
│       │   ├── user/
│       │   │   ├── user.routes.ts
│       │   │   ├── user.service.ts
│       │   │   └── user.schema.ts
│       │   ├── post/
│       │   │   ├── post.routes.ts
│       │   │   ├── post.service.ts
│       │   │   └── post.schema.ts
│       │   ├── comment/
│       │   │   ├── comment.routes.ts
│       │   │   ├── comment.service.ts
│       │   │   └── comment.schema.ts
│       │   ├── like/
│       │   │   ├── like.routes.ts
│       │   │   └── like.service.ts
│       │   └── notification/
│       │       ├── notification.routes.ts
│       │       └── notification.service.ts
│       └── middleware/
│           ├── auth.middleware.ts
│           └── rate-limit.middleware.ts
│
└── frontend/                     ← PACKAGE: @ppwl/frontend (VITE + REACT)
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── .env                      ← JANGAN DICOMMIT
    ├── .env.example
    ├── index.html                ← Entry HTML Vite (ROOT, bukan di src/)
    ├── styles/
    │   └── globals.css           ← ✅ Sudah ada
    └── src/
        ├── main.tsx              ← Entry point React
        ├── App.tsx               ← Router utama (React Router)
        ├── vite-env.d.ts         ← Type declarations Vite
        │
        ├── assets/               ← Gambar, ikon, dll
        │
        ├── components/           ← Komponen reusable
        │   ├── ui/               ← ShadcnUI components
        │   ├── layout/
        │   │   ├── Sidebar.tsx
        │   │   ├── BottomNav.tsx  ← Mobile nav
        │   │   └── MainLayout.tsx
        │   ├── post/
        │   │   ├── PostCard.tsx
        │   │   ├── PostForm.tsx
        │   │   └── PostDetail.tsx
        │   ├── comment/
        │   │   ├── CommentItem.tsx
        │   │   └── CommentForm.tsx
        │   ├── story/
        │   │   └── StoryRing.tsx
        │   └── common/
        │       ├── Avatar.tsx
        │       ├── LikeButton.tsx
        │       └── NotificationBadge.tsx
        │
        ├── pages/                ← Halaman (1 file = 1 route)
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── HomePage.tsx
        │   ├── PostDetailPage.tsx
        │   ├── CreatePostPage.tsx
        │   ├── NotificationsPage.tsx
        │   └── ProfilePage.tsx
        │
        ├── hooks/                ← Custom React Hooks
        │   ├── useAuth.ts
        │   ├── usePosts.ts
        │   └── useInfiniteScroll.ts
        │
        ├── services/             ← API calls (fetch/axios)
        │   ├── api.client.ts     ← Base fetch wrapper
        │   ├── auth.service.ts
        │   ├── post.service.ts
        │   ├── comment.service.ts
        │   └── notification.service.ts
        │
        ├── store/                ← State management (Zustand / Context)
        │   ├── auth.store.ts
        │   └── ui.store.ts
        │
        └── lib/
            ├── utils.ts          ← cn(), dll
            └── constants.ts
```

---

## 3. Root `package.json` (Monorepo Workspace)

```json
{
  "name": "ppwl-clone-instagram",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["frontend", "backend", "shared"],
  "scripts": {
    "dev:fe": "bun --cwd frontend dev",
    "dev:be": "bun --cwd backend dev",
    "dev": "bun run dev:be & bun run dev:fe",
    "build:fe": "bun --cwd frontend build",
    "build:be": "bun --cwd backend build",
    "build": "bun run build:shared && bun run build:fe && bun run build:be",
    "build:shared": "bun --cwd shared build",
    "db:generate": "bun --cwd backend prisma generate",
    "db:migrate": "bun --cwd backend prisma migrate dev",
    "db:seed": "bun --cwd backend prisma db seed",
    "db:studio": "bun --cwd backend prisma studio",
    "lint": "bun --cwd frontend lint && bun --cwd backend lint"
  }
}
```

---

## 4. Migrasi Frontend: dari Bun Native → Vite

> [!IMPORTANT]
> Frontend kamu sekarang pakai `bun --hot` + custom `build.ts` (Bun native bundler). Brief dosen eksplisit butuh **Vite**. Ini langkah migrasinya.

### Langkah migrasi (jalankan satu per satu):

```bash
# 1. Masuk ke direktori frontend
cd frontend

# 2. Install Vite dan plugin React
bun add -d vite @vitejs/plugin-react-swc

# 3. Install react-router untuk routing
bun add react-router-dom

# 4. Hapus file yang tidak diperlukan setelah migrasi
rm build.ts bun-env.d.ts bunfig.toml
```

### Pindahkan `index.html` ke root frontend:

File `src/index.html` harus dipindahkan ke `frontend/index.html` (root), karena Vite membacanya dari root, bukan dari `src/`.

---

## 5. File Konfigurasi Kunci

### `frontend/vite.config.ts`

```ts
import { defineConfig } from "vite";
import reactSWC from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [reactSWC()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ppwl/shared": path.resolve(__dirname, "../shared/src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

### `frontend/package.json` (setelah migrasi Vite)

```json
{
  "name": "@ppwl/frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7",
    "lucide-react": "^0.545.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "class-variance-authority": "^0.7.1",
    "@ppwl/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react-swc": "^3",
    "vite": "^6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### `backend/package.json`

```json
{
  "name": "@ppwl/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun --hot src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "start": "NODE_ENV=production bun dist/index.js"
  },
  "dependencies": {
    "elysia": "latest",
    "@elysiajs/jwt": "latest",
    "@elysiajs/cors": "latest",
    "@elysiajs/bearer": "latest",
    "@prisma/client": "^6",
    "@ppwl/shared": "workspace:*"
  },
  "devDependencies": {
    "prisma": "^6",
    "@types/bun": "latest",
    "typescript": "^5"
  }
}
```

### `shared/package.json`

```json
{
  "name": "@ppwl/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

---

## 6. Skema Database (Prisma)

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  name          String
  passwordHash  String?
  avatarUrl     String?
  bio           String?
  provider      String    @default("email") // "email" | "google"
  providerId    String?

  posts         Post[]
  comments      Comment[]
  likes         Like[]
  notifications Notification[] @relation("NotificationReceiver")

  postCount     Int       @default(0)
  commentCount  Int       @default(0)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Post {
  id        String    @id @default(cuid())
  content   String
  imageUrl  String?   // Wajib image, NO VIDEO (sesuai brief)
  author    User      @relation(fields: [authorId], references: [id])
  authorId  String

  comments  Comment[]
  likes     Like[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Comment {
  id        String    @id @default(cuid())
  content   String
  author    User      @relation(fields: [authorId], references: [id])
  authorId  String
  post      Post      @relation(fields: [postId], references: [id])
  postId    String

  // Nested comment / reply
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  String?
  replies   Comment[] @relation("CommentReplies")

  createdAt DateTime  @default(now())
}

model Like {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  post      Post     @relation(fields: [postId], references: [id])
  postId    String

  @@unique([userId, postId])
  createdAt DateTime @default(now())
}

model Notification {
  id         String   @id @default(cuid())
  receiver   User     @relation("NotificationReceiver", fields: [receiverId], references: [id])
  receiverId String
  type       String   // "like" | "comment" | "follow"
  message    String
  isRead     Boolean  @default(false)
  refId      String?  // ID post/comment terkait

  createdAt  DateTime @default(now())
}
```

---

## 7. Aturan Bisnis & Keamanan (sesuai brief)

| Aturan                          | Implementasi                                                        |
| ------------------------------- | ------------------------------------------------------------------- |
| Max 2 post per user             | Cek `user.postCount >= 2` di `post.service.ts` sebelum create       |
| Max 5 komentar per user         | Cek `user.commentCount >= 5` di `comment.service.ts` sebelum create |
| No upload video                 | Validasi MIME type di backend, hanya izinkan `image/*`              |
| Guest bisa lihat beranda & post | Route publik tidak pakai `auth.middleware.ts`                       |
| Login untuk like/post/comment   | Route terkait wajib pakai `auth.middleware.ts`                      |

---

## 8. Rencana Deployment (Production)

```
[Browser]
    │
    ▼
[Cloudflare / Domain] ──→ [Vercel] (Frontend React build)
                               │
                               │ /api/*
                               ▼
                     [AWS Lambda / EC2] (ElysiaJS Backend)
                               │
                               ▼
                       [AWS RDS PostgreSQL]

[Aset Gambar] ──→ [AWS S3 + CloudFront CDN]
```

### Environment Variables

**`.env.example` (root)**

```env
# DATABASE
DATABASE_URL=postgresql://user:pass@localhost:5432/ppwl_ig

# JWT
JWT_SECRET=ganti_dengan_secret_panjang_dan_random

# OAuth Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

---

## 9. `.gitignore` (Root)

```gitignore
# Dependencies
node_modules/
.bun/

# Build output
dist/
.output/

# Environment (WAJIB JANGAN COMMIT!)
.env
.env.local
.env.production

# OS
.DS_Store
Thumbs.db

# Logs
*.log
bun-error.log

# Prisma
backend/prisma/migrations/*.sql

# IDE
.vscode/settings.json
.idea/
```

---

## 10. Inisialisasi Git + Push ke GitHub

> [!NOTE]
> Git sudah ada (ada folder `.git`). Tinggal tambahkan remote dan push.

```bash
# Pastikan kamu di root proyek
git add .
git commit -m "chore: initial project structure"

# Tambahkan remote GitHub (ganti URL sesuai repo kamu)
git remote add origin https://github.com/USERNAME/ppwl-clone-instagram.git

# Push ke branch main
git branch -M main
git push -u origin main
```

Untuk folder kosong agar tetap ter-track di git, tambahkan file `.gitkeep` di dalamnya:

```bash
# Contoh untuk folder yang masih kosong
touch backend/.gitkeep
touch shared/src/.gitkeep
```

---

## 11. Pembagian Tugas Tim (Saran)

| Anggota           | Area                                               |
| ----------------- | -------------------------------------------------- |
| **Rafli (Ketua)** | Arsitektur, Auth (Login/Register/OAuth), Setup AWS |
| **Adella**        | Halaman Beranda & Feed                             |
| **Rifa**          | Fitur Post (CRUD, Like)                            |
| **Atira**         | Fitur Komentar & Nested Reply                      |
| **Olivia**        | Halaman Profile & Edit Profile                     |
| **Salsabila**     | Notifikasi & UI Mobile (BottomNav)                 |
