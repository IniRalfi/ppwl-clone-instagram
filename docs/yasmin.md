# 📋 Task: Yasmin — Create Post, Like Button & usePosts Hook

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
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol aktif) |
| `text-ig-badge` | `rgb(255, 48, 64)` | Merah IG — untuk like yang aktif |
| `border-neutral-800` | abu gelap | Border card |

---

## 📁 File yang Kamu Kerjakan

```
frontend/src/
├── components/
│   └── common/
│       └── LikeButton.tsx      ← Tombol like reusable (❤️)
├── hooks/
│   └── usePosts.ts             ← Custom hook untuk ambil data posts dari API
└── pages/
    └── CreatePostPage.tsx      ← Halaman form buat postingan baru
```

> ℹ️ `pages/PostDetailPage.tsx` sudah dikerjakan oleh teammate — **jangan diedit**.
> ℹ️ `services/api.client.ts` sudah tersedia — **langsung pakai, jangan buat ulang**.

---

## 🔗 Tipe Data yang Tersedia

**Jangan buat tipe data sendiri.** Import dari path berikut:

```typescript
// Dari pages/ (3 level ke root):
import type { Post, CreatePostDto } from "../../../shared/src/types/post";

// Dari components/common/ (4 level ke root):
import type { Post } from "../../../../shared/src/types/post";

// Dari hooks/ (3 level ke root):
import type { Post, CreatePostDto } from "../../../shared/src/types/post";
```

**Bentuk tipe data:**
```typescript
interface Post {
  id: string;
  content: string;           // Caption
  imageUrl: string | null;   // URL gambar
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePostDto {
  content: string;   // Caption yang ditulis user
  imageUrl?: string; // URL gambar (setelah diupload)
}
```

---

## 🌐 API Client yang Sudah Tersedia

File `services/api.client.ts` sudah ada. Langsung import:

```typescript
import { apiClient, ApiError } from "../services/api.client";
// Gunakan:
// apiClient.get<T>(path)              → GET request
// apiClient.post<T>(path, body)       → POST request
// apiClient.delete<T>(path)           → DELETE request
```

**Cara ambil token dari store** (untuk request yang butuh auth):
```typescript
import { useAuthStore } from "../store/auth.store";
const { token } = useAuthStore();
```

---

## 🌐 API Endpoints

```
Base URL: import.meta.env.VITE_API_URL
→ di local: http://localhost:3000
→ di production: https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws
```

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/posts` | Ambil semua postingan |
| POST | `/posts` | Buat postingan baru (butuh auth) |

**Response GET /posts:**
```json
{ "data": [ { "id": "...", "content": "...", "imageUrl": null, ... } ] }
```

**Request POST /posts (body JSON):**
```json
{ "content": "Caption postingan", "imageUrl": "https://..." }
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `LikeButton.tsx` (Tombol Like Reusable)

Komponen tombol ❤️ yang bisa dipakai di `PostCard` maupun `PostDetailPage`.

**Spesifikasi:**
- State: `isLiked` (boolean) dan `count` (number)
- Saat diklik: ikon jadi merah + count +1
- Diklik lagi: ikon balik putih + count -1
- Animasi: scale saat diklik (`active:scale-90`)

**Nama props & struktur:**
```typescript
// frontend/src/components/common/LikeButton.tsx
import { useState } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  initialCount: number;        // Jumlah like awal dari data API
  initialIsLiked?: boolean;    // Apakah sudah di-like user ini (default: false)
  onToggle?: (isLiked: boolean) => void; // Callback opsional ke parent
}

export function LikeButton({
  initialCount,
  initialIsLiked = false,
  onToggle,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [count, setCount] = useState(initialCount);

  const handleClick = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setCount((prev) => newIsLiked ? prev + 1 : prev - 1);
    onToggle?.(newIsLiked); // Panggil callback jika ada
    // TODO Fase berikutnya: hit API like/unlike
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleClick}
        aria-label={isLiked ? "Hapus like" : "Like postingan"}
        className="transition-transform active:scale-90"
      >
        <Heart
          className={`w-6 h-6 transition-colors ${
            isLiked
              ? "fill-ig-badge text-ig-badge"  // Merah saat di-like
              : "text-ig-text"                  // Putih/normal
          }`}
        />
      </button>
      <span className="text-ig-text text-sm font-semibold">{count}</span>
    </div>
  );
}
```

