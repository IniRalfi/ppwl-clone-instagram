# 🐛 Bug Report — PPWL Instagram Clone

> Hasil analisis menyeluruh seluruh file project. Diurutkan dari **tingkat keparahan tertinggi** (🔴 Critical → 🟡 Medium → 🟢 Low).

---

## 🔴 CRITICAL — Keamanan & Data

### BUG-01 · Password Disimpan Plain Text (Done)

**File:** `backend/src/modules/auth/auth.routes.ts` — Baris 14 & 36

```ts
// Baris 14 — saat register:
passwordHash: password, // ← TIDAK di-hash sama sekali!

// Baris 36 — saat login:
if (!user || user.passwordHash !== password) // ← Perbandingan langsung string!
```

**Masalah:** Password user tersimpan sebagai plain text di database. Jika database bocor, semua password langsung terbaca. Ini **vulnerability paling serius** di seluruh project.

**Solusi:** Gunakan `bcrypt` atau `argon2`:

```ts
import { hash, verify } from "@node-rs/argon2"; // tersedia di Bun
passwordHash: await hash(password)
// saat login:
if (!user || !(await verify(user.passwordHash, password)))
```

---

### BUG-02 · Tidak Ada Autentikasi di Endpoint Sensitif (Done)

**File:** `backend/src/modules/like/like.routes.ts`, `post.routes.ts`, `comment.routes.ts`, `follow.routes.ts`

**Masalah:** Semua endpoint menerima `userId` dari **body/query request** tanpa verifikasi JWT. Siapapun bisa mengirim request dengan `userId` orang lain untuk:

- Like/unlike post atas nama orang lain
- Hapus postingan milik orang lain (cukup tebak `userId`)
- Follow/unfollow atas nama siapapun

**Solusi:** Implementasi JWT middleware. `accessToken` di auth routes sudah ada placeholder-nya (`"dummy_jwt_token_..."`) tapi belum pernah diimplementasi.

---

### BUG-03 · Token JWT Dummy Tidak Pernah Divalidasi (Done)

**File:** `backend/src/modules/auth/auth.routes.ts` — Baris 51 & 109

```ts
accessToken: "dummy_jwt_token_nanti_diganti_dengan_elysia_jwt", // ← Hardcoded!
```

**Masalah:** Token yang dikirim ke frontend adalah string literal `"dummy_jwt_token_..."`. Frontend menyimpannya di localStorage dan mengirimnya ke setiap request via `Authorization: Bearer`, tapi backend tidak pernah memvalidasinya. Artinya auth header ini **tidak berguna sama sekali**.

---

## 🟠 HIGH — Bug Fungsional

### BUG-04 · N+1 Query Problem yang Sangat Parah di HomePage (Done)

**File:** `frontend/src/pages/HomePage.tsx` — Baris 44–51

```ts
// Untuk setiap post, kirim 1 request ke API /likes/:id/status
const statusRequests = (json.data as Post[]).map((post) =>
  apiClient.get(`/likes/${post.id}/status?userId=${user.id}`)
);
const statuses = await Promise.all(statusRequests);
```

**Masalah:** Jika ada 10 postingan, maka ada **11 HTTP request** (1 GET /posts + 10 GET /likes). Jika ada 50 postingan = 51 request. Ini yang menyebabkan banyaknya query `SELECT FROM Like` yang terlihat di log terminal!

**Solusi:** Tambahkan endpoint `GET /likes/batch?userId=xxx&postIds=a,b,c` atau sertakan `isLikedByMe` langsung dari endpoint `GET /posts` saat user sudah login.

---

### BUG-05 · ProfilePage Fetch Semua Post Lalu Filter di Frontend (Done)

**File:** `frontend/src/pages/ProfilePage.tsx` — Baris 38–46

```ts
fetch(`${import.meta.env.VITE_API_URL}/posts`) // Ambil SEMUA post
  .then((res) => res.json())
  .then((json) => {
    const filtered = json.data.filter(
      (post: Post) => post.authorId === user.id // Filter di frontend
    );
  });
```

**Masalah:** Mengunduh **semua postingan** dari seluruh user hanya untuk menampilkan postingan milik satu user. Semakin banyak user & post, semakin lambat. Seharusnya ada endpoint `GET /posts?authorId=xxx` atau `GET /users/:id/posts`.

---

### BUG-06 · `postsCount` di `PostCard` Selalu Hardcoded "0" (Done)

**File:** `frontend/src/pages/HomePage.tsx` — Baris 109–111

