# 🐛 BUG LIST - Instafy

**Tanggal:** 29 Mei 2026  
**Last Updated:** 29 Mei 2026 22:30  
**Progress:** 5/13 bugs fixed (38%)

---

## 📊 Progress Summary

| Category               | Total  | Done  | In Progress | TODO  |
| ---------------------- | ------ | ----- | ----------- | ----- |
| 🔥 SECURITY (CRITICAL) | 8      | 5     | 0           | 3     |
| 🐛 FUNCTIONAL (UI/UX)  | 5      | 0     | 0           | 5     |
| **TOTAL**              | **13** | **5** | **0**       | **8** |

---

## ✅ FIXED BUGS

### ✅ Bug #S0: Credentials Exposed di Git (CATASTROPHIC)

**Status:** ✅ DONE  
**Fixed:** 29 Mei 2026  
**Files Changed:**

- `backend/.env.production.example` (new)
- `backend/scripts/generate-secrets.sh` (new)
- `.git/hooks/pre-commit` (new)
- `docs/SECURITY.md` (new)

**What Was Fixed:**

- Pre-commit hook prevents committing .env files
- Template .env.production.example created
- Script to generate secure secrets
- Comprehensive security documentation

---

### ✅ Bug #S0.5: Admin Endpoints Exposed (CRITICAL)

**Status:** ✅ DONE  
**Fixed:** 29 Mei 2026  
**Files Changed:**

- `backend/src/modules/data/data.service.ts`
- `backend/src/modules/data/data.route.ts`

**What Was Fixed:**

- Excluded `passwordHash` and `providerId` from API responses
- Strong API key validation (min 32 chars)
- Audit logging for admin access
- Rate limiting for backup endpoint (1 per 10 min)

---

### ✅ Bug #S1: No Rate Limiting (CRITICAL)

**Status:** ✅ DONE  
**Fixed:** 29 Mei 2026  
**Files Changed:**

- `backend/src/middleware/rate-limit.middleware.ts` (new)
- `backend/src/modules/auth/auth.routes.ts`
- `backend/src/modules/comment/comment.routes.ts`

**What Was Fixed:**

- Comprehensive rate limiting middleware
- Auth endpoints: 5 requests/minute
- Comment endpoints: 20 comments/hour
- Rate limit headers in responses

### ✅ Bug #S2: No Input Sanitization (XSS)

**Status:** ✅ DONE  
**Fixed:** 29 Mei 2026  
**Files Changed:**

- `backend/src/utils/sanitize.ts` (new)
- `backend/src/modules/comment/comment.service.ts`
- `backend/src/modules/post/post.service.ts`
- `backend/src/modules/user/user.service.ts`

**What Was Fixed:**

- Created comprehensive sanitization utilities
- Sanitize comment content (strip ALL HTML)
- Sanitize post caption (allow basic formatting)
- Sanitize user bio (strip ALL HTML)
- Sanitize website URLs (only allow http/https)
- Logging for sanitization events

---

### ✅ Bug #S3: JWT Token di LocalStorage (CRITICAL)

**Status:** ✅ DONE  
**Fixed:** 29 Mei 2026  
**Files Changed:**

