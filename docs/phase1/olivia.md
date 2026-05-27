# 📋 Task: Olivia — Profil Pengguna & Komponen Avatar

> **💡 CARA PAKAI DOKUMEN INI:**
> Salin **seluruh isi dokumen ini** ke chat AI (ChatGPT/Claude/Gemini), lalu ketik:
> _"Mulai dari Langkah 1, buatkan kodenya satu per satu."_
> AI akan langsung paham konteks proyek dan stack-nya tanpa perlu penjelasan tambahan.

---

## 🏗️ Konteks Proyek

Kamu lagi mengerjakan **Clone Instagram** sebagai tugas capstone.

- **Stack:** Bun · React + Vite · TypeScript · Tailwind CSS v4 · React Router DOM
- **Kamu cukup fokus ke folder:** `frontend/src/`
- **Backend & Database sudah siap di cloud** — kamu tidak perlu install database apapun.
- **Cara jalankan:**
  ```bash
  # 1. Clone repo (kalau belum)
  git clone https://github.com/IniRalfi/ppwl-clone-instagram.git
  cd ppwl-clone-instagram/frontend

  # 2. Install dependencies
  bun install

  # 3. Jalankan (cukup ini saja!)
  bun dev
  ```
  Buka `http://localhost:5173` di browser. Selesai!

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

## 🔗 Tipe Data — Salin Langsung, Jangan Import dari Mana-mana

Gunakan tipe data ini langsung di file kamu (salin ke dalam file yang membutuhkannya):

```typescript
// Tipe User — salin ke dalam ProfilePage.tsx
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

// Tipe Post — salin ke dalam ProfilePage.tsx
interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  _count?: {
    likes: number;
    comments: number;
  };
  createdAt: string;
}
```

**Data user yang login** sudah tersimpan di auth store (sudah dibuat Rafli):
```typescript
import { useAuthStore } from "../store/auth.store";
const { user, logout } = useAuthStore();
// user.name, user.username, user.avatarUrl, user.bio, dll
```

---

## 🌐 API yang Sudah Siap Digunakan

Backend sudah jalan di cloud. **Tidak perlu install atau jalankan backend apapun.**

```typescript
// Ambil semua postingan lalu filter berdasarkan authorId
const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
const json = await res.json();
// Filter hanya postingan milik user yang login:
const myPosts = json.data.filter((post: Post) => post.authorId === user.id);
```

**Endpoint yang digunakan:**
```
GET {VITE_API_URL}/posts     → Ambil semua postingan
Response: { data: Post[] }
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `Avatar.tsx` (Komponen Avatar Reusable)

Komponen foto profil bulat yang bisa dipakai di mana saja (di komentar, header profil, dll).

**Spesifikasi:**
- Jika `avatarUrl` ada → tampilkan `<img>`
- Jika tidak ada → tampilkan inisial nama (huruf pertama) di lingkaran berwarna
- Ada 3 ukuran: `sm` (komentar), `md` (default/PostCard), `lg` (halaman profil)

```typescript
// frontend/src/components/common/Avatar.tsx

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-2xl",
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
import { Avatar } from "../components/common/Avatar";

// Di PostCard (ukuran medium):
<Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size="md" />

