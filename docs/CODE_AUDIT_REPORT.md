# 🔍 CODE AUDIT REPORT — ppwl-clone-instagram

> **Dibuat:** 2026-05-28
> **Reviewer:** Antigravity AI
> **Cakupan:** Seluruh codebase — Backend (ElysiaJS) & Frontend (React/Vite)
> **Tingkat Kekritisan:** 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low

---

## Ringkasan Eksekutif

Total **24 temuan** ditemukan yang dikategorikan ke dalam 3 area utama:

| Kategori                | Critical | High | Medium | Low | Total |
| ----------------------- | -------- | ---- | ------ | --- | ----- |
| 🐛 Bug & Kerentanan     | 6        | 3    | 2      | 0   | 11    |
| ⚡ Performa & Algoritma | 0        | 3    | 3      | 1   | 7     |
| 🍝 Spaghetti Code       | 0        | 1    | 4      | 1   | 6     |

> ⚠️ Laporan ini diperbarui setelah scan kedua yang mencakup modul monitoring, message, notification, user routes, dan Sidebar.

---

## 🐛 Bagian 1: Bug & Kerentanan Keamanan

---

### [BUG-01] 🔴 Race Condition pada Semua Operasi Toggle (Like, Bookmark, Follow)

**File:** `backend/src/modules/like/like.service.ts`, `post.service.ts`, `follow.service.ts`

**Analogi:** Bayangkan dua kasir di toko yang sama-sama mengecek stok barang, sama-sama melihat ada 1 barang, lalu keduanya menjual ke pelanggan berbeda. Hasil akhirnya: stok jadi -1.

**Masalah:** Semua operasi toggle menggunakan pola **"Check then Act"** yang tidak atomic:

```typescript
// like.service.ts — Pola bermasalah (diulang di 3 file berbeda)
const existingLike = await db.like.findUnique(...); // Step 1: Cek
if (existingLike) {
  await db.like.delete(...);                         // Step 2: Hapus
} else {
  await db.like.create(...);                         // Step 2: Buat
}
```

Jika user mengklik Like dua kali cepat (atau request terduplikasi), kedua request bisa lolos pengecekan di Step 1 sebelum salah satunya menyelesaikan Step 2. Ini bisa menyebabkan:

- **Error duplicate unique constraint** (crash 500)
- **Data inconsistency** (like count salah)

**Solusi yang disarankan:**

```typescript
// Gunakan try/catch dengan penanganan Prisma unique constraint (kode P2002)
try {
  await db.like.create({ data: { userId, postId } });
  liked = true;
} catch (e: any) {
  if (e.code === "P2002") {
    // Unique constraint violation
    await db.like.delete({ where: { userId_postId: { userId, postId } } });
    liked = false;
  } else throw e;
}
```

---

### [BUG-02] 🔴 JWT Token Tidak Pernah Kedaluwarsa (No Expiration)

**File:** `backend/src/plugins/auth.plugin.ts`, `backend/src/modules/auth/auth.routes.ts`

**Analogi:** Memberi tamu sebuah kunci fisik tanpa tanggal expired — kalau kuncinya hilang/dicuri, tamu itu bisa masuk selamanya.

**Masalah:** JWT di-sign tanpa konfigurasi `exp`:

```typescript
// auth.plugin.ts — JWT tanpa expiry
jwt({
  name: "jwt",
  secret: env.JWT_SECRET,
  // ❌ TIDAK ADA: exp / expiresIn
});

// auth.routes.ts — Token di-sign tanpa waktu expired
const accessToken = await jwt.sign({ id: user.id }); // Token abadi!
```

**Dampak:** Jika token bocor (XSS, log server, dll), attacker bisa menggunakannya **selamanya** tanpa bisa di-revoke. Tidak ada mekanisme logout yang benar-benar aman.

**Solusi yang disarankan:**

```typescript
jwt({ name: "jwt", secret: env.JWT_SECRET, exp: "7d" }); // Tambahkan expiry
```

---

### [BUG-03] 🔴 `AdminRoute` Mudah Dibypass — Hardcoded Username sebagai RBAC

**File:** `frontend/src/App.tsx` (baris 21–29)

**Analogi:** Pos keamanan yang hanya mengecek nama di KTP, bukan badge resmi — siapapun yang namanya "admin" bisa masuk.

**Masalah:** Kontrol akses admin dilakukan di **frontend** dengan hardcoded credential:

```typescript
// App.tsx — Sangat berbahaya!
function AdminRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin =
    user?.username === "rafli_pratama" ||     // ❌ Hardcoded username!
    user?.email === "rflipratm@gmail.com" ||  // ❌ Email pribadi di source code!
    user?.username?.includes("admin");         // ❌ Siapapun register "myadmin123" = admin!
  ...
}
```

**Dampak:**

1. Siapapun yang membuat username mengandung kata "admin" otomatis mendapat akses halaman monitoring.
2. Data pribadi (email developer) ter-commit ke repository publik.
3. Frontend-only authorization bisa dibypass dengan memanipulasi Zustand store di browser console.

**Solusi yang disarankan:** Tambahkan field `role` di model User (`USER` | `ADMIN`), validasi di backend, dan sertakan `role` dalam JWT payload.

---

### [BUG-04] 🔴 Kebocoran Data Sensitif di Error Response

**File:** `backend/src/modules/auth/auth.routes.ts` (baris 26–29)

**Masalah:** Error object Prisma (yang berisi detail query, table names, dll) dikembalikan mentah ke client:

```typescript
// auth.routes.ts
} catch (error) {
  set.status = 400;
  return { message: "Gagal register...", error }; // ❌ Raw Prisma error dikirim ke browser!
}
```

