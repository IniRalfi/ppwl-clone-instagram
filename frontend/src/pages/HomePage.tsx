import React, { useEffect, useState } from 'react';
import { PostCard } from '../components/post/PostCard';
import { SuggestedUsers } from '../components/common/SuggestedUsers';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '../services/api.client';
import { StoriesRow } from "../components/story/StoriesRow";
import { PostSkeleton } from '../components/ui/Skeleton';
import { Loader2 } from 'lucide-react';
import { usePublicRealtime } from '../hooks/usePublicRealtime';

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  isLikedByMe?: boolean;
  isBookmarkedByMe?: boolean;
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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);

  const fetchPosts = async (cursorValue?: string | null) => {
    const isInitial = !cursorValue;
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const params = new URLSearchParams({ limit: '10' });
      if (cursorValue) params.set('cursor', cursorValue);
      const url = `/posts?${params.toString()}`;
      const res = await apiClient.get<{ data: Post[], nextCursor?: string | null }>(url);

      if (res && res.data) {
        if (isInitial) {
          setPosts(res.data);
        } else {
          setPosts((prev) => [...prev, ...res.data]);
        }
        setNextCursor(res.nextCursor || null);
      } else {
        toast.error("Gagal mengambil data postingan dari server.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Tidak dapat terhubung ke server backend.");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  usePublicRealtime({
    onPostCreated: (post: Post) => {
      if (post.author.id === user?.id) return;

      setPendingPosts((prev) => {
        const exists = prev.some((item) => item.id === post.id) || posts.some((item) => item.id === post.id);
        return exists ? prev : [post, ...prev];
      });
    },
    onPostEngagementUpdated: ({ postId, likeCount, commentCount }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                _count: {
                  ...post._count,
                  likes: likeCount ?? post._count.likes,
                  comments: commentCount ?? post._count.comments,
                },
              }
            : post
        )
      );
    },
  });

  const showPendingPosts = () => {
    setPosts((prev) => {
      const existingIds = new Set(prev.map((post) => post.id));
      const newPosts = pendingPosts.filter((post) => !existingIds.has(post.id));
      return [...newPosts, ...prev];
    });
    setPendingPosts([]);
  };

  return (
    <div className="min-h-screen bg-ig-background text-ig-text">
      {/* 
        Geser feed ke kanan sebesar 397px secara default pada layar desktop (md ke atas)
        untuk menyisakan ruang bagi Laci Notifikasi di sebelah kiri feed.
      */}
      <div className="max-w-[1335px] mx-auto md:pl-[360px] flex gap-8 px-4 pt-6 pb-20 transition-all duration-300">

        {/* ── KOLOM KIRI: Stories + Feed Postingan ── */}
        <div className="flex-1 max-w-[470px] mx-auto lg:mx-0 flex flex-col gap-5">

          {/* ← STORIES ROW DITAMBAHKAN DI SINI */}
          <StoriesRow />

          {/* Feed postingan */}
          {pendingPosts.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={showPendingPosts}
              className="sticky top-4 z-10 mx-auto rounded-full bg-ig-primary px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-ig-primary-hover"
            >
              Lihat {pendingPosts.length} postingan baru
            </button>
          )}

          {isLoading ? (
            <div className="flex flex-col gap-6">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
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
                  isBookmarkedByMe={post.isBookmarkedByMe ?? false}
                />
              );
            })
          )}

          {nextCursor && (
            <div className="flex justify-center pb-8 mt-2">
              <button
                onClick={() => fetchPosts(nextCursor)}
                disabled={isFetchingMore}
                className="px-6 py-2 bg-ig-elevated border border-ig-border rounded-lg text-sm font-semibold hover:bg-ig-hover-background transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isFetchingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  "Muat postingan lainnya"
                )}
              </button>
            </div>
          )}

          {!isLoading && !nextCursor && posts.length > 0 && (
            <div className="text-center text-ig-secondary-text text-sm mt-2 pb-8">
              ✓ Kamu sudah melihat semua postingan
            </div>
          )}
        </div>

        {/* ── KOLOM KANAN: Suggested Users (hanya desktop) ── */}
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
