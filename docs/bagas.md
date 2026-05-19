# 📋 Task: Bagas — Comment System (CommentItem & CommentForm)

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
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol aktif, link) |
| `text-ig-badge` | `rgb(255, 48, 64)` | Merah (error, batas komentar) |
| `border-neutral-800` | abu gelap | Border / divider |

---

## 📁 File yang Kamu Kerjakan

```
frontend/src/
└── components/
    └── comment/
        ├── CommentItem.tsx    ← Tampilan satu komentar (+ replies bersarang)
        └── CommentForm.tsx    ← Form input tulis komentar (opsional, bisa dipakai ulang)
```

> ⚠️ **PENTING:** `pages/PostDetailPage.tsx` **sudah ada dan sudah mengimpor `CommentItem`**.
> Kalau `CommentItem.tsx` masih kosong, halaman `/posts/p1` akan error (crash).
> Tugas utamamu adalah **mengisi `CommentItem.tsx`** agar halaman itu bisa berjalan.

> ℹ️ File-file yang sudah ada dan **JANGAN diedit**:
> - `pages/PostDetailPage.tsx` — sudah lengkap dengan UI comment bar
> - `services/comment.service.ts` — sudah lengkap dengan semua fungsi API

---

## 🔗 Tipe Data yang Tersedia

```typescript
// Dari components/comment/ → path ke shared:
// "../../../../shared/src/types/comment"  (4 level ke root)

export interface Comment {
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
  replies?: Comment[];       // Array reply (bisa nested)
  createdAt: string;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;  // Isi kalau ini reply
}
```

---

## 🌐 API & Service yang Sudah Tersedia

**Jangan buat ulang** — import dari `services/comment.service.ts`:

```typescript
import {
  getCommentsByPost,   // GET /posts/:postId/comments → Comment[]
  createComment,       // POST /posts/:postId/comments → Comment
  deleteComment,       // DELETE /comments/:commentId → void
  countUserComments,   // Helper hitung komentar user (untuk limit 5)
} from "../../services/comment.service";
```

**API Endpoints:**
```
GET  {VITE_API_URL}/posts/:postId/comments   → Ambil komentar suatu post
POST {VITE_API_URL}/posts/:postId/comments   → Kirim komentar baru
DELETE {VITE_API_URL}/comments/:commentId    → Hapus komentar sendiri
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `CommentItem.tsx` (Wajib — Bikin Dulu!)

Ini komponen yang **sudah dipakai oleh `PostDetailPage.tsx`**. Kalau belum dibuat, halaman akan error.

**Props yang HARUS diterima** (sudah dipanggil di PostDetailPage seperti ini):
```tsx
<CommentItem
  comment={comment}          // Data komentar
  currentUserId={user.id}    // ID user yang sedang login
  onReplyClick={handleReplyClick}  // Fungsi dipanggil saat klik "Balas"
/>
```

**Nama props & struktur:**
```typescript
// frontend/src/components/comment/CommentItem.tsx
import type { Comment } from "../../../../shared/src/types/comment";
import { formatRelativeTime } from "../../../../shared/src/utils/date";

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  onReplyClick: (parentId: string, username: string) => void;
  depth?: number; // Level kedalaman reply (default: 0, max: 2)
}