**Dampak:** Attacker bisa membaca stack trace, nama tabel database, nama kolom, bahkan query string dari error Prisma. Ini adalah **information disclosure vulnerability**.

**Solusi yang disarankan:**

```typescript
} catch (error) {
  console.error("Register error:", error); // Log di server saja
  set.status = 400;
  return { message: "Email atau username sudah digunakan." }; // Pesan aman untuk client
}
```

---

### [BUG-05] 🟠 `createPost` Mengirim `userId` via FormData — Pattern yang Berbahaya

**File:** `frontend/src/services/post.service.ts` (baris 41) + `backend/src/modules/post/post.routes.ts`

**Masalah:** `userId` di-append ke FormData dari frontend padahal backend sudah punya user dari JWT:

```typescript
// post.service.ts (frontend)
formData.append("userId", payload.userId); // ❌ Tidak perlu, berpotensi disalahgunakan

// post.routes.ts (backend) — userId dari FormData tidak divalidasi terhadap user JWT
const formData = body as Record<string, any>;
// Jika suatu saat kode berubah dan formData.userId dipakai langsung → authorization bypass!
```

**Dampak:** Pola ini membingungkan dan rentan jika implementasi berubah. Data tidak perlu yang dikirim ke server = attack surface tambahan.

---

### [BUG-06] 🟠 Username Google OAuth: Collision-Prone & Tidak Validasi Nama Kosong

**File:** `backend/src/modules/auth/auth.service.ts` (baris 49)

**Masalah:** Username auto-generated tidak dijamin unik:

```typescript
username: data.name.toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 1000);
```

**Dampak:**

- `Math.random() * 1000` hanya menghasilkan 0–999 kemungkinan. Jika ada banyak user Google dengan nama yang mirip → **username collision = registrasi gagal** dengan database error.
- Nama karakter non-Latin seperti "李明" menghasilkan username `""` + angka acak → invalid atau crash.

**Solusi yang disarankan:** Gunakan UUID/nanoid atau loop retry hingga username unik ditemukan.

---

### [BUG-07] 🟡 Double API Call Setelah Submit Komentar

**File:** `frontend/src/pages/PostDetailPage.tsx` (baris 123–136)

**Masalah:** Setelah POST komentar, halaman memanggil GET post lagi hanya untuk update daftar komentar:

```typescript
const json = await apiClient.post("/comments", { ... }); // POST komentar → sudah dapat data komentar baru
// Lalu langsung fetch ulang seluruh post! Tidak efisien.
const resPost = await apiClient.get(`/posts/${id}`);     // ❌ Request ke-2 yang tidak perlu
setComments(resPost.data.comments || []);
```

**Solusi yang disarankan:** Gunakan response dari POST komentar langsung dan append ke state lokal:

```typescript
const newComment = json.data; // Sudah ada dari response POST
setComments((prev) => [...prev, newComment]); // Cukup append, tanpa fetch ulang
```

---

## ⚡ Bagian 2: Performa & Algoritma Tidak Optimal

---

### [PERF-01] 🟠 `getCurrentUser()` Melakukan DB Query Setiap Request

**File:** `backend/src/plugins/auth.plugin.ts`

**Analogi:** Setiap kali seorang karyawan mau bekerja, manajer pergi ke kantor pusat untuk mengecek apakah karyawan itu benar-benar terdaftar — padahal badge-nya sudah diverifikasi di pintu masuk.

**Masalah:** Setiap endpoint yang memanggil `getCurrentUser()` melakukan **1 DB query tambahan** untuk fetch user secara penuh:

```typescript
// auth.plugin.ts — DB hit setiap request!
const user = await db.user.findUnique({ where: { id: payload.id } });
```

Dengan 11 modul yang semuanya menggunakan `getCurrentUser()`, di bawah load ini menjadi bottleneck.

**Solusi yang disarankan:** Cache user data di memory (TTL ~30 detik) menggunakan `localCache` yang sudah ada:

```typescript
const cacheKey = `user:${payload.id}`;
const cached = localCache.get(cacheKey);
if (cached) return cached;

const user = await db.user.findUnique({ where: { id: payload.id } });
localCache.set(cacheKey, user, 30_000);
return user;
```

---

### [PERF-02] 🟠 N+1 Query Pattern di `getSuggestions`

**File:** `backend/src/modules/follow/follow.service.ts` (baris 80–105)

**Masalah:** Dua query terpisah padahal bisa digabung menjadi satu:

```typescript
// Query 1: Ambil daftar yang sudah di-follow
const alreadyFollowing = await db.follow.findMany({ where: { followerId: userId } });
const followingIds = alreadyFollowing.map((f) => f.followingId);

// Query 2: Ambil suggestions (bisa digabung dengan Query 1!)
const suggestions = await db.user.findMany({ where: { id: { notIn: followingIds } } });
```

**Solusi yang disarankan:** Gunakan Prisma relation filter (subquery):

```typescript
const suggestions = await db.user.findMany({
  where: {
    suggestions: true,
    NOT: { id: userId },
    followers: { none: { followerId: userId } }, // ✅ Subquery, 1 query saja
  },
  take: 30,
});
```

---

### [PERF-03] 🟡 Cache Key per-User Membuat Cache Tidak Bisa Dishare

**File:** `backend/src/modules/post/post.routes.ts` (baris 23, 37, 83)

**Masalah:** Cache key menyertakan `currentUserId`:

```
posts:feed:all:limit:10:user:cm123abc  ← Cache user A
posts:feed:all:limit:10:user:cm456def  ← Cache terpisah untuk user B
posts:feed:all:limit:10:user:cm789ghi  ← Cache terpisah untuk user C
```

