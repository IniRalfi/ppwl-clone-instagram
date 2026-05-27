import React, { useEffect, useState } from 'react';
import { PostCard } from '../components/post/PostCard';
import { SuggestedUsers } from '../components/common/SuggestedUsers';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../services/api.client';

// Tipe data sesuai dengan response dari backend
interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  isLikedByMe?: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    bio?: string | null;
    postCount?: number;
    _count?: {
      followers: number;
      following: number;
    };
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await apiClient.get<{ data: Post[] }>('/posts');

        if (res && res.data) {
          setPosts(res.data);
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
  }, []);

  return (
    <div className="min-h-screen bg-ig-background text-ig-text">
      {/* Layout dua kolom: Feed + Suggested Panel */}
      <div className="max-w-[975px] mx-auto flex gap-8 px-4 pt-6 pb-20">

        {/* ── KOLOM KIRI: Feed Postingan ── */}
        <div className="flex-1 max-w-[470px] mx-auto lg:mx-0 flex flex-col gap-5">
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

              return (
                <PostCard
                  key={post.id}
                  id={post.id}
                  authorId={post.author.id}
                  username={post.author.username}
                  avatarUrl={post.author.avatarUrl || ''}
                  imageUrls={post.imageUrl ? [post.imageUrl] : []}
                  caption={post.content}
                  likesCount={post._count.likes}
                  commentsCount={post._count.comments}
                  timeAgo={timeAgo}
                  postsCount={post.author.postCount ?? 0}
                  followers={post.author._count?.followers ?? 0}
                  following={post.author._count?.following ?? 0}
                  bio={post.author.bio || 'User'}
                  currentUserId={user?.id}
                  isLikedByMe={post.isLikedByMe ?? false}
                />
              );
            })
          )}

          {!isLoading && posts.length > 0 && (
            <div className="text-center text-ig-secondary-text text-sm mt-2 pb-8">
              ✓ Kamu sudah melihat semua postingan
            </div>
          )}
        </div>

        {/* ── KOLOM KANAN: Suggested Users Panel (hanya desktop) ── */}
        <aside className="hidden lg:block w-[319px] flex-shrink-0 pt-2">
          <div className="sticky top-6">
            <SuggestedUsers />
          </div>
        </aside>

      </div>
    </div>
  );
};

export default HomePage;