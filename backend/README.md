# Instafy Backend API

Backend API untuk aplikasi Instafy (Instagram Clone) menggunakan Bun + Elysia + Prisma.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

⚠️ **IMPORTANT:** JANGAN PERNAH commit file `.env.production` ke Git!

```bash
# Copy template
cp .env.example .env

# Generate secure secrets
bash scripts/generate-secrets.sh

# Edit .env dengan credentials yang sebenarnya
nano .env
```

### 3. Setup Database

```bash
# Run migrations
bunx prisma migrate dev

# Seed database (optional)
bunx prisma db seed
```

### 4. Run Development Server

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000`

---

## 🔐 Security

**CRITICAL:** Baca [SECURITY.md](../docs/SECURITY.md) sebelum deployment!

### Generate Secure Secrets:

```bash
# JWT Secret & API Key
openssl rand -base64 32

# Web Push VAPID Keys
npx web-push generate-vapid-keys
```

### Pre-commit Hook:

Pre-commit hook sudah disetup untuk mencegah commit credentials. Jika perlu bypass (untuk `.env.example`):

```bash
git commit --no-verify
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── db/              # Database client
│   ├── middleware/      # Middleware (auth, rate-limit, etc.)
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── post/
│   │   ├── user/
│   │   └── ...
│   ├── plugins/         # Elysia plugins
│   ├── utils/           # Utility functions
│   ├── index.ts         # Main entry point
│   └── lambda.ts        # AWS Lambda handler
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── scripts/             # Utility scripts
└── deploy/              # Deployment files
```

---

## 🛠️ Available Scripts

```bash
# Development
bun run dev              # Run with hot reload

# Production
bun run start            # Run production server

# Database
bunx prisma migrate dev  # Run migrations (dev)
bunx prisma migrate deploy  # Run migrations (prod)
bunx prisma studio       # Open Prisma Studio
bunx prisma db seed      # Seed database

# Deployment
bash deploy.sh           # Deploy to AWS Lambda
```

---

## 🌐 API Endpoints

Lihat dokumentasi lengkap di:

- Development: `http://localhost:3000/swagger`
- Production: `https://api.ppwl-a3.my.id/`

---

## 🧪 Testing

```bash
# Run tests (coming soon)
bun test
```

---

## 📦 Tech Stack

- **Runtime:** Bun v1.3.9
- **Framework:** Elysia
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT
- **File Upload:** Cloudinary / AWS S3
- **Real-time:** Pusher
- **Push Notifications:** Web Push API

---

## 🚀 Deployment

### AWS Lambda

```bash
# Build dan deploy
bash deploy.sh
```

### Environment Variables (Production)

Set di AWS Lambda environment variables atau AWS Secrets Manager:

- `DATABASE_URL`
- `JWT_SECRET`
- `API_SECRET_KEY`
- `CLOUDINARY_*`
- `PUSHER_*`
- `WEB_PUSH_*`

---

## 📝 License

MIT

---

This project was created using `bun init` in bun v1.3.9. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