// Di halaman profil (ukuran besar):
<Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
```

---

### ✅ Langkah 2 — `ProfilePage.tsx` (Halaman Profil)

Halaman profil persis seperti Instagram — header di atas, grid postingan di bawah.

**Tampilan (urut dari atas ke bawah):**
1. **Header Profil:**
   - Kiri: Avatar besar (`size="lg"`)
   - Kanan: Username (bold), Nama, Bio
   - Bawah: Jumlah postingan
2. **Tombol Keluar** (untuk logout)
3. **Grid 3 Kolom** — foto-foto postingan user (klik → ke `/posts/:id`)

```typescript
// frontend/src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { Avatar } from "../components/common/Avatar";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  _count?: { likes: number; comments: number; };
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`${import.meta.env.VITE_API_URL}/posts`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          // Filter hanya postingan milik user yang sedang login
          const filtered = json.data.filter((post: Post) => post.authorId === user.id);
          setMyPosts(filtered);
        }
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ig-background">
        <p className="text-neutral-500">Silakan login terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4">
      {/* ── Header Profil ── */}
      <div className="flex items-start gap-8 py-8 border-b border-neutral-800">
        {/* Avatar Besar */}
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />

        {/* Info Profil */}
        <div className="flex-1">
          {/* Username + Tombol Keluar */}
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-ig-text text-xl font-semibold">{user.username}</h1>
            <button
              className="px-4 py-1.5 text-ig-text text-sm font-semibold bg-ig-secondary-bg rounded-lg hover:bg-neutral-700 transition-colors"
            >
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
            <div>
              <span className="text-ig-text font-semibold">{myPosts.length}</span>
              <span className="text-ig-text text-sm ml-1">postingan</span>
            </div>
          </div>

          {/* Nama + Bio */}
          <p className="text-ig-text text-sm font-semibold">{user.name}</p>
          {user.bio ? (
            <p className="text-ig-text text-sm mt-1 whitespace-pre-line">{user.bio}</p>
          ) : (
            <p className="text-neutral-600 text-sm mt-1 italic">Belum ada bio.</p>
          )}
        </div>
      </div>

      {/* ── Grid Postingan ── */}
      <div className="py-4">
        {isLoading ? (
          <p className="text-neutral-500 text-sm text-center py-8">Memuat postingan...</p>
        ) : myPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📷</span>
            <p className="text-ig-text font-semibold">Belum Ada Postingan</p>
            <p className="text-neutral-500 text-sm">Mulai bagikan foto pertamamu!</p>
            <Link to="/create" className="mt-2 text-ig-primary text-sm font-semibold hover:opacity-80">
              Buat Postingan
            </Link>
          </div>
        ) : (
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
                  <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
                    <span className="text-neutral-600 text-xs text-center px-2 line-clamp-3">
                      {post.content}
                    </span>
                  </div>
                )}

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <span className="text-white text-sm font-semibold">❤️ {post._count?.likes ?? 0}</span>
                  <span className="text-white text-sm font-semibold">💬 {post._count?.comments ?? 0}</span>
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
git commit -m "feat(avatar): add reusable Avatar component"
git commit -m "feat(profile): add ProfilePage with post grid"
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

## ✅ Cara Test

1. Jalankan `bun dev` dari folder `frontend/`
2. Login → buka `http://localhost:5173/profile`
3. **Yang harus muncul:**
   - Avatar besar di kiri (inisial nama atau foto dari Google)
   - Username, nama, bio (atau teks "Belum ada bio.")
   - Grid foto postingan (atau empty state dengan tombol "Buat Postingan")
4. **Klik foto di grid** → harus pindah ke `/posts/:id`
5. **Klik Keluar** → harus logout dan redirect ke `/login`

### Kalau Ada Error
1. Copy seluruh pesan error
2. Paste ke AI bersama kode file yang error
3. Ketik: _"Ini error di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: Harus install database atau backend dulu?**
A: **TIDAK PERLU.** Backend dan database sudah jalan di cloud. Kamu cukup jalankan `bun dev` dari folder `frontend/`.

**Q: `user.bio` undefined?**
A: Gunakan fallback: `user.bio ?? null`. Data dari store login mungkin tidak semua field terisi.

**Q: Grid tidak muncul, `myPosts` selalu kosong?**
A: Pastikan kamu sudah login dengan akun yang punya postingan. Print `console.log(user.id)` dulu untuk cek ID user-nya.

**Q: Import Avatar error "module not found"?**
A: Pastikan path-nya sudah benar. Dari `pages/ProfilePage.tsx` ke `components/common/Avatar` pathnya adalah `"../components/common/Avatar"`.
