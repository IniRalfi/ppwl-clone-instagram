# 🐛 BUG LIST - Instafy

**Last Updated:** 30 Mei 2026 01:30  
**Progress:** 8/13 bugs fixed (62%)

---

## 📊 Progress Summary

| Category               | Total  | Done  | TODO  |
| ---------------------- | ------ | ----- | ----- |
| 🔥 SECURITY (CRITICAL) | 8      | 8     | 0     |
| 🐛 FUNCTIONAL (UI/UX)  | 5      | 0     | 5     |
| **TOTAL**              | **13** | **8** | **5** |

---

## ✅ FIXED BUGS (Security)

### Bug #S0: Credentials Exposed di Git

- **Fixed:** 29 Mei 2026
- **Files:** `.git/hooks/pre-commit`, `backend/.env.production.example`, `backend/scripts/generate-secrets.sh`
- **Solution:** Pre-commit hook, template files, secret generator

### Bug #S0.5: Admin Endpoints Exposed

- **Fixed:** 29 Mei 2026
- **Files:** `backend/src/modules/data/*`
- **Solution:** API key validation, exclude sensitive fields, rate limiting, audit logging

### Bug #S1: No Rate Limiting

- **Fixed:** 29 Mei 2026
- **Files:** `backend/src/middleware/rate-limit.middleware.ts`, auth & comment routes
- **Solution:** Rate limiting middleware (5 req/min auth, 20 comments/hour)

### Bug #S2: No Input Sanitization (XSS)

- **Fixed:** 29 Mei 2026
- **Files:** `backend/src/utils/sanitize.ts`, comment/post/user services
- **Solution:** Sanitize all user inputs (comments, captions, bio, URLs)

### Bug #S3: JWT Token di LocalStorage

- **Fixed:** 29 Mei 2026
- **Files:** Backend auth routes, frontend api client & store
- **Solution:** Moved JWT to HttpOnly cookie, removed from localStorage

### Bug #S4: Weak CORS Configuration

- **Fixed:** 29 Mei 2026
- **Files:** `backend/src/index.ts`
- **Solution:** Whitelist origins, reject no-origin requests, explicit methods/headers

### Bug #S5: Weak Password Validation

- **Fixed:** 29 Mei 2026
- **Files:** `backend/src/utils/password-validator.ts`, auth routes & schema
- **Solution:** Min 8 chars, uppercase, lowercase, number, special char, block common patterns

### Bug #S5.5: Error Messages Tidak Informatif

- **Fixed:** 30 Mei 2026
- **Files:** `backend/src/plugins/error.plugin.ts`, `frontend/src/services/api.client.ts`, `frontend/src/pages/LoginPage.tsx`
- **Solution:** User-friendly error messages in Indonesian, password strength indicator

### Bug #S6: No CSP Headers

- **Fixed:** 30 Mei 2026
- **Files:** `backend/src/plugins/security-headers.plugin.ts`, `backend/src/index.ts`
- **Solution:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS

---

## 🎉 ALL SECURITY BUGS FIXED! (8/8 - 100%)

---

## 🐛 FUNCTIONAL BUGS (TODO)

### Bug #1: Gambar di Editor Foto Belum Bisa Digeser (Mobile)

- **Severity:** 🟡 MEDIUM
- **File:** `frontend/src/pages/CreatePostPage.tsx`
- **Issue:** Touch events belum diimplementasi untuk mobile

**TODO:**

- [ ] Tambah touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`)
- [ ] Buat fungsi `getTouchCoords()` untuk konversi touch coordinates
- [ ] Implementasi touch drag untuk foto
- [ ] Implementasi touch drag untuk text items
- [ ] Implementasi touch drawing untuk brush
- [ ] Test di mobile device atau Chrome DevTools

---

### Bug #2: Tombol Theme Toggle Tidak Ada di Mobile

- **Severity:** 🟡 MEDIUM
- **File:** `frontend/src/components/layout/Navbar.tsx`
- **Issue:** ThemeToggle hanya ada di LoginPage

**TODO:**

- [ ] Cari file Navbar/Header component
- [ ] Import ThemeToggle component
- [ ] Tambahkan ThemeToggle di Navbar (Desktop)
- [ ] Tambahkan ThemeToggle di Mobile Menu atau floating button
- [ ] Styling untuk mobile (min 44x44px touch target)
- [ ] Test di berbagai screen size (mobile, tablet, desktop)

---

### Bug #3: Optimalkan Tampilan Editor Post untuk Mobile

- **Severity:** � HIGH
- **File:** `frontend/src/pages/CreatePostPage.tsx`, `frontend/src/pages/create/EditorToolPanel.tsx`
- **Issue:** Layout editor di mobile kurang optimal, panel tool terlalu besar

**TODO:**

- [ ] Ubah layout editor menjadi vertical di mobile
- [ ] Perbesar canvas di mobile (`min-h-[60vh]`, `max-h-[65vh]`)
- [ ] Buat tool panel collapsible di mobile (state `isPanelOpen`)
- [ ] Ubah tool tabs menjadi horizontal scroll di mobile
- [ ] Perkecil ukuran controls di mobile (slider, font, padding)
- [ ] Test di mobile device (semua tools accessible)

---

### Bug #4: Endpoint Root (/) Tidak Menampilkan Daftar Endpoints

- **Severity:** 🟡 MEDIUM
- **File:** `backend/src/index.ts`
- **Issue:** Endpoint `/` tidak ada, seharusnya menampilkan API documentation

**TODO:**

- [ ] Buat endpoint GET `/` di index.ts
- [ ] Buat list semua endpoints dengan deskripsi (grouping by module)
- [ ] Tambahkan informasi API version dan status
- [ ] Format response sebagai JSON yang readable
- [ ] (Optional) Buat HTML view untuk browser
- [ ] Test endpoint (`curl` dan browser)

---

### Bug #5: Endpoint /health Tidak Require API Key

- **Severity:** 🔴 CRITICAL
- **File:** `backend/src/index.ts`, `backend/src/middleware/api-key.middleware.ts`
- **Issue:** Endpoint `/health` bisa diakses tanpa API key

**TODO:**

- [ ] Buat middleware untuk API key validation (`api-key.middleware.ts`)
- [ ] Check header `x-api-key` atau query param `key`
- [ ] Apply middleware ke endpoint `/health`
- [ ] Ganti API_SECRET_KEY yang lemah (generate: `openssl rand -base64 32`)
- [ ] Tambahkan logging untuk API key usage dan failed attempts
- [ ] Test endpoints (tanpa key, key salah, key benar)

---

## 📊 Summary

**Security Bugs:** 8/8 completed ✅ (100%)  
**Functional Bugs:** 0/5 completed (0%)

| Bug # | Severity    | Priority | Status  |
| ----- | ----------- | -------- | ------- |
| #5    | 🔴 CRITICAL | 1        | ⏳ TODO |
| #3    | 🟠 HIGH     | 2        | ⏳ TODO |
| #1    | 🟡 MEDIUM   | 3        | ⏳ TODO |
| #2    | 🟡 MEDIUM   | 4        | ⏳ TODO |
| #4    | 🟡 MEDIUM   | 5        | ⏳ TODO |

**Recommended Order:** #5 → #3 → #1 → #2 → #4

---

**Note:** Hint code dan detail implementasi tersedia di commit history atau tanya AI assistant.