**Cara pakai di PostCard (referensi Adella):**
```typescript
import { LikeButton } from "../common/LikeButton";

// Di dalam PostCard:
<LikeButton
  initialCount={post._count?.likes ?? 0}
  initialIsLiked={post.isLiked ?? false}
/>
```

---

### ✅ Langkah 2 — `usePosts.ts` (Custom Hook Fetch Posts)

Hook yang dipakai halaman `HomePage` untuk ambil data posts dari API.

**Nama state & struktur:**
```typescript
// frontend/src/hooks/usePosts.ts
import { useEffect, useState } from "react";
import type { Post } from "../../../shared/src/types/post";
import { apiClient, ApiError } from "../services/api.client";

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void; // Fungsi untuk refresh data manual
}

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await apiClient.get<{ data: Post[] }>("/posts");
      setPosts(json.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else {
        setError("Gagal memuat postingan. Coba lagi nanti.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, isLoading, error, refetch: fetchPosts };
}
```

**Cara pakai di HomePage (referensi Adella):**
```typescript
import { usePosts } from "../hooks/usePosts";

export default function HomePage() {
  const { posts, isLoading, error, refetch } = usePosts();
  // ...
}
```

---

### ✅ Langkah 3 — `CreatePostPage.tsx` (Form Buat Postingan)

Halaman form untuk upload foto + caption.

**Spesifikasi validasi (wajib dari dosen):**
1. File yang dipilih **harus gambar** (accept `.jpg`, `.jpeg`, `.png`, `.gif`) — video tidak boleh masuk
2. Jika file bukan gambar → tampilkan pesan error merah di bawah input
3. Caption tidak boleh kosong
4. Kalau backend mengembalikan error limit (lebih dari 2 post) → tampilkan pesan error dari API

**Nama state & struktur:**
```typescript
// frontend/src/pages/CreatePostPage.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { ApiError } from "../services/api.client";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validasi file saat dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Cek apakah tipe file diperbolehkan
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("❌ File harus berupa gambar (.jpg, .png, .gif). Video tidak diperbolehkan.");
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); // Preview gambar
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;
    if (fileError) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Saat ini kirim tanpa imageUrl dulu (upload S3 dikerjakan bersama Rafli)
      const body = {
        content: caption.trim(),
        imageUrl: previewUrl ?? undefined,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Tangkap error limit dari backend
        setSubmitError(data.message ?? "Gagal membuat postingan.");
        return;
      }

      // Berhasil → balik ke beranda
      navigate("/");
    } catch (err) {
      setSubmitError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ig-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <button
          onClick={() => navigate("/")}
          className="text-ig-text text-sm"
        >
          Batal
        </button>
        <h1 className="text-ig-text font-semibold text-sm">Postingan Baru</h1>
        <button
          type="submit"
          form="create-post-form"
          disabled={isSubmitting || !caption.trim() || !!fileError}
          className="text-ig-primary text-sm font-semibold disabled:opacity-40"
        >
          {isSubmitting ? "Mengirim..." : "Bagikan"}
        </button>
      </div>

      {/* Form */}
      <form id="create-post-form" onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Preview Gambar */}
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-[400px] object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-neutral-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-neutral-500 transition-colors"
          >
            <span className="text-neutral-400 text-2xl mb-2">📷</span>
            <span className="text-neutral-400 text-sm">Ketuk untuk memilih foto</span>
            <span className="text-neutral-600 text-xs mt-1">JPG, PNG, GIF diperbolehkan</span>
          </div>
        )}

        {/* Input file — tersembunyi */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Error file */}
        {fileError && (
          <p className="text-ig-badge text-sm">{fileError}</p>
        )}

        {/* Input Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Tulis caption..."
          rows={4}
          className="w-full bg-transparent text-ig-text placeholder:text-neutral-500 text-sm resize-none outline-none border-b border-neutral-800 pb-2"
          maxLength={500}
        />
        <p className="text-neutral-600 text-xs text-right">{caption.length}/500</p>

        {/* Error submit (dari API) */}
        {submitError && (
          <p className="text-ig-badge text-sm bg-ig-badge/10 px-3 py-2 rounded-lg">
            {submitError}
          </p>
        )}
      </form>
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
git checkout -b yasmin/create-post-likebutton
```