```tsx
postsCount = "0"; // ← Hardcoded!
followers = "0"; // ← Hardcoded!
following = "0"; // ← Hardcoded!
bio = "User"; // ← Hardcoded!
```

**Masalah:** Hover card di setiap PostCard menampilkan stats yang salah (postsCount, bio selalu default) saat data dari API belum selesai dimuat. Meski ada `handleHoverEnter` yang akan fetch ulang, nilai awal yang salah ini bisa terlihat sesaat.

---

### BUG-07 · `postCount` di Schema Tidak Pernah Di-update (Done)

**File:** `backend/prisma/schema.prisma` — Baris 21–22

```prisma
postCount    Int     @default(0)
commentCount Int     @default(0)
```

**Masalah:** Field `postCount` dan `commentCount` ada di model `User`, tapi tidak pernah di-increment/decrement di manapun dalam kode (tidak ada `db.user.update` saat post/komentar dibuat atau dihapus). Data ini selalu `0` dan tidak akurat.

---

### BUG-08 · Error Handling Follow Salah di `PostCard` (Done)

**File:** `frontend/src/components/post/PostCard.tsx` — Baris 171–173

```ts
} catch {
  setIsHoverFollowed(true); // ← Set ke true saat ERROR?!
}
```

**Masalah:** Saat request follow **gagal** (misalnya network error), tombol Follow langsung berubah menjadi "Following" seolah-olah berhasil. User tidak tahu bahwa follow-nya gagal.

**Solusi:**

```ts
} catch {
  toast.error("Gagal follow. Coba lagi.");
  // Jangan set isHoverFollowed ke true!
}
```

---

### BUG-09 · `GET /likes/:postId/status` Tidak Ada Try-Catch (Done)

**File:** `backend/src/modules/like/like.routes.ts` — Baris 59–77

```ts
.get("/:postId/status", async ({ params: { postId }, query, set }) => {
  // Tidak ada try-catch!
  const existingLike = await db.like.findUnique(...);
  const likeCount = await db.like.count(...);
  return { liked: !!existingLike, likeCount };
});
```

**Masalah:** Jika database error, server akan crash dengan unhandled exception. Tidak ada error handling sama sekali di GET endpoint ini.

---

### BUG-10 · Notifikasi Komentar Selalu Muncul Meski Konten Pendek (Done)

**File:** `backend/src/modules/comment/comment.routes.ts` — Baris 53

```ts
message: `...mengomentari postinganmu: "${content.substring(0, 20)}..."`,
//                                                                  ^^^
// Selalu ada "..." meski konten < 20 karakter
```

**Masalah:** Jika komentar hanya "Keren!", notifikasi akan berbunyi: `"mengomentari postinganmu: "Keren!"..."` — ada `...` yang tidak perlu di akhir.

**Solusi:**

```ts
message: `...mengomentari: "${content.length > 20 ? content.substring(0, 20) + '...' : content}"`,
```

---

## 🟡 MEDIUM — UX & Konsistensi

### BUG-11 · Pencampuran `fetch()` Langsung and `apiClient` di Frontend (Done)

**File:** `HomePage.tsx` (baris 37), `ProfilePage.tsx` (baris 38), `PostDetailPage.tsx` (baris 31, 67, 80)

```ts
// Cara 1 — pakai fetch langsung (tidak melewati apiClient, tidak ada token)
const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);

// Cara 2 — pakai apiClient (ada token, ada error handling)
const res = await apiClient.get("/posts");
```

**Masalah:** Inkonsisten. Request yang pakai `fetch` langsung tidak mengirimkan `Authorization` header, berbeda dengan `apiClient`. Ketika nanti auth diimplementasi dengan benar, semua `fetch` langsung ini akan gagal.

---

### BUG-12 · `GET /notifications` Tidak Filter Berdasarkan User (Done)

**File:** `backend/src/modules/notification/notification.routes.ts` — Baris 7

```ts
const notifications = await db.notification.findMany({ ... });
// Mengambil SEMUA notifikasi dari semua user!
```

**Masalah:** Endpoint notifikasi tidak menerima `userId` dan mengembalikan notifikasi milik semua user sekaligus. Setiap user seharusnya hanya melihat notifikasinya sendiri.

---

### BUG-13 · `GET /users` Mengembalikan Email Semua User (Done)

**File:** `backend/src/modules/user/user.routes.ts` — Baris 10

```ts
const users = await db.user.findMany({
  select: {
    id: true,
    email: true, // ← Email publik!
    ...
  }
});
```

