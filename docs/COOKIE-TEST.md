# 🧪 Cookie Authentication Testing Guide

## 📋 Checklist Testing

### **1. Local Development Test (localhost)**

#### Test Login:

```bash
# Terminal 1: Start backend
cd backend
bun run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

#### Manual Test:

1. ✅ Buka `http://localhost:5173`
2. ✅ Login dengan email/password
3. ✅ Buka DevTools → Application → Cookies → `http://localhost:3000`
4. ✅ Cek ada cookie `auth` dengan properties:
   - `HttpOnly`: ✅ true
   - `Secure`: ❌ false (karena HTTP di localhost)
   - `SameSite`: `Lax`
   - `Path`: `/`
   - `Max-Age`: `604800` (7 hari)

5. ✅ Refresh halaman → Masih login (cookie masih ada)
6. ✅ Buka DevTools → Console → Ketik `document.cookie`
   - **Expected:** Cookie `auth` **TIDAK MUNCUL** (karena HttpOnly)
7. ✅ Klik tombol Logout → Cookie hilang

---

### **2. Production Test (deployed)**

#### Test Login:

1. ✅ Buka `https://www.ppwl-a3.my.id`
2. ✅ Login dengan email/password
3. ✅ Buka DevTools → Application → Cookies → `https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws`
4. ✅ Cek ada cookie `auth` dengan properties:
   - `HttpOnly`: ✅ true
   - `Secure`: ✅ true (karena HTTPS)
   - `SameSite`: `None` (✅ PENTING untuk cross-origin!)
   - `Path`: `/`
   - `Max-Age`: `604800` (7 hari)

5. ✅ Refresh halaman → Masih login
6. ✅ Buka tab baru → Buka `https://www.ppwl-a3.my.id` → Masih login
7. ✅ Tutup browser → Buka lagi → Masih login (dalam 7 hari)
8. ✅ Klik Logout → Cookie hilang

---

### **3. Security Test (XSS Protection)**

#### Test XSS Attack Simulation:

1. ✅ Login ke aplikasi
2. ✅ Buka DevTools → Console
3. ✅ Coba akses cookie dengan JavaScript:

   ```javascript
   console.log(document.cookie);
   // Expected: Cookie 'auth' TIDAK MUNCUL (karena HttpOnly)
   ```

4. ✅ Coba inject script di comment/post:
   ```html
   <script>
     alert(document.cookie);
   </script>
   ```

   - **Expected:** Script di-sanitize, tidak dieksekusi
   - **Expected:** Cookie tetap tidak bisa diakses

---

### **4. CORS Test (Cross-Origin)**

#### Test dari domain lain:

1. ✅ Buka `https://www.ppwl-a3.my.id`
2. ✅ Login
3. ✅ Buka DevTools → Network tab
4. ✅ Lihat request ke backend (e.g., GET /posts)
5. ✅ Cek Request Headers:
   - `Cookie: auth=<token>` ✅ (cookie dikirim otomatis)
6. ✅ Cek Response Headers:
   - `Access-Control-Allow-Origin: https://www.ppwl-a3.my.id` ✅
   - `Access-Control-Allow-Credentials: true` ✅

---

### **5. Logout Test**

#### Test logout functionality:

1. ✅ Login
2. ✅ Klik tombol Logout
3. ✅ Cek DevTools → Application → Cookies
   - **Expected:** Cookie `auth` **HILANG**
4. ✅ Coba akses halaman yang butuh auth (e.g., /profile)
   - **Expected:** Redirect ke /login

---

## 🚨 **Red Flags (Harus Diperbaiki Jika Terjadi)**

### ❌ Cookie tidak dikirim di production:

- **Symptom:** Login berhasil, tapi langsung logout lagi
- **Cause:** `sameSite` masih `"lax"` (harusnya `"none"`)
- **Fix:** Sudah diperbaiki di commit ini

### ❌ Cookie bisa diakses JavaScript:

- **Symptom:** `document.cookie` menampilkan token
- **Cause:** `httpOnly: false`
- **Fix:** Pastikan `httpOnly: true`

### ❌ Cookie tidak ada di DevTools:

- **Symptom:** Setelah login, cookie tidak muncul
- **Cause:** Backend tidak set cookie dengan benar
- **Fix:** Cek response headers `Set-Cookie`

### ❌ CORS error di production:

- **Symptom:** Request blocked by CORS policy
- **Cause:** `credentials: true` tidak di-set di CORS config
- **Fix:** Sudah ada di `backend/src/index.ts`

---

## 📊 **Expected Results Summary**

| Test Case            | Local (Dev)  | Production   | Status |
| -------------------- | ------------ | ------------ | ------ |
| Cookie HttpOnly      | ✅ true      | ✅ true      | ✅     |
| Cookie Secure        | ❌ false     | ✅ true      | ✅     |
| Cookie SameSite      | Lax          | None         | ✅     |
| XSS Protection       | ✅ Protected | ✅ Protected | ✅     |
| CORS Working         | ✅ Yes       | ✅ Yes       | ✅     |
| Logout Clears Cookie | ✅ Yes       | ✅ Yes       | ✅     |

---

## 🔧 **Troubleshooting**

### Problem: "Cookie tidak dikirim di production"

**Solution:**

```typescript
// Pastikan di auth.routes.ts:
sameSite: env.NODE_ENV === "production" ? "none" : "lax";
secure: env.NODE_ENV === "production";

// Pastikan di api.client.ts:
credentials: "include";
```

### Problem: "CORS error"

**Solution:**

```typescript
// Pastikan di index.ts:
cors({
  origin: [env.FRONTEND_URL, ...],
  credentials: true  // ✅ PENTING!
})
```

---

## ✅ **Final Checklist Before Deploy**

- [ ] Cookie config: `sameSite: "none"` di production
- [ ] Cookie config: `secure: true` di production
- [ ] Cookie config: `httpOnly: true` (always)
- [ ] API client: `credentials: "include"`
- [ ] CORS: `credentials: true`
- [ ] CORS: Frontend URL di whitelist
- [ ] Test login di localhost
- [ ] Test login di production
- [ ] Test XSS protection
- [ ] Test logout

---

**Last Updated:** 29 Mei 2026  
**Status:** ✅ Ready for testing
