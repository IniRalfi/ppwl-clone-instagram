# Kontribusi Tim — Instafy (Clone Instagram)

> Dokumen ini mencatat kontribusi setiap anggota tim berdasarkan tugas yang diberikan di `docs/phase1/` dan `docs/phase2/`.

---

## 1. Rafli — Backend & Integrasi Sistem

### Backend (ElysiaJS + Bun + Prisma + PostgreSQL)

| Area | File |
|---|---|
| **Entry** | `backend/src/index.ts`, `backend/src/lambda.ts` |
| **Config** | `env.ts`, `cors.ts`, `s3.ts`, `cloudinary.ts`, `pusher.ts`, `web-push.ts` |
| **Database** | `backend/src/db/client.ts` |
| **Middleware** | `auth.middleware.ts`, `rate-limit.middleware.ts` |
| **Plugins** | `auth.plugin.ts`, `error.plugin.ts`, `require-auth.plugin.ts` |
| **Auth** | `modules/auth/auth.routes.ts`, `auth.schema.ts`, `auth.service.ts` |
| **Comment** | `modules/comment/comment.routes.ts`, `comment.schema.ts`, `comment.service.ts` |
| **Data** | `modules/data/data.route.ts`, `data.service.ts` |
| **Follow** | `modules/follow/follow.routes.ts`, `follow.schema.ts`, `follow.service.ts` |
| **Like** | `modules/like/like.routes.ts`, `like.schema.ts`, `like.service.ts` |
| **Message** | `modules/message/message.routes.ts`, `message.schema.ts`, `message.service.ts` |
| **Monitoring** | `modules/monitoring/monitoring.routes.ts`, `monitoring.service.ts` |
| **Notification** | `modules/notification/notification.routes.ts`, `notification.service.ts` |
| **Post** | `modules/post/post.routes.ts`, `post.schema.ts`, `post.service.ts` |
| **Story** | `modules/story/story.routes.ts`, `story.schema.ts`, `story.service.ts` |
| **User** | `modules/user/user.routes.ts`, `user.schema.ts`, `user.service.ts` |
| **Prisma** | `schema.prisma`, `seed.ts`, migrations |
| **Utils** | `cache.ts`, `scripts/backup.ts` |
| **Deploy** | `deploy.sh` |

### Shared Types

| File | Isi |
|---|---|
| `shared/src/types/auth.ts` | Tipe autentikasi |
| `shared/src/types/comment.ts` | Tipe komentar |
| `shared/src/types/notification.ts` | Tipe notifikasi |
| `shared/src/types/post.ts` | Tipe postingan |
| `shared/src/types/user.ts` | Tipe user |
| `shared/src/utils/date.ts` | Utility tanggal |
| `shared/src/utils/format.ts` | Utility format |

### Frontend — Services & State

| Area | File |
|---|---|
| **Services** | `api.client.ts`, `auth.service.ts`, `comment.service.ts`, `like.service.ts`, `notification.service.ts`, `post.service.ts`, `story.service.ts` |
| **Stores** | `auth.store.ts`, `message.store.ts`, `notification.store.ts`, `notification-drawer.store.ts`, `theme.store.ts` |

### Frontend — Hooks

| File | Fungsi |
|---|---|
| `hooks/useAuth.ts` | Auth state |
| `hooks/useDirectMessagesRealtime.ts` | DM realtime via Pusher |
| `hooks/useInfiniteScroll.ts` | Infinite scroll |
| `hooks/usePublicRealtime.ts` | Public event realtime |
| `hooks/useRealtimeNotifications.ts` | Notifikasi realtime |
| `hooks/useWebPush.ts` | Web Push API |

### Frontend — Komponen UI

| File |
|---|
| `components/ui/avatar.tsx` |
| `components/ui/button.tsx` |
| `components/ui/card.tsx` |
| `components/ui/input.tsx` |
| `components/ui/label.tsx` |
| `components/ui/PageState.tsx` |
| `components/ui/select.tsx` |
| `components/ui/Skeleton.tsx` |
| `components/ui/textarea.tsx` |

### Frontend — Komponen Post

| File |
|---|
| `components/post/PostActions.tsx` |
| `components/post/PostCaption.tsx` |
| `components/post/PostCarousel.tsx` |
| `components/post/PostDetail.tsx` |
| `components/post/PostForm.tsx` |
| `components/post/PostGrid.tsx` |
| `components/post/PostHeader.tsx` |
| `components/post/PostHoverCard.tsx` |
| `components/post/PostOptionsModal.tsx` |
| `components/post/PostShareModal.tsx` |

### Frontend — Halaman

| File |
|---|
| `pages/LoginPage.tsx` |
| `pages/RegisterPage.tsx` |
| `pages/PostDetailPage.tsx` |
| `pages/MessagesPage.tsx` |
| `pages/MonitoringPage.tsx` |
| `pages/create/CaptionStep.tsx` |
| `pages/create/DrawTab.tsx` |
| `pages/create/EditorToolPanel.tsx` |
| `pages/create/FilterTab.tsx` |
| `pages/create/LayoutTab.tsx` |
| `pages/create/TextTab.tsx` |
| `pages/create/UploadStep.tsx` |

