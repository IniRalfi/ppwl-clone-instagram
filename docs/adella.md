# 📋 Task: Adella — Beranda & Kartu Postingan (Feed)

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
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol, link aktif) |
| `text-ig-badge` | `rgb(255, 48, 64)` | Merah (like, error) |
| `border-neutral-800` | abu gelap | Border card/divider |

---

## 📁 File yang Kamu Kerjakan

```
frontend/src/
├── pages/
│   └── HomePage.tsx                    ← Halaman beranda (feed scroll)
└── components/
    └── post/
        └── PostCard.tsx                ← Komponen satu kartu postingan
```

> ℹ️ `components/common/ThemeToggle.tsx` sudah tersedia — tinggal dipakai di header sementara.

---

## 🔗 Tipe Data — Salin Langsung, Jangan Import dari Mana-mana

Gunakan tipe data ini langsung di file kamu:

```typescript
// Salin tipe ini ke dalam file yang butuh
interface Post {
  id: string;
  content: string;      // Caption postingan
  imageUrl: string | null;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
}
```

---

## 🌐 API yang Sudah Siap Digunakan

Backend sudah jalan di cloud. **Tidak perlu install atau jalankan backend apapun.**

```
Base URL (sudah ada di .env.development):
→ http://localhost:3000   (saat kamu buka di lokal, Rafli sudah sediakan)
```

> ✅ API sudah diatur otomatis via file `.env.development`. Kamu **tidak perlu ubah apapun**.

Cara ambil data postingan:
```typescript
// Ambil dari environment variable — sudah otomatis
const API_URL = import.meta.env.VITE_API_URL;

const res = await fetch(`${API_URL}/posts`);
const json = await res.json();
// json.data → array of Post
```

**Endpoint yang kamu butuhkan:**
```
GET {VITE_API_URL}/posts       → Ambil semua postingan
Response: { data: Post[] }
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `PostCard.tsx` (Komponen Satu Kartu Postingan)

Komponen satu item postingan di feed — persis seperti kartu di Instagram.

**Props yang harus diterima:**
```typescript
// frontend/src/components/post/PostCard.tsx
interface PostCardProps {
  id: string;
  username: string;
  avatarUrl: string | null;
  imageUrls: string[];     // URL gambar postingan (bisa kosong)
  caption: string;
  likesCount: number;
  timeAgo: string;
}
```

**Yang harus tampil di kartu:**
- Avatar + username di bagian atas
- Gambar postingan (jika ada), atau placeholder kotak abu jika tidak ada gambar
- Ikon ❤️ dengan jumlah like, ikon 💬 dengan jumlah komentar
- Caption di bawah
- Teks waktu posting (contoh: "19 Mei")
- Klik jumlah komentar atau ikon komentar → navigasi ke `/posts/:id`

**Struktur dasar:**
```typescript
import { Link } from "react-router-dom";

export function PostCard({ id, username, avatarUrl, imageUrls, caption, likesCount, timeAgo }: PostCardProps) {
  return (
    <div className="border border-neutral-800 rounded-md bg-ig-background">
      {/* Header: Avatar + Username */}
      <div className="flex items-center p-3 gap-3">
        <div className="w-8 h-8 rounded-full bg-ig-secondary-bg overflow-hidden">
          {avatarUrl
            ? <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-ig-text text-xs font-bold">{username[0]?.toUpperCase()}</div>
          }
        </div>
        <span className="text-ig-text font-semibold text-sm">{username}</span>
      </div>

      {/* Gambar (jika ada) */}
      {imageUrls[0] && (
        <img src={imageUrls[0]} alt="post" className="w-full object-cover" />
      )}

      {/* Aksi: Like + Komentar */}
      <div className="p-3 flex gap-4">
        <button className="text-ig-text">❤️ {likesCount}</button>
        <Link to={`/posts/${id}`} className="text-ig-text">💬 Komentar</Link>
      </div>

      {/* Caption */}
      <div className="px-3 pb-2">
        <span className="text-ig-text text-sm font-semibold mr-1">{username}</span>
        <span className="text-ig-text text-sm">{caption}</span>
      </div>

      {/* Waktu */}
      <p className="px-3 pb-3 text-neutral-500 text-xs">{timeAgo}</p>
    </div>
  );
}
```

---

### ✅ Langkah 2 — `HomePage.tsx` (Halaman Feed)

Halaman utama yang menampilkan daftar postingan dari API.

```typescript
// frontend/src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { PostCard } from '../components/post/PostCard';

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/posts`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setPosts(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center py-20 text-ig-text">Memuat...</div>;

  return (
    <div className="min-h-screen bg-ig-background flex flex-col items-center pb-20 pt-4">
      <div className="w-full max-w-[470px] flex flex-col gap-4 px-3">
        {posts.map(post => (
          <PostCard
            key={post.id}
            id={post.id}
            username={post.author.username}
            avatarUrl={post.author.avatarUrl}
            imageUrls={post.imageUrl ? [post.imageUrl] : []}
            caption={post.content}
            likesCount={post._count.likes}
            timeAgo={new Date(post.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
          />
        ))}
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
git checkout -b adella/homepage-postcard
```

### 2. Commit setiap selesai 1 langkah
```bash
git add .
git commit -m "feat(post): add PostCard component"
# Lanjut langkah 2:
git commit -m "feat(home): add HomePage with API fetch"
```

### 3. Push ke branch kamu
```bash
git push origin adella/homepage-postcard
```

### 4. Buat Pull Request di GitHub
1. Buka **github.com/IniRalfi/ppwl-clone-instagram**
2. Klik **"Compare & pull request"** yang muncul otomatis
3. **Base branch:** `dev` ← PASTIKAN INI! (bukan `main`)
4. **Title PR:** `feat: HomePage & PostCard (Adella)`
5. Klik **"Create pull request"**
6. Kabari Rafli di grup — dia yang review dan merge

> ⚠️ **JANGAN merge sendiri ke `main`!**

---

## ✅ Cara Test

1. Jalankan `bun dev` dari folder `frontend/`
2. Buka `http://localhost:5173`
3. **Yang harus muncul:** Daftar kartu postingan dengan gambar, username, caption, jumlah like
4. **Klik ikon komentar** → harus pindah ke halaman `/posts/:id`

### Kalau Ada Error di Terminal
1. Copy seluruh pesan error
2. Paste ke AI bersama kode file yang error
3. Ketik: _"Ini error di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: Harus install database dulu?**
A: **TIDAK PERLU.** Backend dan database sudah jalan di cloud. Kamu cukup jalankan `bun dev` dari folder `frontend/`.

**Q: Kenapa data tidak muncul (loading terus)?**
A: Pastikan kamu menjalankan `bun dev` dari folder `frontend/`, bukan dari root atau `backend/`. Cek juga file `.env.development` sudah ada.

**Q: `import.meta.env.VITE_API_URL` undefined?**
A: File `.env.development` harus ada di dalam folder `frontend/`. Tanya Rafli untuk minta filenya kalau belum ada.
