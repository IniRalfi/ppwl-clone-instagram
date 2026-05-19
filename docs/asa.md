# 📋 Task: Salsabila — Layout & Notifikasi

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

Proyek ini punya warna kustom sendiri. **Jangan gunakan warna Tailwind biasa** seperti `bg-gray-900` atau `text-white`. Gunakan variabel tema berikut:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam IG) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background card / panel |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol, link) |
| `text-ig-badge` | `rgb(255, 48, 64)` | Merah (badge notif) |
| `bg-ig-badge` | `rgb(255, 48, 64)` | Background badge merah |

**Font:** Sudah di-set di `globals.css`. Tidak perlu install font baru.

---

## 📁 File yang Kamu Kerjakan

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        ← Navigasi kiri (tampil di desktop/laptop)
│   │   ├── BottomNav.tsx      ← Navigasi bawah (tampil di HP)
│   │   └── MainLayout.tsx     ← Pembungkus utama — gabungkan keduanya di sini
│   └── common/
│       └── ThemeToggle.tsx    ← Sudah jadi! Tinggal dipakai di Sidebar
└── pages/
    └── NotificationPage.tsx   ← Halaman daftar notifikasi
```

---

## 🔗 Tipe Data yang Tersedia

File ini sudah ada di proyek, **import dari sini, jangan buat ulang:**

```typescript
// Import dari: "../../../shared/src/types/notification"
export type NotificationType = "like" | "comment" | "reply";

