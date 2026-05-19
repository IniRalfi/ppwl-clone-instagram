# 📋 Task: Adella — Beranda & Kartu Postingan (Feed)

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

## 🔗 Tipe Data yang Tersedia

**Jangan buat tipe data sendiri.** Import dari file yang sudah ada:

```typescript
// Import dari: "../../../shared/src/types/post"
import type { Post } from "../../../shared/src/types/post";

// Bentuk data Post:
interface Post {
  id: string;
  content: string;           // Caption postingan
  imageUrl: string | null;   // URL gambar (bisa null kalau belum ada gambar)
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  _count?: {
    likes: number;           // Jumlah like
    comments: number;        // Jumlah komentar
  };
  isLiked?: boolean;         // Apakah user yang login sudah like postingan ini
  createdAt: string;         // Format ISO: "2026-05-19T07:30:00Z"
  updatedAt: string;
}
```

**Import auth store** untuk tahu token user yang login:
```typescript
import { useAuthStore } from "../store/auth.store";
// Gunakan: const { user, token } = useAuthStore();
```

---

## 🌐 API Endpoint

```
Base URL: import.meta.env.VITE_API_URL
→ di local: http://localhost:3000
→ di production: https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws
```

**Endpoint Feed:**
```
GET {VITE_API_URL}/posts
Response: { data: Post[] }
```