- `backend/src/modules/auth/auth.routes.ts`
- `backend/src/plugins/auth.plugin.ts`
- `frontend/src/store/auth.store.ts`
- `frontend/src/services/api.client.ts`
- `frontend/src/services/auth.service.ts`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/components/layout/Sidebar.tsx`

**What Was Fixed:**

- Moved JWT token from localStorage to HttpOnly cookie
- Backend sends token via `Set-Cookie` header
- Frontend sends cookie automatically via `credentials: 'include'`
- Added `/auth/logout` endpoint to clear cookie
- Removed token from Zustand store (only user data persisted)
- Backward compatible: supports both cookie and Bearer token

---

## 🔴 SECURITY BUGS (TODO)

### Bug #S2: No Input Sanitization (XSS)

**Severity:** 🔴 CRITICAL  
**Status:** ⏳ TODO  
**Files:** `backend/src/modules/comment/comment.service.ts`, `backend/src/modules/post/post.service.ts`

**Issue:** Attacker bisa inject malicious JavaScript di comments, posts, bio.

**Fix Needed:**

- Install DOMPurify atau sanitize-html
- Sanitize comment content
- Sanitize post caption
- Sanitize user bio

---

### ✅ Bug #S4: Weak CORS Configuration (CRITICAL)

**Status:** ✅ DONE  
**Fixed:** 29 Mei 2026  
**Files Changed:**

- `backend/src/index.ts`

**What Was Fixed:**

- Reject requests without origin header (except public endpoints)
- Whitelist specific origins only (production + localhost)
- Added logging for blocked CORS requests
- Explicitly set allowed methods (GET, POST, PUT, DELETE, OPTIONS)
- Explicitly set allowed headers (Content-Type, Authorization)
- Set preflight cache max age (24 hours)
- Allow public endpoints (/health, /swagger) without origin

---

## 🔴 SECURITY BUGS (TODO)

### Bug #S5: Weak Password Validation

**Severity:** 🟠 HIGH  
**Status:** ⏳ TODO  
**Files:** `backend/src/modules/auth/auth.service.ts`

**Fix Needed:**

- Validate password strength (min 8 chars, uppercase, lowercase, number, special char)

---

### Bug #S6: No CSP Headers

**Severity:** 🟡 MEDIUM  
**Status:** ⏳ TODO  
**Files:** `backend/src/index.ts`

**Fix Needed:**

- Add Content-Security-Policy headers
- Add X-Frame-Options, X-Content-Type-Options

---

## 🐛 FUNCTIONAL BUGS (TODO)

### BUG #1: Gambar di Editor Foto Belum Bisa Digeser (Mobile)

**Severity:** 🟡 MEDIUM  
**File:** `frontend/src/pages/CreatePostPage.tsx`  
**Deskripsi:** Gambar sudah bisa digeser di desktop (mouse), tapi belum support touch events untuk mobile.

### 📋 TO-DO LIST:

- [ ] **Step 1:** Tambahkan touch event handlers di canvas
  - File: `frontend/src/pages/CreatePostPage.tsx`
  - Tambahkan `onTouchStart`, `onTouchMove`, `onTouchEnd` di canvas element (line ~450)
- [ ] **Step 2:** Buat fungsi `getTouchCoords()` untuk konversi touch coordinates
  - Mirip dengan `getCanvasCoords()` tapi untuk touch events
  - Handle multiple touches (gunakan `e.touches[0]`)
- [ ] **Step 3:** Implementasi touch drag untuk foto
  - Di `handleTouchStart`: Set `isDraggingPhoto = true`
  - Di `handleTouchMove`: Update `imageX` dan `imageY`
  - Di `handleTouchEnd`: Set `isDraggingPhoto = false`
- [ ] **Step 4:** Implementasi touch drag untuk text items
  - Sama seperti foto, tapi untuk text items
- [ ] **Step 5:** Implementasi touch drawing untuk brush
  - Di `handleTouchStart`: Mulai stroke baru
  - Di `handleTouchMove`: Tambah points ke stroke
  - Di `handleTouchEnd`: Selesaikan stroke
- [ ] **Step 6:** Test di mobile device atau Chrome DevTools mobile emulator
  - Test drag foto
  - Test drag text
  - Test drawing dengan finger

### 💡 Hint Code:

```typescript
// Tambahkan di CreatePostPage.tsx setelah getCanvasCoords()

const getTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0] || e.changedTouches[0];
  const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
};

const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
  e.preventDefault(); // Prevent scrolling
  const { x, y } = getTouchCoords(e);

  if (tool === "photo") {
    setIsDraggingPhoto(true);
    setDragStart({ x: x - imageX, y: y - imageY });
  } else if (tool === "draw") {
    // ... sama seperti handleMouseDown
  } else if (tool === "text") {
    // ... sama seperti handleMouseDown
  }
};