export interface Notification {
  id: string;
  type: NotificationType;    // "like" | "comment" | "reply"
  message: string;           // Contoh: "Adella menyukai postinganmu"
  isRead: boolean;           // true = sudah dibaca, false = belum
  refId: string | null;      // ID postingan yang terkait (boleh null)
  receiverId: string;
  createdAt: string;         // Format ISO string, ex: "2026-05-19T07:30:00Z"
}
```

**Import auth store** untuk tahu siapa user yang login:
```typescript
import { useAuthStore } from "../store/auth.store";
// Gunakan: const { user, token } = useAuthStore();
```

---

## 🌐 API Endpoint

Semua request ke URL berikut (sudah di-set di `.env.development`):

```
Base URL: import.meta.env.VITE_API_URL
→ di local: http://localhost:3000
→ di production: https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws
```

**Endpoint Notifikasi:**
```
GET {VITE_API_URL}/notifications
Response: { data: Notification[] }
```

**Contoh fetch:**
```typescript
const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`);
const json = await res.json();
const notifications: Notification[] = json.data;
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `Sidebar.tsx` (Navigasi Kiri Desktop)

Buat komponen navigasi kiri persis seperti Instagram di desktop.

**Spesifikasi:**
- Gunakan library ikon: `lucide-react` (sudah terinstall)
- Menu yang ada (urut dari atas):
  1. **Logo** Instagram (teks "Instagram" dengan font `font-["Instagram_Sans_Condensed"]`)
  2. **Home** → ikon `Home`, navigasi ke `/`
  3. **Search** → ikon `Search` (tidak perlu fungsional dulu, cukup tampil)
  4. **Create** → ikon `PlusSquare`, navigasi ke `/create`
  5. **Notifications** → ikon `Heart`, navigasi ke `/notifications`
  6. **Profile** → ikon `User`, navigasi ke `/profile`
  7. **Logout** → ikon `LogOut`, di paling bawah

**Store tema sudah tersedia** — kamu hanya perlu import komponen toggle:
```typescript
// ThemeToggle sudah jadi di: components/common/ThemeToggle.tsx
// Tinggal import dan taruh di Sidebar
import { ThemeToggle } from "../common/ThemeToggle";
```

**Nama variabel & struktur yang harus dipakai:**
```typescript
// frontend/src/components/layout/Sidebar.tsx
import { Home, Search, PlusSquare, Heart, User, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { ThemeToggle } from "../common/ThemeToggle";

const navItems = [
  { icon: Home,       label: "Beranda",    to: "/" },
  { icon: Search,     label: "Cari",       to: "/search" },
  { icon: PlusSquare, label: "Buat Post",  to: "/create" },
  { icon: Heart,      label: "Notifikasi", to: "/notifications" },
  { icon: User,       label: "Profil",     to: "/profile" },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <aside className="flex flex-col h-screen w-[72px] md:w-[244px] bg-ig-background border-r border-neutral-800 px-3 py-6">
      {/* Logo */}
      <span className="text-ig-text font-semibold text-xl mb-8 px-2 hidden md:block">Instagram</span>
      
      {/* Menu navigasi */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-ig-secondary-bg ${
                isActive ? "text-ig-text font-semibold" : "text-neutral-400"
              }`
            }
          >
            <Icon className="w-6 h-6 flex-shrink-0" />
            <span className="hidden md:block text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bagian bawah: ThemeToggle + Logout */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <ThemeToggle />
          <span className="hidden md:block text-ig-text text-sm">Tema</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-ig-secondary-bg text-neutral-400 transition-colors w-full"
        >
          <LogOut className="w-6 h-6 flex-shrink-0" />
          <span className="hidden md:block text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
```

**Styling wajib:**
- Lebar sidebar: `w-[72px] md:w-[244px]` (sempit di tablet, lebar di desktop)
- Background: `bg-ig-background`
- Border kanan: `border-r border-neutral-800`
- Item aktif (NavLink active): teks/ikon jadi `text-ig-text font-semibold`
- Hover: `hover:bg-ig-secondary-bg rounded-lg`

---

### ✅ Langkah 2 — `BottomNav.tsx` (Navigasi Bawah HP)

Komponen yang **hanya muncul di HP** (layar kecil).

**Spesifikasi:**
- Posisi: `fixed bottom-0 left-0 right-0` (nempel di bawah layar)
- Background: `bg-ig-background border-t border-neutral-800`
- Isi: 5 ikon (Home, Search, PlusSquare, Heart, User) — **tanpa teks label**
- Ikon aktif: `text-ig-text`, tidak aktif: `text-neutral-500`

**Nama variabel & struktur:**
```typescript
// frontend/src/components/layout/BottomNav.tsx
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { NavLink } from "react-router-dom";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ig-background border-t border-neutral-800 flex md:hidden">
      {/* 5 NavLink di sini, masing-masing flex-1 */}
    </nav>
  );
}
```

---

### ✅ Langkah 3 — `MainLayout.tsx` (Pembungkus Utama)

Ini yang **paling penting**. Tugasnya menggabungkan Sidebar dan BottomNav dengan konten halaman.

**Logika responsive:**
- **Di desktop (md ke atas):** tampilkan `Sidebar` di kiri, sembunyikan `BottomNav`
- **Di HP (di bawah md):** sembunyikan `Sidebar`, tampilkan `BottomNav` di bawah

**Struktur layout:**
```typescript
// frontend/src/components/layout/MainLayout.tsx
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ig-background">
      {/* Sidebar: tampil di desktop, tersembunyi di mobile */}
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* BottomNav: tampil di mobile, tersembunyi di desktop */}
      <BottomNav />
    </div>
  );
}
```

> **Catatan `pb-16`:** Agar konten tidak tertutup BottomNav di HP.

---

### ✅ Langkah 4 — Pasang `MainLayout` ke `App.tsx`

Setelah `MainLayout.tsx` jadi, **kasih tahu Rafli** agar dia update `App.tsx`. Tapi kalau mau coba sendiri, ini caranya:

```typescript
// Tambahkan import di App.tsx:
import { MainLayout } from "./components/layout/MainLayout";

// Bungkus semua ProtectedRoute dengan MainLayout:
<Route path="/" element={
  <ProtectedRoute>
    <MainLayout>
      <HomePage />
    </MainLayout>
  </ProtectedRoute>
} />
```

> ⚠️ **Halaman Login dan Register TIDAK perlu dibungkus MainLayout** — mereka halaman publik.

---

### ✅ Langkah 5 — `NotificationPage.tsx`

Halaman daftar notifikasi.

**Spesifikasi tampilan per item notifikasi:**
- Kiri: Avatar bulat (inisial nama, jika tidak ada foto)
- Tengah: Teks `message` dari notifikasi + waktu (format: "2 jam lalu")
- Kanan: Titik biru kecil jika `isRead === false`

**Format waktu:** Gunakan fungsi ini (sudah ada di shared):
```typescript
import { formatRelativeTime } from "../../../shared/src/utils/date";
// Output singkat — contoh:
// "30d" = 30 detik lalu
// "5m"  = 5 menit lalu
// "2j"  = 2 jam lalu
// "3h"  = 3 hari lalu
```

**Nama state & struktur:**
```typescript
// frontend/src/pages/NotificationPage.tsx
import { useEffect, useState } from "react";
import type { Notification } from "../../../shared/src/types/notification";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`);
        const json = await res.json();
        setNotifications(json.data);
      } catch (error) {
        console.error("Gagal memuat notifikasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) return <p className="text-ig-text text-center py-8">Memuat...</p>;

  return (
    <div className="max-w-xl mx-auto px-4 pt-6">
      <h1 className="text-ig-text text-lg font-semibold mb-4">Notifikasi</h1>
      {notifications.length === 0 ? (
        <p className="text-neutral-500 text-center">Belum ada notifikasi.</p>
      ) : (
        <ul className="divide-y divide-neutral-800">
          {notifications.map((notif) => (
            <NotificationItem key={notif.id} notif={notif} />
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Komponen `NotificationItem`** (buat di file yang sama, di bawah):
```typescript
function NotificationItem({ notif }: { notif: Notification }) {
  return (
    <li className="flex items-center gap-3 py-3">
      {/* Avatar bulat dengan inisial */}
      <div className="w-10 h-10 rounded-full bg-ig-secondary-bg flex items-center justify-center text-ig-text text-sm font-semibold flex-shrink-0">
        N
      </div>
      {/* Pesan notifikasi */}
      <div className="flex-1">
        <p className="text-ig-text text-sm">{notif.message}</p>
        <p className="text-neutral-500 text-xs mt-0.5">{notif.createdAt}</p>
      </div>
      {/* Titik biru jika belum dibaca */}
      {!notif.isRead && (
        <div className="w-2 h-2 rounded-full bg-ig-primary flex-shrink-0" />
      )}
    </li>
  );
}
```

---

## 🐙 Git Workflow — Langkah Demi Langkah

### 1. Sebelum mulai ngoding — ambil kode terbaru
```bash
git checkout dev
git pull origin dev
git checkout -b salsabila/layout-notifikasi
```

### 2. Sering commit (setiap selesai 1 langkah)
```bash
git add .
git commit -m "feat(layout): add Sidebar component"
# atau
git commit -m "feat(layout): add BottomNav component"
# atau
git commit -m "feat(layout): add MainLayout responsive wrapper"
# atau
git commit -m "feat(notifications): add NotificationPage with API fetch"
```

### 3. Push ke branch kamu
```bash
git push origin salsabila/layout-notifikasi
```

### 4. Buat Pull Request di GitHub
1. Buka **github.com/IniRalfi/ppwl-clone-instagram**
2. Klik tombol **"Compare & pull request"** yang muncul
3. **Base branch:** `dev` (bukan `main`!)
4. **Title PR:** `feat: Layout navigasi & halaman notifikasi (Salsabila)`
5. Klik **"Create pull request"**
6. Kabari Rafli di grup — dia yang akan review dan merge

> ⚠️ **JANGAN merge sendiri ke `main`!** Selalu ke `dev` dulu.

---

## ✅ Cara Test Komponen

### Test Sidebar & BottomNav
1. Jalankan `bun dev` dari folder root
2. Buka `http://localhost:5173`
3. Login dengan akun yang sudah ada
4. Coba resize browser:
   - **Lebar > 768px** → Sidebar harus muncul di kiri, BottomNav sembunyi
   - **Lebar < 768px** → Sidebar sembunyi, BottomNav muncul di bawah
5. Klik setiap item navigasi — halaman harus berpindah

### Test NotificationPage
1. Buka `http://localhost:5173/notifications`
2. Harus muncul daftar notifikasi dari API
3. Kalau API kosong, tampilkan teks "Belum ada notifikasi."
4. Kalau `isRead: false`, harus ada titik biru di kanan

### Kalau Ada Error di Terminal
1. Copy seluruh pesan error (teks merah di terminal)
2. Paste ke AI, sertakan juga kode file yang error
3. Ketik: _"Ini error yang muncul, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: Saya tidak bisa import dari `../../../shared/src/types/...`, error module not found?**
A: Pastikan kamu menjalankan `bun install` dari folder **root** monorepo, bukan dari dalam `frontend/`.

**Q: Warna `bg-ig-background` tidak berfungsi?**
A: Pastikan kamu import Tailwind di `index.css` dengan `@import "tailwindcss"` (bukan `@tailwind base`).

**Q: Ikon dari lucide-react tidak muncul?**
A: Pastikan nama ikon benar (case-sensitive). Cek di [lucide.dev](https://lucide.dev) untuk nama yang tepat.
