// frontend/src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { Avatar } from "../components/common/Avatar";

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

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

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
      <div className="flex items-start gap-8 py-8 border-b border-neutral-800">

        {/* Avatar Besar */}
        <Avatar name={user.name} avatarUrl={user.avatarUrl ?? null} size="lg" />

        {/* Info Profil */}
        <div className="flex-1">

          {/* Username + Tombol */}
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-ig-text text-xl font-semibold">
              {user.username}
            </h1>
            <button className="px-4 py-1.5 text-ig-text text-sm font-semibold bg-ig-secondary-bg rounded-lg hover:bg-neutral-700 transition-colors">
              Edit Profil
            </button>
            <button
              onClick={logout}
              className="text-neutral-400 text-sm hover:text-ig-text transition-colors"
            >
              Keluar
            </button>
          </div>

          {/* Statistik Postingan */}
          <div className="flex gap-6 mb-3">
            <div>
              <span className="text-ig-text font-semibold">{myPosts.length}</span>
              <span className="text-ig-text text-sm ml-1">postingan</span>
            </div>
          </div>

          {/* Nama + Bio */}
          <p className="text-ig-text text-sm font-semibold">{user.name}</p>
          {user.bio ? (
            <p className="text-ig-text text-sm mt-1 whitespace-pre-line">
              {user.bio}
            </p>
          ) : (
            <p className="text-neutral-600 text-sm mt-1 italic">
              Belum ada bio.
            </p>
          )}
        </div>
      </div>

      {/* ── Grid Postingan ── */}
      <div className="py-4">
        {isLoading ? (
          <p className="text-neutral-500 text-sm text-center py-8">
            Memuat postingan...
          </p>
        ) : myPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📷</span>
            <p className="text-ig-text font-semibold">Belum Ada Postingan</p>
            <p className="text-neutral-500 text-sm">
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
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="relative aspect-square overflow-hidden group"
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.content}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full bg-ig-secondary-bg flex items-center justify-center">
                    <span className="text-neutral-600 text-xs text-center px-2 line-clamp-3">
                      {post.content}
                    </span>
                  </div>
                )}

                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <span className="text-white text-sm font-semibold">
                    ❤️ {post._count?.likes ?? 0}
                  </span>
                  <span className="text-white text-sm font-semibold">
                    💬 {post._count?.comments ?? 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}