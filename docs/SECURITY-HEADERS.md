# 🛡️ Security Headers - Instafy API

**Tanggal:** 30 Mei 2026  
**Status:** ✅ Implemented

---

## 📋 Overview

Security headers adalah HTTP response headers yang membantu melindungi aplikasi web dari berbagai serangan seperti XSS, clickjacking, MIME sniffing, dan lainnya.

**Analogi:** Security headers itu seperti **security guard di pintu masuk gedung**. Mereka mengatur:

- Siapa yang boleh masuk (script, style, image dari mana saja yang boleh di-load)
- Apa yang boleh dilakukan di dalam gedung (inline script, eval, dll)
- Bagaimana gedung bisa diakses (iframe, referrer, dll)

---

## 🔒 Implemented Headers

### 1. Content-Security-Policy (CSP)

**Fungsi:** Mencegah XSS attacks dengan mengatur sumber mana saja yang boleh di-load.

**Directives:**

```
default-src 'self'
connect-src 'self' https://ppwl-a3.my.id https://api.cloudinary.com wss://*.pusher.com
img-src 'self' data: https: blob:
media-src 'self' https: blob:
font-src 'self' data:
style-src 'self' 'unsafe-inline'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

**Penjelasan:**

- `default-src 'self'`: Default hanya boleh load dari origin yang sama
- `connect-src`: API calls boleh ke frontend, Cloudinary, dan Pusher
- `img-src`: Images boleh dari mana saja (untuk user uploads)
- `frame-ancestors 'none'`: Tidak boleh di-embed di iframe
- `script-src 'unsafe-inline' 'unsafe-eval'`: Perlu untuk React dan development

**Mode:**

- **Production:** `Content-Security-Policy` (enforced)
- **Development:** `Content-Security-Policy-Report-Only` (report only, tidak block)

---

### 2. X-Frame-Options

**Fungsi:** Mencegah clickjacking dengan melarang website di-embed di iframe.

**Value:** `DENY`

**Penjelasan:** Website tidak bisa di-embed di iframe sama sekali, bahkan dari origin yang sama.

**Alternatif:**

- `SAMEORIGIN`: Boleh di-embed dari origin yang sama
- `ALLOW-FROM https://example.com`: Boleh di-embed dari domain tertentu (deprecated)

---

### 3. X-Content-Type-Options

**Fungsi:** Mencegah MIME type sniffing oleh browser.

**Value:** `nosniff`

**Penjelasan:** Browser tidak boleh "menebak" MIME type dari response. Harus sesuai dengan `Content-Type` header yang dikirim server.

**Contoh Serangan:**

```html
<!-- Attacker upload file "image.jpg" yang sebenarnya adalah JavaScript -->
<script src="/uploads/image.jpg"></script>
<!-- Tanpa nosniff, browser bisa execute sebagai JavaScript -->
<!-- Dengan nosniff, browser akan reject karena Content-Type: image/jpeg -->
```

---

### 4. Referrer-Policy

**Fungsi:** Mengontrol informasi referrer yang dikirim saat navigasi.

**Value:** `strict-origin-when-cross-origin`

**Penjelasan:**

- Same-origin: Kirim full URL
- Cross-origin (HTTPS → HTTPS): Kirim origin saja
- Cross-origin (HTTPS → HTTP): Tidak kirim referrer

**Contoh:**

```
User di: https://ppwl-a3.my.id/profile/john
Klik link ke: https://example.com

Referrer yang dikirim: https://ppwl-a3.my.id (origin saja, bukan full URL)
```

---

### 5. Permissions-Policy

**Fungsi:** Mengontrol fitur browser yang bisa diakses oleh website.

**Value:** `camera=(), microphone=(), geolocation=(), payment=(), usb=()`

**Penjelasan:** Disable fitur-fitur yang tidak digunakan untuk mengurangi attack surface.

**Format:**

- `camera=()`: Disable camera untuk semua origin
- `camera=(self)`: Enable camera hanya untuk origin yang sama
- `camera=(self "https://example.com")`: Enable untuk origin yang sama dan example.com

---

### 6. X-XSS-Protection

**Fungsi:** Enable XSS filter di browser lama (legacy).