export function CommentItem({
  comment,
  currentUserId,
  onReplyClick,
  depth = 0,
}: CommentItemProps) {
  const isOwn = comment.authorId === currentUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`py-2 ${depth > 0 ? "ml-8 border-l border-neutral-800 pl-3" : ""}`}>
      {/* Baris utama: avatar + konten komentar */}
      <div className="flex gap-3">
        {/* Avatar bulat */}
        <div className="w-8 h-8 rounded-full bg-ig-secondary-bg flex items-center justify-center text-ig-text text-xs font-semibold flex-shrink-0">
          {comment.author.name.charAt(0).toUpperCase()}
        </div>

        {/* Konten */}
        <div className="flex-1">
          {/* Username + isi komentar */}
          <p className="text-ig-text text-sm">
            <span className="font-semibold mr-1">{comment.author.username}</span>
            {comment.content}
          </p>

          {/* Waktu + tombol Balas */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-neutral-500 text-xs">
              {formatRelativeTime(comment.createdAt)}
            </span>

            {/* Tombol Balas — hanya tampil sampai depth 1 (biar tidak terlalu dalam) */}
            {depth < 2 && (
              <button
                onClick={() => onReplyClick(comment.id, comment.author.username)}
                className="text-neutral-500 text-xs font-semibold hover:text-ig-text transition-colors"
              >
                Balas
              </button>
            )}

            {/* Label komentar sendiri */}
            {isOwn && (
              <span className="text-neutral-600 text-xs">· Kamu</span>
            )}
          </div>
        </div>
      </div>

      {/* Render replies secara rekursif */}
      {hasReplies && (
        <div className="mt-1">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReplyClick={onReplyClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Penjelasan logika penting:**
- `depth` dipakai untuk indentasi — reply level 1 masuk ke dalam, level 2 lebih dalam lagi
- `border-l pl-3` di kiri bikin garis vertikal khas reply di IG
- `formatRelativeTime` menghasilkan output singkat: `"5m"`, `"2j"`, `"3h"` dll
- Komponen rekursif: reply dari reply juga dirender dengan `CommentItem` lagi

---

### ✅ Langkah 2 — `CommentForm.tsx` (Standalone Input Form)

Form input komentar yang **reusable** — bisa dipakai di halaman lain kalau diperlukan.

> **Catatan:** `PostDetailPage.tsx` sudah punya input bar sendiri secara inline. `CommentForm.tsx`
> ini dibuat sebagai komponen bersih yang bisa dipakai di tempat lain (misalnya di PostCard).

**Spesifikasi:**
- Batas **5 komentar** per user — jika sudah 5, input dinonaktifkan + muncul pesan merah
- Ada mode "Balas @username" — input menunjukkan siapa yang sedang dibalas
- Tombol Kirim hanya aktif kalau teks tidak kosong

**Nama props & struktur:**
```typescript
// frontend/src/components/comment/CommentForm.tsx
import { useState } from "react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;  // Fungsi submit dari parent
  isDisabled?: boolean;         // True kalau sudah 5 komentar
  replyTarget?: string | null;  // Username yang sedang dibalas (null = komentar baru)
  onCancelReply?: () => void;   // Fungsi reset mode reply
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
          <button
            onClick={onCancelReply}
            className="text-xs text-neutral-400 hover:text-ig-text transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {/* Pesan batas komentar */}
      {isDisabled && (
        <p className="text-ig-badge text-xs mb-2">
          ⚠️ Batas 5 komentar sudah tercapai.
        </p>
      )}

      {/* Input + Tombol Kirim */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={isDisabled || isSubmitting}
          placeholder={isDisabled ? "Tidak bisa menambah komentar lagi." : placeholder}
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
git commit -m "feat(comment): add CommentItem component with nested replies"
# Lanjut langkah 2:
git commit -m "feat(comment): add reusable CommentForm component"
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

## ✅ Cara Test Komponen

### Test CommentItem
1. Jalankan `bun dev` dari root
2. Login → navigasi ke `http://localhost:5173/posts/p1`
3. **Yang harus muncul:**
   - Daftar komentar dummy (Andi, Budi, Citra, Deni)
   - Komentar yang punya reply → reply tampil menjorok ke dalam dengan garis vertikal kiri
   - Klik tombol "Balas" → input bar di bawah harus berubah jadi "Membalas @username"
4. **Yang TIDAK harus ada dulu:** koneksi ke API nyata (dummy data sudah cukup)

### Test CommentForm
1. Tambahkan sementara di `PostDetailPage.tsx` atau buat halaman test sementara:
   ```tsx
   import { CommentForm } from "../components/comment/CommentForm";
   <CommentForm
     onSubmit={async (text) => console.log("Submit:", text)}
     replyTarget="andi_dev"
     onCancelReply={() => console.log("Cancel")}
   />
   ```
2. Ketik teks → tekan Enter atau klik "Kirim" → console harus print teksnya
3. Coba `isDisabled={true}` → input harus nonaktif + muncul pesan merah

### Kalau Ada Error di Terminal
1. Copy seluruh pesan error
2. Paste ke AI bersama kode file yang error
3. Ketik: _"Ini error di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: Import `"../../../../shared/src/types/comment"` error?**
A: Jalankan `bun install` dari folder **root** monorepo (bukan dari dalam `frontend/`). Pastikan kamu di level `ppwl-clone-instagram/` sebelum jalankan perintah itu.

**Q: Halaman `/posts/p1` masih error setelah saya buat `CommentItem.tsx`?**
A: Pastikan kamu **export** fungsinya dengan benar: `export function CommentItem(...)` bukan `export default`. PostDetailPage menggunakan named import.

**Q: `formatRelativeTime` mengembalikan `"2j"` bukan `"2 jam lalu"` — apakah normal?**
A: Ya, itu memang outputnya. Format singkat: `d` = detik, `m` = menit, `j` = jam, `h` = hari, `mg` = minggu.

**Q: Komentar tidak bisa di-reply lebih dari 2 level — apakah normal?**
A: Ya, itu disengaja! Props `depth` membatasi reply di level 2 (`depth < 2`). Ini sesuai desain — IG aslinya juga tidak unlimited depth.