// Tambahkan di canvas element:
<canvas
  ref={canvasRef}
  width={canvasWidth}
  height={canvasHeight}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUpOrLeave}
  onMouseLeave={handleMouseUpOrLeave}
  onTouchStart={handleTouchStart}      // ✅ TAMBAH INI
  onTouchMove={handleTouchMove}        // ✅ TAMBAH INI
  onTouchEnd={handleTouchEnd}          // ✅ TAMBAH INI
  className="..."
/>
```

---

## BUG #2: Tombol Theme Toggle Tidak Ada di Mobile

**Severity:** 🟡 MEDIUM  
**File:** `frontend/src/components/layout/Navbar.tsx` (atau layout lain)  
**Deskripsi:** ThemeToggle hanya ada di LoginPage, tidak ada di halaman lain terutama di mobile.

### 📋 TO-DO LIST:

- [ ] **Step 1:** Cari file Navbar/Header component
  - Kemungkinan di `frontend/src/components/layout/Navbar.tsx`
  - Atau `frontend/src/components/layout/Header.tsx`
- [ ] **Step 2:** Import ThemeToggle component
  ```typescript
  import { ThemeToggle } from "../common/ThemeToggle";
  ```
- [ ] **Step 3:** Tambahkan ThemeToggle di Navbar (Desktop)
  - Letakkan di sebelah kanan navbar
  - Sejajar dengan icon notifikasi/profile
- [ ] **Step 4:** Tambahkan ThemeToggle di Mobile Menu
  - Jika ada hamburger menu, tambahkan di dalam menu
  - Atau buat floating button di pojok kanan bawah untuk mobile
- [ ] **Step 5:** Styling untuk mobile
  - Pastikan button tidak terlalu kecil (min 44x44px untuk touch target)
  - Tambahkan spacing yang cukup
- [ ] **Step 6:** Test di berbagai screen size
  - Desktop: >= 1024px
  - Tablet: 768px - 1023px
  - Mobile: < 768px

### 💡 Hint Code:

```typescript
// Di Navbar.tsx atau Header.tsx

// Desktop (di sebelah kanan)
<div className="hidden md:flex items-center gap-4">
  <ThemeToggle />
  {/* Icon notifikasi, messages, dll */}
</div>

// Mobile (floating button di pojok kanan bawah)
<div className="fixed bottom-20 right-4 z-50 md:hidden">
  <ThemeToggle />
</div>

// Atau di dalam mobile menu drawer
<div className="md:hidden">
  {/* ... menu items ... */}
  <div className="border-t border-ig-border pt-4 mt-4">
    <div className="flex items-center justify-between px-4">
      <span className="text-sm">Tema</span>
      <ThemeToggle />
    </div>
  </div>
</div>
```

---

## BUG #3: Optimalkan Tampilan Editor Post untuk Mobile

**Severity:** 🟠 HIGH  
**File:** `frontend/src/pages/CreatePostPage.tsx`, `frontend/src/pages/create/EditorToolPanel.tsx`  
**Deskripsi:** Layout editor di mobile kurang optimal, panel tool terlalu besar dan canvas terlalu kecil.

### 📋 TO-DO LIST:

- [ ] **Step 1:** Ubah layout editor menjadi vertical di mobile
  - File: `CreatePostPage.tsx` line ~450
  - Ganti `flex-col md:flex-row` menjadi full vertical di mobile
- [ ] **Step 2:** Perbesar canvas di mobile
  - Ubah `min-h-[400px]` menjadi `min-h-[60vh]` untuk mobile
  - Ubah `max-h-[50vh]` menjadi `max-h-[65vh]` untuk mobile
- [ ] **Step 3:** Buat tool panel collapsible di mobile
  - Tambahkan state `isPanelOpen` untuk toggle panel
  - Default closed di mobile, open di desktop
  - Tambahkan button untuk toggle panel
- [ ] **Step 4:** Ubah tool tabs menjadi horizontal scroll di mobile
  - File: `EditorToolPanel.tsx`
  - Ganti grid menjadi flex dengan overflow-x-auto
- [ ] **Step 5:** Perkecil ukuran controls di mobile
  - Slider lebih compact
  - Font size lebih kecil
  - Padding lebih kecil
- [ ] **Step 6:** Test di mobile device
  - Test semua tools (photo, filter, draw, text)
  - Pastikan semua controls accessible
  - Pastikan tidak ada horizontal scroll yang tidak diinginkan

### 💡 Hint Code:

```typescript
// CreatePostPage.tsx

