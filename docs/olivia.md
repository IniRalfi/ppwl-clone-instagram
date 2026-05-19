# 📋 Task: Olivia — Profil Pengguna & Komponen Avatar

> **💡 CARA PAKAI DOKUMEN INI:**
> Salin **seluruh isi dokumen ini** ke chat AI (ChatGPT/Claude/Gemini), lalu ketik:
> _"Mulai dari Langkah 1, buatkan kodenya satu per satu."_
> AI akan langsung paham konteks proyek dan stack-nya tanpa perlu penjelasan tambahan.

---

## 🏗️ Konteks Proyek

Kamu lagi mengerjakan **Clone Instagram** sebagai tugas capstone.

- **Stack:** Bun · React + Vite · TypeScript · Tailwind CSS v4 · ShadCN UI · React Router DOM
- **Monorepo:** Folder utama ada 3: `frontend/`, `backend/`, `shared/`
- **Semua file kamu ada di:** `frontend/src/`
- **Aplikasi sudah berjalan** di `http://localhost:5173` (jalankan `bun dev` dari root)

---

## 🎨 Design System — WAJIB Diikuti

Proyek ini punya warna kustom. **Jangan gunakan warna Tailwind biasa** seperti `bg-gray-900` atau `text-white`. Gunakan variabel tema berikut:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam IG) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background card / panel |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol, link) |
| `border-neutral-800` | abu gelap | Border card |
| `text-neutral-400` | abu terang | Teks sekunder (bio, label) |

---

## 📁 File yang Kamu Kerjakan

```
frontend/src/
├── components/
│   └── common/
│       └── Avatar.tsx       ← Komponen avatar reusable (foto profil bulat)
└── pages/
    └── ProfilePage.tsx      ← Halaman profil pengguna
```

---

## 🔗 Tipe Data yang Tersedia

**Jangan buat tipe data sendiri.** Import dari path berikut:

```typescript
// Dari pages/ProfilePage.tsx (3 level ke root):
import type { User } from "../../../shared/src/types/user";
import type { Post } from "../../../shared/src/types/post";

// Dari components/common/Avatar.tsx (4 level ke root):
import type { User } from "../../../../shared/src/types/user";
```

**Bentuk tipe `User`:**
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;   // URL foto profil (bisa null)
  bio: string | null;         // Bio pengguna (bisa null)
  provider: string;
  postCount: number;          // Jumlah post
  commentCount: number;       // Jumlah komentar
  createdAt: string;
  updatedAt: string;
}
```

**Data user yang login** sudah tersimpan di auth store:
```typescript
import { useAuthStore } from "../store/auth.store";
const { user } = useAuthStore();
// user.name, user.username, user.avatarUrl, dll
```

---

## 🌐 API Endpoint

```
Base URL: import.meta.env.VITE_API_URL
→ di local: http://localhost:3000
→ di production: https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws
```

**Endpoint yang dipakai:**
```
GET {VITE_API_URL}/posts
Response: { data: Post[] }

→ Saring (filter) hasilnya di frontend untuk hanya tampilkan post milik user sendiri:
  posts.filter(post => post.authorId === user.id)
```

> **Catatan:** Backend belum punya endpoint `GET /users/:id` untuk profil spesifik.
> Gunakan data user dari `useAuthStore()` (sudah ada sejak login) untuk header profil.
> Untuk daftar postingan, fetch `/posts` lalu filter berdasarkan `authorId`.

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `Avatar.tsx` (Komponen Avatar Reusable)

Komponen foto profil bulat yang bisa dipakai di mana saja (di komentar, header profil, dll).

**Spesifikasi:**
- Jika `avatarUrl` ada → tampilkan `<img>`
- Jika tidak ada → tampilkan inisial nama (huruf pertama) di lingkaran berwarna
- Ada 3 ukuran: `sm` (komentar), `md` (default/PostCard), `lg` (halaman profil)

**Nama props & struktur:**
```typescript
// frontend/src/components/common/Avatar.tsx

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;                 // Nama lengkap (untuk inisial)
  avatarUrl?: string | null;    // URL foto (opsional)
  size?: AvatarSize;            // Ukuran (default: "md")
  className?: string;           // Class tambahan jika perlu
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",      // Kecil — untuk komentar
  md: "w-10 h-10 text-sm",    // Sedang — untuk PostCard
  lg: "w-20 h-20 text-2xl",   // Besar — untuk halaman profil
};