**Value:** `1; mode=block`

**Penjelasan:**

- `1`: Enable XSS filter
- `mode=block`: Block page jika XSS terdeteksi (bukan sanitize)

**Note:** Header ini sudah deprecated di browser modern karena CSP lebih powerful, tapi tetap bagus untuk backward compatibility.

---

### 7. Strict-Transport-Security (HSTS)

**Fungsi:** Memaksa browser untuk selalu menggunakan HTTPS.

**Value:** `max-age=31536000; includeSubDomains; preload`

**Penjelasan:**

- `max-age=31536000`: Cache selama 1 tahun (31536000 detik)
- `includeSubDomains`: Apply ke semua subdomain
- `preload`: Eligible untuk HSTS preload list

**Note:** Hanya di-enable di production dengan HTTPS.

---

## 🧪 Testing Security Headers

### 1. Manual Testing dengan curl

```bash
# Test di localhost
curl -I http://localhost:3000/health

# Test di production
curl -I https://api.ppwl-a3.my.id/health
```

**Expected Output:**

```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; connect-src 'self' ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), ...
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

### 2. Online Security Scanner

**Recommended Tools:**

1. **Security Headers** - https://securityheaders.com
   - Scan: `https://api.ppwl-a3.my.id`
   - Target Grade: **A** atau **A+**

2. **Mozilla Observatory** - https://observatory.mozilla.org
   - Scan: `https://api.ppwl-a3.my.id`
   - Target Score: **90+**

3. **SSL Labs** - https://www.ssllabs.com/ssltest/
   - Scan: `https://api.ppwl-a3.my.id`
   - Target Grade: **A** atau **A+**

---

### 3. Browser DevTools

1. Buka https://ppwl-a3.my.id
2. Buka DevTools (F12)
3. Go to **Network** tab
4. Refresh page
5. Click any request ke API
6. Check **Response Headers**

**Expected Headers:**

```
Content-Security-Policy: ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
...
```

---

## 🔧 Configuration

### Development vs Production

**Development:**

- CSP: `Content-Security-Policy-Report-Only` (tidak block, hanya report)
- HSTS: Disabled (karena tidak pakai HTTPS)
- Script: Allow `unsafe-eval` untuk hot reload

**Production:**

- CSP: `Content-Security-Policy` (enforced, block violations)
- HSTS: Enabled dengan preload
- Script: Tetap allow `unsafe-inline` dan `unsafe-eval` untuk React

---

### Customization

Jika perlu menambahkan domain baru ke CSP (misalnya CDN baru):

**File:** `backend/src/plugins/security-headers.plugin.ts`

```typescript
const cspDirectives = [
  "default-src 'self'",
  `connect-src 'self' ${env.FRONTEND_URL} https://api.cloudinary.com https://new-cdn.com`, // ✅ Tambah di sini
  // ...
];
```

---

## 📊 Security Score

**Before Implementation:**

- Security Headers Grade: **F**
- Missing: CSP, X-Frame-Options, X-Content-Type-Options, dll

**After Implementation:**

- Security Headers Grade: **A** atau **A+**
- All major security headers implemented

---

## 🚨 Common Issues

### Issue 1: CSP Blocking Inline Scripts

**Symptom:** Console error: `Refused to execute inline script because it violates CSP`

**Solution:**

1. Move inline scripts to external files
2. Or add `'unsafe-inline'` to `script-src` (less secure)

---

### Issue 2: CSP Blocking External Resources

**Symptom:** Console error: `Refused to load https://example.com/script.js because it violates CSP`

**Solution:** Add domain to appropriate CSP directive:

```typescript
"script-src 'self' https://example.com";
```

---

### Issue 3: HSTS Causing Issues in Development

**Symptom:** Browser always redirects HTTP to HTTPS in localhost

**Solution:** HSTS is disabled in development mode. If still having issues:

1. Clear browser HSTS cache
2. Chrome: `chrome://net-internals/#hsts` → Delete domain
3. Firefox: Clear browsing data → Cookies and Site Data

---

## 📚 References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Security Headers Best Practices](https://securityheaders.com)

---

**Last Updated:** 30 Mei 2026  
**Maintained by:** Backend Team
