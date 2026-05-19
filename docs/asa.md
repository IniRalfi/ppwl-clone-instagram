# 📋 Task: Salsabila — Layout & Notifikasi

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

Proyek ini punya warna kustom sendiri. **Jangan gunakan warna Tailwind biasa** seperti `bg-gray-900` atau `text-white`. Gunakan variabel tema berikut:

| Tailwind Class | Warna | Fungsi |
|---|---|---|
| `bg-ig-background` | `rgb(12, 16, 20)` | Background utama (hitam IG) |
| `bg-ig-secondary-bg` | `rgb(37, 41, 46)` | Background card / panel |
| `text-ig-text` | `rgb(245, 245, 245)` | Teks utama |
| `text-ig-primary` | `rgb(0, 149, 246)` | Biru IG (tombol, link) |
| `text-ig-badge` | `rgb(255, 48, 64)` | Merah (badge notif) |
| `bg-ig-badge` | `rgb(255, 48, 64)` | Background badge merah |

**Font:** Sudah di-set otomatis. Tidak perlu install font baru.

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

## 🔗 Tipe Data — Salin Langsung, Jangan Import dari Mana-mana

Gunakan tipe data ini langsung di file kamu (salin ke dalam file yang membutuhkannya):

```typescript
interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "welcome";
  message: string;
  isRead: boolean;
  receiverId: string;
  refId: string | null;
  createdAt: string;
}
```

---

## 🌐 API yang Sudah Siap Digunakan

Backend sudah jalan di cloud. **Tidak perlu install atau jalankan backend apapun.**

```typescript
// Cara ambil data notifikasi
const API_URL = import.meta.env.VITE_API_URL;

const res = await fetch(`${API_URL}/notifications`);
const json = await res.json();
// json.data → array of Notification
```

**Endpoint yang kamu butuhkan:**
```
GET {VITE_API_URL}/notifications    → Ambil semua notifikasi
Response: { data: Notification[] }
```

---

## 📋 TODO LIST — Kerjakan Urut dari Atas

### ✅ Langkah 1 — `BottomNav.tsx` (Navigasi Bawah untuk HP)

Navigasi yang **hanya muncul di layar kecil** (HP). Letaknya di bagian paling bawah layar (fixed).