Dengan TTL hanya 10–15 detik, cache hampir tidak berguna dan memori terisi sangat cepat seiring bertambahnya user. Data `isLikedByMe`/`isBookmarkedByMe` memang perlu per-user, tapi base feed data bisa dishare.

---

### [PERF-04] 🟡 `buildCommentTree` Dijalankan di Setiap Render Tanpa Memoization

**File:** `frontend/src/pages/PostDetailPage.tsx` (baris 313)

**Masalah:**

```tsx
// Fungsi O(n) ini dipanggil ulang setiap kali komponen re-render!
{buildCommentTree(comments).map((comment) => ...)}
```

**Solusi yang disarankan:**

```tsx
const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
// Hanya dihitung ulang ketika `comments` benar-benar berubah
```

---

### [PERF-05] 🟡 Feed Utama Tidak Ada Cursor Pagination

**File:** `backend/src/modules/post/post.service.ts` (baris 23), `post.routes.ts`

**Masalah:** Feed home hanya mengambil data dengan `take: 10` tanpa cursor pagination. Tidak ada cara bagi user untuk melihat postingan lebih lama. Padahal cursor pagination sudah diimplementasikan dengan baik untuk komentar tapi **belum diterapkan pada feed utama**.

---

### [PERF-06] 🟢 `postCount` & `commentCount`: Counter Tanpa Database Transaction

**File:** `backend/src/modules/post/post.service.ts` (baris 207–228), `comment.service.ts` (baris 43–47)

**Masalah:** Dua operasi database dilakukan secara terpisah tanpa transaksi:

```typescript
// post.service.ts — Dua operasi terpisah, bisa tidak konsisten!
await db.user.update({ data: { postCount: { increment: 1 } } }); // Berhasil
await db.post.create({ ... });                                     // Gagal → postCount tetap +1, tapi post tidak ada!
```

**Solusi yang disarankan:**

```typescript
await db.$transaction([
  db.user.update({ data: { postCount: { increment: 1 } } }),
  db.post.create({ data: { ... } }),
]); // Keduanya sukses atau keduanya gagal — atomik
```

---

## 🍝 Bagian 3: Spaghetti Code & Kandidat Refactoring

---

### [REFACTOR-01] 🟠 `CreatePostPage.tsx` Monolitik — 988 Baris dalam 1 File

**File:** `frontend/src/pages/CreatePostPage.tsx`

**Analogi:** Sebuah dapur restoran di mana satu koki bertanggung jawab masak, mencuci piring, belanja bahan, dan menyajikan makanan — semuanya sendiri, di satu ruangan.

**Masalah:** File ini mengandung setidaknya **5 tanggung jawab berbeda** dalam satu komponen:

| Tanggung Jawab                            | Area Baris |
| ----------------------------------------- | ---------- |
| Upload & validasi file                    | ~372–410   |
| Canvas rendering logic                    | ~179–253   |
| Mouse event handling                      | ~264–324   |
| Tab controls (filter, draw, text, layout) | ~608–950   |
| Form submission & caption                 | ~447–471   |

**Dampak:** Hampir mustahil untuk di-test secara unit, sulit di-debug, dan sangat susah dikerjakan tim secara paralel.

**Solusi (Pemecahan yang Disarankan):**

```
CreatePostPage.tsx        ← Orchestrator (state management only, ~100 baris)
  ├── UploadStep.tsx      ← Step 1: Drag & drop file picker
  ├── EditorStep.tsx      ← Step 2: Canvas editor wrapper
  │   ├── CanvasEditor.tsx     ← Canvas rendering + mouse events
  │   ├── PhotoTab.tsx         ← Layout/aspect ratio controls
  │   ├── FilterTab.tsx        ← Filter controls
  │   ├── DrawTab.tsx          ← Brush controls
  │   └── TextTab.tsx          ← Text overlay controls
  └── CaptionStep.tsx    ← Step 3: Caption & submit
```

---

### [REFACTOR-02] 🟡 Duplikasi Definisi Tipe `Post` di 4 File Berbeda

**File-file yang terdampak:**

- `frontend/src/services/post.service.ts` — interface `Post` (shape A)
- `frontend/src/pages/HomePage.tsx` — interface `Post` (shape B, berbeda!)
- `frontend/src/pages/PostDetailPage.tsx` — interface `Post` (shape C, berbeda lagi!)
- `frontend/src/pages/ProfilePage.tsx` — interface `Post` (shape D, berbeda lagi!)

**Masalah:** Setiap file mendefinisikan `Post` sendiri dengan shape yang **berbeda-beda**. Perubahan API response harus diupdate di 4 tempat secara manual.

**Solusi yang disarankan:**

```typescript
// frontend/src/types/post.types.ts — Single source of truth
export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}
export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: PostAuthor;
  _count: { likes: number; comments: number };
}
export interface PostWithFlags extends Post {
  isLikedByMe?: boolean;
  isBookmarkedByMe?: boolean;
}
```

---

### [REFACTOR-03] 🟡 Duplikasi Grid Post Card di `ProfilePage.tsx`

**File:** `frontend/src/pages/ProfilePage.tsx` (baris 603–636 dan 650–684)

**Masalah:** Grid card untuk tab "Postingan" dan tab "Disimpan" adalah **kode yang identik** — hanya nama variabel sumber datanya yang berbeda:

```tsx
{/* Copy-paste! Hanya myPosts vs savedPosts yang beda */}
<div className="grid grid-cols-3 gap-[2px]">
  {myPosts.map((post) => ( ... same JSX ... ))}
</div>

<div className="grid grid-cols-3 gap-[2px]">
  {savedPosts.map((post) => ( ... same JSX ... ))} {/* kode 99% sama */}
</div>
```

**Solusi yang disarankan:** Buat komponen `<PostGrid posts={posts} onDelete={...} />` yang reusable.

