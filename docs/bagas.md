# 📋 Task: Bagas — Comment System (CommentItem & CommentForm)

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
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol aktif, link) |
| `text-ig-badge` | `rgb(255, 48, 64)` | Merah (error, batas komentar) |
| `border-neutral-800` | abu gelap | Border / divider |

---

## 📁 File yang Kamu Kerjakan

```
frontend/src/
└── components/
    └── comment/
        ├── CommentItem.tsx    ← Tampilan satu komentar (sudah ada, mungkin masih kosong)
        └── CommentForm.tsx    ← Form input tulis komentar (buat baru)
```

> ⚠️ **PENTING:** `pages/PostDetailPage.tsx` **sudah ada dan sudah mengimpor `CommentItem`**.
> Kalau `CommentItem.tsx` masih kosong, halaman `/posts/:id` akan error (crash).
> Tugas utamamu adalah **mengisi `CommentItem.tsx`** agar halaman itu bisa berjalan.

---

## 🔗 Tipe Data — Salin Langsung, Jangan Import dari Mana-mana

Gunakan tipe data ini langsung di file kamu (salin ke dalam file yang membutuhkannya):

```typescript
// Salin ke dalam CommentItem.tsx dan CommentForm.tsx
interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  postId: string;
  parentId: string | null;   // null = komentar utama, isi = ini reply
  replies?: Comment[];
  createdAt: string;
}
```

---

## 🌐 API yang Sudah Siap Digunakan

Backend sudah jalan di cloud. **Tidak perlu install atau jalankan backend apapun.**

**Endpoint yang digunakan:**
```
GET  {VITE_API_URL}/comments?postId=ID    → Ambil komentar suatu post
POST {VITE_API_URL}/comments              → Kirim komentar baru
```

**Cara kirim komentar baru (body JSON):**
```typescript
// POST /comments
{
  postId: "id-postingan",
  content: "isi komentar",
  authorId: "id-user-yang-login"
}
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `CommentItem.tsx` (Wajib — Bikin Dulu!)

Ini komponen yang **sudah dipakai oleh `PostDetailPage.tsx`**. Kalau belum dibuat, halaman akan error.

**Props yang HARUS diterima** (sudah dipanggil di PostDetailPage seperti ini):
```tsx
<CommentItem
  comment={comment}                         // Data komentar
  currentUserId={user?.id || ""}            // ID user yang sedang login
  onReplyClick={handleReplyClick}           // Fungsi dipanggil saat klik "Balas"
/>
```

**Struktur lengkap:**
```typescript
// frontend/src/components/comment/CommentItem.tsx

interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  postId: string;
  parentId: string | null;
  replies?: Comment[];
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReplyClick: (parentId: string, username: string) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, currentUserId, onReplyClick, isReply = false }: CommentItemProps) {
  const isOwn = comment.authorId === currentUserId;

  // Format waktu singkat (contoh: "5m", "2j", "3h")
  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return "Baru";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}j`;
    return `${days}h`;
  };

  return (
    <div className={`flex gap-2.5 py-2 ${isReply ? "ml-9" : ""}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.author.avatarUrl ? (
          <img src={comment.author.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Konten */}
      <div className="flex-1">
        <p className="text-sm text-ig-text leading-relaxed">
          <span className="font-semibold mr-1">{comment.author.username}</span>
          {comment.content}
        </p>

        {/* Waktu + Tombol Balas */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-neutral-500 text-xs">{formatTime(comment.createdAt)}</span>
          {!isReply && (
            <button
              onClick={() => onReplyClick(comment.id, comment.author.username)}
              className="text-neutral-500 text-xs font-semibold hover:text-ig-text transition-colors"
            >
              Balas
            </button>
          )}
          {isOwn && <span className="text-neutral-600 text-xs">· Kamu</span>}
        </div>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onReplyClick={onReplyClick}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### ✅ Langkah 2 — `CommentForm.tsx` (Standalone Input Form)

Form input komentar yang *reusable* — bisa dipakai di halaman lain kalau diperlukan.

**Spesifikasi:**
- Tombol Kirim hanya aktif kalau teks tidak kosong
- Ada mode "Balas @username" — input menunjukkan siapa yang sedang dibalas
- `isDisabled` true → input dinonaktifkan

```typescript
// frontend/src/components/comment/CommentForm.tsx
import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isDisabled?: boolean;
  replyTarget?: string | null;
  onCancelReply?: () => void;
  placeholder?: string;
}

export function CommentForm({
  onSubmit,
  isDisabled = false,
  replyTarget = null,
  onCancelReply,
  placeholder = "Tambahkan komentar...",
}: CommentFormProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = value.trim().length > 0 && !isDisabled && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(value.trim());
      setValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-neutral-800 px-4 py-3">
      {/* Label saat mode reply */}
      {replyTarget && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-400">
            Membalas <span className="font-semibold text-ig-text">@{replyTarget}</span>
          </span>
          <button onClick={onCancelReply} className="text-xs text-neutral-400 hover:text-ig-text">
            Batal
          </button>
        </div>
      )}

      {/* Input + Tombol Kirim */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={isDisabled || isSubmitting}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-ig-text text-sm outline-none placeholder:text-neutral-500 border-b border-neutral-700 pb-1 focus:border-neutral-400 transition-colors disabled:opacity-40"
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="text-sm font-semibold text-ig-primary disabled:opacity-30 transition-opacity"
        >
          {isSubmitting ? "..." : "Kirim"}
        </button>
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
git checkout -b bagas/comment-system
```

### 2. Commit setiap selesai 1 langkah
```bash
git add .
git commit -m "feat(comment): add CommentItem component"
git commit -m "feat(comment): add CommentForm component"
```

### 3. Push ke branch kamu
```bash
git push origin bagas/comment-system
```

### 4. Buat Pull Request di GitHub
1. Buka **github.com/IniRalfi/ppwl-clone-instagram**
2. Klik **"Compare & pull request"** yang muncul otomatis
3. **Base branch:** `dev` ← PASTIKAN INI! (bukan `main`)
4. **Title PR:** `feat: Comment system — CommentItem & CommentForm (Bagas)`
5. Klik **"Create pull request"**
6. Kabari Rafli di grup — dia yang review dan merge

> ⚠️ **JANGAN merge sendiri ke `main`!**

---

## ✅ Cara Test

1. Jalankan `bun dev` dari folder `frontend/`
2. Login → navigasi ke halaman beranda → klik ikon komentar di postingan mana saja
3. **Yang harus muncul:**
   - Daftar komentar dengan avatar, username, isi komentar, waktu
   - Tombol "Balas" di setiap komentar
   - Klik "Balas" → input bar berubah jadi "Membalas @username"

### Kalau Ada Error
1. Copy seluruh pesan error (teks merah di terminal)
2. Paste ke AI bersama kode file yang error
3. Ketik: _"Ini error di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: Harus install database atau backend dulu?**
A: **TIDAK PERLU.** Backend dan database sudah jalan di cloud. Kamu cukup jalankan `bun dev` dari folder `frontend/`.

**Q: Halaman `/posts/:id` masih error setelah saya buat `CommentItem.tsx`?**
A: Pastikan kamu **export** fungsinya dengan benar: `export function CommentItem(...)` bukan `export default`.

**Q: Import error "module not found"?**
A: Pastikan tidak ada import dari `shared/` atau `backend/`. Tipe data sudah ditulis langsung di file ini — salin saja ke dalam file kamu.
