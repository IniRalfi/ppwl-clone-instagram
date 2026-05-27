import { SearchUserResult, ExplorePost } from "../pages/ExplorePage";

// ─────────────────────────────────────────────
// Search & Explore (sudah ada sebelumnya)
// ─────────────────────────────────────────────
export const dummySearchUsers: SearchUserResult[] = [
  { id: "user-1", username: "adella_r", name: "Adella Reina", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Blossom", bio: "UI Designer & Coffee Lover ☕" },
  { id: "user-2", username: "olivia_naura", name: "Olivia Naura", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bubbles", bio: "Vite + React enthusiast 💻" },
  { id: "user-3", username: "bagaskara_s", name: "Bagaskara", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Buttercup", bio: "System Analyst in the making 🚀" },
];

export const dummyExplorePosts: ExplorePost[] = [
  { id: "e-1", imageUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=500", content: "Cute Cat", _count: { likes: 421, comments: 52 } },
  { id: "e-2", imageUrl: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=500", content: "Museum Visit", _count: { likes: 189, comments: 17 } },
  { id: "e-3", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500", content: "Concert Night", _count: { likes: 672, comments: 81 } },
  { id: "e-4", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500", content: "Beach Sunset", _count: { likes: 512, comments: 43 } },
  { id: "e-5", imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500", content: "Cafe Time", _count: { likes: 298, comments: 29 } },
  { id: "e-6", imageUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500", content: "Holiday Trip", _count: { likes: 734, comments: 95 } },
];

// ─────────────────────────────────────────────
// Follow — dipakai ProfilePage (Olivia)
// ─────────────────────────────────────────────
export interface FollowUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowingBack?: boolean;
}

export const dummyFollowers: FollowUser[] = [
  { id: "f-1", username: "adella_r", name: "Adella Reina", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Blossom" },
  { id: "f-2", username: "olivia_naura", name: "Olivia Naura", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bubbles" },
  { id: "f-3", username: "yasmin_s", name: "Yasmin Syafira", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Daisy" },
];

export const dummyFollowing: FollowUser[] = [
  { id: "g-1", username: "adella_r", name: "Adella Reina", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Blossom", isFollowingBack: true },
  { id: "g-2", username: "rafli_dev", name: "Rafli", avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Coder", isFollowingBack: false },
];

// ─────────────────────────────────────────────
// Saved Posts — BAGIAN BAGAS
// ─────────────────────────────────────────────
export interface PostTag {
  username: string;
  x: number; // Persentase dari kiri (0-100)
  y: number; // Persentase dari atas (0-100)
}

export interface SavedPost {
  id: string;
  imageUrl: string | null;
  content: string;
  tags?: PostTag[];
  _count: { likes: number; comments: number };
}

export const dummySavedPosts: SavedPost[] = [
  {
    id: "e-3",
    imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500",
    content: "Forest walkthrough with friends!",
    tags: [
      { username: "adella_n", x: 45, y: 60 },
      { username: "olivia_naura", x: 70, y: 40 },
    ],
    _count: { likes: 256, comments: 45 },
  },
  {
    id: "e-5",
    imageUrl: "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=500",
    content: "Sunset Valley",
    tags: [{ username: "yasmin_s", x: 30, y: 55 }],
    _count: { likes: 184, comments: 23 },
  },
];