---

### [REFACTOR-04] 🟡 Pengecekan Auth Manual Berulang di Setiap Route Handler

**File:** Semua `*.routes.ts` — `post.routes.ts`, `like.routes.ts`, `follow.routes.ts`, `comment.routes.ts`, dll.

**Masalah:** Pola ini di-copy-paste 10+ kali:

```typescript
// Diulang di hampir setiap protected route handler:
const user = await getCurrentUser();
if (!user) {
  set.status = 401;
  return { message: "Unauthorized" };
}
```

**Solusi yang disarankan:** Buat middleware `requireAuth` yang otomatis menangani ini:

```typescript
// middleware/require-auth.middleware.ts
export const requireAuth = new Elysia()
  .use(authPlugin)
  .derive({ as: "global" }, async ({ getCurrentUser, set }) => {
    const user = await getCurrentUser();
    if (!user) { set.status = 401; throw new Error("Unauthorized"); }
    return { user }; // user dijamin non-null di handler
  });

// Di route handler — bersih!
.post("/", ({ user, body }) => {
  // user pasti ada, tidak perlu null check lagi
})
```

---

### [REFACTOR-05] 🟡 `getToken()` Membaca `localStorage` Secara Manual — Bypass Zustand

**File:** `frontend/src/services/api.client.ts` (baris 7–16)

**Masalah:** Fungsi `getToken()` membaca raw JSON dari `localStorage` secara manual padahal Zustand store sudah menyimpan token dan bisa diakses di luar komponen:

```typescript
// api.client.ts — Bergantung pada struktur internal Zustand Persist
function getToken(): string | null {
  const raw = localStorage.getItem("auth-storage"); // ❌ Nama key hardcoded
  const parsed = JSON.parse(raw);
  return parsed?.state?.token ?? null; // ❌ Path internal hardcoded
}
```

Jika nama storage key atau struktur state Zustand berubah, `getToken()` akan **diam-diam gagal** mengembalikan `null` tanpa error apapun.

**Solusi yang disarankan:**

```typescript
import { useAuthStore } from "../store/auth.store";

function getToken(): string | null {
  return useAuthStore.getState().token; // ✅ Gunakan Zustand API langsung
}
```

---

### [REFACTOR-06] 🟢 `GET /comments` — Endpoint Tidak Berguna & Terbuka Tanpa Auth

**File:** `backend/src/modules/comment/comment.routes.ts` (baris 9–12)

**Masalah:** Endpoint ini mengambil **semua komentar dari seluruh post** tanpa filter, pagination, atau autentikasi:

```typescript
// Endpoint tidak dipakai oleh frontend, tapi terbuka untuk siapapun!
.get("/", async () => {
  const comments = await CommentService.getAllComments(); // Seluruh DB komentar!
  return { data: comments };
})
```

**Dampak:** Data dumping vulnerability — siapapun (tanpa login) bisa mengambil semua konten komentar dari semua user di seluruh platform.

**Solusi yang disarankan:** Hapus endpoint ini sepenuhnya, atau ganti dengan endpoint `GET /comments?postId=xxx` yang memerlukan auth dan filter wajib.

---

## 📋 Ringkasan Prioritas Perbaikan

### 🚨 Harus Diperbaiki Segera (Critical)

| ID     | Temuan                                        | File                                                      |
| ------ | --------------------------------------------- | --------------------------------------------------------- |
| BUG-01 | Race condition di toggle like/bookmark/follow | `like.service.ts`, `post.service.ts`, `follow.service.ts` |
| BUG-02 | JWT tanpa expiry                              | `auth.plugin.ts`                                          |
| BUG-03 | AdminRoute hardcoded username/email           | `App.tsx`                                                 |
| BUG-04 | Prisma error bocor ke client response         | `auth.routes.ts`                                          |

### ⚠️ Sebaiknya Diperbaiki Segera (High/Medium)

| ID          | Temuan                                   | File                                    |
| ----------- | ---------------------------------------- | --------------------------------------- |
| PERF-01     | DB query per-request di getCurrentUser   | `auth.plugin.ts`                        |
| PERF-06     | Counter tanpa database transaction       | `post.service.ts`, `comment.service.ts` |
| REFACTOR-01 | CreatePostPage monolitik 988 baris       | `CreatePostPage.tsx`                    |
| BUG-05      | userId tidak perlu dikirim dari frontend | `post.service.ts`                       |
| REFACTOR-06 | GET /comments terbuka tanpa auth         | `comment.routes.ts`                     |

### 💡 Nice to Have (Ongoing Improvement)

| ID          | Temuan                                  | File                 |
| ----------- | --------------------------------------- | -------------------- |
| PERF-02     | N+1 query di getSuggestions             | `follow.service.ts`  |
| REFACTOR-02 | Tipe Post duplikat di 4 file            | Semua pages          |
| REFACTOR-03 | PostGrid component berulang             | `ProfilePage.tsx`    |
| REFACTOR-04 | requireAuth middleware                  | Semua `*.routes.ts`  |
| REFACTOR-05 | getToken bypass Zustand                 | `api.client.ts`      |
| PERF-04     | buildCommentTree tanpa useMemo          | `PostDetailPage.tsx` |
| BUG-07      | Double API call setelah submit komentar | `PostDetailPage.tsx` |

---

## 🔍 Bagian 4: Temuan Tambahan (Scan Kedua)

---

### [BUG-08] 🔴 `GET /monitoring` Terbuka Tanpa Auth — Infrastruktur Bocor ke Publik

**File:** `backend/src/modules/monitoring/monitoring.routes.ts`

**Masalah:** Endpoint monitoring tidak menggunakan `authPlugin` sama sekali:

