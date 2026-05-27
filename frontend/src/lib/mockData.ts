import { SearchUserResult, ExplorePost } from "../pages/ExplorePage";

export const dummySearchUsers: SearchUserResult[] = [
  {
    id: "user-1",
    username: "adella_r",
    name: "Adella Reina",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Blossom",
    bio: "UI Designer & Coffee Lover ☕"
  },
  {
    id: "user-2",
    username: "olivia_naura",
    name: "Olivia Naura",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bubbles",
    bio: "Vite + React enthusiast 💻"
  },
  {
    id: "user-3",
    username: "bagaskara_s",
    name: "Bagaskara",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Buttercup",
    bio: "System Analyst in the making 🚀"
  }
];

export const dummyExplorePosts: ExplorePost[] = [
  {
    id: "e-1",
    imageUrl: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=500",
    content: "Cute Cat",
    _count: { likes: 421, comments: 52 }
  },
  {
    id: "e-2",
    imageUrl: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=500",
    content: "Museum Visit",
    _count: { likes: 189, comments: 17 }
  },
  {
    id: "e-3",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500",
    content: "Concert Night",
    _count: { likes: 672, comments: 81 }
  },
  {
    id: "e-4",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500",
    content: "Beach Sunset",
    _count: { likes: 512, comments: 43 }
  },
  {
    id: "e-5",
    imageUrl: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500",
    content: "Cafe Time",
    _count: { likes: 298, comments: 29 }
  },
  {
    id: "e-6",
    imageUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500",
    content: "Holiday Trip",
    _count: { likes: 734, comments: 95 }
  }
];