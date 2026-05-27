# 📝 Progress & To-Do List Target Capstone #15

**Target Utama:**

- AWS Lambda (Backend) & S3 (Front-end) _ready_ sebagai media deployment.
- Frontend masing-masing fitur sudah _ready_ (Logika tidak wajib).
- Registrasi & Login berhasil.
- Endpoint rahasia (`/users?key=your-secret-key`) berhasil.

---

## ✅ Fase 1: Arsitektur & Database (Selesai)

Sebagai arsitek, fondasi sudah dipastikan kokoh sebelum tim masuk.

- [x] **Migrasi Frontend ke Vite:** Mengubah _Bun native bundler_ ke Vite agar Frontend siap digunakan.
- [x] **Setup Skema Prisma:** Membuat model `User`, `Post`, `Like`, `Comment`, dan `Notification` sesuai ERD.
- [x] **Generate Diagram Database:** _Script_ Mermaid sudah dibuat untuk disisipkan ke laporan.
- [x] **Membuat Dummy Data (Seeding):** Menyiapkan data dummy di database PostgreSQL lokal agar Frontend bisa langsung melakukan test `GET` API.

## ✅ Fase 2: Backend & Fitur Auth (Selesai)

- [x] **Setup Backend ElysiaJS & Prisma Client:** Menyambungkan backend ke database dan menyelesaikan isu _monorepo hoisting_.
- [x] **Membuat Endpoint Auth:** Implementasi Register & Login via Email/Password di endpoint `/auth/register` dan `/auth/login`.
- [x] **Membuat Endpoint Rahasia:** Endpoint `/users?key=your-secret-key` dibuat sesuai instruksi target.
- [x] **Membuat Endpoint GET Data Dummy:** Tersedia endpoint `/posts`, `/comments`, dan `/notifications` untuk dites oleh tim Frontend.

## ✅ Fase 3: Integrasi State & Auth di Frontend (Selesai)

- [x] **Setup Zustand:** Membuat `auth.store.ts` lengkap dengan _persist middleware_.
- [x] **Install & Setup Google OAuth:** Memasang `@react-oauth/google` di Frontend.
- [x] **Notifikasi Popup Welcome:** Memasang ShadCN Sonner (Toaster) dengan _trigger popup_ selamat datang saat awal berhasil login.
- [x] **Halaman Login & Protected Routes:** Membuat halaman _login interface_ dan me-routing akses beranda.

---

## ⏳ Fase 4: Deployment & Infrastruktur (Sedang Dikerjakan)

- [x] **Setup AWS Lambda (Backend):** ElysiaJS berhasil di-deploy ke Lambda. URL: `https://qfpvfoyqge5upnwcdlscwq3v2u0fxrzm.lambda-url.us-east-1.on.aws`
- [x] **Setup AWS S3 (Frontend):** Menyiapkan _script build_ Vite untuk diunggah ke _bucket_ S3.

---

## 👥 Status Tim (Pendelegasian Siap Dilakukan)

Saat ini **Fase 1 dan Fase 2 sudah tuntas**. Backend sudah menyediakan API dan data dummy. Anda sudah bisa mendelegasikan tugas ke tim:

- **Adella & Rifa:** Sudah bisa melakukan GET data dari `/posts` untuk halaman Beranda dan _Post Component_.
- **Atira:** Sudah bisa melakukan GET data dari `/comments` untuk halaman Komentar.
- **Salsabila:** Sudah bisa melakukan GET data dari `/notifications` untuk halaman Notifikasi.
