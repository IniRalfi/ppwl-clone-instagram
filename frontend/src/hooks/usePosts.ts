import { useEffect, useState, useCallback } from "react";
import { fetchPosts, Post } from "../services/post.service";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPostsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPosts();
      if (data) {
        setPosts(data);
      } else {
        setError("Data tidak ditemukan");
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data postingan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPostsData();
  }, [getPostsData]);

  return { posts, isLoading, error, refetch: getPostsData };
}