**Masalah:** Endpoint publik ini mengembalikan **email** semua user yang terdaftar — ini informasi privat yang tidak perlu dibagikan ke semua orang.

---

### BUG-14 · Memory Leak — Object URL Tidak Selalu Di-revoke (Done)

**File:** `frontend/src/pages/CreatePostPage.tsx` — Baris 40

```ts
setImagePreview(URL.createObjectURL(file)); // Buat Object URL
// handleRemoveImage() sudah revoke...
```

**Masalah:** `URL.revokeObjectURL` hanya dipanggil di `handleRemoveImage`. Jika user langsung submit tanpa hapus dulu, atau navigasi ke halaman lain, Object URL tidak pernah di-revoke → memory leak.

**Solusi:** Tambahkan `useEffect` cleanup:

```ts
useEffect(() => {
  return () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  };
}, [imagePreview]);
```

---

### BUG-15 · `RegisterPage` Kosong / Belum Diimplementasi (Done)

**File:** `frontend/src/pages/RegisterPage.tsx`

**Masalah:** File ini berukuran hanya 216 bytes — hampir pasti placeholder kosong. Ada route `/register` di `App.tsx` tapi halaman registrasinya tidak ada UI-nya.

---

### BUG-16 · `comment.routes.ts` Tidak Validasi Input (Done)

**File:** `backend/src/modules/comment/comment.routes.ts` — Baris 26

```ts
const { postId, content, parentId, authorId } = body;
// Tidak ada validasi: bagaimana jika content kosong? authorId tidak ada?
```

**Masalah:** Tidak ada validasi bahwa `postId`, `content`, dan `authorId` terisi. Bisa menyebabkan database error dengan pesan yang tidak jelas, atau komentar dengan konten kosong tersimpan.

---

### BUG-17 · `PostDetailPage` Menggunakan `any` sebagai Tipe Data (Done)

**File:** `frontend/src/pages/PostDetailPage.tsx` — Baris 11–12

```ts
const [comments, setComments] = useState<any[]>([]);
const [post, setPost] = useState<any>(null);
```

**Masalah:** Menggunakan `any` menghilangkan semua benefit TypeScript. Jika struktur response API berubah, TypeScript tidak akan memberikan warning. Tipe sudah tersedia di `shared/src/types/comment` (bahkan sudah di-import di baris 2!).

---

## 🟢 LOW — Kode Bersih & Konsistensi

### BUG-18 · `SuggestedUsers` — Error pada Follow Diabaikan Sepenuhnya (Done)

**File:** `frontend/src/components/common/SuggestedUsers.tsx` — Baris 41–43

```ts
} catch {
  // sudah di-follow atau error — tetap tampilkan checkmark
  setFollowedIds((prev) => new Set(prev).add(targetId));
}
```

**Masalah:** Sama seperti BUG-08, error diabaikan dan status diupdate seolah sukses. Tidak ada feedback ke user jika follow gagal karena alasan lain (network error, server down).

---

### BUG-19 · Tag Click di PostCard Masih Menggunakan `alert()` (Done)

**File:** `frontend/src/components/post/PostCard.tsx` — Baris 286

```ts
onClick={(e) => { e.stopPropagation(); alert(`Menuju profil ${tag.username}`); }}
```

**Masalah:** Menggunakan `alert()` bawaan browser — sangat tidak sesuai untuk UI Instagram clone yang premium.

---

### BUG-20 · `postsCount` Prop di `PostCard` Bertipe `string` Seharusnya `number` (Done)

**File:** `frontend/src/components/post/PostCard.tsx` — Baris 28

```ts
postsCount: string; // ← Tipe string, padahal berisi angka
```

Dan digunakan dengan:

```ts
postsCount: parseInt(postsCount) || 0; // ← Harus di-parse dulu
```

**Masalah:** Design prop yang tidak konsisten. Seharusnya bertipe `number` dari awal.

---

## 📊 Ringkasan

| Tingkat     | Jumlah |
| ----------- | ------ |
| 🔴 Critical | 3      |
| 🟠 High     | 7      |
| 🟡 Medium   | 6      |
| 🟢 Low      | 4      |
| **Total**   | **20** |

## 🎯 Rekomendasi Prioritas Fix

1. **BUG-01** — Hash password (keamanan utama)
2. **BUG-04** — N+1 query (performa, ini yang bikin log banjir)
3. **BUG-08 & BUG-18** — Error handling follow yang salah
4. **BUG-05** — Fetch semua post untuk filter profil
5. **BUG-12** — Filter notifikasi per user