```typescript
// frontend/src/components/layout/BottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home,       path: "/",              label: "Beranda" },
    { icon: Search,     path: "/search",         label: "Cari" },
    { icon: PlusSquare, path: "/create",         label: "Buat" },
    { icon: Bell,       path: "/notifications",  label: "Notifikasi" },
    { icon: User,       path: "/profile",        label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ig-background border-t border-neutral-800 flex justify-around items-center h-14 md:hidden">
      {navItems.map(({ icon: Icon, path, label }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            aria-label={label}
            className={`flex flex-col items-center justify-center p-2 transition-opacity ${isActive ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
          >
            <Icon className={`w-6 h-6 ${isActive ? "text-ig-text" : "text-ig-text"}`} strokeWidth={isActive ? 2.5 : 1.5} />
          </Link>
        );
      })}
    </nav>
  );
}
```

---

### ✅ Langkah 2 — `Sidebar.tsx` (Navigasi Kiri untuk Desktop)

Navigasi yang **hanya muncul di layar besar** (laptop/desktop). Menempel di sisi kiri.

```typescript
// frontend/src/components/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import { ThemeToggle } from "../common/ThemeToggle";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Home,       path: "/",              label: "Beranda" },
    { icon: Search,     path: "/search",         label: "Cari" },
    { icon: PlusSquare, path: "/create",         label: "Buat" },
    { icon: Bell,       path: "/notifications",  label: "Notifikasi" },
    { icon: User,       path: "/profile",        label: "Profil" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[244px] h-screen sticky top-0 border-r border-neutral-800 bg-ig-background px-3 py-6">
      {/* Logo */}
      <div className="px-3 mb-6">
        <h1 className="text-ig-text font-bold text-xl">Instagram</h1>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, path, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors hover:bg-ig-secondary-bg ${isActive ? "font-bold" : ""}`}
            >
              <Icon className="w-6 h-6 text-ig-text" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-ig-text text-[15px]">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle di bawah */}
      <div className="px-3 mt-4">
        <ThemeToggle />
      </div>
    </aside>
  );
}
```

---

### ✅ Langkah 3 — `MainLayout.tsx` (Pembungkus Halaman)

Komponen yang menyatukan `Sidebar` dan `BottomNav`. Semua halaman yang butuh navigasi dibungkus dengan ini.

```typescript
// frontend/src/components/layout/MainLayout.tsx
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-ig-background">
      {/* Sidebar kiri (desktop) */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* Bottom nav (HP) */}
      <BottomNav />
    </div>
  );
}
```

**Cara pakai di `App.tsx` (tanyakan Rafli untuk integrasinya):**
```typescript
// Contoh cara pakai di halaman:
import { MainLayout } from "../components/layout/MainLayout";

<MainLayout>
  <HomePage />
</MainLayout>
```

---

### ✅ Langkah 4 — `NotificationPage.tsx` (Halaman Daftar Notifikasi)

Halaman yang menampilkan semua notifikasi user dari API.

```typescript
// frontend/src/pages/NotificationPage.tsx
import { useEffect, useState } from "react";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "welcome";
  message: string;
  isRead: boolean;
  createdAt: string;
}

function getIcon(type: string) {
  if (type === "like") return <Heart className="w-5 h-5 text-red-500" />;
  if (type === "comment") return <MessageCircle className="w-5 h-5 text-blue-400" />;
  if (type === "follow") return <UserPlus className="w-5 h-5 text-green-400" />;
  return <Bell className="w-5 h-5 text-yellow-400" />;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/notifications`)
      .then(res => res.json())
      .then(json => {
        if (json.data) setNotifications(json.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-ig-background text-ig-text max-w-[600px] mx-auto px-4 pt-6">
      <h1 className="text-xl font-bold mb-6">Notifikasi</h1>

      {isLoading ? (
        <p className="text-neutral-500 text-center py-10">Memuat notifikasi...</p>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400">Belum ada notifikasi.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800">
          {notifications.map(notif => (
            <div key={notif.id} className={`flex items-start gap-3 py-4 ${!notif.isRead ? "bg-ig-secondary-bg/30 rounded-lg px-2" : ""}`}>
              <div className="mt-1 flex-shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-ig-text">{notif.message}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(notif.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!notif.isRead && <div className="w-2 h-2 bg-ig-primary rounded-full mt-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
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
git checkout -b asa/layout-notification
```

### 2. Commit setiap selesai 1 langkah
```bash
git add .
git commit -m "feat(layout): add BottomNav component"
git commit -m "feat(layout): add Sidebar component"
git commit -m "feat(layout): add MainLayout wrapper"
git commit -m "feat(notification): add NotificationPage"
```

### 3. Push ke branch kamu
```bash
git push origin asa/layout-notification
```

### 4. Buat Pull Request di GitHub
1. Buka **github.com/IniRalfi/ppwl-clone-instagram**
2. Klik **"Compare & pull request"** yang muncul otomatis
3. **Base branch:** `dev` ← PASTIKAN INI! (bukan `main`)
4. **Title PR:** `feat: Layout & NotificationPage (Salsabila)`
5. Klik **"Create pull request"**
6. Kabari Rafli di grup — dia yang review dan merge

> ⚠️ **JANGAN merge sendiri ke `main`!**

---

## ✅ Cara Test

1. Jalankan `bun dev` dari folder `frontend/`
2. Buka `http://localhost:5173`
3. **Yang harus muncul:** Navigasi kiri (di laptop) atau navigasi bawah (di HP)
4. Klik **"Notifikasi"** → harus pindah ke `/notifications` dan menampilkan daftar notifikasi

### Kalau Ada Error
1. Copy seluruh pesan error
2. Paste ke AI bersama kode file yang error
3. Ketik: _"Ini error di proyek React TypeScript Vite, tolong bantu perbaiki"_

---

## ❓ FAQ

**Q: Harus install database atau backend dulu?**
A: **TIDAK PERLU.** Backend dan database sudah jalan di cloud. Kamu cukup jalankan `bun dev` dari folder `frontend/`.

**Q: `lucide-react` tidak ditemukan?**
A: Jalankan `bun install` dari dalam folder `frontend/`. Jangan dari folder root.

**Q: Notifikasi tidak muncul?**
A: Pastikan sudah login dulu di aplikasi. Data notifikasi ada di database production.
