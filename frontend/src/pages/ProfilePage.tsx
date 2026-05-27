// frontend/src/pages/ProfilePage.tsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { Avatar } from "../components/common/Avatar";
import { deletePost } from "../services/post.service";
import { toast } from "sonner";
import { Trash2, Loader2, X, UserPlus, Check, MessageSquare } from "lucide-react";
import { apiClient } from "../services/api.client";
import { ProfileGridSkeleton } from "../components/ui/Skeleton";

// ─────────────────────────────────────────────
// Tipe
// ─────────────────────────────────────────────
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

interface FollowUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

interface ProfileUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
}

// ─────────────────────────────────────────────
// Sub-komponen: Modal Followers (Pengikut)
// ─────────────────────────────────────────────
interface FollowersModalProps {
  userId: string;
  loggedInUserId?: string;
  onClose: () => void;
  onFollowStatsChange: (stats: Partial<FollowStats>) => void;
}

function FollowersModal({
  userId,
  loggedInUserId,
  onClose,
  onFollowStatsChange,
}: FollowersModalProps) {
  const [list, setList] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get<{ data: FollowUser[] }>(`/follow/followers/${userId}`)
      .then((res) => {
        if (res && res.data) {
          setList(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat pengikut:", err))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const handleRemove = async (followerId: string) => {
    if (!loggedInUserId || removingId) return;
    setRemovingId(followerId);
    try {
      // Hapus hubungan follow
      await apiClient.delete("/follow", {
        followerId: followerId,
        followingId: loggedInUserId,
      });
      setList((prev) => prev.filter((u) => u.id !== followerId));
      onFollowStatsChange({ followers: Math.max(0, list.length - 1) });
      toast.success("Pengikut berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus pengikut.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-ig-secondary-bg border border-ig-border rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <span className="text-ig-text font-semibold text-sm">Pengikut</span>
          <button
            onClick={onClose}
            className="text-ig-text hover:opacity-60 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-neutral-500" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-ig-secondary-text text-sm text-center py-10">
              Belum ada pengikut.
            </p>
          ) : (
            list.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div
                  className="cursor-pointer flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => {
                    navigate(`/profile/${u.username}`);
                    onClose();
                  }}
                >
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ig-text text-sm font-semibold truncate">
                      {u.username}
                    </p>
                    <p className="text-ig-secondary-text text-xs truncate">
                      {u.name}
                    </p>
                  </div>
                </div>
                {loggedInUserId === userId && (
                  <button
                    disabled={removingId === u.id}
                    onClick={() => handleRemove(u.id)}
                    className="text-ig-text text-xs font-semibold px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {removingId === u.id ? "Menghapus..." : "Hapus"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-komponen: Modal Following (Mengikuti)
// ─────────────────────────────────────────────
interface FollowingModalProps {
  userId: string;
  loggedInUserId?: string;
  onClose: () => void;
  onFollowStatsChange: (stats: Partial<FollowStats>) => void;
}

function FollowingModal({
  userId,
  loggedInUserId,
  onClose,
  onFollowStatsChange,
}: FollowingModalProps) {
  const [list, setList] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get<{ data: FollowUser[] }>(`/follow/following/${userId}`)
      .then((res) => {
        if (res && res.data) {
          setList(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat daftar mengikuti:", err))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const handleUnfollow = async (followingId: string, username: string) => {
    if (!loggedInUserId || togglingId) return;
    setTogglingId(followingId);
    try {
      await apiClient.delete("/follow", {
        followerId: loggedInUserId,
        followingId: followingId,
      });
      setList((prev) => prev.filter((u) => u.id !== followingId));
      onFollowStatsChange({ following: Math.max(0, list.length - 1) });
      toast.success(`Batal mengikuti @${username}`);
    } catch {
      toast.error("Gagal batal mengikuti.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] bg-ig-secondary-bg border border-ig-border rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <span className="text-ig-text font-semibold text-sm">Mengikuti</span>
          <button
            onClick={onClose}
            className="text-ig-text hover:opacity-60 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-neutral-500" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-ig-secondary-text text-sm text-center py-10">
              Belum mengikuti siapapun.
            </p>
          ) : (
            list.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div
                  className="cursor-pointer flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => {
                    navigate(`/profile/${u.username}`);
                    onClose();
                  }}
                >
                  <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ig-text text-sm font-semibold truncate">
                      {u.username}
                    </p>
                    <p className="text-ig-secondary-text text-xs truncate">
                      {u.name}
                    </p>
                  </div>
                </div>
                {loggedInUserId === userId && (
                  <button
                    disabled={togglingId === u.id}
                    onClick={() => handleUnfollow(u.id, u.username)}
                    className="text-xs font-semibold px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-ig-text rounded-lg transition-colors shrink-0 disabled:opacity-50"
                  >
                    {togglingId === u.id ? "Memproses..." : "Mengikuti"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-komponen: Modal Edit Profil
// ─────────────────────────────────────────────
interface EditProfileProps {
  initialName: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string;
  onClose: () => void;
  onSave: (data: { name: string; bio: string; avatarUrl: string }) => Promise<void>;
}

function EditProfileModal({
  initialName,
  initialUsername,
  initialBio,
  initialAvatarUrl,
  onClose,
  onSave,
}: EditProfileProps) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-ig-secondary-bg border border-ig-border rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <span className="text-ig-text font-semibold text-sm">Edit Profil</span>
          <button
            onClick={onClose}
            className="text-ig-text hover:opacity-60 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-4">
          {/* Username (Read Only) */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              Username (Tidak dapat diubah)
            </label>
            <input
              type="text"
              value={initialUsername}
              disabled
              className="bg-neutral-800/50 border border-neutral-700 rounded-lg px-3 py-2 text-ig-secondary-text text-sm outline-none cursor-not-allowed"
            />
          </div>

          {/* Nama Lengkap */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tulis bio kamu..."
              rows={3}
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors resize-none"
            />
          </div>

          {/* Avatar URL */}
          <div className="flex flex-col gap-1">
            <label className="text-ig-secondary-text text-xs font-semibold">
              URL Foto Profil
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="bg-ig-background border border-neutral-700 rounded-lg px-3 py-2 text-ig-text text-sm outline-none focus:border-ig-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 text-ig-text text-sm font-semibold bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 text-white text-sm font-semibold bg-ig-primary hover:opacity-85 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Halaman Utama Profile
// ─────────────────────────────────────────────
export default function ProfilePage() {
  const { username } = useParams<{ username?: string }>();
  const loggedInUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  const isOwnProfile = !username || username === loggedInUser?.username;

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        let activeUser: ProfileUser | null = null;
        if (isOwnProfile) {
          if (loggedInUser) {
            activeUser = {
              id: loggedInUser.id,
              username: loggedInUser.username,
              name: loggedInUser.name,
              avatarUrl: loggedInUser.avatarUrl ?? null,
              bio: loggedInUser.bio ?? null,
            };
          }
        } else if (username) {
          const userRes = await apiClient.get<{ data: ProfileUser }>(`/users/username/${username}`);
          if (userRes && userRes.data) {
            activeUser = userRes.data;
          }
        }

        if (!activeUser) {
          setProfileUser(null);
          setIsLoading(false);
          return;
        }

        setProfileUser(activeUser);

        // Fetch postingan milik user
        const postsRes = await apiClient.get<{ data: Post[] }>(`/posts?authorId=${activeUser.id}`);
        if (postsRes && postsRes.data) {
          setMyPosts(postsRes.data);
        } else {
          setMyPosts([]);
        }

        // Fetch jumlah followers & following dari API + status follow
        const params = loggedInUser?.id ? `?currentUserId=${loggedInUser.id}` : "";
        const statsRes = await apiClient.get<{
          followers: number;
          following: number;
          isFollowing: boolean;
        }>(`/follow/stats/${activeUser.id}${params}`);
        
        if (statsRes) {
          setFollowStats({
            followers: statsRes.followers,
            following: statsRes.following,
          });
          setIsFollowing(statsRes.isFollowing);
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        setProfileUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username, loggedInUser, isOwnProfile]);

  // ── Handler Simpan Edit Profil ──
  const handleSaveProfile = async (data: {
    name: string;
    bio: string;
    avatarUrl: string;
  }) => {
    try {
      const res = await apiClient.put<{ data: ProfileUser }>("/users/profile", data);
      if (res && res.data) {
        // Sync ke Zustand store
        updateUser({
          name: res.data.name,
          bio: res.data.bio ?? "",
          avatarUrl: res.data.avatarUrl ?? "",
        });
        
        // Sync ke state lokal
        setProfileUser((prev) =>
          prev ? { ...prev, name: res.data.name, bio: res.data.bio, avatarUrl: res.data.avatarUrl } : null
        );

        toast.success("Profil berhasil diperbarui!");
      }
    } catch (err) {
      toast.error("Gagal memperbarui profil.");
      throw err;
    }
  };

  // ── Handler hapus postingan ──
  const handleDeletePost = async (postId: string) => {
    if (!loggedInUser) return;
    const confirmed = window.confirm("Yakin ingin menghapus postingan ini?");
    if (!confirmed) return;

    setDeletingId(postId);
    try {
      await deletePost(postId, loggedInUser.id);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Postingan berhasil dihapus.");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menghapus postingan.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Handler Follow/Unfollow ──
  const handleFollowToggle = async () => {
    if (!loggedInUser || !profileUser || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        await apiClient.delete("/follow", {
          followerId: loggedInUser.id,
          followingId: profileUser.id,
        });
        setIsFollowing(false);
        setFollowStats((prev) => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
        toast.success(`Batal mengikuti @${profileUser.username}`);
      } else {
        // Follow
        await apiClient.post("/follow", {
          followerId: loggedInUser.id,
          followingId: profileUser.id,
        });
        setIsFollowing(true);
        setFollowStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
        toast.success(`Mengikuti @${profileUser.username} 🎉`);
      }
    } catch {
      toast.error("Gagal memperbarui status ikuti.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4 py-8">
        <ProfileGridSkeleton />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-ig-background gap-4 text-ig-text">
        <p className="text-neutral-500">Pengguna tidak ditemukan atau silakan login terlebih dahulu.</p>
        <Link to="/" className="text-ig-primary font-semibold hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ig-background max-w-[935px] mx-auto px-4 text-ig-text">

      {/* ── Header Profil ── */}
      <div className="flex items-start gap-8 py-8 border-b border-ig-border">

        {/* Avatar Besar */}
        <Avatar name={profileUser.name} avatarUrl={profileUser.avatarUrl} size="lg" />

        {/* Info Profil */}
        <div className="flex-1">

          {/* Username + Tombol */}
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-ig-text text-xl font-semibold">
              {profileUser.username}
            </h1>
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-1.5 text-ig-text text-sm font-semibold bg-ig-elevated-bg rounded-lg hover:opacity-80 transition-opacity"
                >
                  Edit Profil
                </button>
                <button
                  onClick={logout}
                  className="text-ig-secondary-text text-sm hover:text-ig-text transition-colors"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={`px-6 py-1.5 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all border-none cursor-pointer ${
                    isFollowing
                      ? "bg-ig-elevated-bg text-ig-text hover:bg-neutral-800"
                      : "bg-ig-primary hover:bg-blue-600 text-white"
                  } disabled:opacity-60`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-4 w-4" /> Mengikuti
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Ikuti
                    </>
                  )}
                </button>
                <Link
                  to={`/messages`}
                  className="p-1.5 bg-ig-elevated-bg hover:opacity-85 text-ig-text rounded-lg transition-opacity border-none cursor-pointer flex items-center justify-center"
                >
                  <MessageSquare size={18} />
                </Link>
              </div>
            )}
          </div>

          {/* Statistik: Postingan, Followers, Following */}
          <div className="flex gap-8 mb-4">
            <div>
              <span className="text-ig-text font-semibold">{myPosts.length}</span>
              <span className="text-ig-text text-sm ml-1">postingan</span>
            </div>
            <button
              onClick={() => setIsFollowersModalOpen(true)}
              className="hover:opacity-70 transition-opacity text-left cursor-pointer bg-transparent border-none p-0"
            >
              <span className="text-ig-text font-semibold">{followStats.followers}</span>
              <span className="text-ig-text text-sm ml-1">pengikut</span>
            </button>
            <button
              onClick={() => setIsFollowingModalOpen(true)}
              className="hover:opacity-70 transition-opacity text-left cursor-pointer bg-transparent border-none p-0"
            >
              <span className="text-ig-text font-semibold">{followStats.following}</span>
              <span className="text-ig-text text-sm ml-1">mengikuti</span>
            </button>
          </div>

          {/* Nama + Bio */}
          <p className="text-ig-text text-sm font-semibold">{profileUser.name}</p>
          {profileUser.bio ? (
            <p className="text-ig-text text-sm mt-1 whitespace-pre-line">
              {profileUser.bio}
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
        {myPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-4xl">📷</span>
            <p className="text-ig-text font-semibold">Belum Ada Postingan</p>
            {isOwnProfile && (
              <>
                <p className="text-ig-secondary-text text-sm">
                  Mulai bagikan foto pertamamu!
                </p>
                <Link
                  to="/create"
                  className="mt-2 text-ig-primary text-sm font-semibold hover:opacity-80"
                >
                  Buat Postingan
                </Link>
              </>
            )}
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

                  {isOwnProfile && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {isEditModalOpen && (
        <EditProfileModal
          initialName={profileUser.name}
          initialUsername={profileUser.username}
          initialBio={profileUser.bio ?? ""}
          initialAvatarUrl={profileUser.avatarUrl ?? ""}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
      {isFollowersModalOpen && (
        <FollowersModal
          userId={profileUser.id}
          loggedInUserId={loggedInUser?.id}
          onClose={() => setIsFollowersModalOpen(false)}
          onFollowStatsChange={(stats) => setFollowStats((prev) => ({ ...prev, ...stats }))}
        />
      )}
      {isFollowingModalOpen && (
        <FollowingModal
          userId={profileUser.id}
          loggedInUserId={loggedInUser?.id}
          onClose={() => setIsFollowingModalOpen(false)}
          onFollowStatsChange={(stats) => setFollowStats((prev) => ({ ...prev, ...stats }))}
        />
      )}
    </div>
  );
}