```typescript
// monitoring.routes.ts — Tidak ada auth middleware!
export const monitoringRoutes = new Elysia({ prefix: "/monitoring" })
  .get("/", async ({ query }) => { ... }); // ❌ Siapapun bisa akses tanpa login
```

**Dampak:** Siapapun dari internet bisa hit `GET /api/monitoring` dan mendapatkan secara lengkap:

- Nama bucket S3 production
- Region AWS
- Nama Cloudinary cloud name
- Latency database Neon + error messages internal

Ini **lebih parah dari AdminRoute** (BUG-03) karena tidak perlu bypass frontend — cukup hit URL langsung via curl.

**Solusi yang disarankan:** Tambahkan `.use(authPlugin)` dan validasi role admin di backend.

---

### [BUG-09] 🔴 `isAdmin` Hardcoded Duplikat di `Sidebar.tsx`

**File:** `frontend/src/components/layout/Sidebar.tsx` (baris 23–26)

**Masalah:** Logika `isAdmin` yang sama persis di-copy-paste dari `App.tsx` ke `Sidebar.tsx`:

```typescript
// Sidebar.tsx — Copy persis dari App.tsx!
const isAdmin =
  user?.username === "rafli_pratama" ||
  user?.email === "rflipratm@gmail.com" ||
  user?.username?.includes("admin");
```

**Dampak:** Selain masalah keamanan yang sama dengan BUG-03, ini juga violasi DRY. Jika suatu saat logika admin diubah, harus diupdate di 2 tempat berbeda yang rawan miss.

---

### [PERF-07] 🟠 N+1 Query Parah dalam Loop di `notification.service.ts`

**File:** `backend/src/modules/notification/notification.service.ts` (baris 23–72)

**Masalah:** Untuk setiap notifikasi, dilakukan 2 DB query tambahan di dalam `for` loop:

```typescript
for (const notif of notifications) {       // Misalnya 50 notifikasi
  sender = await db.user.findUnique(...);  // +1 query per notif = 50 queries
  post   = await db.post.findUnique(...);  // +1 query per notif = 50 queries
}
// Total: 1 (ambil notif) + 50 + 50 = 101 DB queries!
```

**Solusi yang disarankan:** Kumpulkan semua `refId` dan `senderId` terlebih dahulu, lalu batch query sekaligus dengan `findMany({ where: { id: { in: [...ids] } } })`.

---

### [BUG-10] 🟠 Parse Username Notifikasi dengan String Split — Sangat Rapuh

**File:** `backend/src/modules/notification/notification.service.ts` (baris 29–38)

**Masalah:** Sender diidentifikasi dengan mengambil kata pertama dari string pesan:

```typescript
// Contoh pesan: "rafli_pratama menyukai postingan Anda."
const firstWord = notif.message.split(" ")[0]; // "rafli_pratama"
sender = await db.user.findUnique({ where: { username: firstWord } });
```

**Dampak:**

- Jika format pesan notifikasi berubah sedikit saja → sender tidak ditemukan, `null` silent.
- Query `findUnique` by username membutuhkan index (sudah ada) tapi ini tetap design yang rapuh.
- Seharusnya model `Notification` menyimpan `senderId` secara eksplisit sebagai foreign key.

**Solusi yang disarankan:** Tambahkan field `senderId String?` di model `Notification` di Prisma schema, isi saat membuat notifikasi, dan gunakan relation include daripada parse string.

---

### [BUG-11] 🟡 `GET /users` Tanpa Auth & Tanpa Limit — Bisa Dump Semua User

**File:** `backend/src/modules/user/user.routes.ts` (baris 12–17), `user.service.ts` (baris 5–24)

**Masalah:** Endpoint search user tidak memerlukan login dan tidak membatasi jumlah hasil:

```typescript
// user.routes.ts — Terbuka tanpa auth
.get("/", async ({ query }) => {
  const users = await UserService.searchUsers(search); // Jika search kosong → SEMUA user!
  return { data: users };
})

// user.service.ts — Tidak ada `take` / limit!
return await db.user.findMany({
  where: search ? { OR: [...] } : undefined, // Jika undefined → semua user di DB
  select: { id, username, name, avatarUrl, bio, createdAt }
})
```

**Dampak:** Request `GET /api/users` (tanpa parameter) akan mengembalikan seluruh daftar user — nama, username, bio, avatar URL — kepada siapapun tanpa autentikasi. Ini adalah user enumeration vulnerability.

**Solusi yang disarankan:**

1. Wajibkan parameter `search` dengan minimum 2 karakter.
2. Tambahkan `take: 20` di query.
3. Tambahkan auth (minimal harus login).

---

## 📋 Ringkasan Prioritas Perbaikan (Update)

### 🚨 Harus Diperbaiki Segera (Critical — 6 temuan)

| ID     | Temuan                                        | File                                                      |
| ------ | --------------------------------------------- | --------------------------------------------------------- |
| BUG-01 | Race condition di toggle like/bookmark/follow | `like.service.ts`, `post.service.ts`, `follow.service.ts` |
| BUG-02 | JWT tanpa expiry                              | `auth.plugin.ts`                                          |
| BUG-03 | AdminRoute hardcoded username/email           | `App.tsx`                                                 |
| BUG-04 | Prisma error bocor ke client response         | `auth.routes.ts`                                          |
| BUG-08 | `GET /monitoring` terbuka tanpa auth          | `monitoring.routes.ts`                                    |
| BUG-09 | `isAdmin` hardcoded duplikat di Sidebar       | `Sidebar.tsx`                                             |

### ⚠️ Sebaiknya Diperbaiki Segera (High — 3 temuan)