### 2. Commit setiap selesai 1 langkah
```bash
git add .
git commit -m "feat(like): add reusable LikeButton component"
# Lanjut langkah 2:
git commit -m "feat(hooks): add usePosts custom hook"
# Lanjut langkah 3:
git commit -m "feat(post): add CreatePostPage with image validation"
```

### 3. Push ke branch kamu
```bash
git push origin yasmin/create-post-likebutton
```

### 4. Buat Pull Request di GitHub
1. Buka **github.com/IniRalfi/ppwl-clone-instagram**
2. Klik **"Compare & pull request"** yang muncul otomatis
3. **Base branch:** `dev` ← PASTIKAN INI! (bukan `main`)
4. **Title PR:** `feat: LikeButton, usePosts hook & CreatePostPage (Yasmin)`
5. Klik **"Create pull request"**
6. Kabari Rafli di grup — dia yang review dan merge

> ⚠️ **JANGAN merge sendiri ke `main`!**

---

## ✅ Cara Test Komponen

### Test LikeButton
1. Sementara, tambahkan sementara di `HomePage.tsx`:
   ```tsx
   import { LikeButton } from "../components/common/LikeButton";
   <LikeButton initialCount={42} initialIsLiked={false} />
   ```
2. Cek di browser: klik ikon — harus jadi merah dan angka +1
3. Klik lagi — harus balik putih dan angka -1
4. Kalau sudah oke, hapus kode test dari HomePage

### Test CreatePostPage
1. Login → buka `http://localhost:5173/create`
2. **Test validasi file:**
   - Coba pilih file `.mp4` atau `.pdf` → harus muncul pesan error merah
   - Pilih file `.jpg` → harus muncul preview gambar
3. **Test submit:**
   - Isi caption → klik "Bagikan" → harus redirect ke `/`
4. **Test tombol Batal:** Klik Batal → harus balik ke `/`

### Test usePosts Hook
1. Buka HomePage dan ganti fetch manual dengan `usePosts()`:
   ```tsx
   const { posts, isLoading, error } = usePosts();
   ```
2. Postingan harus tetap muncul seperti sebelumnya

### Kalau Ada Error di Terminal
1. Copy seluruh pesan error
2. Paste ke AI bersama kode file yang error
3. Ketik: _"Ini error di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: `fill-ig-badge` tidak berfungsi (ikon tidak jadi merah)?**
A: Pastikan class ditulis `fill-ig-badge text-ig-badge` keduanya sekaligus. Tailwind v4 butuh `fill-*` untuk mengisi warna SVG dan `text-*` untuk outline-nya.

**Q: Import `Post` error "module not found"?**
A: Jalankan `bun install` dari folder **root** monorepo (bukan dari dalam `frontend/`).

**Q: Form bisa submit tapi tidak ada gambar?**
A: Normal! Upload gambar ke S3 akan dikerjakan bersama Rafli di fase berikutnya. Saat ini form cukup kirim `content` saja.

**Q: Error 403 saat POST /posts?**
A: Endpoint `/posts` masih GET only (backend belum diupdate untuk POST). Kabari Rafli — dia yang update backend-nya.
