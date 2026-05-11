https://docs.google.com/document/d/1hV_PTNH-kDNz5YgDGbBiWD73-9hstmQboQxHAoMshhQ/edit?usp=sharing

# Clone Instagram — PPWL

Clone Instagram sebagai Tugas Besar PPWL.

## Tim

- Rafli Pratama (Ketua)
- Adella Rheina Sweeta
- Rifa Dwinanda Bagaskara
- Tan Atira Yasmin
- Olivia Naura Fakhradika
- Salsabila Nur Anisa

## Stack

- **Frontend**: Vite + React + Tailwind CSS v4 + ShadcnUI
- **Backend**: ElysiaJS + Prisma ORM
- **Database**: PostgreSQL (AWS RDS)
- **Monorepo**: Bun Workspaces

## Menjalankan Proyek

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- PostgreSQL (atau Docker)

### Setup

````bash
# 1. Clone repo
git clone https://github.com/USERNAME/ppwl-clone-instagram.git
cd ppwl-clone-instagram
# 2. Install semua dependencies
bun install
# 3. Copy env
cp .env.example .env
# Edit .env sesuai konfigurasi lokal kamu
# 4. Generate Prisma client
bun run db:generate
# 5. Jalankan migrasi database
bun run db:migrate
Menjalankan Dev Server
bash
# Frontend saja (port 5173)
bun run dev:fe
# Backend saja (port 3000)
bun run dev:be
# Keduanya sekaligus
bun run dev
Scripts Tersedia
Perintah	Fungsi
bun run dev:fe	Jalankan frontend Vite
bun run dev:be	Jalankan backend ElysiaJS
bun run dev	Keduanya sekaligus
bun run build	Build semua package
bun run db:migrate	Jalankan migrasi Prisma
bun run db:studio	Buka Prisma Studio
---
Setelah semua file dibuat, jalankan di root:
```bash
# Dari direktori root ppwl-clone-instagram/
bun install
````
