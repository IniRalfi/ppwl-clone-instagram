
export interface FollowUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowingBack: boolean;
}

export const dummyFollowers: FollowUser[] = [
  {
    id: "f-1",
    username: "adella_n",
    name: "Adella Nur",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    isFollowingBack: true,
  },
  {
    id: "f-2",
    username: "yasmin_s",
    name: "Yasmin Salsabila",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    isFollowingBack: false,
  },
  {
    id: "f-4",
    username: "rafli_dev",
    name: "Rafli",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    isFollowingBack: true,
  },
];

export const dummyFollowing: FollowUser[] = [
  {
    id: "f-1",
    username: "adella_n",
    name: "Adella Nur",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    isFollowingBack: true,
  },
  {
    id: "f-3",
    username: "bagaskara_s",
    name: "Bagaskara",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    isFollowingBack: true,
  },
];