**Contoh fetch:**
```typescript
const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
const json = await res.json();
const posts: Post[] = json.data; // Array postingan, urut dari terbaru
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `PostCard.tsx` (Kartu Satu Postingan)

Komponen yang menampilkan **satu postingan** persis seperti Instagram.

**Tampilan (urut dari atas ke bawah):**
1. **Header:** Foto profil (avatar) + username + tombol "•••" (opsional)
2. **Gambar:** Foto postingan (jika ada `imageUrl`)
3. **Aksi:** Tombol like (❤️), tombol komentar (💬), tombol share (↗)
4. **Jumlah Like:** Teks "X suka"
5. **Caption:** `username` **bold** lalu teks `content`
6. **Komentar:** Teks "Lihat semua X komentar" yang bisa diklik ke `/posts/:id`
7. **Waktu:** Format relatif, ex: "2 jam lalu"

**Nama props & struktur yang harus dipakai:**
```typescript
// frontend/src/components/post/PostCard.tsx
import type { Post } from "../../../../shared/src/types/post"; // 4 level naik ke root!
import { Heart, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
    // TODO: nanti hit API like/unlike
  };

  return (
    <article className="border-b border-neutral-800 pb-4 mb-2">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-ig-secondary-bg flex items-center justify-center text-ig-text text-sm font-semibold">
          {post.author.name.charAt(0).toUpperCase()}
        </div>
        {/* Username */}
        <span className="text-ig-text font-semibold text-sm">
          {post.author.username}
        </span>
      </div>

      {/* Gambar Postingan */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={`Postingan dari ${post.author.username}`}
          className="w-full object-cover max-h-[600px]"
        />
      )}

      {/* Tombol Aksi */}
      <div className="flex items-center gap-4 px-4 pt-3">
        <button
          onClick={handleLike}
          aria-label={isLiked ? "Hapus like" : "Like postingan"}
          className="transition-transform active:scale-90"
        >
          <Heart
            className={`w-6 h-6 ${isLiked ? "fill-ig-badge text-ig-badge" : "text-ig-text"}`}
          />
        </button>
        <Link to={`/posts/${post.id}`} aria-label="Lihat komentar">
          <MessageCircle className="w-6 h-6 text-ig-text" />
        </Link>
        <Send className="w-6 h-6 text-ig-text" />
      </div>

      {/* Jumlah Like */}
      <p className="px-4 pt-2 text-ig-text text-sm font-semibold">
        {likeCount} suka
      </p>

      {/* Caption */}
      <p className="px-4 pt-1 text-ig-text text-sm">
        <span className="font-semibold mr-1">{post.author.username}</span>
        {post.content}
      </p>

      {/* Link ke komentar */}
      {(post._count?.comments ?? 0) > 0 && (
        <Link
          to={`/posts/${post.id}`}
          className="px-4 pt-1 block text-neutral-500 text-sm"
        >
          Lihat semua {post._count?.comments} komentar
        </Link>
      )}

      {/* Waktu */}
      <p className="px-4 pt-1 text-neutral-500 text-xs uppercase">
        {new Date(post.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </article>
  );
}
```

---

### ✅ Langkah 2 — `HomePage.tsx` (Halaman Feed)

Halaman yang menampilkan **daftar semua postingan** (scroll ke bawah seperti IG).

**Nama state & struktur yang harus dipakai:**
```typescript
// frontend/src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import type { Post } from "../../../shared/src/types/post";
import { PostCard } from "../components/post/PostCard";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
        if (!res.ok) throw new Error("Gagal memuat postingan");
        const json = await res.json();
        setPosts(json.data);
      } catch (err) {
        setError("Tidak bisa memuat postingan. Coba lagi nanti.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-neutral-500 animate-pulse">Memuat postingan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-ig-badge">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[468px] mx-auto">
      {posts.length === 0 ? (
        <p className="text-neutral-500 text-center py-16">
          Belum ada postingan.
        </p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
```

---

### ✅ Langkah 3 — Tambah Header Sementara di HomePage

Sementara belum ada Sidebar dari Salsabila, tambahkan header di atas feed. **ThemeToggle sudah tersedia**, tinggal dipakai:

```typescript
// Tambahkan import ini di HomePage.tsx:
import { useAuthStore } from "../store/auth.store";
import { ThemeToggle } from "../components/common/ThemeToggle";

// Di dalam komponen, sebelum return:
const logout = useAuthStore((state) => state.logout);

// Wrap return dengan ini:
return (
  <div className="min-h-screen bg-ig-background">
    {/* Header sticky sementara */}
    <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-800 sticky top-0 bg-ig-background z-10">
      <span className="text-ig-text font-semibold text-lg">Instagram</span>
      <div className="flex items-center gap-2">
        <ThemeToggle />   {/* ← Tombol dark/light mode */}
        <button
          onClick={logout}
          className="text-ig-primary text-sm font-semibold"
        >
          Keluar
        </button>
      </div>
    </div>
    {/* Feed di sini */}
    <div className="max-w-[468px] mx-auto">
      {posts.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  </div>
);
```

> **Catatan:** Tombol ini nanti digantikan Sidebar Salsabila. `ThemeToggle` akan tetap ada di Sidebar.

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding
```bash
git checkout dev
git pull origin dev
git checkout -b adella/homepage-feed
```

### 2. Commit setiap selesai 1 langkah
```bash
git add .
git commit -m "feat(post): add PostCard component"
# Lanjut ke langkah 2, lalu:
git commit -m "feat(home): add HomePage with posts feed"
# Lanjut ke langkah 3, lalu:
git commit -m "feat(home): add temporary logout button"
```

### 3. Push ke branch kamu
```bash
git push origin adella/homepage-feed
```

### 4. Buat Pull Request di GitHub
1. Buka **github.com/IniRalfi/ppwl-clone-instagram**
2. Klik **"Compare & pull request"** yang muncul otomatis
3. **Base branch:** `dev` ← PASTIKAN INI! (bukan `main`)
4. **Title PR:** `feat: HomePage feed & PostCard component (Adella)`
5. Klik **"Create pull request"**
6. Kabari Rafli di grup — dia yang review dan merge

> ⚠️ **JANGAN merge sendiri ke `main`!**

---

## ✅ Cara Test Komponen

### Test PostCard
1. Jalankan `bun dev` dari folder root
2. Login di `http://localhost:5173/login`
3. Setelah login → otomatis redirect ke `/` (HomePage)
4. **Yang harus muncul:**
   - Daftar postingan dari backend
   - Setiap postingan ada: username, gambar (kalau ada), tombol like, caption
5. **Test like:**
   - Klik tombol ❤️ → ikon jadi merah, angka like bertambah 1
   - Klik lagi → ikon balik putih, angka berkurang 1

### Test HomePage
- Kalau postingan kosong → muncul teks "Belum ada postingan."
- Kalau API gagal → muncul pesan error berwarna merah
- Kalau loading → muncul teks berkedip "Memuat postingan..."

### Kalau Ada Error di Terminal atau Browser
1. Copy seluruh pesan error (teks merah)
2. Paste ke AI bersama kode file yang bermasalah
3. Ketik: _"Ini error yang muncul di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: `import type { Post }` error "module not found"?**
A: Jalankan `bun install` dari folder **root** monorepo, bukan dari dalam `frontend/`.

**Q: Gambar tidak muncul, `imageUrl` kosong?**
A: Database mungkin belum ada data dengan gambar. Normal — komponen sudah handle kasus `imageUrl: null` dengan tidak menampilkan `<img>`.

**Q: Warna `text-ig-badge` atau `fill-ig-badge` tidak jalan?**
A: Pastikan kamu tidak salah tulis class-nya. Tailwind v4 menggunakan CSS variable — class `fill-ig-badge` harus ada di `@theme` di `index.css`.
