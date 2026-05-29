# 📋 API Access untuk Grading

**Tanggal:** 29 Mei 2026  
**Mahasiswa:** Rafli Pratama  
**Mata Kuliah:** PPWL

---

## 🌐 Backend API Endpoints

**Base URL:** `https://api.ppwl-a3.my.id`

---

## 🔑 API Key

**API Key:** `[AKAN DIKIRIM VIA EMAIL/WA]`

⚠️ **PENTING:** API key ini bersifat rahasia dan hanya untuk keperluan grading.

---

## 📊 Endpoints untuk Verifikasi Data

### 1. Get All Users

**Endpoint:** `GET /data/users`

**Cara Akses:**

```bash
# Via curl
curl "https://api.ppwl-a3.my.id/data/users?key=<API_KEY>"

# Via browser
https://api.ppwl-a3.my.id/data/users?key=<API_KEY>
```

**Response:**

```json
{
  "data": [
    {
      "id": "cmpcko7by0000ijh8qztextu1",
      "username": "rafli_pratama",
      "email": "rflipratm@gmail.com",
      "name": "Rafli Pratama",
      "bio": "Software Engineer",
      "avatarUrl": "https://i.pravatar.cc/150?u=rafli",
      "role": "ADMIN",
      "postCount": 0,
      "commentCount": 0,
      "createdAt": "2026-05-19T11:51:24.190Z",
      "updatedAt": "2026-05-28T11:30:56.839Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

**Catatan Keamanan:**

- ✅ Field sensitif seperti `passwordHash` dan `providerId` sudah di-exclude
- ✅ Hanya menampilkan data yang aman untuk inspeksi

---

### 2. Get All Posts

**Endpoint:** `GET /data/posts`

**Cara Akses:**

```bash
curl "https://api.ppwl-a3.my.id/data/posts?key=<API_KEY>"
```

---

### 3. Get All Comments

**Endpoint:** `GET /data/comments`

**Cara Akses:**

```bash
curl "https://api.ppwl-a3.my.id/data/comments?key=<API_KEY>"
```

---

### 4. Get All Notifications

**Endpoint:** `GET /data/notifications`

**Cara Akses:**

```bash
curl "https://api.ppwl-a3.my.id/data/notifications?key=<API_KEY>"
```

---

### 5. Get All Likes

**Endpoint:** `GET /data/likes`

**Cara Akses:**

```bash
curl "https://api.ppwl-a3.my.id/data/likes?key=<API_KEY>"
```

---

## 🔒 Security Features

### 1. API Key Protection

- ✅ Endpoint `/data/*` dilindungi dengan API key
- ✅ API key di-generate dengan secure random (32 bytes)
- ✅ Tanpa API key yang valid, akses akan ditolak (403 Forbidden)

### 2. Sensitive Data Exclusion

- ✅ Password hash **TIDAK** di-expose di response
- ✅ Provider ID (Google OAuth) **TIDAK** di-expose
- ✅ Hanya data yang aman untuk inspeksi yang ditampilkan

### 3. Rate Limiting

- ✅ Backup endpoint dibatasi 1 request per 10 menit
- ✅ Mencegah spam dan abuse

### 4. Audit Logging

- ✅ Setiap akses ke admin endpoint di-log
- ✅ IP address dan timestamp dicatat
- ✅ Failed attempts di-log dengan warning

---

## 🧪 Testing Registrasi & Login

### Test Registrasi

1. Buka: `https://www.ppwl-a3.my.id/register`
2. Isi form registrasi dengan data baru
3. Submit form
4. Verifikasi data tersimpan: `GET /data/users?key=<API_KEY>`
5. Cek apakah user baru muncul di response

### Test Login

1. Buka: `https://www.ppwl-a3.my.id/login`
2. Login dengan credentials yang sudah diregister
3. Verifikasi berhasil masuk ke homepage
4. Cek session token tersimpan (inspect browser localStorage)

---

## 📞 Kontak

Jika ada pertanyaan atau kendala dalam mengakses API:

**Email:** rflipratm@gmail.com  
**WhatsApp:** [Nomor HP]

---

## 📚 Dokumentasi Lengkap

- **Frontend:** https://www.ppwl-a3.my.id
- **API Swagger (Development):** http://localhost:3000/swagger
- **GitHub Repository:** [Link jika public]

---

**Terima kasih!** 🙏
