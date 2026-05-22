import React, { useEffect, useState } from 'react';
import { PostCard } from '../components/post/PostCard';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../services/api.client';

// Tipe data sesuai dengan response dari backend
interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Map postId → { liked, likeCount } untuk tracking status like per post
  const [likeStatusMap, setLikeStatusMap] = useState<
    Record<string, { liked: boolean; likeCount: number }>
  >({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
        const json = await res.json();

        if (res.ok && json.data) {
          setPosts(json.data);

          // Setelah dapat list post, fetch status like tiap post secara paralel
          if (user?.id) {
            const statusRequests = (json.data as Post[]).map((post) =>
              apiClient
                .get<{ liked: boolean; likeCount: number }>(
                  `/likes/${post.id}/status?userId=${user.id}`
                )
                .then((status) => ({ postId: post.id, ...status }))
                .catch(() => ({ postId: post.id, liked: false, likeCount: post._count.likes }))
            );

            const statuses = await Promise.all(statusRequests);
            const map: Record<string, { liked: boolean; likeCount: number }> = {};
            statuses.forEach(({ postId, liked, likeCount }) => {
              map[postId] = { liked, likeCount };
            });
            setLikeStatusMap(map);
          }
        } else {
          toast.error("Gagal mengambil data postingan dari server.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Tidak dapat terhubung ke server backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-ig-background text-ig-text flex flex-col items-center">
      <div className="w-full max-w-[550px] flex flex-col gap-5 px-3 sm:px-0 pt-6 pb-20">

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-ig-secondary-text">
            Memuat postingan...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-ig-secondary-text py-20">
            Belum ada postingan.
          </div>
        ) : (
          posts.map((post) => {
            const timeAgo = new Date(post.createdAt).toLocaleDateString('id-ID', {
              month: 'short',
              day: 'numeric',
            });
            const likeStatus = likeStatusMap[post.id];

            return (
              <PostCard
                key={post.id}
                id={post.id}
                username={post.author.username}
                avatarUrl={post.author.avatarUrl || ''}
                imageUrls={post.imageUrl ? [post.imageUrl] : []}
                caption={post.content}
                likesCount={likeStatus?.likeCount ?? post._count.likes}
                commentsCount={post._count.comments}
                timeAgo={timeAgo}
                postsCount="0"
                followers="0"
                following="0"
                bio="User"
                currentUserId={user?.id}
                isLikedByMe={likeStatus?.liked ?? false}
              />
            );
          })
        )}

        {!isLoading && posts.length > 0 && (
          <div className="text-center text-ig-secondary-text text-sm mt-6 pb-8">
            ✓ Kamu sudah melihat semua postingan
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
