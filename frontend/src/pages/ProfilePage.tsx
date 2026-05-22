// frontend/src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { Avatar } from "../components/common/Avatar";
import { deletePost } from "../services/post.service";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { apiClient } from "../services/api.client";

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  _count?: {
    likes: number;
    comments: number;
  };
}

interface FollowStats {
  followers: number;
  following: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });

  useEffect(() => {
    if (!user) return;

    // Fetch postingan milik user
    fetch(`${import.meta.env.VITE_API_URL}/posts`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const filtered = json.data.filter(
            (post: Post) => post.authorId === user.id
          );
          setMyPosts(filtered);
        }
      })
      .finally(() => setIsLoading(false));

    // Fetch jumlah followers & following dari API
    apiClient
      .get<{ followers: number; following: number }>(`/follow/stats/${user.id}`)
      .then((data) => setFollowStats(data))
      .catch(() => {}); // Silent fail — angka default 0
  }, [user]);

  // ── Handler hapus postingan ──
  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    const confirmed = window.confirm("Yakin ingin menghapus postingan ini?");
    if (!confirmed) return;

    setDeletingId(postId);
    try {
      await deletePost(postId, user.id);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Postingan berhasil dihapus.");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menghapus postingan.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ig-background">
        <p className="text-neutral-500">Silakan login terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4">

      {/* ── Header Profil ── */}
      <div className="flex items-start gap-8 py-8 border-b border-ig-border">

        {/* Avatar Besar */}
        <Avatar name={user.name} avatarUrl={user.avatarUrl ?? null} size="lg" />

        {/* Info Profil */}
        <div className="flex-1">

          {/* Username + Tombol */}
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-ig-text text-xl font-semibold">
              {user.username}
            </h1>
            <button className="px-4 py-1.5 text-ig-text text-sm font-semibold bg-ig-elevated-bg rounded-lg hover:opacity-80 transition-opacity">
              Edit Profil
            </button>
            <button
              onClick={logout}
              className="text-ig-secondary-text text-sm hover:text-ig-text transition-colors"
            >
              Keluar
            </button>
          </div>

          {/* Statistik: Postingan, Followers, Following */}
          <div className="flex gap-8 mb-4">
            <div>
              <span className="text-ig-text font-semibold">{myPosts.length}</span>
              <span className="text-ig-text text-sm ml-1">postingan</span>
            </div>
            <button className="hover:opacity-70 transition-opacity text-left">
              <span className="text-ig-text font-semibold">{followStats.followers}</span>
              <span className="text-ig-text text-sm ml-1">pengikut</span>
            </button>
            <button className="hover:opacity-70 transition-opacity text-left">
              <span className="text-ig-text font-semibold">{followStats.following}</span>
              <span className="text-ig-text text-sm ml-1">mengikuti</span>
            </button>
          </div>

          {/* Nama + Bio */}
          <p className="text-ig-text text-sm font-semibold">{user.name}</p>
          {user.bio ? (
            <p className="text-ig-text text-sm mt-1 whitespace-pre-line">
              {user.bio}
            </p>
          ) : (
            <p className="text-ig-secondary-text text-sm mt-1 italic">
              Belum ada bio.
            </p>
          )}
        </div>
      </div>

      {/* ── Grid Postingan ── */}
      <div className="py-4">
        {isLoading ? (
          <p className="text-ig-secondary-text text-sm text-center py-8">
            Memuat postingan...
          </p>
        ) : myPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📷</span>
            <p className="text-ig-text font-semibold">Belum Ada Postingan</p>
            <p className="text-ig-secondary-text text-sm">
              Mulai bagikan foto pertamamu!
            </p>
            <Link
              to="/create"
              className="mt-2 text-ig-primary text-sm font-semibold hover:opacity-80"
            >
              Buat Postingan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-[2px]">
            {myPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square overflow-hidden group"
              >
                {/* Thumbnail */}
                <Link to={`/posts/${post.id}`} className="block w-full h-full">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.content}
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
                      <span className="text-ig-secondary-text text-xs text-center px-2 line-clamp-3">
                        {post.content}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Overlay Hover — stats + tombol hapus */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <div className="flex gap-4">
                    <span className="text-white text-sm font-semibold">
                      ❤️ {post._count?.likes ?? 0}
                    </span>
                    <span className="text-white text-sm font-semibold">
                      💬 {post._count?.comments ?? 0}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingId === post.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors border-none cursor-pointer disabled:opacity-60"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}