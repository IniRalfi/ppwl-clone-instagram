[15.14, 19/5/2026] Rafli Pratama: 📩 Briefing Tugas: Yasmin - Frontend (Post & Interaksi)
@Yasmin | Sisfo | UNTAN 24
Di proyek Clone Instagram kita ini, dirimu bakal megang salah satu fitur paling core, yaitu sistem Pembuatan Postingan (Create Post) dan Interaksi (Like). Bisa dibilang, aplikasinya nggak bakal jalan jadi sosmed kalau nggak ada fitur yang dirimu kerjain ini.

📁 File yang Menjadi Tanggung Jawabmu:
Fokus pengerjaan dirimu akan berkisar di halaman form dan komponen tombol interaktif. Ini daftar file yang perlu dirimu eksekusi di folder frontend/src/:

pages/CreatePostPage.tsx

Fungsi: Halaman form tempat user mengunggah foto dan menulis caption.

Penting (Syarat Dosen): Dirimu harus pasang validasi di form ini. Pertama, wajib input gambar (ekstensi .jpg, .png), video nggak boleh masuk. Kedua, dirimu nanti perlu nangkep error dari backend kalau user udah posting lebih dari 2 kali (karena ada limit maksimal 2 post per user).

pages/PostDetailPage.tsx

Fungsi: Halaman detail ketika satu postingan diklik. Di sini gambarnya bakal tampil lebih besar, dan nanti komponen komentarnya Atira bakal dimasukkan ke dalam halaman buatan dirimu ini.

components/common/LikeButton.tsx

Fungsi: Tombol hati (❤️) khas Instagram.

Fitur: Dirimu perlu mainan state di React (pakai useState). Kalau di-klik, icon-nya berubah jadi merah dan angkanya nambah. Kalau di-klik lagi, kembali putih dan angkanya berkurang. Pastikan pakai warna text-ig-error (merah IG) yang udah aku set di globals.css.

hooks/usePosts.ts (Untuk integrasi API nanti)

Fungsi: Tempat dirimu nulis logika untuk fetch (ngambil) dan post (ngirim) data ke backend ElysiaJS.

🚀 Langkah Pengerjaan (Step-by-Step):

Bikin UI Form Dulu: Rancang UI untuk CreatePostPage. Pakai komponen ShadcnUI seperti Input tipe file, Textarea untuk caption, dan Button untuk submit. Bikin tampilannya rapi dan ada tombol "Cancel" buat balik ke halaman Home.

Siapkan Komponen Interaktif: Kerjain LikeButton.tsx. Pastikan animasinya atau pergantian warna icon-nya responsif saat di-klik. Nanti tombol ini bakal dipakai sama Adella di beranda dan dipakai sama dirimu sendiri di halaman detail.

Mainkan Validasi Frontend: Di form upload, kasih peringatan teks warna merah kalau file yang dipilih bukan gambar, biar user tau sebelum pencet submit.

Integrasi API : Kalau UI form dan halaman detail udah siap, kabarin aku. Nanti kita bareng-bareng hit API backend-nya supaya data gambarnya beneran terkirim ke AWS S3 dan masuk ke database.
[15.14, 19/5/2026] Rafli Pratama: 📩 Briefing Tugas: Rifa - Frontend (Comment System)
@Bagaskara | Sisfo | UNTAN '24
Di proyek Clone Instagram kita, dirimu dapat tanggung jawab yang sangat penting dan lumayan tricky, yaitu Sistem Komentar (Comment System). Fitur ini butuh ketelitian karena kita mau bikin sistem komentar yang bisa dibalas lagi (nested replies), persis kayak kalau kita reply komen orang di IG.

📁 File yang Menjadi Tanggung Jawabmu:
Fokus kerjamu ada di dalam folder frontend/src/components/comment/. Ini daftar file yang perlu dirimu eksekusi:

components/comment/CommentForm.tsx

Fungsi: Komponen input text dan tombol kirim buat user ngetik komentar.