### Frontend — Lainnya

| File | Deskripsi |
|---|---|
| `components/common/ThemeToggle.tsx` | Toggle tema |
| `components/common/SuggestedUsers.tsx` | User rekomendasi |
| `components/common/NotificationBadge.tsx` | Badge notifikasi |
| `components/notification/NotificationDrawer.tsx` | Drawer notifikasi |
| `components/notification/PushPermissionModal.tsx` | Modal izin push |
| `components/story/StoryEditorModal.tsx` | Modal editor story |
| `components/story/StoryRing.tsx` | Ring story |
| `lib/constants.ts` | Konstanta global |
| `lib/image.ts` | Utility gambar |
| `lib/utils.ts` | Utility umum |
| `lib/mockData.ts` | Data dummy |
| `pages/NotificationPage.tsx` | Halaman notifikasi (revisi/rapi) |

---

## 2. Adella — Stories & Feed

| File | Tugas |
|---|---|
| `pages/HomePage.tsx` | **Phase 1** — Halaman beranda dengan feed scroll |
| `components/post/PostCard.tsx` | **Phase 1** — Kartu postingan (caption, actions, bookmark) |
| `components/story/StoriesRow.tsx` | **Phase 2** — Barisan stories horizontal dengan scroll & gradient ring |
| `components/story/StoryViewer.tsx` | **Phase 2** — Modal fullscreen viewer dengan progress bar 5 detik & navigasi slide |
| `lib/mockData.ts` | **Phase 2** — Dummy data `dummyStories` |

---

## 3. Asa / Salsabila — Layout, Notifikasi & Direct Message

| File | Tugas |
|---|---|
| `components/layout/Sidebar.tsx` | **Phase 1** — Navigasi kiri desktop (link menu, logo, avatar, logout) |
| `components/layout/BottomNav.tsx` | **Phase 1** — Navigasi bawah mobile (5 menu ikon) |
| `components/layout/MainLayout.tsx` | **Phase 1** — Pembungkus layout utama (sidebar kiri + konten tengah) |
| `pages/NotificationPage.tsx` | **Phase 1** — Halaman daftar notifikasi |
| `pages/DirectPage.tsx` | **Phase 2** — Halaman DM split 2-kolom (daftar chat + ruang obrolan) |
| `lib/mockData.ts` | **Phase 2** — Dummy data `dummyChatRooms` & `dummyMessages` |
| `App.tsx` | **Phase 2** — Route `/direct/inbox` |
| `components/layout/Sidebar.tsx` | **Phase 2** — Ikon Pesan |
| `components/layout/BottomNav.tsx` | **Phase 2** — Ikon Pesan |

---

## 4. Bagas — Comment System & Bookmark

| File | Tugas |
|---|---|
| `components/comment/CommentItem.tsx` | **Phase 1** — Tampilan satu komentar (avatar, nama, teks, waktu) |
| `components/comment/CommentForm.tsx` | **Phase 1** — Form input komentar |
| `components/post/PostCard.tsx` | **Phase 2** — Integrasi tombol bookmark interaktif |
| `pages/ProfilePage.tsx` | **Phase 2** — Tab "Disimpan" (Saved) di halaman profil |
| `lib/mockData.ts` | **Phase 2** — Dummy data `dummySavedPosts` |

---

## 5. Olivia — Profile, Avatar & Modals

| File | Tugas |
|---|---|
| `components/common/Avatar.tsx` | **Phase 1** — Komponen avatar bulat reusable |
| `pages/ProfilePage.tsx` | **Phase 1** — Halaman profil pengguna (info, stats, grid postingan) |
| `components/profile/EditProfileModal.tsx` | **Phase 2** — Modal edit profil (nama, username, bio, avatar) |
| `components/profile/FollowersModal.tsx` | **Phase 2** — Modal popup daftar pengikut |
| `components/profile/FollowingModal.tsx` | **Phase 2** — Modal popup daftar mengikuti |
| `components/profile/ProfileImageEditorModal.tsx` | **Phase 2** — Modal crop/edit foto profil |
| `pages/ProfilePage.tsx` | **Phase 2** — Integrasi 3 modal (edit, followers, following) |
| `lib/mockData.ts` | **Phase 2** — Dummy data `dummyFollowers` & `dummyFollowing` |

---

## 6. Yasmin — Like, Post, Explore & Search

| File | Tugas |
|---|---|
| `components/common/LikeButton.tsx` | **Phase 1** — Tombol like interaktif (toggle merah/putih) |
| `hooks/usePosts.ts` | **Phase 1** — Custom hook ambil data posts dari API |
| `pages/CreatePostPage.tsx` | **Phase 1** — Halaman form buat postingan baru |
| `pages/ExplorePage.tsx` | **Phase 2** — Halaman explore grid (3 kolom) + live search |
| `App.tsx` | **Phase 2** — Route `/explore` |
| `components/layout/Sidebar.tsx` | **Phase 2** — Navigasi Search ke `/explore` |
| `components/layout/BottomNav.tsx` | **Phase 2** — Navigasi Search ke `/explore` |
| `lib/mockData.ts` | **Phase 2** — Dummy data `dummySearchUsers` & `dummyExplorePosts` |