| ID      | Temuan                                     | File                      |
| ------- | ------------------------------------------ | ------------------------- |
| PERF-01 | DB query per-request di getCurrentUser     | `auth.plugin.ts`          |
| PERF-07 | N+1 query parah di notification service    | `notification.service.ts` |
| BUG-10  | Parse username notifikasi via string split | `notification.service.ts` |

### ⚠️ Medium Priority

| ID          | Temuan                                      | File                                    |
| ----------- | ------------------------------------------- | --------------------------------------- |
| PERF-06     | Counter tanpa database transaction          | `post.service.ts`, `comment.service.ts` |
| REFACTOR-01 | CreatePostPage monolitik 988 baris          | `CreatePostPage.tsx`                    |
| BUG-05      | userId tidak perlu dikirim dari frontend    | `post.service.ts`                       |
| REFACTOR-06 | GET /comments terbuka tanpa auth            | `comment.routes.ts`                     |
| BUG-11      | GET /users dump semua user tanpa auth+limit | `user.routes.ts`, `user.service.ts`     |

### 💡 Nice to Have (Ongoing Improvement)

| ID          | Temuan                                  | File                 |
| ----------- | --------------------------------------- | -------------------- |
| PERF-02     | N+1 query di getSuggestions             | `follow.service.ts`  |
| REFACTOR-02 | Tipe Post duplikat di 4 file            | Semua pages          |
| REFACTOR-03 | PostGrid component berulang             | `ProfilePage.tsx`    |
| REFACTOR-04 | requireAuth middleware                  | Semua `*.routes.ts`  |
| REFACTOR-05 | getToken bypass Zustand                 | `api.client.ts`      |
| PERF-04     | buildCommentTree tanpa useMemo          | `PostDetailPage.tsx` |
| BUG-07      | Double API call setelah submit komentar | `PostDetailPage.tsx` |
| BUG-06      | Username Google OAuth collision-prone   | `auth.service.ts`    |

---

## 🔍 Bagian 5: Temuan Kritis (Scan Ketiga)

> ⚠️ Scan ketiga menemukan beberapa kerentanan **paling kritis** dari seluruh audit ini.

---

### [BUG-12] 🔴 `data.route.ts` Mengekspos **Seluruh Database** dengan Auth yang Bisa Dibypass

**File:** `backend/src/modules/data/data.route.ts`

**Analogi:** Brankas bank yang kuncinya ditulis di kertas tempel di pintu brankas itu sendiri.

**Masalah:** Endpoint `/data/*` mengekspos SELURUH isi database, dengan proteksi yang sangat lemah:

```typescript
// data.route.ts — Proteksi hanya via query parameter "key"!
const key = url.searchParams.get("key");
const apiKey = process.env.API_SECRET_KEY || "ok"; // ❌ Default value "ok"!!!
if (key !== apiKey) {
  set.status = 401;
  return { message: "Unauthorized" };
}
```

**Yang bisa diakses tanpa login sama sekali** (di development, atau jika `API_SECRET_KEY` tidak di-set):

- `GET /data/users` → Semua user termasuk **email, bio, avatarUrl, providerId**
- `GET /data/posts` → Semua postingan
- `GET /data/comments` → Semua komentar
- `GET /data/notifications` → Notifikasi privat semua user
- `GET /data/likes` → Data likes semua user
- `POST /data/backup` → Trigger backup seluruh database
- `POST /data/cache/clear` → Hapus semua cache (DoS attack)
- `POST /data/cache/reset` → Reset metrics

**Masalah tambahan:**

1. Default API key adalah string `"ok"` — jika `API_SECRET_KEY` env var tidak di-set, siapapun bisa masuk dengan `?key=ok`.
2. Proteksi hanya berlaku di Lambda (`process.env.AWS_LAMBDA_FUNCTION_NAME` harus ada). Di local dev → **tidak ada proteksi sama sekali**.
3. API key dikirim via URL query parameter yang tersimpan di server log, browser history, dan CDN cache.

**Solusi yang disarankan:**

1. Hapus endpoint-endpoint data dumping ini atau pindahkan ke admin panel yang proper.
2. Jika memang dibutuhkan, gunakan Bearer token di header (bukan query param) yang divalidasi server-side.
3. Hapus default value `"ok"` — lempar error jika env var tidak di-set.

---

### [BUG-13] 🔴 `backup.ts` Backup Data Termasuk `passwordHash` User — Data Sensitif Tersimpan di S3

**File:** `backend/src/scripts/backup.ts` (baris 16)

**Masalah:** Backup mengambil **semua field dari tabel users** tanpa filter:

```typescript
const users = await db.user.findMany(); // ❌ Termasuk passwordHash!

const backupData = {
  data: {
    users, // passwordHash ikut di-backup dan diunggah ke S3!
    ...
  }
}
```

**Dampak:** File backup `.json.gz` yang tersimpan di S3 berisi `passwordHash` dari semua user. Jika bucket S3 pernah misconfigured (public read) atau terjadi credential leak, **semua password hash bisa dibrute-force offline**.

**Solusi yang disarankan:**

```typescript
const users = await db.user.findMany({
  select: {
    id: true,
    username: true,
    email: true,
    name: true,
    avatarUrl: true,
    bio: true,
    createdAt: true,
    // ❌ JANGAN include: passwordHash, providerId
  },
});
```

---

### [REFACTOR-07] 🟠 `PostCard.tsx` Monolitik — 1013 Baris, 15+ State Variables

**File:** `frontend/src/components/post/PostCard.tsx`

**Masalah:** PostCard jauh lebih parah dari CreatePostPage dalam hal kompleksitas. Satu komponen ini mengelola:

