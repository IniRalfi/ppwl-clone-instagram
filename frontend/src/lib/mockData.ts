import type { UserStoryGroup } from "../components/story/StoriesRow";

export const dummyStories: UserStoryGroup[] = [
  {
    userId: "user-1",
    username: "adella_n",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    hasUnread: true,
    stories: [
      { id: "s-1", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", createdAt: "2026-05-27T10:00:00Z" },
      { id: "s-2", imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800", createdAt: "2026-05-27T11:00:00Z" }
    ]
  },
  {
    userId: "user-2",
    username: "yasmin_s",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    hasUnread: true,
    stories: [
      { id: "s-3", imageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800", createdAt: "2026-05-27T09:30:00Z" }
    ]
  },
  {
    userId: "user-3",
    username: "olivia_naura",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    hasUnread: false,
    stories: [
      { id: "s-4", imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800", createdAt: "2026-05-27T08:00:00Z" }
    ]
  }
];