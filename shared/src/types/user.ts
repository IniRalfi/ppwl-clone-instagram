export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  provider: string;
  postCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  _count?: {
    posts: number;
    comments: number;
    likes: number;
  };
}