const [isPanelOpen, setIsPanelOpen] = useState(false);

// Di editor step:
<div className="flex-1 flex flex-col overflow-hidden">
  {/* Canvas - Full height di mobile */}
  <div className="flex-1 flex items-center justify-center bg-black/90 p-2 md:p-4 relative">
    <div
      style={{
        width: "100%",
        maxWidth: canvasWidth >= canvasHeight ? "600px" : `${(canvasWidth / canvasHeight) * 600}px`,
        aspectRatio: `${canvasWidth}/${canvasHeight}`,
      }}
      className="relative max-h-[65vh] md:max-h-[75vh] rounded-xl overflow-hidden"
    >
      <canvas ref={canvasRef} ... />
    </div>
  </div>

  {/* Tool Panel - Collapsible di mobile */}
  <div className={`
    ${isPanelOpen ? 'h-[40vh]' : 'h-14'}
    md:h-auto md:w-80
    transition-all duration-300
    border-t md:border-l border-ig-border
  `}>
    {/* Toggle button - hanya di mobile */}
    <button
      onClick={() => setIsPanelOpen(!isPanelOpen)}
      className="md:hidden w-full h-14 flex items-center justify-center border-b border-ig-border"
    >
      {isPanelOpen ? '▼ Tutup Panel' : '▲ Buka Panel'}
    </button>

    {/* Panel content */}
    <div className={`${isPanelOpen ? 'block' : 'hidden'} md:block overflow-y-auto`}>
      <EditorToolPanel ... />
    </div>
  </div>
</div>

// EditorToolPanel.tsx - Horizontal scroll tabs di mobile
<div className="flex md:grid md:grid-cols-4 gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
  {tabs.map(tab => (
    <button key={tab.id} className="flex-shrink-0 md:flex-shrink">
      {/* ... */}
    </button>
  ))}
</div>
```

---

## BUG #4: Endpoint Root (/) Tidak Menampilkan Daftar Endpoints

**Severity:** 🟡 MEDIUM  
**File:** `backend/src/index.ts`  
**Deskripsi:** Endpoint `/` tidak ada, seharusnya menampilkan daftar semua endpoints yang tersedia (API documentation).

### 📋 TO-DO LIST:

- [ ] **Step 1:** Buat endpoint GET `/` di index.ts
  - File: `backend/src/index.ts`
  - Tambahkan sebelum `.use(authRoutes)`
- [ ] **Step 2:** Buat list semua endpoints dengan deskripsi
  - Auth endpoints
  - Post endpoints
  - User endpoints
  - Comment endpoints
  - dll
- [ ] **Step 3:** Tambahkan informasi API version dan status
  - Version: dari package.json
  - Status: online/offline
  - Timestamp
- [ ] **Step 4:** Format response sebagai JSON yang readable
  - Grouping by module
  - Include method (GET/POST/PUT/DELETE)
  - Include description
  - Include required auth
- [ ] **Step 5:** (Optional) Buat HTML view untuk browser
  - Jika request dari browser, return HTML
  - Jika request dari API client, return JSON
- [ ] **Step 6:** Test endpoint
  - `curl https://api.ppwl-a3.my.id/`
  - Buka di browser

### 💡 Hint Code:

```typescript
// backend/src/index.ts

export const app = new Elysia()
  .use(errorPlugin)
  .use(cors({ ... }))
  .use(isProd ? (a) => a : swagger({ path: "/swagger" }))

  // ✅ TAMBAH ENDPOINT ROOT
  .get("/", ({ request }) => {
    const userAgent = request.headers.get("user-agent") || "";
    const isBrowser = userAgent.includes("Mozilla");

    const apiInfo = {
      name: "Instafy API",
      version: "1.0.0",
      status: "online",
      timestamp: new Date().toISOString(),
      documentation: isProd ? null : "/swagger",
      endpoints: {
        auth: {
          "POST /auth/register": "Register new user",
          "POST /auth/login": "Login with email/username",
          "POST /auth/google": "Login with Google OAuth",
        },
        posts: {
          "GET /posts": "Get all posts (feed)",
          "GET /posts/:id": "Get single post",
          "POST /posts": "Create new post (requires auth)",
          "PUT /posts/:id": "Update post (requires auth)",
          "DELETE /posts/:id": "Delete post (requires auth)",
          "POST /posts/:id/bookmark": "Toggle bookmark (requires auth)",
        },
        users: {
          "GET /users": "Search users (requires auth)",
          "GET /users/username/:username": "Get user profile",
          "PUT /users/profile": "Update profile (requires auth)",
        },
        comments: {
          "GET /comments": "Get all comments",
          "POST /comments": "Create comment (requires auth)",
          "POST /comments/:id/like": "Toggle like comment (requires auth)",
        },
        likes: {
          "POST /likes": "Toggle like post (requires auth)",
          "GET /likes/:postId": "Get like status",
        },
        follow: {
          "GET /follow/stats/:userId": "Get follow stats",
          "GET /follow/followers/:userId": "Get followers list",
          "GET /follow/following/:userId": "Get following list",
          "GET /follow/suggestions": "Get follow suggestions (requires auth)",
          "POST /follow": "Follow user (requires auth)",
          "DELETE /follow": "Unfollow user (requires auth)",
        },
        notifications: {
          "GET /notifications": "Get notifications (requires auth)",
          "GET /notifications/unread-count": "Get unread count (requires auth)",
          "POST /notifications/subscribe": "Subscribe to push (requires auth)",
        },
        messages: {
          "GET /messages/rooms": "Get chat rooms (requires auth)",
          "GET /messages/:roomId": "Get messages (requires auth)",
          "POST /messages": "Send message (requires auth)",
        },
        stories: {
          "GET /stories": "Get active stories (requires auth)",
          "POST /stories": "Create story (requires auth)",
        },
        monitoring: {
          "GET /monitoring": "Health check (requires auth)",
        },
        health: {
          "GET /health": "Simple health check (public)",
        },
      },
    };

    // Return HTML untuk browser
    if (isBrowser) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Instafy API</title>
          <style>
            body { font-family: system-ui; max-width: 1200px; margin: 40px auto; padding: 20px; }
            h1 { color: #d300c5; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
            .method { font-weight: bold; color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>🚀 Instafy API</h1>
          <p>Version: ${apiInfo.version} | Status: ${apiInfo.status}</p>
          ${!isProd ? `<p><a href="/swagger">📖 Swagger Documentation</a></p>` : ''}
          <h2>Available Endpoints:</h2>
          ${Object.entries(apiInfo.endpoints).map(([module, endpoints]) => `
            <h3>${module.toUpperCase()}</h3>
            ${Object.entries(endpoints as any).map(([endpoint, desc]) => `
              <div class="endpoint">
                <span class="method">${endpoint}</span> - ${desc}
              </div>
            `).join('')}
          `).join('')}
        </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Return JSON untuk API client
    return apiInfo;
  })

  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(authRoutes)
  // ... rest
```

---

## BUG #5: Endpoint /health dan /users Tidak Require API Key

**Severity:** 🔴 CRITICAL  
**File:** `backend/src/index.ts`, `backend/src/modules/user/user.routes.ts`  
**Deskripsi:** Endpoint `/health` dan `/users` bisa diakses tanpa API key, seharusnya require API key atau auth.

### 📋 TO-DO LIST:

- [ ] **Step 1:** Buat middleware untuk API key validation
  - File: `backend/src/middleware/api-key.middleware.ts` (buat baru)
  - Check header `x-api-key` atau query param `key`
  - Compare dengan `process.env.API_SECRET_KEY`
- [ ] **Step 2:** Apply middleware ke endpoint /health
  - File: `backend/src/index.ts`
  - Wrap `/health` dengan middleware
- [ ] **Step 3:** Endpoint /users sudah require auth, tapi perlu diperkuat
  - File: `backend/src/modules/user/user.routes.ts`
  - Sudah ada `requireAuth`, ini sudah benar
  - Tapi perlu tambahkan rate limiting