| Tanggung Jawab           | State Variables                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Like toggle              | `isLiked`, `currentLikeCount`, `isLikeLoading`                                                     |
| Bookmark toggle          | `isBookmarked`, `isBookmarkLoading`                                                                |
| Hover card (2 API calls) | `hoverStats`, `isHoverFollowed`, `isFollowLoading`, `hoverPosts`, `isHoverStatsLoading`            |
| Share modal + search     | `showShareModal`, `shareSearch`, `allUsers`, `followingUsers`, `sentUserIds`, `isShareListLoading` |
| Caption editing          | `isEditing`, `editContent`, `isEditLoading`, `currentCaption`                                      |
| Options modal            | `showOptionsModal`                                                                                 |
| Carousel                 | `currentImgIndex`, `isDragging`, `scrollLeft`, `startX`, `isDown`                                  |
| Follow status            | `isAuthorFollowed`                                                                                 |
| Heart animation          | `showHeartPop`                                                                                     |
| Share count              | `sharesCount`                                                                                      |

Total: **~20 state variables + 12 handler functions** dalam satu komponen.

**Solusi yang disarankan:** Pecah menjadi komponen-komponen terpisah:

```
PostCard.tsx              ← Orchestrator
  ├── PostCardHeader.tsx  ← Avatar, username, hover card
  ├── PostCardCarousel.tsx← Image carousel + drag
  ├── PostCardActions.tsx ← Like, comment, share, bookmark buttons
  ├── PostCardCaption.tsx ← Caption + edit mode
  ├── HoverCard.tsx       ← Hover profile card
  ├── ShareModal.tsx      ← Share post modal
  └── OptionsModal.tsx    ← Three dots menu modal
```

---

### [BUG-14] 🟡 `sharesCount` di PostCard Adalah Data Palsu (Fake Random)

**File:** `frontend/src/components/post/PostCard.tsx` (baris 77–80)

**Masalah:** Jumlah share pada postingan dibuat-buat dari hash `id` post:

```typescript
const [sharesCount, setSharesCount] = useState(() => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 10) + 1; // ❌ Data palsu! Antara 1-10, tidak dari database
});
```

Ini menyesatkan user karena angka yang ditampilkan bukan data riil — dan akan berbeda di browser yang berbeda jika post id-nya berubah. Tidak ada tabel `Share` di database.

---

## 📋 Tabel Prioritas Final (Setelah Scan Ketiga)

### 🚨 Critical (7 temuan — Harus diperbaiki sebelum production)

| ID              | Temuan                                                 | File                     |
| --------------- | ------------------------------------------------------ | ------------------------ |
| BUG-12          | `data.route.ts` ekspos seluruh DB + default key `"ok"` | `data.route.ts`          |
| BUG-13          | Backup dump `passwordHash` ke S3                       | `backup.ts`              |
| BUG-01          | Race condition toggle like/bookmark/follow             | `like.service.ts`, dll   |
| BUG-02          | JWT tanpa expiry                                       | `auth.plugin.ts`         |
| BUG-03 & BUG-09 | AdminRoute hardcoded + duplikat di Sidebar             | `App.tsx`, `Sidebar.tsx` |
| BUG-04          | Prisma error bocor ke client                           | `auth.routes.ts`         |
| BUG-08          | `GET /monitoring` tanpa auth                           | `monitoring.routes.ts`   |

### ⚠️ High Priority

| ID          | Temuan                                 | File                      |
| ----------- | -------------------------------------- | ------------------------- |
| PERF-01     | DB query per-request di getCurrentUser | `auth.plugin.ts`          |
| PERF-07     | N+1 loop di notification service       | `notification.service.ts` |
| BUG-10      | Parse username notif dari string split | `notification.service.ts` |
| REFACTOR-07 | PostCard.tsx monolitik 1013 baris      | `PostCard.tsx`            |

### ⚠️ Medium Priority

| ID          | Temuan                               | File                 |
| ----------- | ------------------------------------ | -------------------- |
| PERF-06     | Counter tanpa DB transaction         | `post.service.ts`    |
| REFACTOR-01 | CreatePostPage monolitik 988 baris   | `CreatePostPage.tsx` |
| REFACTOR-06 | GET /comments tanpa auth             | `comment.routes.ts`  |
| BUG-11      | GET /users dump semua user           | `user.routes.ts`     |
| BUG-14      | sharesCount data palsu (fake random) | `PostCard.tsx`       |

### 💡 Nice to Have

| ID          | Temuan                                |
| ----------- | ------------------------------------- |
| PERF-02     | N+1 di getSuggestions                 |
| REFACTOR-02 | Tipe Post duplikat di 4 file          |
| REFACTOR-03 | PostGrid copy-paste                   |
| REFACTOR-04 | requireAuth middleware                |
| REFACTOR-05 | getToken bypass Zustand               |
| PERF-04     | buildCommentTree tanpa useMemo        |
| BUG-07      | Double API call setelah komentar      |
| BUG-06      | Username Google OAuth collision-prone |

---

## 🔍 Bagian 6: Temuan Final (Scan Keempat & Terakhir)

> ✅ Ini adalah scan terakhir. File-file yang dicek: `s3.ts`, `SuggestedUsers.tsx`, `NotificationDrawer.tsx`, `user.service.ts`, `backup.ts`, `data.route.ts`, dan struktur environment files.

---

### [BUG-15] 🔴🔴 `backend/.env.production` Berisi Credentials Production Asli — PALING BERBAHAYA

**File:** `backend/.env.production`

**Analogi:** Menyimpan kunci brankas bank di laci meja kantor yang tidak dikunci — setiap orang yang bisa masuk ruangan bisa mengambilnya.

**Masalah:** File `.env.production` berisi credentials production lengkap yang bisa dibaca siapapun yang punya akses ke repository atau filesystem server:

