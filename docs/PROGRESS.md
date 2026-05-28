# 📈 Progress Tracker — PPWL Instagram Clone

Dokumen ini melacak target aktif dan rencana pengembangan aplikasi yang akan datang. Seluruh pencapaian rilis sebelumnya telah diarsipkan di [CHANGELOG.md](file:///home/rafli/Programming/PPWL/ppwl-clone-instagram/docs/CHANGELOG.md).

---

## 🛠️ Status Pengembangan Saat Ini

Semua target dari Fase 1 hingga Fase 6 saat ini telah **SELESAI** diintegrasikan secara penuh.

| Kategori | Target Pekerjaan | Status |
| :--- | :--- | :---: |
| 🟢 **Fase 1** | Bug Fixes (20 Items) | **SELESAI** |
| 🔵 **Fase 2** | Integrasi Tim (Explore, Profil, Stories, Saved) | **SELESAI** |
| 🟡 **Fase 3** | Caching, AWS CDN & Monitoring Dashboard | **SELESAI** |
| 🔴 **Fase 4** | Integrasi Real-Time & Resolusi Merge Tim | **SELESAI** |

---

## 🚀 Rencana Pengembangan Berikutnya (Backlog & Future Roadmap)

Berikut adalah to-do list untuk fitur-fitur tambahan berikutnya:

### ✉️ Integrasi DM Chat (Salsabila)
- [ ] Mengintegrasikan Direct Message chat di frontend dengan API backend secara real-time (menggunakan WebSocket atau SSE untuk latensi rendah).
- [ ] Membuat halaman obrolan `/messages` dengan tampilan daftar chat room aktif dan histori obrolan lengkap.

### 🎥 Pengunggahan Video & Reels
- [ ] Menambahkan dukungan unggah file video (`.mp4`) dengan kompresi otomatis di backend.
- [ ] Membuat feed Reels khusus dengan layout scroll vertikal otomatis.

### 🔔 Notifikasi Real-Time
- [ ] Mengintegrasikan push notifications untuk aktivitas Like, Comment, Follow, dan pesan masuk.