- [ ] **Step 4:** Ganti API_SECRET_KEY yang lemah
  - File: `backend/.env.production`
  - Ganti "rahasia" dengan key yang kuat (min 32 karakter random)
  - Generate dengan: `openssl rand -base64 32`
- [ ] **Step 5:** Tambahkan logging untuk API key usage
  - Log setiap request yang menggunakan API key
  - Log failed API key attempts
- [ ] **Step 6:** Test endpoints
  - Test `/health` tanpa key (should fail)
  - Test `/health` dengan key salah (should fail)
  - Test `/health` dengan key benar (should success)

### 💡 Hint Code:

```typescript
// backend/src/middleware/api-key.middleware.ts (BUAT FILE BARU)

import { Elysia } from "elysia";

export const requireApiKey = new Elysia()
  .derive({ as: "global" }, ({ request, set }) => {
    const url = new URL(request.url);
    const keyFromQuery = url.searchParams.get("key");
    const keyFromHeader = request.headers.get("x-api-key");
    const providedKey = keyFromQuery || keyFromHeader;

    const validKey = process.env.API_SECRET_KEY;

    if (!validKey) {
      console.error("⚠️ API_SECRET_KEY not configured!");
      set.status = 500;
      throw new Error("Server configuration error");
    }

    if (!providedKey || providedKey !== validKey) {
      // Log failed attempt
      console.warn(`❌ Invalid API key attempt from ${request.headers.get("x-forwarded-for") || "unknown"}`);

      set.status = 401;
      throw new Error("Unauthorized: Invalid or missing API key");
    }

    // Log successful usage
    console.log(`✅ API key validated for ${url.pathname}`);

    return {};
  });

// backend/src/index.ts

import { requireApiKey } from "@/middleware/api-key.middleware";

export const app = new Elysia()
  .use(errorPlugin)
  .use(cors({ ... }))

  .get("/", ({ request }) => { ... }) // Public

  // ✅ PROTECT /health dengan API key
  .get("/health", ({ request }) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  })
  .use(requireApiKey) // Apply ke /health

  .use(authRoutes)
  // ... rest

// ATAU jika mau /health tetap public tapi /health/detailed require key:
.get("/health", () => ({ status: "ok" })) // Public, simple
.get("/health/detailed", async () => {
  // Detailed health check
  return await MonitoringService.checkHealth();
})
.use(requireApiKey) // Apply ke /health/detailed
```

### 🔐 Generate Strong API Key:

```bash
# Di terminal:
openssl rand -base64 32

# Output contoh:
# 8xK9mP2nQ5vR7wT4yU6zA3bC1dE0fG8hJ9kL2mN5oP7q

# Ganti di .env.production:
API_SECRET_KEY="8xK9mP2nQ5vR7wT4yU6zA3bC1dE0fG8hJ9kL2mN5oP7q"
```

---

## 📊 Summary

| Bug # | Severity    | Estimasi Waktu | Priority |
| ----- | ----------- | -------------- | -------- |
| #1    | 🟡 MEDIUM   | 2-3 jam        | 3        |
| #2    | 🟡 MEDIUM   | 1-2 jam        | 4        |
| #3    | 🟠 HIGH     | 3-4 jam        | 2        |
| #4    | 🟡 MEDIUM   | 1-2 jam        | 5        |
| #5    | 🔴 CRITICAL | 1-2 jam        | 1        |

**Total Estimasi:** 8-13 jam

---

## 🎯 Recommended Order:

1. **BUG #5** (CRITICAL) - API Key protection (1-2 jam)
2. **BUG #3** (HIGH) - Mobile editor optimization (3-4 jam)
3. **BUG #1** (MEDIUM) - Touch events untuk drag (2-3 jam)
4. **BUG #2** (MEDIUM) - Theme toggle di mobile (1-2 jam)
5. **BUG #4** (MEDIUM) - Root endpoint documentation (1-2 jam)

---

**Catatan:** Setiap bug sudah ada to-do list yang detail dan hint code. Kamu bisa kerjakan satu per satu sesuai priority. Good luck! 🚀
