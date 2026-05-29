# 🛡️ Rate Limiting Implementation Guide

**Date:** 29 Mei 2026  
**Status:** ✅ Implemented

---

## 📋 Overview

Rate limiting telah diimplementasikan untuk mencegah abuse dan protect API dari:

- 🔐 Brute force attacks pada login
- 📧 Spam registrations
- 📝 Spam posts/comments
- 💥 DDoS attacks

---

## 🎯 Rate Limits yang Diterapkan

### 1. **Auth Endpoints** (STRICT)

- **Limit:** 5 requests per menit
- **Endpoints:** `/auth/register`, `/auth/login`, `/auth/google`
- **Reason:** Prevent brute force & spam registrations

### 2. **Post Creation** (MODERATE)

- **Limit:** 10 posts per jam
- **Endpoints:** `POST /posts`
- **Reason:** Prevent spam posts

### 3. **Comment Creation** (MODERATE)

- **Limit:** 20 comments per jam
- **Endpoints:** `POST /comments`
- **Reason:** Prevent spam comments

### 4. **Like/Unlike** (LENIENT)

- **Limit:** 100 likes per jam
- **Endpoints:** `POST /likes/:postId`
- **Reason:** Allow normal usage but prevent bot abuse

### 5. **Read Operations** (LENIENT)

- **Limit:** 100 requests per menit
- **Endpoints:** `GET /posts`, `GET /users`, etc.
- **Reason:** Allow browsing but prevent scraping

### 6. **Upload Operations** (STRICT)

- **Limit:** 5 uploads per jam
- **Endpoints:** File upload endpoints
- **Reason:** Prevent storage abuse

---

## 🔧 How It Works

### **Tracking Method:**

- **By IP Address** - Tracks requests per IP
- **In-Memory Store** - Fast & efficient
- **Auto Cleanup** - Old entries dihapus setiap 5 menit

### **Response Headers:**

Setiap response include rate limit info:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1780012345678
Retry-After: 45
```

### **Error Response (429 Too Many Requests):**

```json
{
  "message": "Terlalu banyak request. Coba lagi dalam 45 detik."
}
```

---

## 📊 Monitoring

### **Get Rate Limit Stats:**

```typescript
import { getRateLimitStats } from "@/middleware/rate-limit.middleware";

const stats = getRateLimitStats();
console.log(stats);
```

**Output:**

```json
{
  "totalTrackedIPs": 150,
  "activeIPs": 45,
  "topOffenders": [
    {
      "ip": "192.168.1.100",
      "count": 98,
      "resetAt": "2026-05-29T15:30:00.000Z"
    }
  ]
}
```

---

## 🧪 Testing Rate Limits

### **Test Auth Rate Limit (5 per menit):**

```bash
# Request 1-5: Should work
for i in {1..5}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "\nRequest $i done"
done

# Request 6: Should fail with 429
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
```

**Expected Response (Request 6):**

```json
{
  "message": "Terlalu banyak percobaan login. Coba lagi dalam 1 menit."
}
```

### **Test Comment Rate Limit (20 per jam):**

```bash
# Kirim 21 comments dalam loop
for i in {1..21}; do
  curl -X POST http://localhost:3000/comments \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <token>" \
    -d '{"postId":"xxx","content":"Test comment '$i'"}'
  echo "\nComment $i sent"
done

# Comment ke-21 should fail with 429
```

---

## 🎨 Custom Rate Limits

### **Create Custom Rate Limiter:**

```typescript
import { rateLimit } from "@/middleware/rate-limit.middleware";

// Custom: 3 requests per 30 detik
const customRateLimit = rateLimit(
  3, // maxRequests
  30 * 1000, // windowMs
  "Custom error message" // optional
);

// Apply to route
export const myRoutes = new Elysia().use(customRateLimit).post("/my-endpoint", async () => {
  // ...
});
```

---

## 🔄 Adjusting Rate Limits

### **Untuk Production:**

Edit file: `backend/src/middleware/rate-limit.middleware.ts`

```typescript
// Contoh: Ubah auth rate limit jadi lebih strict
export const authRateLimit = rateLimit(
  3, // 3 requests (dari 5)
  60 * 1000, // per menit
  "Terlalu banyak percobaan login. Coba lagi dalam 1 menit."
);
```

### **Untuk Development:**

Bisa disable rate limiting dengan environment variable:

```bash
# .env
DISABLE_RATE_LIMIT=true
```

Lalu di middleware:

```typescript
export const rateLimit = (maxRequests, windowMs, message) => {
  if (process.env.DISABLE_RATE_LIMIT === "true") {
    return new Elysia(); // No-op
  }
  // ... rest of implementation
};
```

---

## 🚨 Important Notes

### **Limitations:**

1. **In-Memory Store** - Data hilang saat server restart
2. **Single Server** - Tidak sync antar multiple servers
3. **IP-Based** - Bisa di-bypass dengan VPN/proxy

### **For Production at Scale:**

Consider using:

- **Redis** - Untuk distributed rate limiting
- **Cloudflare** - Rate limiting di edge
- **AWS WAF** - Web Application Firewall

---

## 📚 References

- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**Implemented by:** Kiro AI  
**Date:** 29 Mei 2026