Penting (Syarat Dosen): Ada aturan limit maksimal 5 komentar per user. Jadi, dirimu perlu nyiapin tampilan peringatan (misal teks merah: "Bat…
[15.14, 19/5/2026] Rafli Pratama: 📩 Briefing Tugas: Olivia Naura Fakhradika (Frontend - Profile & UX)
@Olivia | Sisfo | UNTAN | 24
Di proyek Clone Instagram kita, dirimu memegang peran penting buat nampilin identitas user. Tugas utamamu adalah meracik halaman Profil Pengguna biar tampilannya estetik dan presisi kayak IG aslinya, lengkap dengan grid foto-fotonya!

📁 File yang Menjadi Tanggung Jawabmu:
Fokus kerjamu akan banyak di halaman profil dan pengaturan layout grid. Ini file-file yang perlu dirimu eksekusi di frontend/src/:

pages/ProfilePage.tsx

Fungsi: Halaman utama profil. Bagian atasnya nampilin Avatar, Username, Bio, dan Statistik (jumlah post, jumlah komen). Bagian bawahnya nampilin grid foto.

Fitur: Dirimu juga perlu nyiapin modal/halaman kecil buat "Edit Profile" (ubah nama, bio, atau ganti foto profil).

components/common/Avatar.tsx

Fungsi: Bikin komponen Avatar reusable. Pakai komponen dasar dari ShadcnUI, tapi dirimu yang atur size-nya biar ada varian ukuran (misal: small buat di komen, large buat di halaman profil).

shared/src/types/user.ts (Hanya untuk referensi)

Fungsi: Intip file ini buat tau data apa aja yang bakal dikirim backend (misal: avatarUrl, postCount, dll) biar auto-complete kodinganmu jalan.

🚀 Langkah Pengerjaan (Step-by-Step):

Rakit Header Profil: Bikin struktur atasnya dulu pakai data statis. Pastikan jarak antar elemen (angka statistik dan teks) rapi pakai Flexbox Tailwind.

Bikin Grid Postingan: Di bawah header, buat layout grid 3 kolom (grid-cols-3 di Tailwind) untuk nampilin foto-foto yang udah di-post sama user. Berhubung limitnya maksimal cuma 2 post per user, pastikan tampilannya tetep bagus walaupun grid-nya nggak penuh.

Konsistensi Tema: Jangan lupa selalu panggil variabel warna IG dari globals.css (misal: text-ig-text, bg-ig-background) biar dark mode-nya kerasa.

Integrasi API: Kalau UI udah beres, kabari aku ya Oliv. Nanti kita bareng-bareng fetch data user yang lagi login dari backend.
[15.14, 19/5/2026] Rafli Pratama: 📩 Briefing Tugas: Salsabila Nur Anisa (Frontend - Notification & Mobile Layout)
@Salsabila | Sisfo | UNTAN | 24
Di proyek Clone Instagram kita, dirimu dapet tugas yang bikin aplikasinya kerasa hidup dan ramah di HP, yaitu mengurus Sistem Notifikasi dan Navigasi Mobile (Bottom Nav).

📁 File yang Menjadi Tanggung Jawabmu:
Fokusmu ada di pembungkus utama aplikasi (Layout) dan halaman notifikasi. Ini daftar filenya di frontend/src/:

pages/NotificationsPage.tsx

Fungsi: Halaman khusus nampilin daftar interaksi (siapa yang like, siapa yang komen).

Tampilan: Bikin list yang rapi. Sebelah kiri foto profil orangnya, tengah teks (misal: "Adella menyukai postingan Anda"), dan kanan foto postingan kecil (kalau ada ruang).

components/layout/BottomNav.tsx

Fungsi: Menu navigasi yang nempel di bawah layar khusus kalau aplikasinya dibuka di HP. Isinya ikon Home, Search, Create Post, icon hati (Notif), dan Profile.

components/layout/Sidebar.tsx

Fungsi: Menu navigasi yang ada di sebelah kiri layar (khusus kalau dibuka di Laptop/PC).

components/layout/MainLayout.tsx

Fungsi Utama: Ini yang paling tricky. Dirimu harus pakai class responsive Tailwind (kayak hidden md:flex, md:hidden) untuk ngatur: kalau layar kecil yang muncul BottomNav, kalau layar besar yang muncul Sidebar.

🚀 Langkah Pengerjaan (Step-by-Step):

Rancang Navigasi Dulu: Mulai dari meracik Sidebar dan BottomNav. Pakai library ikon lucide-react (bawaan ShadcnUI) buat nyari ikon-ikon yang mirip IG.

Atur MainLayout: Pasang navigasi tadi di MainLayout.tsx. Pastikan konten utama (Feed, Profile, dll) nggak tertutup sama navigasinya (kasih padding-bottom yang cukup kalau di HP).

Bikin Halaman Notifikasi: Pakai data palsu dulu (bikin array list notif) buat nyusun tampilan antarmukanya. Pastikan bedain mana yang belum dibaca (misal background-nya agak terang atau ada titik biru) dan mana yang udah.

Integrasi: Kalau navigasinya udah bisa pindah-pindah halaman dengan mulus dan UI Notif udah rapi, kabari aku biar kita sambungin data notifikasinya ke backend.
[15.14, 19/5/2026] Rafli Pratama: buat @all

🛡️ 1. Aturan Main GitHub (Wajib Dipatuhi!)
Biar kode kita nggak tabrakan dan bikin nangis pas mau digabungin, tolong ikutin workflow ini ya:

HARAM Hukumnya Push Langsung ke main!
Branch main itu ibarat versi production kita. Jangan pernah ngoding dan langsung git push origin main.

Bikin Branch Sendiri Setiap Ngerjain Fitur:
Kalau mau mulai ngoding, pindah dulu ke branch baru pakai format nama/fitur.
👉 Contoh: git checkout -b adella/home-feed atau git checkout -b yasmin/comment-form.

Sering-sering Commit, Jangan Ditumpuk:
Biar gampang dilacak, commit aja setiap selesai satu bagian kecil. Kasih pesan yang jelas.
👉 Contoh: git commit -m "feat: bikin UI tombol like" atau git commit -m "fix: benerin margin di navbar".

Gunakan Pull Request (PR):
Kalau kerjaanmu di branch tersebut udah selesai, push ke branch-mu sendiri, lalu buka GitHub dan klik "Compare & pull request" ke main. Nanti kabari di grup, biar aku yang review dan klik Merge.

Ritual Wajib Sebelum Ngoding (PULL):
Setiap baru buka laptop mau lanjut ngoding, WAJIB pindah ke main dan tarik kode terbaru dari anak-anak lain biar kodenya selalu update.
👉 git checkout main ➡️ git pull origin main ➡️ baru balik ke branch kamu (atau bikin branch baru).

🤖 2. Tips Pintar Pake AI (ChatGPT/Claude/Gemini)
Kita sangat diperbolehkan pakai AI buat ngebantu tugas, TAPI harus pintar pakenya biar kodingan kita tetep seragam:

Kasih Konteks yang Jelas:
AI nggak tau kita pakai apa kalau nggak dikasih tau. Selalu mulai prompt dengan kalimat sakti ini:
"Aku lagi bikin clone IG pakai Bun, React Vite, Tailwind v4, dan ShadcnUI. Tolong..."

Jangan Asal Copy-Paste CSS/Tailwind:
Kalau AI ngasih class warna aneh-aneh (misal: bg-blue-500 atau text-gray-900), JANGAN LANGSUNG DIPAKAI. Ganti warnanya pakai variabel tema IG yang udah aku buat di globals.css (contoh: pakai bg-ig-background, text-ig-primary, bg-ig-chat-out).

Fokus Minta Komponen Kecil:
Jangan nyuruh AI bikin 1 halaman full sekaligus, nanti dia ngaco. Minta per komponen aja, misal: "Tolong buatin struktur UI untuk komponen Card Postingan pakai ShadcnUI."

Kalau Error, Copy Errornya:
Kalau layarnya merah atau ada pesan error di terminal, jangan panik. Copy semua pesan error-nya, paste ke AI, trus lampirin juga kodingan file kamu yang bermasalah.