**Status saat ini:** File ini **TIDAK di-track git** (`git ls-files` kosong) — jadi belum bocor ke commit history.

**Namun risikonya tetap sangat tinggi karena:**

1. Jika suatu hari tidak sengaja `git add .` tanpa cek → langsung ter-commit dan ter-push ke GitHub.
2. Jika server/VPS di-clone atau di-share → semua credentials langsung terbaca.
3. `JWT_SECRET` yang sudah di sini = semua token lama yang di-sign dengan key ini harus dianggap **potentially compromised**.

**Tindakan segera yang HARUS dilakukan:**

```bash
# 1. Pastikan .env.production masuk .gitignore
echo "backend/.env.production" >> .gitignore
echo "backend/.env" >> .gitignore

# 2. Konfirmasi tidak ada di git staging
git status --short | grep "\.env"
```

**Untuk credentials yang sudah terbaca (best practice):** Rotate semua secrets:

- Reset Neon DB password di dashboard Neon
- Generate JWT_SECRET baru: `openssl rand -base64 64`
- Rotate Cloudinary API credentials di dashboard Cloudinary

---

## 📋 Ringkasan Final Seluruh Audit (4 Scan)

**Total: 29 temuan** dari 4 putaran scan lengkap.

### 🚨🚨 DARURAT — Harus Ditangani Hari Ini

| ID     | Temuan                                                          | Risiko                   |
| ------ | --------------------------------------------------------------- | ------------------------ |
| BUG-15 | `backend/.env.production` berisi credentials asli di filesystem | **Credentials exposure** |
| BUG-12 | `GET /data/*` ekspos seluruh DB, default key `"ok"`             | **Full data dump**       |
| BUG-13 | Backup dump `passwordHash` ke S3                                | **Password hash leak**   |
| BUG-08 | `GET /monitoring` tanpa auth, infrastruktur info bocor          | **Info disclosure**      |

### 🚨 Critical — Sebelum Production Deploy

| ID              | Temuan                                        | File                     |
| --------------- | --------------------------------------------- | ------------------------ |
| BUG-01          | Race condition toggle like/bookmark/follow    | `like.service.ts` dll    |
| BUG-02          | JWT tanpa expiry — token berlaku selamanya    | `auth.plugin.ts`         |
| BUG-03 & BUG-09 | AdminRoute + Sidebar hardcoded username/email | `App.tsx`, `Sidebar.tsx` |
| BUG-04          | Prisma error object bocor ke client response  | `auth.routes.ts`         |

### ⚠️ High Priority

| ID          | Temuan                                        | File                      |
| ----------- | --------------------------------------------- | ------------------------- |
| PERF-01     | DB query per-request di `getCurrentUser()`    | `auth.plugin.ts`          |
| PERF-07     | N+1 loop 100+ query di notification service   | `notification.service.ts` |
| BUG-10      | Parse username notifikasi via string split    | `notification.service.ts` |
| REFACTOR-07 | `PostCard.tsx` 1013 baris, 20 state variables | `PostCard.tsx`            |

### ⚠️ Medium Priority

| ID          | Temuan                                               | File                 |
| ----------- | ---------------------------------------------------- | -------------------- |
| PERF-06     | `postCount`/`commentCount` increment tanpa transaksi | `post.service.ts`    |
| REFACTOR-01 | `CreatePostPage.tsx` monolitik 988 baris             | `CreatePostPage.tsx` |
| REFACTOR-06 | `GET /comments` terbuka tanpa auth                   | `comment.routes.ts`  |
| BUG-11      | `GET /users` dump semua user tanpa auth & limit      | `user.routes.ts`     |
| BUG-14      | `sharesCount` adalah data palsu (fake random)        | `PostCard.tsx`       |
| BUG-05      | `userId` tidak perlu dikirim dari FormData frontend  | `post.service.ts`    |

### 💡 Nice to Have

| ID          | Temuan                                                  |
| ----------- | ------------------------------------------------------- |
| PERF-02     | N+1 di `getSuggestions` (2 query → bisa 1 subquery)     |
| PERF-03     | Cache key per-user, tidak bisa dishare antar user       |
| PERF-04     | `buildCommentTree` tanpa `useMemo`                      |
| PERF-05     | Feed tidak ada cursor pagination                        |
| REFACTOR-02 | Interface `Post` duplikat di 4 file berbeda             |
| REFACTOR-03 | PostGrid copy-paste di `ProfilePage.tsx`                |
| REFACTOR-04 | `requireAuth` middleware belum ada                      |
| REFACTOR-05 | `getToken()` bypass Zustand, baca localStorage langsung |
| BUG-07      | Double API call setelah submit komentar                 |
| BUG-06      | Username Google OAuth collision-prone (`random * 1000`) |

---

## ✅ File yang Sudah Dicek — Tidak Ada Temuan Baru

File berikut sudah di-scan dan tidak ada temuan tambahan yang signifikan:

- `SuggestedUsers.tsx` — bersih, logic follow sudah proper
- `NotificationDrawer.tsx` — bersih, UI-only, tidak ada direct DB access
- `CommentItem.tsx` — bersih, optimistic update sudah benar
- `s3.ts` — bersih, fallback Cloudinary sudah terstruktur baik
- `user.service.ts` — bersih, select field sudah tidak include `passwordHash`
- `shared/src/types/*` — bersih, tipe sudah proper

---

> **Status Audit:** ✅ SELESAI — 4 putaran scan, 29 temuan total.
> **Temuan paling kritis:** BUG-15 (`.env.production`) dan BUG-12 (`data.route.ts`).
> **Rekomendasi:** Tangani semua item "DARURAT" hari ini sebelum lanjut development.
