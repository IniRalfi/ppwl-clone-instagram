import { useEffect, useState, useCallback } from "react";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  author: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  createdAt: string;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts`
      );
      const json = await res.json();

      if (json.data) {
        setPosts(json.data);
      } else {
        setError("Data tidak ditemukan");
      }
    } catch {
      setError("Gagal fetch data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, isLoading, error, refetch: fetchPosts };
}