export function Avatar({ name, avatarUrl, size = "md", className = "" }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() ?? "?";
  const sizeClass = sizeClasses[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Foto profil ${name}`}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-ig-secondary-bg flex items-center justify-center text-ig-text font-semibold flex-shrink-0 ${sizeClass} ${className}`}
      aria-label={`Avatar ${name}`}
    >
      {initial}
    </div>
  );
}
```

**Cara pakai Avatar di komponen lain:**
```typescript
import { Avatar } from "../common/Avatar";

// Di PostCard (ukuran medium):
<Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size="md" />

// Di halaman profil (ukuran besar):
<Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />

// Di komentar (ukuran kecil):
<Avatar name={comment.author.name} avatarUrl={comment.author.avatarUrl} size="sm" />
```

---

### ✅ Langkah 2 — `ProfilePage.tsx` (Halaman Profil)

Halaman profil persis seperti Instagram — header di atas, grid postingan di bawah.

**Tampilan (urut dari atas ke bawah):**
1. **Header Profil:**
   - Kiri: Avatar besar (`size="lg"`)
   - Kanan: Username (bold), Nama, Bio
   - Bawah kanan: Statistik — jumlah **Postingan · Disukai · Komentar**
2. **Tombol Edit Profil** (sementara tidak perlu fungsional)
3. **Grid 3 Kolom** — foto-foto postingan user (klik → ke `/posts/:id`)

**Nama state & struktur:**
```typescript
// frontend/src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { Avatar } from "../components/common/Avatar";
import { apiClient } from "../services/api.client";
import type { Post } from "../../../shared/src/types/post";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMyPosts = async () => {
      try {
        const json = await apiClient.get<{ data: Post[] }>("/posts");
        // Filter hanya postingan milik user yang login
        const filtered = json.data.filter((post) => post.authorId === user.id);
        setMyPosts(filtered);
      } catch {
        // Abaikan error — tetap tampilkan profil dengan grid kosong
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-500">Silakan login terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4">
      {/* ── Header Profil ───────────────────────────── */}
      <div className="flex items-start gap-8 py-8 border-b border-neutral-800">
        {/* Avatar Besar */}
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />

        {/* Info Profil */}
        <div className="flex-1">
          {/* Username + Edit */}
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-ig-text text-xl font-semibold">{user.username}</h1>
            <button className="px-4 py-1.5 text-ig-text text-sm font-semibold bg-ig-secondary-bg rounded-lg hover:bg-neutral-700 transition-colors">
              Edit Profil
            </button>
            <button
              onClick={logout}
              className="text-neutral-400 text-sm hover:text-ig-text transition-colors"
            >
              Keluar
            </button>
          </div>

          {/* Statistik */}
          <div className="flex gap-6 mb-3">
            <div className="text-center">
              <span className="text-ig-text font-semibold">{myPosts.length}</span>
              <span className="text-ig-text text-sm ml-1">postingan</span>
            </div>
            <div className="text-center">
              <span className="text-ig-text font-semibold">{user.postCount ?? 0}</span>
              <span className="text-ig-text text-sm ml-1">disukai</span>
            </div>
            <div className="text-center">
              <span className="text-ig-text font-semibold">{user.commentCount ?? 0}</span>
              <span className="text-ig-text text-sm ml-1">komentar</span>
            </div>
          </div>

          {/* Nama + Bio */}
          <p className="text-ig-text text-sm font-semibold">{user.name}</p>
          {user.bio && (
            <p className="text-ig-text text-sm mt-1 whitespace-pre-line">{user.bio}</p>
          )}
          {!user.bio && (
            <p className="text-neutral-600 text-sm mt-1 italic">Belum ada bio.</p>
          )}
        </div>
      </div>

      {/* ── Grid Postingan ──────────────────────────── */}
      <div className="py-4">
        {isLoading ? (
          <p className="text-neutral-500 text-sm text-center py-8 animate-pulse">
            Memuat postingan...
          </p>
        ) : myPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📷</span>
            <p className="text-ig-text font-semibold">Belum Ada Postingan</p>
            <p className="text-neutral-500 text-sm">Mulai bagikan foto pertamamu!</p>
            <Link
              to="/create"
              className="mt-2 text-ig-primary text-sm font-semibold hover:opacity-80"
            >
              Buat Postingan
            </Link>
          </div>
        ) : (
          /* Grid 3 kolom — max 2 post karena limit capstone */
          <div className="grid grid-cols-3 gap-[2px]">
            {myPosts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="relative aspect-square overflow-hidden group"
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.content}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  /* Placeholder kalau tidak ada gambar */
                  <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
                    <span className="text-neutral-600 text-xs text-center px-2 line-clamp-3">
                      {post.content}
                    </span>
                  </div>
                )}

                {/* Overlay info saat hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <span className="text-white text-sm font-semibold">
                    ❤️ {post._count?.likes ?? 0}
                  </span>
                  <span className="text-white text-sm font-semibold">
                    💬 {post._count?.comments ?? 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding
```bash
git checkout dev
git pull origin dev
git checkout -b olivia/profile-avatar
```

### 2. Commit setiap selesai 1 langkah
```bash
git add .
git commit -m "feat(avatar): add reusable Avatar component with size variants"
# Lanjut langkah 2:
git commit -m "feat(profile): add ProfilePage with header and post grid"
```

### 3. Push ke branch kamu
```bash
git push origin olivia/profile-avatar
```

### 4. Buat Pull Request di GitHub
1. Buka **github.com/IniRalfi/ppwl-clone-instagram**
2. Klik **"Compare & pull request"** yang muncul otomatis
3. **Base branch:** `dev` ← PASTIKAN INI! (bukan `main`)
4. **Title PR:** `feat: ProfilePage & Avatar component (Olivia)`
5. Klik **"Create pull request"**
6. Kabari Rafli di grup — dia yang review dan merge

> ⚠️ **JANGAN merge sendiri ke `main`!**

---

## ✅ Cara Test Komponen

### Test Avatar
1. Sementara, tambahkan di `ProfilePage.tsx` atau mana saja:
   ```tsx
   import { Avatar } from "../components/common/Avatar";
   <Avatar name="Olivia Naura" size="sm" />
   <Avatar name="Olivia Naura" size="md" />
   <Avatar name="Olivia Naura" size="lg" />
   ```
2. **Yang harus muncul:** 3 lingkaran berbeda ukuran dengan huruf "O"
3. Coba tambahkan `avatarUrl="https://picsum.photos/100"` → harus tampil gambar

### Test ProfilePage
1. Login → buka `http://localhost:5173/profile`
2. **Yang harus muncul:**
   - Avatar besar di kiri (inisial nama atau foto)
   - Username, nama, bio (atau teks "Belum ada bio.")
   - Statistik: postingan, disukai, komentar
   - Grid foto postingan (atau empty state dengan tombol "Buat Postingan")
3. **Klik foto di grid** → harus pindah ke `/posts/:id`
4. **Klik Keluar** → harus logout dan redirect ke `/login`

### Kalau Ada Error di Terminal
1. Copy seluruh pesan error (teks merah)
2. Paste ke AI bersama kode file yang error
3. Ketik: _"Ini error di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: `user.bio` dan `user.postCount` tidak ada / undefined?**
A: Data dari `useAuthStore()` berasal dari response login. Jika backend belum mengembalikan field itu, gunakan fallback: `user.bio ?? null` dan `user.postCount ?? 0`.

**Q: Grid tidak muncul, `myPosts` selalu kosong?**
A: Pastikan `user.id` sudah ada di store. Print `console.log(user)` dulu untuk cek. Mungkin data seed belum punya post dari user yang sedang login.

**Q: Import `Avatar` dari `../../components/common/Avatar` error?**
A: Pastikan path relatif sudah benar. Dari `pages/ProfilePage.tsx` → ke `components/common/Avatar` pathnya adalah `"../components/common/Avatar"`.

**Q: Gambar di grid tidak muncul (imageUrl null)?**
A: Normal — data seed mungkin belum ada gambar. Komponen sudah handle kasus ini dengan placeholder teks caption.
